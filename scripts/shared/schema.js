"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoRequestFormSchema = exports.templateRequestFormSchema = exports.templateRequestSchema = exports.contactFormSchema = exports.insertSubscriptionHistorySchema = exports.insertUserAppCredentialsSchema = exports.insertAppIntegrationSchema = exports.insertNodeTypeSchema = exports.insertWorkflowTemplateSchema = exports.insertWorkflowTemplateCategorySchema = exports.insertWorkflowConnectionSchema = exports.insertWorkflowSchema = exports.insertWorkspaceSchema = exports.workflowConnections = exports.workflowNodeExecutions = exports.subscriptionHistory = exports.userAppCredentials = exports.appIntegrations = exports.nodeTypes = exports.workflowTemplates = exports.workflowTemplateCategories = exports.workflowRuns = exports.workflowPermissions = exports.workflows = exports.workspaceMembers = exports.WorkspacePermission = exports.workspaces = exports.insertSubscriptionPlanSchema = exports.insertUserSchema = exports.testUserFlags = exports.invitations = exports.userOauth = exports.users = exports.subscriptionPlans = exports.SubscriptionTier = exports.oauthProviders = exports.sessions = exports.UserRole = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
/**
 * Schema definitions for the PumpFlux workflow automation platform.
 * This file contains all database table definitions, insert schemas, and TypeScript types
 * needed for the application's data model.
 */
// User role enum
var UserRole;
(function (UserRole) {
    UserRole["CREATOR"] = "creator";
    UserRole["EDITOR"] = "editor";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
// Session table for auth session management
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, function (table) { return [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]; });
// OAuth providers
exports.oauthProviders = (0, pg_core_1.pgTable)("oauth_providers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(), // 'google', 'facebook', etc.
    displayName: (0, pg_core_1.text)("display_name").notNull(), // 'Google', 'Facebook', etc.
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Subscription plan tiers
var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["FREE"] = "free";
    SubscriptionTier["BASIC"] = "basic";
    SubscriptionTier["PROFESSIONAL"] = "professional";
    SubscriptionTier["ENTERPRISE"] = "enterprise";
})(SubscriptionTier || (exports.SubscriptionTier = SubscriptionTier = {}));
// Subscription plans table
exports.subscriptionPlans = (0, pg_core_1.pgTable)("subscription_plans", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    tier: (0, pg_core_1.text)("tier").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    priceMonthly: (0, pg_core_1.decimal)("price_monthly", { precision: 10, scale: 2 }).notNull(),
    priceYearly: (0, pg_core_1.decimal)("price_yearly", { precision: 10, scale: 2 }).notNull(),
    stripePriceIdMonthly: (0, pg_core_1.text)("stripe_price_id_monthly").notNull(),
    stripePriceIdYearly: (0, pg_core_1.text)("stripe_price_id_yearly").notNull(),
    maxWorkflows: (0, pg_core_1.integer)("max_workflows").notNull(),
    maxWorkspaces: (0, pg_core_1.integer)("max_workspaces").notNull(),
    maxExecutionsPerMonth: (0, pg_core_1.integer)("max_executions_per_month").notNull(),
    maxTeamMembers: (0, pg_core_1.integer)("max_team_members").notNull(),
    hasAdvancedIntegrations: (0, pg_core_1.boolean)("has_advanced_integrations").notNull().default(false),
    hasAiFeatures: (0, pg_core_1.boolean)("has_ai_features").notNull().default(false),
    hasCustomBranding: (0, pg_core_1.boolean)("has_custom_branding").notNull().default(false),
    hasPrioritySuppport: (0, pg_core_1.boolean)("has_priority_support").notNull().default(false),
    features: (0, pg_core_1.text)("features").array(),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// User schema
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    firstName: (0, pg_core_1.text)("first_name"),
    lastName: (0, pg_core_1.text)("last_name"),
    profileImageUrl: (0, pg_core_1.text)("profile_image_url"),
    password: (0, pg_core_1.text)("password"), // Optional for OAuth users
    role: (0, pg_core_1.text)("role").notNull().default(UserRole.CREATOR), // creator, editor, admin
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    lastLogin: (0, pg_core_1.timestamp)("last_login"),
    // Subscription and billing fields
    stripeCustomerId: (0, pg_core_1.text)("stripe_customer_id"),
    stripeSubscriptionId: (0, pg_core_1.text)("stripe_subscription_id"),
    subscriptionTier: (0, pg_core_1.text)("subscription_tier").notNull().default(SubscriptionTier.FREE),
    subscriptionStatus: (0, pg_core_1.text)("subscription_status"),
    subscriptionPeriodEnd: (0, pg_core_1.timestamp)("subscription_period_end"),
    // Base timestamp fields
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// OAuth connections for users
exports.userOauth = (0, pg_core_1.pgTable)("user_oauth", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    providerId: (0, pg_core_1.integer)("provider_id").notNull().references(function () { return exports.oauthProviders.id; }),
    providerUserId: (0, pg_core_1.text)("provider_user_id").notNull(), // ID from the provider
    accessToken: (0, pg_core_1.text)("access_token"),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    tokenExpiry: (0, pg_core_1.timestamp)("token_expiry"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// User invitation system
exports.invitations = (0, pg_core_1.pgTable)("invitations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull(),
    role: (0, pg_core_1.text)("role").notNull(),
    token: (0, pg_core_1.text)("token").notNull().unique(),
    invitedByUserId: (0, pg_core_1.integer)("invited_by_user_id").notNull().references(function () { return exports.users.id; }),
    accepted: (0, pg_core_1.boolean)("accepted").notNull().default(false),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Test user flag for development
exports.testUserFlags = (0, pg_core_1.pgTable)("test_user_flags", {
    userId: (0, pg_core_1.integer)("user_id").primaryKey().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    isTestUser: (0, pg_core_1.boolean)("is_test_user").notNull().default(false),
    testUserToken: (0, pg_core_1.text)("test_user_token"), // For simplified auth during development
});
// Schemas for inserting data
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
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
exports.insertSubscriptionPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.subscriptionPlans).pick({
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
exports.workspaces = (0, pg_core_1.pgTable)("workspaces", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    createdByUserId: (0, pg_core_1.integer)("created_by_user_id").notNull().references(function () { return exports.users.id; }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Workspace user permissions
var WorkspacePermission;
(function (WorkspacePermission) {
    WorkspacePermission["VIEW"] = "view";
    WorkspacePermission["EDIT"] = "edit";
    WorkspacePermission["MANAGE"] = "manage";
    WorkspacePermission["ADMIN"] = "admin"; // Full control over the workspace
})(WorkspacePermission || (exports.WorkspacePermission = WorkspacePermission = {}));
// Workspace members table
exports.workspaceMembers = (0, pg_core_1.pgTable)("workspace_members", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    workspaceId: (0, pg_core_1.integer)("workspace_id").notNull().references(function () { return exports.workspaces.id; }, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    permission: (0, pg_core_1.text)("permission").notNull().default(WorkspacePermission.VIEW),
    addedByUserId: (0, pg_core_1.integer)("added_by_user_id").notNull().references(function () { return exports.users.id; }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Workflow schema
exports.workflows = (0, pg_core_1.pgTable)("workflows", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    workspaceId: (0, pg_core_1.integer)("workspace_id").references(function () { return exports.workspaces.id; }, { onDelete: 'cascade' }),
    createdByUserId: (0, pg_core_1.integer)("created_by_user_id").notNull().references(function () { return exports.users.id; }),
    nodes: (0, pg_core_1.jsonb)("nodes").notNull(),
    edges: (0, pg_core_1.jsonb)("edges").notNull(),
    isPublished: (0, pg_core_1.boolean)("is_published").notNull().default(false),
    runCount: (0, pg_core_1.integer)("run_count").notNull().default(0),
    lastRunAt: (0, pg_core_1.timestamp)("last_run_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Individual workflow permissions (for when users need specific permissions outside of workspace permissions)
exports.workflowPermissions = (0, pg_core_1.pgTable)("workflow_permissions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    workflowId: (0, pg_core_1.integer)("workflow_id").notNull().references(function () { return exports.workflows.id; }, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    permission: (0, pg_core_1.text)("permission").notNull(), // view, edit
    grantedByUserId: (0, pg_core_1.integer)("granted_by_user_id").notNull().references(function () { return exports.users.id; }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Workflow run logs
exports.workflowRuns = (0, pg_core_1.pgTable)("workflow_runs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    workflowId: (0, pg_core_1.integer)("workflow_id").notNull().references(function () { return exports.workflows.id; }, { onDelete: 'cascade' }),
    startedByUserId: (0, pg_core_1.integer)("started_by_user_id").references(function () { return exports.users.id; }),
    status: (0, pg_core_1.text)("status").notNull(), // running, completed, failed
    startTime: (0, pg_core_1.timestamp)("start_time").notNull(),
    endTime: (0, pg_core_1.timestamp)("end_time"),
    executionData: (0, pg_core_1.jsonb)("execution_data"),
    errorMessage: (0, pg_core_1.text)("error_message"),
    errorCategory: (0, pg_core_1.text)("error_category"),
});
// Workflow template categories
exports.workflowTemplateCategories = (0, pg_core_1.pgTable)("workflow_template_categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    icon: (0, pg_core_1.text)("icon"),
    count: (0, pg_core_1.integer)("count").notNull().default(0),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    sortOrder: (0, pg_core_1.integer)("sort_order").notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Workflow templates table
exports.workflowTemplates = (0, pg_core_1.pgTable)("workflow_templates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.text)("category").notNull(),
    tags: (0, pg_core_1.text)("tags").array(),
    difficulty: (0, pg_core_1.text)("difficulty").notNull().default('beginner'), // beginner, intermediate, advanced
    workflowData: (0, pg_core_1.jsonb)("workflowData").notNull(),
    imageUrl: (0, pg_core_1.text)("imageUrl"),
    popularity: (0, pg_core_1.integer)("popularity").notNull().default(0),
    createdBy: (0, pg_core_1.text)("createdBy"),
    createdByUserId: (0, pg_core_1.integer)("createdByUserId").references(function () { return exports.users.id; }),
    isPublished: (0, pg_core_1.boolean)("isPublished").notNull().default(false),
    isOfficial: (0, pg_core_1.boolean)("isOfficial").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow().notNull(),
});
// Node types table for workflow nodes
exports.nodeTypes = (0, pg_core_1.pgTable)("node_types", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    category: (0, pg_core_1.text)("category").notNull(), // trigger, action, condition, etc.
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.text)("icon"),
    color: (0, pg_core_1.text)("color"),
    inputFields: (0, pg_core_1.jsonb)("input_fields"), // Schema for the input fields
    outputFields: (0, pg_core_1.jsonb)("output_fields"), // Schema for the output fields
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// App integrations table
exports.appIntegrations = (0, pg_core_1.pgTable)("app_integrations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.text)("icon"),
    category: (0, pg_core_1.text)("category"),
    website: (0, pg_core_1.text)("website"),
    authType: (0, pg_core_1.text)("auth_type"), // api_key, oauth2, basic_auth, etc.
    authConfig: (0, pg_core_1.jsonb)("auth_config"), // Auth configuration (depends on authType)
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// User app credentials table
exports.userAppCredentials = (0, pg_core_1.pgTable)("user_app_credentials", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }, { onDelete: 'cascade' }).notNull(),
    appIntegrationId: (0, pg_core_1.integer)("app_integration_id").references(function () { return exports.appIntegrations.id; }).notNull(),
    credentials: (0, pg_core_1.jsonb)("credentials").notNull(), // Encrypted credentials
    name: (0, pg_core_1.text)("name"), // Optional friendly name for these credentials
    isValid: (0, pg_core_1.boolean)("is_valid").notNull().default(true),
    lastValidatedAt: (0, pg_core_1.timestamp)("last_validated_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Subscription history records table
exports.subscriptionHistory = (0, pg_core_1.pgTable)("subscription_history", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }, { onDelete: 'cascade' }).notNull(),
    subscriptionPlanId: (0, pg_core_1.integer)("subscription_plan_id").references(function () { return exports.subscriptionPlans.id; }).notNull(),
    stripeSubscriptionId: (0, pg_core_1.text)("stripe_subscription_id"),
    stripeInvoiceId: (0, pg_core_1.text)("stripe_invoice_id"),
    billingPeriod: (0, pg_core_1.text)("billing_period").notNull(), // monthly, yearly
    status: (0, pg_core_1.text)("status").notNull(), // active, canceled, past_due, trialing, incomplete
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.text)("currency").notNull(),
    canceledAt: (0, pg_core_1.timestamp)("canceled_at"),
    cancelReason: (0, pg_core_1.text)("cancel_reason"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Workflow Node Executions table
exports.workflowNodeExecutions = (0, pg_core_1.pgTable)("workflow_node_executions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    workflowRunId: (0, pg_core_1.integer)("workflow_run_id").references(function () { return exports.workflowRuns.id; }, { onDelete: 'cascade' }).notNull(),
    nodeId: (0, pg_core_1.text)("node_id").notNull(), // ID of the node in the workflow
    status: (0, pg_core_1.text)("status").notNull(), // pending, running, completed, failed, skipped
    startTime: (0, pg_core_1.timestamp)("start_time"),
    endTime: (0, pg_core_1.timestamp)("end_time"),
    inputData: (0, pg_core_1.jsonb)("input_data"),
    outputData: (0, pg_core_1.jsonb)("output_data"),
    errorMessage: (0, pg_core_1.text)("error_message"),
    errorCategory: (0, pg_core_1.text)("error_category"),
    retryCount: (0, pg_core_1.integer)("retry_count").default(0),
    executionOrder: (0, pg_core_1.integer)("execution_order").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Workflow connections table for storing node connections
exports.workflowConnections = (0, pg_core_1.pgTable)("workflow_connections", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    workflowId: (0, pg_core_1.integer)("workflow_id").references(function () { return exports.workflows.id; }, { onDelete: 'cascade' }),
    sourceNodeId: (0, pg_core_1.text)("source_node_id").notNull(),
    targetNodeId: (0, pg_core_1.text)("target_node_id").notNull(),
    edgeId: (0, pg_core_1.text)("edge_id").notNull().unique(),
    isValid: (0, pg_core_1.boolean)("is_valid").notNull().default(true),
    validationMessage: (0, pg_core_1.text)("validation_message"),
    data: (0, pg_core_1.jsonb)("data").default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Schemas for inserting data
exports.insertWorkspaceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workspaces).pick({
    name: true,
    description: true,
    createdByUserId: true,
});
exports.insertWorkflowSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workflows).pick({
    name: true,
    description: true,
    workspaceId: true,
    createdByUserId: true,
    nodes: true,
    edges: true,
    isPublished: true,
});
exports.insertWorkflowConnectionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workflowConnections).pick({
    workflowId: true,
    sourceNodeId: true,
    targetNodeId: true,
    edgeId: true,
    isValid: true,
    validationMessage: true,
    data: true,
});
// Schema for inserting template categories
exports.insertWorkflowTemplateCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.workflowTemplateCategories).pick({
    name: true,
    displayName: true,
    description: true,
    icon: true,
    count: true,
    isActive: true,
    sortOrder: true,
});
// Schema for inserting workflow templates
exports.insertWorkflowTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workflowTemplates).pick({
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
exports.insertNodeTypeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.nodeTypes).pick({
    name: true,
    displayName: true,
    category: true,
    description: true,
    icon: true,
    color: true,
    inputFields: true,
    outputFields: true,
});
exports.insertAppIntegrationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.appIntegrations).pick({
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
exports.insertUserAppCredentialsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userAppCredentials).pick({
    userId: true,
    appIntegrationId: true,
    credentials: true,
    name: true,
    isValid: true,
});
exports.insertSubscriptionHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.subscriptionHistory).pick({
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
// Form schemas
exports.contactFormSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name is required"),
    email: zod_1.z.string().email("Please enter a valid email address"),
    company: zod_1.z.string().optional(),
    message: zod_1.z.string().min(10, "Message must be at least 10 characters"),
});
exports.templateRequestSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title is required"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    category: zod_1.z.string().min(1, "Category is required"),
    useCase: zod_1.z.string().min(10, "Use case must be at least 10 characters"),
    requesterEmail: zod_1.z.string().email("Please enter a valid email address"),
});
exports.templateRequestFormSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name is required"),
    email: zod_1.z.string().email("Please enter a valid email address"),
    company: zod_1.z.string().optional(),
    templateTitle: zod_1.z.string().min(3, "Template title is required"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    category: zod_1.z.string().min(1, "Category is required"),
    useCase: zod_1.z.string().min(10, "Use case must be at least 10 characters"),
});
exports.demoRequestFormSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name is required"),
    email: zod_1.z.string().email("Please enter a valid email address"),
    company: zod_1.z.string().min(2, "Company name is required"),
    jobTitle: zod_1.z.string().min(2, "Job title is required"),
    phoneNumber: zod_1.z.string().optional(),
    teamSize: zod_1.z.string().min(1, "Team size is required"),
    requirements: zod_1.z.string().min(10, "Requirements must be at least 10 characters"),
});
