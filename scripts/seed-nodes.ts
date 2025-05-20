import { db } from "../server/db";
import { nodeTypes } from "../shared/schema";

const nodeConfigs = [
  {
    id: "openai-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "openai",
      action: "generate_text",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/openai/connect",
        credential_field: "api_key",
        help_link:
          "https://platform.openai.com/docs/api-reference/introduction",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "prompt",
            type: "string",
            label: "Prompt",
            required: true,
          },
          {
            name: "model",
            type: "string",
            label: "Model",
            required: false,
          },
        ],
      },
    },
  },
  {
    id: "claude-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "claude",
      action: "generate_text",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/claude/connect",
        credential_field: "api_key",
        help_link: "https://docs.anthropic.com/claude/docs/api-overview",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "api_key",
            type: "string",
            label: "API Key",
            required: true,
          },
          {
            name: "model",
            type: "select",
            label: "Model",
            options: ["claude-3-opus-20240229"],
            default: "claude-3-opus-20240229",
            required: true,
          },
          {
            name: "prompt",
            type: "string",
            label: "Prompt",
            required: true,
          },
          {
            name: "max_tokens",
            type: "number",
            label: "Max Tokens",
            min: 1,
            max: 4096,
            default: 500,
          },
          {
            name: "temperature",
            type: "number",
            label: "Temperature",
            min: 0,
            max: 2,
            default: 0.7,
          },
        ],
      },
    },
  },
  {
    id: "gmail-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "gmail",
      action: "send_email",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/gmail/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/gmail/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "client_id",
            type: "string",
            label: "Client ID",
            required: true,
          },
          {
            name: "client_secret",
            type: "string",
            label: "Client Secret",
            required: true,
          },
          {
            name: "refresh_token",
            type: "string",
            label: "Refresh Token",
            required: true,
          },
          {
            name: "to",
            type: "string",
            label: "Recipient Email",
            required: true,
          },
          {
            name: "subject",
            type: "string",
            label: "Subject",
            required: true,
          },
          {
            name: "body",
            type: "string",
            label: "Email Body",
            required: true,
          },
          {
            name: "body_type",
            type: "select",
            label: "Body Type",
            options: ["text", "html"],
            default: "text",
          },
        ],
      },
    },
  },
  {
    id: "webflow-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "webflow",
      action: "create_item",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/webflow/connect",
        credential_field: "api_key",
        help_link: "https://developers.webflow.com/reference/createitem",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "api_key",
            type: "string",
            label: "API Key",
            required: true,
          },
          {
            name: "collection_id",
            type: "string",
            label: "Collection ID",
            required: true,
          },
          {
            name: "fields",
            type: "json",
            label: "Fields (JSON)",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "openai-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "openai",
      action: "generate_text",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/openai/connect",
        credential_field: "api_key",
        help_link:
          "https://platform.openai.com/docs/api-reference/introduction",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "prompt",
            type: "string",
            label: "Prompt",
            required: true,
          },
          {
            name: "model",
            type: "string",
            label: "Model",
            required: false,
          },
        ],
      },
    },
  },
  {
    id: "claude-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "claude",
      action: "generate_text",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/claude/connect",
        credential_field: "api_key",
        help_link: "https://docs.anthropic.com/claude/docs/api-overview",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "api_key",
            type: "string",
            label: "API Key",
            required: true,
          },
          {
            name: "model",
            type: "select",
            label: "Model",
            options: ["claude-3-opus-20240229"],
            default: "claude-3-opus-20240229",
            required: true,
          },
          {
            name: "prompt",
            type: "string",
            label: "Prompt",
            required: true,
          },
          {
            name: "max_tokens",
            type: "number",
            label: "Max Tokens",
            min: 1,
            max: 4096,
            default: 500,
          },
          {
            name: "temperature",
            type: "number",
            label: "Temperature",
            min: 0,
            max: 2,
            default: 0.7,
          },
        ],
      },
    },
  },
  {
    id: "gmail-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "gmail",
      action: "send_email",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/gmail/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/gmail/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "client_id",
            type: "string",
            label: "Client ID",
            required: true,
          },
          {
            name: "client_secret",
            type: "string",
            label: "Client Secret",
            required: true,
          },
          {
            name: "refresh_token",
            type: "string",
            label: "Refresh Token",
            required: true,
          },
          {
            name: "to",
            type: "string",
            label: "Recipient Email",
            required: true,
          },
          {
            name: "subject",
            type: "string",
            label: "Subject",
            required: true,
          },
          {
            name: "body",
            type: "string",
            label: "Email Body",
            required: true,
          },
          {
            name: "body_type",
            type: "select",
            label: "Body Type",
            options: ["text", "html"],
            default: "text",
          },
        ],
      },
    },
  },
  {
    id: "github-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "github",
      action: "create_issue",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/github/connect",
        credential_field: "access_token",
        help_link:
          "https://docs.github.com/en/rest/reference/issues#create-an-issue",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "client_id",
            type: "string",
            label: "Client ID",
            required: true,
          },
          {
            name: "client_secret",
            type: "string",
            label: "Client Secret",
            required: true,
          },
          {
            name: "access_token",
            type: "string",
            label: "Access Token",
            required: true,
          },
          {
            name: "repo",
            type: "string",
            label: "Repository (owner/repo)",
            required: true,
          },
          {
            name: "title",
            type: "string",
            label: "Issue Title",
            required: true,
          },
          {
            name: "body",
            type: "string",
            label: "Issue Body",
          },
        ],
      },
    },
  },
  {
    id: "slack-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "slack",
      action: "send_message",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/slack/connect",
        credential_field: "access_token",
        help_link: "https://api.slack.com/authentication/oauth-v2",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "channel",
            type: "string",
            label: "Channel",
            required: true,
          },
          {
            name: "message",
            type: "string",
            label: "Message",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "twitter-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "twitter",
      action: "post_tweet",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/twitter/connect",
        credential_field: "access_token",
        help_link:
          "https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-tweets",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "client_id",
            type: "string",
            label: "Client ID",
            required: true,
          },
          {
            name: "client_secret",
            type: "string",
            label: "Client Secret",
            required: true,
          },
          {
            name: "access_token",
            type: "string",
            label: "Access Token",
            required: true,
          },
          {
            name: "access_token_secret",
            type: "string",
            label: "Access Token Secret",
            required: true,
          },
          {
            name: "tweet_text",
            type: "string",
            label: "Tweet Text",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "webhook-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "webhook",
      action: "send_request",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "url",
            type: "string",
            label: "Webhook URL",
            required: true,
          },
          {
            name: "method",
            type: "select",
            label: "HTTP Method",
            options: ["GET", "POST", "PUT", "DELETE"],
            default: "POST",
          },
          {
            name: "headers",
            type: "json",
            label: "Headers (JSON)",
            required: false,
          },
          {
            name: "body",
            type: "json",
            label: "Body (JSON)",
            required: false,
          },
        ],
      },
    },
  },
  {
    id: "http-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "http",
      action: "send_request",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "url",
            type: "string",
            label: "HTTP URL",
            required: true,
          },
          {
            name: "method",
            type: "select",
            label: "HTTP Method",
            options: ["GET", "POST", "PUT", "DELETE"],
            default: "POST",
          },
          {
            name: "headers",
            type: "json",
            label: "Headers (JSON)",
            required: false,
          },
          {
            name: "body",
            type: "json",
            label: "Body (JSON)",
            required: false,
          },
        ],
      },
    },
  },
  {
    id: "database-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "database",
      action: "query_database",
      config: {
        requires_connection: true,
        connection_type: "database",
        connect_url: "/auth/database/connect",
        credential_field: "connection_string",
        help_link: null,
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "connection_string",
            type: "string",
            label: "Connection String",
            required: true,
          },
          {
            name: "query",
            type: "string",
            label: "SQL Query",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "aws-s3-action",
    type: "action",
    position: {
      x: 200,
      y: 100,
    },
    data: {
      service: "aws_s3",
      action: "upload_file",
      config: {
        requires_connection: true,
        connection_type: "aws",
        connect_url: "/auth/aws/connect",
        credential_field: "access_key_id",
        help_link: null,
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "access_key_id",
            type: "string",
            label: "Access Key ID",
            required: true,
          },
          {
            name: "secret_access_key",
            type: "string",
            label: "Secret Access Key",
            required: true,
          },
          {
            name: "bucket_name",
            type: "string",
            label: "Bucket Name",
            required: true,
          },
          {
            name: "file_path",
            type: "string",
            label: "File Path",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "sql-server-action",
    type: "action",
    position: {
      x: 260,
      y: 100,
    },
    data: {
      service: "sql_server",
      action: "query_database",
      config: {
        requires_connection: true,
        connection_type: "sql_server",
        connect_url: "/auth/sqlserver/connect",
        credential_field: "connection_string",
        help_link: "https://learn.microsoft.com/en-us/sql/connect/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "connection_string",
            type: "string",
            label: "SQL Server Connection String",
            required: true,
          },
          {
            name: "query",
            type: "string",
            label: "SQL Query",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "postgresql-action",
    type: "action",
    position: {
      x: 270,
      y: 100,
    },
    data: {
      service: "postgresql",
      action: "query_database",
      config: {
        requires_connection: true,
        connection_type: "postgresql",
        connect_url: "/auth/postgresql/connect",
        credential_field: "connection_string",
        help_link: "https://www.postgresql.org/docs/current/libpq-connect.html",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "connection_string",
            type: "string",
            label: "PostgreSQL Connection String",
            required: true,
          },
          {
            name: "query",
            type: "string",
            label: "SQL Query",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "mongodb-action",
    type: "action",
    position: {
      x: 280,
      y: 100,
    },
    data: {
      service: "mongodb",
      action: "run_command",
      config: {
        requires_connection: true,
        connection_type: "mongodb",
        connect_url: "/auth/mongodb/connect",
        credential_field: "connection_string",
        help_link: "https://www.mongodb.com/docs/manual/reference/command/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "connection_string",
            type: "string",
            label: "MongoDB URI",
            required: true,
          },
          {
            name: "command",
            type: "json",
            label: "MongoDB Command (JSON)",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "google-drive-action",
    type: "action",
    position: {
      x: 290,
      y: 100,
    },
    data: {
      service: "google_drive",
      action: "upload_file",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google/connect",
        credential_field: "access_token",
        help_link:
          "https://developers.google.com/drive/api/v3/reference/files/create",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "access_token",
            type: "string",
            label: "Access Token",
            required: true,
          },
          {
            name: "filename",
            type: "string",
            label: "File Name",
            required: true,
          },
          {
            name: "mime_type",
            type: "string",
            label: "MIME Type",
            required: true,
          },
          {
            name: "file_content",
            type: "string",
            label: "File Content",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "bitbucket-action",
    type: "action",
    position: {
      x: 300,
      y: 100,
    },
    data: {
      service: "bitbucket",
      action: "create_repo",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/bitbucket/connect",
        credential_field: "access_token",
        help_link:
          "https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "access_token",
            type: "string",
            label: "Access Token",
            required: true,
          },
          {
            name: "repo_name",
            type: "string",
            label: "Repository Name",
            required: true,
          },
          {
            name: "is_private",
            type: "boolean",
            label: "Private",
            required: false,
          },
        ],
      },
    },
  },
  {
    id: "rss-action",
    type: "action",
    position: {
      x: 310,
      y: 100,
    },
    data: {
      service: "rss",
      action: "fetch_feed",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "feed_url",
            type: "string",
            label: "RSS Feed URL",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "azure-blob-action",
    type: "action",
    position: {
      x: 320,
      y: 100,
    },
    data: {
      service: "azure_blob",
      action: "upload_blob",
      config: {
        requires_connection: true,
        connection_type: "azure",
        connect_url: "/auth/azure/connect",
        credential_field: "account_key",
        help_link:
          "https://learn.microsoft.com/en-us/rest/api/storageservices/put-blob",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "account_name",
            type: "string",
            label: "Account Name",
            required: true,
          },
          {
            name: "account_key",
            type: "string",
            label: "Account Key",
            required: true,
          },
          {
            name: "container_name",
            type: "string",
            label: "Container Name",
            required: true,
          },
          {
            name: "blob_name",
            type: "string",
            label: "Blob Name",
            required: true,
          },
          {
            name: "content",
            type: "string",
            label: "Blob Content",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "redis-action",
    type: "action",
    position: {
      x: 330,
      y: 100,
    },
    data: {
      service: "redis",
      action: "set_key",
      config: {
        requires_connection: true,
        connection_type: "redis",
        connect_url: "/auth/redis/connect",
        credential_field: "connection_string",
        help_link: "https://redis.io/docs/latest/commands/set/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "connection_string",
            type: "string",
            label: "Redis URI",
            required: true,
          },
          {
            name: "key",
            type: "string",
            label: "Key",
            required: true,
          },
          {
            name: "value",
            type: "string",
            label: "Value",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "elasticsearch-action",
    type: "action",
    position: {
      x: 340,
      y: 100,
    },
    data: {
      service: "elasticsearch",
      action: "index_document",
      config: {
        requires_connection: true,
        connection_type: "basic_auth",
        connect_url: "/auth/elasticsearch/connect",
        credential_field: "username",
        help_link:
          "https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "host",
            type: "string",
            label: "Host URL",
            required: true,
          },
          {
            name: "username",
            type: "string",
            label: "Username",
            required: true,
          },
          {
            name: "password",
            type: "string",
            label: "Password",
            required: true,
          },
          {
            name: "index",
            type: "string",
            label: "Index Name",
            required: true,
          },
          {
            name: "document",
            type: "json",
            label: "Document (JSON)",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "openai-chat-node",
    type: "node",
    position: {
      x: 100,
      y: 800,
    },
    data: {
      service: "openai",
      event: "chat_completion",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/openai/connect",
        credential_field: "api_key",
        help_link:
          "https://platform.openai.com/docs/api-reference/introduction",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "messages",
            type: "json",
            label: "Chat Messages (JSON Array)",
          },
          {
            name: "model",
            type: "string",
            label: "Model Name",
          },
        ],
      },
    },
  },
  {
    id: "langchain-node",
    type: "node",
    position: {
      x: 120,
      y: 800,
    },
    data: {
      service: "langchain",
      event: "run_chain",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/langchain/connect",
        credential_field: "api_key",
        help_link: "https://docs.langchain.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "chain_input",
            type: "json",
            label: "Chain Input Object",
          },
        ],
      },
    },
  },
  {
    id: "jsonlogic-node",
    type: "node",
    position: {
      x: 140,
      y: 800,
    },
    data: {
      service: "jsonlogic",
      event: "evaluate_rule",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: "",
        credential_field: "",
        help_link: "https://jsonlogic.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "rule",
            type: "json",
            label: "Logic Rule (JSON)",
          },
          {
            name: "data",
            type: "json",
            label: "Input Data (JSON)",
          },
        ],
      },
    },
  },
  {
    id: "formstack-node",
    type: "node",
    position: {
      x: 160,
      y: 800,
    },
    data: {
      service: "formstack",
      event: "submit_form",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/formstack/connect",
        credential_field: "api_key",
        help_link: "https://formstack.readme.io",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "form_id",
            type: "string",
            label: "Form ID",
          },
          {
            name: "field_data",
            type: "json",
            label: "Field Data (key-value pairs)",
          },
        ],
      },
    },
  },
  {
    id: "graphql-node",
    type: "node",
    position: {
      x: 180,
      y: 800,
    },
    data: {
      service: "graphql",
      event: "execute_query",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: "",
        credential_field: "",
        help_link: "https://graphql.org/learn/queries",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "query",
            type: "string",
            label: "GraphQL Query",
          },
          {
            name: "variables",
            type: "json",
            label: "Variables (optional)",
          },
        ],
      },
    },
  },
  {
    id: "firebase-realtime-node",
    type: "node",
    position: {
      x: 200,
      y: 800,
    },
    data: {
      service: "firebase_realtime",
      event: "write_data",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/firebase/connect",
        credential_field: "api_key",
        help_link: "https://firebase.google.com/docs/database",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "path",
            type: "string",
            label: "Database Path",
          },
          {
            name: "data",
            type: "json",
            label: "Data Object",
          },
        ],
      },
    },
  },
  {
    id: "sanity-node",
    type: "node",
    position: {
      x: 220,
      y: 800,
    },
    data: {
      service: "sanity",
      event: "create_document",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/sanity/connect",
        credential_field: "api_key",
        help_link: "https://www.sanity.io/docs/http-api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "dataset",
            type: "string",
            label: "Dataset",
          },
          {
            name: "document",
            type: "json",
            label: "Document JSON",
          },
        ],
      },
    },
  },
  {
    id: "strapi-node",
    type: "node",
    position: {
      x: 240,
      y: 800,
    },
    data: {
      service: "strapi",
      event: "create_entry",
      config: {
        requires_connection: true,
        connection_type: "jwt",
        connect_url: "/auth/strapi/connect",
        credential_field: "jwt",
        help_link: "https://docs.strapi.io",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "collection",
            type: "string",
            label: "Collection Name",
          },
          {
            name: "data",
            type: "json",
            label: "Entry Data",
          },
        ],
      },
    },
  },
  {
    id: "contentful-node",
    type: "node",
    position: {
      x: 260,
      y: 800,
    },
    data: {
      service: "contentful",
      event: "create_entry",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/contentful/connect",
        credential_field: "access_token",
        help_link:
          "https://www.contentful.com/developers/docs/references/content-management-api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "content_type_id",
            type: "string",
            label: "Content Type",
          },
          {
            name: "fields",
            type: "json",
            label: "Fields (locale: value)",
          },
        ],
      },
    },
  },
  {
    id: "keap-node",
    type: "node",
    position: {
      x: 280,
      y: 800,
    },
    data: {
      service: "keap",
      event: "create_contact",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/keap/connect",
        credential_field: "access_token",
        help_link: "https://developer.keap.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "contact",
            type: "json",
            label: "Contact JSON",
          },
        ],
      },
    },
  },
  {
    id: "lemlist-node",
    type: "node",
    position: {
      x: 300,
      y: 800,
    },
    data: {
      service: "lemlist",
      event: "add_lead",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/lemlist/connect",
        credential_field: "api_key",
        help_link: "https://developer.lemlist.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "campaign_id",
            type: "string",
            label: "Campaign ID",
          },
          {
            name: "lead_data",
            type: "json",
            label: "Lead JSON",
          },
        ],
      },
    },
  },
  {
    id: "webflow-collection-node",
    type: "node",
    position: {
      x: 320,
      y: 800,
    },
    data: {
      service: "webflow",
      event: "create_collection_item",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/webflow/connect",
        credential_field: "api_key",
        help_link: "https://developers.webflow.com/reference",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "collection_id",
            type: "string",
            label: "Collection ID",
          },
          {
            name: "fields",
            type: "json",
            label: "Fields JSON",
          },
        ],
      },
    },
  },
  {
    id: "supabase-rpc-node",
    type: "node",
    position: {
      x: 340,
      y: 800,
    },
    data: {
      service: "supabase",
      event: "call_function",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/supabase/connect",
        credential_field: "api_key",
        help_link: "https://supabase.com/docs/reference/javascript/rpc",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "function_name",
            type: "string",
            label: "Function Name",
          },
          {
            name: "params",
            type: "json",
            label: "Params (JSON)",
          },
        ],
      },
    },
  },
  {
    id: "notion-query-node",
    type: "node",
    position: {
      x: 360,
      y: 800,
    },
    data: {
      service: "notion",
      event: "query_database",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/notion/connect",
        credential_field: "access_token",
        help_link: "https://developers.notion.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "database_id",
            type: "string",
            label: "Database ID",
          },
          {
            name: "filter",
            type: "json",
            label: "Filter JSON",
          },
        ],
      },
    },
  },
  {
    id: "algolia-search-node",
    type: "node",
    position: {
      x: 380,
      y: 800,
    },
    data: {
      service: "algolia",
      event: "search_index",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/algolia/connect",
        credential_field: "api_key",
        help_link: "https://www.algolia.com/doc",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "index",
            type: "string",
            label: "Index Name",
          },
          {
            name: "query",
            type: "string",
            label: "Search Query",
          },
          {
            name: "params",
            type: "json",
            label: "Search Parameters",
          },
        ],
      },
    },
  },
  {
    id: "elastic-query-node",
    type: "node",
    position: {
      x: 400,
      y: 800,
    },
    data: {
      service: "elasticsearch",
      event: "search_document",
      config: {
        requires_connection: true,
        connection_type: "basic_auth",
        connect_url: "/auth/elasticsearch/connect",
        credential_field: "username",
        help_link:
          "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "index",
            type: "string",
            label: "Index Name",
          },
          {
            name: "query",
            type: "json",
            label: "Query DSL JSON",
          },
        ],
      },
    },
  },
  {
    id: "twitch-node",
    type: "node",
    position: {
      x: 340,
      y: 700,
    },
    data: {
      service: "twitch",
      event: "get_streams",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/twitch/connect",
        credential_field: "access_token",
        help_link: "https://dev.twitch.tv/docs/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "user_login",
            type: "string",
            label: "Streamer Username",
          },
        ],
      },
    },
  },
  {
    id: "steam-node",
    type: "node",
    position: {
      x: 360,
      y: 700,
    },
    data: {
      service: "steam",
      event: "get_player_summaries",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/steam/connect",
        credential_field: "api_key",
        help_link: "https://developer.valvesoftware.com/wiki/Steam_Web_API",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "steamids",
            type: "string",
            label: "Steam IDs (comma-separated)",
          },
        ],
      },
    },
  },
  {
    id: "discord-guild-node",
    type: "node",
    position: {
      x: 380,
      y: 700,
    },
    data: {
      service: "discord",
      event: "get_guild_info",
      config: {
        requires_connection: true,
        connection_type: "bot_token",
        connect_url: "/auth/discord/connect",
        credential_field: "bot_token",
        help_link: "https://discord.com/developers/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "guild_id",
            type: "string",
            label: "Guild ID",
          },
        ],
      },
    },
  },
  {
    id: "eventbrite-node",
    type: "node",
    position: {
      x: 280,
      y: 700,
    },
    data: {
      service: "eventbrite",
      event: "list_events",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/eventbrite/connect",
        credential_field: "access_token",
        help_link: "https://www.eventbrite.com/platform/api",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "ticketmaster-node",
    type: "node",
    position: {
      x: 300,
      y: 700,
    },
    data: {
      service: "ticketmaster",
      event: "search_events",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/ticketmaster/connect",
        credential_field: "api_key",
        help_link: "https://developer.ticketmaster.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "keyword",
            type: "string",
            label: "Keyword",
          },
        ],
      },
    },
  },
  {
    id: "calendly-node",
    type: "node",
    position: {
      x: 320,
      y: 700,
    },
    data: {
      service: "calendly",
      event: "list_invitees",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/calendly/connect",
        credential_field: "access_token",
        help_link: "https://developer.calendly.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "event_id",
            type: "string",
            label: "Event ID",
          },
        ],
      },
    },
  },
  {
    id: "canvas-node",
    type: "node",
    position: {
      x: 220,
      y: 700,
    },
    data: {
      service: "canvas",
      event: "list_courses",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/canvas/connect",
        credential_field: "access_token",
        help_link: "https://canvas.instructure.com/doc/api",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "moodle-node",
    type: "node",
    position: {
      x: 240,
      y: 700,
    },
    data: {
      service: "moodle",
      event: "get_users",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/moodle/connect",
        credential_field: "token",
        help_link: "https://moodledev.io/docs/apis/core",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "google-classroom-node",
    type: "node",
    position: {
      x: 260,
      y: 700,
    },
    data: {
      service: "google_classroom",
      event: "list_courses",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/classroom",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "docusign-node",
    type: "node",
    position: {
      x: 160,
      y: 700,
    },
    data: {
      service: "docusign",
      event: "send_envelope",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/docusign/connect",
        credential_field: "access_token",
        help_link: "https://developers.docusign.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "template_id",
            type: "string",
            label: "Template ID",
          },
          {
            name: "recipient_email",
            type: "string",
            label: "Recipient Email",
          },
        ],
      },
    },
  },
  {
    id: "hellosign-node",
    type: "node",
    position: {
      x: 180,
      y: 700,
    },
    data: {
      service: "hellosign",
      event: "create_signature_request",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/hellosign/connect",
        credential_field: "api_key",
        help_link: "https://app.hellosign.com/api/reference",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "signers",
            type: "json",
            label: "Signer Info",
          },
          {
            name: "file_url",
            type: "string",
            label: "Document URL",
          },
        ],
      },
    },
  },
  {
    id: "clio-node",
    type: "node",
    position: {
      x: 200,
      y: 700,
    },
    data: {
      service: "clio",
      event: "create_contact",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/clio/connect",
        credential_field: "access_token",
        help_link: "https://docs.clio.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "name",
            type: "string",
            label: "Client Name",
          },
          {
            name: "email",
            type: "string",
            label: "Email",
          },
        ],
      },
    },
  },
  {
    id: "healthgorilla-node",
    type: "node",
    position: {
      x: 100,
      y: 700,
    },
    data: {
      service: "healthgorilla",
      event: "query_records",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/healthgorilla/connect",
        credential_field: "access_token",
        help_link: "https://docs.healthgorilla.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "patient_id",
            type: "string",
            label: "Patient ID",
          },
        ],
      },
    },
  },
  {
    id: "epic-node",
    type: "node",
    position: {
      x: 120,
      y: 700,
    },
    data: {
      service: "epic",
      event: "get_appointments",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/epic/connect",
        credential_field: "access_token",
        help_link: "https://fhir.epic.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "patient_id",
            type: "string",
            label: "Patient ID",
          },
        ],
      },
    },
  },
  {
    id: "cerner-node",
    type: "node",
    position: {
      x: 140,
      y: 700,
    },
    data: {
      service: "cerner",
      event: "get_encounters",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/cerner/connect",
        credential_field: "access_token",
        help_link: "https://fhir.cerner.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "patient_id",
            type: "string",
            label: "Patient ID",
          },
        ],
      },
    },
  },
  {
    id: "shippo-node",
    type: "node",
    position: {
      x: 300,
      y: 600,
    },
    data: {
      service: "shippo",
      event: "create_label",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/shippo/connect",
        credential_field: "api_key",
        help_link: "https://goshippo.com/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "shipment",
            type: "json",
            label: "Shipment Info",
          },
        ],
      },
    },
  },
  {
    id: "easyship-node",
    type: "node",
    position: {
      x: 320,
      y: 600,
    },
    data: {
      service: "easyship",
      event: "get_rates",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/easyship/connect",
        credential_field: "api_key",
        help_link: "https://developers.easyship.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "destination",
            type: "json",
            label: "Destination Details",
          },
        ],
      },
    },
  },
  {
    id: "aftership-node",
    type: "node",
    position: {
      x: 340,
      y: 600,
    },
    data: {
      service: "aftership",
      event: "track_shipment",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/aftership/connect",
        credential_field: "api_key",
        help_link: "https://docs.aftership.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "tracking_number",
            type: "string",
            label: "Tracking Number",
          },
        ],
      },
    },
  },
  {
    id: "deliverr-node",
    type: "node",
    position: {
      x: 360,
      y: 600,
    },
    data: {
      service: "deliverr",
      event: "create_fulfillment_order",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/deliverr/connect",
        credential_field: "api_key",
        help_link: "https://developer.deliverr.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "order",
            type: "json",
            label: "Order Data",
          },
        ],
      },
    },
  },
  {
    id: "fedex-node",
    type: "node",
    position: {
      x: 380,
      y: 600,
    },
    data: {
      service: "fedex",
      event: "create_shipment",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/fedex/connect",
        credential_field: "api_key",
        help_link: "https://developer.fedex.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "shipment",
            type: "json",
            label: "Shipment Data",
          },
        ],
      },
    },
  },
  {
    id: "xero-node",
    type: "node",
    position: {
      x: 200,
      y: 600,
    },
    data: {
      service: "xero",
      event: "create_invoice",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/xero/connect",
        credential_field: "access_token",
        help_link: "https://developer.xero.com/documentation",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "invoice_data",
            type: "json",
            label: "Invoice JSON",
          },
        ],
      },
    },
  },
  {
    id: "freshbooks-node",
    type: "node",
    position: {
      x: 220,
      y: 600,
    },
    data: {
      service: "freshbooks",
      event: "create_invoice",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/freshbooks/connect",
        credential_field: "access_token",
        help_link: "https://www.freshbooks.com/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "client_id",
            type: "string",
            label: "Client ID",
          },
          {
            name: "invoice",
            type: "json",
            label: "Invoice Data",
          },
        ],
      },
    },
  },
  {
    id: "wave-node",
    type: "node",
    position: {
      x: 240,
      y: 600,
    },
    data: {
      service: "wave",
      event: "create_customer",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/wave/connect",
        credential_field: "api_key",
        help_link: "https://developer.waveapps.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "name",
            type: "string",
            label: "Customer Name",
          },
          {
            name: "email",
            type: "string",
            label: "Customer Email",
          },
        ],
      },
    },
  },
  {
    id: "zoho-books-node",
    type: "node",
    position: {
      x: 260,
      y: 600,
    },
    data: {
      service: "zoho_books",
      event: "create_invoice",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/zoho/connect",
        credential_field: "access_token",
        help_link: "https://www.zoho.com/books/api/v3/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "invoice",
            type: "json",
            label: "Invoice Object",
          },
        ],
      },
    },
  },
  {
    id: "sage-node",
    type: "node",
    position: {
      x: 280,
      y: 600,
    },
    data: {
      service: "sage",
      event: "create_sales_invoice",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/sage/connect",
        credential_field: "access_token",
        help_link: "https://developer.sage.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "invoice_data",
            type: "json",
            label: "Invoice Data",
          },
        ],
      },
    },
  },
  {
    id: "etsy-node",
    type: "node",
    position: {
      x: 100,
      y: 600,
    },
    data: {
      service: "etsy",
      event: "get_orders",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/etsy/connect",
        credential_field: "access_token",
        help_link: "https://developers.etsy.com/documentation",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "shop_id",
            type: "string",
            label: "Shop ID",
          },
        ],
      },
    },
  },
  {
    id: "woocommerce-order-node",
    type: "node",
    position: {
      x: 120,
      y: 600,
    },
    data: {
      service: "woocommerce",
      event: "get_orders",
      config: {
        requires_connection: true,
        connection_type: "basic_auth",
        connect_url: "/auth/woocommerce/connect",
        credential_field: "consumer_key",
        help_link: "https://woocommerce.github.io/woocommerce-rest-api-docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "status",
            type: "string",
            label: "Order Status",
          },
        ],
      },
    },
  },
  {
    id: "prestashop-node",
    type: "node",
    position: {
      x: 140,
      y: 600,
    },
    data: {
      service: "prestashop",
      event: "get_products",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/prestashop/connect",
        credential_field: "api_key",
        help_link: "https://devdocs.prestashop-project.org",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "magento-node",
    type: "node",
    position: {
      x: 160,
      y: 600,
    },
    data: {
      service: "magento",
      event: "get_customers",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/magento/connect",
        credential_field: "access_token",
        help_link: "https://developer.adobe.com/commerce/webapi",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "bigcommerce-node",
    type: "node",
    position: {
      x: 180,
      y: 600,
    },
    data: {
      service: "bigcommerce",
      event: "list_products",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/bigcommerce/connect",
        credential_field: "access_token",
        help_link: "https://developer.bigcommerce.com/api-docs",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "metabase-node",
    type: "node",
    position: {
      x: 300,
      y: 500,
    },
    data: {
      service: "metabase",
      event: "run_query",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/metabase/connect",
        credential_field: "api_key",
        help_link:
          "https://www.metabase.com/docs/latest/api-documentation.html",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "question_id",
            type: "string",
            label: "Question ID",
          },
        ],
      },
    },
  },
  {
    id: "powerbi-node",
    type: "node",
    position: {
      x: 320,
      y: 500,
    },
    data: {
      service: "powerbi",
      event: "get_report",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/powerbi/connect",
        credential_field: "access_token",
        help_link: "https://learn.microsoft.com/en-us/rest/api/power-bi",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "report_id",
            type: "string",
            label: "Report ID",
          },
        ],
      },
    },
  },
  {
    id: "looker-node",
    type: "node",
    position: {
      x: 340,
      y: 500,
    },
    data: {
      service: "looker",
      event: "run_look",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/looker/connect",
        credential_field: "access_token",
        help_link: "https://cloud.google.com/looker/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "look_id",
            type: "string",
            label: "Look ID",
          },
        ],
      },
    },
  },
  {
    id: "tableau-dashboard-node",
    type: "node",
    position: {
      x: 360,
      y: 500,
    },
    data: {
      service: "tableau",
      event: "get_dashboard",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/tableau/connect",
        credential_field: "access_token",
        help_link: "https://help.tableau.com/current/api/rest_api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "dashboard_id",
            type: "string",
            label: "Dashboard ID",
          },
        ],
      },
    },
  },
  {
    id: "redash-node",
    type: "node",
    position: {
      x: 380,
      y: 500,
    },
    data: {
      service: "redash",
      event: "run_query",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/redash/connect",
        credential_field: "api_key",
        help_link: "https://redash.io/help/user-guide/integrations-and-api/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "query_id",
            type: "string",
            label: "Query ID",
          },
        ],
      },
    },
  },
  {
    id: "datadog-node",
    type: "node",
    position: {
      x: 200,
      y: 500,
    },
    data: {
      service: "datadog",
      event: "get_metrics",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/datadog/connect",
        credential_field: "api_key",
        help_link: "https://docs.datadoghq.com/api/latest/metrics/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "query",
            type: "string",
            label: "Query Expression",
          },
        ],
      },
    },
  },
  {
    id: "sentry-node",
    type: "node",
    position: {
      x: 220,
      y: 500,
    },
    data: {
      service: "sentry",
      event: "list_issues",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/sentry/connect",
        credential_field: "api_key",
        help_link: "https://docs.sentry.io/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "project_slug",
            type: "string",
            label: "Project Slug",
          },
        ],
      },
    },
  },
  {
    id: "pagerduty-node",
    type: "node",
    position: {
      x: 240,
      y: 500,
    },
    data: {
      service: "pagerduty",
      event: "create_incident",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/pagerduty/connect",
        credential_field: "access_token",
        help_link: "https://developer.pagerduty.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "title",
            type: "string",
            label: "Incident Title",
          },
          {
            name: "service_id",
            type: "string",
            label: "Service ID",
          },
        ],
      },
    },
  },
  {
    id: "logz-node",
    type: "node",
    position: {
      x: 260,
      y: 500,
    },
    data: {
      service: "logz",
      event: "query_logs",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/logz/connect",
        credential_field: "api_key",
        help_link: "https://docs.logz.io",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "query",
            type: "string",
            label: "Log Query",
          },
        ],
      },
    },
  },
  {
    id: "newrelic-node",
    type: "node",
    position: {
      x: 280,
      y: 500,
    },
    data: {
      service: "newrelic",
      event: "query_insights",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/newrelic/connect",
        credential_field: "api_key",
        help_link: "https://docs.newrelic.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "nrql",
            type: "string",
            label: "NRQL Query",
          },
        ],
      },
    },
  },
  {
    id: "github-commits-node",
    type: "node",
    position: {
      x: 100,
      y: 500,
    },
    data: {
      service: "github",
      event: "get_commits",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/github/connect",
        credential_field: "access_token",
        help_link: "https://docs.github.com/en/rest/commits",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "repo",
            type: "string",
            label: "Repository (owner/repo)",
          },
        ],
      },
    },
  },
  {
    id: "gitlab-node",
    type: "node",
    position: {
      x: 120,
      y: 500,
    },
    data: {
      service: "gitlab",
      event: "get_merge_requests",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/gitlab/connect",
        credential_field: "access_token",
        help_link: "https://docs.gitlab.com/ee/api/merge_requests.html",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "project_id",
            type: "string",
            label: "Project ID",
          },
        ],
      },
    },
  },
  {
    id: "bitbucket-prs-node",
    type: "node",
    position: {
      x: 140,
      y: 500,
    },
    data: {
      service: "bitbucket",
      event: "list_pull_requests",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/bitbucket/connect",
        credential_field: "access_token",
        help_link:
          "https://developer.atlassian.com/bitbucket/api/2/reference/resource/pullrequests",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "repo_slug",
            type: "string",
            label: "Repo Slug",
          },
        ],
      },
    },
  },
  {
    id: "sonarqube-node",
    type: "node",
    position: {
      x: 160,
      y: 500,
    },
    data: {
      service: "sonarqube",
      event: "get_code_quality",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/sonarqube/connect",
        credential_field: "api_key",
        help_link: "https://docs.sonarsource.com/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "project_key",
            type: "string",
            label: "Project Key",
          },
        ],
      },
    },
  },
  {
    id: "circleci-node",
    type: "node",
    position: {
      x: 180,
      y: 500,
    },
    data: {
      service: "circleci",
      event: "trigger_pipeline",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/circleci/connect",
        credential_field: "api_key",
        help_link: "https://circleci.com/docs/api/v2",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "project_slug",
            type: "string",
            label: "Project Slug",
          },
          {
            name: "branch",
            type: "string",
            label: "Branch",
          },
        ],
      },
    },
  },
  {
    id: "coinbase-node",
    type: "node",
    position: {
      x: 360,
      y: 400,
    },
    data: {
      service: "coinbase",
      event: "get_balance",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/coinbase/connect",
        credential_field: "access_token",
        help_link: "https://docs.cloud.coinbase.com",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "binance-node",
    type: "node",
    position: {
      x: 380,
      y: 400,
    },
    data: {
      service: "binance",
      event: "get_prices",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: "",
        credential_field: "",
        help_link: "https://binance-docs.github.io/apidocs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "symbol",
            type: "string",
            label: "Symbol (e.g. BTCUSDT)",
          },
        ],
      },
    },
  },
  {
    id: "stripe-balance-node",
    type: "node",
    position: {
      x: 400,
      y: 400,
    },
    data: {
      service: "stripe",
      event: "get_balance",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/stripe/connect",
        credential_field: "api_key",
        help_link: "https://stripe.com/docs/api",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "greenhouse-node",
    type: "node",
    position: {
      x: 300,
      y: 400,
    },
    data: {
      service: "greenhouse",
      event: "list_candidates",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/greenhouse/connect",
        credential_field: "api_key",
        help_link: "https://developers.greenhouse.io/",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "lever-node",
    type: "node",
    position: {
      x: 320,
      y: 400,
    },
    data: {
      service: "lever",
      event: "list_opportunities",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/lever/connect",
        credential_field: "api_key",
        help_link: "https://hire.lever.co/developer/documentation",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "workable-node",
    type: "node",
    position: {
      x: 340,
      y: 400,
    },
    data: {
      service: "workable",
      event: "get_jobs",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/workable/connect",
        credential_field: "api_key",
        help_link: "https://workable.readme.io/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [],
      },
    },
  },
  {
    id: "youtube-node",
    type: "node",
    position: {
      x: 240,
      y: 400,
    },
    data: {
      service: "youtube",
      event: "upload_video",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/youtube/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/youtube",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "title",
            type: "string",
            label: "Video Title",
          },
          {
            name: "video",
            type: "string",
            label: "Video Base64",
          },
        ],
      },
    },
  },
  {
    id: "vimeo-node",
    type: "node",
    position: {
      x: 260,
      y: 400,
    },
    data: {
      service: "vimeo",
      event: "upload_video",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/vimeo/connect",
        credential_field: "access_token",
        help_link: "https://developer.vimeo.com/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "name",
            type: "string",
            label: "Video Name",
          },
          {
            name: "file",
            type: "string",
            label: "Video File",
          },
        ],
      },
    },
  },
  {
    id: "mux-node",
    type: "node",
    position: {
      x: 280,
      y: 400,
    },
    data: {
      service: "mux",
      event: "create_asset",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/mux/connect",
        credential_field: "access_token",
        help_link: "https://docs.mux.com/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "input_url",
            type: "string",
            label: "Video URL",
          },
        ],
      },
    },
  },
  {
    id: "typeform-node",
    type: "node",
    position: {
      x: 180,
      y: 400,
    },
    data: {
      service: "typeform",
      event: "get_responses",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/typeform/connect",
        credential_field: "api_key",
        help_link: "https://developer.typeform.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "form_id",
            type: "string",
            label: "Form ID",
          },
        ],
      },
    },
  },
  {
    id: "tally-node",
    type: "node",
    position: {
      x: 200,
      y: 400,
    },
    data: {
      service: "tally",
      event: "get_submissions",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/tally/connect",
        credential_field: "api_key",
        help_link: "https://developers.tally.so",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "form_id",
            type: "string",
            label: "Form ID",
          },
        ],
      },
    },
  },
  {
    id: "jotform-node",
    type: "node",
    position: {
      x: 220,
      y: 400,
    },
    data: {
      service: "jotform",
      event: "get_submissions",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/jotform/connect",
        credential_field: "api_key",
        help_link: "https://api.jotform.com/docs/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "form_id",
            type: "string",
            label: "Form ID",
          },
        ],
      },
    },
  },
  {
    id: "cohere-node",
    type: "node",
    position: {
      x: 100,
      y: 400,
    },
    data: {
      service: "cohere",
      event: "generate_text",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/cohere/connect",
        credential_field: "api_key",
        help_link: "https://docs.cohere.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "model",
            type: "string",
            label: "Model ID",
          },
          {
            name: "prompt",
            type: "string",
            label: "Prompt",
          },
        ],
      },
    },
  },
  {
    id: "stability-node",
    type: "node",
    position: {
      x: 120,
      y: 400,
    },
    data: {
      service: "stabilityai",
      event: "generate_image",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/stabilityai/connect",
        credential_field: "api_key",
        help_link: "https://platform.stability.ai/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "prompt",
            type: "string",
            label: "Prompt",
          },
          {
            name: "cfg_scale",
            type: "number",
            label: "CFG Scale",
          },
        ],
      },
    },
  },
  {
    id: "replicate-node",
    type: "node",
    position: {
      x: 140,
      y: 400,
    },
    data: {
      service: "replicate",
      event: "run_model",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/replicate/connect",
        credential_field: "api_key",
        help_link: "https://replicate.com/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "model",
            type: "string",
            label: "Model Name",
          },
          {
            name: "input",
            type: "json",
            label: "Input Parameters",
          },
        ],
      },
    },
  },
  {
    id: "openrouter-node",
    type: "node",
    position: {
      x: 160,
      y: 400,
    },
    data: {
      service: "openrouter",
      event: "call_model",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/openrouter/connect",
        credential_field: "api_key",
        help_link: "https://openrouter.ai/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "model",
            type: "string",
            label: "Model Name",
          },
          {
            name: "prompt",
            type: "string",
            label: "Prompt",
          },
        ],
      },
    },
  },
  {
    id: "n8n-node",
    type: "node",
    position: {
      x: 300,
      y: 300,
    },
    data: {
      service: "n8n",
      event: "start_workflow",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/n8n/connect",
        credential_field: "api_key",
        help_link: "https://docs.n8n.io",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "workflow_id",
            type: "string",
            label: "Workflow ID",
          },
        ],
      },
    },
  },
  {
    id: "make-node",
    type: "node",
    position: {
      x: 320,
      y: 300,
    },
    data: {
      service: "make",
      event: "run_scenario",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/make/connect",
        credential_field: "api_key",
        help_link: "https://www.make.com/en/help/api-documentation",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "scenario_id",
            type: "string",
            label: "Scenario ID",
          },
        ],
      },
    },
  },
  {
    id: "cronjob-node",
    type: "node",
    position: {
      x: 340,
      y: 300,
    },
    data: {
      service: "cronjob",
      event: "schedule_task",
      config: {
        requires_connection: false,
        connection_type: "manual",
        connect_url: "",
        credential_field: "",
        help_link: "",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "cron_expression",
            type: "string",
            label: "Cron Expression",
          },
          {
            name: "task_url",
            type: "string",
            label: "Task URL",
          },
        ],
      },
    },
  },
  {
    id: "kafka-node",
    type: "node",
    position: {
      x: 360,
      y: 300,
    },
    data: {
      service: "kafka",
      event: "produce_message",
      config: {
        requires_connection: true,
        connection_type: "kafka",
        connect_url: "/auth/kafka/connect",
        credential_field: "bootstrap_servers",
        help_link: "https://kafka.apache.org/documentation",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "topic",
            type: "string",
            label: "Topic",
          },
          {
            name: "message",
            type: "string",
            label: "Message",
          },
        ],
      },
    },
  },
  {
    id: "rabbitmq-node",
    type: "node",
    position: {
      x: 380,
      y: 300,
    },
    data: {
      service: "rabbitmq",
      event: "publish_queue",
      config: {
        requires_connection: true,
        connection_type: "basic_auth",
        connect_url: "/auth/rabbitmq/connect",
        credential_field: "username",
        help_link: "https://www.rabbitmq.com/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "queue",
            type: "string",
            label: "Queue Name",
          },
          {
            name: "payload",
            type: "string",
            label: "Message Body",
          },
        ],
      },
    },
  },
  {
    id: "postman-node",
    type: "node",
    position: {
      x: 200,
      y: 300,
    },
    data: {
      service: "postman",
      event: "run_collection",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/postman/connect",
        credential_field: "api_key",
        help_link: "https://learning.postman.com/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "collection_id",
            type: "string",
            label: "Collection ID",
          },
          {
            name: "environment",
            type: "string",
            label: "Environment Name",
          },
        ],
      },
    },
  },
  {
    id: "vercel-node",
    type: "node",
    position: {
      x: 220,
      y: 300,
    },
    data: {
      service: "vercel",
      event: "deploy_project",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/vercel/connect",
        credential_field: "access_token",
        help_link: "https://vercel.com/docs/rest-api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "project_id",
            type: "string",
            label: "Project ID",
          },
        ],
      },
    },
  },
  {
    id: "railway-node",
    type: "node",
    position: {
      x: 240,
      y: 300,
    },
    data: {
      service: "railway",
      event: "deploy_service",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/railway/connect",
        credential_field: "api_key",
        help_link: "https://docs.railway.app/develop/cli",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "service_id",
            type: "string",
            label: "Service ID",
          },
        ],
      },
    },
  },
  {
    id: "netlify-node",
    type: "node",
    position: {
      x: 260,
      y: 300,
    },
    data: {
      service: "netlify",
      event: "trigger_build",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/netlify/connect",
        credential_field: "api_key",
        help_link: "https://docs.netlify.com/api/get-started/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "site_id",
            type: "string",
            label: "Site ID",
          },
        ],
      },
    },
  },
  {
    id: "cloudflare-node",
    type: "node",
    position: {
      x: 280,
      y: 300,
    },
    data: {
      service: "cloudflare",
      event: "purge_cache",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/cloudflare/connect",
        credential_field: "api_key",
        help_link: "https://developers.cloudflare.com/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "zone_id",
            type: "string",
            label: "Zone ID",
          },
        ],
      },
    },
  },
  {
    id: "mailchimp-node",
    type: "node",
    position: {
      x: 100,
      y: 300,
    },
    data: {
      service: "mailchimp",
      event: "add_subscriber",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/mailchimp/connect",
        credential_field: "api_key",
        help_link: "https://mailchimp.com/developer",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "list_id",
            type: "string",
            label: "Audience List ID",
          },
          {
            name: "email",
            type: "string",
            label: "Email Address",
          },
        ],
      },
    },
  },
  {
    id: "activecampaign-node",
    type: "node",
    position: {
      x: 120,
      y: 300,
    },
    data: {
      service: "activecampaign",
      event: "create_contact",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/activecampaign/connect",
        credential_field: "api_key",
        help_link: "https://developers.activecampaign.com/reference",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "email",
            type: "string",
            label: "Email",
          },
          {
            name: "first_name",
            type: "string",
            label: "First Name",
          },
        ],
      },
    },
  },
  {
    id: "drip-node",
    type: "node",
    position: {
      x: 140,
      y: 300,
    },
    data: {
      service: "drip",
      event: "add_subscriber",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/drip/connect",
        credential_field: "api_key",
        help_link: "https://developer.drip.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "email",
            type: "string",
            label: "Email Address",
          },
          {
            name: "tags",
            type: "string",
            label: "Tags (comma-separated)",
          },
        ],
      },
    },
  },
  {
    id: "sendinblue-node",
    type: "node",
    position: {
      x: 160,
      y: 300,
    },
    data: {
      service: "sendinblue",
      event: "send_email",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/sendinblue/connect",
        credential_field: "api_key",
        help_link: "https://developers.sendinblue.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "recipient",
            type: "string",
            label: "Recipient Email",
          },
          {
            name: "subject",
            type: "string",
            label: "Subject",
          },
          {
            name: "content",
            type: "string",
            label: "Email Content",
          },
        ],
      },
    },
  },
  {
    id: "convertkit-node",
    type: "node",
    position: {
      x: 180,
      y: 300,
    },
    data: {
      service: "convertkit",
      event: "add_subscriber",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/convertkit/connect",
        credential_field: "api_key",
        help_link: "https://developers.convertkit.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "form_id",
            type: "string",
            label: "Form ID",
          },
          {
            name: "email",
            type: "string",
            label: "Subscriber Email",
          },
        ],
      },
    },
  },
  {
    id: "plaid-node",
    type: "node",
    position: {
      x: 100,
      y: 200,
    },
    data: {
      service: "plaid",
      event: "get_transactions",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/plaid/connect",
        credential_field: "api_key",
        help_link: "https://plaid.com/docs/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "access_token",
            type: "string",
            label: "Access Token",
          },
          {
            name: "start_date",
            type: "string",
            label: "Start Date",
          },
          {
            name: "end_date",
            type: "string",
            label: "End Date",
          },
        ],
      },
    },
  },
  {
    id: "discord-node",
    type: "node",
    position: {
      x: 120,
      y: 200,
    },
    data: {
      service: "discord",
      event: "send_message",
      config: {
        requires_connection: true,
        connection_type: "webhook",
        connect_url: "",
        credential_field: "webhook_url",
        help_link: "https://discord.com/developers/docs/resources/webhook",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "webhook_url",
            type: "string",
            label: "Webhook URL",
          },
          {
            name: "content",
            type: "string",
            label: "Message",
          },
        ],
      },
    },
  },
  {
    id: "paypal-node",
    type: "node",
    position: {
      x: 140,
      y: 200,
    },
    data: {
      service: "paypal",
      event: "create_order",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/paypal/connect",
        credential_field: "access_token",
        help_link: "https://developer.paypal.com/docs/api/orders/v2/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "access_token",
            type: "string",
            label: "Access Token",
          },
          {
            name: "order",
            type: "json",
            label: "Order Data",
          },
        ],
      },
    },
  },
  {
    id: "bitbucket-node",
    type: "node",
    position: {
      x: 160,
      y: 200,
    },
    data: {
      service: "bitbucket",
      event: "create_repo",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/bitbucket/connect",
        credential_field: "access_token",
        help_link: "https://developer.atlassian.com/bitbucket/api/2/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "repo_name",
            type: "string",
            label: "Repository Name",
          },
          {
            name: "is_private",
            type: "boolean",
            label: "Private?",
          },
        ],
      },
    },
  },
  {
    id: "tiktok-node",
    type: "node",
    position: {
      x: 180,
      y: 200,
    },
    data: {
      service: "tiktok",
      event: "upload_video",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/tiktok/connect",
        credential_field: "access_token",
        help_link: "https://developers.tiktok.com/doc/upload-video/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "video",
            type: "string",
            label: "Video Base64",
          },
          {
            name: "description",
            type: "string",
            label: "Caption",
          },
        ],
      },
    },
  },
  {
    id: "shopify-node",
    type: "node",
    position: {
      x: 200,
      y: 200,
    },
    data: {
      service: "shopify",
      event: "create_order",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/shopify/connect",
        credential_field: "api_key",
        help_link: "https://shopify.dev/docs/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "shop_domain",
            type: "string",
            label: "Shop Domain",
          },
          {
            name: "order",
            type: "json",
            label: "Order Data",
          },
        ],
      },
    },
  },
  {
    id: "woocommerce-node",
    type: "node",
    position: {
      x: 220,
      y: 200,
    },
    data: {
      service: "woocommerce",
      event: "create_product",
      config: {
        requires_connection: true,
        connection_type: "basic_auth",
        connect_url: "/auth/woocommerce/connect",
        credential_field: "consumer_key",
        help_link: "https://woocommerce.github.io/woocommerce-rest-api-docs/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "product",
            type: "json",
            label: "Product Data",
          },
        ],
      },
    },
  },
  {
    id: "oracle-node",
    type: "node",
    position: {
      x: 240,
      y: 200,
    },
    data: {
      service: "oracle",
      event: "query_database",
      config: {
        requires_connection: true,
        connection_type: "oracle",
        connect_url: "/auth/oracle/connect",
        credential_field: "connection_string",
        help_link: "https://docs.oracle.com/en/database/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "connection_string",
            type: "string",
            label: "Connection String",
          },
          {
            name: "query",
            type: "string",
            label: "SQL Query",
          },
        ],
      },
    },
  },
  {
    id: "bigquery-node",
    type: "node",
    position: {
      x: 260,
      y: 200,
    },
    data: {
      service: "bigquery",
      event: "run_query",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/bigquery/connect",
        credential_field: "access_token",
        help_link: "https://cloud.google.com/bigquery/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "project_id",
            type: "string",
            label: "Project ID",
          },
          {
            name: "query",
            type: "string",
            label: "SQL Query",
          },
        ],
      },
    },
  },
  {
    id: "tableau-node",
    type: "node",
    position: {
      x: 280,
      y: 200,
    },
    data: {
      service: "tableau",
      event: "publish_workbook",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/tableau/connect",
        credential_field: "access_token",
        help_link:
          "https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api_ref.htm",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "site_id",
            type: "string",
            label: "Site ID",
          },
          {
            name: "workbook_data",
            type: "json",
            label: "Workbook JSON",
          },
        ],
      },
    },
  },
  {
    id: "onedrive-node",
    type: "node",
    position: {
      x: 300,
      y: 200,
    },
    data: {
      service: "onedrive",
      event: "upload_file",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/onedrive/connect",
        credential_field: "access_token",
        help_link:
          "https://learn.microsoft.com/en-us/graph/api/resources/onedrive",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "filename",
            type: "string",
            label: "File Name",
          },
          {
            name: "content",
            type: "string",
            label: "Content",
          },
        ],
      },
    },
  },
  {
    id: "freshdesk-node",
    type: "node",
    position: {
      x: 320,
      y: 200,
    },
    data: {
      service: "freshdesk",
      event: "create_ticket",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/freshdesk/connect",
        credential_field: "api_key",
        help_link: "https://developers.freshdesk.com/api/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "subject",
            type: "string",
            label: "Subject",
          },
          {
            name: "description",
            type: "string",
            label: "Description",
          },
        ],
      },
    },
  },
  {
    id: "clockify-node",
    type: "node",
    position: {
      x: 340,
      y: 200,
    },
    data: {
      service: "clockify",
      event: "log_time",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/clockify/connect",
        credential_field: "api_key",
        help_link: "https://docs.clockify.me/#tag/Time-Entries",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "project_id",
            type: "string",
            label: "Project ID",
          },
          {
            name: "duration",
            type: "string",
            label: "Time Duration",
          },
        ],
      },
    },
  },
  {
    id: "medium-node",
    type: "node",
    position: {
      x: 360,
      y: 200,
    },
    data: {
      service: "medium",
      event: "create_post",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/medium/connect",
        credential_field: "access_token",
        help_link: "https://github.com/Medium/medium-api-docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "title",
            type: "string",
            label: "Title",
          },
          {
            name: "content",
            type: "string",
            label: "Content",
          },
        ],
      },
    },
  },
  {
    id: "pinterest-node",
    type: "node",
    position: {
      x: 380,
      y: 200,
    },
    data: {
      service: "pinterest",
      event: "create_pin",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/pinterest/connect",
        credential_field: "access_token",
        help_link: "https://developers.pinterest.com/docs/api/v5/",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "board_id",
            type: "string",
            label: "Board ID",
          },
          {
            name: "note",
            type: "string",
            label: "Note",
          },
          {
            name: "link",
            type: "string",
            label: "Link",
          },
        ],
      },
    },
  },
  {
    id: "google-calendar-node",
    type: "node",
    position: {
      x: 300,
      y: 100,
    },
    data: {
      service: "google_calendar",
      event: "create_event",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/calendar",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "calendar_id",
            type: "string",
            label: "Calendar ID",
          },
          {
            name: "event_details",
            type: "json",
            label: "Event Details",
          },
        ],
      },
    },
  },
  {
    id: "twilio-node",
    type: "node",
    position: {
      x: 320,
      y: 100,
    },
    data: {
      service: "twilio",
      event: "send_sms",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/twilio/connect",
        credential_field: "account_sid",
        help_link: "https://www.twilio.com/docs/sms",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "account_sid",
            type: "string",
            label: "Account SID",
          },
          {
            name: "to_number",
            type: "string",
            label: "Recipient Number",
          },
          {
            name: "message_body",
            type: "string",
            label: "Message",
          },
        ],
      },
    },
  },
  {
    id: "stripe-node",
    type: "node",
    position: {
      x: 340,
      y: 100,
    },
    data: {
      service: "stripe",
      event: "create_payment_intent",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/stripe/connect",
        credential_field: "api_key",
        help_link: "https://stripe.com/docs/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "amount",
            type: "number",
            label: "Amount (in cents)",
          },
          {
            name: "currency",
            type: "string",
            label: "Currency",
          },
        ],
      },
    },
  },
  {
    id: "sendgrid-node",
    type: "node",
    position: {
      x: 360,
      y: 100,
    },
    data: {
      service: "sendgrid",
      event: "send_email",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/sendgrid/connect",
        credential_field: "api_key",
        help_link: "https://docs.sendgrid.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "to",
            type: "string",
            label: "Recipient Email",
          },
          {
            name: "subject",
            type: "string",
            label: "Subject",
          },
          {
            name: "body",
            type: "string",
            label: "Email Body",
          },
        ],
      },
    },
  },
  {
    id: "notion-node",
    type: "node",
    position: {
      x: 380,
      y: 100,
    },
    data: {
      service: "notion",
      event: "create_page",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/notion/connect",
        credential_field: "access_token",
        help_link: "https://developers.notion.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "database_id",
            type: "string",
            label: "Database ID",
          },
          {
            name: "properties",
            type: "json",
            label: "Page Properties",
          },
        ],
      },
    },
  },
  {
    id: "webflow-node",
    type: "node",
    position: {
      x: 400,
      y: 100,
    },
    data: {
      service: "webflow",
      event: "create_item",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/webflow/connect",
        credential_field: "api_key",
        help_link: "https://developers.webflow.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "collection_id",
            type: "string",
            label: "Collection ID",
          },
          {
            name: "fields",
            type: "json",
            label: "Item Fields",
          },
        ],
      },
    },
  },
  {
    id: "figma-node",
    type: "node",
    position: {
      x: 420,
      y: 100,
    },
    data: {
      service: "figma",
      event: "get_file",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/figma/connect",
        credential_field: "access_token",
        help_link: "https://www.figma.com/developers/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "file_key",
            type: "string",
            label: "File Key",
          },
        ],
      },
    },
  },
  {
    id: "zapier-node",
    type: "node",
    position: {
      x: 440,
      y: 100,
    },
    data: {
      service: "zapier",
      event: "create_zap",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/zapier/connect",
        credential_field: "api_key",
        help_link: "https://zapier.com/developer/documentation",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "zap_id",
            type: "string",
            label: "Zap ID",
          },
        ],
      },
    },
  },
  {
    id: "dropbox-node",
    type: "node",
    position: {
      x: 460,
      y: 100,
    },
    data: {
      service: "dropbox",
      event: "upload_file",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/dropbox/connect",
        credential_field: "access_token",
        help_link: "https://www.dropbox.com/developers/documentation",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "file_path",
            type: "string",
            label: "File Path",
          },
          {
            name: "content",
            type: "string",
            label: "File Content",
          },
        ],
      },
    },
  },
  {
    id: "asana-node",
    type: "node",
    position: {
      x: 480,
      y: 100,
    },
    data: {
      service: "asana",
      event: "create_task",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/asana/connect",
        credential_field: "access_token",
        help_link: "https://developers.asana.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "workspace_id",
            type: "string",
            label: "Workspace ID",
          },
          {
            name: "name",
            type: "string",
            label: "Task Name",
          },
        ],
      },
    },
  },
  {
    id: "monday-node",
    type: "node",
    position: {
      x: 500,
      y: 100,
    },
    data: {
      service: "monday",
      event: "create_item",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/monday/connect",
        credential_field: "api_key",
        help_link: "https://developer.monday.com",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "board_id",
            type: "string",
            label: "Board ID",
          },
          {
            name: "item_name",
            type: "string",
            label: "Item Name",
          },
        ],
      },
    },
  },
  {
    id: "airtable-node",
    type: "node",
    position: {
      x: 520,
      y: 100,
    },
    data: {
      service: "airtable",
      event: "create_record",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/airtable/connect",
        credential_field: "api_key",
        help_link: "https://airtable.com/api",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "base_id",
            type: "string",
            label: "Base ID",
          },
          {
            name: "table_name",
            type: "string",
            label: "Table",
          },
        ],
      },
    },
  },
  {
    id: "hubspot-node",
    type: "node",
    position: {
      x: 540,
      y: 100,
    },
    data: {
      service: "hubspot",
      event: "create_contact",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/hubspot/connect",
        credential_field: "access_token",
        help_link: "https://developers.hubspot.com/docs/api/crm/contacts",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "properties",
            type: "json",
            label: "Contact Properties",
          },
        ],
      },
    },
  },
  {
    id: "google-drive-node",
    type: "node",
    position: {
      x: 560,
      y: 100,
    },
    data: {
      service: "google_drive",
      event: "upload_file",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/drive",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "filename",
            type: "string",
            label: "File Name",
          },
          {
            name: "file_content",
            type: "string",
            label: "Content",
          },
        ],
      },
    },
  },
  {
    id: "trello-node",
    type: "node",
    position: {
      x: 580,
      y: 100,
    },
    data: {
      service: "trello",
      event: "create_card",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/trello/connect",
        credential_field: "api_key",
        help_link: "https://developer.atlassian.com/cloud/trello",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "list_id",
            type: "string",
            label: "List ID",
          },
          {
            name: "name",
            type: "string",
            label: "Card Title",
          },
        ],
      },
    },
  },
  {
    id: "firebase-node",
    type: "node",
    position: {
      x: 600,
      y: 100,
    },
    data: {
      service: "firebase",
      event: "write_document",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/firebase/connect",
        credential_field: "api_key",
        help_link: "https://firebase.google.com/docs/firestore",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "collection",
            type: "string",
            label: "Collection",
          },
          {
            name: "document",
            type: "json",
            label: "Document Data",
          },
        ],
      },
    },
  },
  {
    id: "supabase-node",
    type: "node",
    position: {
      x: 620,
      y: 100,
    },
    data: {
      service: "supabase",
      event: "insert_row",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/supabase/connect",
        credential_field: "api_key",
        help_link: "https://supabase.com/docs",
        schedule: {
          enabled: false,
        },
        input_fields: [
          {
            name: "table",
            type: "string",
            label: "Table",
          },
          {
            name: "data",
            type: "json",
            label: "Row Data",
          },
        ],
      },
    },
  },
  {
    id: "zoom-create-meeting-v1",
    type: "action",
    position: { x: 220, y: 100 },
    data: {
      service: "zoom",
      action: "create_meeting",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/zoom/connect",
        credential_field: "access_token",
        help_link: "https://marketplace.zoom.us/docs/guides/auth/oauth/",
        schedule: { enabled: false },
        input_fields: [
          { name: "jwt_token", type: "string", label: "JWT Token" },
          { name: "topic", type: "string", label: "Meeting Topic" },
          { name: "start_time", type: "string", label: "Start Time" },
          { name: "duration", type: "number", label: "Duration (min)" },
        ],
      },
    },
  },
  {
    id: "teams-send-message-v1",
    type: "action",
    position: { x: 230, y: 100 },
    data: {
      service: "microsoft-teams",
      action: "send_message",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/teams/connect",
        credential_field: "access_token",
        help_link: "https://docs.microsoft.com/en-us/graph/auth-v2-user",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "team_id", type: "string", label: "Team ID" },
          { name: "channel_id", type: "string", label: "Channel ID" },
          { name: "message", type: "string", label: "Message" },
        ],
      },
    },
  },
  {
    id: "dropbox-upload-file-v1",
    type: "action",
    position: { x: 240, y: 100 },
    data: {
      service: "dropbox",
      action: "upload_file",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/dropbox/connect",
        credential_field: "access_token",
        help_link: "https://www.dropbox.com/developers/reference/oauth-guide",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "file_path", type: "string", label: "File Path" },
          { name: "content", type: "string", label: "File Content (base64)" },
        ],
      },
    },
  },
  {
    id: "box-upload-file-v1",
    type: "action",
    position: { x: 250, y: 100 },
    data: {
      service: "box",
      action: "upload_file",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/box/connect",
        credential_field: "access_token",
        help_link: "https://developer.box.com/guides/authentication/oauth2/",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "folder_id", type: "string", label: "Folder ID" },
          { name: "file_name", type: "string", label: "File Name" },
          { name: "content", type: "string", label: "File Content (base64)" },
        ],
      },
    },
  },
  {
    id: "notion-create-page-v1",
    type: "action",
    position: { x: 260, y: 100 },
    data: {
      service: "notion",
      action: "create_page",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/notion/connect",
        credential_field: "access_token",
        help_link: "https://developers.notion.com/docs/authorization",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "parent_id", type: "string", label: "Parent ID" },
          { name: "title", type: "string", label: "Title" },
          { name: "content", type: "string", label: "Content" },
        ],
      },
    },
  },
  {
    id: "monday-create-item-v1",
    type: "action",
    position: { x: 270, y: 100 },
    data: {
      service: "monday.com",
      action: "create_item",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/monday/connect",
        credential_field: "api_key",
        help_link: "https://developer.monday.com/api-reference/docs",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "board_id", type: "string", label: "Board ID" },
          { name: "item_name", type: "string", label: "Item Name" },
        ],
      },
    },
  },
  {
    id: "zoho-create-lead-v1",
    type: "action",
    position: { x: 280, y: 100 },
    data: {
      service: "zoho-crm",
      action: "create_lead",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/zoho/connect",
        credential_field: "access_token",
        help_link: "https://www.zoho.com/crm/developer/docs/api/v2/",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "lead_data", type: "object", label: "Lead Data" },
        ],
      },
    },
  },
  {
    id: "quickbooks-create-invoice-v1",
    type: "action",
    position: { x: 290, y: 100 },
    data: {
      service: "quickbooks",
      action: "create_invoice",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/quickbooks/connect",
        credential_field: "access_token",
        help_link: "https://developer.intuit.com/app/developer/qbo/docs",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "customer_id", type: "string", label: "Customer ID" },
          { name: "amount", type: "number", label: "Amount" },
        ],
      },
    },
  },
  {
    id: "shopify-create-order-v1",
    type: "action",
    position: { x: 300, y: 100 },
    data: {
      service: "shopify",
      action: "create_order",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/shopify/connect",
        credential_field: "api_key",
        help_link: "https://shopify.dev/docs/admin-api/rest/reference/orders",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "shop", type: "string", label: "Shop Name" },
          { name: "order_data", type: "object", label: "Order Data" },
        ],
      },
    },
  },
  {
    id: "woocommerce-create-order-v1",
    type: "action",
    position: { x: 310, y: 100 },
    data: {
      service: "woocommerce",
      action: "create_order",
      config: {
        requires_connection: true,
        connection_type: "basic_auth",
        connect_url: "/auth/woocommerce/connect",
        credential_field: "consumer_key",
        help_link: "https://woocommerce.github.io/woocommerce-rest-api-docs/",
        schedule: { enabled: false },
        input_fields: [
          { name: "consumer_key", type: "string", label: "Consumer Key" },
          { name: "consumer_secret", type: "string", label: "Consumer Secret" },
          { name: "store_url", type: "string", label: "Store URL" },
          { name: "order_data", type: "object", label: "Order Data" },
        ],
      },
    },
  },
  {
    id: "paypal-create-payment-v1",
    type: "action",
    position: { x: 320, y: 100 },
    data: {
      service: "paypal",
      action: "create_payment",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/paypal/connect",
        credential_field: "access_token",
        help_link: "https://developer.paypal.com/docs/api/payments/v2/",
        schedule: { enabled: false },
        input_fields: [
          { name: "client_id", type: "string", label: "Client ID" },
          { name: "client_secret", type: "string", label: "Client Secret" },
          { name: "amount", type: "number", label: "Amount" },
          { name: "currency", type: "string", label: "Currency" },
        ],
      },
    },
  },
  {
    id: "intercom-create-user-v1",
    type: "action",
    position: { x: 330, y: 100 },
    data: {
      service: "intercom",
      action: "create_user",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/intercom/connect",
        credential_field: "access_token",
        help_link: "https://developers.intercom.com/intercom-api-reference",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "user_data", type: "object", label: "User Data" },
        ],
      },
    },
  },
  {
    id: "zendesk-create-ticket-v1",
    type: "action",
    position: { x: 340, y: 100 },
    data: {
      service: "zendesk",
      action: "create_ticket",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/zendesk/connect",
        credential_field: "api_key",
        help_link:
          "https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/",
        schedule: { enabled: false },
        input_fields: [
          { name: "subdomain", type: "string", label: "Subdomain" },
          { name: "email", type: "string", label: "Email" },
          { name: "api_token", type: "string", label: "API Token" },
          { name: "subject", type: "string", label: "Subject" },
          { name: "description", type: "string", label: "Description" },
        ],
      },
    },
  },
  {
    id: "freshdesk-create-ticket-v1",
    type: "action",
    position: { x: 350, y: 100 },
    data: {
      service: "freshdesk",
      action: "create_ticket",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/freshdesk/connect",
        credential_field: "api_key",
        help_link: "https://developers.freshdesk.com/api/",
        schedule: { enabled: false },
        input_fields: [
          { name: "domain", type: "string", label: "Domain" },
          { name: "api_key", type: "string", label: "API Key" },
          { name: "subject", type: "string", label: "Subject" },
          { name: "description", type: "string", label: "Description" },
        ],
      },
    },
  },
  {
    id: "docusign-send-envelope-v1",
    type: "action",
    position: { x: 360, y: 100 },
    data: {
      service: "docusign",
      action: "send_envelope",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/docusign/connect",
        credential_field: "access_token",
        help_link: "https://developers.docusign.com",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "template_id", type: "string", label: "Template ID" },
          { name: "recipients", type: "array", label: "Recipients" },
        ],
      },
    },
  },
  {
    id: "typeform-get-responses-v1",
    type: "action",
    position: { x: 370, y: 100 },
    data: {
      service: "typeform",
      action: "get_responses",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/typeform/connect",
        credential_field: "api_key",
        help_link: "https://developer.typeform.com",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "form_id", type: "string", label: "Form ID" },
        ],
      },
    },
  },
  {
    id: "google-calendar-create-event-v1",
    type: "action",
    position: { x: 380, y: 100 },
    data: {
      service: "google-calendar",
      action: "create_event",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/calendar",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "calendar_id", type: "string", label: "Calendar ID" },
          { name: "event_data", type: "object", label: "Event Data" },
        ],
      },
    },
  },
  {
    id: "google-contacts-create-v1",
    type: "action",
    position: { x: 390, y: 100 },
    data: {
      service: "google-contacts",
      action: "create_contact",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/contacts",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "contact_data", type: "object", label: "Contact Data" },
        ],
      },
    },
  },
  {
    id: "outlook-send-email-v1",
    type: "action",
    position: { x: 400, y: 100 },
    data: {
      service: "outlook",
      action: "send_email",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/outlook/connect",
        credential_field: "access_token",
        help_link: "https://docs.microsoft.com/en-us/graph/auth-v2-user",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "to", type: "string", label: "To" },
          { name: "subject", type: "string", label: "Subject" },
          { name: "body", type: "string", label: "Body" },
        ],
      },
    },
  },
  {
    id: "bitbucket-create-issue-v1",
    type: "action",
    position: { x: 410, y: 100 },
    data: {
      service: "bitbucket",
      action: "create_issue",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/bitbucket/connect",
        credential_field: "access_token",
        help_link:
          "https://developer.atlassian.com/bitbucket/api/2/reference/resource/issues",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "repo_slug", type: "string", label: "Repo Slug" },
          { name: "title", type: "string", label: "Title" },
          { name: "content", type: "string", label: "Content" },
        ],
      },
    },
  },
  {
    id: "gitlab-create-issue-v1",
    type: "action",
    position: { x: 420, y: 100 },
    data: {
      service: "gitlab",
      action: "create_issue",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/gitlab/connect",
        credential_field: "access_token",
        help_link: "https://docs.gitlab.com/ee/api/issues.html",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "project_id", type: "string", label: "Project ID" },
          { name: "title", type: "string", label: "Title" },
          { name: "description", type: "string", label: "Description" },
        ],
      },
    },
  },
  {
    id: "sendgrid-send-email-v1",
    type: "action",
    position: { x: 430, y: 100 },
    data: {
      service: "sendgrid",
      action: "send_email",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/sendgrid/connect",
        credential_field: "api_key",
        help_link: "https://docs.sendgrid.com",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "to", type: "string", label: "To" },
          { name: "subject", type: "string", label: "Subject" },
          { name: "content", type: "string", label: "Content" },
        ],
      },
    },
  },
  {
    id: "instagram-post-photo-v1",
    type: "action",
    position: { x: 440, y: 100 },
    data: {
      service: "instagram",
      action: "post_photo",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/instagram/connect",
        credential_field: "access_token",
        help_link: "https://developers.facebook.com/docs/instagram-api",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "image_url", type: "string", label: "Image URL" },
          { name: "caption", type: "string", label: "Caption" },
        ],
      },
    },
  },
  {
    id: "linkedin-share-update-v1",
    type: "action",
    position: { x: 450, y: 100 },
    data: {
      service: "linkedin",
      action: "share_update",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/linkedin/connect",
        credential_field: "access_token",
        help_link:
          "https://docs.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "content", type: "string", label: "Content" },
          { name: "visibility", type: "string", label: "Visibility" },
        ],
      },
    },
  },
  {
    id: "xero-create-invoice-v1",
    type: "action",
    position: { x: 460, y: 100 },
    data: {
      service: "xero",
      action: "create_invoice",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/xero/connect",
        credential_field: "access_token",
        help_link: "https://developer.xero.com/documentation",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "contact_id", type: "string", label: "Contact ID" },
          { name: "amount", type: "number", label: "Amount" },
        ],
      },
    },
  },
  {
    id: "calendly-list-events-v1",
    type: "action",
    position: { x: 470, y: 100 },
    data: {
      service: "calendly",
      action: "list_events",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/calendly/connect",
        credential_field: "api_key",
        help_link: "https://developer.calendly.com",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "user_uri", type: "string", label: "User URI" },
        ],
      },
    },
  },
  {
    id: "plaid-get-accounts-v1",
    type: "action",
    position: { x: 480, y: 100 },
    data: {
      service: "plaid",
      action: "get_accounts",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/plaid/connect",
        credential_field: "api_key",
        help_link: "https://plaid.com/docs/",
        schedule: { enabled: false },
        input_fields: [
          { name: "client_id", type: "string", label: "Client ID" },
          { name: "secret", type: "string", label: "Secret" },
          { name: "access_token", type: "string", label: "Access Token" },
        ],
      },
    },
  },
  {
    id: "stripe-refund-payment-v1",
    type: "action",
    position: { x: 490, y: 100 },
    data: {
      service: "stripe",
      action: "refund_payment",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/stripe/connect",
        credential_field: "api_key",
        help_link: "https://stripe.com/docs/api",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          {
            name: "payment_intent_id",
            type: "string",
            label: "Payment Intent ID",
          },
          { name: "amount", type: "number", label: "Amount (cents)" },
        ],
      },
    },
  },
  {
    id: "google-translate-text-v1",
    type: "action",
    position: { x: 500, y: 100 },
    data: {
      service: "google-translate",
      action: "translate_text",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/google-translate/connect",
        credential_field: "api_key",
        help_link: "https://cloud.google.com/translate/docs",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "q", type: "string", label: "Text to Translate" },
          { name: "target", type: "string", label: "Target Language" },
        ],
      },
    },
  },
  {
    id: "openweather-get-weather-v1",
    type: "action",
    position: { x: 510, y: 100 },
    data: {
      service: "openweather",
      action: "get_weather",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/openweather/connect",
        credential_field: "api_key",
        help_link: "https://openweathermap.org/api",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "city", type: "string", label: "City" },
        ],
      },
    },
  },
  {
    id: "twilio-make-call-v1",
    type: "action",
    position: { x: 520, y: 100 },
    data: {
      service: "twilio",
      action: "make_call",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/twilio/connect",
        credential_field: "api_key",
        help_link: "https://www.twilio.com/docs/voice/make-calls",
        schedule: { enabled: false },
        input_fields: [
          { name: "account_sid", type: "string", label: "Account SID" },
          { name: "auth_token", type: "string", label: "Auth Token" },
          { name: "from", type: "string", label: "From Number" },
          { name: "to", type: "string", label: "To Number" },
          { name: "twiml", type: "string", label: "TwiML" },
        ],
      },
    },
  },
  {
    id: "sendinblue-send-email-v1",
    type: "action",
    position: { x: 530, y: 100 },
    data: {
      service: "sendinblue",
      action: "send_email",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/sendinblue/connect",
        credential_field: "api_key",
        help_link: "https://developers.sendinblue.com",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "to", type: "string", label: "To" },
          { name: "subject", type: "string", label: "Subject" },
          { name: "html_content", type: "string", label: "HTML Content" },
        ],
      },
    },
  },
  {
    id: "hubspot-create-ticket-v1",
    type: "action",
    position: { x: 540, y: 100 },
    data: {
      service: "hubspot",
      action: "create_ticket",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/hubspot/connect",
        credential_field: "api_key",
        help_link: "https://developers.hubspot.com/docs/api/crm/tickets",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "portal_id", type: "string", label: "Portal ID" },
          { name: "subject", type: "string", label: "Subject" },
          { name: "content", type: "string", label: "Content" },
        ],
      },
    },
  },
  {
    id: "salesforce-create-lead-v1",
    type: "action",
    position: { x: 550, y: 100 },
    data: {
      service: "salesforce",
      action: "create_lead",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/salesforce/connect",
        credential_field: "access_token",
        help_link:
          "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_understanding_authentication.htm",
        schedule: { enabled: false },
        input_fields: [
          { name: "instance_url", type: "string", label: "Instance URL" },
          { name: "access_token", type: "string", label: "Access Token" },
          { name: "refresh_token", type: "string", label: "Refresh Token" },
          { name: "lead_data", type: "object", label: "Lead Data" },
        ],
      },
    },
  },
  {
    id: "asana-list-projects-v1",
    type: "action",
    position: { x: 560, y: 100 },
    data: {
      service: "asana",
      action: "list_projects",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/asana/connect",
        credential_field: "access_token",
        help_link: "https://developers.asana.com",
        schedule: { enabled: false },
        input_fields: [
          { name: "access_token", type: "string", label: "Access Token" },
        ],
      },
    },
  },
  {
    id: "trello-archive-card-v1",
    type: "action",
    position: { x: 570, y: 100 },
    data: {
      service: "trello",
      action: "archive_card",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/trello/connect",
        credential_field: "api_key",
        help_link: "https://developer.atlassian.com/cloud/trello",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "token", type: "string", label: "Token" },
          { name: "card_id", type: "string", label: "Card ID" },
        ],
      },
    },
  },
  {
    id: "airtable-list-bases-v1",
    type: "action",
    position: { x: 580, y: 100 },
    data: {
      service: "airtable",
      action: "list_bases",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/airtable/connect",
        credential_field: "api_key",
        help_link: "https://airtable.com/api",
        schedule: { enabled: false },
        input_fields: [{ name: "api_key", type: "string", label: "API Key" }],
      },
    },
  },
  {
    id: "mongodb-find-documents-v1",
    type: "action",
    position: { x: 590, y: 100 },
    data: {
      service: "mongodb",
      action: "find_documents",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/mongodb/connect",
        credential_field: "api_key",
        help_link: "https://www.mongodb.com/docs/manual/reference/command/",
        schedule: { enabled: false },
        input_fields: [
          { name: "uri", type: "string", label: "MongoDB URI" },
          { name: "database", type: "string", label: "Database" },
          { name: "collection", type: "string", label: "Collection" },
          { name: "query", type: "object", label: "Query" },
        ],
      },
    },
  },
  {
    id: "elasticsearch-search-index-v1",
    type: "action",
    position: { x: 600, y: 100 },
    data: {
      service: "elasticsearch",
      action: "search_index",
      config: {
        requires_connection: true,
        connection_type: "basic_auth",
        connect_url: "/auth/elasticsearch/connect",
        credential_field: "username",
        help_link:
          "https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html",
        schedule: { enabled: false },
        input_fields: [
          { name: "node_url", type: "string", label: "Node URL" },
          { name: "index", type: "string", label: "Index" },
          { name: "query", type: "object", label: "Query" },
        ],
      },
    },
  },
  {
    id: "firebase-send-notification-v1",
    type: "action",
    position: { x: 610, y: 100 },
    data: {
      service: "firebase",
      action: "send_notification",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/firebase/connect",
        credential_field: "api_key",
        help_link: "https://firebase.google.com/docs/cloud-messaging",
        schedule: { enabled: false },
        input_fields: [
          { name: "server_key", type: "string", label: "Server Key" },
          { name: "to", type: "string", label: "To" },
          { name: "notification", type: "object", label: "Notification" },
        ],
      },
    },
  },
  {
    id: "segment-track-event-v1",
    type: "action",
    position: { x: 620, y: 100 },
    data: {
      service: "segment",
      action: "track_event",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/segment/connect",
        credential_field: "api_key",
        help_link:
          "https://segment.com/docs/connections/sources/catalog/libraries/server/http-api/",
        schedule: { enabled: false },
        input_fields: [
          { name: "write_key", type: "string", label: "Write Key" },
          { name: "event", type: "string", label: "Event" },
          { name: "properties", type: "object", label: "Properties" },
        ],
      },
    },
  },
  {
    id: "mixpanel-track-event-v1",
    type: "action",
    position: { x: 630, y: 100 },
    data: {
      service: "mixpanel",
      action: "track_event",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/mixpanel/connect",
        credential_field: "api_key",
        help_link: "https://developer.mixpanel.com/docs/http",
        schedule: { enabled: false },
        input_fields: [
          { name: "token", type: "string", label: "Token" },
          { name: "event", type: "string", label: "Event" },
          { name: "properties", type: "object", label: "Properties" },
        ],
      },
    },
  },
  {
    id: "amplitude-log-event-v1",
    type: "action",
    position: { x: 640, y: 100 },
    data: {
      service: "amplitude",
      action: "log_event",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/amplitude/connect",
        credential_field: "api_key",
        help_link: "https://developers.amplitude.com/docs/http-api-v2",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key" },
          { name: "event_type", type: "string", label: "Event Type" },
          {
            name: "event_properties",
            type: "object",
            label: "Event Properties",
          },
        ],
      },
    },
  },
  {
    id: "algolia-search-v1",
    type: "action",
    position: { x: 650, y: 100 },
    data: {
      service: "algolia",
      action: "search",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/algolia/connect",
        credential_field: "api_key",
        help_link: "https://www.algolia.com/doc",
        schedule: { enabled: false },
        input_fields: [
          { name: "app_id", type: "string", label: "App ID" },
          { name: "api_key", type: "string", label: "API Key" },
          { name: "index_name", type: "string", label: "Index Name" },
          { name: "query", type: "string", label: "Query" },
        ],
      },
    },
  },
  {
    id: "zapier-trigger-zap-v1",
    type: "action",
    position: { x: 660, y: 100 },
    data: {
      service: "zapier",
      action: "trigger_zap",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/zapier/connect",
        credential_field: "api_key",
        help_link: "https://zapier.com/developer/documentation",
        schedule: { enabled: false },
        input_fields: [
          { name: "webhook_url", type: "string", label: "Webhook URL" },
          { name: "payload", type: "object", label: "Payload" },
        ],
      },
    },
  },
  {
    id: "facebook-trigger",
    type: "trigger",
    position: { x: 700, y: 100 },
    data: {
      service: "facebook",
      event: "on_event",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/facebook/connect",
        credential_field: "access_token",
        help_link:
          "https://developers.facebook.com/docs/graph-api/webhooks/getting-started",
        schedule: { enabled: false },
        input_fields: [
          { name: "page_id", type: "string", label: "Page ID" },
          { name: "event_type", type: "string", label: "Event Type" },
        ],
      },
      name: "facebook-trigger",
      displayName: "Facebook Trigger",
      category: "trigger",
      description: "Triggers on Facebook events",
      icon: "facebook",
      color: "#1877F2",
    },
  },
  {
    id: "transform-data",
    type: "action",
    position: { x: 500, y: 100 },
    data: {
      service: "transform",
      action: "transform_data",
      name: "transform-data",
      displayName: "Transform Data",
      category: "action",
      description: "Transforms or maps input data to a new structure.",
      icon: "activity",
      color: "#6366F1",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: { enabled: false },
        input_fields: [
          {
            name: "mapping",
            type: "object",
            label: "Field Mapping",
            required: true,
          },
        ],
      },
    },
  },
  {
    id: "sheets-action",
    type: "action",
    position: { x: 600, y: 100 },
    data: {
      service: "google_sheets",
      action: "update_sheet",
      name: "sheets-action",
      displayName: "Google Sheets Action",
      category: "action",
      description:
        "Performs actions in Google Sheets, such as adding or updating rows.",
      icon: "sheets",
      color: "#0F9D58",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google-sheets/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/sheets/api/guides/values",
        schedule: { enabled: false },
        input_fields: [
          {
            name: "spreadsheet_id",
            type: "string",
            label: "Spreadsheet ID",
            required: true,
          },
          {
            name: "sheet_name",
            type: "string",
            label: "Sheet Name",
            required: true,
          },
          {
            name: "range",
            type: "string",
            label: "Range (e.g. A1:Z100)",
            required: false,
          },
          {
            name: "values",
            type: "array",
            label: "Values (Array of Arrays)",
            required: true,
          },
          {
            name: "value_input_option",
            type: "select",
            label: "Value Input Option",
            options: ["RAW", "USER_ENTERED"],
            default: "RAW",
            required: false,
          },
          {
            name: "insert_data_option",
            type: "select",
            label: "Insert Data Option",
            options: ["INSERT_ROWS", "OVERWRITE"],
            default: "INSERT_ROWS",
            required: false,
          },
        ],
      },
    },
  },
  {
    id: "sheets-trigger",
    type: "trigger",
    position: { x: 100, y: 100 },
    data: {
      service: "google_sheets",
      event: "new_row",
      name: "sheets-trigger",
      displayName: "Google Sheets Trigger",
      category: "trigger",
      description: "Triggers when a new row is added to a Google Sheet.",
      icon: "sheets",
      color: "#0F9D58",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google-sheets/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/sheets/api/guides/values",

        schedule: { enabled: false },
        input_fields: [
          {
            name: "spreadsheet_id",
            type: "string",
            label: "Spreadsheet ID",
            required: true,
          },
          {
            name: "sheet_name",
            type: "string",
            label: "Sheet Name",
            required: true,
          },
          {
            name: "range",
            type: "string",
            label: "Range (e.g. A1:Z1000)",
            required: false,
          },
          {
            name: "include_fields",
            type: "array",
            label: "Fields to Include",
            required: false,
          },
        ],
      },
    },
  },
  {
    id: "prepare-email",
    type: "function",
    position: {
      x: 400,
      y: 100,
    },
    data: {
      function: "template",
      config: {
        template: {
          subject: {
            type: "string",
            label: "Email Subject",
            required: true,
            default: "Welcome to ${company_name}!"
          },
          body: {
            type: "string",
            label: "Email Body",
            required: true,
            default: "Hi {{lead.name}},\n\nThank you for your interest in our products/services. We received your information and will contact you shortly.\n\nBest regards,\n${company_name}"
          },
          body_type: {
            type: "select",
            label: "Body Type",
            options: ["text", "html"],
            default: "text",
            required: true
          }
        }
      }
    }
  },
  {
    id: "format-message",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      label: "Format Message",
      service: "format-message",
      action: "format",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: { enabled: false },
        input_fields: [
          {
            name: "template",
            type: "string",
            label: "Message Template",
            required: true
          },
          {
            name: "variables",
            type: "json",
            label: "Variables (JSON)",
            required: false
          }
        ]
      }
    }
  },
  {
    id: "prepare-prompt",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "prepare-prompt",
      action: "prepare",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: { enabled: false },
        input_fields: [
          {
            name: "prompt_template",
            type: "string",
            label: "Prompt Template",
            required: true
          },
          {
            name: "variables",
            type: "json",
            label: "Variables (JSON)",
            required: false
          }
        ]
      }
    }
  },
  {
    id: "update-sheet",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "google-sheets",
      action: "update_sheet",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google-sheets/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/sheets/api/guides/values",
        schedule: { enabled: false },
        input_fields: [
          {
            name: "spreadsheet_id",
            type: "string",
            label: "Spreadsheet ID",
            required: true
          },
          {
            name: "sheet_name",
            type: "string",
            label: "Sheet Name",
            required: true
          },
          {
            name: "range",
            type: "string",
            label: "Range (e.g. A1:Z100)",
            required: false
          },
          {
            name: "values",
            type: "array",
            label: "Values (Array of Arrays)",
            required: true
          },
          {
            name: "value_input_option",
            type: "select",
            label: "Value Input Option",
            options: ["RAW", "USER_ENTERED"],
            default: "RAW",
            required: false
          },
          {
            name: "insert_data_option",
            type: "select",
            label: "Insert Data Option",
            options: ["INSERT_ROWS", "OVERWRITE"],
            default: "INSERT_ROWS",
            required: false
          }
        ]
      }
    }
  },
  {
    id: "manual-trigger",
    type: "trigger",
    position: { x: 0, y: 0 },
    data: {
      service: "manual-trigger",
      event: "manual",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: { enabled: false },
        input_fields: []
      }
    }
  },
  {
    id: "fetch-website",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "fetch-website",
      action: "fetch",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: { enabled: false },
        input_fields: [
          { name: "url", type: "string", label: "URL", required: true }
        ]
      }
    }
  },
  {
    id: "parse-json",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "parse-json",
      action: "parse",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: { enabled: false },
        input_fields: [
          { name: "json_string", type: "string", label: "JSON String", required: true }
        ]
      }
    }
  },
  {
    id: "prepare-task",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "prepare-task",
      action: "prepare",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: { enabled: false },
        input_fields: [
          { name: "task_template", type: "string", label: "Task Template", required: true },
          { name: "variables", type: "json", label: "Variables (JSON)", required: false }
        ]
      }
    }
  },
  {
    id: "search-hubspot",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "search-hubspot",
      action: "search",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/hubspot/connect",
        credential_field: "api_key",
        help_link: "https://developers.hubspot.com/docs/api/crm/search",
        schedule: { enabled: false },
        input_fields: [
          { name: "query", type: "string", label: "Query", required: true }
        ]
      }
    }
  },
  {
    id: "airtable-trigger",
    type: "trigger",
    position: { x: 0, y: 0 },
    data: {
      service: "airtable",
      event: "new_record",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/airtable/connect",
        credential_field: "api_key",
        help_link: "https://airtable.com/api",
        schedule: { enabled: false },
        input_fields: [
          { name: "base_id", type: "string", label: "Base ID", required: true },
          { name: "table_name", type: "string", label: "Table Name", required: true }
        ]
      }
    }
  },
  {
    id: "hubspot-trigger",
    type: "trigger",
    position: { x: 0, y: 0 },
    data: {
      label: "HubSpot Trigger",
      service: "hubspot",
      event: "new_deal",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/hubspot/connect",
        credential_field: "api_key",
        help_link: "https://developers.hubspot.com/docs/api/crm/deals",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key", required: true },
          { name: "portal_id", type: "string", label: "Portal ID", required: true }
        ]
      }
    }
  },
  {
    id: "slack-action",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      label: "Slack Action",
      service: "slack",
      action: "send_message",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/slack/connect",
        credential_field: "access_token",
        help_link: "https://api.slack.com/authentication/oauth-v2",
        schedule: { enabled: false },
        input_fields: [
          { name: "channel_id", type: "string", label: "Channel ID", required: true },
          { name: "bot_token", type: "string", label: "Bot Token", required: true },
          { name: "message", type: "string", label: "Message", required: true }
        ]
      }
    }
  },
  {
    id: "transform-data",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "transform-data",
      action: "transform",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: { enabled: false },
        input_fields: [
          { name: "mapping", type: "object", label: "Field Mapping", required: true }
        ]
      }
    }
  },
  {
    id: "sheets-action",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "google-sheets",
      action: "write_row",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google-sheets/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/sheets/api/guides/values",
        schedule: { enabled: false },
        input_fields: [
          { name: "spreadsheet_id", type: "string", label: "Spreadsheet ID", required: true },
          { name: "sheet_name", type: "string", label: "Sheet Name", required: true },
          { name: "values", type: "array", label: "Values", required: true }
        ]
      }
    }
  },
  {
    id: "sheets-trigger",
    type: "trigger",
    position: { x: 0, y: 0 },
    data: {
      service: "google-sheets",
      event: "new_row",
      config: {
        requires_connection: true,
        connection_type: "oauth2",
        connect_url: "/auth/google-sheets/connect",
        credential_field: "access_token",
        help_link: "https://developers.google.com/sheets/api/guides/values",
        schedule: { enabled: false },
        input_fields: [
          { name: "spreadsheet_id", type: "string", label: "Spreadsheet ID", required: true },
          { name: "sheet_name", type: "string", label: "Sheet Name", required: true }
        ]
      }
    }
  },
  {
    id: "clickup-action",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "clickup",
      action: "create_task",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/clickup/connect",
        credential_field: "api_key",
        help_link: "https://clickup.com/api",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key", required: true },
          { name: "list_id", type: "string", label: "List ID", required: true },
          { name: "task_name", type: "string", label: "Task Name", required: true }
        ]
      }
    }
  },
  {
    id: "prepare-data",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "prepare-data",
      action: "prepare",
      config: {
        requires_connection: false,
        connection_type: null,
        connect_url: null,
        credential_field: null,
        help_link: null,
        schedule: { enabled: false },
        input_fields: [
          { name: "data_template", type: "string", label: "Data Template", required: true },
          { name: "variables", type: "json", label: "Variables (JSON)", required: false }
        ]
      }
    }
  },
  {
    id: "get-deal-data",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "hubspot",
      action: "get_deal_data",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/hubspot/connect",
        credential_field: "api_key",
        help_link: "https://developers.hubspot.com/docs/api/crm/deals",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key", required: true },
          { name: "portal_id", type: "string", label: "Portal ID", required: true },
          { name: "deal_id", type: "string", label: "Deal ID", required: true }
        ]
      }
    }
  },
  {
    id: "hubspot-action",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "hubspot",
      action: "action",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/hubspot/connect",
        credential_field: "api_key",
        help_link: "https://developers.hubspot.com/docs/api/crm/deals",
        schedule: { enabled: false },
        input_fields: [
          { name: "api_key", type: "string", label: "API Key", required: true },
          { name: "portal_id", type: "string", label: "Portal ID", required: true }
        ]
      }
    }
  },
  {
    id: "pipedrive-trigger",
    type: "trigger",
    position: { x: 0, y: 0 },
    data: {
      service: "pipedrive",
      event: "new_deal",
      config: { requires_connection: true, connection_type: "api_key", connect_url: "/auth/pipedrive/connect", credential_field: "api_key", help_link: "https://developers.pipedrive.com/docs/api/v1/", schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "forms-trigger",
    type: "trigger",
    position: { x: 0, y: 0 },
    data: {
      service: "forms",
      event: "new_submission",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "search-person",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "search-person",
      action: "search",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "prepare-deal",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "prepare-deal",
      action: "prepare",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "create-person",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "create-person",
      action: "create",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "create-deal",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "create-deal",
      action: "create",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "prepare-card",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "prepare-card",
      action: "prepare",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "set-due-date",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "set-due-date",
      action: "set_due_date",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "trello-action",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "trello",
      action: "action",
      config: { requires_connection: true, connection_type: "api_key", connect_url: "/auth/trello/connect", credential_field: "api_key", help_link: "https://developer.atlassian.com/cloud/trello/rest/api-group-actions/", schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "prepare-subscriber",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "prepare-subscriber",
      action: "prepare",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "salesforce-trigger",
    type: "trigger",
    position: { x: 0, y: 0 },
    data: {
      service: "salesforce",
      event: "new_record",
      config: { requires_connection: true, connection_type: "oauth2", connect_url: "/auth/salesforce/connect", credential_field: "access_token", help_link: "https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/", schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "determine-channel",
    type: "function",
    position: { x: 0, y: 0 },
    data: {
      service: "determine-channel",
      action: "determine",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "create-document",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "create-document",
      action: "create",
      config: { requires_connection: false, connection_type: null, connect_url: null, credential_field: null, help_link: null, schedule: { enabled: false }, input_fields: [] }
    }
  },
  {
    id: "mailchimp-action",
    type: "action",
    position: { x: 0, y: 0 },
    data: {
      service: "mailchimp",
      action: "add_subscriber",
      config: {
        requires_connection: true,
        connection_type: "api_key",
        connect_url: "/auth/mailchimp/connect",
        credential_field: "api_key",
        help_link: "https://mailchimp.com/developer",
        schedule: { enabled: false },
        input_fields: [
          { name: "list_id", type: "string", label: "Audience List ID", required: true },
          { name: "email", type: "string", label: "Email Address", required: true }
        ]
      }
    }
  },
];

export function getNodeConfigById(id: string) {
  return nodeConfigs.find((node) => node.id === id) || null;
}

export { nodeConfigs };

async function seedNodes() {
  for (const node of nodeConfigs) {
    try {
      await db.insert(nodeTypes).values({
        nodeId: node.id || '',
        type: node.type || '',
        position: node.position || {},
        data: node.data || {},
        name: node.data?.name || node.id || node.data?.service || '',
        displayName: node.data?.displayName || node.data?.service || node.id || '',
        category: node.data?.category || node.type || 'action',
        description: node.data?.description || node.data?.action || node.data?.event || '',
        icon: node.data?.icon || '',
        color: node.data?.color || '',
        inputFields: node.data?.config?.input_fields || [],
        outputFields: [],
      });
      console.log(`Seeded node: ${node.id}`);
    } catch (err) {
      console.error(`Error seeding node ${node.id}:`, err);
    }
  }
  process.exit(0);
}

// Node.js ES module entrypoint check

seedNodes().catch((err) => {
  console.error("Error seeding nodes:", err);
  process.exit(1);
});
