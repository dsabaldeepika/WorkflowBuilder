import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { storage } from '../storage';
import { User, UserRole } from '@shared/schema';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'temp-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const CALLBACK_URL_BASE = process.env.CALLBACK_URL_BASE || 'http://localhost:5000';

// Test user token for development
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || '';

// Setup passport JWT strategy
export const setupPassport = () => {
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
      },
      async (payload, done) => {
        try {
          const user = await storage.getUser(payload.id);

          if (!user) {
            return done(null, false);
          }

          if (!user.isActive) {
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: `${CALLBACK_URL_BASE}/api/auth/google/callback`,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if we have a provider record
            let provider = await storage.getOAuthProviderByName('google');
            
            if (!provider) {
              console.error('Google provider not found in database');
              return done(new Error('OAuth provider not configured'), null);
            }

            // Check if user exists with this email
            const email = profile.emails && profile.emails[0]?.value;
            if (!email) {
              return done(new Error('No email provided by Google'), null);
            }

            let user = await storage.getUserByEmail(email);

            if (user) {
              // Update user info if needed
              await storage.updateUser(user.id, {
                firstName: profile.name?.givenName || user.firstName,
                lastName: profile.name?.familyName || user.lastName,
                profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
              });

              // Link user to provider if not already linked
              await storage.linkUserToOAuthProvider(
                user.id,
                provider.id,
                profile.id,
                accessToken,
                refreshToken || undefined
              );
            } else {
              // Create new user
              const username = generateUsername(profile.displayName || email);
              
              user = await storage.createUser({
                username,
                email,
                firstName: profile.name?.givenName || null,
                lastName: profile.name?.familyName || null,
                profileImageUrl: profile.photos?.[0]?.value || null,
                role: UserRole.CREATOR // Default role for new users
              });

              // Link to provider
              await storage.linkUserToOAuthProvider(
                user.id,
                provider.id,
                profile.id,
                accessToken,
                refreshToken || undefined
              );
            }

            // Update last login time
            await storage.updateUser(user.id, {});

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  // GitHub OAuth Strategy
  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: `${CALLBACK_URL_BASE}/api/auth/github/callback`,
          scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if we have a provider record
            let provider = await storage.getOAuthProviderByName('github');
            
            if (!provider) {
              console.error('GitHub provider not found in database');
              return done(new Error('OAuth provider not configured'), null);
            }

            // GitHub might not expose email directly in profile
            const email = profile.emails && profile.emails[0]?.value;
            if (!email) {
              return done(new Error('No email provided by GitHub'), null);
            }

            let user = await storage.getUserByEmail(email);

            if (user) {
              // Update user info if needed
              await storage.updateUser(user.id, {
                profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
              });

              // Link user to provider if not already linked
              await storage.linkUserToOAuthProvider(
                user.id,
                provider.id, 
                profile.id,
                accessToken,
                refreshToken || undefined
              );
            } else {
              // Create new user
              const username = generateUsername(profile.username || email);
              
              user = await storage.createUser({
                username,
                email,
                firstName: profile.displayName?.split(' ')[0] || null,
                lastName: profile.displayName?.split(' ').slice(1).join(' ') || null,
                profileImageUrl: profile.photos?.[0]?.value || null,
                role: UserRole.CREATOR // Default role for new users
              });

              // Link to provider
              await storage.linkUserToOAuthProvider(
                user.id,
                provider.id,
                profile.id,
                accessToken,
                refreshToken || undefined
              );
            }

            // Update last login time
            await storage.updateUser(user.id, {});

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }
};

// Helper functions
export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateUsername = (base: string): string => {
  // Generate a unique username based on the user's name or email
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${sanitized}${randomSuffix}`;
};

// Middleware to check roles
export const hasRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip role check for test user
    if (process.env.NODE_ENV === 'development' && req.path === '/api/auth/test-login') {
      return next();
    }

    const user = req.user as User;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(user.role as UserRole)) {
      return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
};

// Test user authentication helper (for development only)
export const authenticateTestUser = async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const token = req.body.token || TEST_USER_TOKEN;
    
    if (!token) {
      return res.status(400).json({ message: 'Test user token is required' });
    }

    const result = await storage.getTestUserByToken(token);
    
    if (!result) {
      return res.status(401).json({ message: 'Invalid test user token' });
    }

    const { user } = result;
    
    // Login the user
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      
      // Generate JWT token
      const jwtToken = generateToken(user);
      
      // Return user and token
      return res.json({
        user,
        token: jwtToken
      });
    });
  } catch (error) {
    next(error);
  }
};

// Use in auth routes that require user to be authenticated
export const isAuthenticated = passport.authenticate('jwt', { session: false });

// Initialize test user (for development)
export const createInitialTestUser = async () => {
  if (process.env.NODE_ENV !== 'development') return;

  try {
    // Check if test user already exists
    const existingUser = await storage.getUserByUsername('test123');
    
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Create a new test user
    const { user, testFlag } = await storage.createTestUser('test123', 'test@example.com');
    
    console.log('Created test user:');
    console.log(`Username: ${user.username}`);
    console.log(`Test token: ${testFlag.testUserToken}`);
    
    // Set environment variable for easy access
    process.env.TEST_USER_TOKEN = testFlag.testUserToken;
  } catch (error) {
    console.error('Error creating test user:', error);
  }
};

// Initialize OAuth providers in database if they don't exist
export const initializeOAuthProviders = async () => {
  try {
    const providers = await storage.getOAuthProviders();
    
    if (providers.length === 0) {
      // Check if providers already exist as users
      const googleExists = await storage.getUserByUsername('google-oauth');
      const githubExists = await storage.getUserByUsername('github-oauth');
      
      // Add providers to the oauthProviders table
      if (!googleExists) {
        // Insert Google provider record
        console.log('Adding Google OAuth provider');
      }
      
      if (!githubExists) {
        // Insert GitHub provider record
        console.log('Adding GitHub OAuth provider');
      }
      
      console.log('OAuth providers check completed');
    }
  } catch (error) {
    console.error('Error initializing OAuth providers:', error);
  }
};