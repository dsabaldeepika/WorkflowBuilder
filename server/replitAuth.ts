import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import memorystore from "memorystore";
import { storage } from "./storage";

// BYPASS FLAG: This completely bypasses all authentication
const BYPASS_AUTH = true;

// Dummy console message
console.log("⚠️ Authentication completely bypassed for development - Do not use in production ⚠️");

// Create a mock user for authentication bypass
const MOCK_USER = {
  id: "bypass-user-123",
  claims: {
    sub: "bypass-user-123",
    email: "bypass@example.com",
    first_name: "Bypass",
    last_name: "User",
    profile_image_url: "https://ui-avatars.com/api/?name=Bypass+User&background=random"
  },
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_at: Math.floor(Date.now() / 1000) + 86400 * 30 // 30 days
};

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for simplicity in bypass mode
  const MemoryStore = memorystore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: sessionTtl
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "bypass-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Simple passport serialization
  passport.serializeUser((user: Express.User, cb) => {
    cb(null, user);
  });
  
  passport.deserializeUser((user: Express.User, cb) => {
    cb(null, user);
  });

  // Auto-login route
  app.get("/api/login", (req, res) => {
    req.login(MOCK_USER, () => {
      res.redirect("/");
    });
  });

  // Mock callback route
  app.get("/api/callback", (req, res) => {
    req.login(MOCK_USER, () => {
      res.redirect("/");
    });
  });
  
  // Status route to check authentication
  app.get("/api/auth/status", (req, res) => {
    if (BYPASS_AUTH) {
      // Always return authenticated in bypass mode
      res.json({
        authenticated: true,
        user: MOCK_USER,
        bypassMode: true
      });
    } else {
      res.json({
        authenticated: req.isAuthenticated(),
        user: req.user
      });
    }
  });

  // Mock logout
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
  
  // Auto-login middleware for all requests in bypass mode
  if (BYPASS_AUTH) {
    app.use((req, res, next) => {
      if (!req.isAuthenticated()) {
        req.login(MOCK_USER, (err) => {
          if (err) console.error("Auto-login error:", err);
          next();
        });
      } else {
        next();
      }
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (BYPASS_AUTH) {
    // Always authenticated in bypass mode
    return next();
  }
  
  // Normal authentication check (this won't run in bypass mode)
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  return next();
};