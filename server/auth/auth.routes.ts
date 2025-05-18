import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { z } from "zod";
import {
  hashPassword,
  generateToken,
  isAuthenticated,
  registerSchema,
  verifyPassword,
} from "./auth.service";
import { storage } from "../storage";
import { UserRole } from "@shared/schema";
import jwt from "jsonwebtoken";
import { TokenService } from "./token.service";
import {
  authenticateToken,
  refreshToken,
  bypassAuthForTestUsers,
} from "./auth.middleware";
import { TestUserService } from "./test-user.service";
import { MockOAuthService } from "./mock-oauth.service";
import { MockUsersService } from './mock-users.service';

const router = Router();

// Register a new user with email and password
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Create new user
      if (validatedData.password == null) {
        return res.status(400).json({ message: "Password is required" });
      }
      const hashedPassword = await hashPassword(validatedData.password as string);
      const newUser = await storage.createUser({
        username: validatedData.username as string,
        email: validatedData.email as string,
        password: hashedPassword,
        firstName: null,
        lastName: null,
        role: UserRole.CREATOR, // Default role for new users
      });

      // Generate JWT token
      const token = generateToken(newUser);

      // Return user data and token
      return res.status(201).json({
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          profileImageUrl: newUser.profileImageUrl,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }

      next(error);
    }
  }
);

/**
 * Login Route
 *
 * This is like the front desk of a building:
 * 1. You show your ID (username/password)
 * 2. They verify who you are
 * 3. They give you a visitor pass (tokens)
 *
 * When you log in, you get:
 * - Your user information
 * - An access token (short-term pass)
 * - A refresh token (long-term pass)
 */
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  console.log('Login attempt received:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Get user from database
    const user = await storage.getUserByEmail(email);
    console.log('Found user in database:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    if (!user.password) {
      console.log('User password is null');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user);
    console.log('Generated token for user');
    
    // Return user data and token
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
      token
    });
  } catch (error) {
    console.error('Login route error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Login with Google
router.get("/google", (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res
      .status(503)
      .json({ message: "Google authentication is not configured" });
  }

  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

// Google callback
router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.redirect("/login?error=auth_failed");
      }

      // Generate JWT token
      const token = generateToken(user);

      // Redirect to frontend with token
      return res.redirect(`/auth/callback?token=${token}`);
    })(req, res, next);
  }
);

// Login with Facebook
router.get("/facebook", (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res
      .status(503)
      .json({ message: "Facebook authentication is not configured" });
  }

  passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
});

// Facebook callback
router.get(
  "/facebook/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("facebook", { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.redirect("/login?error=auth_failed");
      }

      // Generate JWT token
      const token = generateToken(user);

      // Redirect to frontend with token
      return res.redirect(`/auth/callback?token=${token}`);
    })(req, res, next);
  }
);

// Get current user information
router.get("/user", isAuthenticated, (req: Request, res: Response) => {
  const user = req.user;

  res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profileImageUrl: user.profileImageUrl,
  });
});

/**
 * Refresh Token Route
 *
 * This is like going to the service desk when your visitor pass expires:
 * 1. You show your backup pass (refresh token)
 * 2. They verify it's valid
 * 3. They give you a new set of passes
 */
router.post("/refresh", refreshToken);

/**
 * Protected Route Example
 *
 * This is like a restricted area in a building:
 * 1. Security guard checks your visitor pass
 * 2. If it's valid, you can enter
 * 3. If not, you're turned away
 *
 * This route is only accessible with a valid access token
 */
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Protected route accessed successfully" });
});

/**
 * Test Login Route
 *
 * This route allows testing authentication with predefined test credentials:
 * - test / test123
 * - admin / admin123
 */
router.post("/test/login", async (req, res) => {
  const { email, password } = req.body;

  // Get test credentials
  const testCredentials = TestUserService.getTestCredentials();
  const isValidTestUser = testCredentials.some(
    (cred) => cred.email === email && cred.password === password
  );
  if (email == null) {
    return res.status(400).json({ message: "Email is required" });
  }
  const user = await storage.getUserByEmail(email as string);
  if (!user) {
    return res.status(404).json({ message: "Test user not found" });
  }

  // Get user from database
  // (Already declared above, so just check if user exists)
  if (!user) {
    return res.status(404).json({ message: "Test user not found" });
  }

  // Generate tokens
  const tokens = TokenService.generateTokenPair(user);
  res.json({ user, ...tokens });
});

/**
 * Mock OAuth Login Route
 *
 * This route simulates OAuth login for testing purposes.
 * It accepts a provider name and returns mock OAuth tokens.
 */
router.post("/test/oauth/:provider", async (req, res) => {
  const { provider } = req.params;
  if (email == null) {
    return res.status(400).json({ message: "Email is required" });
  }
  let user = await storage.getUserByEmail(email as string);
  if (!user) {
    user = await storage.createUser({
      email: email as string,
      username: (email as string).split("@")[0],
      password: await hashPassword(Math.random().toString(36)),
      role: UserRole.CREATOR,
    });
  }
  // user already declared above, so just check and assign if needed
  if (!user) {
    user = await storage.createUser({
      email,
      username: email.split("@")[0],
      password: await hashPassword(Math.random().toString(36)),
      role: UserRole.CREATOR,
    });
  }

  // Generate tokens
  const tokens = TokenService.generateTokenPair(user);
  res.json({ user, ...tokens });
});

// Add this route for mock user login
router.post("/mock/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Get mock credentials
  const mockCredentials = MockUsersService.getMockCredentials();
  const isValidMockUser = mockCredentials.some(
    (cred) => cred.email === email && cred.password === password
  );

  if (!isValidMockUser) {
    return res.status(401).json({ message: "Invalid mock credentials" });
  }

  // Get user from database
  const user = await storage.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: "Mock user not found" });
  }

  // Generate token
  const token = generateToken(user);
  
  // Return user data and token
  return res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
    },
    token
  });
});

export default router;
