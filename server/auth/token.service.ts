import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';
import { storage } from '../storage';

/**
 * Interface defining the structure of a token pair
 * Contains both access and refresh tokens
 */
interface TokenPair {
  accessToken: string;    // Short-lived token for API access
  refreshToken: string;   // Long-lived token for obtaining new access tokens
}

/**
 * TokenService Class
 * 
 * Handles all token-related operations including generation, verification,
 * and rotation of JWT tokens. Implements secure token management practices
 * including token versioning and automatic rotation.
 */
export class TokenService {
  // Token expiration times
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';  // Access tokens expire in 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';  // Refresh tokens expire in 7 days

  /**
   * Generates a new pair of access and refresh tokens for a user
   * 
   * @param user - The user object containing user information
   * @returns Object containing both access and refresh tokens
   */
  static generateTokenPair(user: User): TokenPair {
    // Generate access token with user information and short expiry
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.SESSION_SECRET!,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    // Generate refresh token with user ID and token version
    // Token version helps invalidate all refresh tokens if needed
    const refreshToken = jwt.sign(
      { id: user.id, tokenVersion: Date.now() },
      process.env.SESSION_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Rotates a refresh token by generating a new token pair
   * This implements the refresh token rotation security pattern
   * 
   * @param refreshToken - The current refresh token to rotate
   * @returns New token pair or null if the refresh token is invalid
   */
  static async rotateRefreshToken(refreshToken: string): Promise<TokenPair | null> {
    try {
      // Verify and decode the refresh token
      const decoded = jwt.verify(refreshToken, process.env.SESSION_SECRET!) as {
        id: number;
        tokenVersion: number;
      };

      // Get the user from the database
      const user = await storage.getUser(decoded.id);
      if (!user) return null;

      // Generate new token pair
      return this.generateTokenPair(user);
    } catch (error) {
      // Return null if token verification fails
      return null;
    }
  }

  /**
   * Verifies an access token and returns its payload
   * 
   * @param token - The access token to verify
   * @returns Decoded token payload or null if invalid
   */
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, process.env.SESSION_SECRET!);
    } catch (error) {
      return null;
    }
  }
} 