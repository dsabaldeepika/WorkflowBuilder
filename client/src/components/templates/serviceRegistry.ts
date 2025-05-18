import { LucideIcon } from "lucide-react";
import { Database, MessageSquare, FileText, Mail, Calendar } from "lucide-react";

export interface ServiceField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "boolean";
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface FieldValidation {
  type: "string" | "number";
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface ServiceDefinition {
  name: string;
  description: string;
  icon: LucideIcon;
    requiredFields: string[];
  fields?: ServiceField[];
  fieldValidations?: Record<string, FieldValidation>;
  }

export const SERVICE_REGISTRY: Record<string, ServiceDefinition> = {
  "google-sheets": {
    name: "Google Sheets",
    description: "Connect to Google Sheets to read and write data",
    icon: FileText,
    requiredFields: ["spreadsheet_id", "sheet_name"],
    fields: [
      {
        name: "spreadsheet_id",
        label: "Spreadsheet ID",
        type: "text",
        required: true,
        placeholder: "Enter your Google Sheets ID",
        help: "The ID can be found in the URL of your Google Sheet",
      },
      {
        name: "sheet_name",
        label: "Sheet Name",
        type: "text",
        required: true,
        placeholder: "Enter the sheet name",
        help: "The name of the sheet you want to work with",
      },
      {
        name: "range",
        label: "Range",
        type: "text",
        placeholder: "A1:B10",
        help: "Optional range to read/write data",
      },
    ],
    fieldValidations: {
      spreadsheet_id: {
        type: "string",
        minLength: 10,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9-_]+$/,
        message: "Invalid spreadsheet ID format",
      },
      sheet_name: {
        type: "string",
        minLength: 1,
        maxLength: 50,
      },
    },
  },
  "facebook": {
    name: "Facebook",
    description: "Connect to Facebook to interact with pages and ads",
    icon: MessageSquare,
    requiredFields: ["page_id", "access_token"],
    fields: [
      {
        name: "page_id",
        label: "Page ID",
        type: "text",
        required: true,
        placeholder: "Enter your Facebook Page ID",
        help: "The ID of your Facebook Page",
      },
      {
        name: "access_token",
        label: "Access Token",
        type: "text",
        required: true,
        placeholder: "Enter your Facebook Access Token",
        help: "Your Facebook API access token",
      },
    ],
    fieldValidations: {
      page_id: {
        type: "string",
        minLength: 5,
        maxLength: 50,
        pattern: /^[0-9]+$/,
        message: "Page ID must be numeric",
      },
      access_token: {
        type: "string",
        minLength: 50,
        maxLength: 500,
      },
    },
  },
  "slack": {
    name: "Slack",
    description: "Connect to Slack to send messages and notifications",
    icon: MessageSquare,
    requiredFields: ["channel_id", "bot_token"],
    fields: [
      {
        name: "channel_id",
        label: "Channel ID",
        type: "text",
        required: true,
        placeholder: "Enter your Slack Channel ID",
        help: "The ID of the channel to send messages to",
      },
      {
        name: "bot_token",
        label: "Bot Token",
        type: "text",
        required: true,
        placeholder: "Enter your Slack Bot Token",
        help: "Your Slack bot's OAuth token",
      },
    ],
    fieldValidations: {
      channel_id: {
        type: "string",
        minLength: 5,
        maxLength: 20,
        pattern: /^[A-Z0-9]+$/,
        message: "Invalid channel ID format",
      },
      bot_token: {
        type: "string",
        minLength: 50,
        maxLength: 500,
      },
    },
  },
  "hubspot": {
    name: "HubSpot",
    description: "Connect to HubSpot CRM to manage contacts and deals",
    icon: Database,
    requiredFields: ["api_key"],
    fields: [
      {
        name: "api_key",
        label: "API Key",
        type: "text",
        required: true,
        placeholder: "Enter your HubSpot API Key",
        help: "Your HubSpot API key",
      },
      {
        name: "portal_id",
        label: "Portal ID",
        type: "text",
        placeholder: "Enter your HubSpot Portal ID",
        help: "Optional: Your HubSpot portal ID",
      },
    ],
    fieldValidations: {
      api_key: {
        type: "string",
        minLength: 20,
        maxLength: 100,
      },
      portal_id: {
        type: "string",
        pattern: /^[0-9]+$/,
        message: "Portal ID must be numeric",
      },
    },
  },
  "gmail": {
    name: "Gmail",
    description: "Connect to Gmail to send and receive emails",
    icon: Mail,
    requiredFields: ["client_id", "client_secret", "refresh_token"],
    fields: [
      {
        name: "client_id",
        label: "Client ID",
        type: "text",
        required: true,
        placeholder: "Enter your Google Client ID",
        help: "Your Google OAuth client ID",
      },
      {
        name: "client_secret",
        label: "Client Secret",
        type: "text",
        required: true,
        placeholder: "Enter your Google Client Secret",
        help: "Your Google OAuth client secret",
      },
      {
        name: "refresh_token",
        label: "Refresh Token",
        type: "text",
        required: true,
        placeholder: "Enter your Refresh Token",
        help: "Your Google OAuth refresh token",
      },
    ],
    fieldValidations: {
      client_id: {
        type: "string",
        minLength: 20,
        maxLength: 100,
      },
      client_secret: {
        type: "string",
        minLength: 20,
        maxLength: 100,
      },
      refresh_token: {
        type: "string",
        minLength: 50,
        maxLength: 500,
      },
    },
  },
  "openai": {
    name: "OpenAI",
    description: "Connect to OpenAI to use AI models",
    icon: Database,
    requiredFields: ["api_key"],
    fields: [
      {
        name: "api_key",
        label: "API Key",
        type: "text",
        required: true,
        placeholder: "Enter your OpenAI API Key",
        help: "Your OpenAI API key",
      },
      {
        name: "model",
        label: "Model",
        type: "select",
        required: true,
        options: [
          { label: "GPT-4", value: "gpt-4" },
          { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
        ],
        help: "Select the OpenAI model to use",
      },
    ],
    fieldValidations: {
      api_key: {
        type: "string",
        minLength: 20,
        maxLength: 100,
      },
    },
  },
};
