import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';

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

export type ModuleType = 'trigger' | 'action' | 'helper';

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
export type NodeCategory = 'trigger' | 'action' | 'condition' | 'data' | 'integration' | 'agent' | 'transformer' | 'custom' | 'automation' | 'ai' | 'messaging' | 'crm' | 'social' | 'ecommerce' | 'utility';

// For picker tabs
export type PickerTab = 'all' | 'popular' | 'new';

// Node type definitions
export type NodeType = 'trigger' | 'action' | 'condition' | 'data' | 'integration' | 'agent' | 'transformer' | 'connector' | 'api';

// Data type definitions
export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'any';

// Workflow definitions
export interface Workflow {
  id: string;
  name: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

// Workflow template definitions
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  image?: string;
  useCases?: string[];
  requirements?: string[];
  documentation?: string;
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
    type: 'input' | 'output';
    dataType: DataType;
    required?: boolean;
    allowedConnections?: string[];
  }>;
  // Group template flag - indicates if this template contains multiple nodes
  isGroupTemplate?: boolean;
}

// Workflow execution definitions
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'canceled';
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
  level: 'info' | 'warn' | 'error' | 'debug';
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
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
}