import { Router } from 'express';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { messages, messagingIntegrations } from '../schema';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createMessageSchema = z.object({
  integrationId: z.number(),
  externalMessageId: z.string().optional(),
  content: z.string(),
  contentType: z.enum(['text', 'image', 'video', 'document', 'audio']),
  senderId: z.string(),
  recipientId: z.string(),
  direction: z.enum(['inbound', 'outbound']),
  metadata: z.object({}).passthrough().optional(),
});

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get all messages
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: integrationId
 *         schema:
 *           type: integer
 *         description: Filter by integration ID
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [inbound, outbound]
 *         description: Filter by message direction
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, delivered, read, failed]
 *         description: Filter by message status
 */
router.get('/', async (req, res) => {
  try {
    const { integrationId, direction, status } = req.query;
    
    let query = db.select().from(messages);
    
    if (integrationId) {
      query = query.where(eq(messages.integrationId, parseInt(integrationId as string)));
    }
    if (direction) {
      query = query.where(eq(messages.direction, direction as string));
    }
    if (status) {
      query = query.where(eq(messages.status, status as string));
    }

    const allMessages = await query.orderBy(desc(messages.createdAt));
    res.json(allMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get a specific message
 *     tags: [Messages]
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
    const message = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);

    if (!message.length) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message[0]);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Failed to fetch message' });
  }
});

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Create a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - integrationId
 *               - content
 *               - contentType
 *               - senderId
 *               - recipientId
 *               - direction
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = createMessageSchema.parse(req.body);

    // Check if integration exists and is active
    const integration = await db
      .select()
      .from(messagingIntegrations)
      .where(and(
        eq(messagingIntegrations.id, validatedData.integrationId),
        eq(messagingIntegrations.isActive, true)
      ))
      .limit(1);

    if (!integration.length) {
      return res.status(400).json({ message: 'Invalid or inactive integration' });
    }

    const newMessage = await db.insert(messages).values({
      integrationId: validatedData.integrationId,
      externalMessageId: validatedData.externalMessageId,
      content: validatedData.content,
      contentType: validatedData.contentType,
      senderId: validatedData.senderId,
      recipientId: validatedData.recipientId,
      direction: validatedData.direction,
      status: 'pending',
      metadata: validatedData.metadata || {},
    }).returning();

    res.status(201).json(newMessage[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Failed to create message' });
  }
});

/**
 * @swagger
 * /api/messages/{id}/status:
 *   patch:
 *     summary: Update message status
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!['pending', 'sent', 'delivered', 'read', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedMessage = await db
      .update(messages)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, id))
      .returning();

    if (!updatedMessage.length) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(updatedMessage[0]);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ message: 'Failed to update message status' });
  }
});

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const deleted = await db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

export default router;
