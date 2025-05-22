import { db } from "../server/db";
import { sql } from "drizzle-orm";
// Drizzle ORM does not have a TypeScript schema for home_stats, so use raw SQL for inserts

async function main() {
  // Drop and recreate the home_stats table
  await db.execute(`DROP TABLE IF EXISTS home_stats`);
  await db.execute(`CREATE TABLE home_stats (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    value INTEGER NOT NULL,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  const homeStats = [
    {
      id: "implementationSpeed",
      label: "10x Faster Implementation",
      value: 10,
      icon: "speed-icon",
    },
    {
      id: "customerSatisfaction",
      label: "97% Customer Satisfaction",
      value: 97,
      icon: "satisfaction-icon",
    },
    {
      id: "integrations",
      label: "500+ Integrations",
      value: 500,
      icon: "integrations-icon",
    },
    {
      id: "roi",
      label: "ROI in Under 30 Days",
      value: 30,
      icon: "roi-icon",
    },
  ];

  // Insert seed data using raw SQL for type safety
  for (const stat of homeStats) {
    await db.execute(sql`
      INSERT INTO home_stats (id, label, value, icon)
      VALUES (${stat.id}, ${stat.label}, ${stat.value ?? 0}, ${stat.icon ?? ''})
    `);
  }

  console.log("Seeded home_stats table.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to seed home_stats:", err);
  process.exit(1);
});
