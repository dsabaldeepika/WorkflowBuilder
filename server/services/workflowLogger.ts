import fs, { createReadStream } from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { createInterface } from 'readline';
import { strict as assert } from 'assert';

// Define error levels for our workflow system
const LOG_LEVELS = {
  ERROR: 'error',      // Critical errors that stop workflow execution
  WARNING: 'warning',  // Issues that don't stop execution but need attention
  INFO: 'info',        // General information about workflow execution
  DEBUG: 'debug'       // Detailed debugging information
};

// Define error categories for better organization
const ERROR_CATEGORIES = {
  CONNECTION: 'connection',      // API connection issues, network problems
  AUTHENTICATION: 'auth',        // Authentication/authorization failures
  VALIDATION: 'validation',      // Data validation errors
  TIMEOUT: 'timeout',            // Timeout errors
  RATE_LIMIT: 'rate_limit',      // API rate limit issues
  DATA_PROCESSING: 'data',       // Data processing errors
  SYSTEM: 'system',              // System-level errors
  UNKNOWN: 'unknown'             // Unclassified errors
};

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure Winston logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'workflow-engine' },
  transports: [
    // Write to all logs with level 'info' and below to combined.log
    new transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'error' and below to error.log
    new transports.File({ 
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Console output for development
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logsDir, 'rejections.log') })
  ]
});

interface WorkflowLogContext {
  workflowId: string;
  nodeId?: string;
  executionId: string;
  userId?: string;
  attempt?: number;
  stepName?: string;
  appName?: string;
  operation?: string;
  nextRetryIn?: number;
  errorDetails?: {
    code?: string;
    statusCode?: number;
    type?: string;
  };
}

interface ErrorLogOptions {
  error: Error | string;
  category: keyof typeof ERROR_CATEGORIES;
  suggestion?: string;
  context: WorkflowLogContext;
  retryable?: boolean;
  retryIn?: number; // milliseconds until retry
}

interface InfoLogOptions {
  message: string;
  context: WorkflowLogContext;
  data?: any;
}

interface QueryOptions {
  level?: string;
  from?: Date;
  limit?: number;
}

class WorkflowLogger {
  /**
   * Log workflow errors with detailed context
   */
  static logError({ error, category, suggestion, context, retryable = false, retryIn = 0 }: ErrorLogOptions) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error({
      message: errorMessage,
      stack: errorStack,
      category: ERROR_CATEGORIES[category] || ERROR_CATEGORIES.UNKNOWN,
      suggestion,
      retryable,
      retryIn,
      ...context
    });
    
    return {
      timestamp: new Date().toISOString(),
      message: errorMessage,
      category: ERROR_CATEGORIES[category],
      suggestion,
      retryable,
      retryIn
    };
  }
  
  /**
   * Log informational messages about workflow execution
   */
  static logInfo({ message, context, data }: InfoLogOptions) {
    logger.info({
      message,
      ...context,
      ...(data ? { data } : {})
    });
  }
  
  /**
   * Log warning messages about workflow execution
   */
  static logWarning({ message, context, data }: InfoLogOptions) {
    logger.warn({
      message,
      ...context,
      ...(data ? { data } : {})
    });
  }
  
  /**
   * Log debug information for troubleshooting
   */
  static logDebug({ message, context, data }: InfoLogOptions) {
    logger.debug({
      message,
      ...context,
      ...(data ? { data } : {})
    });
  }
  
  /**
   * Get the latest logs for a specific workflow
   */
  static async getWorkflowLogs(workflowId: string, limit: number = 100): Promise<any[]> {
    // In a real implementation, this would query logs from a database or parse log files
    // For now, we'll return a placeholder
    return []; // Would normally return filtered logs
  }
  
  /**
   * Get error statistics for a dashboard
   */
  static async getErrorStats(timeframe: 'day' | 'week' | 'month' = 'day', comparePrevious: boolean = false): Promise<any> {
    const startDate = new Date();
    switch (timeframe) {
      case 'day':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    try {
      // Read error logs from file
      const logDir = path.join(process.cwd(), 'logs');
      const errorLogPath = path.join(logDir, 'error.log');
      
      const logs = await new Promise<any[]>((resolve, reject) => {
        const errorLogs: any[] = [];
        createReadStream(errorLogPath)
        const rl = createInterface({ input: createReadStream(errorLogPath) });
        rl.on('line', (line: string) => {
            try {
              const log = JSON.parse(line);
              if (new Date(log.timestamp) >= startDate) {
                errorLogs.push(log);
              }
            } catch (e) {
              // Skip malformed lines
            }
          })
          .on('close', () => resolve(errorLogs))
          .on('error', reject);
      });

      // Calculate statistics
      const errorsByCategory: Record<string, number> = {};
      const errorsByMessage: Record<string, number> = {};
      const recentErrors: any[] = [];

      logs.forEach((log: any) => {
        // Track category counts
        const category = log.category || ERROR_CATEGORIES.UNKNOWN;
        errorsByCategory[category] = (errorsByCategory[category] || 0) + 1;
        
        // Track message frequency
        const message = log.message || 'Unknown error';
        errorsByMessage[message] = (errorsByMessage[message] || 0) + 1;

        // Keep track of recent errors
        recentErrors.push({
          timestamp: log.timestamp,
          message: message,
          category: category,
          workflowId: log.workflowId,
          nodeId: log.nodeId,
          suggestion: log.suggestion,
          retryable: log.retryable
        });
      });

      // Sort and limit most common errors
      const mostCommon = Object.entries(errorsByMessage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([message, count]) => ({ message, count }));

      return {
        totalErrors: logs.length,
        byCategory: errorsByCategory,
        mostCommon,
        recentErrors: recentErrors.slice(-100).reverse() // Last 100 errors, most recent first
      };
    } catch (error) {
      console.error('Error fetching error statistics:', error);
      throw new Error('Failed to fetch error statistics');
    }
  }
}

export { 
  WorkflowLogger, 
  LOG_LEVELS, 
  ERROR_CATEGORIES, 
  type WorkflowLogContext,
  type ErrorLogOptions,
  type InfoLogOptions,
  type QueryOptions
};