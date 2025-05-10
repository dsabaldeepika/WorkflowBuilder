import express from 'express';
import { storage } from '../storage';
import { insertWorkflowTemplateSchema, insertNodeTypeSchema } from '@shared/schema';
import { ZodError } from 'zod';

const router = express.Router();

/**
 * Routes for managing workflow templates and node types
 */

// == Template Routes ==

// Get all templates with optional filtering
router.get('/templates', async (req, res) => {
  try {
    const { category, published, official, userId } = req.query;
    
    const filters: any = {};
    
    if (category) {
      filters.category = category as string;
    }
    
    if (published !== undefined) {
      filters.isPublished = published === 'true';
    }
    
    if (official !== undefined) {
      filters.isOfficial = official === 'true';
    }
    
    if (userId) {
      filters.createdByUserId = parseInt(userId as string);
    }
    
    // Parse tags if provided
    if (req.query.tags) {
      try {
        const tagsParam = req.query.tags as string;
        filters.tags = tagsParam.split(',').map(tag => tag.trim());
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    
    const templates = await storage.getWorkflowTemplates(filters);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    res.status(500).json({ message: 'Failed to fetch workflow templates' });
  }
});

// Get a single template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const template = await storage.getWorkflowTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Increment template popularity when it's viewed
    await storage.incrementTemplatePopularity(templateId);
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching workflow template:', error);
    res.status(500).json({ message: 'Failed to fetch workflow template' });
  }
});

// Create a new template
router.post('/templates', async (req, res) => {
  try {
    const parsedBody = insertWorkflowTemplateSchema.parse(req.body);
    
    const template = await storage.createWorkflowTemplate(parsedBody);
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error creating workflow template:', error);
    res.status(500).json({ message: 'Failed to create workflow template' });
  }
});

// Update an existing template
router.put('/templates/:id', async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const parsedBody = insertWorkflowTemplateSchema.parse(req.body);
    
    const template = await storage.updateWorkflowTemplate(templateId, parsedBody);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error updating workflow template:', error);
    res.status(500).json({ message: 'Failed to update workflow template' });
  }
});

// Delete a template
router.delete('/templates/:id', async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    await storage.deleteWorkflowTemplate(templateId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workflow template:', error);
    res.status(500).json({ message: 'Failed to delete workflow template' });
  }
});

// == Node Type Routes ==

// Get all node types with optional category filtering
router.get('/node-types', async (req, res) => {
  try {
    const { category } = req.query;
    
    const nodeTypes = await storage.getNodeTypes(category as string);
    res.json(nodeTypes);
  } catch (error) {
    console.error('Error fetching node types:', error);
    res.status(500).json({ message: 'Failed to fetch node types' });
  }
});

// Get a single node type by ID
router.get('/node-types/:id', async (req, res) => {
  try {
    const nodeTypeId = parseInt(req.params.id);
    const nodeType = await storage.getNodeType(nodeTypeId);
    
    if (!nodeType) {
      return res.status(404).json({ message: 'Node type not found' });
    }
    
    res.json(nodeType);
  } catch (error) {
    console.error('Error fetching node type:', error);
    res.status(500).json({ message: 'Failed to fetch node type' });
  }
});

// Get a node type by name
router.get('/node-types/by-name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const nodeType = await storage.getNodeTypeByName(name);
    
    if (!nodeType) {
      return res.status(404).json({ message: 'Node type not found' });
    }
    
    res.json(nodeType);
  } catch (error) {
    console.error('Error fetching node type by name:', error);
    res.status(500).json({ message: 'Failed to fetch node type' });
  }
});

// Create a new node type
router.post('/node-types', async (req, res) => {
  try {
    const parsedBody = insertNodeTypeSchema.parse(req.body);
    
    const nodeType = await storage.createNodeType(parsedBody);
    res.status(201).json(nodeType);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error creating node type:', error);
    res.status(500).json({ message: 'Failed to create node type' });
  }
});

// Update an existing node type
router.put('/node-types/:id', async (req, res) => {
  try {
    const nodeTypeId = parseInt(req.params.id);
    const parsedBody = insertNodeTypeSchema.parse(req.body);
    
    const nodeType = await storage.updateNodeType(nodeTypeId, parsedBody);
    
    if (!nodeType) {
      return res.status(404).json({ message: 'Node type not found' });
    }
    
    res.json(nodeType);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Error updating node type:', error);
    res.status(500).json({ message: 'Failed to update node type' });
  }
});

// Delete a node type
router.delete('/node-types/:id', async (req, res) => {
  try {
    const nodeTypeId = parseInt(req.params.id);
    await storage.deleteNodeType(nodeTypeId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting node type:', error);
    res.status(500).json({ message: 'Failed to delete node type' });
  }
});

export default router;