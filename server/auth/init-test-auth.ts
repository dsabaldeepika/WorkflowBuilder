import { TestUserService } from './test-user.service';
import { MockOAuthService } from './mock-oauth.service';

/**
 * Initialize test authentication data
 * 
 * This function sets up all necessary test data for authentication:
 * - Test users
 * - Mock OAuth providers
 */
export async function initializeTestAuth() {
  console.log('Initializing test authentication data...');
  
  try {
    // Initialize test users
    await TestUserService.initializeTestUsers();
    console.log('Test users initialized successfully');
    
    // Initialize mock OAuth providers
    await MockOAuthService.initializeMockProviders();
    console.log('Mock OAuth providers initialized successfully');
    
    console.log('Test authentication data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize test authentication data:', error);
    throw error;
  }
} 