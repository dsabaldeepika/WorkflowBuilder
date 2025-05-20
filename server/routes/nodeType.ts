import { Router } from "express";
import { db } from "../../server/db";
import { nodeTypes } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all node types
router.get("/api/node-types", async (req, res) => {
  try {
    const nodes = await db.select().from(nodeTypes);
    res.json(nodes);
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch node types",
        details: err instanceof Error ? err.message : String(err),
      });
  }
});

// Get a single node type by id
router.get("/api/node-types/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [node] = await db
      .select()
      .from(nodeTypes)
      .where(eq(nodeTypes.id, id));
    if (!node) return res.status(404).json({ error: "Node type not found" });
    res.json(node);
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch node type",
        details: err instanceof Error ? err.message : String(err),
      });
  }
});

// Create a new node type
router.post("/api/node-types", async (req, res) => {
  try {
    const [created] = await db.insert(nodeTypes).values(req.body).returning();
    res.status(201).json(created);
  } catch (err) {
    res
      .status(400)
      .json({
        error: "Failed to create node type",
        details: err instanceof Error ? err.message : String(err),
      });
  }
});

// Update a node type
router.put("/api/node-types/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db
      .update(nodeTypes)
      .set(req.body)
      .where(eq(nodeTypes.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Node type not found" });
    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({
        error: "Failed to update node type",
        details: err instanceof Error ? err.message : String(err),
      });
  }
});

// Delete a node type
router.delete("/api/node-types/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db
      .delete(nodeTypes)
      .where(eq(nodeTypes.id, id))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Node type not found" });
    res.json({ success: true });
  } catch (err) {
    res
      .status(400)
      .json({
        error: "Failed to delete node type",
        details: err instanceof Error ? err.message : String(err),
      });
  }
});

export default router;
