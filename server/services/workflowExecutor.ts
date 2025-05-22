import { WorkflowLogger, type WorkflowLogContext } from './workflowLogger';
import { RetryManager, type RetryConfig } from './retryManager';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_CATEGORIES, type ExecutionContext, type ExecutionResult, type TaskResult } from '../types/workflow';
import { EventEmitter } from 'events';

// Generate a unique execution ID
const generateExecutionId = () => uuidv4();

/**
 * Interface for workflow task
 */
interface WorkflowTask {
  id: string;
  name: string;
  type: string;
  appId?: string;
  action?: string;
  input?: Record<string, any>;
  config?: Record<string, any>;
  connectionId?: string;
  // Dependencies show which tasks must complete before this one runs
  dependencies?: string[];
}

/**
 * Interface for workflow definition
 */
interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  tasks: WorkflowTask[];
  schedule?: {
    type: 'once' | 'interval' | 'cron';
    value?: string | number;
  };
  retryConfig?: Partial<RetryConfig>;
  errorHandling?: {
    continueOnError?: boolean;
    notifyOnError?: boolean;
    notificationChannels?: string[];
  };
}

/**
 * Interface for workflow execution
 */
interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  startTime: Date;
  endTime?: Date;
  taskResults: Record<string, TaskResult>;
  variables: Record<string, any>;
  context: WorkflowLogContext;
}

/**
 * Workflow execution status
 */
enum WorkflowExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Simulated app connectors for demonstration
 */
const mockAppConnectors: Record<string, any> = {
  'google-sheets': {
    async performAction(action: string, params: any): Promise<any> {
      // Simulate API call with potential errors
      const random = Math.random();
      
      if (random < 0.2) {
        throw new Error('Connection timeout to Google Sheets API');
      } else if (random < 0.3) {
        throw new Error('Google Sheets API rate limit exceeded');
      }
      
      return { success: true, data: { rows: [{ id: 1, name: 'Test' }] } };
    }
  },
  'slack': {
    async performAction(action: string, params: any): Promise<any> {
      // Simulate API call with potential errors
      const random = Math.random();
      
      if (random < 0.1) {
        throw new Error('Authentication failed for Slack API');
      } else if (random < 0.2) {
        throw new Error('Slack channel not found');
      }
      
      return { success: true, messageId: 'msg_12345' };
    }
  }
};

/**
 * WorkflowExecutor class to execute workflow definitions with error handling and retries
 */
class WorkflowExecutor extends EventEmitter {
  private retryManager: RetryManager;
  private activeExecutions: Map<string, {
    startTime: Date;
    metrics: {
      taskDurations: Record<string, number>;
      retryAttempts: Record<string, number>;
      errorCounts: Record<string, number>;
    };
  }>;

  constructor() {
    super();
    this.retryManager = new RetryManager({
      maxRetries: 3,
      initialBackoff: 1000,
      maxBackoff: 30000,
      retryableCategories: [
        'CONNECTION',
        'TIMEOUT',
        'RATE_LIMIT'
      ]
    });
    this.activeExecutions = new Map();
  }

  /**
   * Execute a workflow with error handling and monitoring
   */
  async executeWorkflow(workflow: WorkflowDefinition, context: ExecutionContext): Promise<ExecutionResult> {
    const executionId = generateExecutionId();
    const workflowContext: WorkflowLogContext = {
      workflowId: workflow.id,
      executionId,
      userId: context.userId
    };

    // Initialize execution metrics
    this.activeExecutions.set(executionId, {
      startTime: new Date(),
      metrics: {
        taskDurations: {},
        retryAttempts: {},
        errorCounts: {}
      }
    });

    try {
      // Start execution monitoring
      await this.startExecutionMonitoring(workflow, executionId);

      // Execute each task with retries and monitoring
      const taskResults: Record<string, TaskResult> = {};
      
      for (const task of workflow.tasks) {
        const taskStartTime = new Date();
        try {
          await this.executeTaskWithRetries(task, workflow, executionId, context);
          
          const taskDuration = new Date().getTime() - taskStartTime.getTime();
          this.updateMetrics(executionId, task.id, 'duration', taskDuration);
          
          taskResults[task.id] = {
            taskId: task.id,
            status: 'completed',
            startTime: taskStartTime.toISOString(),
            endTime: new Date().toISOString(),
            metrics: {
              duration: taskDuration,
              retryAttempts: this.getMetric(executionId, task.id, 'retryAttempts')
            }
          };
        } catch (error) {
          const taskError = error instanceof Error ? error : new Error('Unknown error');
          const errorCategory = this.classifyError(taskError);
          
          this.updateMetrics(executionId, task.id, 'error', errorCategory);
          
          // Handle task failure based on workflow configuration
          if (workflow.errorHandling?.continueOnError) {
            taskResults[task.id] = {
              taskId: task.id,
              status: 'failed',
              startTime: taskStartTime.toISOString(),
              endTime: new Date().toISOString(),
              error: {
                message: taskError.message,
                category: errorCategory,
                retryable: this.isRetryableError(taskError),
                attemptCount: this.getMetric(executionId, task.id, 'retryAttempts')
              }
            };
            continue;
          }
          
          throw error; // Re-throw to fail the workflow if continueOnError is false
        }
      }

      // Log successful completion with metrics
      const executionData = this.activeExecutions.get(executionId);
      const totalDuration = executionData ? new Date().getTime() - executionData.startTime.getTime() : 0;

      WorkflowLogger.logInfo({
        message: 'Workflow completed successfully',
        context: {
          ...workflowContext,
          metrics: {
            duration: totalDuration,
            taskResults: Object.keys(taskResults).length
          }
        }
      });

      const result: ExecutionResult = {
        executionId,
        status: 'completed',
        startTime: context.startTime,
        endTime: new Date().toISOString(),
        taskResults,
        metrics: {
          totalDuration,
          taskDurations: executionData?.metrics.taskDurations || {},
          retryAttempts: executionData?.metrics.retryAttempts || {},
          errorCounts: executionData?.metrics.errorCounts || {}
        }
      };

      this.emit('workflowCompleted', result);
      return result;

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error('Unknown error');
      const errorCategory = this.classifyError(errorInstance);

      // Log workflow failure with detailed context
      WorkflowLogger.logError({
        error: errorInstance,
        category: errorCategory,
        context: {
          ...workflowContext,
          metrics: this.getExecutionMetrics(executionId)
        },
        suggestion: this.getErrorSuggestion(errorInstance, errorCategory)
      });

      const result: ExecutionResult = {
        executionId,
        status: 'failed',
        startTime: context.startTime,
        endTime: new Date().toISOString(),
        error: errorInstance.message,
        metrics: this.getExecutionMetrics(executionId)
      };

      this.emit('workflowFailed', result);
      return result;

    } finally {
      // Stop execution monitoring and cleanup
      await this.stopExecutionMonitoring(executionId);
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Execute a task with retries and error handling
   */
  private async executeTaskWithRetries(
    task: WorkflowTask,
    workflow: WorkflowDefinition,
    executionId: string,
    context: ExecutionContext
  ): Promise<void> {
    const taskContext: WorkflowLogContext = {
      workflowId: workflow.id,
      executionId,
      nodeId: task.id,
      userId: context.userId,
      stepName: task.name
    };

    await this.retryManager.executeWithRetry({
      operation: () => this.executeTask(task, workflow, executionId),
      context: taskContext,
      errorClassifier: this.classifyError,
      onBeforeRetry: async (error, attempts, backoffTime) => {
        this.updateMetrics(executionId, task.id, 'retryAttempts', attempts);
        
        WorkflowLogger.logInfo({
          message: `Retrying task execution`,
          context: {
            ...taskContext,
            attempt: attempts,
            nextRetryIn: backoffTime,
            errorDetails: {
              message: error.message,
              category: this.classifyError(error)
            }
          }
        });

        this.emit('taskRetry', {
          taskId: task.id,
          executionId,
          attempt: attempts,
          error: error.message,
          nextRetryIn: backoffTime
        });
      },
      onFinalFailure: async (error, attempts) => {
        if (workflow.errorHandling?.notifyOnFailure) {
          await this.notifyTaskFailure(task, workflow, error, attempts);
        }
      }
    });
  }

  /**
   * Classify errors to determine retry strategy
   */
  private classifyError(error: Error): keyof typeof ERROR_CATEGORIES {
    if (error.message?.includes('ECONNRESET') || 
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('socket hang up')) {
      return 'CONNECTION';
    }

    if (error.message?.includes('rate limit') ||
        error.message?.includes('quota exceeded')) {
      return 'RATE_LIMIT';
    }

    if (error.message?.includes('validation failed') ||
        error.message?.includes('invalid input')) {
      return 'VALIDATION';
    }

    if (error.message?.includes('unauthorized') ||
        error.message?.includes('forbidden')) {
      return 'AUTH';
    }

    if (error.message?.includes('timeout')) {
      return 'TIMEOUT';
    }

    if (error.message?.includes('business rule') ||
        error.message?.includes('workflow logic')) {
      return 'BUSINESS';
    }

    return 'UNKNOWN';
  }

  /**
   * Check if an error is retryable based on its category
   */
  private isRetryableError(error: Error): boolean {
    const category = this.classifyError(error);
    return ['CONNECTION', 'TIMEOUT', 'RATE_LIMIT'].includes(category);
  }

  /**
   * Get suggestions for error resolution
   */
  private getErrorSuggestion(error: Error, category: keyof typeof ERROR_CATEGORIES): string {
    const suggestions: Record<keyof typeof ERROR_CATEGORIES, string> = {
      CONNECTION: 'Check network connectivity and external service status',
      TIMEOUT: 'Consider increasing timeout values or optimizing the operation',
      VALIDATION: 'Verify input data format and requirements',
      RATE_LIMIT: 'Implement rate limiting or request throttling',
      AUTH: 'Verify credentials and permissions',
      SYSTEM: 'Check system resources and configuration',
      BUSINESS: 'Review business rules and workflow logic',
      UNKNOWN: 'Check logs for more details and contact support if needed'
    };

    return suggestions[category] || suggestions.UNKNOWN;
  }

  /**
   * Update execution metrics
   */
  private updateMetrics(executionId: string, taskId: string, metricType: string, value: number): void {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    switch (metricType) {
      case 'duration':
        execution.metrics.taskDurations[taskId] = value;
        break;
      case 'retryAttempts':
        execution.metrics.retryAttempts[taskId] = (execution.metrics.retryAttempts[taskId] || 0) + 1;
        break;
      case 'error':
        execution.metrics.errorCounts[taskId] = (execution.metrics.errorCounts[taskId] || 0) + 1;
        break;
    }
  }

  /**
   * Get metric value for a task
   */
  private getMetric(executionId: string, taskId: string, metricType: string): number {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return 0;

    switch (metricType) {
      case 'retryAttempts':
        return execution.metrics.retryAttempts[taskId] || 0;
      case 'errorCount':
        return execution.metrics.errorCounts[taskId] || 0;
      default:
        return 0;
    }
  }

  /**
   * Get all metrics for an execution
   */
  private getExecutionMetrics(executionId: string) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return {};

    const totalDuration = new Date().getTime() - execution.startTime.getTime();
    return {
      totalDuration,
      ...execution.metrics
    };
  }

  /**
   * Start monitoring a workflow execution
   */
  private async startExecutionMonitoring(workflow: WorkflowDefinition, executionId: string): Promise<void> {
    // Initialize monitoring for the execution
    this.emit('workflowStarted', {
      workflowId: workflow.id,
      executionId,
      startTime: new Date().toISOString()
    });
  }

  /**
   * Stop monitoring a workflow execution
   */
  private async stopExecutionMonitoring(executionId: string): Promise<void> {
    this.emit('workflowEnded', {
      executionId,
      endTime: new Date().toISOString(),
      metrics: this.getExecutionMetrics(executionId)
    });
  }

  /**
   * Notify about task failure
   */
  private async notifyTaskFailure(
    task: WorkflowTask,
    workflow: WorkflowDefinition,
    error: Error,
    attempts: number
  ): Promise<void> {
    // Implementation would depend on notification system
    this.emit('taskFailed', {
      workflowId: workflow.id,
      taskId: task.id,
      error: error.message,
      attempts,
      timestamp: new Date().toISOString()
    });
  }
}

export {
  WorkflowExecutor,
  type WorkflowDefinition,
  type WorkflowTask,
  type WorkflowExecution,
  type TaskResult,
  WorkflowExecutionStatus
};