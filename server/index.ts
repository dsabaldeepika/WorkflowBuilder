import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runMigrations } from "./migrations";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { cpus } from "os";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pool from "./dbPool";
import fs from "fs";
import https from "https";
import path from "path";
import { seedDatabase } from "./db/seed";

// Polyfill __dirname for ESM if needed
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

const app = express();

// Apply compression middleware to reduce bandwidth usage
app.use(
  compression({
    // Only compress responses larger than 1KB
    threshold: 1024,
    // Skip compressing images, as they're already compressed
    filter: (req: Request, res: Response) => {
      const contentType = res.getHeader("Content-Type") as string;
      return !contentType?.includes("image/");
    },
  })
);

// Configure standard middleware with optimized settings
app.use(express.json({ limit: "2mb" })); // Limit JSON payload size
app.use(express.urlencoded({ extended: false, limit: "2mb" }));

// API Rate limiting for scaled usage (5000+ users)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  // Skip rate limiting in development
  skip: () => process.env.NODE_ENV === "development",
});

// Apply stricter rate limiting for auth endpoints to prevent abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 20, // 20 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." },
  // Skip rate limiting in development
  skip: () => process.env.NODE_ENV === "development",
});

// Rate limiting for OAuth endpoints
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiters to specific routes
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/auth", authLimiter);
app.use("/auth/oauth", oauthLimiter);
app.use("/api/", apiLimiter);

// Add security headers
app.use((req, res, next) => {
  // Set Content Security Policy to be more permissive for development
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.replit.dev wss://*.replit.dev;"
  );

  // Enable iframe embedding
  res.setHeader("X-Frame-Options", "ALLOW-FROM https://replit.com");

  // Permissive CORS for development
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  next();
});

const PgSession = pgSession(session);

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "sessions",
    }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

console.log("Starting server...");

async function initializeServer() {
  try {
    // Initialize mock data in development
    if (process.env.NODE_ENV === "development") {
      console.log("Running in development mode, initializing test data...");
      await seedDatabase();
    }

    // Run database migrations
    await runMigrations();

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Server error:", err);
      res.status(status).json({ message });
      // Don't rethrow the error as it will crash the server
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // HTTPS dev server setup using mkcert certificates
    if (process.env.NODE_ENV !== "production") {
      const keyPath = path.resolve(__dirname, "../certs/localhost-key.pem");
      const certPath = path.resolve(__dirname, "../certs/localhost.pem");
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        const key = fs.readFileSync(keyPath);
        const cert = fs.readFileSync(certPath);
        https.createServer({ key, cert }, app).listen(3443, () => {
          console.log("HTTPS dev server running on https://localhost:3443");
        });
      } else {
        app.listen(3000, () => {
          console.log(
            "HTTP dev server running on http://localhost:3000 (certs missing)"
          );
        });
      }
    } else {
      server.listen(5000, "0.0.0.0", () => {
        log("Server running at http://localhost:5000");
        console.log("Server running at http://localhost:5000"); // Ensure always visible
      });
    }
  } catch (err) {
    console.error("SERVER STARTUP ERROR:", err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

initializeServer();
