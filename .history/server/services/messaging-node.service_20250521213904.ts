import { db } from '../db';
import { eq } from 'drizzle-orm';
import { messageTemplates } from '@shared/schema-messaging';
import { MessagingService } from './messaging.service';
import { logger } from '../utils/logger';

export class MessagingNodeService {
  private messagingService: MessagingService;

  constructor() {
    this.messagingService = new MessagingService();
  }

  /**
   * Execute a messaging node action in a workflow
   */
  async executeNode(nodeConfig: any, inputData: any) {
    try {
      const { action, config } = nodeConfig;

      switch (action) {
        case 'send_message':
          return await this.handleSendMessage(config, inputData);
        
        case 'send_template':
          return await this.handleSendTemplate(config, inputData);
        
        case 'check_response':
          return await this.handleCheckResponse(config, inputData);
        
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    } catch (error: any) {
      logger.error('Node execution error:', error);
      throw error;
    }
  }

  /**
   * Handle sending a direct message
   */
  private async handleSendMessage(config: any, inputData: any) {
    const {
      integrationId,
      recipient,
      messageContent,
      variables = {}
    } = config;

    // Process variables in message content
    let content = messageContent;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(`{{${key}}}`, String(value));
    });

    // Process any input data variables
    Object.entries(inputData).forEach(([key, value]) => {
      content = content.replace(`{{input.${key}}}`, String(value));
    });

    const message = await this.messagingService.sendMessage(
      integrationId,
      recipient,
      content
    );

    return {
      messageId: message.id,
      status: message.status,
      timestamp: message.createdAt
    };
  }

  /**
   * Handle sending a template message
   */
  private async handleSendTemplate(config: any, inputData: any) {
    const {
      integrationId,
      templateId,
      recipient,
      variables = {}
    } = config;

    // Get template
    const template = await db.query.messageTemplates.findFirst({
      where: eq(messageTemplates.id, templateId)
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Process template variables
    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(`{{${key}}}`, String(value));
    });

    // Process any input data variables
    Object.entries(inputData).forEach(([key, value]) => {
      content = content.replace(`{{input.${key}}}`, String(value));
    });

    const message = await this.messagingService.sendMessage(
      integrationId,
      recipient,
      content
    );

    return {
      messageId: message.id,
      templateId: template.id,
      status: message.status,
      timestamp: message.createdAt
    };
  }

  /**
   * Handle checking for a response to a message
   */
  private async handleCheckResponse(config: any, inputData: any) {
    const {
      integrationId,
      messageId,
      timeout = 300, // 5 minutes default
      conditions = []
    } = config;

    // Check for response message
    const response = await db.query.messages.findFirst({
      where: eq(messages.externalMessageId, messageId),
      orderBy: [{ createdAt: 'desc' }]
    });

    if (!response) {
      return {
        received: false,
        timedOut: true
      };
    }

    // Check conditions if specified
    if (conditions.length > 0) {
      const meetsConditions = conditions.every(condition => {
        switch (condition.type) {
          case 'contains':
            return response.content.toLowerCase().includes(condition.value.toLowerCase());
          case 'equals':
            return response.content.toLowerCase() === condition.value.toLowerCase();
          case 'matches':
            return new RegExp(condition.value).test(response.content);
          default:
            return false;
        }
      });

      return {
        received: true,
        meetsConditions,
        content: response.content,
        timestamp: response.createdAt
      };
    }

    return {
      received: true,
      content: response.content,
      timestamp: response.createdAt
    };
  }
}
