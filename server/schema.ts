import { integer, pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// Define the messaging integrations table
export const messagingIntegrations = pgTable('messaging_integrations', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  platform: text('platform').notNull(), // whatsapp, instagram, facebook, telegram
  authType: text('auth_type').notNull(), // oauth2, api_key
  credentials: jsonb('credentials').notNull(),
  webhookSecret: text('webhook_secret'),
  webhookUrl: text('webhook_url'),
  rateLimitPerMinute: integer('rate_limit_per_minute'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the messages table
export const messages = pgTable('messages', {
  id: integer('id').primaryKey(),
  integrationId: integer('integration_id').references(() => messagingIntegrations.id),
  direction: text('direction').notNull(), // inbound, outbound
  status: text('status').notNull(), // pending, sent, delivered, failed
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  externalId: text('external_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the message templates table
export const messageTemplates = pgTable('message_templates', {
  id: integer('id').primaryKey(),
  integrationId: integer('integration_id').references(() => messagingIntegrations.id),
  name: text('name').notNull(),
  content: text('content').notNull(),
  variables: jsonb('variables'),
  platform: text('platform').notNull(),
  status: text('status').notNull(), // draft, active, archived
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the webhook events table
export const webhookEvents = pgTable('webhook_events', {
  id: integer('id').primaryKey(),
  integrationId: integer('integration_id').references(() => messagingIntegrations.id),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload').notNull(),
  status: text('status').notNull(), // pending, processed, failed
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
