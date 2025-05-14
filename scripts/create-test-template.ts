/**
 * Script to insert a test template with the correct column names
 */
import { db } from '../server/db';
import { workflowTemplates } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function createTestTemplate() {
  try {
    // Sample template data
    const templateData = {
      name: "Test Template",
      description: "A test template to verify column names",
      category: "testing",
      tags: ["test", "template"],
      difficulty: "beginner",
      workflowData: {
        nodes: [
          {
            id: "1",
            type: "trigger",
            position: { x: 250, y: 100 },
            data: { name: "Start" }
          },
          {
            id: "2",
            type: "action",
            position: { x: 250, y: 200 },
            data: { name: "Test Action" }
          }
        ],
        edges: [
          {
            id: "e1-2",
            source: "1",
            target: "2"
          }
        ]
      },
      imageUrl: null,
      popularity: 0,
      createdBy: "System",
      isPublished: true,
      isOfficial: true
    };

    // Insert the template
    await db.insert(workflowTemplates).values(templateData);
    console.log("Test template created successfully!");
    
    // Verify it was inserted
    const [template] = await db.select().from(workflowTemplates).where(
      eq(workflowTemplates.name, "Test Template")
    );
    
    console.log("Retrieved template:", template);

  } catch (error) {
    console.error("Error creating test template:", error);
  }
}

async function main() {
  await createTestTemplate();
  process.exit(0);
}

main();