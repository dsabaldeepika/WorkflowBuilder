import { WorkflowLogContext } from '../services/workflowLogger';

// Predefined error categories for consistent error classification
export enum ERROR_CATEGORIES {
  CONNECTION = 'CONNECTION',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  DATA_PROCESSING = 'DATA_PROCESSING',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN'
}

export interface ExecutionContext {
  userId: string;
  startTime: string;
  variables?: Record<string, any>;
  timeout?: number;
  notifications?: {
    onFailure?: boolean;
    onRetry?: boolean;
    onSuccess?: boolean;
  };
}

export interface ErrorDetails {
  code?: string;
  statusCode?: number;
  type?: string;
  category?: keyof typeof ERROR_CATEGORIES;
}

export interface WorkflowError {
  message: string;
  details?: ErrorDetails;
  retryable?: boolean;
  attemptCount?: number;
}

export interface ErrorHandling {
  continueOnError?: boolean;
  notifyOnError?: boolean;
  notificationChannels?: string[];
}

export interface ExecutionMetrics {
  totalDuration: number;
  taskDurations: Record<string, number>;
  retryAttempts?: Record<string, number>;
  errorCounts?: Record<string, number>;
}

export interface ExecutionResult {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  error?: string;
  taskResults?: Record<string, TaskResult>;
  variables?: Record<string, any>;
  metrics?: ExecutionMetrics;
}

export interface TaskResult {
  taskId: string;
  status: 'completed' | 'failed' | 'skipped';
  startTime: string;
  endTime?: string;
  error?: WorkflowError;
  output?: any;
  metrics?: {
    duration: number;
    retryAttempts?: number;
    memoryUsage?: number;
  };
}
