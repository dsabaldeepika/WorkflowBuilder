// Minimal node config array (see prompt for structure)
const nodeConfigs = [
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
    },
  },
  {
    id: "google-sheets-trigger",
    type: "trigger",
    position: { x: 100, y: 100 },
    data: {
      service: "google-sheets",
      event: "changes",
      config: {
        input_fields: [
          { name: "spreadsheet_id", type: "string", label: "Spreadsheet ID" },
          { name: "sheet_name", type: "string", label: "Sheet Name" },
          { name: "range", type: "string", label: "Range" },
        ],
      },
    },
  },
  {
    id: "google-sheets-action",
    type: "action",
    position: { x: 100, y: 100 },
    data: {
      service: "google-sheets",
      action: "append_row",
      config: {
        input_fields: [
          { name: "spreadsheet_id", type: "string", label: "Spreadsheet ID" },
          { name: "sheet_name", type: "string", label: "Sheet Name" },
          { name: "row_data", type: "array", label: "Row Data" },
        ],
      },
    },
  },
  {
    id: "slack-action",
    type: "action",
    position: { x: 100, y: 100 },
    data: {
      service: "slack",
      action: "send_message",
      config: {
        input_fields: [
          { name: "channel_id", type: "string", label: "Channel ID" },
          { name: "bot_token", type: "string", label: "Bot Token" },
          { name: "message", type: "string", label: "Message" },
        ],
      },
    },
  },
  {
    id: "openai-action",
    type: "action",
    position: { x: 100, y: 100 },
    data: {
      service: "openai",
      action: "generate_text",
      config: {
        input_fields: [
          { name: "api_key", type: "string", label: "OpenAI API Key" },
          { name: "model", type: "string", label: "Model" },
          { name: "prompt", type: "string", label: "Prompt" },
        ],
      },
    },
  },
  {
    id: "discord-send-message-v1",
    type: "action",
    position: { x: 120, y: 100 },
    data: {
      service: "discord",
      action: "send_message",
      config: {
        input_fields: [
          { name: "bot_token", type: "string", label: "Bot Token" },
          { name: "channel_id", type: "string", label: "Channel ID" },
          { name: "message", type: "string", label: "Message" },
        ],
      },
    },
  },
  {
    id: "twitter-post-tweet-v1",
    type: "action",
    position: { x: 130, y: 100 },
    data: {
      service: "twitter",
      action: "post_tweet",
      config: {
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "api_secret", type: "string", label: "API Secret" },
          { name: "access_token", type: "string", label: "Access Token" },
          {
            name: "access_token_secret",
            type: "string",
            label: "Access Token Secret",
          },
          { name: "tweet", type: "string", label: "Tweet" },
        ],
      },
    },
  },
  {
    id: "stripe-create-payment-intent-v1",
    type: "action",
    position: { x: 140, y: 100 },
    data: {
      service: "stripe",
      action: "create_payment_intent",
      config: {
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "amount", type: "number", label: "Amount (cents)" },
          { name: "currency", type: "string", label: "Currency" },
          { name: "customer", type: "string", label: "Customer ID" },
        ],
      },
    },
  },
  {
    id: "github-create-issue-v1",
    type: "action",
    position: { x: 150, y: 100 },
    data: {
      service: "github",
      action: "create_issue",
      config: {
        input_fields: [
          { name: "token", type: "string", label: "GitHub Token" },
          { name: "repo", type: "string", label: "Repository" },
          { name: "title", type: "string", label: "Issue Title" },
          { name: "body", type: "string", label: "Issue Body" },
        ],
      },
    },
  },
  {
    id: "jira-create-issue-v1",
    type: "action",
    position: { x: 160, y: 100 },
    data: {
      service: "jira",
      action: "create_issue",
      config: {
        input_fields: [
          { name: "base_url", type: "string", label: "Jira Base URL" },
          { name: "email", type: "string", label: "Jira Email" },
          { name: "api_token", type: "string", label: "API Token" },
          { name: "project_key", type: "string", label: "Project Key" },
          { name: "summary", type: "string", label: "Summary" },
          { name: "description", type: "string", label: "Description" },
        ],
      },
    },
  },
  {
    id: "aws-s3-upload-file-v1",
    type: "action",
    position: { x: 170, y: 100 },
    data: {
      service: "aws-s3",
      action: "upload_file",
      config: {
        input_fields: [
          { name: "access_key_id", type: "string", label: "Access Key ID" },
          {
            name: "secret_access_key",
            type: "string",
            label: "Secret Access Key",
          },
          { name: "bucket", type: "string", label: "Bucket Name" },
          { name: "file_path", type: "string", label: "File Path" },
        ],
      },
    },
  },
  {
    id: "google-drive-upload-file-v1",
    type: "action",
    position: { x: 180, y: 100 },
    data: {
      service: "google-drive",
      action: "upload_file",
      config: {
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "file_path", type: "string", label: "File Path" },
          { name: "folder_id", type: "string", label: "Folder ID" },
        ],
      },
    },
  },
  {
    id: "mailchimp-add-subscriber-v1",
    type: "action",
    position: { x: 190, y: 100 },
    data: {
      service: "mailchimp",
      action: "add_subscriber",
      config: {
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "list_id", type: "string", label: "List ID" },
          { name: "email", type: "string", label: "Subscriber Email" },
        ],
      },
    },
  },
  {
    id: "twilio-send-sms-v1",
    type: "action",
    position: { x: 200, y: 100 },
    data: {
      service: "twilio",
      action: "send_sms",
      config: {
        input_fields: [
          { name: "account_sid", type: "string", label: "Account SID" },
          { name: "auth_token", type: "string", label: "Auth Token" },
          { name: "from", type: "string", label: "From Number" },
          { name: "to", type: "string", label: "To Number" },
          { name: "body", type: "string", label: "Message Body" },
        ],
      },
    },
  },
  {
    id: "calendly-create-invitee-v1",
    type: "action",
    position: { x: 210, y: 100 },
    data: {
      service: "calendly",
      action: "create_invitee",
      config: {
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "event_uuid", type: "string", label: "Event UUID" },
          { name: "email", type: "string", label: "Invitee Email" },
        ],
      },
    },
  },
];

export { nodeConfigs };

export function getNodeConfigById(id: string) {
  return nodeConfigs.find((node) => node.id === id) || null;
}
