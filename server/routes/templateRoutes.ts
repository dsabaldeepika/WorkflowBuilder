import { Router, Request, Response } from 'express';
import { db } from '../db';
import { isAuthenticated } from '../replitAuth';
import { workflows, workflowTemplates, workflowTemplateCategories } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

/**
 * @swagger
 * /api/workflow-templates:
 *   get:
 *     summary: Get all workflow templates
 *     description: Retrieves a list of all available workflow templates
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: List of templates retrieved successfully
 */
router.get('/workflow-templates', async (req: Request, res: Response) => {
  try {
    const templates = await db.select().from(workflowTemplates).orderBy(desc(workflowTemplates.popularity));
    res.json(templates);
  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    res.status(500).json({ message: 'Failed to fetch workflow templates' });
  }
});

/**
 * @swagger
 * /api/workflow-templates/{id}:
 *   get:
 *     summary: Get a workflow template by ID
 *     description: Retrieves a single workflow template by its ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the template to retrieve
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 */
router.get('/workflow-templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const templateId = parseInt(id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }
    
    const [template] = await db
      .select()
      .from(workflowTemplates)
      .where(eq(workflowTemplates.id, templateId));

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching workflow template:', error);
    res.status(500).json({ message: 'Failed to fetch workflow template' });
  }
});

/**
 * @swagger
 * /api/workflow-template-categories:
 *   get:
 *     summary: Get all workflow template categories
 *     description: Retrieves a list of all available template categories
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 */
router.get('/workflow-template-categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.select().from(workflowTemplateCategories);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching template categories:', error);
    res.status(500).json({ message: 'Failed to fetch template categories' });
  }
});

/**
 * @swagger
 * /api/workflow-templates/{id}/import:
 *   post:
 *     summary: Import a workflow template
 *     description: Creates a new workflow based on the selected template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the template to import
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Workflow created successfully
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 */
router.post('/workflow-templates/:id/import', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get the template
    const [template] = await db
      .select()
      .from(workflowTemplates)
      .where(eq(workflowTemplates.id, parseInt(id)));

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Extract workflow data from the template
    const workflowData = template.workflowData as any;
    const nodes = workflowData?.nodes || [];
    const edges = workflowData?.edges || [];

    // Create a new workflow based on the template
    const [workflow] = await db
      .insert(workflows)
      .values({
        name: template.name,
        description: template.description,
        nodes: nodes,
        edges: edges,
        createdByUserId: parseInt(userId),
        workspaceId: null, // Default to personal workspace
        isPublished: false, // Start as draft
      })
      .returning();

    // Increment the template's popularity count
    await db
      .update(workflowTemplates)
      .set({
        popularity: template.popularity + 1,
      })
      .where(eq(workflowTemplates.id, parseInt(id)));

    res.status(201).json(workflow);
  } catch (error) {
    console.error('Error importing workflow template:', error);
    res.status(500).json({ message: 'Failed to import workflow template' });
  }
});

export default router;