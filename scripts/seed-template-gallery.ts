/**
 * Seed script for populating the workflow template gallery with categories and templates
 */
import { db } from "../server/db";
import {
  workflowTemplateCategories,
  workflowTemplates,
  insertWorkflowTemplateCategorySchema,
  insertWorkflowTemplateSchema,
} from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function seedTemplateCategories() {
  console.log("Seeding template categories...");

  const categories = [
    {
      name: "crm",
      displayName: "CRM",
      description: "Customer Relationship Management automation templates",
      icon: "users",
      count: 0,
      isActive: true,
      sortOrder: 10,
    },
    {
      name: "marketing",
      displayName: "Marketing",
      description: "Marketing automation templates for campaigns and analytics",
      icon: "megaphone",
      count: 0,
      isActive: true,
      sortOrder: 20,
    },
    {
      name: "sales",
      displayName: "Sales",
      description: "Sales process automation for lead tracking and conversions",
      icon: "trending-up",
      count: 0,
      isActive: true,
      sortOrder: 30,
    },
    {
      name: "data-processing",
      displayName: "Data Processing",
      description:
        "Templates for data transformation, enrichment, and analysis",
      icon: "database",
      count: 0,
      isActive: true,
      sortOrder: 40,
    },
    {
      name: "social-media",
      displayName: "Social Media",
      description: "Social media integration and content management templates",
      icon: "share",
      count: 0,
      isActive: true,
      sortOrder: 50,
    },
    {
      name: "productivity",
      displayName: "Productivity",
      description: "Productivity and task management automation templates",
      icon: "clock",
      count: 0,
      isActive: true,
      sortOrder: 60,
    },
  ];

  // Insert categories one by one to avoid conflicts
  for (const category of categories) {
    try {
      // Check if category exists already
      const existing = await db
        .select()
        .from(workflowTemplateCategories)
        .where(eq(workflowTemplateCategories.name, category.name));

      if (existing.length === 0) {
        const parsedCategory =
          insertWorkflowTemplateCategorySchema.parse(category);
        await db.insert(workflowTemplateCategories).values(parsedCategory);
        console.log(`Added category: ${category.displayName}`);
      } else {
        console.log(`Category already exists: ${category.displayName}`);
      }
    } catch (error) {
      console.error(`Error adding category ${category.displayName}:`, error);
    }
  }
}

async function seedTemplates() {
  console.log("Seeding workflow templates...");

  const templates = [
    {
      name: "Customer Onboarding",
      description:
        "Automate the process of welcoming and onboarding new customers with personalized emails and tasks",
      category: "crm",
      tags: ["onboarding", "email", "customer-success"],
      difficulty: "beginner",
      workflowData: {
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            position: { x: 100, y: 100 },
            data: { 
              service: "manual",
              event: "trigger",
              config: {
                input_fields: [
                  { name: "customer_name", type: "string", label: "Customer Name" },
                  { name: "customer_email", type: "string", label: "Customer Email" }
                ]
              }
            }
          },
          {
            id: "email-1",
            type: "action",
            position: { x: 400, y: 100 },
            data: { 
              service: "gmail",
              action: "send_email",
              config: {
                to: "${customer_email}",
                subject: "Welcome to Our Service!",
                body_type: "text",
                body: "Hi ${customer_name},\n\nWelcome to our service! We're excited to have you on board."
              }
            }
          },
          {
            id: "delay-1",
            type: "action",
            position: { x: 700, y: 100 },
            data: { 
              service: "delay",
              action: "wait",
              config: {
                duration: "3d"
              }
            }
          },
          {
            id: "email-2",
            type: "action",
            position: { x: 1000, y: 100 },
            data: { 
              service: "gmail",
              action: "send_email",
              config: {
                to: "${customer_email}",
                subject: "How's Your Experience So Far?",
                body_type: "text",
                body: "Hi ${customer_name},\n\nWe hope you're enjoying our service. Let us know if you need any help!"
              }
            }
          }
        ],
        edges: [
          { id: "e1-2", source: "trigger-1", target: "email-1" },
          { id: "e2-3", source: "email-1", target: "delay-1" },
          { id: "e3-4", source: "delay-1", target: "email-2" }
        ]
      },
      imageUrl:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
      popularity: 45,
      createdBy: "PumpFlux Team",
      isPublished: true,
      isOfficial: true
    },
    {
      name: "Lead Scoring",
      description:
        "Automatically score and prioritize leads based on their engagement and behavior",
      category: "sales",
      tags: ["leads", "scoring", "prioritization"],
      difficulty: "intermediate",
      workflowData: {
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            position: { x: 100, y: 100 },
            data: { name: "New Lead Activity" },
          },
          {
            id: "router-1",
            type: "router",
            position: { x: 400, y: 100 },
            data: { name: "Evaluate Activity Type" },
          },
          {
            id: "score-1",
            type: "action",
            position: { x: 700, y: 0 },
            data: { name: "High Value (10 pts)" },
          },
          {
            id: "score-2",
            type: "action",
            position: { x: 700, y: 200 },
            data: { name: "Medium Value (5 pts)" },
          },
          {
            id: "notification",
            type: "action",
            position: { x: 1000, y: 100 },
            data: { name: "Notify Sales Rep" },
          },
        ],
        edges: [
          { id: "e1-2", source: "trigger-1", target: "router-1" },
          { id: "e2-3", source: "router-1", target: "score-1" },
          { id: "e2-4", source: "router-1", target: "score-2" },
          { id: "e3-5", source: "score-1", target: "notification" },
          { id: "e4-5", source: "score-2", target: "notification" },
        ],
      },
      imageUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      popularity: 38,
      createdBy: "PumpFlux Team",
      isPublished: true,
      isOfficial: true,
    },
    {
      name: "Social Media Content Calendar",
      description:
        "Create and schedule social media posts across multiple platforms",
      category: "social-media",
      tags: ["scheduling", "content", "marketing"],
      difficulty: "beginner",
      workflowData: {
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            position: { x: 100, y: 100 },
            data: { name: "New Content Created" },
          },
          {
            id: "format-1",
            type: "action",
            position: { x: 400, y: 100 },
            data: { name: "Format for Twitter" },
          },
          {
            id: "format-2",
            type: "action",
            position: { x: 400, y: 250 },
            data: { name: "Format for LinkedIn" },
          },
          {
            id: "format-3",
            type: "action",
            position: { x: 400, y: 400 },
            data: { name: "Format for Instagram" },
          },
          {
            id: "schedule",
            type: "action",
            position: { x: 700, y: 250 },
            data: { name: "Schedule Posts" },
          },
        ],
        edges: [
          { id: "e1-2", source: "trigger-1", target: "format-1" },
          { id: "e1-3", source: "trigger-1", target: "format-2" },
          { id: "e1-4", source: "trigger-1", target: "format-3" },
          { id: "e2-5", source: "format-1", target: "schedule" },
          { id: "e3-5", source: "format-2", target: "schedule" },
          { id: "e4-5", source: "format-3", target: "schedule" },
        ],
      },
      imageUrl:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
      popularity: 32,
      createdBy: "PumpFlux Team",
      isPublished: true,
      isOfficial: true,
    },
    {
      name: "Data Enrichment Pipeline",
      description:
        "Enhance your data by automatically enriching it with information from external APIs",
      category: "data-processing",
      tags: ["data", "api", "enrichment"],
      difficulty: "advanced",
      workflowData: {
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            position: { x: 100, y: 100 },
            data: { name: "New Data Record" },
          },
          {
            id: "validate",
            type: "action",
            position: { x: 400, y: 100 },
            data: { name: "Validate Data" },
          },
          {
            id: "enrich-1",
            type: "action",
            position: { x: 700, y: 0 },
            data: { name: "Enrich with API 1" },
          },
          {
            id: "enrich-2",
            type: "action",
            position: { x: 700, y: 200 },
            data: { name: "Enrich with API 2" },
          },
          {
            id: "merge",
            type: "action",
            position: { x: 1000, y: 100 },
            data: { name: "Merge Data" },
          },
          {
            id: "store",
            type: "action",
            position: { x: 1300, y: 100 },
            data: { name: "Store in Database" },
          },
        ],
        edges: [
          { id: "e1-2", source: "trigger-1", target: "validate" },
          { id: "e2-3", source: "validate", target: "enrich-1" },
          { id: "e2-4", source: "validate", target: "enrich-2" },
          { id: "e3-5", source: "enrich-1", target: "merge" },
          { id: "e4-5", source: "enrich-2", target: "merge" },
          { id: "e5-6", source: "merge", target: "store" },
        ],
      },
      imageUrl:
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80",
      popularity: 27,
      createdBy: "PumpFlux Team",
      isPublished: true,
      isOfficial: true,
    },
    {
      name: "Email Marketing Campaign",
      description:
        "Design and execute multi-stage email marketing campaigns with analytics tracking",
      category: "marketing",
      tags: ["email", "campaign", "analytics"],
      difficulty: "intermediate",
      workflowData: {
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            position: { x: 100, y: 100 },
            data: { 
              service: "manual",
              event: "trigger",
              config: {
                input_fields: [
                  { name: "campaign_name", type: "string", label: "Campaign Name" },
                  { name: "audience_segment", type: "string", label: "Audience Segment" }
                ]
              }
            }
          },
          {
            id: "segment",
            type: "action",
            position: { x: 400, y: 100 },
            data: { 
              service: "mailchimp",
              action: "get_segment",
              config: {
                list_id: "${list_id}",
                segment_name: "{{trigger.audience_segment}}"
              }
            }
          },
          {
            id: "email-1",
            type: "action",
            position: { x: 700, y: 100 },
            data: { 
              service: "gmail",
              action: "send_email",
              config: {
                to: "{{segment.emails}}",
                subject: "${initial_subject}",
                body_type: "html",
                body: "${initial_template}"
              }
            }
          },
          {
            id: "wait",
            type: "action",
            position: { x: 1000, y: 100 },
            data: { 
              service: "delay",
              action: "wait",
              config: {
                duration: "5d"
              }
            }
          },
          {
            id: "condition",
            type: "router",
            position: { x: 1300, y: 100 },
            data: { 
              service: "analytics",
              action: "check_opens",
              config: {
                campaign_id: "${campaign_id}",
                threshold: 0
              }
            }
          },
          {
            id: "email-2a",
            type: "action",
            position: { x: 1600, y: 0 },
            data: { 
              service: "gmail",
              action: "send_email",
              config: {
                to: "{{condition.opened_emails}}",
                subject: "${followup_a_subject}",
                body_type: "html",
                body: "${followup_a_template}"
              }
            }
          },
          {
            id: "email-2b",
            type: "action",
            position: { x: 1600, y: 200 },
            data: { 
              service: "gmail",
              action: "send_email",
              config: {
                to: "{{condition.not_opened_emails}}",
                subject: "${followup_b_subject}",
                body_type: "html",
                body: "${followup_b_template}"
              }
            }
          },
          {
            id: "analytics",
            type: "action",
            position: { x: 1900, y: 100 },
            data: { 
              service: "analytics",
              action: "track_campaign",
              config: {
                campaign_id: "${campaign_id}",
                metrics: ["opens", "clicks", "conversions"]
              }
            }
          }
        ],
        edges: [
          { id: "e1-2", source: "trigger-1", target: "segment" },
          { id: "e2-3", source: "segment", target: "email-1" },
          { id: "e3-4", source: "email-1", target: "wait" },
          { id: "e4-5", source: "wait", target: "condition" },
          { id: "e5-6", source: "condition", target: "email-2a" },
          { id: "e5-7", source: "condition", target: "email-2b" },
          { id: "e6-8", source: "email-2a", target: "analytics" },
          { id: "e7-8", source: "email-2b", target: "analytics" }
        ]
      },
      imageUrl: "https://example.com/images/email-campaign.png",
      popularity: 78,
      createdBy: "PumpFlux Team",
      isPublished: true,
      isOfficial: true
    },
    {
      name: "Task Manager Automation",
      description:
        "Automate task creation, assignment, and deadline tracking across your team",
      category: "productivity",
      tags: ["tasks", "team", "management"],
      difficulty: "beginner",
      workflowData: {
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            position: { x: 100, y: 100 },
            data: { name: "Project Milestone" },
          },
          {
            id: "tasks",
            type: "action",
            position: { x: 400, y: 100 },
            data: { name: "Generate Tasks" },
          },
          {
            id: "assign",
            type: "action",
            position: { x: 700, y: 100 },
            data: { name: "Assign to Team Members" },
          },
          {
            id: "notify",
            type: "action",
            position: { x: 1000, y: 100 },
            data: { name: "Send Notifications" },
          },
          {
            id: "schedule",
            type: "action",
            position: { x: 1300, y: 100 },
            data: { name: "Set Reminder Schedule" },
          },
        ],
        edges: [
          { id: "e1-2", source: "trigger-1", target: "tasks" },
          { id: "e2-3", source: "tasks", target: "assign" },
          { id: "e3-4", source: "assign", target: "notify" },
          { id: "e4-5", source: "notify", target: "schedule" },
        ],
      },
      imageUrl:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
      popularity: 36,
      createdBy: "PumpFlux Team",
      isPublished: true,
      isOfficial: true,
    },
    {
      name: "Claude Completions from Google Sheets",
      description:
        "Trigger on new Google Sheets row, send data to Anthropic Claude for completions, and write the result back to the sheet.",
      category: "productivity",
      tags: ["google-sheets", "anthropic", "claude", "ai", "automation"],
      difficulty: "intermediate",
      workflowData: {
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            position: { x: 100, y: 100 },
            data: { name: "New Google Sheets Row" },
          },
          {
            id: "claude-1",
            type: "action",
            position: { x: 400, y: 100 },
            data: { name: "Claude Completion" },
          },
          {
            id: "write-1",
            type: "action",
            position: { x: 700, y: 100 },
            data: { name: "Write Result to Sheet" },
          },
        ],
        edges: [
          { id: "e1-2", source: "trigger-1", target: "claude-1" },
          { id: "e2-3", source: "claude-1", target: "write-1" },
        ],
      },
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      popularity: 50,
      createdBy: "PumpFlux Team",
      isPublished: true,
      isOfficial: true,
    },
  ];

  // Insert templates one by one to avoid conflicts
  for (const template of templates) {
    try {
      // Check if template exists already
      const existing = await db
        .select()
        .from(workflowTemplates)
        .where(eq(workflowTemplates.name, template.name));

      if (existing.length === 0) {
        // Correctly format the data for the database schema
        const templateData = {
          name: template.name,
          description: template.description,
          category: template.category,
          tags: template.tags,
          difficulty: template.difficulty,
          workflowData: template.workflowData, // Use camelCase to match the schema
          imageUrl: template.imageUrl,
          popularity: template.popularity,
          createdBy: template.createdBy,
          isPublished: template.isPublished,
          isOfficial: template.isOfficial,
        };

        await db.insert(workflowTemplates).values(templateData);
        console.log(`Added template: ${template.name}`);

        // Update category count
        await db
          .update(workflowTemplateCategories)
          .set({ count: sql`count + 1` })
          .where(eq(workflowTemplateCategories.name, template.category));
      } else {
        console.log(`Template already exists: ${template.name}`);
      }
    } catch (error) {
      console.error(`Error adding template ${template.name}:`, error);
    }
  }
}

async function clearExistingData() {
  console.log("Clearing existing template data...");

  try {
    // Delete all templates first to maintain referential integrity
    await db.delete(workflowTemplates);
    console.log("Deleted existing templates");

    // Reset category counts
    await db.update(workflowTemplateCategories).set({ count: 0 });
    console.log("Reset category counts");
  } catch (error) {
    console.error("Error clearing existing data:", error);
  }
}

// Use a top-level async IIFE to ensure all async work completes before exit
(async () => {
  console.log("Starting template gallery seed script...");
  try {
    // Comment this line out if you want to keep existing data
    // await clearExistingData();
    await seedTemplateCategories();
    await seedTemplates();
    console.log("Template gallery seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding template gallery:", error);
    process.exit(1);
  }
})();
