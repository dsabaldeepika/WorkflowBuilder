/**
 * Seed script to populate initial workflow templates based on customer requirements
 */

import { db } from "../server/db";
import { workflowTemplates } from "../shared/schema";
import { InsertWorkflowTemplate } from "../shared/schema";

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
          id: "facebook-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "facebook",
            event: "new_lead",
            config: {
              form_id: "${form_id}",
              include_fields: ["name", "email", "phone"],
              access_token: "${fb_access_token}"
            }
          }
        },
        {
          id: "transform-data",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "map_fields",
            config: {
              mapping: {
                "Lead Name": "{{lead.name}}",
                "Email": "{{lead.email}}",
                "Phone": "{{lead.phone}}",
                "Company": "{{lead.company}}",
                "Message": "{{lead.message}}",
                "Created At": "{{lead.created_time}}",
                "Source": "Facebook Lead Ads"
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
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"]
            }
          }
        }
      ],
      edges: [
        { id: "e1-2", source: "facebook-trigger", target: "transform-data" },
        { id: "e2-3", source: "transform-data", target: "sheets-action" }
      ]
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
          id: "facebook-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "facebook",
            event: "new_lead",
            config: {
              form_id: "${form_id}",
              include_fields: ["name", "email", "phone"],
              access_token: "${fb_access_token}"
            }
          }
        },
        {
          id: "prepare-email",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                subject: "Welcome to ${company_name}!",
                body: "Hi {{lead.name}},\n\nThank you for your interest in our products/services. We received your information and will contact you shortly.\n\nBest regards,\n${company_name}",
                body_type: "text"
              }
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
              client_id: "${gmail_client_id}",
              client_secret: "${gmail_client_secret}",
              refresh_token: "${gmail_refresh_token}",
              to: "{{lead.email}}",
              subject: "{{template.subject}}",
              body: "{{template.body}}",
              body_type: "text",
              reply_to: "${company_email}",
              headers: {
                "X-Custom-Header": "Facebook Lead"
              }
            }
          }
        }
      ],
      edges: [
        { id: "e1-2", source: "facebook-trigger", target: "prepare-email" },
        { id: "e2-3", source: "prepare-email", target: "gmail-action" }
      ]
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
          id: "facebook-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "facebook",
            event: "new_lead",
            config: {
              form_id: "${form_id}",
              include_fields: ["name", "email", "phone"],
              access_token: "${fb_access_token}"
            }
          }
        },
        {
          id: "format-message",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: ":tada: *New Lead from Facebook!*\n>Name: {{lead.name}}\n>Email: {{lead.email}}\n>Phone: {{lead.phone}}\n>Form: ${form_name}\n>Submitted: {{formatDate lead.created_time}}"
                    }
                  }
                ]
              }
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
              channel_id: "${channel_id}",
              bot_token: "${slack_bot_token}",
              message_type: "text"
            }
          }
        }
      ],
      edges: [
        { id: "e1-2", source: "facebook-trigger", target: "format-message" },
        { id: "e2-3", source: "format-message", target: "slack-action" }
      ]
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
          id: "sheets-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "google-sheets",
            event: "new_row",
            config: {
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"]
            }
          }
        },
        {
          id: "prepare-prompt",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                prompt: "Generate a personalized sales email for {{row.name}} from {{row.company}} interested in {{row.interests}} with a budget of {{row.budget}}. Focus on the benefits of our product for their needs.",
                max_tokens: 500,
                temperature: 0.7
              }
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
              api_key: "${openai_api_key}",
              model: "gpt-3.5-turbo",
              prompt: "{{template.prompt}}",
              max_tokens: "{{template.max_tokens}}",
              temperature: "{{template.temperature}}"
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
              range: "A1:Z1000",
              include_fields: ["*"]
            }
          }
        }
      ],
      edges: [
        { id: "e1-2", source: "sheets-trigger", target: "prepare-prompt" },
        { id: "e2-3", source: "prepare-prompt", target: "openai-action" },
        { id: "e3-4", source: "openai-action", target: "update-sheet" }
      ]
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
          id: "sheets-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "google-sheets",
            event: "new_row",
            config: {
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"]
            }
          }
        },
        {
          id: "prepare-prompt",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                prompt: "${prompt_template}\n\nCustomer data:\nName: {{row.name}}\nProduct interest: {{row.product}}\nPain points: {{row.pain_points}}\nBudget: {{row.budget}}",
              }
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
              api_key: "${claude_api_key}",
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
              range: "A1:Z1000",
              include_fields: ["*"]
            }
          }
        }
      ],
      edges: [
        { id: "e1-2", source: "sheets-trigger", target: "prepare-prompt" },
        { id: "e2-3", source: "prepare-prompt", target: "claude-action" },
        { id: "e3-4", source: "claude-action", target: "update-sheet" }
      ]
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
          id: "manual-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "manual",
            event: "trigger",
            config: {
              input_fields: [
                { name: "website_url", type: "string", label: "Website URL" },
                {
                  name: "data_points",
                  type: "string",
                  label: "Data Points to Extract (comma separated)",
                },
              ],
            },
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
              response_type: "text",
            },
          },
        },
        {
          id: "prepare-prompt",
          type: "function",
          position: { x: 700, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                prompt: "Extract the following data points from this website content in JSON format: {{trigger.data_points}}\n\nWebsite content:\n{{http.response}}\n\nRespond with a valid JSON object containing the extracted data.",
              }
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
              api_key: "${claude_api_key}",
              model: "claude-3-opus-20240229",
              max_tokens: 1000,
              temperature: 0.2,
              response_format: { type: "json_object" },
            },
          },
        },
        {
          id: "parse-json",
          type: "function",
          position: { x: 1300, y: 100 },
          data: {
            service: "transform",
            action: "parse_json",
            config: {
              operation: "parse_json",
              input: "{{claude.response}}",
            },
          },
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
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"]
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
    description: "Notify your team in Slack whenever a new deal is created in HubSpot CRM.",
    category: "team-notifications",
    tags: ["hubspot", "slack", "crm", "sales"],
    workflowData: {
      nodes: [
        {
          id: "hubspot-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "hubspot",
            event: "new_deal",
            config: {
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              include_properties: ["dealname", "amount", "pipeline"]
            }
          }
        },
        {
          id: "format-message",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: ":moneybag: *New Deal Created in HubSpot!*\n>Deal Name: {{deal.dealname}}\n>Amount: {{formatCurrency deal.amount}}\n>Stage: {{deal.dealstage}}\n>Company: {{deal.company}}\n>Owner: {{deal.owner}}"
                    }
                  }
                ]
              }
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
              channel_id: "${channel_id}",
              bot_token: "${slack_bot_token}",
              message_type: "text"
            }
          }
        }
      ],
      edges: [
        { id: "e1-2", source: "hubspot-trigger", target: "format-message" },
        { id: "e2-3", source: "format-message", target: "slack-action" }
      ]
    },
    imageUrl: "https://example.com/images/hubspot-deal-to-slack.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
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
          id: "hubspot-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "hubspot",
            event: "form_submission",
            config: {
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              form_id: "${form_id}",
            }
          }
        },
        {
          id: "format-message",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template:
                ":clipboard: *New HubSpot Form Submission!*\n>Form: ${form_name}\n>Name: {{submission.name}}\n>Email: {{submission.email}}\n>Company: {{submission.company}}\n>Message: {{submission.message}}",
            },
          },
        },
        {
          id: "slack-action",
          type: "action",
          position: { x: 700, y: 100 },
          data: {
            service: "slack",
            action: "send_message",
            config: {
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
          id: "hubspot-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "hubspot",
            event: "new_contact",
            config: {
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              include_properties: ["firstname", "lastname", "email", "company", "phone"]
            }
          }
        },
        {
          id: "prepare-task",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                title: "Follow up with new contact: {{contact.firstname}} {{contact.lastname}}",
                description: "A new contact was created in HubSpot:\n\nName: {{contact.firstname}} {{contact.lastname}}\nEmail: {{contact.email}}\nCompany: {{contact.company}}\nPhone: {{contact.phone}}\n\nFollow up with this contact within ${follow_up_days} days.",
                priority: "${priority}",
                status: "to_do"
              }
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
        { id: "e2-3", source: "prepare-task", target: "clickup-action" }
      ]
    },
    imageUrl: "https://example.com/images/hubspot-to-clickup.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
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
          id: "airtable-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "airtable",
            event: "new_record",
            config: {
              api_key: "${airtable_api_key}",
              base_id: "${airtable_base_id}",
              table_id: "${airtable_table_id}",
            },
          },
        },
        {
          id: "search-hubspot",
          type: "action",
          position: { x: 400, y: 100 },
          data: {
            service: "hubspot",
            action: "search_contact",
            config: {
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              email: "{{record.email}}",
            },
          },
        },
        {
          id: "prepare-data",
          type: "function",
          position: { x: 700, y: 100 },
          data: {
            service: "transform",
            action: "map_fields",
            config: {
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
          id: "hubspot-action",
          type: "action",
          position: { x: 1000, y: 100 },
          data: {
            service: "hubspot",
            action: "update_contact",
            config: {
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
    description: "Automatically generate a PandaDoc document when a deal reaches a specific stage in HubSpot CRM.",
    category: "document-automation",
    tags: ["hubspot", "pandadoc", "crm", "sales", "document"],
    workflowData: {
      nodes: [
        {
          id: "hubspot-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "hubspot",
            event: "deal_stage_change",
            config: {
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              target_stage: "${deal_stage}",
              include_properties: ["dealname", "amount", "pipeline", "dealstage", "company", "owner", "contacts"]
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
              api_key: "${hubspot_api_key}",
              portal_id: "${portal_id}",
              deal_id: "{{trigger.deal_id}}",
              include_associations: true,
              include_properties: ["dealname", "amount", "pipeline", "dealstage", "company", "owner", "contacts"]
            }
          }
        },
        {
          id: "create-document",
          type: "action",
          position: { x: 700, y: 100 },
          data: {
            service: "pandadoc",
            action: "create_document",
            config: {
              api_key: "${pandadoc_api_key}",
              template_id: "${template_id}",
              name: "{{deal.dealname}} - Proposal",
              tokens: {
                "deal_name": "{{deal.dealname}}",
                "amount": "{{formatCurrency deal.amount}}",
                "company": "{{deal.company}}",
                "owner": "{{deal.owner}}",
                "stage": "{{deal.dealstage}}"
              },
              recipients: "{{deal.contacts}}",
              metadata: {
                "source": "HubSpot",
                "deal_id": "{{deal.id}}",
                "stage": "{{deal.dealstage}}"
              }
            }
          }
        }
      ],
      edges: [
        { id: "e1-2", source: "hubspot-trigger", target: "get-deal-data" },
        { id: "e2-3", source: "get-deal-data", target: "create-document" }
      ]
    },
    imageUrl: "https://example.com/images/hubspot-to-pandadoc.png",
    createdByUserId: null,
    isPublished: true,
    isOfficial: true
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
          id: "pipedrive-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "pipedrive",
            event: "new_activity",
            config: {
              api_key: "${pipedrive_api_key}",
              domain: "${pipedrive_domain}",
              types: "${activity_types}",
            },
          },
        },
        {
          id: "format-message",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template:
                ":calendar: *New Pipedrive Activity*\n>Type: {{activity.type}}\n>Title: {{activity.title}}\n>Due Date: {{formatDate activity.due_date}}\n>Deal: {{activity.deal_title}}\n>Person: {{activity.person_name}}\n>Organization: {{activity.org_name}}\n>Assigned to: {{activity.assigned_to_user_name}}",
            },
          },
        },
        {
          id: "slack-action",
          type: "action",
          position: { x: 700, y: 100 },
          data: {
            service: "slack",
            action: "send_message",
            config: {
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
          id: "pipedrive-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "pipedrive",
            event: "new_deal",
            config: {
              api_key: "${pipedrive_api_key}",
              domain: "${pipedrive_domain}",
            },
          },
        },
        {
          id: "transform-data",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "map_fields",
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
                "Created Date": "{{deal.add_time}}",
              },
            },
          },
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
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"]
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
          id: "forms-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "google-forms",
            event: "new_response",
            config: {
              form_id: "${form_id}",
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
            },
          },
        },
        {
          id: "search-person",
          type: "action",
          position: { x: 400, y: 100 },
          data: {
            service: "pipedrive",
            action: "find_person",
            config: {
              api_key: "${pipedrive_api_key}",
              domain: "${pipedrive_domain}",
              email: "{{response.email}}",
            },
          },
        },
        {
          id: "create-person",
          type: "action",
          position: { x: 700, y: 50 },
          data: {
            service: "pipedrive",
            action: "create_person",
            config: {
              api_key: "${pipedrive_api_key}",
              domain: "${pipedrive_domain}",
              name: "{{response.name}}",
            },
          },
        },
        {
          id: "prepare-deal",
          type: "function",
          position: { x: 1000, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                deal_title: "${deal_title_prefix} - {{response.product_interest}}",
                deal_value: "{{response.budget}}",
                expected_close_date: "{{addDays today 30}}",
              },
            },
          },
        },
        {
          id: "create-deal",
          type: "action",
          position: { x: 1300, y: 100 },
          data: {
            service: "pipedrive",
            action: "create_deal",
            config: {
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
        { id: "e2-3a", source: "search-person", target: "create-person", label: "If not found" },
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
          id: "sheets-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "google-sheets",
            event: "new_row",
            config: {
              spreadsheet_id: "${spreadsheet_id}",
              sheet_name: "${sheet_name}",
              range: "A1:Z1000",
              include_fields: ["*"]
            }
          },
        },
        {
          id: "prepare-subscriber",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "map_fields",
            config: {
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
        { id: "e2-3", source: "prepare-subscriber", target: "mailchimp-action" },
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
          id: "salesforce-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "salesforce",
            event: "new_task",
            config: {
              instance_url: "${salesforce_instance_url}",
              access_token: "${salesforce_access_token}",
              refresh_token: "${salesforce_refresh_token}"
            }
          }
        },
        {
          id: "prepare-card",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                name_template: "{{task.subject}}",
                description_template:
                  "**Description:** {{task.description}}\n\n**Related to:** {{task.related_to_name}}\n\n**Due date:** {{formatDate task.due_date}}\n\n**Salesforce URL:** {{task.url}}",
              }
            }
          }
        },
        {
          id: "set-due-date",
          type: "function",
          position: { x: 700, y: 100 },
          data: {
            service: "transform",
            action: "map_fields",
            config: {
              mapping: {
                due_date: "{{task.due_date}}",
              }
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
          id: "salesforce-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "salesforce",
            event: "new_opportunity",
            config: {
              instance_url: "${salesforce_instance_url}",
              access_token: "${salesforce_access_token}",
              refresh_token: "${salesforce_refresh_token}"
            }
          }
        },
        {
          id: "prepare-task",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template: {
                title_template: "Follow up on opportunity: {{opportunity.name}}",
                description_template:
                  "A new opportunity was created in Salesforce:\n\nOpportunity: {{opportunity.name}}\nAccount: {{opportunity.account_name}}\nAmount: {{formatCurrency opportunity.amount}}\nStage: {{opportunity.stage}}\nClose Date: {{formatDate opportunity.close_date}}\nOwner: {{opportunity.owner_name}}\n\nNext steps: ${next_steps}",
              }
            }
          }
        },
        {
          id: "set-due-date",
          type: "function",
          position: { x: 700, y: 100 },
          data: {
            service: "transform",
            action: "map_fields",
            config: {
              mapping: {
                due_date: "{{addDays today ${follow_up_days}}}",
              }
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
          id: "salesforce-trigger",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: {
            service: "salesforce",
            event: "opportunity_stage_change",
            config: {
              instance_url: "${salesforce_instance_url}",
              access_token: "${salesforce_access_token}",
              refresh_token: "${salesforce_refresh_token}",
              stages: ["Closed Won", "Closed Lost"],
            },
          },
        },
        {
          id: "format-message",
          type: "function",
          position: { x: 400, y: 100 },
          data: {
            service: "transform",
            action: "template",
            config: {
              template:
                "{{#if (eq opportunity.stage 'Closed Won')}}\n:tada: *Opportunity Won!*\n{{else}}\n:disappointed: *Opportunity Lost*\n{{/if}}\n\n>Name: {{opportunity.name}}\n>Account: {{opportunity.account_name}}\n>Amount: {{formatCurrency opportunity.amount}}\n>Close Date: {{formatDate opportunity.close_date}}\n>Owner: {{opportunity.owner_name}}\n{{#if opportunity.description}}\n>Notes: {{opportunity.description}}\n{{/if}}",
            },
          },
        },
        {
          id: "determine-channel",
          type: "function",
          position: { x: 700, y: 100 },
          data: {
            service: "logic",
            action: "conditional",
            config: {
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
          id: "slack-action",
          type: "action",
          position: { x: 1000, y: 100 },
          data: {
            service: "slack",
            action: "send_message",
            config: {
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
    await db.delete(workflowTemplates);

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
