/**
 * Seed script to populate initial workflow templates based on customer requirements
 */

import { db } from "../server/db";
import { workflowTemplates } from "../shared/schema";
import { InsertWorkflowTemplate } from "../shared/schema";
import { getNodeConfigById } from "./seed-nodes";
import { sql } from "drizzle-orm";

const safeGet = <T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback: any = {}
) => (obj && obj[key] !== undefined ? obj[key] : fallback);

const templates: InsertWorkflowTemplate[] = [
  {
    name: "Save Facebook Lead Ads to Google Sheets",
    description:
      "Automatically save new leads from Facebook Lead Ads as rows in a Google Sheets spreadsheet for easy tracking and analysis.",
    category: "lead-management",
    tags: ["facebook", "google-sheets", "lead-generation", "marketing"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("facebook-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("facebook-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("facebook-trigger"), "data"),
                "config"
              ),
              form_id: "${form_id}",
              include_fields: ["name", "email", "phone"],
              access_token: "${fb_access_token}",
            },
          },
        },
        {
          ...(function () {
            const nodeConfig = getNodeConfigById("transform-data");
            if (!nodeConfig)
              throw new Error('Node config for "transform-data" not found');
            return {
              ...nodeConfig,
              position: { x: 400, y: 100 },
              data: {
                ...safeGet(nodeConfig, "data"),
                config: {
                  ...safeGet(safeGet(nodeConfig, "data"), "config"),
                  mapping: {
                    "Lead Name": "{{lead.name}}",
                    Email: "{{lead.email}}",
                    Phone: "{{lead.phone}}",
                    Company: "{{lead.company}}",
                    Message: "{{lead.message}}",
                    "Created At": "{{lead.created_time}}",
                    Source: "Facebook Lead Ads",
                  },
                },
              },
            };
          })(),
        },
        {
          ...getNodeConfigById("sheets-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("sheets-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("sheets-action"), "data"),
                "config"
              ),
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"],
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "facebook-trigger", target: "transform-data" },
        { id: "e2-3", source: "transform-data", target: "sheets-action" },
      ],
    },
    imageUrl:
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&q=80",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Send Gmail from Facebook Lead Form Submission",
    description:
      "Automatically send a customized Gmail message to new leads captured through Facebook Lead Ads forms.",
    category: "lead-nurturing",
    tags: ["facebook", "gmail", "email", "lead-generation"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("facebook-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("facebook-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("facebook-trigger"), "data"),
                "config"
              ),
              form_id: "${form_id}",
              include_fields: ["name", "email", "phone"],
              access_token: "${fb_access_token}",
            },
          },
        },
        {
          ...getNodeConfigById("prepare-email"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-email"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-email"), "data"),
                "config"
              ),
              template: {
                subject: "Welcome to ${company_name}!",
                body: "Hi {{lead.name}},\n\nThank you for your interest in our products/services. We received your information and will contact you shortly.\n\nBest regards,\n${company_name}",
                body_type: "text",
              },
            },
          },
        },
        {
          ...getNodeConfigById("gmail-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("gmail-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("gmail-action"), "data"),
                "config"
              ),
              client_id: "${gmail_client_id}",
              client_secret: "${gmail_client_secret}",
              refresh_token: "${gmail_refresh_token}",
              to: "{{lead.email}}",
              subject: "{{template.subject}}",
              body: "{{template.body}}",
              body_type: "text",
              reply_to: "${company_email}",
              headers: {
                "X-Custom-Header": "Facebook Lead",
              },
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "facebook-trigger", target: "prepare-email" },
        { id: "e2-3", source: "prepare-email", target: "gmail-action" },
      ],
    },
    imageUrl:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Send Slack Message for New Facebook Lead",
    description:
      "Post a notification in Slack whenever a new lead comes in from Facebook Lead Ads forms.",
    category: "team-notifications",
    tags: ["facebook", "slack", "lead-generation", "notification"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("facebook-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("facebook-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("facebook-trigger"), "data"),
                "config"
              ),
              form_id: "${form_id}",
              include_fields: ["name", "email", "phone"],
              access_token: "${fb_access_token}",
            },
          },
        },
        {
          ...getNodeConfigById("format-message"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("format-message"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("format-message"), "data"),
                "config"
              ),
              template: {
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: ":tada: *New Lead from Facebook!*\n>Name: {{lead.name}}\n>Email: {{lead.email}}\n>Phone: {{lead.phone}}\n>Form: ${form_name}\n>Submitted: {{formatDate lead.created_time}}",
                    },
                  },
                ],
              },
            },
          },
        },
        {
          ...getNodeConfigById("slack-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("slack-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("slack-action"), "data"),
                "config"
              ),
              channel_id: "${channel_id}",
              bot_token: "${slack_bot_token}",
              message_type: "text",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "facebook-trigger", target: "format-message" },
        { id: "e2-3", source: "format-message", target: "slack-action" },
      ],
    },
    imageUrl: "https://example.com/images/facebook-to-slack.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Generate OpenAI ChatGPT Content from Google Sheets",
    description:
      "Automatically generate AI-driven content using OpenAI ChatGPT based on data in Google Sheets.",
    category: "ai-automation",
    tags: ["openai", "chatgpt", "google-sheets", "content-generation", "ai"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("sheets-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("sheets-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("sheets-trigger"), "data"),
                "config"
              ),
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"],
            },
          },
        },
        {
          ...getNodeConfigById("prepare-prompt"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-prompt"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-prompt"), "data"),
                "config"
              ),
              template: {
                prompt:
                  "Generate a personalized sales email for {{row.name}} from {{row.company}} interested in {{row.interests}} with a budget of {{row.budget}}. Focus on the benefits of our product for their needs.",
                max_tokens: 500,
                temperature: 0.7,
              },
            },
          },
        },
        {
          ...getNodeConfigById("openai-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("openai-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("openai-action"), "data"),
                "config"
              ),
              api_key: "${openai_api_key}",
              model: "gpt-3.5-turbo",
              prompt: "{{template.prompt}}",
              max_tokens: "{{template.max_tokens}}",
              temperature: "{{template.temperature}}",
            },
          },
        },
        {
          ...getNodeConfigById("update-sheet"),
          position: { x: 1000, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("update-sheet"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("update-sheet"), "data"),
                "config"
              ),
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"],
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "sheets-trigger", target: "prepare-prompt" },
        { id: "e2-3", source: "prepare-prompt", target: "openai-action" },
        { id: "e3-4", source: "openai-action", target: "update-sheet" },
      ],
    },
    imageUrl: "https://example.com/images/sheets-to-openai.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Create Anthropic Claude Completions from Google Sheets",
    description:
      "Generate AI content with Anthropic Claude based on rows in Google Sheets for personalized communications or data analysis.",
    category: "ai-automation",
    tags: ["anthropic", "claude", "google-sheets", "content-generation", "ai"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("sheets-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("sheets-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("sheets-trigger"), "data"),
                "config"
              ),
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"],
            },
          },
        },
        {
          ...getNodeConfigById("prepare-prompt"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-prompt"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-prompt"), "data"),
                "config"
              ),
              template: {
                prompt:
                  "${prompt_template}\n\nCustomer data:\nName: {{row.name}}\nProduct interest: {{row.product}}\nPain points: {{row.pain_points}}\nBudget: {{row.budget}}",
              },
            },
          },
        },
        {
          ...getNodeConfigById("claude-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("claude-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("claude-action"), "data"),
                "config"
              ),
              api_key: "${claude_api_key}",
              model: "claude-3-opus-20240229",
              max_tokens: 500,
              temperature: 0.7,
            },
          },
        },
        {
          ...getNodeConfigById("update-sheet"),
          position: { x: 1000, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("update-sheet"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("update-sheet"), "data"),
                "config"
              ),
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"],
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "sheets-trigger", target: "prepare-prompt" },
        { id: "e2-3", source: "prepare-prompt", target: "claude-action" },
        { id: "e3-4", source: "claude-action", target: "update-sheet" },
      ],
    },
    imageUrl: "https://example.com/images/sheets-to-claude.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "AI Web Scraping with Anthropic Claude to Google Sheets",
    description:
      "Use Anthropic Claude to extract and structure data from websites, then store the results in Google Sheets.",
    category: "data-extraction",
    tags: ["anthropic", "claude", "google-sheets", "web-scraping", "ai"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("manual-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("manual-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("manual-trigger"), "data"),
                "config"
              ),
              input_fields: [
                { name: "website_url", type: "string", label: "Website URL" },
                {
                  name: "data_points",
                  type: "string",
                  label: "Data Points to Extract (comma separated)",
                },
              ],
            },
          },
        },
        {
          ...getNodeConfigById("fetch-website"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("fetch-website"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("fetch-website"), "data"),
                "config"
              ),
              url: "{{trigger.website_url}}",
              response_type: "text",
            },
          },
        },
        {
          ...getNodeConfigById("prepare-prompt"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-prompt"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-prompt"), "data"),
                "config"
              ),
              template: {
                prompt:
                  "Extract the following data points from this website content in JSON format: {{trigger.data_points}}\n\nWebsite content:\n{{http.response}}\n\nRespond with a valid JSON object containing the extracted data.",
              },
            },
          },
        },
        {
          ...getNodeConfigById("claude-action"),
          position: { x: 1000, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("claude-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("claude-action"), "data"),
                "config"
              ),
              api_key: "${claude_api_key}",
              model: "claude-3-opus-20240229",
              max_tokens: 1000,
              temperature: 0.2,
              response_format: { type: "json_object" },
            },
          },
        },
        {
          ...getNodeConfigById("parse-json"),
          position: { x: 1300, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("parse-json"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("parse-json"), "data"),
                "config"
              ),
              operation: "parse_json",
              input: "{{claude.response}}",
            },
          },
        },
        {
          ...getNodeConfigById("sheets-action"),
          position: { x: 1600, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("sheets-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("sheets-action"), "data"),
                "config"
              ),
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"],
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "manual-trigger", target: "fetch-website" },
        { id: "e2-3", source: "fetch-website", target: "prepare-prompt" },
        { id: "e3-4", source: "prepare-prompt", target: "claude-action" },
        { id: "e4-5", source: "claude-action", target: "parse-json" },
        { id: "e5-6", source: "parse-json", target: "sheets-action" },
      ],
    },
    imageUrl: "https://example.com/images/web-scraping-claude.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Send Slack Message for New HubSpot Deal",
    description:
      "Notify your team in Slack whenever a new deal is created in HubSpot CRM.",
    category: "team-notifications",
    tags: ["hubspot", "slack", "crm", "sales"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("hubspot-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("hubspot-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("hubspot-trigger"), "data"),
                "config"
              ),
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              include_properties: ["dealname", "amount", "pipeline"],
            },
          },
        },
        {
          ...getNodeConfigById("format-message"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("format-message"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("format-message"), "data"),
                "config"
              ),
              template: {
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: ":moneybag: *New Deal Created in HubSpot!*\n>Deal Name: {{deal.dealname}}\n>Amount: {{formatCurrency deal.amount}}\n>Stage: {{deal.dealstage}}\n>Company: {{deal.company}}\n>Owner: {{deal.owner}}",
                    },
                  },
                ],
              },
            },
          },
        },
        {
          ...getNodeConfigById("slack-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("slack-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("slack-action"), "data"),
                "config"
              ),
              channel_id: "${channel_id}",
              bot_token: "${slack_bot_token}",
              message_type: "text",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "hubspot-trigger", target: "format-message" },
        { id: "e2-3", source: "format-message", target: "slack-action" },
      ],
    },
    imageUrl: "https://example.com/images/hubspot-deal-to-slack.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Send Slack Message for HubSpot Form Submission",
    description:
      "Alert your team in Slack when someone submits a form in HubSpot CRM.",
    category: "team-notifications",
    tags: ["hubspot", "slack", "forms", "lead-generation"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("hubspot-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("hubspot-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("hubspot-trigger"), "data"),
                "config"
              ),
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              form_id: "${form_id}",
            },
          },
        },
        {
          ...getNodeConfigById("format-message"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("format-message"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("format-message"), "data"),
                "config"
              ),
              template:
                ":clipboard: *New HubSpot Form Submission!*\n>Form: ${form_name}\n>Name: {{submission.name}}\n>Email: {{submission.email}}\n>Company: {{submission.company}}\n>Message: {{submission.message}}",
            },
          },
        },
        {
          ...getNodeConfigById("slack-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("slack-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("slack-action"), "data"),
                "config"
              ),
              channel_id: "${channel_id}",
              bot_token: "${slack_bot_token}",
              message_type: "text",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "hubspot-trigger", target: "format-message" },
        { id: "e2-3", source: "format-message", target: "slack-action" },
      ],
    },
    imageUrl: "https://example.com/images/hubspot-form-to-slack.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Create ClickUp Tasks from New HubSpot Contacts",
    description:
      "Automatically create tasks in ClickUp for follow-up when new contacts are added to HubSpot CRM.",
    category: "task-management",
    tags: ["hubspot", "clickup", "crm", "task-automation"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("hubspot-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("hubspot-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("hubspot-trigger"), "data"),
                "config"
              ),
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              include_properties: [
                "firstname",
                "lastname",
                "email",
                "company",
                "phone",
              ],
            },
          },
        },
        {
          ...getNodeConfigById("prepare-task"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-task"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-task"), "data"),
                "config"
              ),
              template: {
                title:
                  "Follow up with new contact: {{contact.firstname}} {{contact.lastname}}",
                description:
                  "A new contact was created in HubSpot:\n\nName: {{contact.firstname}} {{contact.lastname}}\nEmail: {{contact.email}}\nCompany: {{contact.company}}\nPhone: {{contact.phone}}\n\nFollow up with this contact within ${follow_up_days} days.",
                priority: "${priority}",
                status: "to_do",
              },
            },
          },
        },
        {
          ...getNodeConfigById("clickup-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("clickup-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("clickup-action"), "data"),
                "config"
              ),
              api_key: "${clickup_api_key}",
              list_id: "${clickup_list_id}",
              name: "{{template.title}}",
              description: "{{template.description}}",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "hubspot-trigger", target: "prepare-task" },
        { id: "e2-3", source: "prepare-task", target: "clickup-action" },
      ],
    },
    imageUrl: "https://example.com/images/hubspot-to-clickup.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Update HubSpot CRM Record from Airtable Form",
    description:
      "Automatically update records in HubSpot CRM when new submissions come in from Airtable forms.",
    category: "data-synchronization",
    tags: ["hubspot", "airtable", "crm", "form"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("airtable-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("airtable-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("airtable-trigger"), "data"),
                "config"
              ),
              api_key: "${airtable_api_key}",
              base_id: "${airtable_base_id}",
              table_id: "${airtable_table_id}",
            },
          },
        },
        {
          ...getNodeConfigById("search-hubspot"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("search-hubspot"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("search-hubspot"), "data"),
                "config"
              ),
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              email: "{{record.email}}",
            },
          },
        },
        {
          ...getNodeConfigById("prepare-data"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-data"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-data"), "data"),
                "config"
              ),
              mapping: {
                firstname: "{{record.name}}",
                company: "{{record.company}}",
                phone: "{{record.phone}}",
                lifecycle_stage: "{{record.stage}}",
                custom_field: "{{record.custom_data}}",
              },
            },
          },
        },
        {
          ...getNodeConfigById("hubspot-action"),
          position: { x: 1000, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("hubspot-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("hubspot-action"), "data"),
                "config"
              ),
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              contact_id: "{{search.contact_id}}",
              properties: {
                firstname: "{{prepare-data.firstname}}",
                company: "{{prepare-data.company}}",
                phone: "{{prepare-data.phone}}",
                lifecycle_stage: "{{prepare-data.lifecycle_stage}}",
                custom_field: "{{prepare-data.custom_field}}",
              },
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "airtable-trigger", target: "search-hubspot" },
        { id: "e2-3", source: "search-hubspot", target: "prepare-data" },
        { id: "e3-4", source: "prepare-data", target: "hubspot-action" },
      ],
    },
    imageUrl: "https://example.com/images/airtable-to-hubspot.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Create PandaDoc Document from HubSpot Deal Stage Change",
    description:
      "Automatically generate a PandaDoc document when a deal reaches a specific stage in HubSpot CRM.",
    category: "document-automation",
    tags: ["hubspot", "pandadoc", "crm", "sales", "document"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("hubspot-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("hubspot-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("hubspot-trigger"), "data"),
                "config"
              ),
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              target_stage: "${deal_stage}",
              include_properties: [
                "dealname",
                "amount",
                "pipeline",
                "dealstage",
                "company",
                "owner",
                "contacts",
              ],
            },
          },
        },
        {
          ...getNodeConfigById("get-deal-data"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("get-deal-data"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("get-deal-data"), "data"),
                "config"
              ),
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              deal_id: "{{trigger.deal_id}}",
              include_associations: true,
              include_properties: [
                "dealname",
                "amount",
                "pipeline",
                "dealstage",
                "company",
                "owner",
                "contacts",
              ],
            },
          },
        },
        {
          ...getNodeConfigById("create-document"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("create-document"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("create-document"), "data"),
                "config"
              ),
              api_key: "${pandadoc_api_key}",
              template_id: "${template_id}",
              name: "{{deal.dealname}} - Proposal",
              tokens: {
                deal_name: "{{deal.dealname}}",
                amount: "{{formatCurrency deal.amount}}",
                company: "{{deal.company}}",
                owner: "{{deal.owner}}",
                stage: "{{deal.dealstage}}",
              },
              recipients: "{{deal.contacts}}",
              metadata: {
                source: "HubSpot",
                deal_id: "{{deal.id}}",
                stage: "{{deal.dealstage}}",
              },
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "hubspot-trigger", target: "get-deal-data" },
        { id: "e2-3", source: "get-deal-data", target: "create-document" },
      ],
    },
    imageUrl: "https://example.com/images/hubspot-to-pandadoc.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Send Slack Messages for New Pipedrive Activities",
    description:
      "Keep your team updated in Slack about new activities created in Pipedrive CRM.",
    category: "team-notifications",
    tags: ["pipedrive", "slack", "crm", "activity"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("pipedrive-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("pipedrive-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("pipedrive-trigger"), "data"),
                "config"
              ),
              api_key: "${pipedrive_api_key}",
              domain: "${pipedrive_domain}",
              types: "${activity_types}",
            },
          },
        },
        {
          ...getNodeConfigById("format-message"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("format-message"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("format-message"), "data"),
                "config"
              ),
              template:
                ":calendar: *New Pipedrive Activity*\n>Type: {{activity.type}}\n>Title: {{activity.title}}\n>Due Date: {{formatDate activity.due_date}}\n>Deal: {{activity.deal_title}}\n>Person: {{activity.person_name}}\n>Organization: {{activity.org_name}}\n>Assigned to: {{activity.assigned_to_user_name}}",
            },
          },
        },
        {
          ...getNodeConfigById("slack-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("slack-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("slack-action"), "data"),
                "config"
              ),
              channel_id: "${channel_id}",
              bot_token: "${slack_bot_token}",
              message_type: "text",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "pipedrive-trigger", target: "format-message" },
        { id: "e2-3", source: "format-message", target: "slack-action" },
      ],
    },
    imageUrl: "https://example.com/images/pipedrive-to-slack.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Add Pipedrive Deals to Google Sheets",
    description:
      "Automatically track new Pipedrive deals in a Google Sheets spreadsheet for easy reporting and analysis.",
    category: "data-synchronization",
    tags: ["pipedrive", "google-sheets", "crm", "sales"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("pipedrive-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("pipedrive-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("pipedrive-trigger"), "data"),
                "config"
              ),
              api_key: "${pipedrive_api_key}",
              domain: "${pipedrive_domain}",
            },
          },
        },
        {
          ...getNodeConfigById("transform-data"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("transform-data"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("transform-data"), "data"),
                "config"
              ),
              mapping: {
                "Deal Title": "{{deal.title}}",
                Value: "{{deal.value}}",
                Currency: "{{deal.currency}}",
                Stage: "{{deal.stage_name}}",
                Organization: "{{deal.org_name}}",
                "Contact Person": "{{deal.person_name}}",
                "Expected Close Date": "{{deal.expected_close_date}}",
                Owner: "{{deal.owner_name}}",
                "Created Date": "{{deal.add_time}}",
              },
            },
          },
        },
        {
          ...getNodeConfigById("sheets-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("sheets-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("sheets-action"), "data"),
                "config"
              ),
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"],
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "pipedrive-trigger", target: "transform-data" },
        { id: "e2-3", source: "transform-data", target: "sheets-action" },
      ],
    },
    imageUrl: "https://example.com/images/pipedrive-to-sheets.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Create Pipedrive Deals from Google Forms",
    description:
      "Turn Google Forms responses into new deals in Pipedrive CRM to streamline lead capture.",
    category: "lead-management",
    tags: ["pipedrive", "google-forms", "crm", "lead-generation"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("forms-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("forms-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("forms-trigger"), "data"),
                "config"
              ),
              form_id: "${form_id}",
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
            },
          },
        },
        {
          ...getNodeConfigById("search-person"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("search-person"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("search-person"), "data"),
                "config"
              ),
              api_key: "${pipedrive_api_key}",
              domain: "${pipedrive_domain}",
              email: "{{response.email}}",
            },
          },
        },
        {
          ...getNodeConfigById("create-person"),
          position: { x: 700, y: 50 },
          data: {
            ...safeGet(getNodeConfigById("create-person"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("create-person"), "data"),
                "config"
              ),
              api_key: "${pipedrive_api_key}",
              domain: "${pipedrive_domain}",
              name: "{{response.name}}",
            },
          },
        },
        {
          ...getNodeConfigById("prepare-deal"),
          position: { x: 1000, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-deal"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-deal"), "data"),
                "config"
              ),
              template: {
                deal_title:
                  "${deal_title_prefix} - {{response.product_interest}}",
                deal_value: "{{response.budget}}",
                expected_close_date: "{{addDays today 30}}",
              },
            },
          },
        },
        {
          ...getNodeConfigById("create-deal"),
          position: { x: 1300, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("create-deal"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("create-deal"), "data"),
                "config"
              ),
              api_key: "${pipedrive_api_key}",
              domain: "${pipedrive_domain}",
              stage_id: "${stage_id}",
              person_id: "{{search.person_id || create_person.person_id}}",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "forms-trigger", target: "search-person" },
        {
          id: "e2-3a",
          source: "search-person",
          target: "create-person",
          label: "If not found",
        },
        { id: "e2-4", source: "search-person", target: "prepare-deal" },
        { id: "e3-4", source: "create-person", target: "prepare-deal" },
        { id: "e4-5", source: "prepare-deal", target: "create-deal" },
      ],
    },
    imageUrl: "https://example.com/images/forms-to-pipedrive.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Create Mailchimp Subscribers from Google Sheets",
    description:
      "Automatically add new rows from Google Sheets as subscribers to your Mailchimp mailing list.",
    category: "email-marketing",
    tags: ["mailchimp", "google-sheets", "marketing", "email"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("sheets-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("sheets-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("sheets-trigger"), "data"),
                "config"
              ),
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"],
            },
          },
        },
        {
          ...getNodeConfigById("prepare-subscriber"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-subscriber"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-subscriber"), "data"),
                "config"
              ),
              mapping: {
                email_address: "{{row.email}}",
                status: "subscribed",
                merge_fields: {
                  FNAME: "{{row.first_name}}",
                  LNAME: "{{row.last_name}}",
                  COMPANY: "{{row.company}}",
                },
                tags: ["${tags}"],
              },
            },
          },
        },
        {
          ...getNodeConfigById("mailchimp-action"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("mailchimp-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("mailchimp-action"), "data"),
                "config"
              ),
              api_key: "${mailchimp_api_key}",
              server: "${mailchimp_server}",
              list_id: "${mailchimp_list_id}",
              email_address: "{{prepare-subscriber.email_address}}",
              status: "{{prepare-subscriber.status}}",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "sheets-trigger", target: "prepare-subscriber" },
        {
          id: "e2-3",
          source: "prepare-subscriber",
          target: "mailchimp-action",
        },
      ],
    },
    imageUrl: "https://example.com/images/sheets-to-mailchimp.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Create Trello Cards from Salesforce Tasks",
    description:
      "Automatically create Trello cards for new tasks created in Salesforce CRM.",
    category: "task-management",
    tags: ["salesforce", "trello", "crm", "task-automation"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("salesforce-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("salesforce-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("salesforce-trigger"), "data"),
                "config"
              ),
              instance_url: "${salesforce_instance_url}",
              access_token: "${salesforce_access_token}",
              refresh_token: "${salesforce_refresh_token}",
            },
          },
        },
        {
          ...getNodeConfigById("prepare-card"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-card"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-card"), "data"),
                "config"
              ),
              template: {
                name_template: "{{task.subject}}",
                description_template:
                  "**Description:** {{task.description}}\n\n**Related to:** {{task.related_to_name}}\n\n**Due date:** {{formatDate task.due_date}}\n\n**Salesforce URL:** {{task.url}}",
              },
            },
          },
        },
        {
          ...getNodeConfigById("set-due-date"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("set-due-date"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("set-due-date"), "data"),
                "config"
              ),
              mapping: {
                due_date: "{{task.due_date}}",
              },
            },
          },
        },
        {
          ...getNodeConfigById("trello-action"),
          position: { x: 1000, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("trello-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("trello-action"), "data"),
                "config"
              ),
              board_id: "${board_id}",
              list_id: "${list_id}",
              api_key: "${trello_api_key}",
              token: "${trello_token}",
              name: "{{template.name_template}}",
              desc: "{{template.description_template}}",
              due: "{{set-due-date.due_date}}",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "salesforce-trigger", target: "prepare-card" },
        { id: "e2-3", source: "prepare-card", target: "set-due-date" },
        { id: "e3-4", source: "set-due-date", target: "trello-action" },
      ],
    },
    imageUrl: "https://example.com/images/salesforce-to-trello.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Create ClickUp Tasks from Salesforce Opportunities",
    description:
      "Automatically create tasks in ClickUp when new opportunities are added in Salesforce CRM.",
    category: "task-management",
    tags: ["salesforce", "clickup", "crm", "sales", "task-automation"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("salesforce-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("salesforce-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("salesforce-trigger"), "data"),
                "config"
              ),
              instance_url: "${salesforce_instance_url}",
              access_token: "${salesforce_access_token}",
              refresh_token: "${salesforce_refresh_token}",
            },
          },
        },
        {
          ...getNodeConfigById("prepare-task"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("prepare-task"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("prepare-task"), "data"),
                "config"
              ),
              template: {
                title_template:
                  "Follow up on opportunity: {{opportunity.name}}",
                description_template:
                  "A new opportunity was created in Salesforce:\n\nOpportunity: {{opportunity.name}}\nAccount: {{opportunity.account_name}}\nAmount: {{formatCurrency opportunity.amount}}\nStage: {{opportunity.stage}}\nClose Date: {{formatDate opportunity.close_date}}\nOwner: {{opportunity.owner_name}}\n\nNext steps: ${next_steps}",
              },
            },
          },
        },
        {
          ...getNodeConfigById("set-due-date"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("set-due-date"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("set-due-date"), "data"),
                "config"
              ),
              mapping: {
                due_date: "{{addDays today ${follow_up_days}}}",
              },
            },
          },
        },
        {
          ...getNodeConfigById("clickup-action"),
          position: { x: 1000, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("clickup-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("clickup-action"), "data"),
                "config"
              ),
              api_key: "${clickup_api_key}",
              list_id: "${clickup_list_id}",
              name: "{{template.title_template}}",
              description: "{{template.description_template}}",
              due_date: "{{set-due-date.due_date}}",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "salesforce-trigger", target: "prepare-task" },
        { id: "e2-3", source: "prepare-task", target: "set-due-date" },
        { id: "e3-4", source: "set-due-date", target: "clickup-action" },
      ],
    },
    imageUrl: "https://example.com/images/salesforce-to-clickup.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
  {
    name: "Send Slack Message for Closed Salesforce Opportunity",
    description:
      "Notify your team in Slack when an opportunity is closed (won or lost) in Salesforce CRM.",
    category: "team-notifications",
    tags: ["salesforce", "slack", "crm", "sales", "notification"],
    workflowData: {
      nodes: [
        {
          ...getNodeConfigById("salesforce-trigger"),
          position: { x: 100, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("salesforce-trigger"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("salesforce-trigger"), "data"),
                "config"
              ),
              instance_url: "${salesforce_instance_url}",
              access_token: "${salesforce_access_token}",
              refresh_token: "${salesforce_refresh_token}",
              stages: ["Closed Won", "Closed Lost"],
            },
          },
        },
        {
          ...getNodeConfigById("format-message"),
          position: { x: 400, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("format-message"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("format-message"), "data"),
                "config"
              ),
              template:
                "{{#if (eq opportunity.stage 'Closed Won')}}\n:tada: *Opportunity Won!*\n{{else}}\n:disappointed: *Opportunity Lost*\n{{/if}}\n\n>Name: {{opportunity.name}}\n>Account: {{opportunity.account_name}}\n>Amount: {{formatCurrency opportunity.amount}}\n>Close Date: {{formatDate opportunity.close_date}}\n>Owner: {{opportunity.owner_name}}\n{{#if opportunity.description}}\n>Notes: {{opportunity.description}}\n{{/if}}",
            },
          },
        },
        {
          ...getNodeConfigById("determine-channel"),
          position: { x: 700, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("determine-channel"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("determine-channel"), "data"),
                "config"
              ),
              if: "{{eq opportunity.stage 'Closed Won'}}",
              then: {
                channel: "${won_channel_id}",
                emoji: ":tada:",
              },
              else: {
                channel: "${lost_channel_id}",
                emoji: ":disappointed:",
              },
            },
          },
        },
        {
          ...getNodeConfigById("slack-action"),
          position: { x: 1000, y: 100 },
          data: {
            ...safeGet(getNodeConfigById("slack-action"), "data"),
            config: {
              ...safeGet(
                safeGet(getNodeConfigById("slack-action"), "data"),
                "config"
              ),
              channel_id: "{{logic.channel}}",
              bot_token: "${slack_bot_token}",
              message_type: "text",
            },
          },
        },
      ],
      edges: [
        { id: "e1-2", source: "salesforce-trigger", target: "format-message" },
        { id: "e2-3", source: "format-message", target: "determine-channel" },
        { id: "e3-4", source: "determine-channel", target: "slack-action" },
      ],
    },
    imageUrl: "https://example.com/images/salesforce-to-slack.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true,
  },
];

export async function seedTemplates() {
  console.log("Starting template seeding process directly to the database...");

  try {
    // Drop and recreate the workflow_templates table
    await db.execute(sql`DROP TABLE IF EXISTS workflow_templates CASCADE;`);
    await db.execute(sql`
      CREATE TABLE workflow_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        tags TEXT[],
        difficulty TEXT NOT NULL DEFAULT 'beginner',
        "workflowData" JSONB NOT NULL,
        "imageUrl" TEXT,
        popularity INTEGER NOT NULL DEFAULT 0,
        "createdBy" TEXT,
        "createdByUserId" INTEGER REFERENCES users(id),
        "isPublished" BOOLEAN NOT NULL DEFAULT false,
        "isOfficial" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    const existingTemplates = await db
      .select({ name: workflowTemplates.name })
      .from(workflowTemplates);
    const existingNames = new Set(existingTemplates.map((t) => t.name));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const template of templates) {
      try {
        if (existingNames.has(template.name)) {
          console.log(`⏭️ Skipping existing template: ${template.name}`);
          skipCount++;
          continue;
        }
        await db.insert(workflowTemplates).values(template);
        console.log(`✅ Successfully added template: ${template.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding template: ${template.name}`, error);
        errorCount++;
      }
    }

    console.log(`Template seeding process complete.`);
    console.log(
      `Results: ${successCount} added, ${skipCount} skipped, ${errorCount} failed`
    );
  } catch (error) {
    console.error("Error in seed process:", error);
    process.exit(1);
  }
}

seedTemplates()
  .then(() => {
    console.log("Template seeding completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding templates:", err);
    process.exit(1);
  });
