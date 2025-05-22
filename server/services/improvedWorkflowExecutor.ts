import { WorkflowLogger, type WorkflowLogContext } from './workflowLogger';
import { RetryManager, type RetryConfig } from './retryManager';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  ERROR_CATEGORIES,
  type ExecutionContext,
  type ExecutionResult,
  type TaskResult,
  type WorkflowDefinition,
  type WorkflowTask,
  type ExecutionMetrics,
  type ErrorDetails
} from '../types/workflow';

const generateExecutionId = () => uuidv4();

/**
 * Enhanced WorkflowExecutor with comprehensive error handling and monitoring
 */
export class ImprovedWorkflowExecutor extends EventEmitter {
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
        ERROR_CATEGORIES.CONNECTION,
        ERROR_CATEGORIES.TIMEOUT,
        ERROR_CATEGORIES.RATE_LIMIT
      ]
    });
    this.activeExecutions = new Map();
  }

  /**
   * Execute a task with proper error handling and monitoring
   */
  private async executeTask(task: WorkflowTask, executionId: string): Promise<any> {
    if (!task.type || !task.action) {
      throw new Error(`Invalid task configuration: missing type or action for task ${task.id}`);
    }

    try {
      // Here you would implement the actual task execution logic
      // This is a placeholder that simulates task execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      
      if (Math.random() < 0.2) {
        throw new Error('Simulated task failure');
      }

      return { success: true, data: { taskId: task.id, timestamp: new Date() }};
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error('Unknown error');
      throw this.enhanceError(errorInstance, task);
    }
  }

  /**
   * Execute a workflow with comprehensive error handling and monitoring
   */
  async executeWorkflow(workflow: WorkflowDefinition, context: ExecutionContext): Promise<ExecutionResult> {
    const executionId = generateExecutionId();
    const workflowContext: WorkflowLogContext = {
      workflowId: workflow.id,
      executionId,
      userId: context.userId
    };

    this.initializeExecution(executionId);
    await this.startExecutionMonitoring(workflow, executionId);

    try {
      const taskResults = await this.executeWorkflowTasks(workflow, executionId, context);
      return this.handleSuccessfulExecution(workflow, executionId, workflowContext, taskResults, context);
    } catch (error) {
      return this.handleFailedExecution(error, workflow, executionId, workflowContext, context);
    } finally {
      await this.cleanupExecution(executionId);
    }
  }

  private initializeExecution(executionId: string): void {
    this.activeExecutions.set(executionId, {
      startTime: new Date(),
      metrics: {
        taskDurations: {},
        retryAttempts: {},
        errorCounts: {}
      }
    });
  }

  private async executeWorkflowTasks(
    workflow: WorkflowDefinition,
    executionId: string,
    context: ExecutionContext
  ): Promise<Record<string, TaskResult>> {
    const taskResults: Record<string, TaskResult> = {};
    const tasks = this.sortTasksByDependencies(workflow.tasks);

    for (const task of tasks) {
      const taskStartTime = new Date();
      try {
        await this.executeTaskWithRetries(task, workflow, executionId, context);
        taskResults[task.id] = this.createSuccessfulTaskResult(task, taskStartTime, executionId);
      } catch (error) {
        const taskResult = this.createFailedTaskResult(task, error, taskStartTime, executionId);
        taskResults[task.id] = taskResult;

        if (!workflow.errorHandling?.continueOnError) {
          throw error;
        }
      }
    }
    return taskResults;
  }

  private sortTasksByDependencies(tasks: WorkflowTask[]): WorkflowTask[] {
    const graph = new Map<string, Set<string>>();
    const sorted: WorkflowTask[] = [];
    const visited = new Set<string>();
    
    // Build dependency graph
    tasks.forEach(task => {
      graph.set(task.id, new Set(task.dependencies || []));
    });

    // Topological sort
    const visit = (taskId: string, path = new Set<string>()) => {
      if (path.has(taskId)) {
        throw new Error(`Circular dependency detected: ${Array.from(path).join(' -> ')} -> ${taskId}`);
      }
      if (visited.has(taskId)) return;

      path.add(taskId);
      const dependencies = graph.get(taskId) || new Set();
      for (const dep of dependencies) {
        visit(dep, new Set(path));
      }
      path.delete(taskId);
      
      visited.add(taskId);
      sorted.unshift(tasks.find(t => t.id === taskId)!);
    };

    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    });

    return sorted;
  }

  private createSuccessfulTaskResult(
    task: WorkflowTask,
    startTime: Date,
    executionId: string
  ): TaskResult {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    this.updateMetrics(executionId, task.id, 'duration', duration);

    return {
      taskId: task.id,
      status: 'completed',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      metrics: {
        duration,
        retryAttempts: this.getMetric(executionId, task.id, 'retryAttempts')
      }
    };
  }

  private createFailedTaskResult(
    task: WorkflowTask,
    error: Error,
    startTime: Date,
    executionId: string
  ): TaskResult {
    const errorInstance = error instanceof Error ? error : new Error('Unknown error');
    const errorCategory = this.classifyError(errorInstance);
    const endTime = new Date();

    return {
      taskId: task.id,
      status: 'failed',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      error: {
        message: errorInstance.message,
        details: {
          category: errorCategory,
          code: this.getErrorCode(errorInstance),
          type: 'task_error'
        },
        retryable: this.isRetryableError(errorInstance),
        attemptCount: this.getMetric(executionId, task.id, 'retryAttempts')
      }
    };
  }

  private getErrorCode(error: Error): string {
    // Extract error code from error message or use a default
    const codeMatch = error.message.match(/\[([A-Z_]+)\]/);
    return codeMatch ? codeMatch[1] : 'UNKNOWN_ERROR';
  }

  private enhanceError(error: Error, task: WorkflowTask): Error {
    const enhancedError = new Error(error.message);
    (enhancedError as any).taskId = task.id;
    (enhancedError as any).taskType = task.type;
    (enhancedError as any).timestamp = new Date().toISOString();
    return enhancedError;
  }

  private isRetryableError(error: Error): boolean {
    const category = this.classifyError(error);
    return [
      ERROR_CATEGORIES.CONNECTION,
      ERROR_CATEGORIES.TIMEOUT,
      ERROR_CATEGORIES.RATE_LIMIT
    ].includes(category);
  }

  /**
   * Classify errors for consistent handling
   */
  private classifyError(error: Error): keyof typeof ERROR_CATEGORIES {
    if (error.message?.includes('ECONNRESET') || 
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('socket hang up')) {
      return ERROR_CATEGORIES.CONNECTION;
    }

    if (error.message?.includes('rate limit') ||
        error.message?.includes('quota exceeded')) {
      return ERROR_CATEGORIES.RATE_LIMIT;
    }

    if (error.message?.includes('validation failed') ||
        error.message?.includes('invalid input')) {
      return ERROR_CATEGORIES.VALIDATION;
    }

    if (error.message?.includes('unauthorized') ||
        error.message?.includes('forbidden')) {
      return ERROR_CATEGORIES.AUTHENTICATION;
    }

    if (error.message?.includes('timeout')) {
      return ERROR_CATEGORIES.TIMEOUT;
    }

    if (error.message?.includes('data processing') ||
        error.message?.includes('transform error')) {
      return ERROR_CATEGORIES.DATA_PROCESSING;
    }

    return ERROR_CATEGORIES.UNKNOWN;
  }

  private getErrorSuggestion(error: Error, category: keyof typeof ERROR_CATEGORIES): string {
    const suggestions: Record<keyof typeof ERROR_CATEGORIES, string> = {
      [ERROR_CATEGORIES.CONNECTION]: 'Check network connectivity and external service status',
      [ERROR_CATEGORIES.TIMEOUT]: 'Consider increasing timeout values or optimizing the operation',
      [ERROR_CATEGORIES.VALIDATION]: 'Verify input data format and requirements',
      [ERROR_CATEGORIES.RATE_LIMIT]: 'Implement rate limiting or request throttling',
      [ERROR_CATEGORIES.AUTHENTICATION]: 'Verify credentials and permissions',
      [ERROR_CATEGORIES.SYSTEM]: 'Check system resources and configuration',
      [ERROR_CATEGORIES.DATA_PROCESSING]: 'Validate data format and transformation logic',
      [ERROR_CATEGORIES.UNKNOWN]: 'Check logs for more details and contact support if needed'
    };

    return suggestions[category] || suggestions[ERROR_CATEGORIES.UNKNOWN];
  }

  private async handleSuccessfulExecution(
    workflow: WorkflowDefinition,
    executionId: string, 
    workflowContext: WorkflowLogContext,
    taskResults: Record<string, TaskResult>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const { totalDuration, metrics } = this.getExecutionMetrics(executionId);

    WorkflowLogger.logInfo({
      message: 'Workflow completed successfully',
      context: {
        ...workflowContext,
        errorDetails: {
          code: 'SUCCESS',
          type: 'workflow_completion'
        }
      }
    });

    const result: ExecutionResult = {
      executionId,
      status: 'completed',
      startTime: context.startTime,
      endTime: new Date().toISOString(),
      taskResults,
      metrics
    };

    this.emit('workflowCompleted', result);
    return result;
  }

  private async handleFailedExecution(
    error: Error,
    workflow: WorkflowDefinition,
    executionId: string,
    workflowContext: WorkflowLogContext,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const errorInstance = error instanceof Error ? error : new Error('Unknown error');
    const errorCategory = this.classifyError(errorInstance);

    WorkflowLogger.logError({
      error: errorInstance,
      context: {
        ...workflowContext,
        errorDetails: {
          category: errorCategory,
          code: this.getErrorCode(errorInstance),
          type: 'workflow_failure'
        }
      }
    });

    const result: ExecutionResult = {
      executionId,
      status: 'failed',
      startTime: context.startTime,
      endTime: new Date().toISOString(),
      error: errorInstance.message,
      metrics: this.getExecutionMetrics(executionId).metrics
    };

    this.emit('workflowFailed', result);
    return result;
  }

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

  private getExecutionMetrics(executionId: string): { totalDuration: number; metrics: ExecutionMetrics } {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return {
        totalDuration: 0,
        metrics: {
          totalDuration: 0,
          taskDurations: {},
          retryAttempts: {},
          errorCounts: {}
        }
      };
    }

    const totalDuration = new Date().getTime() - execution.startTime.getTime();
    return {
      totalDuration,
      metrics: {
        totalDuration,
        taskDurations: execution.metrics.taskDurations,
        retryAttempts: execution.metrics.retryAttempts,
        errorCounts: execution.metrics.errorCounts
      }
    };
  }

  private async startExecutionMonitoring(workflow: WorkflowDefinition, executionId: string): Promise<void> {
    this.emit('workflowStarted', {
      workflowId: workflow.id,
      executionId,
      startTime: new Date().toISOString()
    });
  }

  private async cleanupExecution(executionId: string): Promise<void> {
    const metrics = this.getExecutionMetrics(executionId);
    this.emit('workflowEnded', {
      executionId,
      endTime: new Date().toISOString(),
      metrics: metrics.metrics
    });
    this.activeExecutions.delete(executionId);
  }

  private async notifyTaskFailure(
    task: WorkflowTask,
    workflow: WorkflowDefinition,
    error: Error,
    attempts: number
  ): Promise<void> {
    if (!workflow.errorHandling?.notifyOnError) return;

    this.emit('taskFailed', {
      workflowId: workflow.id,
      taskId: task.id,
      error: error.message,
      attempts,
      timestamp: new Date().toISOString()
    });

    // Implement actual notification logic here (e.g., email, Slack, etc.)
  }
}
