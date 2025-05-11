import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup middleware
  app.use(cookieParser());

  // Set up Replit Auth
  await setupAuth(app);
  
  // Setup API route to get user info
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
  // Get all workflows for a user
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

  // Get a workflow by ID
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

  // Create a new workflow
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

  // Update an existing workflow
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

  // Delete a workflow
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
