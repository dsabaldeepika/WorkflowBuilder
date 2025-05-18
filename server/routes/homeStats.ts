import express from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

const router = express.Router();

// GET /api/home-stats - fetch all home page stats
router.get("/home-stats", async (req, res) => {
  try {
    const rows = await db.execute(sql`SELECT key, value FROM home_stats`);
    // Convert to object: { key: value, ... }
    const stats: Record<string, string> = {};
    for (const row of rows) {
      stats[row.key] = row.value;
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch home stats" });
  }
});

export default router;
