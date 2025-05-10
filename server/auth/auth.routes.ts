import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { z } from 'zod';
import { 
  hashPassword, 
  generateToken, 
  isAuthenticated, 
  registerSchema 
} from './auth.service';
import { storage } from '../storage';
import { UserRole } from '@shared/schema';

const router = Router();

// Register a new user with email and password
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Check if email already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Create new user
    const hashedPassword = await hashPassword(validatedData.password);
    const newUser = await storage.createUser({
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: UserRole.CREATOR // Default role for new users
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
        profileImageUrl: newUser.profileImageUrl
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    next(error);
  }
});

// Login with email and password
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Authentication failed' });
      }
      
      // Generate JWT token
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
          profileImageUrl: user.profileImageUrl
        },
        token
      });
    })(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Login with Google
router.get('/google', (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ message: 'Google authentication is not configured' });
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google callback
router.get('/google/callback', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.redirect('/login?error=auth_failed');
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Redirect to frontend with token
    return res.redirect(`/auth/callback?token=${token}`);
  })(req, res, next);
});

// Login with Facebook
router.get('/facebook', (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.status(503).json({ message: 'Facebook authentication is not configured' });
  }
  
  passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
});

// Facebook callback
router.get('/facebook/callback', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('facebook', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.redirect('/login?error=auth_failed');
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Redirect to frontend with token
    return res.redirect(`/auth/callback?token=${token}`);
  })(req, res, next);
});

// Get current user information
router.get('/user', isAuthenticated, (req: Request, res: Response) => {
  const user = req.user;
  
  res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profileImageUrl: user.profileImageUrl
  });
});

export default router;