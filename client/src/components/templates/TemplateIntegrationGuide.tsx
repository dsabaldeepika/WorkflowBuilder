import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  HelpCircle, 
  DollarSign, 
  TrendingUp, 
  LightbulbIcon, 
  FileText, 
  Copy, 
  CheckCircle2, 
  ArrowRight, 
  Lightbulb, 
  Share2, 
  Zap,
  Sparkles as SparklesIcon,
  BookText,
  Rocket,
  BarChart,
  Settings,
  Target,
  Headphones as HeadphonesIcon,
  Megaphone as MegaphoneIcon,
  BarChart4 as BarChart4Icon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  GraduationCap as GraduationCapIcon,
  Users as UsersIcon,
  ClipboardList as ClipboardListIcon,
  LineChart as LineChartIcon,
  CalendarDays as CalendarDaysIcon,
  Wrench as ToolIcon,
  Cloud as CloudIcon,
  Store as StoreIcon,
  Globe as GlobeIcon,
  Briefcase as BriefcaseIcon
} from "lucide-react";
import { WorkflowTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type Step = {
  title: string;
  description: string;
  image?: string;
  codeSnippet?: string;
  url?: string;
};

type UseCase = {
  title: string;
  description: string;
  industry: string;
  impact: string;
};

type MonetizationIdea = {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedRevenue: string;
};

type IntegrationGuide = {
  name: string;
  description: string;
  prerequisites: string[];
  apiKeys: {
    name: string;
    description: string;
    url: string;
    instructions: string[];
  }[];
  steps: Step[];
  useCases: UseCase[];
  monetizationIdeas: MonetizationIdea[];
  troubleshooting: {
    issue: string;
    solution: string;
  }[];
  resources: {
    title: string;
    url: string;
    description: string;
  }[];
};

// Pre-defined guides
const INTEGRATION_GUIDES: Record<string, IntegrationGuide> = {
  "anthropic-claude": {
    name: "Anthropic Claude AI with Google Sheets",
    description: "This integration allows you to use Anthropic's Claude AI to analyze data in Google Sheets, generate content, and automate intelligent data processing tasks.",
    prerequisites: [
      "Google Sheets account",
      "Anthropic API key",
      "Basic understanding of spreadsheets"
    ],
    apiKeys: [
      {
        name: "Anthropic API Key",
        description: "Required to access Claude AI capabilities",
        url: "https://console.anthropic.com/",
        instructions: [
          "Create an account on Anthropic's website",
          "Navigate to the API section",
          "Click 'Create API Key'",
          "Copy your API key to a secure location",
          "Paste the API key in the PumpFlux workflow configuration"
        ]
      },
      {
        name: "Google Sheets API",
        description: "Needed to read/write data from your spreadsheets",
        url: "https://console.cloud.google.com/apis/library/sheets.googleapis.com",
        instructions: [
          "Go to Google Cloud Console",
          "Create a new project (or select existing)",
          "Enable the Google Sheets API",
          "Create credentials (OAuth client ID)",
          "Download the credentials JSON file",
          "Upload the credentials in PumpFlux"
        ]
      }
    ],
    steps: [
      {
        title: "Set up your Google Sheet",
        description: "Create a new Google Sheet with columns for your input data and where results should appear. Make sure to name your columns clearly.",
      },
      {
        title: "Configure the workflow trigger",
        description: "Choose when the workflow should run - options include manual trigger, scheduled runs, or when data changes in the sheet.",
      },
      {
        title: "Define your AI prompt",
        description: "Create a template for what you want Claude to do with your data - analyze it, summarize it, transform it, etc.",
      },
      {
        title: "Map sheet data to AI inputs",
        description: "Connect specific columns from your sheet to variables in your AI prompt.",
      },
      {
        title: "Configure output handling",
        description: "Specify where and how Claude's responses should be saved in your sheet.",
      },
      {
        title: "Test and refine",
        description: "Run a test with sample data and adjust your settings to improve results.",
      }
    ],
    useCases: [
      {
        title: "Customer Feedback Analysis",
        description: "Automatically analyze customer feedback from surveys to identify sentiment, key issues, and actionable insights.",
        industry: "Customer Service",
        impact: "Save 10+ hours of manual review per week and identify patterns humans might miss."
      },
      {
        title: "Content Generation",
        description: "Generate blog posts, social media content, or email newsletters based on topic outlines in your spreadsheet.",
        industry: "Marketing",
        impact: "Create 5x more content in the same amount of time while maintaining consistent quality."
      },
      {
        title: "Data Extraction and Summarization",
        description: "Extract key information from unstructured text like articles, reports, or documents stored in your sheet.",
        industry: "Research & Analysis",
        impact: "Turn hours of reading into minutes of scanning structured data."
      },
      {
        title: "Language Translation at Scale",
        description: "Translate product descriptions, support documentation, or marketing materials into multiple languages.",
        industry: "E-commerce & Global Business",
        impact: "Expand to international markets without hiring multiple translators."
      }
    ],
    monetizationIdeas: [
      {
        title: "Content Creation Service",
        description: "Offer AI-powered content creation services where clients provide topics in a shared spreadsheet and receive finished content.",
        difficulty: "Easy",
        estimatedRevenue: "$1,000-$5,000/month"
      },
      {
        title: "Sentiment Analysis Dashboard",
        description: "Create a service that analyzes customer reviews or feedback and generates visual reports with actionable insights.",
        difficulty: "Medium",
        estimatedRevenue: "$3,000-$10,000/month"
      },
      {
        title: "Custom AI Templates Marketplace",
        description: "Develop and sell specialized templates for different industries (real estate descriptions, product listings, etc.)",
        difficulty: "Medium",
        estimatedRevenue: "$2,000-$8,000/month"
      },
      {
        title: "Data Processing Consultancy",
        description: "Offer consulting services to help businesses set up and customize their own AI-powered data processing workflows.",
        difficulty: "Hard",
        estimatedRevenue: "$5,000-$20,000/month"
      }
    ],
    troubleshooting: [
      {
        issue: "API key errors",
        solution: "Double-check that your Anthropic API key is entered correctly and hasn't expired. Make sure you haven't exceeded your API quota."
      },
      {
        issue: "Google Sheets permission issues",
        solution: "Ensure your Google credentials have the correct permissions and that you've shared the sheet with the service account email if using one."
      },
      {
        issue: "AI responses are too long for cells",
        solution: "Configure your output to span multiple cells or use a summary format. Consider preprocessing longer texts before saving to the sheet."
      },
      {
        issue: "Rate limit exceeded",
        solution: "Implement delays between API calls or batch your requests. Consider upgrading your API plan if processing large volumes."
      }
    ],
    resources: [
      {
        title: "Anthropic API Documentation",
        url: "https://docs.anthropic.com/claude/reference/getting-started-with-the-api",
        description: "Official documentation for the Claude API with examples and best practices."
      },
      {
        title: "Google Sheets API Guide",
        url: "https://developers.google.com/sheets/api/guides/concepts",
        description: "Comprehensive guide to working with the Google Sheets API."
      },
      {
        title: "Prompt Engineering Best Practices",
        url: "https://help.anthropic.com/en/articles/8135551-creating-effective-prompts-for-claude",
        description: "Learn how to craft effective prompts for Claude to get better results."
      }
    ]
  },
  "pipedrive-googlesheets": {
    name: "Pipedrive Deals to Google Sheets",
    description: "Automatically sync your Pipedrive deals data to Google Sheets for advanced reporting, analysis, and sharing with team members who don't have Pipedrive access.",
    prerequisites: [
      "Pipedrive account",
      "Google Sheets account",
      "Deals created in Pipedrive"
    ],
    apiKeys: [
      {
        name: "Pipedrive API Key",
        description: "Required to access your Pipedrive data",
        url: "https://app.pipedrive.com/settings/api",
        instructions: [
          "Log in to your Pipedrive account",
          "Go to Settings → Personal → API",
          "Generate a new API token",
          "Copy the API token",
          "Paste it in the PumpFlux workflow configuration"
        ]
      },
      {
        name: "Google Sheets API",
        description: "Needed to write data to your spreadsheets",
        url: "https://console.cloud.google.com/apis/library/sheets.googleapis.com",
        instructions: [
          "Go to Google Cloud Console",
          "Create a new project (or select existing)",
          "Enable the Google Sheets API",
          "Create credentials (OAuth client ID or service account)",
          "Download the credentials JSON file",
          "Upload the credentials in PumpFlux"
        ]
      }
    ],
    steps: [
      {
        title: "Create your destination Google Sheet",
        description: "Set up a new Google Sheet where your Pipedrive deals will be stored. Create appropriate column headers that match the deal fields you want to sync.",
      },
      {
        title: "Configure Pipedrive connection",
        description: "Enter your Pipedrive API key and select which deal fields you want to export (e.g., deal title, value, stage, owner, etc.)",
      },
      {
        title: "Set up Google Sheets connection",
        description: "Enter your Google Sheet ID and specify which worksheet to use for the data.",
      },
      {
        title: "Configure sync options",
        description: "Choose how often to sync (real-time, hourly, daily), what deals to include (all deals, only open deals, deals in specific stages), and how to handle updates.",
      },
      {
        title: "Map Pipedrive fields to spreadsheet columns",
        description: "Match each Pipedrive deal field to the corresponding column in your Google Sheet.",
      },
      {
        title: "Test the connection",
        description: "Run a test sync to make sure everything is working correctly.",
      }
    ],
    useCases: [
      {
        title: "Custom Sales Reports",
        description: "Create custom sales reports and dashboards that aren't available in Pipedrive's standard reporting.",
        industry: "Sales",
        impact: "Better insights into sales performance and forecasting accuracy."
      },
      {
        title: "Team Collaboration",
        description: "Share deal data with team members who don't have Pipedrive access (finance, operations, etc.)",
        industry: "Team Management",
        impact: "Improved cross-department collaboration and transparency."
      },
      {
        title: "Executive Dashboards",
        description: "Create executive-level dashboards showing key sales metrics and KPIs using Google Sheets' visualization tools.",
        industry: "Management",
        impact: "Better decision-making with accessible, real-time sales data."
      },
      {
        title: "Custom Calculations",
        description: "Perform advanced calculations on your deal data that aren't possible within Pipedrive.",
        industry: "Sales Analysis",
        impact: "Uncover hidden trends and opportunities in your sales data."
      }
    ],
    monetizationIdeas: [
      {
        title: "Sales Analysis Service",
        description: "Offer to set up and maintain custom sales dashboards for companies using Pipedrive.",
        difficulty: "Easy",
        estimatedRevenue: "$1,000-$3,000/month per client"
      },
      {
        title: "Sales Process Optimization",
        description: "Use the automated data to analyze and optimize clients' sales processes, identifying bottlenecks and opportunities.",
        difficulty: "Medium",
        estimatedRevenue: "$2,500-$7,500/month per client"
      },
      {
        title: "Sales Forecasting Service",
        description: "Build advanced forecasting models with the synchronized data to provide accurate revenue predictions.",
        difficulty: "Hard",
        estimatedRevenue: "$5,000-$15,000/month per client"
      },
      {
        title: "CRM Implementation & Training",
        description: "Help businesses set up their entire CRM ecosystem with Pipedrive and connected reporting systems.",
        difficulty: "Medium",
        estimatedRevenue: "$3,000-$10,000 per implementation + monthly retainers"
      }
    ],
    troubleshooting: [
      {
        issue: "Data not appearing in Google Sheets",
        solution: "Check that your API keys are valid, you have the correct permissions on the Google Sheet, and that the workflow has been triggered."
      },
      {
        issue: "Some deal fields are missing",
        solution: "Make sure you've selected all the relevant fields in the field mapping step and that those fields exist in your Pipedrive account."
      },
      {
        issue: "Duplicated data in sheets",
        solution: "Configure the sync to update existing rows rather than always appending new ones. Use a unique identifier like the Deal ID for matching."
      },
      {
        issue: "Sync is too slow",
        solution: "Optimize by syncing only the deals that have changed instead of all deals, or by reducing the sync frequency."
      }
    ],
    resources: [
      {
        title: "Pipedrive API Documentation",
        url: "https://developers.pipedrive.com/docs/api/v1",
        description: "Official documentation for the Pipedrive API."
      },
      {
        title: "Google Sheets API Guide",
        url: "https://developers.google.com/sheets/api/guides/concepts",
        description: "Comprehensive guide to working with the Google Sheets API."
      },
      {
        title: "Sales Dashboard Templates",
        url: "https://templates.office.com/en-us/sales-dashboard-tm16400962",
        description: "Ready-to-use templates for creating sales dashboards in spreadsheets."
      }
    ]
  },
  "facebook-hubspot": {
    name: "Facebook Lead Ads to HubSpot CRM",
    description: "Automatically capture leads from Facebook Lead Ads and create contacts in HubSpot CRM, ensuring no leads are lost and follow-up happens quickly.",
    prerequisites: [
      "Facebook Business account with Lead Ads campaign",
      "HubSpot CRM account",
      "Admin access to both platforms"
    ],
    apiKeys: [
      {
        name: "Facebook API Access",
        description: "Required to access your Facebook Lead Ads data",
        url: "https://developers.facebook.com/",
        instructions: [
          "Go to Facebook Developers and create a new app",
          "Add the Marketing API to your app",
          "Generate a user access token with leads_retrieval permission",
          "Copy your App ID, App Secret, and access token",
          "Paste them in the PumpFlux workflow configuration"
        ]
      },
      {
        name: "HubSpot API Key",
        description: "Needed to create contacts in your HubSpot CRM",
        url: "https://app.hubspot.com/settings/account/integrations/api-key",
        instructions: [
          "Log in to your HubSpot account",
          "Go to Settings → Account Setup → Integrations → API Key",
          "Click 'Create API key' or copy your existing key",
          "Paste the API key in the PumpFlux workflow configuration"
        ]
      }
    ],
    steps: [
      {
        title: "Connect to Facebook Lead Ads",
        description: "Set up the connection to Facebook using your app credentials and select which Lead Ad forms to monitor.",
      },
      {
        title: "Connect to HubSpot",
        description: "Enter your HubSpot API key and select which HubSpot properties to use for the lead data.",
      },
      {
        title: "Map Facebook form fields to HubSpot properties",
        description: "Match each field from your Facebook Lead Ad form to the corresponding property in HubSpot.",
      },
      {
        title: "Configure lead processing options",
        description: "Choose whether to check for duplicates, add leads to specific lists, assign to team members, or trigger workflows in HubSpot.",
      },
      {
        title: "Set up notifications",
        description: "Configure email or Slack notifications for new leads, failed synchronizations, or other important events.",
      },
      {
        title: "Test the integration",
        description: "Submit a test lead through your Facebook Ad to verify the entire process works correctly.",
      }
    ],
    useCases: [
      {
        title: "Real Estate Lead Generation",
        description: "Capture interested property buyers/renters from Facebook and automatically start nurturing campaigns in HubSpot.",
        industry: "Real Estate",
        impact: "Reduce lead response time from hours to minutes, increasing conversion rates by 30%."
      },
      {
        title: "Event Registration",
        description: "Seamlessly transfer event registrants from Facebook campaigns to your HubSpot database for follow-up.",
        industry: "Event Management",
        impact: "Eliminate manual data entry and ensure all registrants receive timely information."
      },
      {
        title: "Educational Lead Management",
        description: "Capture potential students interested in courses and programs and nurture them through HubSpot workflows.",
        industry: "Education",
        impact: "Increase enrollment rates by providing immediate, relevant information to prospects."
      },
      {
        title: "E-commerce Customer Acquisition",
        description: "Transfer interested shoppers from Facebook promotions directly into HubSpot for targeted email campaigns.",
        industry: "E-commerce",
        impact: "Create personalized shopping experiences based on expressed interests in Facebook ads."
      }
    ],
    monetizationIdeas: [
      {
        title: "Lead Generation Service",
        description: "Create and manage Facebook Lead Ad campaigns for clients, with automatic integration to their HubSpot CRM.",
        difficulty: "Medium",
        estimatedRevenue: "$2,000-$5,000/month per client"
      },
      {
        title: "CRM Setup & Optimization",
        description: "Help businesses configure their HubSpot CRM to effectively manage and nurture Facebook leads through the sales funnel.",
        difficulty: "Medium",
        estimatedRevenue: "$3,000-$8,000 per setup + monthly retainers"
      },
      {
        title: "Marketing Automation Agency",
        description: "Create end-to-end lead generation and nurturing systems using Facebook Ads and HubSpot workflows.",
        difficulty: "Hard",
        estimatedRevenue: "$5,000-$15,000/month per client"
      },
      {
        title: "Lead Quality Scoring Service",
        description: "Develop and implement systems that score and prioritize leads based on their Facebook Ad interactions and profile data.",
        difficulty: "Hard",
        estimatedRevenue: "$3,000-$10,000/month per client"
      }
    ],
    troubleshooting: [
      {
        issue: "Leads not appearing in HubSpot",
        solution: "Verify your Facebook API permissions, check the HubSpot API key validity, and ensure the correct lead form IDs are being monitored."
      },
      {
        issue: "Missing lead information",
        solution: "Ensure your Facebook form and HubSpot field mapping is complete. Some fields might need custom mapping or transformation before syncing."
      },
      {
        issue: "Duplicate contacts in HubSpot",
        solution: "Enable the duplicate checking option and configure it to match on email address or other unique identifiers."
      },
      {
        issue: "API rate limiting errors",
        solution: "Implement a queueing system or reduce your sync frequency if you're processing a large volume of leads."
      }
    ],
    resources: [
      {
        title: "Facebook Lead Ads Documentation",
        url: "https://developers.facebook.com/docs/marketing-api/guides/lead-ads",
        description: "Official documentation for working with Facebook Lead Ads API."
      },
      {
        title: "HubSpot API Documentation",
        url: "https://developers.hubspot.com/docs/api/overview",
        description: "Comprehensive guide to working with the HubSpot API."
      },
      {
        title: "Lead Nurturing Best Practices",
        url: "https://blog.hubspot.com/marketing/lead-nurturing-guide-list",
        description: "Guide to effectively nurturing leads through the sales funnel."
      }
    ]
  },
  "customer-follow-up": {
    name: "Customer Follow-up Automation",
    description: "Automatically send personalized follow-up emails based on customer interactions, ensuring timely communication without manual effort.",
    prerequisites: [
      "CRM system with customer data",
      "Email service provider",
      "Customer interaction tracking"
    ],
    apiKeys: [
      {
        name: "CRM API Access",
        description: "Required to access your customer data",
        url: "#",
        instructions: [
          "Log in to your CRM platform",
          "Navigate to Settings or Developer options",
          "Generate an API key with appropriate permissions",
          "Copy the API key and any related credentials",
          "Paste them in the PumpFlux workflow configuration"
        ]
      },
      {
        name: "Email Service Provider API",
        description: "Needed to send automated emails",
        url: "#",
        instructions: [
          "Log in to your email service provider",
          "Go to API or Integration settings",
          "Create a new API key with email sending permissions",
          "Copy the API key and SMTP details if needed",
          "Enter these details in the PumpFlux workflow"
        ]
      }
    ],
    steps: [
      {
        title: "Connect to your CRM",
        description: "Set up the connection to your CRM using your API credentials and select which customer data to access.",
      },
      {
        title: "Configure email service connection",
        description: "Enter your email service API details and verify the connection works.",
      },
      {
        title: "Define customer segments",
        description: "Create rules for which customers should receive follow-ups based on their status, interactions, or other criteria.",
      },
      {
        title: "Create email templates",
        description: "Design personalized email templates with variables that will be filled with customer-specific information.",
      },
      {
        title: "Set up timing rules",
        description: "Define when follow-ups should be sent (e.g., 3 days after purchase, 1 week after support ticket closed).",
      },
      {
        title: "Configure response handling",
        description: "Set up how customer replies should be processed and recorded in your CRM.",
      }
    ],
    useCases: [
      {
        title: "Post-Purchase Follow-up",
        description: "Automatically check in with customers after their purchase to ensure satisfaction and offer support.",
        industry: "E-commerce",
        impact: "Increase customer satisfaction by 25% and identify issues before they lead to negative reviews."
      },
      {
        title: "Service Satisfaction Check",
        description: "Follow up after service delivery to gauge satisfaction and request reviews or testimonials.",
        industry: "Service Businesses",
        impact: "Boost review collection by 40% and identify areas for service improvement."
      },
      {
        title: "Renewal Reminders",
        description: "Send timely reminders about subscription renewals with personalized offers to encourage continuation.",
        industry: "SaaS & Subscription Services",
        impact: "Reduce subscription churn by 15-20% through proactive communication."
      },
      {
        title: "Re-engagement Campaigns",
        description: "Reach out to inactive customers with personalized offers based on their past purchases or interests.",
        industry: "Retail & Services",
        impact: "Recover 5-10% of dormant customers and increase repeat purchase rates."
      }
    ],
    monetizationIdeas: [
      {
        title: "Customer Success Management",
        description: "Offer a complete customer success service with automated and human touchpoints to maximize satisfaction and retention.",
        difficulty: "Medium",
        estimatedRevenue: "$2,000-$7,000/month per client"
      },
      {
        title: "Email Marketing Optimization",
        description: "Help businesses design and optimize their follow-up email sequences for maximum engagement and conversion.",
        difficulty: "Medium",
        estimatedRevenue: "$1,500-$5,000/month per client"
      },
      {
        title: "Customer Feedback Analysis",
        description: "Collect and analyze customer feedback through automated follow-ups, providing actionable insights to businesses.",
        difficulty: "Easy",
        estimatedRevenue: "$1,000-$3,000/month per client"
      },
      {
        title: "Customer Loyalty Program Management",
        description: "Create and manage automated loyalty programs that encourage repeat business and referrals.",
        difficulty: "Hard",
        estimatedRevenue: "$3,000-$10,000/month per client"
      }
    ],
    troubleshooting: [
      {
        issue: "Emails not being sent",
        solution: "Check your email service provider API credentials, verify sending limits, and ensure your email templates don't contain spam triggers."
      },
      {
        issue: "Low open or response rates",
        solution: "Test different subject lines, sending times, and email content. Ensure emails are personalized and relevant to each recipient."
      },
      {
        issue: "Customer data not updating in CRM",
        solution: "Verify the bi-directional sync between your workflow and CRM, checking API permissions and field mapping."
      },
      {
        issue: "Duplicate follow-ups being sent",
        solution: "Implement proper tracking of email history and add conditions to prevent multiple follow-ups to the same customer for the same event."
      }
    ],
    resources: [
      {
        title: "Email Deliverability Guide",
        url: "https://www.mailgun.com/blog/deliverability/",
        description: "Best practices for ensuring your automated emails reach customers' inboxes."
      },
      {
        title: "Follow-up Email Templates",
        url: "https://blog.hubspot.com/sales/follow-up-email-templates",
        description: "Effective templates for different types of customer follow-up situations."
      },
      {
        title: "Customer Journey Mapping",
        url: "https://www.lucidchart.com/blog/how-to-build-customer-journey-maps",
        description: "Guide to mapping customer journeys for more effective follow-up timing."
      }
    ]
  }
};

// Default guide to use if template-specific guide is not found
const DEFAULT_GUIDE: IntegrationGuide = {
  name: "Workflow Integration Guide",
  description: "A general guide for setting up and using automated workflow templates in PumpFlux.",
  prerequisites: [
    "PumpFlux account",
    "Access to relevant third-party services",
    "Basic understanding of the workflow concept"
  ],
  apiKeys: [
    {
      name: "Third-party Service API Keys",
      description: "Required to connect to external services",
      url: "#",
      instructions: [
        "Log in to the third-party service",
        "Navigate to the API or Developer settings",
        "Generate a new API key with appropriate permissions",
        "Copy the API key to your PumpFlux workflow"
      ]
    }
  ],
  steps: [
    {
      title: "Understand the workflow",
      description: "Review the workflow template to understand its purpose, inputs, and outputs.",
    },
    {
      title: "Gather necessary credentials",
      description: "Collect API keys and account information for all services used in the workflow.",
    },
    {
      title: "Configure the template",
      description: "Customize the template with your specific requirements and credentials.",
    },
    {
      title: "Test with sample data",
      description: "Run the workflow with test data to ensure it operates as expected.",
    },
    {
      title: "Monitor and refine",
      description: "Observe the workflow's performance and make adjustments as needed.",
    }
  ],
  useCases: [
    {
      title: "Process Automation",
      description: "Automate repetitive tasks to free up time for more valuable work.",
      industry: "All",
      impact: "Save hours of manual work and reduce errors."
    },
    {
      title: "Data Integration",
      description: "Connect different systems to ensure data consistency across platforms.",
      industry: "All",
      impact: "Eliminate data silos and improve decision-making with unified information."
    }
  ],
  monetizationIdeas: [
    {
      title: "Workflow Setup Service",
      description: "Offer to configure and customize workflows for clients who lack technical expertise.",
      difficulty: "Easy",
      estimatedRevenue: "$500-$2,000 per workflow"
    },
    {
      title: "Workflow Optimization",
      description: "Analyze and improve existing workflows to increase efficiency and effectiveness.",
      difficulty: "Medium",
      estimatedRevenue: "$1,000-$5,000 per client"
    }
  ],
  troubleshooting: [
    {
      issue: "Workflow not starting",
      solution: "Check trigger configurations and ensure all required credentials are valid."
    },
    {
      issue: "Data processing errors",
      solution: "Verify that input data matches the expected format and all required fields are present."
    }
  ],
  resources: [
    {
      title: "PumpFlux Documentation",
      url: "#",
      description: "Comprehensive documentation for using the PumpFlux platform."
    },
    {
      title: "Workflow Design Best Practices",
      url: "#",
      description: "Guidelines for creating efficient and reliable automated workflows."
    }
  ]
};

function getGuideForTemplate(template: WorkflowTemplate): IntegrationGuide {
  if (!template.name) {
    return DEFAULT_GUIDE;
  }
  
  const templateName = template.name.toLowerCase();
  
  if (templateName.includes('anthropic') || templateName.includes('claude') || 
     (templateName.includes('ai') && templateName.includes('scraping'))) {
    return INTEGRATION_GUIDES["anthropic-claude"];
  }
  
  if (templateName.includes('pipedrive') && 
     (templateName.includes('google') && templateName.includes('sheet'))) {
    return INTEGRATION_GUIDES["pipedrive-googlesheets"];
  }
  
  if ((templateName.includes('facebook') || templateName.includes('fb')) && 
     (templateName.includes('hubspot') || templateName.includes('lead'))) {
    return INTEGRATION_GUIDES["facebook-hubspot"];
  }
  
  if (templateName.includes('customer') && 
     (templateName.includes('follow') || templateName.includes('email'))) {
    return INTEGRATION_GUIDES["customer-follow-up"];
  }
  
  return DEFAULT_GUIDE;
}

function MonetizationCard({ idea }: { idea: MonetizationIdea }) {
  const difficultyConfig = {
    'Easy': {
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: <Target className="h-4 w-4 mr-1 text-green-600" />,
      gradient: 'from-green-50 to-emerald-50 border-l-4 border-green-400'
    },
    'Medium': {
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Target className="h-4 w-4 mr-1 text-yellow-600" />,
      gradient: 'from-yellow-50 to-amber-50 border-l-4 border-yellow-400'
    },
    'Hard': {
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: <Target className="h-4 w-4 mr-1 text-red-600" />,
      gradient: 'from-red-50 to-rose-50 border-l-4 border-red-400'
    }
  }[idea.difficulty];
  
  return (
    <div className={`bg-gradient-to-r ${difficultyConfig.gradient} rounded-lg shadow-sm p-5 hover:shadow-md transition-all duration-200 group`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-base group-hover:text-indigo-700 transition-colors">{idea.title}</h3>
        <Badge variant="outline" className={`${difficultyConfig.className}`}>
          {difficultyConfig.icon} {idea.difficulty}
        </Badge>
      </div>
      <p className="text-gray-600 text-sm mb-4">{idea.description}</p>
      <div className="bg-white bg-opacity-70 rounded-md p-3 flex items-center text-sm font-medium text-green-700">
        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
        <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{idea.estimatedRevenue}</span>
      </div>
    </div>
  );
}

function UseCaseCard({ useCase }: { useCase: UseCase }) {
  // Determine industry-specific icon and color
  const industryConfig = {
    'Customer Service': {
      icon: <HeadphonesIcon className="h-4 w-4 mr-1" />,
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    'Marketing': {
      icon: <MegaphoneIcon className="h-4 w-4 mr-1" />,
      color: 'bg-purple-50 text-purple-800 border-purple-200'
    },
    'Sales': {
      icon: <BarChart4Icon className="h-4 w-4 mr-1" />,
      color: 'bg-green-50 text-green-800 border-green-200'
    },
    'Research & Analysis': {
      icon: <SearchIcon className="h-4 w-4 mr-1" />,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    'E-commerce': {
      icon: <ShoppingCartIcon className="h-4 w-4 mr-1" />,
      color: 'bg-pink-50 text-pink-800 border-pink-200'
    },
    'Education': {
      icon: <GraduationCapIcon className="h-4 w-4 mr-1" />,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    'Team Management': {
      icon: <UsersIcon className="h-4 w-4 mr-1" />,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200'
    },
    'Management': {
      icon: <ClipboardListIcon className="h-4 w-4 mr-1" />,
      color: 'bg-slate-50 text-slate-800 border-slate-200'
    },
    'Sales Analysis': {
      icon: <LineChartIcon className="h-4 w-4 mr-1" />,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    'Event Management': {
      icon: <CalendarDaysIcon className="h-4 w-4 mr-1" />,
      color: 'bg-violet-50 text-violet-800 border-violet-200'
    },
    'Service Businesses': {
      icon: <ToolIcon className="h-4 w-4 mr-1" />,
      color: 'bg-orange-50 text-orange-800 border-orange-200'
    },
    'SaaS & Subscription Services': {
      icon: <CloudIcon className="h-4 w-4 mr-1" />,
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    'Retail & Services': {
      icon: <StoreIcon className="h-4 w-4 mr-1" />,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    'All': {
      icon: <GlobeIcon className="h-4 w-4 mr-1" />,
      color: 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }[useCase.industry] || {
    icon: <BriefcaseIcon className="h-4 w-4 mr-1" />,
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-base">{useCase.title}</h3>
        <Badge variant="outline" className={`${industryConfig.color} flex items-center`}>
          {industryConfig.icon}
          {useCase.industry}
        </Badge>
      </div>
      <p className="text-gray-600 text-sm mb-4">{useCase.description}</p>
      <div className="bg-green-50 rounded-md p-3 flex items-center text-sm">
        <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
        <span className="font-medium text-green-700">{useCase.impact}</span>
      </div>
    </div>
  );
}

export function TemplateIntegrationGuide({ 
  template, 
  variant = 'default',
  className = ''
}: { 
  template: WorkflowTemplate; 
  variant?: 'default' | 'blue' | 'gradient'; 
  className?: string;
}) {
  const guide = getGuideForTemplate(template);
  const [activeTab, setActiveTab] = useState('setup');
  const { toast } = useToast();
  
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };
  
  // Different button styles based on variant
  const buttonContent = () => {
    switch(variant) {
      case 'blue':
        return (
          <div className={`flex items-center text-white hover:text-blue-200 transition-colors ${className}`}>
            <FileText className="h-4 w-4 mr-2" />
            View Integration Guide
          </div>
        );
      case 'gradient':
        return (
          <Button 
            size="sm" 
            className={`bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 ${className}`}
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            View Integration Guide
          </Button>
        );
      default:
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className={`mt-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group ${className}`}
          >
            <FileText className="h-4 w-4 mr-2 text-indigo-600 group-hover:text-indigo-700" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-medium">
              View Integration Guide
            </span>
          </Button>
        );
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {buttonContent()}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl">{guide.name}</DialogTitle>
            {template.complexity && (
              <Badge 
                variant="outline" 
                className={
                  template.complexity === 'simple' ? 'bg-green-50 text-green-700' :
                  template.complexity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }
              >
                {template.complexity} complexity
              </Badge>
            )}
          </div>
          <DialogDescription className="text-gray-600">
            {guide.description}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Setup Guide</span>
            </TabsTrigger>
            <TabsTrigger value="usecases" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span>Use Cases</span>
            </TabsTrigger>
            <TabsTrigger value="monetize" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Monetization</span>
            </TabsTrigger>
            <TabsTrigger value="troubleshoot" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span>Troubleshooting</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Setup Guide Tab */}
          <TabsContent value="setup" className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 flex items-center mb-2">
                <Info className="h-4 w-4 mr-2" />
                Prerequisites
              </h3>
              <ul className="list-disc pl-6 text-blue-700 text-sm">
                {guide.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-3">Required API Keys</h3>
              <div className="space-y-4">
                {guide.apiKeys.map((apiKey, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                      <Button variant="outline" size="sm" onClick={() => window.open(apiKey.url, '_blank')}>
                        Get Key
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <p className="text-gray-600 text-sm my-2">{apiKey.description}</p>
                    <div className="bg-gray-50 p-3 rounded-md mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h5>
                      <ol className="list-decimal pl-6 text-gray-600 text-sm space-y-1">
                        {apiKey.instructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-3">Step-by-Step Setup</h3>
              <div className="space-y-4">
                {guide.steps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm mt-3 ml-11">{step.description}</p>
                    {step.image && (
                      <div className="mt-3 ml-11">
                        <img src={step.image} alt={step.title} className="rounded-md border border-gray-200" />
                      </div>
                    )}
                    {step.codeSnippet && (
                      <div className="mt-3 ml-11 bg-gray-800 text-gray-200 p-3 rounded-md relative">
                        <pre className="text-sm overflow-x-auto">{step.codeSnippet}</pre>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopyCode(step.codeSnippet || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Use Cases Tab */}
          <TabsContent value="usecases">
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">Popular Use Cases</h3>
              <p className="text-gray-600 mb-4">Real-world applications and benefits of this workflow template:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guide.useCases.map((useCase, index) => (
                  <UseCaseCard key={index} useCase={useCase} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Monetization Tab */}
          <TabsContent value="monetize">
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2 flex items-center">
                <DollarSign className="h-5 w-5 mr-1 text-green-600" />
                Monetization Ideas
              </h3>
              <p className="text-gray-600 mb-4">Ways to generate revenue using this workflow template:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guide.monetizationIdeas.map((idea, index) => (
                  <MonetizationCard key={index} idea={idea} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Troubleshooting Tab */}
          <TabsContent value="troubleshoot">
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">Common Issues & Solutions</h3>
              <p className="text-gray-600 mb-4">Resolve frequently encountered problems:</p>
              <Accordion type="single" collapsible className="w-full">
                {guide.troubleshooting.map((item, index) => (
                  <AccordionItem key={index} value={`issue-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {item.issue}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                        {item.solution}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
          
          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">Helpful Resources</h3>
              <p className="text-gray-600 mb-4">Documentation, guides, and tools to help you succeed:</p>
              <div className="space-y-4">
                {guide.resources.map((resource, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-blue-700">{resource.title}</h4>
                      <Button variant="outline" size="sm" onClick={() => window.open(resource.url, '_blank')}>
                        Visit Resource
                      </Button>
                    </div>
                    <p className="text-gray-600 text-sm">{resource.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-2 rounded-full">
                    <Lightbulb className="h-8 w-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-indigo-900 mb-2">Need More Help?</h3>
                    <p className="text-indigo-700 text-sm mb-4">
                      Our community forum and support team are available to help you implement this workflow successfully.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Contact Support
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Community Forum
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <Info className="h-4 w-4 mr-1" />
            <span>Last updated: May 2024</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab(
              activeTab === 'setup' ? 'usecases' :
              activeTab === 'usecases' ? 'monetize' :
              activeTab === 'monetize' ? 'troubleshoot' :
              activeTab === 'troubleshoot' ? 'resources' : 'setup'
            )}>
              Next Section
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="default" onClick={() => handleUseTemplate(template)}>
              <Zap className="h-4 w-4 mr-1" />
              Use Template
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function handleUseTemplate(template: WorkflowTemplate) {
  window.location.href = `/template-setup/${template.id}`;
}