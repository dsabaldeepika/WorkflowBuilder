import { Router } from 'express';
import messagingRoutes from './messagingRoutes';
import messageRoutes from './messageRoutes';
import webhookRoutes from './webhookRoutes';

const router = Router();

// Mount the routes
router.use('/messaging', messagingRoutes);
router.use('/messages', messageRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
