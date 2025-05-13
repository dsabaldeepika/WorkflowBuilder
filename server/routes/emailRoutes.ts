/**
 * Email Routes
 * 
 * API routes for managing and testing email functionality.
 * These routes allow testing of different email types and updating email preferences.
 */

import { Router, Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { emailConfig } from '@shared/emailConfig';
import { isAuthenticated } from '../replitAuth';
import { body, validationResult } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Send a test email
 *     description: Sends a test email to verify email functionality is working correctly
 *     tags: [Email]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Test email sent successfully"
 *       400:
 *         description: Invalid email address
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to send email
 */
router.post('/test', 
  isAuthenticated,
  [
    body('email').isEmail().withMessage('Valid email address is required')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;
      
      const success = await emailService.sendTestEmail({ to: email });
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: "Test email sent successfully",
          emailEnabled: emailConfig.enabled,
          emailFeatures: emailConfig.features
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to send test email",
          emailEnabled: emailConfig.enabled
        });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while sending the test email",
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/email/status:
 *   get:
 *     summary: Get email service status
 *     description: Returns the current status and configuration of the email service
 *     tags: [Email]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Email service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: false
 *                 hasApiKey:
 *                   type: boolean
 *                   example: false
 *                 features:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/status', isAuthenticated, (req: Request, res: Response) => {
  res.status(200).json({
    enabled: emailConfig.enabled,
    hasApiKey: !!process.env.SENDGRID_API_KEY,
    features: emailConfig.features,
    senderEmail: emailConfig.senderEmail,
    isReady: emailConfig.enabled && !!process.env.SENDGRID_API_KEY
  });
});

/**
 * @swagger
 * /api/email/templates/welcome:
 *   post:
 *     summary: Test welcome email template
 *     description: Sends a test welcome email to the specified address
 *     tags: [Email]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Test welcome email sent successfully
 *       400:
 *         description: Invalid email address
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to send email
 */
router.post('/templates/welcome', 
  isAuthenticated,
  [
    body('email').isEmail().withMessage('Valid email address is required')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    
    // Create a mock user for the test
    const mockUser = {
      id: '000',
      email,
      firstName: 'Test',
      lastName: 'User',
      profileImageUrl: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      // Force send the email even if disabled
      const originalEnabled = emailConfig.enabled;
      const originalAuthEnabled = emailConfig.features.auth.enabled;
      
      // Override config for testing
      emailConfig.enabled = true;
      emailConfig.features.auth.enabled = true;
      
      const success = await emailService.sendWelcomeEmail({ user: mockUser });
      
      // Restore original config
      emailConfig.enabled = originalEnabled;
      emailConfig.features.auth.enabled = originalAuthEnabled;
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: "Test welcome email sent successfully"
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to send test welcome email"
        });
      }
    } catch (error) {
      console.error('Error sending test welcome email:', error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while sending the test welcome email",
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/email/templates/workflow-error:
 *   post:
 *     summary: Test workflow error email template
 *     description: Sends a test workflow error notification email
 *     tags: [Email]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Test workflow error email sent successfully
 *       400:
 *         description: Invalid email address
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to send email
 */
router.post('/templates/workflow-error', 
  isAuthenticated,
  [
    body('email').isEmail().withMessage('Valid email address is required')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    
    // Create mock data for the test
    const mockUser = {
      id: '000',
      email,
      firstName: 'Test',
      lastName: 'User',
      profileImageUrl: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const mockWorkflow = {
      id: '123',
      name: 'Test Workflow'
    };
    
    const mockExecution = {
      id: 'exec-123',
      workflowId: '123',
      status: 'failed',
      startTime: Date.now(),
      endTime: Date.now() + 5000,
      duration: 5000,
      logs: []
    };
    
    const mockLogs = [
      { timestamp: Date.now() - 4000, message: 'Workflow started', level: 'info' },
      { timestamp: Date.now() - 2000, message: 'Processing node "API Request"', level: 'info' },
      { timestamp: Date.now() - 1000, message: 'Error: Failed to connect to API endpoint', level: 'error' }
    ];
    
    try {
      // Force send the email even if disabled
      const originalEnabled = emailConfig.enabled;
      const originalWorkflowsEnabled = emailConfig.features.workflows.enabled;
      
      // Override config for testing
      emailConfig.enabled = true;
      emailConfig.features.workflows.enabled = true;
      
      const success = await emailService.sendWorkflowErrorEmail({
        user: mockUser,
        workflow: mockWorkflow,
        execution: mockExecution,
        error: 'API Connection Timeout: Failed to connect to the endpoint',
        logs: mockLogs
      });
      
      // Restore original config
      emailConfig.enabled = originalEnabled;
      emailConfig.features.workflows.enabled = originalWorkflowsEnabled;
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: "Test workflow error email sent successfully"
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to send test workflow error email"
        });
      }
    } catch (error) {
      console.error('Error sending test workflow error email:', error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while sending the test workflow error email",
        error: error.message
      });
    }
  }
);

export default router;