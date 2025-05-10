import { pgTable, text, serial, jsonb, varchar, timestamp, boolean, integer, primaryKey, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export enum UserRole {
  CREATOR = 'creator',
  EDITOR = 'editor',
  ADMIN = 'admin'
}

// Session table for auth session management
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// OAuth providers
export const oauthProviders = pgTable("oauth_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // 'google', 'facebook', etc.
  displayName: text("display_name").notNull(), // 'Google', 'Facebook', etc.
  enabled: boolean("enabled").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  password: text("password"), // Optional for OAuth users
  role: text("role").notNull().default(UserRole.CREATOR), // creator, editor, admin
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// OAuth connections for users
export const userOauth = pgTable("user_oauth", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerId: integer("provider_id").notNull().references(() => oauthProviders.id),
  providerUserId: text("provider_user_id").notNull(), // ID from the provider
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User invitation system
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  token: text("token").notNull().unique(),
  invitedByUserId: integer("invited_by_user_id").notNull().references(() => users.id),
  accepted: boolean("accepted").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Test user flag for development
export const testUserFlags = pgTable("test_user_flags", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  isTestUser: boolean("is_test_user").notNull().default(false),
  testUserToken: text("test_user_token"), // For simplified auth during development
});

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  password: true,
  role: true,
});

// Workspace schema
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workspace user permissions
export enum WorkspacePermission {
  VIEW = 'view',     // Can only view workflows in the workspace
  EDIT = 'edit',     // Can edit workflows in the workspace
  MANAGE = 'manage', // Can manage workspace settings and members
  ADMIN = 'admin'    // Full control over the workspace
}

// Workspace members table
export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  permission: text("permission").notNull().default(WorkspacePermission.VIEW),
  addedByUserId: integer("added_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workflow schema
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  workspaceId: integer("workspace_id").references(() => workspaces.id, { onDelete: 'cascade' }),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  nodes: jsonb("nodes").notNull(),
  edges: jsonb("edges").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  runCount: integer("run_count").notNull().default(0),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Individual workflow permissions (for when users need specific permissions outside of workspace permissions)
export const workflowPermissions = pgTable("workflow_permissions", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  permission: text("permission").notNull(), // view, edit
  grantedByUserId: integer("granted_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workflow run logs
export const workflowRuns = pgTable("workflow_runs", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  startedByUserId: integer("started_by_user_id").references(() => users.id),
  status: text("status").notNull(), // running, completed, failed
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  executionData: jsonb("execution_data"),
  errorMessage: text("error_message"),
  errorCategory: text("error_category"),
});

// Schemas for inserting data
export const insertWorkspaceSchema = createInsertSchema(workspaces).pick({
  name: true,
  description: true,
  createdByUserId: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).pick({
  name: true,
  description: true,
  workspaceId: true,
  createdByUserId: true,
  nodes: true,
  edges: true,
  isPublished: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type OAuthProvider = typeof oauthProviders.$inferSelect;
export type UserOAuth = typeof userOauth.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type TestUserFlag = typeof testUserFlags.$inferSelect;

export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspaces.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type WorkflowPermission = typeof workflowPermissions.$inferSelect;
export type WorkflowRun = typeof workflowRuns.$inferSelect;
