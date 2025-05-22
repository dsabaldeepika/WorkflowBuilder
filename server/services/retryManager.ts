import { WorkflowLogger, ERROR_CATEGORIES, type WorkflowLogContext } from './workflowLogger';

/**
 * Configuration for retry strategies
 */
interface RetryConfig {
  // Maximum number of retry attempts
  maxRetries: number;
  
  // Initial backoff time in milliseconds
  initialBackoff: number;
  
  // Backoff multiplier for exponential backoff
  backoffMultiplier: number;
  
  // Maximum backoff time in milliseconds
  maxBackoff: number;
  
  // Optional jitter factor (0-1) to randomize backoff times
  jitter?: number;
  
  // Categories of errors that should be retried
  retryableCategories: Array<keyof typeof ERROR_CATEGORIES>;
  
  // Categories of errors that should never be retried
  nonRetryableCategories: Array<keyof typeof ERROR_CATEGORIES>;
  
  // Callback to determine if an error is retryable
  isRetryableError?: (error: Error, category: keyof typeof ERROR_CATEGORIES) => boolean | null;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialBackoff: 1000, // 1 second
  backoffMultiplier: 2,
  maxBackoff: 30000, // 30 seconds
  jitter: 0.2, // 20% jitter
  
  // Error categories that are generally safe to retry
  retryableCategories: [
    'CONNECTION',
    'TIMEOUT',
    'RATE_LIMIT'
  ],
  
  // Error categories that should not be retried
  nonRetryableCategories: [
    'AUTHENTICATION',
    'VALIDATION'
  ],
  
  // Custom logic for determining retryability
  isRetryableError: (error, category) => {
    if (error.message?.includes('quota exceeded')) {
      return false; // Don't retry quota errors
    }
    
    // Check for specific network errors that are transient
    if (error.message?.includes('ECONNRESET') || 
        error.message?.includes('socket hang up') ||
        error.message?.includes('network timeout')) {
      return true;
    }
    
    // Return null to let the category-based decision handle it
    return null;
  }
};

/**
 * Calculate backoff time using exponential backoff with jitter
 */
function calculateBackoffTime(attempt: number, config: RetryConfig): number {
  // Calculate base backoff with exponential strategy
  const backoff = Math.min(
    config.initialBackoff * Math.pow(config.backoffMultiplier, attempt),
    config.maxBackoff
  );
  
  // Apply jitter if specified
  if (config.jitter && config.jitter > 0) {
    const jitterAmount = backoff * config.jitter;
    return backoff - jitterAmount + (Math.random() * jitterAmount * 2);
  }
  
  return backoff;
}

/**
 * Determine if an error should be retried based on configuration
 */
function shouldRetryError(
  error: Error,
  category: keyof typeof ERROR_CATEGORIES,
  attempt: number,
  config: RetryConfig
): boolean {
  // Check max retries
  if (attempt >= config.maxRetries) {
    return false;
  }
  
  // Check custom retry logic if provided
  if (config.isRetryableError) {
    const customDecision = config.isRetryableError(error, category);
    if (customDecision !== null) {
      return customDecision as boolean;
    }
  }
  
  // If it's in the non-retryable categories, don't retry
  if (config.nonRetryableCategories.includes(category)) {
    return false;
  }
  
  // If it's in the retryable categories, retry
  if (config.retryableCategories.includes(category)) {
    return true;
  }
  
  // Default to not retrying for unspecified categories
  return false;
}

/**
 * Interface for retry operation options
 */
interface RetryOperationOptions<T> {
  operation: () => Promise<T>;
  context: WorkflowLogContext;
  category?: keyof typeof ERROR_CATEGORIES;
  retryConfig?: Partial<RetryConfig>;
  onBeforeRetry?: (error: Error, attempts: number, backoffTime: number) => Promise<void>;
  onFinalFailure?: (error: Error, attempts: number) => Promise<void>;
  errorClassifier?: (error: Error) => keyof typeof ERROR_CATEGORIES | null;
}

/**
 * RetryManager class to handle retries with advanced backoff strategies
 */
class RetryManager {
  private config: RetryConfig;
  
  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }
  
  /**
   * Execute an operation with retries
   */
  async executeWithRetry<T>({
    operation,
    context,
    category = 'UNKNOWN',
    retryConfig = {},
    onBeforeRetry,
    onFinalFailure,
    errorClassifier
  }: RetryOperationOptions<T>): Promise<T> {
    // Merge configurations
    const config = { ...this.config, ...retryConfig };
    let attempts = 0;
    let lastError: Error;
    
    while (true) {
      try {
        attempts++;
        return await operation();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        lastError = error;
        
        // Try to classify the error if a classifier is provided
        if (errorClassifier) {
          const classifiedCategory = errorClassifier(error);
          if (classifiedCategory) {
            category = classifiedCategory;
          }
        }
        
        // Determine if we should retry
        const shouldRetry = shouldRetryError(error, category, attempts, config);
        const backoffTime = calculateBackoffTime(attempts, config);
        
        // Log the error with enhanced context
        await WorkflowLogger.logError({
          error,
          category,
          context: {
            ...context,
            attempt: attempts,
            nextRetryIn: shouldRetry ? backoffTime : undefined
          },
          retryable: shouldRetry,
          retryIn: shouldRetry ? backoffTime : 0,
          suggestion: this.generateErrorSuggestion(error, category, attempts, shouldRetry)
        });
        
        // If we should retry, wait and try again
        if (shouldRetry) {
          if (onBeforeRetry) {
            await onBeforeRetry(error, attempts, backoffTime);
          }
          
          // Wait for the backoff period
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          continue; // Try again
        }
        
        // No more retries, handle final failure
        if (onFinalFailure) {
          await onFinalFailure(error, attempts);
        }
        
        // Enhance error message with context before throwing
        error.message = `[${category}] ${error.message} (after ${attempts} attempts)`;
        throw error;
      }
    }
  }
  
  /**
   * Generate a helpful suggestion for resolving the error
   */
  private generateErrorSuggestion(
    error: Error, 
    category: keyof typeof ERROR_CATEGORIES,
    attempts: number,
    canRetry: boolean
  ): string {
    const baseMessage = RetryManager.generateErrorMessage(error, category, attempts);
    
    if (!canRetry) {
      return `${baseMessage} This error cannot be retried automatically. Please check your configuration and try manually.`;
    }
    
    return baseMessage;
  }
  
  /**
   * Generate a suggested user message for an error
   */
  static generateErrorMessage(error: Error, category: keyof typeof ERROR_CATEGORIES, attempts: number): string {
    const errorType = ERROR_CATEGORIES[category];
    
    switch (category) {
      case 'CONNECTION':
        return `Connection failed after ${attempts} attempts. Please check your network connection and try again later.`;
      
      case 'AUTHENTICATION':
        return `Authentication failed. Please check your API keys and permissions.`;
      
      case 'VALIDATION':
        return `Data validation error: ${error.message}. Please check your input data.`;
      
      case 'TIMEOUT':
        return `Operation timed out after ${attempts} attempts. The service might be experiencing heavy load.`;
      
      case 'RATE_LIMIT':
        return `API rate limit exceeded. Please try again later or consider upgrading your plan for higher limits.`;
      
      case 'DATA_PROCESSING':
        return `Error processing data: ${error.message}. Please check the format of your data.`;
      
      default:
        return `An error occurred: ${error.message}. Please try again or contact support if the issue persists.`;
    }
  }
}

export {
  RetryManager,
  type RetryConfig,
  type RetryOperationOptions,
  DEFAULT_RETRY_CONFIG
};