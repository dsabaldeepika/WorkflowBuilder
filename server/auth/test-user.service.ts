import { User, UserRole } from "@shared/schema";
import { hashPassword } from "./auth.service";
import { storage } from "../storage";

/**
 * Test User Service
 *
 * This service provides test users and OAuth providers for development
 * and testing purposes. It creates mock data that can be used to test
 * the authentication system without real OAuth credentials.
 */
export class TestUserService {
  // Test user credentials
  private static readonly TEST_USERS = [
    {
      email: "test",
      password: "test",
      role: UserRole.CREATOR,
      username: "testuser",
      firstName: "Test",
      lastName: "User",
    },
    {
      email: "admin",
      password: "admin",
      role: UserRole.ADMIN,
      username: "adminuser",
      firstName: "Admin",
      lastName: "User",
    },
  ];

  /**
   * Initialize test users in the database
   */
  static async initializeTestUsers() {
    for (const userData of this.TEST_USERS) {
      try {
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(userData.email);
        if (!existingUser) {
          // Create new test user
          await storage.createUser({
            ...userData,
            password: await hashPassword(userData.password),
          });
        }
      } catch (error) {
        console.error(`Failed to create test user ${userData.email}:`, error);
      }
    }
  }

  /**
   * Get test user credentials
   */
  static getTestCredentials() {
    return this.TEST_USERS.map(({ email, password }) => ({
      email,
      password,
    }));
  }
}
