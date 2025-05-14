import { pgTable, text, serial, jsonb, varchar, timestamp, boolean, integer, primaryKey, index, uniqueIndex, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Schema definitions for the PumpFlux workflow automation platform.
 * This file contains all database table definitions, insert schemas, and TypeScript types
 * needed for the application's data model.
 */

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

// Subscription plan tiers
export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  tier: text("tier").notNull(),
  description: text("description").notNull(),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal("price_yearly", { precision: 10, scale: 2 }).notNull(),
  stripePriceIdMonthly: text("stripe_price_id_monthly").notNull(),
  stripePriceIdYearly: text("stripe_price_id_yearly").notNull(),
  maxWorkflows: integer("max_workflows").notNull(),
  maxWorkspaces: integer("max_workspaces").notNull(),
  maxExecutionsPerMonth: integer("max_executions_per_month").notNull(),
  maxTeamMembers: integer("max_team_members").notNull(),
  hasAdvancedIntegrations: boolean("has_advanced_integrations").notNull().default(false),
  hasAiFeatures: boolean("has_ai_features").notNull().default(false),
  hasCustomBranding: boolean("has_custom_branding").notNull().default(false),
  hasPrioritySuppport: boolean("has_priority_support").notNull().default(false),
  features: text("features").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  // Subscription and billing fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier").notNull().default(SubscriptionTier.FREE),
  subscriptionStatus: text("subscription_status"),
  subscriptionPeriodEnd: timestamp("subscription_period_end"),
  // Base timestamp fields
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
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  subscriptionTier: true,
  subscriptionStatus: true,
  subscriptionPeriodEnd: true,
});

// Schema for inserting subscription plans
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  tier: true,
  description: true,
  priceMonthly: true,
  priceYearly: true,
  stripePriceIdMonthly: true,
  stripePriceIdYearly: true,
  maxWorkflows: true,
  maxWorkspaces: true,
  maxExecutionsPerMonth: true,
  maxTeamMembers: true,
  hasAdvancedIntegrations: true,
  hasAiFeatures: true,
  hasCustomBranding: true,
  hasPrioritySuppport: true,
  features: true,
  isActive: true,
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

// Workflow template categories
export const workflowTemplateCategories = pgTable("workflow_template_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  count: integer("count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workflow templates table
export const workflowTemplates = pgTable("workflow_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  tags: text("tags").array(),
  difficulty: text("difficulty").notNull().default('beginner'), // beginner, intermediate, advanced
  workflowData: jsonb("workflowData").notNull(),
  imageUrl: text("imageUrl"),
  popularity: integer("popularity").notNull().default(0),
  createdBy: text("createdBy"),
  createdByUserId: integer("createdByUserId").references(() => users.id),
  isPublished: boolean("isPublished").notNull().default(false),
  isOfficial: boolean("isOfficial").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Node types table for workflow nodes
export const nodeTypes = pgTable("node_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  category: text("category").notNull(), // trigger, action, condition, etc.
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  inputFields: jsonb("input_fields"), // Schema for the input fields
  outputFields: jsonb("output_fields"), // Schema for the output fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// App integrations table
export const appIntegrations = pgTable("app_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  icon: text("icon"),
  category: text("category"),
  website: text("website"),
  authType: text("auth_type"), // api_key, oauth2, basic_auth, etc.
  authConfig: jsonb("auth_config"), // Auth configuration (depends on authType)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User app credentials table
export const userAppCredentials = pgTable("user_app_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  appIntegrationId: integer("app_integration_id").references(() => appIntegrations.id).notNull(),
  credentials: jsonb("credentials").notNull(), // Encrypted credentials
  name: text("name"), // Optional friendly name for these credentials
  isValid: boolean("is_valid").notNull().default(true),
  lastValidatedAt: timestamp("last_validated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscription history records table
export const subscriptionHistory = pgTable("subscription_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  subscriptionPlanId: integer("subscription_plan_id").references(() => subscriptionPlans.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  billingPeriod: text("billing_period").notNull(), // monthly, yearly
  status: text("status").notNull(), // active, canceled, past_due, trialing, incomplete
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  canceledAt: timestamp("canceled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workflow Node Executions table
export const workflowNodeExecutions = pgTable("workflow_node_executions", {
  id: serial("id").primaryKey(),
  workflowRunId: integer("workflow_run_id").references(() => workflowRuns.id, { onDelete: 'cascade' }).notNull(),
  nodeId: text("node_id").notNull(), // ID of the node in the workflow
  status: text("status").notNull(), // pending, running, completed, failed, skipped
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  errorMessage: text("error_message"),
  errorCategory: text("error_category"),
  retryCount: integer("retry_count").default(0),
  executionOrder: integer("execution_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workflow connections table for storing node connections
export const workflowConnections = pgTable("workflow_connections", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").references(() => workflows.id, { onDelete: 'cascade' }),
  sourceNodeId: text("source_node_id").notNull(),
  targetNodeId: text("target_node_id").notNull(),
  edgeId: text("edge_id").notNull().unique(),
  isValid: boolean("is_valid").notNull().default(true),
  validationMessage: text("validation_message"),
  data: jsonb("data").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const insertWorkflowConnectionSchema = createInsertSchema(workflowConnections).pick({
  workflowId: true,
  sourceNodeId: true,
  targetNodeId: true,
  edgeId: true,
  isValid: true,
  validationMessage: true,
  data: true,
});

// Schema for inserting template categories
export const insertWorkflowTemplateCategorySchema = createInsertSchema(workflowTemplateCategories).pick({
  name: true,
  displayName: true,
  description: true,
  icon: true,
  count: true,
  isActive: true,
  sortOrder: true,
});

// Schema for inserting workflow templates
export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates).pick({
  name: true,
  description: true,
  category: true,
  tags: true,
  difficulty: true,
  workflowData: true,
  imageUrl: true,
  popularity: true,
  createdBy: true, 
  createdByUserId: true,
  isPublished: true,
  isOfficial: true,
});

export const insertNodeTypeSchema = createInsertSchema(nodeTypes).pick({
  name: true,
  displayName: true,
  category: true,
  description: true,
  icon: true,
  color: true,
  inputFields: true,
  outputFields: true,
});

export const insertAppIntegrationSchema = createInsertSchema(appIntegrations).pick({
  name: true,
  displayName: true,
  description: true,
  icon: true,
  category: true,
  website: true,
  authType: true,
  authConfig: true,
  isActive: true,
});

export const insertUserAppCredentialsSchema = createInsertSchema(userAppCredentials).pick({
  userId: true,
  appIntegrationId: true,
  credentials: true,
  name: true,
  isValid: true,
});

export const insertSubscriptionHistorySchema = createInsertSchema(subscriptionHistory).pick({
  userId: true,
  subscriptionPlanId: true,
  stripeSubscriptionId: true,
  stripeInvoiceId: true,
  billingPeriod: true,
  status: true,
  startDate: true,
  endDate: true,
  amount: true,
  currency: true,
  canceledAt: true,
  cancelReason: true,
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

export type InsertWorkflowConnection = z.infer<typeof insertWorkflowConnectionSchema>;
export type WorkflowConnection = typeof workflowConnections.$inferSelect;
export type WorkflowTemplateCategory = typeof workflowTemplateCategories.$inferSelect;

export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;

export type InsertNodeType = z.infer<typeof insertNodeTypeSchema>;
export type NodeType = typeof nodeTypes.$inferSelect;

export type InsertAppIntegration = z.infer<typeof insertAppIntegrationSchema>;
export type AppIntegration = typeof appIntegrations.$inferSelect;

export type InsertUserAppCredential = z.infer<typeof insertUserAppCredentialsSchema>;
export type UserAppCredential = typeof userAppCredentials.$inferSelect;

export type WorkflowNodeExecution = typeof workflowNodeExecutions.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertSubscriptionHistory = z.infer<typeof insertSubscriptionHistorySchema>;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;

// Form schemas
export const contactFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const templateRequestSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  useCase: z.string().min(10, "Use case must be at least 10 characters"),
  requesterEmail: z.string().email("Please enter a valid email address"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const templateRequestFormSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  templateTitle: z.string().min(3, "Template title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  useCase: z.string().min(10, "Use case must be at least 10 characters"),
});

export const demoRequestFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(2, "Company name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  phoneNumber: z.string().optional(),
  teamSize: z.string().min(1, "Team size is required"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
});

export type TemplateRequestFormInput = z.infer<typeof templateRequestFormSchema>;
export type TemplateRequestInput = z.infer<typeof templateRequestSchema>;
export type DemoRequestFormInput = z.infer<typeof demoRequestFormSchema>;