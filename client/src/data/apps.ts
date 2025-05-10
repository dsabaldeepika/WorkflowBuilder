import { App } from "@/types/workflow";
import { 
  Table, Bot, Cloud, Mail, Globe, Bell, 
  FileSpreadsheet, Database, Sparkles, Send,
  Calendar, Image, User, Settings, Eye, Search, 
  Plus, Edit, Trash 
} from "lucide-react";

export const apps: App[] = [
  {
    id: "google-sheets",
    label: "Google Sheets",
    description: "Spreadsheet operations",
    icon: FileSpreadsheet,
    iconBg: "green",
    iconColor: "green",
    modules: [
      { 
        id: "watch-new-rows", 
        label: "Watch New Rows", 
        description: "Triggers when a new row is added to the sheet", 
        type: "trigger",
        icon: Eye
      },
      { 
        id: "read-data", 
        label: "Read Data", 
        description: "Retrieves data from a spreadsheet", 
        type: "action",
        icon: Search
      },
      { 
        id: "add-row", 
        label: "Add a Row", 
        description: "Appends a new row to the sheet", 
        type: "action",
        icon: Plus
      },
      { 
        id: "update-row", 
        label: "Update Row", 
        description: "Updates an existing row in the sheet", 
        type: "action",
        icon: Edit
      },
      { 
        id: "delete-row", 
        label: "Delete Row", 
        description: "Removes a row from the sheet", 
        type: "action",
        icon: Trash
      }
    ]
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "AI integration",
    icon: Sparkles,
    iconBg: "purple",
    iconColor: "purple",
    modules: [
      { 
        id: "generate-text", 
        label: "Generate Text", 
        description: "Create content with AI", 
        type: "action",
        icon: Edit
      },
      { 
        id: "analyze-sentiment", 
        label: "Analyze Sentiment", 
        description: "Detect sentiment in text", 
        type: "action",
        icon: Search
      }
    ]
  },
  {
    id: "dropbox",
    label: "Dropbox",
    description: "Cloud storage",
    icon: Cloud,
    iconBg: "blue",
    iconColor: "blue",
    modules: [
      { 
        id: "watch-file", 
        label: "Watch for File", 
        description: "Triggers when a new file is added", 
        type: "trigger",
        icon: Eye
      },
      { 
        id: "upload-file", 
        label: "Upload File", 
        description: "Uploads a file to Dropbox", 
        type: "action",
        icon: Plus
      }
    ]
  },
  {
    id: "gmail",
    label: "Gmail",
    description: "Email operations",
    icon: Mail,
    iconBg: "red",
    iconColor: "red",
    modules: [
      { 
        id: "watch-emails", 
        label: "Watch Emails", 
        description: "Triggers when new emails arrive", 
        type: "trigger",
        icon: Eye
      },
      { 
        id: "send-email", 
        label: "Send Email", 
        description: "Sends an email via Gmail", 
        type: "action",
        icon: Send
      }
    ]
  },
  {
    id: "http",
    label: "HTTP",
    description: "API requests",
    icon: Globe,
    iconBg: "blue",
    iconColor: "blue",
    modules: [
      { 
        id: "webhook", 
        label: "Webhook", 
        description: "Creates an endpoint to receive data", 
        type: "trigger",
        icon: Globe
      },
      { 
        id: "make-request", 
        label: "Make Request", 
        description: "Sends an HTTP request", 
        type: "action",
        icon: Send
      }
    ]
  },
  {
    id: "slack",
    label: "Slack",
    description: "Chat & notifications",
    icon: Bell,
    iconBg: "yellow",
    iconColor: "yellow",
    modules: [
      { 
        id: "watch-messages", 
        label: "Watch Messages", 
        description: "Triggers when new messages are posted", 
        type: "trigger",
        icon: Eye
      },
      { 
        id: "send-message", 
        label: "Send Message", 
        description: "Posts a message to a Slack channel", 
        type: "action",
        icon: Send
      }
    ]
  },
  {
    id: "airtable",
    label: "Airtable",
    description: "Database operations",
    icon: Database,
    iconBg: "teal",
    iconColor: "teal",
    modules: [
      { 
        id: "watch-records", 
        label: "Watch Records", 
        description: "Triggers when records are added/modified", 
        type: "trigger",
        icon: Eye
      },
      { 
        id: "create-record", 
        label: "Create Record", 
        description: "Creates a new record", 
        type: "action",
        icon: Plus
      }
    ]
  },
  {
    id: "zoom",
    label: "Zoom",
    description: "Video meetings",
    icon: Send,
    iconBg: "blue",
    iconColor: "blue",
    modules: [
      { 
        id: "meeting-scheduled", 
        label: "Meeting Scheduled", 
        description: "Triggers when a new meeting is created", 
        type: "trigger",
        icon: Calendar
      },
      { 
        id: "create-meeting", 
        label: "Create Meeting", 
        description: "Creates a new Zoom meeting", 
        type: "action",
        icon: Plus
      }
    ]
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Social media integration",
    icon: Image,
    iconBg: "pink",
    iconColor: "pink",
    modules: [
      { 
        id: "new-post", 
        label: "New Post", 
        description: "Triggers when a new post is published", 
        type: "trigger",
        icon: Eye
      },
      { 
        id: "post-image", 
        label: "Post Image", 
        description: "Creates a new Instagram post", 
        type: "action",
        icon: Image
      }
    ]
  },
  {
    id: "stripe",
    label: "Stripe",
    description: "Payment processing",
    icon: Settings,
    iconBg: "indigo",
    iconColor: "indigo",
    modules: [
      { 
        id: "payment-received", 
        label: "Payment Received", 
        description: "Triggers when a payment is completed", 
        type: "trigger",
        icon: Eye
      },
      { 
        id: "create-customer", 
        label: "Create Customer", 
        description: "Creates a new Stripe customer", 
        type: "action",
        icon: User
      }
    ]
  }
];
