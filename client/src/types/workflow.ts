import { Node, Edge } from "reactflow";
import { z } from "zod";

// App definitions
export interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  modules: Module[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  type: ModuleType;
  icon: string;
  actions: Action[];
}

export type ModuleType = "trigger" | "action" | "helper";

export interface Action {
  id: string;
  name: string;
  description: string;
  inputFields: InputField[];
  outputFields: OutputField[];
}

export interface InputField {
  id: string;
  name: string;
  type: DataType;
  description: string;
  required: boolean;
  default?: any;
  options?: Option[];
}

export interface OutputField {
  id: string;
  name: string;
  type: DataType;
  description: string;
}

export interface Option {
  id: string;
  label: string;
  value: any;
}

// Node category definitions
export type NodeCategory =
  | "trigger"
  | "action"
  | "condition"
  | "data"
  | "integration"
  | "agent"
  | "transformer"
  | "custom"
  | "automation"
  | "ai"
  | "messaging"
  | "crm"
  | "social"
  | "ecommerce"
  | "utility";

// For picker tabs
export type PickerTab = "all" | "popular" | "new";

// Node type definitions
export type NodeType =
  | "trigger"
  | "action"
  | "condition"
  | "data"
  | "integration"
  | "agent"
  | "transformer"
  | "connector"
  | "api";

// Data type definitions
export type DataType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "date"
  | "any";

// Schedule options for workflows
export interface ScheduleOptions {
  enabled: boolean;
  frequency: "once" | "hourly" | "daily" | "weekly" | "monthly" | "custom";
  runCount?: number;
  customCron?: string;
  nextRun?: string;
  lastRun?: string;
}

// Node template definitions for custom node templates
export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: NodeCategory;
  nodeType: NodeType;
  icon: string;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isCustom: boolean;
  // Optional fields
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  ports?: Array<{
    id: string;
    type: "input" | "output";
    dataType: DataType;
    required?: boolean;
    allowedConnections?: string[];
  }>;
}

// Workflow execution definitions
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed" | "canceled";
  startTime: string;
  endTime?: string;
  logs: ExecutionLog[];
  result?: any;
  error?: string;
}

export interface ExecutionLog {
  timestamp: string;
  nodeId: string;
  message: string;
  level: "info" | "warn" | "error" | "debug";
  data?: any;
}

// Agent definitions
export interface Agent {
  id: string;
  name: string;
  description: string;
  instructions: string;
  tools: AgentTool[];
  model: string;
  memory: boolean;
  maxTokens: number;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: AgentToolParameter[];
}

export interface AgentToolParameter {
  id: string;
  name: string;
  type: DataType;
  description: string;
  required: boolean;
}

// Connection validation
export interface ConnectionValidation {
  isValid: boolean;
  message?: string;
  source: string;
  target: string;
}

// Performance optimization
export interface PerformanceReport {
  bottlenecks: PerformanceIssue[];
  redundancies: PerformanceIssue[];
  apiCalls: PerformanceIssue[];
  executionTime: number;
  memoryUsage: number;
  suggestions: string[];
}

export interface PerformanceIssue {
  id: string;
  nodeId: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  suggestion: string;
}

// Zod Schemas
export const NodeDataSchema = z.object({
  label: z.string(),
  nodeType: z.string().optional(),
  category: z.enum([
    "trigger",
    "action",
    "condition",
    "data",
    "integration",
    "agent",
    "transformer",
    "custom",
    "automation",
    "ai",
    "messaging",
    "crm",
    "social",
    "ecommerce",
    "utility"
  ]).optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  config: z.record(z.any()).optional(),
  state: z.enum(["idle", "running", "success", "error", "warning"]).optional(),
  backendId: z.number().optional(),
  inputFields: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean().optional(),
      description: z.string().optional(),
      defaultValue: z.any().optional(),
      validation: z.object({
        type: z.string(),
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        options: z.array(z.any()).optional()
      }).optional()
    })
  ).optional(),
  outputFields: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      description: z.string().optional()
    })
  ).optional(),
  service: z.string().optional(),
  event: z.string().optional(),
  action: z.string().optional(),
  sourceConnectionStatus: z.enum(["success", "error", "pending"]).optional(),
  targetConnectionStatus: z.enum(["success", "error", "pending"]).optional(),
  connectionValidated: z.boolean().optional(),
  ports: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["input", "output"]),
      dataType: z.string(),
      required: z.boolean().optional(),
      allowedConnections: z.array(z.string()).optional(),
      validation: z.object({
        type: z.string(),
        rules: z.array(z.string()).optional()
      }).optional()
    })
  ).optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  edges: z.array(z.any()).optional(),
  name: z.string().optional(),
  displayName: z.string().optional(),
  color: z.string().optional(),
  iconUrl: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export const NodeConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  type: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  service: z.string().optional(),
  version: z.string(),
  author: z.string().optional(),
  inputFields: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      label: z.string().optional(),
      description: z.string().optional(),
      required: z.boolean().optional(),
      defaultValue: z.any().optional(),
      validation: z.object({
        type: z.string(),
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        options: z.array(z.any()).optional()
      }).optional()
    })
  ),
  outputFields: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      description: z.string().optional()
    })
  ),
  configuration: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

export const NodeTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum([
    "trigger",
    "action",
    "condition",
    "data",
    "integration",
    "agent",
    "transformer",
    "custom",
    "automation",
    "ai",
    "messaging",
    "crm",
    "social",
    "ecommerce",
    "utility"
  ]),
  nodeType: z.enum([
    "trigger",
    "action",
    "condition",
    "data",
    "integration",
    "agent",
    "transformer",
    "connector",
    "api"
  ]),
  icon: z.string(),
  configuration: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
  isFavorite: z.boolean(),
  isCustom: z.boolean(),
  inputs: z.record(z.any()).optional(),
  outputs: z.record(z.any()).optional(),
  ports: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["input", "output"]),
      dataType: z.string(),
      required: z.boolean().optional(),
      allowedConnections: z.array(z.string()).optional()
    })
  ).optional()
});

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
  schedule: z.object({
    enabled: z.boolean(),
    frequency: z.string(),
    runCount: z.number()
  }).optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

export const WorkflowTemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  isOfficial: z.boolean(),
  imageUrl: z.string().nullable(),
  popularity: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  workflowData: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any())
  }).optional(),
  version: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

// Type definitions from schemas
export type NodeData = z.infer<typeof NodeDataSchema>;
export type NodeConfig = z.infer<typeof NodeConfigSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;

// Validation helper functions
export const validateNodeData = (data: unknown) => NodeDataSchema.parse(data);
export const validateNodeConfig = (config: unknown) => NodeConfigSchema.parse(config);
export const validateNodeTemplate = (template: unknown) => NodeTemplateSchema.parse(template);
export const validateWorkflow = (workflow: unknown) => WorkflowSchema.parse(workflow);
export const validateWorkflowTemplate = (template: unknown) => WorkflowTemplateSchema.parse(template);

// Type guards
export const isNodeData = (data: unknown): data is NodeData => NodeDataSchema.safeParse(data).success;
export const isNodeConfig = (config: unknown): config is NodeConfig => NodeConfigSchema.safeParse(config).success;
export const isNodeTemplate = (template: unknown): template is NodeTemplate => NodeTemplateSchema.safeParse(template).success;
export const isWorkflow = (workflow: unknown): workflow is Workflow => WorkflowSchema.safeParse(workflow).success;
export const isWorkflowTemplate = (template: unknown): template is WorkflowTemplate => WorkflowTemplateSchema.safeParse(template).success;
