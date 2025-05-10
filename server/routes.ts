import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import { pool } from "./db";
import { storage } from "./storage";
import { insertWorkflowSchema } from "@shared/schema";
import { ZodError } from "zod";
import workflowMonitoringRoutes from "./routes/workflowMonitoring";
import authRoutes from "./auth/auth.routes";
import { setupPassport, initializeOAuthProviders } from "./auth/auth.service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session store
  const PgSessionStore = connectPgSimple(session);
  const sessionStore = new PgSessionStore({
    pool,
    tableName: 'sessions',
    createTableIfMissing: true
  });

  // Setup middleware
  app.use(cookieParser());
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || 'development-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  setupPassport();

  // Initialize OAuth providers if needed
  await initializeOAuthProviders();
  
  // Register auth routes
  app.use('/api/auth', authRoutes);
  
  // Register monitoring routes
  app.use('/api/monitoring', workflowMonitoringRoutes);
  
  // API Routes
  // Get all workflows for a user
  app.get("/api/workflows", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const workflows = await storage.getWorkflowsByUserId(parseInt(userId));
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
