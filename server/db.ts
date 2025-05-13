import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Optimized database connection pool for high scalability (5,000+ users)
 * - Configures connection pool size based on workload
 * - Implements connection timeout and idle timeouts
 * - Adds proper error handling and connection leak prevention
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optimize pool size based on expected workload
  // For 5000 users with moderate DB usage, 20-50 connections is reasonable
  // Max depends on your DB plan limits - adjust accordingly
  max: 30,
  // Connection idle timeout (5 minutes) - helps prevent connection leaks
  idleTimeoutMillis: 300000,
  // Connection attempt timeout (10 seconds)
  connectionTimeoutMillis: 10000,
});

// Log connection pool events for monitoring
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Export Drizzle ORM instance with optimized configuration
export const db = drizzle(pool, { 
  schema,
  // Additional performance options can be configured here
});