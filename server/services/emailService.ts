/**
 * Email Service
 * 
 * Centralized service for sending all types of emails in the application.
 * Uses SendGrid as the email provider.
 * 
 * All email functionality can be toggled using the configuration in emailConfig.ts
 */

import { MailService } from '@sendgrid/mail';
import { emailConfig } from '@shared/emailConfig';
import winston from 'winston';
import { WorkflowExecution, ExecutionLog } from '@/types/workflow';
import { User } from '@shared/schema';

// Initialize mail service
const mailService = new MailService();

// Only set API key if it exists in environment
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// Logger for email operations
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'email-service' },
  transports: [
    new winston.transports.Console(),
  ],
});

/**
 * Base email interface
 */
interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * User related email interfaces
 */
interface WelcomeEmailParams {
  user: User;
}

interface LoginNotificationParams {
  user: User;
  loginTime: Date;
  ipAddress?: string;
  deviceInfo?: string;
}

/**
 * Workflow related email interfaces
 */
interface WorkflowErrorEmailParams {
  user: User;
  workflow: {
    id: number | string;
    name: string;
  };
  execution: WorkflowExecution;
  error: Error | string;
  logs?: ExecutionLog[];
}

interface WorkflowSuccessEmailParams {
  user: User;
  workflow: {
    id: number | string;
    name: string;
  };
  execution: WorkflowExecution;
  logs?: ExecutionLog[];
}

interface ScheduledRunEmailParams {
  user: User;
  workflow: {
    id: number | string;
    name: string;
  };
  scheduledTime: Date;
}

/**
 * Digest email parameters
 */
interface DigestEmailParams {
  user: User;
  period: 'daily' | 'weekly' | 'monthly';
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    upcomingScheduledRuns: {
      workflowName: string;
      scheduledTime: Date;
    }[];
  }
}

/**
 * Test email parameters
 */
interface TestEmailParams {
  to: string;
}

/**
 * Core function to send emails via SendGrid
 * @param params Email parameters
 * @returns Success status
 */
async function sendEmail(params: EmailParams): Promise<boolean> {
  // If emails are disabled globally, log and return success without sending
  if (!emailConfig.enabled) {
    logger.info('Email sending skipped: Email functionality is disabled', {
      to: params.to,
      subject: params.subject
    });
    return true;
  }

  // If API key is not set, log error and return failure
  if (!process.env.SENDGRID_API_KEY) {
    logger.error('Failed to send email: SendGrid API key is not set', {
      to: params.to,
      subject: params.subject
    });
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: {
        email: emailConfig.senderEmail,
        name: emailConfig.senderName
      },
      subject: params.subject,
      text: params.text,
      html: params.html || params.text, // Fallback to text if HTML is not provided
    });
    
    logger.info('Email sent successfully', {
      to: params.to,
      subject: params.subject
    });
    
    return true;
  } catch (error) {
    logger.error('Failed to send email', {
      error,
      to: params.to,
      subject: params.subject
    });
    
    return false;
  }
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail({ user }: WelcomeEmailParams): Promise<boolean> {
  if (!emailConfig.enabled || !emailConfig.features.auth.enabled || !emailConfig.features.auth.sendWelcomeEmail) {
    logger.info('Welcome email skipped: Feature disabled');
    return true;
  }

  return sendEmail({
    to: user.email,
    subject: 'Welcome to PumpFlux!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Welcome to PumpFlux!</h1>
        <p>Hello ${user.firstName || user.email},</p>
        <p>Thank you for joining PumpFlux. We're excited to have you on board!</p>
        <p>With PumpFlux, you can create powerful automated workflows to streamline your business processes.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.APP_URL || 'https://app.pumpflux.com'}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Get Started</a>
        </div>
        <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
        <p>Best regards,<br>The PumpFlux Team</p>
      </div>
    `,
  });
}

/**
 * Send a login notification email
 */
export async function sendLoginNotificationEmail({ user, loginTime, ipAddress, deviceInfo }: LoginNotificationParams): Promise<boolean> {
  if (!emailConfig.enabled || !emailConfig.features.auth.enabled || !emailConfig.features.auth.sendLoginNotification) {
    logger.info('Login notification email skipped: Feature disabled');
    return true;
  }

  return sendEmail({
    to: user.email,
    subject: 'New Login to Your PumpFlux Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">New Login Detected</h1>
        <p>Hello ${user.firstName || user.email},</p>
        <p>We detected a new login to your PumpFlux account.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Time:</strong> ${loginTime.toLocaleString()}</p>
          ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
          ${deviceInfo ? `<p><strong>Device:</strong> ${deviceInfo}</p>` : ''}
        </div>
        <p>If this was you, you can ignore this email. If you didn't log in recently, please secure your account immediately by changing your password.</p>
        <p>Best regards,<br>The PumpFlux Team</p>
      </div>
    `,
  });
}

/**
 * Send a workflow error notification email
 */
export async function sendWorkflowErrorEmail({ user, workflow, execution, error, logs }: WorkflowErrorEmailParams): Promise<boolean> {
  if (!emailConfig.enabled || !emailConfig.features.workflows.enabled || !emailConfig.features.workflows.notifyOnError) {
    logger.info('Workflow error email skipped: Feature disabled');
    return true;
  }

  const errorMessage = error instanceof Error ? error.message : error;
  
  return sendEmail({
    to: user.email,
    subject: `Workflow Error: ${workflow.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Workflow Error</h1>
        <p>Hello ${user.firstName || user.email},</p>
        <p>Your workflow <strong>${workflow.name}</strong> has encountered an error during execution.</p>
        
        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p><strong>Error:</strong> ${errorMessage}</p>
        </div>
        
        <h3>Execution Details:</h3>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Execution ID:</strong> ${execution.id}</p>
          <p><strong>Start Time:</strong> ${new Date(execution.startTime).toLocaleString()}</p>
          <p><strong>Duration:</strong> ${execution.duration || 'N/A'} ms</p>
        </div>
        
        ${logs && logs.length > 0 ? `
          <h3>Execution Logs:</h3>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0; font-family: monospace; white-space: pre-wrap; font-size: 12px;">
            ${logs.map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`).join('<br>')}
          </div>
        ` : ''}
        
        <div style="margin: 30px 0;">
          <a href="${process.env.APP_URL || 'https://app.pumpflux.com'}/workflows/${workflow.id}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Workflow</a>
        </div>
        
        <p>Best regards,<br>The PumpFlux Team</p>
      </div>
    `,
  });
}

/**
 * Send a workflow success notification email
 */
export async function sendWorkflowSuccessEmail({ user, workflow, execution, logs }: WorkflowSuccessEmailParams): Promise<boolean> {
  if (!emailConfig.enabled || !emailConfig.features.workflows.enabled || !emailConfig.features.workflows.notifyOnSuccess) {
    logger.info('Workflow success email skipped: Feature disabled');
    return true;
  }

  return sendEmail({
    to: user.email,
    subject: `Workflow Successfully Completed: ${workflow.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Workflow Completed Successfully</h1>
        <p>Hello ${user.firstName || user.email},</p>
        <p>Your workflow <strong>${workflow.name}</strong> has completed successfully.</p>
        
        <h3>Execution Details:</h3>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Execution ID:</strong> ${execution.id}</p>
          <p><strong>Start Time:</strong> ${new Date(execution.startTime).toLocaleString()}</p>
          <p><strong>Duration:</strong> ${execution.duration || 'N/A'} ms</p>
        </div>
        
        ${logs && logs.length > 0 ? `
          <h3>Execution Logs:</h3>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0; font-family: monospace; white-space: pre-wrap; font-size: 12px;">
            ${logs.map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`).join('<br>')}
          </div>
        ` : ''}
        
        <div style="margin: 30px 0;">
          <a href="${process.env.APP_URL || 'https://app.pumpflux.com'}/workflows/${workflow.id}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Workflow</a>
        </div>
        
        <p>Best regards,<br>The PumpFlux Team</p>
      </div>
    `,
  });
}

/**
 * Send a scheduled run notification email
 */
export async function sendScheduledRunEmail({ user, workflow, scheduledTime }: ScheduledRunEmailParams): Promise<boolean> {
  if (!emailConfig.enabled || !emailConfig.features.workflows.enabled || !emailConfig.features.workflows.notifyOnScheduledRun) {
    logger.info('Scheduled run email skipped: Feature disabled');
    return true;
  }

  return sendEmail({
    to: user.email,
    subject: `Upcoming Scheduled Workflow: ${workflow.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Upcoming Scheduled Workflow</h1>
        <p>Hello ${user.firstName || user.email},</p>
        <p>Your workflow <strong>${workflow.name}</strong> is scheduled to run soon.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Scheduled Time:</strong> ${scheduledTime.toLocaleString()}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.APP_URL || 'https://app.pumpflux.com'}/workflows/${workflow.id}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Workflow</a>
        </div>
        
        <p>Best regards,<br>The PumpFlux Team</p>
      </div>
    `,
  });
}

/**
 * Send a digest email with workflow stats
 */
export async function sendDigestEmail({ user, period, stats }: DigestEmailParams): Promise<boolean> {
  if (!emailConfig.enabled || !emailConfig.features.notifications.enabled || emailConfig.features.notifications.digestFrequency === 'never') {
    logger.info('Digest email skipped: Feature disabled');
    return true;
  }

  const periodText = period.charAt(0).toUpperCase() + period.slice(1);

  return sendEmail({
    to: user.email,
    subject: `${periodText} Workflow Digest - PumpFlux`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">${periodText} Workflow Digest</h1>
        <p>Hello ${user.firstName || user.email},</p>
        <p>Here's your ${period} digest of workflow activity on PumpFlux:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Workflow Execution Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${stats.totalRuns}</div>
              <div>Total Runs</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 24px; font-weight: bold; color: #10b981;">${stats.successfulRuns}</div>
              <div>Successful</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${stats.failedRuns}</div>
              <div>Failed</div>
            </div>
          </div>
        </div>
        
        ${stats.upcomingScheduledRuns.length > 0 ? `
          <h3>Upcoming Scheduled Runs</h3>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
            ${stats.upcomingScheduledRuns.map(run => `
              <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
                <strong>${run.workflowName}</strong> - ${run.scheduledTime.toLocaleString()}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div style="margin: 30px 0;">
          <a href="${process.env.APP_URL || 'https://app.pumpflux.com'}/workflows" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View All Workflows</a>
        </div>
        
        <p>Best regards,<br>The PumpFlux Team</p>
        
        <div style="margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p>You're receiving this email because you've enabled ${period} digest notifications for your PumpFlux account.</p>
          <p>To change your notification preferences, visit your account settings.</p>
        </div>
      </div>
    `,
  });
}

/**
 * Send a test email to verify email functionality
 */
export async function sendTestEmail({ to }: TestEmailParams): Promise<boolean> {
  // For test emails, we don't check the feature flags
  return sendEmail({
    to,
    subject: 'PumpFlux Email Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Email Test Successful</h1>
        <p>This is a test email from PumpFlux.</p>
        <p>If you're receiving this email, it means your email configuration is working correctly.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Current Email Configuration</h3>
          <p><strong>Email Functionality Enabled:</strong> ${emailConfig.enabled ? 'Yes' : 'No'}</p>
          <p><strong>Auth Emails Enabled:</strong> ${emailConfig.features.auth.enabled ? 'Yes' : 'No'}</p>
          <p><strong>Workflow Emails Enabled:</strong> ${emailConfig.features.workflows.enabled ? 'Yes' : 'No'}</p>
          <p><strong>Digests Enabled:</strong> ${emailConfig.features.notifications.enabled ? 'Yes' : 'No'}</p>
        </div>
        
        <p>Best regards,<br>The PumpFlux Team</p>
      </div>
    `,
  });
}

// Export a single object for all email functions
export const emailService = {
  // Auth related emails
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  
  // Workflow related emails
  sendWorkflowErrorEmail,
  sendWorkflowSuccessEmail,
  sendScheduledRunEmail,
  
  // Digest emails
  sendDigestEmail,
  
  // Test email
  sendTestEmail,
  
  // Utility to check if email functionality is available
  isEnabled: () => {
    return emailConfig.enabled && !!process.env.SENDGRID_API_KEY;
  }
};