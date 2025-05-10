import { WorkflowLogger, type WorkflowLogContext } from './workflowLogger';
import { RetryManager, type RetryConfig } from './retryManager';
import { v4 as uuidv4 } from 'uuid';

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
 * Interface for task execution result
 */
interface TaskResult {
  taskId: string;
  success: boolean;
  startTime: Date;
  endTime: Date;
  output?: any;
  error?: Error;
  attempts?: number;
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
class WorkflowExecutor {
  private retryManager: RetryManager;
  
  constructor(customRetryConfig?: Partial<RetryConfig>) {
    this.retryManager = new RetryManager(customRetryConfig);
  }
  
  /**
   * Execute a workflow definition
   */
  async executeWorkflow(workflow: WorkflowDefinition, initialVariables: Record<string, any> = {}): Promise<WorkflowExecution> {
    const executionId = uuidv4();
    const startTime = new Date();
    
    // Setup execution context
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      status: WorkflowExecutionStatus.RUNNING,
      startTime,
      taskResults: {},
      variables: { ...initialVariables },
      context: {
        workflowId: workflow.id,
        executionId,
        userId: workflow.createdBy
      }
    };
    
    try {
      // Log workflow execution start
      WorkflowLogger.logInfo({
        message: `Starting workflow execution: ${workflow.name}`,
        context: execution.context,
        data: { 
          tasks: workflow.tasks.length,
          initialVariables: Object.keys(initialVariables)
        }
      });
      
      // Build dependency graph to find tasks that can run
      const taskDependencies = this.buildDependencyGraph(workflow.tasks);
      const completedTasks = new Set<string>();
      const failedTasks = new Set<string>();
      
      // Keep processing until all tasks are complete or we can't proceed
      while (completedTasks.size < workflow.tasks.length) {
        const executableTasks = workflow.tasks.filter(task => {
          // Skip completed and failed tasks
          if (completedTasks.has(task.id) || failedTasks.has(task.id)) {
            return false;
          }
          
          // Check if all dependencies are complete
          const dependencies = taskDependencies[task.id] || [];
          return dependencies.every(depId => completedTasks.has(depId));
        });
        
        // If no tasks can be executed, we're either done or blocked
        if (executableTasks.length === 0) {
          // Check if we have any tasks left that haven't been processed
          const remainingTasks = workflow.tasks.filter(task => 
            !completedTasks.has(task.id) && !failedTasks.has(task.id)
          );
          
          if (remainingTasks.length > 0) {
            // Blocked by failed dependency
            throw new Error('Workflow execution blocked due to failed task dependencies');
          }
          
          break; // All tasks processed
        }
        
        // Execute tasks in parallel where possible
        // For demonstration, we'll keep it simple and execute one by one
        for (const task of executableTasks) {
          try {
            const result = await this.executeTask(task, execution, workflow);
            execution.taskResults[task.id] = result;
            
            if (result.success) {
              completedTasks.add(task.id);
              
              // Update variables with task output
              if (result.output) {
                execution.variables[`tasks.${task.id}.output`] = result.output;
              }
            } else {
              failedTasks.add(task.id);
              
              // Check if we should continue on error
              if (!workflow.errorHandling?.continueOnError) {
                throw new Error(`Task ${task.name} failed and continueOnError is false`);
              }
            }
          } catch (error) {
            failedTasks.add(task.id);
            
            // Check if we should continue on error
            if (!workflow.errorHandling?.continueOnError) {
              throw error;
            }
          }
        }
      }
      
      // Check if all tasks completed successfully
      const allTasksSuccessful = workflow.tasks.every(task => 
        completedTasks.has(task.id)
      );
      
      execution.status = allTasksSuccessful 
        ? WorkflowExecutionStatus.COMPLETED 
        : WorkflowExecutionStatus.FAILED;
      
    } catch (error) {
      execution.status = WorkflowExecutionStatus.FAILED;
      
      WorkflowLogger.logError({
        error: error as Error,
        category: 'SYSTEM',
        context: execution.context,
        suggestion: 'Check workflow configuration and task dependencies'
      });
    } finally {
      execution.endTime = new Date();
      
      // Log workflow execution end
      WorkflowLogger.logInfo({
        message: `Workflow execution ${execution.status}: ${workflow.name}`,
        context: execution.context,
        data: { 
          duration: execution.endTime.getTime() - execution.startTime.getTime(),
          status: execution.status
        }
      });
    }
    
    return execution;
  }
  
  /**
   * Execute a single task with retries
   */
  private async executeTask(
    task: WorkflowTask, 
    execution: WorkflowExecution,
    workflow: WorkflowDefinition
  ): Promise<TaskResult> {
    const startTime = new Date();
    const taskContext: WorkflowLogContext = {
      ...execution.context,
      nodeId: task.id,
      stepName: task.name,
      appName: task.appId,
      operation: task.action
    };
    
    try {
      // Log task execution start
      WorkflowLogger.logInfo({
        message: `Executing task: ${task.name}`,
        context: taskContext
      });
      
      // Process input variables (replace templates etc.)
      const processedInput = this.processTaskInput(task, execution.variables);
      
      // Determine error category based on task type
      const errorCategory = task.appId ? 'CONNECTION' : 'SYSTEM';
      
      // Execute the task with retries
      const result = await this.retryManager.executeWithRetry({
        operation: async () => {
          // Check if we have a connector for this app
          if (task.appId && task.action) {
            const connector = mockAppConnectors[task.appId];
            if (!connector) {
              throw new Error(`App connector not found for app ID: ${task.appId}`);
            }
            
            // Call the app connector
            return await connector.performAction(task.action, processedInput);
          }
          
          // Handle basic task types
          switch (task.type) {
            case 'code':
              // Normally would execute custom code here
              return { success: true, data: { result: 'Code executed' } };
              
            case 'transformer':
              // Transform data
              return { success: true, data: processedInput };
              
            case 'conditional':
              // Evaluate a condition
              return { success: true, result: true };
              
            default:
              throw new Error(`Unknown task type: ${task.type}`);
          }
        },
        context: taskContext,
        category: errorCategory,
        retryConfig: workflow.retryConfig,
        onBeforeRetry: (error, attempt, backoffTime) => {
          // Notify about retry
          WorkflowLogger.logWarning({
            message: `Retrying task ${task.name} after error: ${error.message}`,
            context: taskContext,
            data: { attempt, backoffTime }
          });
        },
        onFinalFailure: (error, attempts) => {
          // Generate user-friendly error message
          const userMessage = RetryManager.generateErrorMessage(error, errorCategory, attempts);
          
          // Log final failure with user-friendly message
          WorkflowLogger.logError({
            error,
            category: errorCategory,
            context: taskContext,
            suggestion: userMessage
          });
          
          // Check if we should send a notification
          if (workflow.errorHandling?.notifyOnError) {
            // In a real app, send notification here
            console.log(`[NOTIFICATION] Task ${task.name} failed: ${userMessage}`);
          }
        }
      });
      
      const endTime = new Date();
      
      // Log successful task completion
      WorkflowLogger.logInfo({
        message: `Task completed successfully: ${task.name}`,
        context: taskContext,
        data: { 
          duration: endTime.getTime() - startTime.getTime(),
          outputKeys: result ? Object.keys(result) : []
        }
      });
      
      return {
        taskId: task.id,
        success: true,
        startTime,
        endTime,
        output: result
      };
    } catch (error) {
      const endTime = new Date();
      
      return {
        taskId: task.id,
        success: false,
        startTime,
        endTime,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
  
  /**
   * Process task input by replacing variable references
   */
  private processTaskInput(task: WorkflowTask, variables: Record<string, any>): Record<string, any> {
    if (!task.input) return {};
    
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(task.input)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // Extract variable name
        const varName = value.substring(2, value.length - 2).trim();
        result[key] = variables[varName] !== undefined ? variables[varName] : null;
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        result[key] = this.processTaskInput({ ...task, input: value as Record<string, any> }, variables);
      } else {
        // Use the value as is
        result[key] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Build a map of task IDs to their dependencies
   */
  private buildDependencyGraph(tasks: WorkflowTask[]): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    
    for (const task of tasks) {
      graph[task.id] = task.dependencies || [];
    }
    
    return graph;
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