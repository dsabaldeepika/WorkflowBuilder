import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// BYPASS FLAG: This completely bypasses all authentication
const BYPASS_AUTH = true;

console.log(
  "⚠️ Authentication completely bypassed for development - Do not use in production ⚠️"
);

const MOCK_USER = {
  id: "bypass-user-123",
  claims: {
    sub: "bypass-user-123",
    email: "bypass@example.com",
    first_name: "Bypass",
    last_name: "User",
    profile_image_url:
      "https://ui-avatars.com/api/?name=Bypass+User&background=random",
  },
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_at: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
};

// No-op session middleware for bypass mode
export function getSession() {
  return (req: any, res: any, next: any) => next();
}

export async function setupAuth(app: Express) {
  // No-op session and passport setup
  // app.use(getSession());
  // app.use(passport.initialize());
  // app.use(passport.session());

  // Auto-login route
  app.get("/api/login", (req, res) => {
    req.user = MOCK_USER;
    res.redirect("/");
  });

  // Mock callback route
  app.get("/api/callback", (req, res) => {
    req.user = MOCK_USER;
    res.redirect("/");
  });

  // Status route to check authentication
  app.get("/api/auth/status", (req, res) => {
    res.json({
      authenticated: true,
      user: MOCK_USER,
      bypassMode: true,
    });
  });

  // Mock logout
  app.get("/api/logout", (req, res) => {
    req.user = undefined;
    res.redirect("/");
  });

  // Auto-login middleware for all requests in bypass mode
  if (BYPASS_AUTH) {
    app.use((req: any, res, next) => {
      if (!req.user) {
        req.user = MOCK_USER;
      }
      next();
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Always authenticated in bypass mode
  return next();
};
