import { db } from '../db';
import { users } from '@shared/schema';
import { hashPassword } from '../auth/auth.service';

export async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Create test users
    const testUsers = [
      {
        username: 'test',
        email: 'test@gmail.com',
        password: await hashPassword('test123'),
        firstName: 'Test',
        lastName: 'User',
        role: 'creator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin',
        email: 'admin@gmail.com',
        password: await hashPassword('admin123'),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'demo',
        email: 'demo@gmail.com',
        password: await hashPassword('demo123'),
        firstName: 'Demo',
        lastName: 'User',
        role: 'creator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log('Inserting test users...');
    
    // Insert users one by one to handle potential duplicates
    for (const user of testUsers) {
      try {
        await db.insert(users).values(user);
        console.log(`Created user: ${user.email}`);
      } catch (error) {
        if (error.code === '23505') { // Unique violation
          console.log(`User ${user.email} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Only run the seed function if this file is being run directly
if (import.meta.url === import.meta.main) {
  seedDatabase()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
} 