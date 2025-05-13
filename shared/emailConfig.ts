/**
 * Email Configuration and Feature Flags
 * 
 * This file contains centralized configuration for all email functionality.
 * To enable email notifications, set the respective feature flags to true
 * and ensure SENDGRID_API_KEY is set in your environment variables.
 * 
 * DEVELOPER NOTE: To enable emails, set the appropriate feature flags to true
 * and provide a valid SENDGRID_API_KEY in the environment variables.
 */

export interface EmailConfig {
  // Master switch for all email functionality
  enabled: boolean;
  
  // Sender configuration
  senderEmail: string;
  senderName: string;
  
  // Feature-specific toggles
  features: {
    // Authentication emails
    auth: {
      enabled: boolean;
      sendWelcomeEmail: boolean;
      sendLoginNotification: boolean;
    },
    // Workflow execution emails
    workflows: {
      enabled: boolean;
      notifyOnError: boolean;
      notifyOnSuccess: boolean;
      notifyOnScheduledRun: boolean;
      // How many consecutive errors before sending a notification
      errorThreshold: number;
    },
    // Email notification schedule preferences
    notifications: {
      enabled: boolean;
      // Daily, weekly, monthly digest options
      digestFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
      // Time of day to send digests (in 24h format: 09:00, 14:30, etc.)
      digestTime: string;
    }
  }
}

// Default configuration with emails disabled
export const emailConfig: EmailConfig = {
  // Master switch - set to false by default
  enabled: false,
  
  // Default sender details - update these with your actual information
  senderEmail: 'notifications@pumpflux.com',
  senderName: 'PumpFlux Notifications',
  
  features: {
    auth: {
      enabled: false,
      sendWelcomeEmail: true,
      sendLoginNotification: true,
    },
    workflows: {
      enabled: false,
      notifyOnError: true,
      notifyOnSuccess: false,
      notifyOnScheduledRun: false,
      errorThreshold: 1, // Send notification on first error
    },
    notifications: {
      enabled: false,
      digestFrequency: 'never',
      digestTime: '09:00',
    }
  }
};