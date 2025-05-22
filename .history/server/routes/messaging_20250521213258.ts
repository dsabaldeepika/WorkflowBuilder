import express from 'express';
import { MessagingService } from '../services/messaging.service';
import { logger } from '../utils/logger';
import { z } from 'zod';

const router = express.Router();
const messagingService = new MessagingService();

// Webhook verification for WhatsApp
router.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      logger.info('WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Webhook endpoint for WhatsApp
router.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { body } = req;
    
    if (body.object === 'whatsapp_business_account') {
      await messagingService.handleWebhook(body);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    logger.error('WhatsApp webhook error:', error);
    res.sendStatus(500);
  }
});

// Send message endpoint
router.post('/send', async (req, res) => {
  try {
    const schema = z.object({
      integrationId: z.number(),
      recipientId: z.string(),
      content: z.string(),
      platform: z.enum(['whatsapp', 'instagram'])
    });

    const { integrationId, recipientId, content, platform } = schema.parse(req.body);

    const message = await messagingService.sendMessage(integrationId, recipientId, content);
    res.json(message);
  } catch (error: any) {
    logger.error('Error sending message:', error);
    res.status(400).json({ error: error.message });
  }
});

// Instagram webhook verification
router.get('/webhook/instagram', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
      logger.info('Instagram webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Instagram webhook endpoint
router.post('/webhook/instagram', async (req, res) => {
  try {
    const { body } = req;
    
    if (body.object === 'instagram') {
      await messagingService.handleWebhook(body);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    logger.error('Instagram webhook error:', error);
    res.sendStatus(500);
  }
});

export default router;
