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

/**
 * @swagger
 * /api/email/config:
 *   put:
 *     summary: Update email configuration
 *     description: Updates the email configuration settings
 *     tags: [Email]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Master switch for all email functionality
 *               features:
 *                 type: object
 *                 properties:
 *                   auth:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       sendWelcomeEmail:
 *                         type: boolean
 *                       sendLoginNotification:
 *                         type: boolean
 *                   workflows:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       notifyOnError:
 *                         type: boolean
 *                       notifyOnSuccess:
 *                         type: boolean
 *                       notifyOnScheduledRun:
 *                         type: boolean
 *                       errorThreshold:
 *                         type: number
 *                   notifications:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       digestFrequency:
 *                         type: string
 *                         enum: [never, daily, weekly, monthly]
 *                       digestTime:
 *                         type: string
 *     responses:
 *       200:
 *         description: Email configuration updated successfully
 *       400:
 *         description: Invalid configuration data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update email configuration
 */
router.put('/config', isAuthenticated, (req: Request, res: Response) => {
  try {
    const newConfig = req.body;
    
    // Validate the new configuration
    if (typeof newConfig !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Invalid configuration data"
      });
    }
    
    // Update the configuration
    if (newConfig.enabled !== undefined) {
      emailConfig.enabled = !!newConfig.enabled;
    }
    
    // Update feature configs if present
    if (newConfig.features) {
      // Auth feature config
      if (newConfig.features.auth) {
        const authFeatures = newConfig.features.auth;
        if (authFeatures.enabled !== undefined) {
          emailConfig.features.auth.enabled = !!authFeatures.enabled;
        }
        if (authFeatures.sendWelcomeEmail !== undefined) {
          emailConfig.features.auth.sendWelcomeEmail = !!authFeatures.sendWelcomeEmail;
        }
        if (authFeatures.sendLoginNotification !== undefined) {
          emailConfig.features.auth.sendLoginNotification = !!authFeatures.sendLoginNotification;
        }
      }
      
      // Workflow feature config
      if (newConfig.features.workflows) {
        const workflowFeatures = newConfig.features.workflows;
        if (workflowFeatures.enabled !== undefined) {
          emailConfig.features.workflows.enabled = !!workflowFeatures.enabled;
        }
        if (workflowFeatures.notifyOnError !== undefined) {
          emailConfig.features.workflows.notifyOnError = !!workflowFeatures.notifyOnError;
        }
        if (workflowFeatures.notifyOnSuccess !== undefined) {
          emailConfig.features.workflows.notifyOnSuccess = !!workflowFeatures.notifyOnSuccess;
        }
        if (workflowFeatures.notifyOnScheduledRun !== undefined) {
          emailConfig.features.workflows.notifyOnScheduledRun = !!workflowFeatures.notifyOnScheduledRun;
        }
        if (workflowFeatures.errorThreshold !== undefined && typeof workflowFeatures.errorThreshold === 'number') {
          emailConfig.features.workflows.errorThreshold = Math.max(1, workflowFeatures.errorThreshold);
        }
      }
      
      // Notifications feature config
      if (newConfig.features.notifications) {
        const notificationFeatures = newConfig.features.notifications;
        if (notificationFeatures.enabled !== undefined) {
          emailConfig.features.notifications.enabled = !!notificationFeatures.enabled;
        }
        if (notificationFeatures.digestFrequency !== undefined && 
            ['never', 'daily', 'weekly', 'monthly'].includes(notificationFeatures.digestFrequency)) {
          emailConfig.features.notifications.digestFrequency = notificationFeatures.digestFrequency as 'never' | 'daily' | 'weekly' | 'monthly';
        }
        if (notificationFeatures.digestTime !== undefined && typeof notificationFeatures.digestTime === 'string') {
          // Validate time format (HH:MM)
          if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(notificationFeatures.digestTime)) {
            emailConfig.features.notifications.digestTime = notificationFeatures.digestTime;
          }
        }
      }
    }
    
    // If the API key is not set, warn the user
    const apiKeyStatus = process.env.SENDGRID_API_KEY ? true : false;
    
    return res.status(200).json({
      success: true,
      message: "Email configuration updated successfully",
      config: {
        ...emailConfig,
        // Don't expose email sender details
        senderEmail: emailConfig.senderEmail.replace(/^(.{3}).*(@.*)$/, '$1***$2')
      },
      hasApiKey: apiKeyStatus,
      warning: !apiKeyStatus ? "No SendGrid API key found. Emails will not be sent until an API key is provided." : undefined
    });
    
  } catch (error) {
    console.error('Error updating email configuration:', error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating email configuration",
      error: error.message
    });
  }
});

export default router;