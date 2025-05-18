import { db } from "../server/db";
import { workflowTemplates } from "../shared/schema";

const testUsers = ["test@gmail.com", "admin@gmail.com", "demo@gmail.com"];

const templates = [
  {
    name: "Welcome Workflow",
    description: "A starter workflow for new users.",
    ownerEmail: "", // Will be set per user
    category: "General", // Add a default or appropriate category
    workflowData: {
      nodes: [],
      edges: [],
    },
    isPublished: true,
    isOfficial: false,
  },
  // Add more templates as needed
];

async function seedTemplatesForUsers() {
  for (const email of testUsers) {
    for (const template of templates) {
      await db.insert(workflowTemplates).values({
        ...template,
        name: `${template.name} (${email})`,
        // ownerEmail is not a valid property in the schema
        // Ensure category is present in template object
      });
      console.log(`Seeded template for ${email}`);
    }
  }
  process.exit(0);
}

seedTemplatesForUsers().catch((err) => {
  console.error("Error seeding templates for users:", err);
  process.exit(1);
});
