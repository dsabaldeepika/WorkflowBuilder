import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Run database migrations for new or updated columns
 */
export async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Add missing columns to oauth_providers table
    // First check if the columns exist
    const checkDisplayName = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'oauth_providers' AND column_name = 'display_name'
    `);
    
    if (checkDisplayName.rows.length === 0) {
      console.log('Adding display_name column to oauth_providers table');
      await db.execute(sql`
        ALTER TABLE oauth_providers 
        ADD COLUMN display_name TEXT NOT NULL DEFAULT 'Unknown'
      `);
    }
    
    const checkEnabled = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'oauth_providers' AND column_name = 'enabled'
    `);
    
    if (checkEnabled.rows.length === 0) {
      console.log('Adding enabled column to oauth_providers table');
      await db.execute(sql`
        ALTER TABLE oauth_providers 
        ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT false
      `);
    }
    
    const checkCreatedAt = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'oauth_providers' AND column_name = 'created_at'
    `);
    
    if (checkCreatedAt.rows.length === 0) {
      console.log('Adding created_at column to oauth_providers table');
      await db.execute(sql`
        ALTER TABLE oauth_providers 
        ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW()
      `);
    }
    
    const checkUpdatedAt = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'oauth_providers' AND column_name = 'updated_at'
    `);
    
    if (checkUpdatedAt.rows.length === 0) {
      console.log('Adding updated_at column to oauth_providers table');
      await db.execute(sql`
        ALTER TABLE oauth_providers 
        ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      `);
    }
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}