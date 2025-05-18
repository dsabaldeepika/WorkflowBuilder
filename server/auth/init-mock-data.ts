import { MockUsersService } from './mock-users.service';

/**
 * Initialize mock data for development
 * 
 * This function sets up all necessary mock data:
 * - Mock users with known credentials
 */
export async function initializeMockData() {
  console.log('Initializing mock data...');
  
  try {
    // Initialize mock users
    await MockUsersService.initializeMockUsers();
    console.log('Mock data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize mock data:', error);
    throw error;
  }
} 