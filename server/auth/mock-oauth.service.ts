import { OAuthProvider } from "@shared/schema";
import { storage } from "../storage";

/**
 * Mock OAuth Provider Service
 *
 * This service provides mock OAuth providers for testing purposes.
 * It simulates OAuth authentication without requiring real OAuth credentials.
 */
export class MockOAuthService {
  // Mock OAuth providers
  private static readonly MOCK_PROVIDERS: OAuthProvider[] = [
    {
      id: 1,
      name: "google",
      displayName: "Google",
      clientId: "mock-google-client-id",
      clientSecret: "mock-google-client-secret",
      callbackUrl: "/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    {
      id: 2,
      name: "facebook",
      displayName: "Facebook",
      clientId: "mock-facebook-client-id",
      clientSecret: "mock-facebook-client-secret",
      callbackUrl: "/api/auth/facebook/callback",
      scope: ["email", "public_profile"],
    },
  ];

  /**
   * Initialize mock OAuth providers in the database
   */
  static async initializeMockProviders() {
    for (const provider of this.MOCK_PROVIDERS) {
      try {
        await storage.createOAuthProvider(provider);
      } catch (error) {
        console.error(
          `Failed to create mock provider ${provider.name}:`,
          error
        );
      }
    }
  }

  /**
   * Get mock OAuth provider configuration
   */
  static getMockProviderConfig(providerName: string) {
    return this.MOCK_PROVIDERS.find((p) => p.name === providerName);
  }
}
