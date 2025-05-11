import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { storage } from "./storage";
import { insertWorkflowSchema } from "@shared/schema";
import { ZodError } from "zod";
import workflowMonitoringRoutes from "./routes/workflowMonitoring";
import workflowTemplatesRoutes from "./routes/workflowTemplates";
import appIntegrationsRoutes from "./routes/appIntegrations";
import workflowExecutionRoutes from "./routes/workflowExecution";
import { subscriptionsRouter } from "./routes/subscriptions";
import { setupAuth } from "./replitAuth";
import { pool } from "./db";
import { swaggerSpec } from "./swagger";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup middleware
  app.use(cookieParser());
  
  // Setup Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
    },
  }));
  
  // Endpoint to get the Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Set up Replit Auth
  await setupAuth(app);
  
  /**
   * @swagger
   * /api/auth/user:
   *   get:
   *     summary: Get current user information
   *     description: Retrieves information about the currently authenticated user
   *     tags: [Authentication]
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: User information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get('/api/auth/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Return the Replit Auth user info
    return res.json(req.user);
  });
  
  // Add specialized workflow routes
  app.use('/api/monitoring', workflowMonitoringRoutes);
  app.use('/api/workflow', workflowTemplatesRoutes);
  app.use('/api/app', appIntegrationsRoutes);
  app.use('/api/execution', workflowExecutionRoutes);
  app.use('/api/subscriptions', subscriptionsRouter);
  
  // API Routes

  /**
   * @swagger
   * /api/workflows:
   *   get:
   *     summary: Get all workflows for a user
   *     description: Retrieves all workflows associated with a specific user ID
   *     tags: [Workflows]
   *     parameters:
   *       - in: query
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the user to fetch workflows for
   *     responses:
   *       200:
   *         description: A list of workflows
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Workflow'
   *       400:
   *         description: User ID is required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/workflows", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const workflows = await storage.getWorkflowsByCreator(parseInt(userId));
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  /**
   * @swagger
   * /api/workflows/{id}:
   *   get:
   *     summary: Get a workflow by ID
   *     description: Retrieves a single workflow by its ID
   *     tags: [Workflows]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the workflow to retrieve
   *     responses:
   *       200:
   *         description: The workflow details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Workflow'
   *       404:
   *         description: Workflow not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/workflows/:id", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      const workflow = await storage.getWorkflow(workflowId);
      
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  /**
   * @swagger
   * /api/workflows:
   *   post:
   *     summary: Create a new workflow
   *     description: Create a new workflow with the provided details
   *     tags: [Workflows]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - description
   *               - workflowData
   *               - userId
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Customer Onboarding"
   *               description:
   *                 type: string
   *                 example: "Automate the customer onboarding process"
   *               workflowData:
   *                 type: object
   *                 description: The JSON workflow data including nodes and connections
   *               userId:
   *                 type: integer
   *                 description: ID of the user who owns this workflow
   *               workspaceId:
   *                 type: integer
   *                 nullable: true
   *                 description: Optional workspace ID this workflow belongs to
   *               status:
   *                 type: string
   *                 enum: [draft, active, inactive, archived]
   *                 default: draft
   *               schedule:
   *                 type: string
   *                 nullable: true
   *                 description: Optional cron expression for scheduling
   *     responses:
   *       201:
   *         description: Workflow created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Workflow'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Validation error"
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/workflows", async (req, res) => {
    try {
      const parsedBody = insertWorkflowSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const workflow = await storage.createWorkflow(parsedBody);
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create workflow" });
    }
  });

  /**
   * @swagger
   * /api/workflows/{id}:
   *   put:
   *     summary: Update an existing workflow
   *     description: Update a workflow with new information
   *     tags: [Workflows]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the workflow to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               workflowData:
   *                 type: object
   *               userId:
   *                 type: integer
   *               workspaceId:
   *                 type: integer
   *                 nullable: true
   *               status:
   *                 type: string
   *                 enum: [draft, active, inactive, archived]
   *               schedule:
   *                 type: string
   *                 nullable: true
   *     responses:
   *       200:
   *         description: Workflow updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Workflow'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Validation error"
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   *       404:
   *         description: Workflow not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.put("/api/workflows/:id", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      
      const parsedBody = insertWorkflowSchema.parse({
        ...req.body,
        updatedAt: new Date().toISOString()
      });
      
      const workflow = await storage.updateWorkflow(workflowId, parsedBody);
      
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update workflow" });
    }
  });

  /**
   * @swagger
   * /api/workflows/{id}:
   *   delete:
   *     summary: Delete a workflow
   *     description: Delete a workflow by its ID
   *     tags: [Workflows]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the workflow to delete
   *     responses:
   *       204:
   *         description: Workflow deleted successfully
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      await storage.deleteWorkflow(workflowId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
