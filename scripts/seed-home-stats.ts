import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function seedHomeStats() {
  const stats = [
    {
      key: "implementationSpeed",
      value: "10x",
      description: "10x Faster Implementation",
    },
    {
      key: "customerSatisfaction",
      value: "97",
      description: "97% Customer Satisfaction",
    },
    { key: "integrations", value: "500", description: "500+ Integrations" },
    { key: "roi", value: "Under 30 Days", description: "ROI in Under 30 Days" },
  ];
  for (const stat of stats) {
    await db.execute(sql`
      INSERT INTO home_stats (key, value, description, updated_at)
      VALUES (${stat.key}, ${stat.value}, ${stat.description}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = NOW();
    `);
  }
  console.log("Seeded home_stats table.");
  process.exit(0);
}

seedHomeStats().catch((err) => {
  console.error("Failed to seed home_stats:", err);
  process.exit(1);
});
