import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Express, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { storage } from '../storage';
import { User, UserRole, insertUserSchema } from '@shared/schema';
import { z } from 'zod';

// Define registration schema with validation
export const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Verify password
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

// JWT token generation
export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, process.env.SESSION_SECRET!, {
    expiresIn: '7d',
  });
};

// JWT token verification
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.SESSION_SECRET!);
  } catch (error) {
    return null;
  }
};

// Set up Passport strategies
export const setupPassport = () => {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          const isPasswordValid = await verifyPassword(password, user.password);
          
          if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google Strategy (will be configured when credentials are provided)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback',
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByEmail(profile.emails?.[0]?.value);
            
            if (!user) {
              // Create new user from Google profile
              user = await storage.createUser({
                username: profile.displayName || profile.id,
                email: profile.emails?.[0]?.value || `${profile.id}@google.user`,
                password: await hashPassword(Math.random().toString(36).slice(-12)),
                firstName: profile.name?.givenName || null,
                lastName: profile.name?.familyName || null,
                profileImageUrl: profile.photos?.[0]?.value || null,
                role: UserRole.CREATOR
              });

              // Link user to Google OAuth provider
              const googleProvider = await storage.getOAuthProviderByName('google');
              if (googleProvider) {
                await storage.linkUserToOAuthProvider(
                  user.id,
                  googleProvider.id,
                  profile.id,
                  accessToken,
                  refreshToken || undefined
                );
              }
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Facebook Strategy (will be configured when credentials are provided)
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: '/api/auth/facebook/callback',
          profileFields: ['id', 'displayName', 'photos', 'email', 'name'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByEmail(profile.emails?.[0]?.value);
            
            if (!user) {
              // Create new user from Facebook profile
              user = await storage.createUser({
                username: profile.displayName || profile.id,
                email: profile.emails?.[0]?.value || `${profile.id}@facebook.user`,
                password: await hashPassword(Math.random().toString(36).slice(-12)),
                firstName: profile.name?.givenName || null,
                lastName: profile.name?.familyName || null,
                profileImageUrl: profile.photos?.[0]?.value || null,
                role: UserRole.CREATOR
              });

              // Link user to Facebook OAuth provider
              const facebookProvider = await storage.getOAuthProviderByName('facebook');
              if (facebookProvider) {
                await storage.linkUserToOAuthProvider(
                  user.id,
                  facebookProvider.id,
                  profile.id,
                  accessToken,
                  refreshToken || undefined
                );
              }
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Serialize and deserialize user
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Check for JWT token in the Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }
  
  // If no valid JWT token, check if authenticated via session
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to check user role
export const hasRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRole = (req.user as User).role;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    
    next();
  };
};

// Create a test user for development
export const createInitialTestUser = async () => {
  try {
    const testUser = await storage.getUserByEmail('test@pumpflux.com');
    
    if (!testUser) {
      console.log('Creating test user...');
      await storage.createUser({
        username: 'testuser',
        email: 'test@pumpflux.com',
        password: await hashPassword('password123'),
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.ADMIN
      });
      console.log('Test user created');
    } else {
      console.log('Test user already exists');
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  }
};

// Initialize OAuth providers in the database
export const initializeOAuthProviders = async () => {
  try {
    const providers = await storage.getOAuthProviders();
    
    if (providers.length === 0) {
      // Add Google provider
      await storage.createOAuthProvider({
        name: 'google',
        displayName: 'Google',
        enabled: !!process.env.GOOGLE_CLIENT_ID
      });
      
      // Add Facebook provider
      await storage.createOAuthProvider({
        name: 'facebook',
        displayName: 'Facebook',
        enabled: !!process.env.FACEBOOK_APP_ID
      });
      
      console.log('OAuth providers initialized');
    } else {
      // Update provider enabled status based on environment variables
      const googleProvider = providers.find(p => p.name === 'google');
      const facebookProvider = providers.find(p => p.name === 'facebook');
      
      if (googleProvider) {
        await storage.updateOAuthProvider(
          googleProvider.id, 
          { enabled: !!process.env.GOOGLE_CLIENT_ID }
        );
      }
      
      if (facebookProvider) {
        await storage.updateOAuthProvider(
          facebookProvider.id, 
          { enabled: !!process.env.FACEBOOK_APP_ID }
        );
      }
      
      console.log('OAuth providers check completed');
    }
  } catch (error) {
    console.error('Error initializing OAuth providers:', error);
  }
};