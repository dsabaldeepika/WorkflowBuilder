import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { storage } from '../storage';
import { UserRole } from '@shared/schema';
import { 
  generateToken, 
  isAuthenticated, 
  hasRole, 
  authenticateTestUser,
  createInitialTestUser
} from './auth.service';

const router = Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    // Generate JWT token
    const token = generateToken(req.user as any);
    
    // Send token to client (this could redirect to a client route that stores the token)
    res.redirect(`/auth/callback?token=${token}`);
  }
);

// GitHub OAuth routes
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    // Generate JWT token
    const token = generateToken(req.user as any);
    
    // Send token to client
    res.redirect(`/auth/callback?token=${token}`);
  }
);

// Get current user
router.get(
  '/me',
  isAuthenticated,
  (req: Request, res: Response) => {
    // User is already attached to req by isAuthenticated middleware
    res.json(req.user);
  }
);

// Test Login (development only)
router.post('/test-login', authenticateTestUser);

// Admin routes
// Create a new user (admin only)
router.post(
  '/users',
  isAuthenticated,
  hasRole([UserRole.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, firstName, lastName, role, password } = req.body;
      
      // Validate input
      if (!username || !email || !role) {
        return res.status(400).json({ message: 'Username, email, and role are required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        firstName,
        lastName,
        role,
        password // For non-OAuth users
      });
      
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Get all users (admin only)
router.get(
  '/users',
  isAuthenticated,
  hasRole([UserRole.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // This would be implemented in storage
      // const users = await storage.getAllUsers();
      // For now, return a stub
      res.json({ message: 'User list endpoint (to be implemented)' });
    } catch (error) {
      next(error);
    }
  }
);

// Update user role (admin only)
router.patch(
  '/users/:id/role',
  isAuthenticated,
  hasRole([UserRole.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!role || !Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({ message: 'Valid role is required' });
      }
      
      const user = await storage.updateUser(userId, { role });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Deactivate user (admin only)
router.delete(
  '/users/:id',
  isAuthenticated,
  hasRole([UserRole.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Don't allow admins to delete themselves
      if (userId === (req.user as any).id) {
        return res.status(400).json({ message: 'Cannot deactivate your own account' });
      }
      
      const success = await storage.deactivateUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// Initialize test user if needed
createInitialTestUser();

export default router;