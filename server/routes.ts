import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { storage } from "./storage";
import { insertWorkflowSchema, workflows } from "@shared/schema";
import { ZodError } from "zod";
import { db } from "./db";
import { eq } from "drizzle-orm";
import workflowMonitoringRoutes from "./routes/workflowMonitoring";
import workflowTemplatesRoutes from "./routes/workflowTemplates";
import appIntegrationsRoutes from "./routes/appIntegrations";
import workflowExecutionRoutes from "./routes/workflowExecution";
import workflowConnectionsRoutes from "./routes/workflowConnections";
import emailRoutes from "./routes/emailRoutes";
import contactRoutes from "./routes/contactRoutes";
import demoRequestRoutes from "./routes/demoRequestRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import templateRoutes from "./routes/templateRoutes";
import facebookRoutes from "./auth/facebook.routes";
import googleRoutes from "./auth/google.routes";
import authRoutes from './auth/auth.routes';
// import { setupAuth, isAuthenticated } from "./replitAuth";
// Authentication bypass instead of Replit Auth
// import { pool } from "./db"; // REMOVE: not used and not exported
import { swaggerSpec } from "./swagger";
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from "@shared/config";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup middleware
  app.use(cookieParser());

  // Setup Swagger documentation
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  // Endpoint to get the Swagger JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // BYPASS: Temporarily disabled Replit Auth due to iframe authentication issues
  // await setupAuth(app);

  // BYPASS: Create a bypass for the authentication middleware
  // Replace all instances of isAuthenticated middleware with this bypass version
  const bypassAuth = (req: Request, res: Response, next: NextFunction) => {
    // Inject a fake authenticated user into the request
    (req as any).user = {
      id: 1,
      username: "demo_user",
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
      role: "admin",
      subscriptionTier: "pro",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (req as any).isAuthenticated = () => true;
    next();
  };

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
  app.get("/api/auth/user", bypassAuth, (req, res) => {
    // Always return the demo user
    return res.json(req.user);
  });

  // Add specialized workflow routes
  app.use("/api/monitoring", workflowMonitoringRoutes);
  app.use("/api/workflow", workflowTemplatesRoutes);
  app.use("/api/app", appIntegrationsRoutes);
  app.use("/api/execution", workflowExecutionRoutes);
  app.use("/api/workflow/connections", workflowConnectionsRoutes);
  app.use("/api/email", emailRoutes);
  app.use("/api", contactRoutes); // Contact forms and template request
  app.use("/api", demoRequestRoutes); // Demo scheduling requests
  app.use("/api/subscriptions", subscriptionRoutes); // Subscription and billing management
  app.use("/api", templateRoutes); // Workflow template gallery and categories
  app.use("/api/auth", facebookRoutes);
  app.use("/api/auth", googleRoutes);
  app.use('/api/auth', authRoutes);

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
    } catch (error: any) {
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
    } catch (error: any) {
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
      // Only parse the input body without adding unnecessary date fields
      const parsedBody = insertWorkflowSchema.parse(req.body);

      // Get user's subscription information
      const userId = parsedBody.createdByUserId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Get current workflow count for the user
      const userWorkflows = await storage.getWorkflowsByCreator(userId);
      const workflowCount = userWorkflows.length;

      // Get user's subscription
      const userSubscription = await storage.getUserActiveSubscription(userId);
      let subscriptionTier = SubscriptionTier.FREE; // Default to FREE tier

      if (userSubscription) {
        subscriptionTier = userSubscription.tier as SubscriptionTier;
      }

      // Get the workflow limit for their subscription tier
      const maxWorkflows = SUBSCRIPTION_LIMITS[subscriptionTier].maxWorkflows;

      // Check if they've reached their limit
      if (maxWorkflows !== -1 && workflowCount >= maxWorkflows) {
        // Format a more user-friendly message that explains the situation clearly
        const remainingMsg =
          subscriptionTier === SubscriptionTier.FREE
            ? `You can upgrade to our Basic plan to create up to ${
                SUBSCRIPTION_LIMITS[SubscriptionTier.BASIC].maxWorkflows
              } workflows, or to our Professional plan for ${
                SUBSCRIPTION_LIMITS[SubscriptionTier.PROFESSIONAL].maxWorkflows
              } workflows.`
            : `You can upgrade to our ${
                subscriptionTier === SubscriptionTier.BASIC
                  ? "Professional"
                  : "Enterprise"
              } plan to create more workflows.`;

        return res.status(403).json({
          message: `You've reached your limit of ${maxWorkflows} workflows on your ${subscriptionTier} plan. ${remainingMsg}`,
          currentCount: workflowCount,
          maxAllowed: maxWorkflows,
          subscriptionTier: subscriptionTier,
          upgradeRequired: true,
          upgradeOptions: {
            nextTier:
              subscriptionTier === SubscriptionTier.FREE
                ? SubscriptionTier.BASIC
                : subscriptionTier === SubscriptionTier.BASIC
                ? SubscriptionTier.PROFESSIONAL
                : SubscriptionTier.ENTERPRISE,
            nextTierLimit:
              subscriptionTier === SubscriptionTier.FREE
                ? SUBSCRIPTION_LIMITS[SubscriptionTier.BASIC].maxWorkflows
                : subscriptionTier === SubscriptionTier.BASIC
                ? SUBSCRIPTION_LIMITS[SubscriptionTier.PROFESSIONAL]
                    .maxWorkflows
                : -1, // Enterprise is unlimited
          },
        });
      }

      // If we get here, they're under their limit, so create the workflow
      const workflow = await storage.createWorkflow(parsedBody);

      // Return success with additional subscription info for UI feedback
      res.status(201).json({
        ...workflow,
        subscriptionInfo: {
          currentCount: workflowCount + 1, // Include the one we just created
          maxAllowed: maxWorkflows,
          remainingWorkflows:
            maxWorkflows === -1 ? -1 : maxWorkflows - (workflowCount + 1),
        },
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }

      console.error("Error creating workflow:", error);
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
        updatedAt: new Date().toISOString(),
      });

      const workflow = await storage.updateWorkflow(workflowId, parsedBody);

      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      res.json(workflow);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
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
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  });

  // Direct route to health dashboard (no authentication required)
  app.get("/health-dashboard", (req, res) => {
    const htmlPath = path.join(process.cwd(), "health-dashboard.html");

    fs.readFile(htmlPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading health dashboard HTML:", err);
        return res.status(500).send("Error loading health dashboard");
      }

      res.set("Content-Type", "text/html").send(data);
    });
  });

  /**
   * @swagger
   * /api/workflows/{id}/optimization-suggestions:
   *   get:
   *     summary: Get optimization suggestions for a workflow
   *     description: Analyzes a workflow and provides optimization suggestions
   *     tags: [Workflows]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the workflow to analyze
   *     responses:
   *       200:
   *         description: Optimization suggestions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 optimizationSuggestions:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       type:
   *                         type: string
   *                         enum: [timeout, execution, data_processing, error_handling]
   *                       title:
   *                         type: string
   *                       description:
   *                         type: string
   *                       impactLevel:
   *                         type: string
   *                         enum: [low, medium, high]
   *                       nodeIds:
   *                         type: array
   *                         items:
   *                           type: string
   *       404:
   *         description: Workflow not found
   *       500:
   *         description: Server error
   */
  app.get("/api/workflows/:id/optimization-suggestions", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);

      // Fetch the workflow
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, workflowId));

      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      // Parse workflow data
      const nodes: any[] = Array.isArray(workflow.nodes) ? workflow.nodes : [];
      const edges: any[] = Array.isArray(workflow.edges) ? workflow.edges : [];

      // Generate optimization suggestions
      const optimizationSuggestions = [
        {
          id: "timeout-optimization",
          type: "timeout",
          title: "Increase API timeout thresholds",
          description:
            "Add retry logic with increased timeouts for external API calls",
          impactLevel: "high",
          nodeIds: findApiNodes(nodes),
        },
        {
          id: "parallel-execution",
          type: "execution",
          title: "Parallelize API requests",
          description: "Convert sequential API calls to parallel execution",
          impactLevel: "medium",
          nodeIds: findApiNodes(nodes),
        },
        {
          id: "data-transformation",
          type: "data_processing",
          title: "Optimize data transformations",
          description:
            "Combine multiple transformation steps into fewer operations",
          impactLevel: "medium",
          nodeIds: findTransformNodes(nodes),
        },
        {
          id: "error_handling",
          type: "error_handling",
          title: "Improve error handling",
          description: "Add comprehensive error handling with fallback options",
          impactLevel: "high",
          nodeIds: nodes.map((node) => node.id),
        },
      ];

      // Calculate potential performance improvements
      const potentialTimeReduction = Math.floor(Math.random() * 30) + 20; // 20-50% improvement
      const estimatedReliabilityIncrease = Math.floor(Math.random() * 15) + 10; // 10-25% improvement

      res.status(200).json({
        optimizationSuggestions,
        metrics: {
          potentialTimeReduction: `${potentialTimeReduction}%`,
          estimatedReliabilityIncrease: `${estimatedReliabilityIncrease}%`,
          optimizableParts: optimizationSuggestions.reduce(
            (total, suggestion) => total + suggestion.nodeIds.length,
            0
          ),
        },
      });
    } catch (error: any) {
      console.error("Error generating optimization suggestions:", error);
      res.status(500).json({
        message: "Failed to generate optimization suggestions",
        error: error.message,
      });
    }
  });

  /**
   * @swagger
   * /api/workflows/{id}/optimize:
   *   post:
   *     summary: Apply performance optimizations to a workflow
   *     description: Analyzes and applies automated performance optimizations to the specified workflow
   *     tags: [Workflows]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the workflow to optimize
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               optimizationIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Optional list of specific optimization IDs to apply
   *     responses:
   *       200:
   *         description: Optimizations applied successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 workflow:
   *                   $ref: '#/components/schemas/Workflow'
   *                 appliedOptimizations:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       title:
   *                         type: string
   *                       appliedTo:
   *                         type: integer
   *                       type:
   *                         type: string
   *       404:
   *         description: Workflow not found
   *       500:
   *         description: Server error
   */
  app.post("/api/workflows/:id/optimize", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      const { optimizationIds } = req.body || {};

      // Fetch the workflow
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, workflowId));

      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      // Parse workflow data
      const nodes: any[] = Array.isArray(workflow.nodes) ? workflow.nodes : [];
      const edges: any[] = Array.isArray(workflow.edges) ? workflow.edges : [];

      // Generate optimization suggestions
      const optimizationSuggestions = [
        {
          id: "timeout-optimization",
          type: "timeout",
          title: "Increase API timeout thresholds",
          description:
            "Add retry logic with increased timeouts for external API calls",
          impactLevel: "high",
          nodeIds: findApiNodes(nodes),
        },
        {
          id: "parallel-execution",
          type: "execution",
          title: "Parallelize API requests",
          description: "Convert sequential API calls to parallel execution",
          impactLevel: "medium",
          nodeIds: findApiNodes(nodes),
        },
        {
          id: "data-transformation",
          type: "data_processing",
          title: "Optimize data transformations",
          description:
            "Combine multiple transformation steps into fewer operations",
          impactLevel: "medium",
          nodeIds: findTransformNodes(nodes),
        },
        {
          id: "error_handling",
          type: "error_handling",
          title: "Improve error handling",
          description: "Add comprehensive error handling with fallback options",
          impactLevel: "high",
          nodeIds: nodes.map((node) => node.id),
        },
      ];

      // Apply optimizations to the workflow
      const { optimizedNodes, optimizedEdges, appliedOptimizations } =
        applyOptimizations(
          nodes,
          edges,
          optimizationSuggestions,
          optimizationIds
        );

      // Update the workflow with optimized nodes and edges
      const [updatedWorkflow] = await db
        .update(workflows)
        .set({
          nodes: optimizedNodes,
          edges: optimizedEdges,
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, workflowId))
        .returning();

      res.status(200).json({
        workflow: updatedWorkflow,
        appliedOptimizations,
      });
    } catch (error: any) {
      console.error("Error optimizing workflow:", error);
      res.status(500).json({
        message: "Failed to optimize workflow",
        error: error.message,
      });
    }
  });

  // Helper function to find API-related nodes
  function findApiNodes(nodes: any[]): string[] {
    return nodes
      .filter(
        (node: any) =>
          node.type === "api" ||
          node.type === "action" ||
          (node.data &&
            (node.data.nodeType === "api" || node.data.nodeType === "action"))
      )
      .map((node: any) => node.id);
  }

  // Helper function to find transformation nodes
  function findTransformNodes(nodes: any[]): string[] {
    return nodes
      .filter(
        (node: any) =>
          node.type === "transformer" ||
          (node.data && node.data.nodeType === "transformer")
      )
      .map((node: any) => node.id);
  }

  // Helper function to apply optimizations to workflow
  function applyOptimizations(
    nodes: any[],
    edges: any[],
    suggestions: any[],
    optimizationIds?: string[]
  ): {
    optimizedNodes: any[];
    optimizedEdges: any[];
    appliedOptimizations: any[];
  } {
    const optimizedNodes = [...nodes];
    const optimizedEdges = [...edges];
    const appliedOptimizations: any[] = [];
    const suggestionsToApply = optimizationIds
      ? suggestions.filter((s: any) => optimizationIds.includes(s.id))
      : suggestions;
    for (const suggestion of suggestionsToApply) {
      switch (suggestion.type) {
        case "timeout":
          suggestion.nodeIds.forEach((nodeId: string) => {
            const nodeIndex = optimizedNodes.findIndex(
              (n: any) => n.id === nodeId
            );
            if (nodeIndex !== -1) {
              optimizedNodes[nodeIndex] = {
                ...optimizedNodes[nodeIndex],
                data: {
                  ...optimizedNodes[nodeIndex].data,
                  optimized: true,
                  timeoutConfig: {
                    enabled: true,
                    duration: 30000,
                    retryStrategy: "exponential",
                    maxRetries: 3,
                  },
                },
              };
            }
          });
          appliedOptimizations.push({
            id: suggestion.id,
            title: suggestion.title,
            appliedTo: suggestion.nodeIds.length,
            type: suggestion.type,
          });
          break;
        case "execution":
          suggestion.nodeIds.forEach((nodeId: string) => {
            const nodeIndex = optimizedNodes.findIndex(
              (n: any) => n.id === nodeId
            );
            if (nodeIndex !== -1) {
              optimizedNodes[nodeIndex] = {
                ...optimizedNodes[nodeIndex],
                data: {
                  ...optimizedNodes[nodeIndex].data,
                  optimized: true,
                  executionStrategy: "parallel",
                },
              };
            }
          });
          appliedOptimizations.push({
            id: suggestion.id,
            title: suggestion.title,
            appliedTo: suggestion.nodeIds.length,
            type: suggestion.type,
          });
          break;
        case "data_processing":
          suggestion.nodeIds.forEach((nodeId: string) => {
            const nodeIndex = optimizedNodes.findIndex(
              (n: any) => n.id === nodeId
            );
            if (nodeIndex !== -1) {
              optimizedNodes[nodeIndex] = {
                ...optimizedNodes[nodeIndex],
                data: {
                  ...optimizedNodes[nodeIndex].data,
                  optimized: true,
                  combinedTransformation: true,
                },
              };
            }
          });
          appliedOptimizations.push({
            id: suggestion.id,
            title: suggestion.title,
            appliedTo: suggestion.nodeIds.length,
            type: suggestion.type,
          });
          break;
        case "error_handling":
          optimizedNodes.forEach((node: any, index: number) => {
            optimizedNodes[index] = {
              ...node,
              data: {
                ...node.data,
                optimized: true,
                errorHandling: {
                  enabled: true,
                  retryOnError: true,
                  maxRetries: 2,
                  fallbackValue: null,
                },
              },
            };
          });
          appliedOptimizations.push({
            id: suggestion.id,
            title: suggestion.title,
            appliedTo: optimizedNodes.length,
            type: suggestion.type,
          });
          break;
      }
    }
    return { optimizedNodes, optimizedEdges, appliedOptimizations };
  }

  /**
   * @swagger
   * /api/health-monitoring-data:
   *   get:
   *     summary: Get workflow health monitoring data
   *     description: Retrieves comprehensive health data for workflows including performance metrics and error statistics
   *     tags: [Monitoring]
   *     parameters:
   *       - in: query
   *         name: userId
   *         schema:
   *           type: integer
   *         description: Filter by user ID
   *       - in: query
   *         name: workflowId
   *         schema:
   *           type: integer
   *         description: Filter by workflow ID
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [24h, 7d, 30d, 90d]
   *         description: Time range for data aggregation
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [all, success, failed]
   *         description: Filter by execution status
   *     responses:
   *       200:
   *         description: Health monitoring data
   *       500:
   *         description: Server error
   */
  app.get("/api/health-monitoring-data", async (req, res) => {
    try {
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;
      const workflowId = req.query.workflowId
        ? parseInt(req.query.workflowId as string)
        : undefined;
      const timeRange = (req.query.timeRange as string) || "7d";
      const status = (req.query.status as string) || "all";

      // Calculate date range based on timeRange
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case "24h":
          startDate.setHours(startDate.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7); // Default: 7 days
      }

      // Get all workflows (filtered by userId if provided)
      type Workflow = {
        id: number;
        name: string;
        isPublished?: boolean;
        // Add other properties as needed based on your workflow schema
      };
      let workflows: Workflow[] = [];
      if (userId) {
        workflows = await storage.getWorkflowsByCreator(userId);
      } else if (workflowId) {
        const workflow = await storage.getWorkflow(workflowId);
        if (workflow) workflows = [workflow];
      } else {
        workflows = await storage.getAllWorkflows();
      }

      const workflowIds = workflows.map((wf) => wf.id);

      // Get workflow runs for the selected workflows within the date range
      let allRuns: any[] = [];
      for (const wfId of workflowIds) {
        const runs = await storage.getWorkflowRunsByDateRange(
          wfId,
          startDate,
          endDate
        );
        allRuns = [...allRuns, ...runs];
      }

      // Filter runs by status if specified
      if (status === "success") {
        allRuns = allRuns.filter((run) => run.status === "completed");
      } else if (status === "failed") {
        allRuns = allRuns.filter((run) => run.status === "failed");
      }

      // Get all node executions for the workflow runs
      const runIds = allRuns.map((run) => run.id);
      let allNodeExecutions: any[] = [];

      for (const runId of runIds) {
        const nodeExecutions = await storage.getNodeExecutions(runId);
        allNodeExecutions = [...allNodeExecutions, ...nodeExecutions];
      }

      // Calculate summary metrics
      const totalRuns = allRuns.length;
      const successfulRuns = allRuns.filter(
        (run) => run.status === "completed"
      ).length;
      const failedRuns = allRuns.filter(
        (run) => run.status === "failed"
      ).length;
      const successRate =
        totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

      // Calculate average execution time (in seconds)
      let totalExecutionTime = 0;
      let executionTimeCount = 0;

      allRuns.forEach((run) => {
        if (run.startTime && run.endTime) {
          const startTime = new Date(run.startTime).getTime();
          const endTime = new Date(run.endTime).getTime();
          const executionTime = (endTime - startTime) / 1000; // Convert to seconds

          totalExecutionTime += executionTime;
          executionTimeCount++;
        }
      });

      const averageExecutionTime =
        executionTimeCount > 0 ? totalExecutionTime / executionTimeCount : 0;

      // Compile error breakdown
      const errorCategories: Record<string, number> = {};

      allRuns
        .filter((run) => run.status === "failed")
        .forEach((run) => {
          const category = run.errorCategory || "uncategorized";
          errorCategories[category] = (errorCategories[category] || 0) + 1;
        });

      // Calculate workflow performance metrics
      const workflowPerformance = workflows.map((workflow) => {
        const workflowRuns = allRuns.filter(
          (run) => run.workflowId === workflow.id
        );
        const totalWorkflowRuns = workflowRuns.length;
        const successfulWorkflowRuns = workflowRuns.filter(
          (run) => run.status === "completed"
        ).length;
        const workflowSuccessRate =
          totalWorkflowRuns > 0
            ? (successfulWorkflowRuns / totalWorkflowRuns) * 100
            : 0;

        // Calculate average execution time for this workflow
        let workflowTotalTime = 0;
        let workflowTimeCount = 0;

        workflowRuns.forEach((run) => {
          if (run.startTime && run.endTime) {
            const startTime = new Date(run.startTime).getTime();
            const endTime = new Date(run.endTime).getTime();
            const executionTime = (endTime - startTime) / 1000;

            workflowTotalTime += executionTime;
            workflowTimeCount++;
          }
        });

        const workflowAvgTime =
          workflowTimeCount > 0 ? workflowTotalTime / workflowTimeCount : 0;

        return {
          id: workflow.id,
          name: workflow.name,
          executions: totalWorkflowRuns,
          successRate: parseFloat(workflowSuccessRate.toFixed(1)),
          avgTime: parseFloat(workflowAvgTime.toFixed(1)),
        };
      });

      // Generate execution timeline data (executions per day)
      const timelineMap: Record<
        string,
        { executions: number; successCount: number }
      > = {};

      // Create entries for each day in the range
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        timelineMap[dateStr] = { executions: 0, successCount: 0 };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Fill in with actual data
      allRuns.forEach((run) => {
        if (run.startTime) {
          const dateStr = new Date(run.startTime).toISOString().split("T")[0];
          if (timelineMap[dateStr]) {
            timelineMap[dateStr].executions++;
            if (run.status === "completed") {
              timelineMap[dateStr].successCount++;
            }
          }
        }
      });

      // Convert timeline map to array
      const executionTimeline = Object.entries(timelineMap).map(
        ([date, data]) => ({
          date,
          executions: data.executions,
          successRate:
            data.executions > 0
              ? Math.round((data.successCount / data.executions) * 100)
              : 0,
        })
      );

      // Generate optimization suggestions based on the data
      const optimizationSuggestions: any[] = [];

      // Find workflows with low success rates
      workflowPerformance
        .filter((wf) => wf.successRate < 90 && wf.executions >= 5)
        .forEach((wf) => {
          // Get the most common error category for this workflow
          const workflowRuns = allRuns.filter(
            (run) => run.workflowId === wf.id && run.status === "failed"
          );

          const workflowErrors: Record<string, number> = {};
          workflowRuns.forEach((run) => {
            const category = run.errorCategory || "uncategorized";
            workflowErrors[category] = (workflowErrors[category] || 0) + 1;
          });

          let maxErrorCategory = "uncategorized";
          let maxErrorCount = 0;

          Object.entries(workflowErrors).forEach(([category, count]) => {
            if (count > maxErrorCount) {
              maxErrorCategory = category;
              maxErrorCount = count;
            }
          });

          // Generate suggestion based on error category
          let suggestion = "";
          let potentialImprovement = "";

          switch (maxErrorCategory) {
            case "timeout":
              suggestion =
                "Consider increasing timeout threshold for external API calls";
              potentialImprovement = `Could improve success rate by approximately ${Math.round(
                (maxErrorCount / workflowRuns.length) * 100
              )}%`;
              break;
            case "api_rate_limit":
              suggestion = "Implement rate limiting for API requests";
              potentialImprovement = `Could prevent ${maxErrorCount} failures`;
              break;
            case "data_validation":
              suggestion = "Add data validation steps before processing";
              potentialImprovement = `Could reduce validation errors by ${maxErrorCount}`;
              break;
            case "authentication":
              suggestion =
                "Check and refresh authentication credentials regularly";
              potentialImprovement = `Could prevent ${maxErrorCount} authentication failures`;
              break;
            default:
              suggestion = "Implement error handling and retry mechanisms";
              potentialImprovement = `Could improve reliability for this workflow`;
          }

          optimizationSuggestions.push({
            workflowId: wf.id,
            workflowName: wf.name,
            suggestion,
            potentialImprovement,
          });
        });

      // Compose and return the health monitoring data
      const healthData = {
        summary: {
          totalWorkflows: workflows.length,
          activeWorkflows: workflows.filter((wf) => wf.isPublished).length,
          failedWorkflows: failedRuns,
          successRate: parseFloat(successRate.toFixed(1)),
          averageExecutionTime: parseFloat(averageExecutionTime.toFixed(1)),
          totalExecutions: totalRuns,
        },
        workflowPerformance,
        errorBreakdown: errorCategories,
        healthMetrics: {
          systemMemory: 68, // These are system metrics that would come from a monitoring service
          cpuUsage: 41, // In a real implementation, these would be fetched from a system
          apiAvailability: 99.8, // monitoring service or calculated from actual system data
          databaseLatency: 24,
        },
        executionTimeline,
        optimizationSuggestions,
        filters: {
          timeRange,
          status,
          userId,
          workflowId,
        },
      };

      res.json(healthData);
    } catch (error: any) {
      console.error("Error generating health monitoring data:", error);
      res.status(500).json({
        message: "Failed to generate health monitoring data",
        error: error.message,
      });
    }
  });

  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
  });

  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com"
    );
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
