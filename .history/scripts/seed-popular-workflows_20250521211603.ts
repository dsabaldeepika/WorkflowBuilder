/**
 * Seed script for populating the workflow template gallery with popular workflow ideas
 */
import { db } from '../server/db';
import { workflowTemplateCategories, workflowTemplates } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

// Common workflow structures with placeholders
const commonWorkflowStructures = {
  // Customer Journey Automation workflow
  customerJourney: {
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { name: 'New Customer' }
      },
      {
        id: 'onboarding',
        type: 'action',
        position: { x: 400, y: 100 },
        data: { name: 'Welcome Email' }
      },
      {
        id: 'resources',
        type: 'action',
        position: { x: 700, y: 100 },
        data: { name: 'Share Resources' }
      },
      {
        id: 'followup',
        type: 'action',
        position: { x: 1000, y: 100 },
        data: { name: 'Schedule Follow-up' }
      },
      {
        id: 'feedback',
        type: 'action',
        position: { x: 1300, y: 100 },
        data: { name: 'Request Feedback' }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'onboarding' },
      { id: 'e2-3', source: 'onboarding', target: 'resources' },
      { id: 'e3-4', source: 'resources', target: 'followup' },
      { id: 'e4-5', source: 'followup', target: 'feedback' }
    ]
  },
  
  // Marketing Campaign Orchestration workflow
  marketingCampaign: {
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { name: 'Campaign Start' }
      },
      {
        id: 'segment',
        type: 'action',
        position: { x: 400, y: 100 },
        data: { name: 'Segment Audience' }
      },
      {
        id: 'email',
        type: 'action',
        position: { x: 700, y: 0 },
        data: { name: 'Email Channel' }
      },
      {
        id: 'social',
        type: 'action',
        position: { x: 700, y: 200 },
        data: { name: 'Social Media Channel' }
      },
      {
        id: 'response',
        type: 'action',
        position: { x: 1000, y: 100 },
        data: { name: 'Track Responses' }
      },
      {
        id: 'followup',
        type: 'action',
        position: { x: 1300, y: 100 },
        data: { name: 'Automated Follow-up' }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'segment' },
      { id: 'e2-3a', source: 'segment', target: 'email' },
      { id: 'e2-3b', source: 'segment', target: 'social' },
      { id: 'e3a-4', source: 'email', target: 'response' },
      { id: 'e3b-4', source: 'social', target: 'response' },
      { id: 'e4-5', source: 'response', target: 'followup' }
    ]
  },
  
  // Data Synchronization Hub workflow
  dataSyncHub: {
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { name: 'Data Change' }
      },
      {
        id: 'extract',
        type: 'action',
        position: { x: 400, y: 100 },
        data: { name: 'Extract Data' }
      },
      {
        id: 'transform',
        type: 'action',
        position: { x: 700, y: 100 },
        data: { name: 'Transform Format' }
      },
      {
        id: 'validate',
        type: 'action',
        position: { x: 1000, y: 100 },
        data: { name: 'Validate Data' }
      },
      {
        id: 'sync',
        type: 'action',
        position: { x: 1300, y: 0 },
        data: { name: 'Sync to CRM' }
      },
      {
        id: 'sync2',
        type: 'action',
        position: { x: 1300, y: 200 },
        data: { name: 'Sync to ERP' }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'extract' },
      { id: 'e2-3', source: 'extract', target: 'transform' },
      { id: 'e3-4', source: 'transform', target: 'validate' },
      { id: 'e4-5a', source: 'validate', target: 'sync' },
      { id: 'e4-5b', source: 'validate', target: 'sync2' }
    ]
  },
  
  // Intelligent Lead Scoring workflow
  leadScoring: {
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { name: 'New Lead' }
      },
      {
        id: 'collect',
        type: 'action',
        position: { x: 400, y: 100 },
        data: { name: 'Collect Data' }
      },
      {
        id: 'score',
        type: 'action',
        position: { x: 700, y: 100 },
        data: { name: 'Calculate Score' }
      },
      {
        id: 'segment',
        type: 'action',
        position: { x: 1000, y: 100 },
        data: { name: 'Segment Leads' }
      },
      {
        id: 'route-high',
        type: 'action',
        position: { x: 1300, y: 0 },
        data: { name: 'Route to Sales' }
      },
      {
        id: 'route-med',
        type: 'action',
        position: { x: 1300, y: 150 },
        data: { name: 'Nurture Campaign' }
      },
      {
        id: 'route-low',
        type: 'action',
        position: { x: 1300, y: 300 },
        data: { name: 'Add to Newsletter' }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'collect' },
      { id: 'e2-3', source: 'collect', target: 'score' },
      { id: 'e3-4', source: 'score', target: 'segment' },
      { id: 'e4-5a', source: 'segment', target: 'route-high' },
      { id: 'e4-5b', source: 'segment', target: 'route-med' },
      { id: 'e4-5c', source: 'segment', target: 'route-low' }
    ]
  }
};

async function seedPopularWorkflows() {
  console.log('Seeding popular workflow templates...');
  
  const templates = [
    {
      name: 'Customer Journey Automation',
      description: 'Map and automate your entire customer journey from first contact to repeat business.',
      category: 'crm',
      tags: ['customer-journey', 'automation', 'onboarding'],
      difficulty: 'intermediate',
      workflowData: commonWorkflowStructures.customerJourney,
      imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80',
      popularity: 58,
      createdBy: 'PumpFlux Team',
      isPublished: true,
      isOfficial: true
    },
    {
      name: 'Marketing Campaign Orchestration',
      description: 'Schedule and coordinate multi-channel marketing campaigns that respond to customer actions.',
      category: 'marketing',
      tags: ['marketing', 'campaign', 'multi-channel'],
      difficulty: 'intermediate',
      workflowData: commonWorkflowStructures.marketingCampaign,
      imageUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80',
      popularity: 52,
      createdBy: 'PumpFlux Team',
      isPublished: true,
      isOfficial: true
    },
    {
      name: 'Data Synchronization Hub',
      description: 'Keep your business data in sync across all platforms without manual imports/exports.',
      category: 'data-processing',
      tags: ['data-sync', 'integration', 'automation'],
      difficulty: 'advanced',
      workflowData: commonWorkflowStructures.dataSyncHub,
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
      popularity: 45,
      createdBy: 'PumpFlux Team',
      isPublished: true,
      isOfficial: true
    },
    {
      name: 'Intelligent Lead Scoring',
      description: 'Automatically score and prioritize leads based on engagement and conversion potential.',
      category: 'sales',
      tags: ['leads', 'scoring', 'prioritization'],
      difficulty: 'intermediate',
      workflowData: commonWorkflowStructures.leadScoring,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
      popularity: 63,
      createdBy: 'PumpFlux Team',
      isPublished: true,
      isOfficial: true
    }
  ];

  // Insert templates one by one to avoid conflicts
  for (const template of templates) {
    try {
      // Check if template exists already
      const existing = await db.select().from(workflowTemplates)
        .where(eq(workflowTemplates.name, template.name));
        
      if (existing.length === 0) {
        // Correctly format the data for the database schema
        const templateData = {
          name: template.name,
          description: template.description,
          category: template.category,
          tags: template.tags,
          difficulty: template.difficulty,
          workflowData: template.workflowData, // This matches the schema property
          imageUrl: template.imageUrl,
          popularity: template.popularity,
          createdBy: template.createdBy,
          isPublished: template.isPublished,
          isOfficial: template.isOfficial
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

async function main() {
  console.log('Starting popular workflow templates seed script...');
  
  try {
    // Drop and recreate the popular_workflows table
    await db.execute(`DROP TABLE IF EXISTS popular_workflows`);
    await db.execute(`CREATE TABLE popular_workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      usage_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert seed data (idempotent, type-safe, null-safe)
    const popularWorkflows = [
      {
        id: 'workflow-1',
        name: 'Customer Journey Automation',
        description: 'Automate customer journeys.',
        usage_count: 10
      },
      {
        id: 'workflow-2',
        name: 'Marketing Campaign Orchestration',
        description: 'Coordinate marketing campaigns.',
        usage_count: 20
      }
    ];

    for (const workflow of popularWorkflows) {
      await db.insertInto('popular_workflows').values({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description ?? '',
        usage_count: workflow.usage_count ?? 0,
      }).onConflictDoNothing();
    }

    await seedPopularWorkflows();
    console.log('Popular workflow templates seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding popular workflow templates:', error);
  } finally {
    process.exit(0);
  }
}

main();