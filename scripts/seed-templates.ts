/**
 * Seed script to populate initial workflow templates based on customer requirements
 */

import { db } from '../server/db';
import { workflowTemplates } from '../shared/schema';
import { InsertWorkflowTemplate } from '../shared/schema';

const templates: InsertWorkflowTemplate[] = [
  {
    name: "Save Facebook Lead Ads to Google Sheets",
    description: "Automatically save new leads from Facebook Lead Ads as rows in a Google Sheets spreadsheet for easy tracking and analysis.",
    category: "lead-management",
    tags: ["facebook", "google-sheets", "lead-generation", "marketing"],
    nodes: JSON.stringify([
      {
        id: "facebook-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "facebook",
          event: "new_lead",
          config: { form_id: "${form_id}" }
        }
      },
      {
        id: "transform-data",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "transform",
          config: { 
            mapping: {
              "name": "{{lead.name}}",
              "email": "{{lead.email}}",
              "phone": "{{lead.phone}}",
              "created_at": "{{lead.created_time}}"
            }
          }
        }
      },
      {
        id: "sheets-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "google-sheets",
          action: "append_row",
          config: { 
            spreadsheet_id: "${spreadsheet_id}",
            sheet_name: "${sheet_name}"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "facebook-trigger", target: "transform-data" },
      { id: "e2-3", source: "transform-data", target: "sheets-action" }
    ]),
    coverImage: "https://example.com/images/facebook-to-sheets.png",
    complexity: "simple",
    estimatedDuration: "5 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Send Gmail from Facebook Lead Form Submission",
    description: "Automatically send a customized Gmail message to new leads captured through Facebook Lead Ads forms.",
    category: "lead-nurturing",
    tags: ["facebook", "gmail", "email", "lead-generation"],
    nodes: JSON.stringify([
      {
        id: "facebook-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "facebook",
          event: "new_lead",
          config: { form_id: "${form_id}" }
        }
      },
      {
        id: "prepare-email",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            template: "Hi {{lead.name}},\n\nThank you for your interest in our products/services. We received your information and will contact you shortly.\n\nBest regards,\n${company_name}"
          }
        }
      },
      {
        id: "gmail-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "gmail",
          action: "send_email",
          config: { 
            to: "{{lead.email}}",
            subject: "${email_subject}",
            body_type: "text"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "facebook-trigger", target: "prepare-email" },
      { id: "e2-3", source: "prepare-email", target: "gmail-action" }
    ]),
    coverImage: "https://example.com/images/facebook-to-gmail.png",
    complexity: "simple",
    estimatedDuration: "5 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Send Slack Message for New Facebook Lead",
    description: "Post a notification in Slack whenever a new lead comes in from Facebook Lead Ads forms.",
    category: "team-notifications",
    tags: ["facebook", "slack", "lead-generation", "notification"],
    nodes: JSON.stringify([
      {
        id: "facebook-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "facebook",
          event: "new_lead",
          config: { form_id: "${form_id}" }
        }
      },
      {
        id: "format-message",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            template: ":tada: *New Lead from Facebook!*\n>Name: {{lead.name}}\n>Email: {{lead.email}}\n>Phone: {{lead.phone}}\n>Form: ${form_name}\n>Submitted: {{formatDate lead.created_time}}"
          }
        }
      },
      {
        id: "slack-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "slack",
          action: "send_message",
          config: { 
            channel: "${channel_id}",
            message_type: "text"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "facebook-trigger", target: "format-message" },
      { id: "e2-3", source: "format-message", target: "slack-action" }
    ]),
    coverImage: "https://example.com/images/facebook-to-slack.png",
    complexity: "simple",
    estimatedDuration: "5 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Generate OpenAI ChatGPT Content from Google Sheets",
    description: "Automatically generate AI-driven content using OpenAI ChatGPT based on data in Google Sheets.",
    category: "ai-automation",
    tags: ["openai", "chatgpt", "google-sheets", "content-generation", "ai"],
    nodes: JSON.stringify([
      {
        id: "sheets-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "google-sheets",
          event: "new_row",
          config: { 
            spreadsheet_id: "${spreadsheet_id}",
            sheet_name: "${sheet_name}"
          }
        }
      },
      {
        id: "prepare-prompt",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            template: "${prompt_template}\n\nLead information:\nName: {{row.name}}\nCompany: {{row.company}}\nInterests: {{row.interests}}\nBudget: {{row.budget}}"
          }
        }
      },
      {
        id: "openai-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "openai",
          action: "generate_completion",
          config: { 
            model: "gpt-4o",
            max_tokens: 500,
            temperature: 0.7
          }
        }
      },
      {
        id: "update-sheet",
        type: "action",
        position: { x: 1000, y: 100 },
        data: { 
          service: "google-sheets",
          action: "update_row",
          config: { 
            spreadsheet_id: "${spreadsheet_id}",
            sheet_name: "${sheet_name}",
            column_mapping: {
              "ai_generated_content": "{{openai.response}}"
            }
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "sheets-trigger", target: "prepare-prompt" },
      { id: "e2-3", source: "prepare-prompt", target: "openai-action" },
      { id: "e3-4", source: "openai-action", target: "update-sheet" }
    ]),
    coverImage: "https://example.com/images/sheets-to-openai.png",
    complexity: "medium",
    estimatedDuration: "10 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Create Anthropic Claude Completions from Google Sheets",
    description: "Generate AI content with Anthropic Claude based on rows in Google Sheets for personalized communications or data analysis.",
    category: "ai-automation",
    tags: ["anthropic", "claude", "google-sheets", "content-generation", "ai"],
    nodes: JSON.stringify([
      {
        id: "sheets-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "google-sheets",
          event: "new_row",
          config: { 
            spreadsheet_id: "${spreadsheet_id}",
            sheet_name: "${sheet_name}"
          }
        }
      },
      {
        id: "prepare-prompt",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            template: "${prompt_template}\n\nCustomer data:\nName: {{row.name}}\nProduct interest: {{row.product}}\nPain points: {{row.pain_points}}\nBudget: {{row.budget}}"
          }
        }
      },
      {
        id: "claude-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "anthropic",
          action: "generate_completion",
          config: { 
            model: "claude-3-opus-20240229",
            max_tokens: 500,
            temperature: 0.7
          }
        }
      },
      {
        id: "update-sheet",
        type: "action",
        position: { x: 1000, y: 100 },
        data: { 
          service: "google-sheets",
          action: "update_row",
          config: { 
            spreadsheet_id: "${spreadsheet_id}",
            sheet_name: "${sheet_name}",
            column_mapping: {
              "ai_generated_content": "{{claude.response}}"
            }
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "sheets-trigger", target: "prepare-prompt" },
      { id: "e2-3", source: "prepare-prompt", target: "claude-action" },
      { id: "e3-4", source: "claude-action", target: "update-sheet" }
    ]),
    coverImage: "https://example.com/images/sheets-to-claude.png",
    complexity: "medium",
    estimatedDuration: "10 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "AI Web Scraping with Anthropic Claude to Google Sheets",
    description: "Use Anthropic Claude to extract and structure data from websites, then store the results in Google Sheets.",
    category: "data-extraction",
    tags: ["anthropic", "claude", "google-sheets", "web-scraping", "ai"],
    nodes: JSON.stringify([
      {
        id: "manual-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "manual",
          event: "trigger",
          config: { 
            input_fields: [
              { name: "website_url", type: "string", label: "Website URL" },
              { name: "data_points", type: "string", label: "Data Points to Extract (comma separated)" }
            ]
          }
        }
      },
      {
        id: "fetch-website",
        type: "action",
        position: { x: 400, y: 100 },
        data: { 
          service: "http",
          action: "get",
          config: { 
            url: "{{trigger.website_url}}",
            response_type: "text"
          }
        }
      },
      {
        id: "prepare-prompt",
        type: "function",
        position: { x: 700, y: 100 },
        data: { 
          function: "template",
          config: { 
            template: "Extract the following data points from this website content in JSON format: {{trigger.data_points}}\n\nWebsite content:\n{{http.response}}\n\nRespond with a valid JSON object containing the extracted data."
          }
        }
      },
      {
        id: "claude-action",
        type: "action",
        position: { x: 1000, y: 100 },
        data: { 
          service: "anthropic",
          action: "generate_completion",
          config: { 
            model: "claude-3-opus-20240229",
            max_tokens: 1000,
            temperature: 0.2,
            response_format: { type: "json_object" }
          }
        }
      },
      {
        id: "parse-json",
        type: "function",
        position: { x: 1300, y: 100 },
        data: { 
          function: "transform",
          config: { 
            operation: "parse_json",
            input: "{{claude.response}}"
          }
        }
      },
      {
        id: "sheets-action",
        type: "action",
        position: { x: 1600, y: 100 },
        data: { 
          service: "google-sheets",
          action: "append_row",
          config: { 
            spreadsheet_id: "${spreadsheet_id}",
            sheet_name: "${sheet_name}"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "manual-trigger", target: "fetch-website" },
      { id: "e2-3", source: "fetch-website", target: "prepare-prompt" },
      { id: "e3-4", source: "prepare-prompt", target: "claude-action" },
      { id: "e4-5", source: "claude-action", target: "parse-json" },
      { id: "e5-6", source: "parse-json", target: "sheets-action" }
    ]),
    coverImage: "https://example.com/images/web-scraping-claude.png",
    complexity: "complex",
    estimatedDuration: "15 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Send Slack Message for New HubSpot Deal",
    description: "Notify your team in Slack whenever a new deal is created in HubSpot CRM.",
    category: "team-notifications",
    tags: ["hubspot", "slack", "crm", "sales"],
    nodes: JSON.stringify([
      {
        id: "hubspot-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "hubspot",
          event: "new_deal",
          config: { }
        }
      },
      {
        id: "format-message",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            template: ":moneybag: *New Deal Created in HubSpot!*\n>Deal Name: {{deal.name}}\n>Amount: {{formatCurrency deal.amount}}\n>Stage: {{deal.stage}}\n>Company: {{deal.company_name}}\n>Owner: {{deal.owner_name}}"
          }
        }
      },
      {
        id: "slack-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "slack",
          action: "send_message",
          config: { 
            channel: "${channel_id}",
            message_type: "text"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "hubspot-trigger", target: "format-message" },
      { id: "e2-3", source: "format-message", target: "slack-action" }
    ]),
    coverImage: "https://example.com/images/hubspot-deal-to-slack.png",
    complexity: "simple",
    estimatedDuration: "5 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Send Slack Message for HubSpot Form Submission",
    description: "Alert your team in Slack when someone submits a form in HubSpot CRM.",
    category: "team-notifications",
    tags: ["hubspot", "slack", "forms", "lead-generation"],
    nodes: JSON.stringify([
      {
        id: "hubspot-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "hubspot",
          event: "form_submission",
          config: { 
            form_id: "${form_id}"
          }
        }
      },
      {
        id: "format-message",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            template: ":clipboard: *New HubSpot Form Submission!*\n>Form: ${form_name}\n>Name: {{submission.name}}\n>Email: {{submission.email}}\n>Company: {{submission.company}}\n>Message: {{submission.message}}"
          }
        }
      },
      {
        id: "slack-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "slack",
          action: "send_message",
          config: { 
            channel: "${channel_id}",
            message_type: "text"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "hubspot-trigger", target: "format-message" },
      { id: "e2-3", source: "format-message", target: "slack-action" }
    ]),
    coverImage: "https://example.com/images/hubspot-form-to-slack.png",
    complexity: "simple",
    estimatedDuration: "5 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Create ClickUp Tasks from New HubSpot Contacts",
    description: "Automatically create tasks in ClickUp for follow-up when new contacts are added to HubSpot CRM.",
    category: "task-management",
    tags: ["hubspot", "clickup", "crm", "task-automation"],
    nodes: JSON.stringify([
      {
        id: "hubspot-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "hubspot",
          event: "new_contact",
          config: { }
        }
      },
      {
        id: "prepare-task",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            title_template: "Follow up with new contact: {{contact.name}}",
            description_template: "A new contact was created in HubSpot:\n\nName: {{contact.name}}\nEmail: {{contact.email}}\nCompany: {{contact.company}}\nPhone: {{contact.phone}}\n\nFollow up with this contact within ${follow_up_days} days."
          }
        }
      },
      {
        id: "clickup-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "clickup",
          action: "create_task",
          config: { 
            list_id: "${list_id}",
            assignee_id: "${assignee_id}",
            due_date_days: "${follow_up_days}",
            priority: "${priority}"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "hubspot-trigger", target: "prepare-task" },
      { id: "e2-3", source: "prepare-task", target: "clickup-action" }
    ]),
    coverImage: "https://example.com/images/hubspot-to-clickup.png",
    complexity: "medium",
    estimatedDuration: "8 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Update HubSpot CRM Record from Airtable Form",
    description: "Automatically update records in HubSpot CRM when new submissions come in from Airtable forms.",
    category: "data-synchronization",
    tags: ["hubspot", "airtable", "crm", "form"],
    nodes: JSON.stringify([
      {
        id: "airtable-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "airtable",
          event: "new_record",
          config: { 
            base_id: "${base_id}",
            table_id: "${table_id}"
          }
        }
      },
      {
        id: "search-hubspot",
        type: "action",
        position: { x: 400, y: 100 },
        data: { 
          service: "hubspot",
          action: "search_contact",
          config: { 
            email: "{{record.email}}"
          }
        }
      },
      {
        id: "prepare-data",
        type: "function",
        position: { x: 700, y: 100 },
        data: { 
          function: "transform",
          config: { 
            mapping: {
              "firstname": "{{record.name}}",
              "company": "{{record.company}}",
              "phone": "{{record.phone}}",
              "lifecycle_stage": "{{record.stage}}",
              "custom_field": "{{record.custom_data}}"
            }
          }
        }
      },
      {
        id: "hubspot-action",
        type: "action",
        position: { x: 1000, y: 100 },
        data: { 
          service: "hubspot",
          action: "update_contact",
          config: { 
            contact_id: "{{search.contact_id}}"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "airtable-trigger", target: "search-hubspot" },
      { id: "e2-3", source: "search-hubspot", target: "prepare-data" },
      { id: "e3-4", source: "prepare-data", target: "hubspot-action" }
    ]),
    coverImage: "https://example.com/images/airtable-to-hubspot.png",
    complexity: "medium",
    estimatedDuration: "10 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Create PandaDoc Document from HubSpot Deal Stage Change",
    description: "Automatically generate a PandaDoc document when a deal reaches a specific stage in HubSpot CRM.",
    category: "document-automation",
    tags: ["hubspot", "pandadoc", "crm", "sales", "document"],
    nodes: JSON.stringify([
      {
        id: "hubspot-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "hubspot",
          event: "deal_stage_change",
          config: { 
            target_stage: "${deal_stage}"
          }
        }
      },
      {
        id: "get-deal-data",
        type: "action",
        position: { x: 400, y: 100 },
        data: { 
          service: "hubspot",
          action: "get_deal",
          config: { 
            deal_id: "{{trigger.deal_id}}",
            include_associations: true
          }
        }
      },
      {
        id: "prepare-document",
        type: "function",
        position: { x: 700, y: 100 },
        data: { 
          function: "transform",
          config: { 
            document_data: {
              "client_name": "{{deal.associated_company.name}}",
              "contact_name": "{{deal.associated_contact.name}}",
              "deal_name": "{{deal.name}}",
              "deal_amount": "{{deal.amount}}",
              "deal_owner": "{{deal.owner_name}}",
              "expiration_date": "{{addDays today 30}}"
            }
          }
        }
      },
      {
        id: "pandadoc-action",
        type: "action",
        position: { x: 1000, y: 100 },
        data: { 
          service: "pandadoc",
          action: "create_document",
          config: { 
            template_id: "${template_id}",
            email: "{{deal.associated_contact.email}}"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "hubspot-trigger", target: "get-deal-data" },
      { id: "e2-3", source: "get-deal-data", target: "prepare-document" },
      { id: "e3-4", source: "prepare-document", target: "pandadoc-action" }
    ]),
    coverImage: "https://example.com/images/hubspot-to-pandadoc.png",
    complexity: "complex",
    estimatedDuration: "15 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Send Slack Messages for New Pipedrive Activities",
    description: "Keep your team updated in Slack about new activities created in Pipedrive CRM.",
    category: "team-notifications",
    tags: ["pipedrive", "slack", "crm", "activity"],
    nodes: JSON.stringify([
      {
        id: "pipedrive-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "pipedrive",
          event: "new_activity",
          config: { 
            types: "${activity_types}"
          }
        }
      },
      {
        id: "format-message",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            template: ":calendar: *New Pipedrive Activity*\n>Type: {{activity.type}}\n>Title: {{activity.title}}\n>Due Date: {{formatDate activity.due_date}}\n>Deal: {{activity.deal_title}}\n>Person: {{activity.person_name}}\n>Organization: {{activity.org_name}}\n>Assigned to: {{activity.assigned_to_user_name}}"
          }
        }
      },
      {
        id: "slack-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "slack",
          action: "send_message",
          config: { 
            channel: "${channel_id}",
            message_type: "text"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "pipedrive-trigger", target: "format-message" },
      { id: "e2-3", source: "format-message", target: "slack-action" }
    ]),
    coverImage: "https://example.com/images/pipedrive-to-slack.png",
    complexity: "simple",
    estimatedDuration: "5 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Add Pipedrive Deals to Google Sheets",
    description: "Automatically track new Pipedrive deals in a Google Sheets spreadsheet for easy reporting and analysis.",
    category: "data-synchronization",
    tags: ["pipedrive", "google-sheets", "crm", "sales"],
    nodes: JSON.stringify([
      {
        id: "pipedrive-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "pipedrive",
          event: "new_deal",
          config: { }
        }
      },
      {
        id: "transform-data",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "transform",
          config: { 
            mapping: {
              "Deal Title": "{{deal.title}}",
              "Value": "{{deal.value}}",
              "Currency": "{{deal.currency}}",
              "Stage": "{{deal.stage_name}}",
              "Organization": "{{deal.org_name}}",
              "Contact Person": "{{deal.person_name}}",
              "Expected Close Date": "{{deal.expected_close_date}}",
              "Owner": "{{deal.owner_name}}",
              "Created Date": "{{deal.add_time}}"
            }
          }
        }
      },
      {
        id: "sheets-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "google-sheets",
          action: "append_row",
          config: { 
            spreadsheet_id: "${spreadsheet_id}",
            sheet_name: "${sheet_name}"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "pipedrive-trigger", target: "transform-data" },
      { id: "e2-3", source: "transform-data", target: "sheets-action" }
    ]),
    coverImage: "https://example.com/images/pipedrive-to-sheets.png",
    complexity: "simple",
    estimatedDuration: "5 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Create Pipedrive Deals from Google Forms",
    description: "Turn Google Forms responses into new deals in Pipedrive CRM to streamline lead capture.",
    category: "lead-management",
    tags: ["pipedrive", "google-forms", "crm", "lead-generation"],
    nodes: JSON.stringify([
      {
        id: "forms-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "google-forms",
          event: "new_response",
          config: { 
            form_id: "${form_id}"
          }
        }
      },
      {
        id: "search-person",
        type: "action",
        position: { x: 400, y: 100 },
        data: { 
          service: "pipedrive",
          action: "find_person",
          config: { 
            email: "{{response.email}}"
          }
        }
      },
      {
        id: "create-person",
        type: "action",
        position: { x: 700, y: 50 },
        data: { 
          service: "pipedrive",
          action: "create_person",
          config: { 
            name: "{{response.name}}",
            email: "{{response.email}}",
            phone: "{{response.phone}}",
            org_name: "{{response.company}}"
          }
        }
      },
      {
        id: "prepare-deal",
        type: "function",
        position: { x: 1000, y: 100 },
        data: { 
          function: "transform",
          config: { 
            deal_title: "${deal_title_prefix} - {{response.product_interest}}",
            deal_value: "{{response.budget}}",
            expected_close_date: "{{addDays today 30}}"
          }
        }
      },
      {
        id: "create-deal",
        type: "action",
        position: { x: 1300, y: 100 },
        data: { 
          service: "pipedrive",
          action: "create_deal",
          config: { 
            stage_id: "${stage_id}",
            person_id: "{{search.person_id || create_person.person_id}}"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "forms-trigger", target: "search-person" },
      { id: "e2-3a", source: "search-person", target: "create-person", label: "If not found" },
      { id: "e2-4", source: "search-person", target: "prepare-deal" },
      { id: "e3-4", source: "create-person", target: "prepare-deal" },
      { id: "e4-5", source: "prepare-deal", target: "create-deal" }
    ]),
    coverImage: "https://example.com/images/forms-to-pipedrive.png",
    complexity: "medium",
    estimatedDuration: "10 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Create Mailchimp Subscribers from Google Sheets",
    description: "Automatically add new rows from Google Sheets as subscribers to your Mailchimp mailing list.",
    category: "email-marketing",
    tags: ["mailchimp", "google-sheets", "marketing", "email"],
    nodes: JSON.stringify([
      {
        id: "sheets-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "google-sheets",
          event: "new_row",
          config: { 
            spreadsheet_id: "${spreadsheet_id}",
            sheet_name: "${sheet_name}"
          }
        }
      },
      {
        id: "prepare-subscriber",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "transform",
          config: { 
            mapping: {
              "email_address": "{{row.email}}",
              "status": "subscribed",
              "merge_fields": {
                "FNAME": "{{row.first_name}}",
                "LNAME": "{{row.last_name}}",
                "COMPANY": "{{row.company}}"
              },
              "tags": ["${tags}"]
            }
          }
        }
      },
      {
        id: "mailchimp-action",
        type: "action",
        position: { x: 700, y: 100 },
        data: { 
          service: "mailchimp",
          action: "add_subscriber",
          config: { 
            list_id: "${list_id}"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "sheets-trigger", target: "prepare-subscriber" },
      { id: "e2-3", source: "prepare-subscriber", target: "mailchimp-action" }
    ]),
    coverImage: "https://example.com/images/sheets-to-mailchimp.png",
    complexity: "simple",
    estimatedDuration: "5 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Create Trello Cards from Salesforce Tasks",
    description: "Automatically create Trello cards for new tasks created in Salesforce CRM.",
    category: "task-management",
    tags: ["salesforce", "trello", "crm", "task-automation"],
    nodes: JSON.stringify([
      {
        id: "salesforce-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "salesforce",
          event: "new_task",
          config: { }
        }
      },
      {
        id: "prepare-card",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            name_template: "{{task.subject}}",
            description_template: "**Description:** {{task.description}}\n\n**Related to:** {{task.related_to_name}}\n\n**Due date:** {{formatDate task.due_date}}\n\n**Salesforce URL:** {{task.url}}"
          }
        }
      },
      {
        id: "set-due-date",
        type: "function",
        position: { x: 700, y: 100 },
        data: { 
          function: "transform",
          config: { 
            due_date: "{{task.due_date}}"
          }
        }
      },
      {
        id: "trello-action",
        type: "action",
        position: { x: 1000, y: 100 },
        data: { 
          service: "trello",
          action: "create_card",
          config: { 
            board_id: "${board_id}",
            list_id: "${list_id}",
            labels: "${labels}"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "salesforce-trigger", target: "prepare-card" },
      { id: "e2-3", source: "prepare-card", target: "set-due-date" },
      { id: "e3-4", source: "set-due-date", target: "trello-action" }
    ]),
    coverImage: "https://example.com/images/salesforce-to-trello.png",
    complexity: "medium",
    estimatedDuration: "8 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Create ClickUp Tasks from Salesforce Opportunities",
    description: "Automatically create tasks in ClickUp when new opportunities are added in Salesforce CRM.",
    category: "task-management",
    tags: ["salesforce", "clickup", "crm", "sales", "task-automation"],
    nodes: JSON.stringify([
      {
        id: "salesforce-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "salesforce",
          event: "new_opportunity",
          config: { }
        }
      },
      {
        id: "prepare-task",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            title_template: "Follow up on opportunity: {{opportunity.name}}",
            description_template: "A new opportunity was created in Salesforce:\n\nOpportunity: {{opportunity.name}}\nAccount: {{opportunity.account_name}}\nAmount: {{formatCurrency opportunity.amount}}\nStage: {{opportunity.stage}}\nClose Date: {{formatDate opportunity.close_date}}\nOwner: {{opportunity.owner_name}}\n\nNext steps: ${next_steps}"
          }
        }
      },
      {
        id: "set-due-date",
        type: "function",
        position: { x: 700, y: 100 },
        data: { 
          function: "transform",
          config: { 
            due_date: "{{addDays today ${follow_up_days}}}"
          }
        }
      },
      {
        id: "clickup-action",
        type: "action",
        position: { x: 1000, y: 100 },
        data: { 
          service: "clickup",
          action: "create_task",
          config: { 
            list_id: "${list_id}",
            assignee_id: "${assignee_id}",
            priority: "${priority}",
            tags: ["salesforce", "opportunity", "${tag}"]
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "salesforce-trigger", target: "prepare-task" },
      { id: "e2-3", source: "prepare-task", target: "set-due-date" },
      { id: "e3-4", source: "set-due-date", target: "clickup-action" }
    ]),
    coverImage: "https://example.com/images/salesforce-to-clickup.png",
    complexity: "medium",
    estimatedDuration: "8 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
  {
    name: "Send Slack Message for Closed Salesforce Opportunity",
    description: "Notify your team in Slack when an opportunity is closed (won or lost) in Salesforce CRM.",
    category: "team-notifications",
    tags: ["salesforce", "slack", "crm", "sales", "notification"],
    nodes: JSON.stringify([
      {
        id: "salesforce-trigger",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: { 
          service: "salesforce",
          event: "opportunity_stage_change",
          config: { 
            stages: ["Closed Won", "Closed Lost"]
          }
        }
      },
      {
        id: "format-message",
        type: "function",
        position: { x: 400, y: 100 },
        data: { 
          function: "template",
          config: { 
            template: "{{#if (eq opportunity.stage 'Closed Won')}}\n:tada: *Opportunity Won!*\n{{else}}\n:disappointed: *Opportunity Lost*\n{{/if}}\n\n>Name: {{opportunity.name}}\n>Account: {{opportunity.account_name}}\n>Amount: {{formatCurrency opportunity.amount}}\n>Close Date: {{formatDate opportunity.close_date}}\n>Owner: {{opportunity.owner_name}}\n{{#if opportunity.description}}\n>Notes: {{opportunity.description}}\n{{/if}}"
          }
        }
      },
      {
        id: "determine-channel",
        type: "function",
        position: { x: 700, y: 100 },
        data: { 
          function: "logic",
          config: { 
            if: "{{eq opportunity.stage 'Closed Won'}}",
            then: {
              channel: "${won_channel_id}",
              emoji: ":tada:"
            },
            else: {
              channel: "${lost_channel_id}",
              emoji: ":disappointed:"
            }
          }
        }
      },
      {
        id: "slack-action",
        type: "action",
        position: { x: 1000, y: 100 },
        data: { 
          service: "slack",
          action: "send_message",
          config: { 
            channel: "{{logic.channel}}",
            message_type: "text"
          }
        }
      }
    ]),
    edges: JSON.stringify([
      { id: "e1-2", source: "salesforce-trigger", target: "format-message" },
      { id: "e2-3", source: "format-message", target: "determine-channel" },
      { id: "e3-4", source: "determine-channel", target: "slack-action" }
    ]),
    coverImage: "https://example.com/images/salesforce-to-slack.png",
    complexity: "simple",
    estimatedDuration: "5 minutes",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
  },
];

export async function seedTemplates() {
  console.log("Starting template seeding process directly to the database...");
  
  try {
    // First check if templates already exist to avoid duplicates
    const existingTemplates = await db.select({ name: workflowTemplates.name }).from(workflowTemplates);
    const existingNames = new Set(existingTemplates.map(t => t.name));
    
    console.log(`Found ${existingNames.size} existing templates`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const template of templates) {
      try {
        // Skip if template with same name already exists
        if (existingNames.has(template.name)) {
          console.log(`⏭️ Skipping existing template: ${template.name}`);
          skipCount++;
          continue;
        }
        
        // Insert directly to database
        await db.insert(workflowTemplates).values(template);
        console.log(`✅ Successfully added template: ${template.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding template: ${template.name}`, error);
        errorCount++;
      }
    }
    
    console.log(`Template seeding process complete.`);
    console.log(`Results: ${successCount} added, ${skipCount} skipped, ${errorCount} failed`);
  } catch (error) {
    console.error("Error in seed process:", error);
    process.exit(1);
  }
}

// Execute the script if run directly
if (require.main === module) {
  seedTemplates()
    .then(() => {
      console.log("Template seeding completed successfully!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error seeding templates:", err);
      process.exit(1);
    });
}

seedTemplates();