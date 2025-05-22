import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  boolean,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users, workflows } from "./schema";

// Integration platforms supported by the system
export enum IntegrationPlatform {
  WHATSAPP = "whatsapp",
  INSTAGRAM = "instagram",
  FACEBOOK = "facebook",
  TELEGRAM = "telegram",
}

// Integration table for messaging platforms
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform", { enum: Object.values(IntegrationPlatform) }).notNull(),
  apiKey: text("api_key").notNull(),
  phoneNumberId: text("phone_number_id"), // For WhatsApp integrations
  businessAccountId: text("business_account_id"), // For Instagram/Facebook integrations
  webhookUrl: text("webhook_url"), // URL configured for receiving platform webhooks
  webhookSecret: text("webhook_secret"), // Secret for webhook verification
  config: jsonb("config").default({}), // Additional platform-specific configuration
  status: text("status").default("inactive").notNull(),
  lastVerifiedAt: timestamp("last_verified_at"), // Last time credentials were verified
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Message types supported by the system
export enum MessageType {
  INCOMING = "incoming",
  OUTGOING = "outgoing",
}

// Message statuses
export enum MessageStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

// Messages table for storing communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id")
    .notNull()
    .references(() => integrations.id),
  workflowId: integer("workflow_id")
    .references(() => workflows.id, { onDelete: "set null" }),
  messageType: text("message_type", { enum: Object.values(MessageType) }).notNull(),
  content: text("content").notNull(),
  senderId: varchar("sender_id", { length: 100 }).notNull(),
  receiverId: varchar("receiver_id", { length: 100 }).notNull(),
  status: text("status", { enum: Object.values(MessageStatus) })
    .default("pending")
    .notNull(),
  metadata: jsonb("metadata").default({}), // Store platform-specific metadata
  scheduledFor: timestamp("scheduled_for"), // For scheduled messages
  sentAt: timestamp("sent_at"), // When the message was actually sent
  deliveredAt: timestamp("delivered_at"), // When the message was delivered
  readAt: timestamp("read_at"), // When the message was read
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Message action types for logging
export enum MessageAction {
  RECEIVED = "received",
  QUEUED = "queued",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
  RETRY = "retry",
}

// Message logs for tracking history
export const messageLogs = pgTable("message_logs", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  action: text("action", { enum: Object.values(MessageAction) }).notNull(),
  details: text("details"),
  metadata: jsonb("metadata").default({}), // Additional context about the action
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Webhook events received from platforms
export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id")
    .notNull()
    .references(() => integrations.id),
  eventType: text("event_type").notNull(), // Platform-specific event type
  payload: jsonb("payload").notNull(), // Raw webhook payload
  processedAt: timestamp("processed_at"), // When the webhook was processed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Rate limiting and quotas
export const messagingQuotas = pgTable("messaging_quotas", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id")
    .notNull()
    .references(() => integrations.id),
  messagesSent24h: integer("messages_sent_24h").default(0).notNull(),
  messagesLimit24h: integer("messages_limit_24h").notNull(),
  resetAt: timestamp("reset_at").notNull(), // When the quota resets
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Templates for message content
export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  platform: text("platform", { enum: Object.values(IntegrationPlatform) }).notNull(),
  content: text("content").notNull(),
  variables: jsonb("variables").default([]), // List of variables in the template
  isApproved: boolean("is_approved").default(false).notNull(), // For platforms requiring template approval
  externalTemplateId: text("external_template_id"), // ID from messaging platform
  category: text("category"), // Template category/type
  language: text("language").default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Message template versions for tracking changes
export const messageTemplateVersions = pgTable("message_template_versions", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id")
    .notNull()
    .references(() => messageTemplates.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  version: integer("version").notNull(),
  changelog: text("changelog"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for TypeScript type safety
export const insertIntegrationSchema = createInsertSchema(integrations);
export const insertMessageSchema = createInsertSchema(messages);
export const insertMessageLogSchema = createInsertSchema(messageLogs);
export const insertWebhookEventSchema = createInsertSchema(webhookEvents);
export const insertMessageQuotaSchema = createInsertSchema(messagingQuotas);
export const insertMessageTemplateSchema = createInsertSchema(messageTemplates);
export const insertMessageTemplateVersionSchema = createInsertSchema(messageTemplateVersions);

// Types for TypeScript
export type Integration = typeof integrations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageLog = typeof messageLogs.$inferSelect;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type MessageQuota = typeof messagingQuotas.$inferSelect;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type MessageTemplateVersion = typeof messageTemplateVersions.$inferSelect;
