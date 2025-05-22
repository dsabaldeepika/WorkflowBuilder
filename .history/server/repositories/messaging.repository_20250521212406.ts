import { eq, and, lt, desc } from "drizzle-orm";
import { db } from "../db";
import {
  integrations,
  messages,
  messageLogs,
  webhookEvents,
  messagingQuotas,
  messageTemplates,
  messageTemplateVersions,
  type Integration,
  type Message,
  type MessageLog,
  type WebhookEvent,
  type MessageQuota,
  type MessageTemplate,
  IntegrationPlatform,
  MessageType,
  MessageStatus,
} from "../../shared/schema-messaging";

export class MessagingRepository {
  // Integration methods
  async createIntegration(data: Omit<Integration, "id" | "createdAt" | "updatedAt">) {
    const [integration] = await db
      .insert(integrations)
      .values(data)
      .returning();
    return integration;
  }

  async updateIntegration(
    id: number,
    data: Partial<Omit<Integration, "id" | "createdAt" | "updatedAt">>
  ) {
    const [integration] = await db
      .update(integrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return integration;
  }

  async getIntegrationById(id: number) {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id));
    return integration;
  }

  async getIntegrationsByUserId(userId: number) {
    return db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, userId));
  }

  // Message methods
  async createMessage(data: Omit<Message, "id" | "createdAt">) {
    const [message] = await db
      .insert(messages)
      .values(data)
      .returning();
    return message;
  }

  async updateMessageStatus(id: number, status: MessageStatus, statusTimestamp?: Date) {
    const updates: Partial<Message> = { status };
    
    switch (status) {
      case MessageStatus.SENT:
        updates.sentAt = statusTimestamp || new Date();
        break;
      case MessageStatus.DELIVERED:
        updates.deliveredAt = statusTimestamp || new Date();
        break;
      case MessageStatus.READ:
        updates.readAt = statusTimestamp || new Date();
        break;
    }

    const [message] = await db
      .update(messages)
      .set(updates)
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async getMessageById(id: number) {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }

  async getMessagesByIntegrationId(integrationId: number, limit = 50) {
    return db
      .select()
      .from(messages)
      .where(eq(messages.integrationId, integrationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  // Message Logs
  async createMessageLog(data: Omit<MessageLog, "id" | "timestamp">) {
    const [log] = await db
      .insert(messageLogs)
      .values(data)
      .returning();
    return log;
  }

  async getMessageLogs(messageId: number) {
    return db
      .select()
      .from(messageLogs)
      .where(eq(messageLogs.messageId, messageId))
      .orderBy(desc(messageLogs.timestamp));
  }

  // Webhook Events
  async createWebhookEvent(data: Omit<WebhookEvent, "id" | "createdAt">) {
    const [event] = await db
      .insert(webhookEvents)
      .values(data)
      .returning();
    return event;
  }

  async markWebhookEventProcessed(id: number) {
    const [event] = await db
      .update(webhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(webhookEvents.id, id))
      .returning();
    return event;
  }

  // Message Templates
  async createMessageTemplate(data: Omit<MessageTemplate, "id" | "createdAt" | "updatedAt">) {
    const [template] = await db
      .insert(messageTemplates)
      .values(data)
      .returning();
    return template;
  }

  async updateMessageTemplate(
    id: number,
    data: Partial<Omit<MessageTemplate, "id" | "createdAt" | "updatedAt">>
  ) {
    const [template] = await db
      .update(messageTemplates)
      .set({ ...data, updatedAt: new Date() })
      .returning();
    return template;
  }

  async getMessageTemplateById(id: number) {
    const [template] = await db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.id, id));
    return template;
  }

  async getMessageTemplatesByUserId(userId: number) {
    return db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.userId, userId));
  }

  // Messaging Quotas
  async getQuota(integrationId: number) {
    const [quota] = await db
      .select()
      .from(messagingQuotas)
      .where(eq(messagingQuotas.integrationId, integrationId));
    return quota;
  }

  async incrementQuota(integrationId: number) {
    const [quota] = await db
      .update(messagingQuotas)
      .set({
        messagesSent24h: messagingQuotas.messagesSent24h + 1,
        updatedAt: new Date(),
      })
      .where(eq(messagingQuotas.integrationId, integrationId))
      .returning();
    return quota;
  }

  async resetExpiredQuotas() {
    return db
      .update(messagingQuotas)
      .set({
        messagesSent24h: 0,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reset in 24 hours
        updatedAt: new Date(),
      })
      .where(lt(messagingQuotas.resetAt, new Date()));
  }
}
