"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.queryClient = void 0;
require("dotenv/config");
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var schema = require("@shared/schema");
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
// Create a postgres.js client
exports.queryClient = (0, postgres_1.default)(process.env.DATABASE_URL, {
    max: 30, // max number of connections
    idle_timeout: 300, // seconds
    connect_timeout: 10, // seconds
});
// Export Drizzle ORM instance with optimized configuration
exports.db = (0, postgres_js_1.drizzle)(exports.queryClient, {
    schema: schema,
    // Additional performance options can be configured here
});
