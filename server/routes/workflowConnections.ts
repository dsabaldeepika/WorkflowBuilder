/**
 * Routes for managing workflow connections between nodes
 * These endpoints handle the creation, retrieval, updating and deletion of connection validation states
 */

import { Router } from 'express';
import { db } from '../db';
import { workflowConnections, insertWorkflowConnectionSchema, workflows } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { ZodError } from 'zod';

const router = Router();

/**
 * @swagger
 * /api/workflow/connections:
 *   get:
 *     summary: Get all connections for a workflow
 *     description: Retrieves all connection validations for a specific workflow
 *     tags: [Connections]
 *     parameters:
 *       - in: query
 *         name: workflowId
 *         schema:
 *           type: integer
 *         description: Workflow ID to get connections for
 *     responses:
 *       200:
 *         description: List of connection validations
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { workflowId } = req.query;
    
    if (!workflowId) {
      return res.status(400).json({ message: 'Workflow ID is required' });
    }
    
    const connections = await db.select()
      .from(workflowConnections)
      .where(eq(workflowConnections.workflowId, Number(workflowId)));
      
    return res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching workflow connections:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch workflow connections',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/workflow/connections/{id}:
 *   get:
 *     summary: Get a specific connection
 *     description: Retrieves connection validation details by ID
 *     tags: [Connections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID to retrieve
 *     responses:
 *       200:
 *         description: Connection validation details
 *       404:
 *         description: Connection not found
 *       500:
 *         description: Server error
 */
router.get('/:id([0-9]+)', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [connection] = await db.select()
      .from(workflowConnections)
      .where(eq(workflowConnections.id, Number(id)));
      
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    return res.status(200).json(connection);
  } catch (error) {
    console.error('Error fetching connection:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/workflow/connections/{workflowId}:
 *   get:
 *     summary: Get all connections for a workflow by ID
 *     description: Retrieves all connection validations for a specific workflow
 *     tags: [Connections]
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workflow ID to get connections for
 *     responses:
 *       200:
 *         description: List of connection validations
 *       404:
 *         description: No connections found
 *       500:
 *         description: Server error
 */
router.get('/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    const connections = await db.select()
      .from(workflowConnections)
      .where(eq(workflowConnections.workflowId, Number(workflowId)));
      
    if (!connections.length) {
      return res.status(200).json([]); // Return empty array instead of 404
    }
    
    return res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching workflow connections:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch workflow connections',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/workflow/connections:
 *   post:
 *     summary: Create or update a connection validation
 *     description: Creates a new connection validation or updates an existing one
 *     tags: [Connections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceNodeId
 *               - targetNodeId
 *               - edgeId
 *               - isValid
 *             properties:
 *               workflowId:
 *                 type: integer
 *               sourceNodeId:
 *                 type: string
 *               targetNodeId:
 *                 type: string
 *               edgeId:
 *                 type: string
 *               isValid:
 *                 type: boolean
 *               validationMessage:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Connection validation created
 *       200:
 *         description: Connection validation updated
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body against schema
    const validatedData = insertWorkflowConnectionSchema.parse(req.body);
    
    // Check if connection already exists by edgeId
    const [existingConnection] = await db.select()
      .from(workflowConnections)
      .where(eq(workflowConnections.edgeId, validatedData.edgeId));
    
    if (existingConnection) {
      // Update existing connection
      const [updatedConnection] = await db
        .update(workflowConnections)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(workflowConnections.id, existingConnection.id))
        .returning();
      
      return res.status(200).json(updatedConnection);
    } else {
      // Create new connection
      const [newConnection] = await db
        .insert(workflowConnections)
        .values({
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return res.status(201).json(newConnection);
    }
  } catch (error) {
    console.error('Error creating/updating connection:', error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to create/update connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/workflow/connections/{id}:
 *   delete:
 *     summary: Delete a connection validation
 *     description: Deletes a connection validation by ID
 *     tags: [Connections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID to delete
 *     responses:
 *       204:
 *         description: Connection deleted
 *       404:
 *         description: Connection not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedConnection] = await db
      .delete(workflowConnections)
      .where(eq(workflowConnections.id, Number(id)))
      .returning();
      
    if (!deletedConnection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting connection:', error);
    return res.status(500).json({ 
      message: 'Failed to delete connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/workflow/connections/edge/{edgeId}:
 *   get:
 *     summary: Get connection by edge ID
 *     description: Retrieves connection validation details by edge ID
 *     tags: [Connections]
 *     parameters:
 *       - in: path
 *         name: edgeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Edge ID to retrieve connection for
 *     responses:
 *       200:
 *         description: Connection validation details
 *       404:
 *         description: Connection not found
 *       500:
 *         description: Server error
 */
router.get('/edge/:edgeId', async (req, res) => {
  try {
    const { edgeId } = req.params;
    
    const [connection] = await db.select()
      .from(workflowConnections)
      .where(eq(workflowConnections.edgeId, edgeId));
      
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    return res.status(200).json(connection);
  } catch (error) {
    console.error('Error fetching connection by edge ID:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;