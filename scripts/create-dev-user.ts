/**
 * Script to create a development user for testing
 * This ensures we have a user with ID 1 for template imports in development mode
 */
import { db } from '../server/db';
import { users, UserRole, SubscriptionTier } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function createDevUser() {
  try {
    // Check if dev user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, 1));
    
    if (existingUser) {
      console.log('Development user already exists:', existingUser.username);
      return existingUser;
    }

    // Create a new development user
    const hashedPassword = await hashPassword('dev-password');
    
    const [user] = await db.insert(users).values({
      id: 1, // Force ID to be 1
      username: 'dev-user',
      email: 'dev@example.com',
      firstName: 'Development',
      lastName: 'User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      subscriptionTier: SubscriptionTier.ENTERPRISE,
      isActive: true
    }).returning();
    
    console.log('Created development user:', user.username);
    return user;
  } catch (error) {
    console.error('Error creating development user:', error);
    throw error;
  }
}

async function main() {
  try {
    await createDevUser();
    console.log('Development user setup complete');
  } catch (error) {
    console.error('Failed to set up development user:', error);
  } finally {
    process.exit(0);
  }
}

main();