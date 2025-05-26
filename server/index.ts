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
import morgan from 'morgan';
import logger, { stream, logRequest, logError } from './utils/logger';
import { WebSocketServer, WebSocket } from 'ws';
import { WS_CONFIG } from '../shared/websocket-config';
import {
  MessageRateLimiter,
  validateMessage,
  sendMessage,
  broadcastMessage,
  isConnectionAlive,
  closeConnection,
  type WebSocketClient,
  type WebSocketMessage
} from './utils/WebSocketUtils';

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

// Add logging middleware
app.use(morgan('combined', { stream }));

// Add request logging middleware
app.use((req, res, next) => {
  logRequest(req, 'Incoming request');
  next();
});

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

// Add security headers with logging
app.use((req, res, next) => {
  logger.debug('Setting security headers');
  // Set Content Security Policy to be more permissive for development
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.replit.dev wss://*.replit.dev ws://localhost:* wss://localhost:*;"
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

// Define WebSocket message types
type WebSocketMessage = {
  type: string;
  payload: any;
  clientId?: string;
  timestamp?: number;
};

// Define client information type
type ClientInfo = {
  ws: WebSocket;
  ip: string;
  connectedAt: Date;
  secure?: boolean;
};

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

    // Create WebSocket server instance
    const wss = new WebSocketServer({ 
      server,
      path: WS_CONFIG.path 
    });

    // Initialize rate limiter
    const rateLimiter = new MessageRateLimiter();

    // Keep track of connected clients
    const clients: Map<string, WebSocketClient> = new Map();

    // Set up heartbeat interval
    const heartbeatInterval = setInterval(() => {
      clients.forEach((client, clientId) => {
        if (!isConnectionAlive(client.ws)) {
          closeConnection(client.ws, 1000, 'Connection timeout');
          clients.delete(clientId);
          rateLimiter.removeClient(clientId);
        } else {
          sendMessage(client.ws, WS_CONFIG.messageTypes.PING, { timestamp: Date.now() });
        }
      });
    }, WS_CONFIG.timeouts.heartbeat);

    // WebSocket connection handling
    wss.on('connection', (ws, req) => {
      const clientId = Math.random().toString(36).substring(2, 9);
      const clientIp = req.socket.remoteAddress || 'unknown';
      console.log(`New WebSocket connection from ${clientIp} (ID: ${clientId})`);

      // Store client information
      clients.set(clientId, {
        ws,
        ip: clientIp,
        connectedAt: new Date()
      });

      // Send welcome message
      sendMessage(ws, WS_CONFIG.messageTypes.CONNECTION, {
        clientId,
        timestamp: Date.now()
      });

      ws.on('message', (message) => {
        try {
          // Rate limit check
          if (!rateLimiter.isAllowed(clientId)) {
            return sendMessage(ws, WS_CONFIG.messageTypes.ERROR, {
              message: 'Rate limit exceeded',
              code: 429
            });
          }

          const data = JSON.parse(message.toString());
          
          // Validate message format
          if (!validateMessage(data)) {
            return sendMessage(ws, WS_CONFIG.messageTypes.ERROR, {
              message: 'Invalid message format',
              code: 400
            });
          }

          console.log('Received:', data);
          
          // Handle different message types
          switch (data.type) {
            case WS_CONFIG.messageTypes.PING:
              sendMessage(ws, WS_CONFIG.messageTypes.PONG, {
                timestamp: Date.now()
              });
              break;

            case WS_CONFIG.messageTypes.NODE_UPDATE:
              broadcastMessage(clients, WS_CONFIG.messageTypes.NODE_UPDATE, {
                ...data.payload,
                timestamp: Date.now()
              }, clientId);
              break;

            case WS_CONFIG.messageTypes.EDGE_UPDATE:
              broadcastMessage(clients, WS_CONFIG.messageTypes.EDGE_UPDATE, {
                ...data.payload,
                timestamp: Date.now()
              }, clientId);
              break;

            case WS_CONFIG.messageTypes.WORKFLOW_UPDATE:
              broadcastMessage(clients, WS_CONFIG.messageTypes.WORKFLOW_UPDATE, {
                ...data.payload,
                timestamp: Date.now()
              }, clientId);
              break;

            case WS_CONFIG.messageTypes.CURSOR_POSITION:
              broadcastMessage(clients, WS_CONFIG.messageTypes.CURSOR_POSITION, {
                ...data.payload,
                clientId,
                timestamp: Date.now()
              }, clientId);
              break;

            default:
              sendMessage(ws, WS_CONFIG.messageTypes.ERROR, {
                message: `Unknown message type: ${data.type}`,
                code: 400
              });
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          sendMessage(ws, WS_CONFIG.messageTypes.ERROR, {
            message: 'Invalid message format',
            code: 400
          });
        }
      });

      ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        clients.delete(clientId);
        rateLimiter.removeClient(clientId);
        
        // Notify other clients
        broadcastMessage(clients, WS_CONFIG.messageTypes.DISCONNECT, {
          clientId,
          timestamp: Date.now()
        });
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error from ${clientId}:`, error);
        clients.delete(clientId);
        rateLimiter.removeClient(clientId);
      });
    });

    // Error handler for WebSocket server
    wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    // Cleanup on server shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing WebSocket server');
      clearInterval(heartbeatInterval);
      wss.close(() => {
        console.log('WebSocket server closed');
      });
    });

    // HTTPS dev server setup using mkcert certificates
    if (process.env.NODE_ENV === "development") {
      const keyPath = path.resolve(__dirname, "../certs/localhost-key.pem");
      const certPath = path.resolve(__dirname, "../certs/localhost.pem");
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        const key = fs.readFileSync(keyPath);
        const cert = fs.readFileSync(certPath);
        const httpsServer = https.createServer({ key, cert }, app);
        
        // Create WSS server for HTTPS
        const wssSecure = new WebSocketServer({ 
          server: httpsServer,
          path: WS_CONFIG.path
        });
        
        // Apply same handlers to secure WebSocket server
        wssSecure.on('connection', (ws, req) => {
          const clientId = Math.random().toString(36).substring(2, 9);
          const clientIp = req.socket.remoteAddress || 'unknown';
          console.log(`New secure WebSocket connection from ${clientIp} (ID: ${clientId})`);
          
          clients.set(clientId, {
            ws,
            ip: clientIp,
            connectedAt: new Date(),
            secure: true
          });

          // Send welcome message
          ws.send(JSON.stringify({
            type: 'connection_established',
            payload: {
              clientId,
              secure: true,
              timestamp: Date.now()
            }
          }));

          ws.on('message', (message) => {
            try {
              const data: WebSocketMessage = JSON.parse(message.toString());
              console.log('Received:', data);
              
              const enrichedMessage = {
                ...data,
                clientId,
                timestamp: Date.now()
              };

              switch (data.type) {
                case 'node_update':
                case 'edge_update':
                case 'workflow_update':
                  broadcastMessage(clients, enrichedMessage, clientId);
                  break;
                case 'ping':
                  ws.send(JSON.stringify({
                    type: 'pong',
                    payload: { timestamp: Date.now() }
                  }));
                  break;
                default:
                  console.warn(`Unknown message type: ${data.type}`);
              }
            } catch (error) {
              console.error('WebSocket message error:', error);
              ws.send(JSON.stringify({
                type: 'error',
                payload: {
                  message: 'Invalid message format',
                  timestamp: Date.now()
                }
              }));
            }
          });

          ws.on('close', () => {
            console.log(`Secure client ${clientId} disconnected`);
            clients.delete(clientId);
            
            // Notify other clients about disconnection
            broadcastMessage(clients, {
              type: 'client_disconnected',
              payload: { clientId },
              timestamp: Date.now()
            });
          });

          ws.on('error', (error) => {
            console.error(`Secure WebSocket error from ${clientId}:`, error);
            clients.delete(clientId);
          });
        });
        
        // Start HTTPS server
        httpsServer.listen(WS_CONFIG.securePort, () => {
          console.log(`HTTPS server running on port ${WS_CONFIG.securePort}`);
        });
      }
    }

    // Start HTTP server
    server.listen(WS_CONFIG.port, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${WS_CONFIG.port}`);
    });

    return server;
  } catch (err) {
    console.error("SERVER STARTUP ERROR:", err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

// Error handling middleware with logging
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError(err, {
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

// Start the server only via initializeServer
initializeServer();
