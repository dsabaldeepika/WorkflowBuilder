import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Create a postgres.js client
export const queryClient = postgres(process.env.DATABASE_URL, {
  max: 30, // max number of connections
  idle_timeout: 300, // seconds
  connect_timeout: 10, // seconds
});

// Export Drizzle ORM instance with optimized configuration
export const db = drizzle(queryClient, {
  schema,
  // Additional performance options can be configured here
});
