import { db } from "../server/db";
import { users } from "../shared/schema";
import { hashPassword } from "../server/auth/auth.service";
import { seedNodeConfigurations } from './seed-nodes';

const testUsers = [
  {
    username: 'test',
    email: 'test@gmail.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User',
    role: 'creator',
    isActive: true
  },
  {
    username: 'admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true
  },
  {
    username: 'demo',
    email: 'demo@gmail.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    role: 'creator',
    isActive: true
  }
];

async function seedTestUsers() {
  console.log('Starting test users seeding...');

  try {
    for (const user of testUsers) {
      try {
        const hashedPassword = await hashPassword(user.password);
        await db.insert(users).values({
          ...user,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Created user: ${user.email}`);
      } catch (error: any) {
        if (error.code === '23505') { // Unique violation
          console.log(`User ${user.email} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log('Test users seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding test users:', error);
    throw error;
  }
}

// Only run the seed function if this file is being run directly
if (import.meta.url === import.meta.main) {
  seedTestUsers()
    .then(() => {
      console.log('Test users seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test users seed failed:', error);
      process.exit(1);
    });
}
