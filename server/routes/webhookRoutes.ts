import { Router } from 'express';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { webhookEvents, messagingIntegrations } from '../schema';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createWebhookEventSchema = z.object({
  integrationId: z.number(),
  eventType: z.string(),
  payload: z.object({}).passthrough(),
});

/**
 * @swagger
 * /api/webhooks:
 *   get:
 *     summary: Get all webhook events
 *     tags: [Webhooks]
 *     parameters:
 *       - in: query
 *         name: integrationId
 *         schema:
 *           type: integer
 *         description: Filter by integration ID
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filter by event type
 *       - in: query
 *         name: processed
 *         schema:
 *           type: boolean
 *         description: Filter by processed status
 */
router.get('/', async (req, res) => {
  try {
    const { integrationId, eventType, processed } = req.query;
    
    let query = db.select().from(webhookEvents);
    
    if (integrationId) {
      query = query.where(eq(webhookEvents.integrationId, parseInt(integrationId as string)));
    }
    if (eventType) {
      query = query.where(eq(webhookEvents.eventType, eventType as string));
    }
    if (processed !== undefined) {
      query = query.where(eq(webhookEvents.processed, processed === 'true'));
    }

    const events = await query.orderBy(desc(webhookEvents.createdAt));
    res.json(events);
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    res.status(500).json({ message: 'Failed to fetch webhook events' });
  }
});

/**
 * @swagger
 * /api/webhooks/{id}:
 *   get:
 *     summary: Get a specific webhook event
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const event = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.id, id))
      .limit(1);

    if (!event.length) {
      return res.status(404).json({ message: 'Webhook event not found' });
    }

    res.json(event[0]);
  } catch (error) {
    console.error('Error fetching webhook event:', error);
    res.status(500).json({ message: 'Failed to fetch webhook event' });
  }
});

/**
 * @swagger
 * /api/webhooks/{integrationId}:
 *   post:
 *     summary: Create a new webhook event
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: integrationId
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:integrationId', async (req, res) => {
  try {
    const integrationId = parseInt(req.params.integrationId);

    // Verify the integration exists and get its webhook secret
    const integration = await db
      .select()
      .from(messagingIntegrations)
      .where(and(
        eq(messagingIntegrations.id, integrationId),
        eq(messagingIntegrations.isActive, true)
      ))
      .limit(1);

    if (!integration.length) {
      return res.status(404).json({ message: 'Integration not found or inactive' });
    }

    // Verify webhook signature if secret exists
    if (integration[0].webhookSecret) {
      const signature = req.headers['x-webhook-signature'];
      if (!signature || !verifyWebhookSignature(req.body, integration[0].webhookSecret, signature as string)) {
        return res.status(401).json({ message: 'Invalid webhook signature' });
      }
    }

    const validatedData = createWebhookEventSchema.parse({
      ...req.body,
      integrationId,
    });

    const newEvent = await db.insert(webhookEvents).values({
      integrationId: validatedData.integrationId,
      eventType: validatedData.eventType,
      payload: validatedData.payload,
      processed: false,
    }).returning();

    // Process the webhook asynchronously
    processWebhookEvent(newEvent[0]).catch(error => {
      console.error('Error processing webhook event:', error);
    });

    res.status(201).json(newEvent[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating webhook event:', error);
    res.status(500).json({ message: 'Failed to create webhook event' });
  }
});

/**
 * @swagger
 * /api/webhooks/{id}/retry:
 *   post:
 *     summary: Retry processing a failed webhook event
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/retry', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const event = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.id, id))
      .limit(1);

    if (!event.length) {
      return res.status(404).json({ message: 'Webhook event not found' });
    }

    // Reset processing status
    await db
      .update(webhookEvents)
      .set({
        processed: false,
        processingErrors: [],
        processedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(webhookEvents.id, id));

    // Process the webhook asynchronously
    processWebhookEvent(event[0]).catch(error => {
      console.error('Error processing webhook event:', error);
    });

    res.json({ message: 'Webhook event processing retry initiated' });
  } catch (error) {
    console.error('Error retrying webhook event:', error);
    res.status(500).json({ message: 'Failed to retry webhook event' });
  }
});

// Helper function to verify webhook signatures
function verifyWebhookSignature(payload: any, secret: string, signature: string): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

// Helper function to process webhook events
async function processWebhookEvent(event: any) {
  try {
    // Process based on event type
    switch (event.eventType) {
      case 'message.status':
        await handleMessageStatusUpdate(event);
        break;
      case 'message.received':
        await handleIncomingMessage(event);
        break;
      // Add more event type handlers as needed
    }

    // Mark as processed
    await db
      .update(webhookEvents)
      .set({
        processed: true,
        processedAt: new Date(),
      })
      .where(eq(webhookEvents.id, event.id));
  } catch (error) {
    // Record processing error
    await db
      .update(webhookEvents)
      .set({
        processingErrors: [...(event.processingErrors || []), error.message],
        updatedAt: new Date(),
      })
      .where(eq(webhookEvents.id, event.id));
    throw error;
  }
}

// Event type handlers
async function handleMessageStatusUpdate(event: any) {
  // Implementation for handling message status updates
}

async function handleIncomingMessage(event: any) {
  // Implementation for handling incoming messages
}

export default router;
