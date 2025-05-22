import axios from 'axios';
import { toast } from 'react-hot-toast';

const BASE_URL = '/api';

export interface MessageTemplate {
  id: number;
  name: string;
  content: string;
  variables: string[];
  language: string;
  category?: string;
  isApproved: boolean;
  approvalStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  integrationId: number;
  externalMessageId?: string;
  content: string;
  contentType: 'text' | 'image' | 'video' | 'document' | 'audio';
  senderId: string;
  recipientId: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MessagingIntegration {
  id: number;
  name: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'telegram';
  authType: 'oauth2' | 'api_key';
  credentials: Record<string, any>;
  webhookSecret?: string;
  webhookUrl?: string;
  rateLimitPerMinute: number;
  quotaUsed: number;
  quotaResetAt: string;
  isActive: boolean;
}

class MessagingService {
  // Message Templates
  async getTemplates(params?: { integrationId?: number; language?: string }) {
    try {
      const { data } = await axios.get<MessageTemplate[]>(`${BASE_URL}/templates`, { params });
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch templates');
      return [];
    }
  }

  async getTemplate(id: number) {
    try {
      const { data } = await axios.get<MessageTemplate>(`${BASE_URL}/templates/${id}`);
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch template');
      return null;
    }
  }

  async createTemplate(template: Partial<MessageTemplate>) {
    try {
      const { data } = await axios.post<MessageTemplate>(`${BASE_URL}/templates`, template);
      toast.success('Template created successfully');
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to create template');
      return null;
    }
  }

  async updateTemplate(id: number, template: Partial<MessageTemplate>) {
    try {
      const { data } = await axios.put<MessageTemplate>(`${BASE_URL}/templates/${id}`, template);
      toast.success('Template updated successfully');
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to update template');
      return null;
    }
  }

  async approveTemplate(id: number) {
    try {
      const { data } = await axios.post<MessageTemplate>(`${BASE_URL}/templates/${id}/approve`);
      toast.success('Template approved successfully');
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to approve template');
      return null;
    }
  }

  async deleteTemplate(id: number) {
    try {
      await axios.delete(`${BASE_URL}/templates/${id}`);
      toast.success('Template deleted successfully');
      return true;
    } catch (error) {
      this.handleError(error, 'Failed to delete template');
      return false;
    }
  }

  // Messages
  async getMessages(params?: { integrationId?: number; direction?: string; status?: string }) {
    try {
      const { data } = await axios.get<Message[]>(`${BASE_URL}/messages`, { params });
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch messages');
      return [];
    }
  }

  async getMessage(id: number) {
    try {
      const { data } = await axios.get<Message>(`${BASE_URL}/messages/${id}`);
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch message');
      return null;
    }
  }

  async sendMessage(message: Partial<Message>) {
    try {
      const { data } = await axios.post<Message>(`${BASE_URL}/messages`, message);
      toast.success('Message sent successfully');
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to send message');
      return null;
    }
  }

  async updateMessageStatus(id: number, status: Message['status']) {
    try {
      const { data } = await axios.patch<Message>(`${BASE_URL}/messages/${id}/status`, { status });
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to update message status');
      return null;
    }
  }

  // Integrations
  async getIntegrations() {
    try {
      const { data } = await axios.get<MessagingIntegration[]>(`${BASE_URL}/messaging/integrations`);
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch integrations');
      return [];
    }
  }

  async createIntegration(integration: Partial<MessagingIntegration>) {
    try {
      const { data } = await axios.post<MessagingIntegration>(
        `${BASE_URL}/messaging/integrations`,
        integration
      );
      toast.success('Integration created successfully');
      return data;
    } catch (error) {
      this.handleError(error, 'Failed to create integration');
      return null;
    }
  }

  private handleError(error: any, defaultMessage: string) {
    const message = error.response?.data?.message || defaultMessage;
    toast.error(message);
    console.error(message, error);
  }
}

export const messagingService = new MessagingService();
