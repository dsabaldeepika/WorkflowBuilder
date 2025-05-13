import express, { Router } from 'express';
import { db } from '../db';
import { workflowConnections } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Schema for validating connection creation requests
const connectionSchema = z.object({
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  edgeId: z.string(),
  isValid: z.boolean(),
  data: z.record(z.any()).optional(),
});

// POST: Save a new connection
router.post('/', async (req, res) => {
  try {
    // Validate input
    const validatedData = connectionSchema.parse(req.body);
    
    // Save to database
    const [connection] = await db
      .insert(workflowConnections)
      .values({
        sourceNodeId: validatedData.sourceNodeId,
        targetNodeId: validatedData.targetNodeId,
        edgeId: validatedData.edgeId,
        isValid: validatedData.isValid,
        data: validatedData.data || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    res.status(201).json({
      message: 'Connection saved successfully',
      connection,
    });
  } catch (error) {
    console.error('Error saving connection:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Failed to save connection' });
  }
});

// GET: Get connections for a workflow
router.get('/workflow/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    // Fetch connections
    const connections = await db
      .select()
      .from(workflowConnections)
      .where('workflowId', '=', workflowId);
    
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Failed to fetch connections' });
  }
});

// PUT: Update a connection
router.put('/:edgeId', async (req, res) => {
  try {
    const { edgeId } = req.params;
    const validatedData = connectionSchema.partial().parse(req.body);
    
    // Update in database
    const [updatedConnection] = await db
      .update(workflowConnections)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where('edgeId', '=', edgeId)
      .returning();
    
    if (!updatedConnection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    res.json({
      message: 'Connection updated successfully',
      connection: updatedConnection,
    });
  } catch (error) {
    console.error('Error updating connection:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Failed to update connection' });
  }
});

// DELETE: Remove a connection
router.delete('/:edgeId', async (req, res) => {
  try {
    const { edgeId } = req.params;
    
    // Delete from database
    await db
      .delete(workflowConnections)
      .where('edgeId', '=', edgeId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ message: 'Failed to delete connection' });
  }
});

export default router;