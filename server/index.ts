import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runMigrations } from "./migrations";
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { cpus } from 'os';

const app = express();

// Apply compression middleware to reduce bandwidth usage
app.use(compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  // Skip compressing images, as they're already compressed
  filter: (req: Request, res: Response) => {
    const contentType = res.getHeader('Content-Type') as string;
    return !contentType?.includes('image/');
  },
}));

// Configure standard middleware with optimized settings
app.use(express.json({ limit: '2mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// API Rate limiting for scaled usage (5000+ users)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  // Skip rate limiting in development
  skip: () => process.env.NODE_ENV === 'development',
});

// Apply stricter rate limiting for auth endpoints to prevent abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 20, // 20 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
  // Skip rate limiting in development
  skip: () => process.env.NODE_ENV === 'development',
});

// Apply rate limiters to specific routes
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use('/api/auth', authLimiter); 
app.use('/api/', apiLimiter);

// Add security headers
app.use((req, res, next) => {
  // Set Content Security Policy to be more permissive for development
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.replit.dev wss://*.replit.dev;"
  );
  
  // Enable iframe embedding
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://replit.com');
  
  // Permissive CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  next();
});

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

(async () => {
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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server running at http://0.0.0.0:${port}`);
  });
})();
