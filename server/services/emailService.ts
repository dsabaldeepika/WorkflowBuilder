import { FEATURE_FLAGS } from '@shared/config';
import { emailConfig } from '@shared/emailConfig';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Email service for sending emails throughout the application
 * Supports different email providers and graceful fallback when disabled
 */
interface WorkflowEmailOptions {
  workflowName: string;
  workflowId: number;
  userId: number;
  userEmail: string;
  error?: string;
  executionData?: any;
}

class EmailService {
  /**
   * Send an email using the configured email provider
   * Currently supports SendGrid or a mock implementation when email is disabled
   * 
   * @param options The email options including recipient, subject, and content
   * @returns A promise resolving to boolean indicating success
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    // If email sending is disabled by feature flag, just log and return success
    if (!FEATURE_FLAGS.enableEmail) {
      console.log('[EMAIL DISABLED] Would have sent email:', {
        to: options.to,
        subject: options.subject,
        // Log a preview of the text content
        textPreview: options.text.substring(0, 100) + (options.text.length > 100 ? '...' : '')
      });
      return true;
    }

    try {
      if (emailConfig.provider === 'sendgrid') {
        // Import SendGrid only if we're actually using it
        // This keeps the dependency optional
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(emailConfig.sendgrid.apiKey);
        
        await sgMail.default.send({
          to: options.to,
          from: emailConfig.sendgrid.fromEmail,
          subject: options.subject,
          text: options.text,
          html: options.html || options.text.replace(/\n/g, '<br>')
        });
        
        return true;
      } else {
        // Add other email providers here if needed
        console.warn(`Unsupported email provider: ${emailConfig.provider}`);
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send workflow error notification email
   */
  async sendWorkflowErrorEmail(options: WorkflowEmailOptions): Promise<boolean> {
    if (!FEATURE_FLAGS.enableEmail || !emailConfig.features.workflows.enabled || !emailConfig.features.workflows.notifyOnError) {
      console.log('[EMAIL DISABLED] Would have sent workflow error email for:', options.workflowName);
      return true;
    }

    const subject = `[PumpFlux] Error in workflow: ${options.workflowName}`;
    const text = `
Your workflow "${options.workflowName}" encountered an error during execution.

Error: ${options.error || 'Unknown error'}

You can view more details and troubleshoot this issue in your dashboard:
${process.env.APP_URL || ''}/workflows/${options.workflowId}

Workflow ID: ${options.workflowId}
    `;

    const html = `
<h2>Workflow Error Notification</h2>
<p>Your workflow <strong>${options.workflowName}</strong> encountered an error during execution.</p>

<div style="padding: 12px; background: #fef2f2; border-left: 4px solid #ef4444; margin: 16px 0;">
  <strong>Error:</strong> ${options.error || 'Unknown error'}
</div>

<p>You can view more details and troubleshoot this issue in your dashboard:</p>
<p><a href="${process.env.APP_URL || ''}/workflows/${options.workflowId}">View Workflow Details</a></p>

<p><small>Workflow ID: ${options.workflowId}</small></p>
    `;

    return this.sendEmail({
      to: options.userEmail,
      subject,
      text,
      html
    });
  }

  /**
   * Send workflow success notification email
   */
  async sendWorkflowSuccessEmail(options: WorkflowEmailOptions): Promise<boolean> {
    if (!FEATURE_FLAGS.enableEmail || !emailConfig.features.workflows.enabled || !emailConfig.features.workflows.notifyOnSuccess) {
      console.log('[EMAIL DISABLED] Would have sent workflow success email for:', options.workflowName);
      return true;
    }

    const subject = `[PumpFlux] Workflow completed successfully: ${options.workflowName}`;
    const text = `
Your workflow "${options.workflowName}" completed successfully.

You can view the execution details in your dashboard:
${process.env.APP_URL || ''}/workflows/${options.workflowId}

Workflow ID: ${options.workflowId}
    `;

    const html = `
<h2>Workflow Success Notification</h2>
<p>Your workflow <strong>${options.workflowName}</strong> completed successfully.</p>

<div style="padding: 12px; background: #f0fdf4; border-left: 4px solid #22c55e; margin: 16px 0;">
  <strong>Status:</strong> Completed successfully
</div>

<p>You can view the execution details in your dashboard:</p>
<p><a href="${process.env.APP_URL || ''}/workflows/${options.workflowId}">View Workflow Details</a></p>

<p><small>Workflow ID: ${options.workflowId}</small></p>
    `;

    return this.sendEmail({
      to: options.userEmail,
      subject,
      text,
      html
    });
  }

  /**
   * Send scheduled workflow run notification email
   */
  async sendScheduledRunEmail(options: WorkflowEmailOptions): Promise<boolean> {
    if (!FEATURE_FLAGS.enableEmail || !emailConfig.features.workflows.enabled || !emailConfig.features.workflows.notifyOnScheduledRun) {
      console.log('[EMAIL DISABLED] Would have sent scheduled run email for:', options.workflowName);
      return true;
    }

    const subject = `[PumpFlux] Scheduled workflow started: ${options.workflowName}`;
    const text = `
Your scheduled workflow "${options.workflowName}" has started running.

You can monitor the execution in your dashboard:
${process.env.APP_URL || ''}/workflows/${options.workflowId}

Workflow ID: ${options.workflowId}
    `;

    const html = `
<h2>Scheduled Workflow Notification</h2>
<p>Your scheduled workflow <strong>${options.workflowName}</strong> has started running.</p>

<div style="padding: 12px; background: #eff6ff; border-left: 4px solid #3b82f6; margin: 16px 0;">
  <strong>Status:</strong> Running
</div>

<p>You can monitor the execution in your dashboard:</p>
<p><a href="${process.env.APP_URL || ''}/workflows/${options.workflowId}">View Workflow Details</a></p>

<p><small>Workflow ID: ${options.workflowId}</small></p>
    `;

    return this.sendEmail({
      to: options.userEmail,
      subject,
      text,
      html
    });
  }
}

// Export a singleton instance of the email service
export const emailService = new EmailService();

// Export the send function directly for backward compatibility
export const sendEmail = (options: EmailOptions) => emailService.sendEmail(options);