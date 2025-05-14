import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Run database migrations for new or updated columns
 * This file handles creating tables and adding columns if they don't exist
 */
export async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // --- OAuth Providers Table Migrations ---
    await ensureColumnsExist('oauth_providers', [
      { name: 'display_name', dataType: 'TEXT NOT NULL DEFAULT \'Unknown\'' },
      { name: 'enabled', dataType: 'BOOLEAN NOT NULL DEFAULT false' },
      { name: 'created_at', dataType: 'TIMESTAMP NOT NULL DEFAULT NOW()' },
      { name: 'updated_at', dataType: 'TIMESTAMP NOT NULL DEFAULT NOW()' }
    ]);
    
    // --- Workflow Tables Migrations ---
    // Check if workflow_template_categories table exists
    const workflowCategoriesExists = await checkTableExists('workflow_template_categories');
    
    if (!workflowCategoriesExists) {
      console.log('Creating workflow_template_categories table');
      await db.execute(sql`
        CREATE TABLE workflow_template_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          description TEXT NOT NULL,
          icon TEXT,
          count INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }
    
    // Check if workflow_templates table exists and create it if it doesn't
    const workflowTemplatesExists = await checkTableExists('workflow_templates');
    
    if (!workflowTemplatesExists) {
      console.log('Creating workflow_templates table');
      await db.execute(sql`
        CREATE TABLE workflow_templates (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          tags TEXT[],
          difficulty TEXT NOT NULL DEFAULT 'beginner',
          "workflowData" JSONB NOT NULL DEFAULT '{}'::jsonb,
          "imageUrl" TEXT,
          popularity INTEGER NOT NULL DEFAULT 0,
          "createdBy" TEXT,
          "createdByUserId" INTEGER REFERENCES users(id),
          "isPublished" BOOLEAN NOT NULL DEFAULT false,
          "isOfficial" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    } else {
      console.log('Workflow templates table already exists, skipping creation');
    }
    
    // Check if node_types table exists
    const nodeTypesExists = await checkTableExists('node_types');
    
    if (!nodeTypesExists) {
      console.log('Creating node_types table');
      await db.execute(sql`
        CREATE TABLE node_types (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          color TEXT,
          input_fields JSONB,
          output_fields JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }
    
    // Check if app_integrations table exists
    const appIntegrationsExists = await checkTableExists('app_integrations');
    
    if (!appIntegrationsExists) {
      console.log('Creating app_integrations table');
      await db.execute(sql`
        CREATE TABLE app_integrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          category TEXT,
          website TEXT,
          auth_type TEXT,
          auth_config JSONB,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }
    
    // Check if user_app_credentials table exists
    const userAppCredentialsExists = await checkTableExists('user_app_credentials');
    
    if (!userAppCredentialsExists) {
      console.log('Creating user_app_credentials table');
      await db.execute(sql`
        CREATE TABLE user_app_credentials (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          app_integration_id INTEGER NOT NULL REFERENCES app_integrations(id),
          credentials JSONB NOT NULL,
          name TEXT,
          is_valid BOOLEAN NOT NULL DEFAULT true,
          last_validated_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }
    
    // Check if workflow_node_executions table exists
    const workflowNodeExecutionsExists = await checkTableExists('workflow_node_executions');
    
    if (!workflowNodeExecutionsExists) {
      console.log('Creating workflow_node_executions table');
      await db.execute(sql`
        CREATE TABLE workflow_node_executions (
          id SERIAL PRIMARY KEY,
          workflow_run_id INTEGER NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
          node_id TEXT NOT NULL,
          status TEXT NOT NULL,
          start_time TIMESTAMP,
          end_time TIMESTAMP,
          input_data JSONB,
          output_data JSONB,
          error_message TEXT,
          error_category TEXT,
          retry_count INTEGER DEFAULT 0,
          execution_order INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    }
    
    // Check if workflow_runs table has execution_data column
    await ensureColumnsExist('workflow_runs', [
      { name: 'execution_data', dataType: 'JSONB' },
      { name: 'error_message', dataType: 'TEXT' },
      { name: 'error_category', dataType: 'TEXT' }
    ]);
    
    // Check if workflows table has additional needed columns
    await ensureColumnsExist('workflows', [
      { name: 'run_count', dataType: 'INTEGER NOT NULL DEFAULT 0' },
      { name: 'last_run_at', dataType: 'TIMESTAMP' }
    ]);
    
    // We've recreated the workflow_templates table already, so no need to check for columns
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

/**
 * Helper function to check if a table exists in the database
 * @param tableName - Name of the table to check
 * @returns A boolean indicating if the table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    )
  `);
  
  return result.rows[0]?.exists === true;
}

/**
 * Helper function to ensure columns exist in a table
 * @param tableName - Name of the table to check
 * @param columns - Array of column definitions to ensure exist
 */
async function ensureColumnsExist(tableName: string, columns: Array<{ name: string, dataType: string }>): Promise<void> {
  for (const column of columns) {
    // Check if column exists
    const result = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = ${tableName} AND column_name = ${column.name}
    `);
    
    if (result.rows.length === 0) {
      console.log(`Adding ${column.name} column to ${tableName} table`);
      await db.execute(sql`
        ALTER TABLE ${sql.identifier([tableName])} 
        ADD COLUMN ${sql.identifier([column.name])} ${sql.raw(column.dataType)}
      `);
    }
  }
}