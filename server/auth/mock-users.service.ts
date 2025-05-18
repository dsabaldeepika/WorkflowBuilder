import { User, UserRole } from "@shared/schema";
import { hashPassword } from "./auth.service";
import { storage } from "../storage";

/**
 * Mock Users Service
 * 
 * This service provides mock users for development and testing purposes.
 * It creates predefined users with known credentials that can be used for testing.
 */
export class MockUsersService {
  // Mock user credentials
  private static readonly MOCK_USERS = [
    {
      username: "testuser",
      email: "test@gmail.com",
      password: "test123",
      firstName: "Test",
      lastName: "User",
      role: UserRole.CREATOR,
    },
    {
      username: "adminuser",
      email: "admin@gmail.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
    },
    {
      username: "demo",
      email: "demo@gmail.com",
      password: "demo123",
      firstName: "Demo",
      lastName: "User",
      role: UserRole.CREATOR,
    }
  ];

  /**
   * Initialize mock users in the database
   */
  static async initializeMockUsers() {
    console.log('Initializing mock users...');
    
    for (const userData of this.MOCK_USERS) {
      try {
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(userData.email);
        if (!existingUser) {
          console.log(`Creating mock user: ${userData.email}`);
          // Create new mock user
          const newUser = await storage.createUser({
            ...userData,
            password: await hashPassword(userData.password),
          });
          console.log(`Created mock user: ${userData.email} with ID: ${newUser.id}`);
        } else {
          console.log(`Mock user already exists: ${userData.email}`);
        }
      } catch (error) {
        console.error(`Failed to create mock user ${userData.email}:`, error);
      }
    }
    
    console.log('Mock users initialization completed');
  }

  /**
   * Get mock user credentials
   */
  static getMockCredentials() {
    console.log('Getting mock credentials');
    const credentials = this.MOCK_USERS.map(({ email, password }) => ({
      email,
      password,
    }));
    console.log('Available mock credentials:', credentials);
    return credentials;
  }
} 