import { Router } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { messagingIntegrations, messages, messageTemplates, webhookEvents } from '../schema';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createIntegrationSchema = z.object({
  name: z.string(),
  platform: z.enum(['whatsapp', 'instagram', 'facebook', 'telegram']),
  authType: z.enum(['oauth2', 'api_key']),
  credentials: z.object({}).passthrough(),
  webhookSecret: z.string().optional(),
  webhookUrl: z.string().optional(),
  rateLimitPerMinute: z.number().optional(),
});

/**
 * @swagger
 * /api/messaging/integrations:
 *   get:
 *     summary: Get all messaging integrations
 *     tags: [Messaging]
 *     responses:
 *       200:
 *         description: List of messaging integrations
 */
router.get('/integrations', async (req, res) => {
  try {
    const allIntegrations = await db
      .select()
      .from(messagingIntegrations)
      .where(eq(messagingIntegrations.isActive, true));
    res.json(allIntegrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ message: 'Failed to fetch integrations' });
  }
});

/**
 * @swagger
 * /api/messaging/integrations/{id}:
 *   get:
 *     summary: Get a specific messaging integration
 *     tags: [Messaging]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/integrations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const integration = await db
      .select()
      .from(messagingIntegrations)
      .where(eq(messagingIntegrations.id, id))
      .limit(1);

    if (!integration.length) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    res.json(integration[0]);
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({ message: 'Failed to fetch integration' });
  }
});

/**
 * @swagger
 * /api/messaging/integrations:
 *   post:
 *     summary: Create a new messaging integration
 *     tags: [Messaging]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - platform
 *               - authType
 *               - credentials
 */
router.post('/integrations', async (req, res) => {
  try {
    const validatedData = createIntegrationSchema.parse(req.body);

    const newIntegration = await db.insert(messagingIntegrations).values({
      name: validatedData.name,
      platform: validatedData.platform,
      authType: validatedData.authType,
      credentials: validatedData.credentials,
      webhookSecret: validatedData.webhookSecret,
      webhookUrl: validatedData.webhookUrl,
      rateLimitPerMinute: validatedData.rateLimitPerMinute,
    }).returning();

    res.status(201).json(newIntegration[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating integration:', error);
    res.status(500).json({ message: 'Failed to create integration' });
  }
});

/**
 * @swagger
 * /api/messaging/integrations/{id}:
 *   put:
 *     summary: Update a messaging integration
 *     tags: [Messaging]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/integrations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = createIntegrationSchema.parse(req.body);

    const updatedIntegration = await db
      .update(messagingIntegrations)
      .set({
        name: validatedData.name,
        platform: validatedData.platform,
        authType: validatedData.authType,
        credentials: validatedData.credentials,
        webhookSecret: validatedData.webhookSecret,
        webhookUrl: validatedData.webhookUrl,
        rateLimitPerMinute: validatedData.rateLimitPerMinute,
        updatedAt: new Date(),
      })
      .where(eq(messagingIntegrations.id, id))
      .returning();

    if (!updatedIntegration.length) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    res.json(updatedIntegration[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating integration:', error);
    res.status(500).json({ message: 'Failed to update integration' });
  }
});

/**
 * @swagger
 * /api/messaging/integrations/{id}:
 *   delete:
 *     summary: Delete a messaging integration
 *     tags: [Messaging]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/integrations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const deleted = await db
      .delete(messagingIntegrations)
      .where(eq(messagingIntegrations.id, id))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({ message: 'Failed to delete integration' });
  }
});

export default router;
