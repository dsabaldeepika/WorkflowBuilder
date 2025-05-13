/**
 * Utility for monitoring and reporting application performance metrics
 */

// Track API request timing
interface RequestMetric {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
  error?: string;
  size?: number;
}

// Hold pending and completed requests
const requests: Map<string, RequestMetric> = new Map();
const completedRequests: RequestMetric[] = [];

// Configuration options
let isEnabled = true;
let maxStoredRequests = 100;
let slowThresholdMs = 1000;
let errorCallback: ((metric: RequestMetric) => void) | null = null;
let slowRequestCallback: ((metric: RequestMetric) => void) | null = null;

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Start tracking a new API request
 * @param url The endpoint URL
 * @param method The HTTP method
 * @returns A unique request ID
 */
export function trackRequestStart(url: string, method: string): string {
  if (!isEnabled) return '';
  
  const requestId = generateRequestId();
  
  requests.set(requestId, {
    url,
    method,
    startTime: performance.now(),
  });
  
  return requestId;
}

/**
 * Complete tracking for an API request
 * @param requestId The request ID from trackRequestStart
 * @param status HTTP status code
 * @param error Error message if applicable
 * @param size Response size in bytes if available
 */
export function trackRequestEnd(
  requestId: string,
  status?: number,
  error?: string,
  size?: number
): void {
  if (!isEnabled || !requestId) return;
  
  const request = requests.get(requestId);
  if (!request) return;
  
  // Update request with completion data
  request.endTime = performance.now();
  request.status = status;
  request.error = error;
  request.size = size;
  
  // Calculate duration
  const duration = request.endTime - request.startTime;
  
  // Call error callback if applicable
  if (error && errorCallback) {
    errorCallback(request);
  }
  
  // Call slow request callback if applicable
  if (duration > slowThresholdMs && slowRequestCallback) {
    slowRequestCallback(request);
  }
  
  // Add to completed requests
  completedRequests.unshift(request);
  
  // Remove from pending requests
  requests.delete(requestId);
  
  // Limit stored requests
  if (completedRequests.length > maxStoredRequests) {
    completedRequests.pop();
  }
}

/**
 * Configure the performance monitor
 */
export function configurePerformanceMonitor({
  enabled = true,
  storedRequestLimit = 100,
  slowRequestThreshold = 1000,
  onError,
  onSlowRequest,
}: {
  enabled?: boolean;
  storedRequestLimit?: number;
  slowRequestThreshold?: number;
  onError?: (metric: RequestMetric) => void;
  onSlowRequest?: (metric: RequestMetric) => void;
}) {
  isEnabled = enabled;
  maxStoredRequests = storedRequestLimit;
  slowThresholdMs = slowRequestThreshold;
  errorCallback = onError || null;
  slowRequestCallback = onSlowRequest || null;
}

/**
 * Get performance metrics for completed requests
 * @returns Array of request metrics
 */
export function getRequestMetrics(): RequestMetric[] {
  return [...completedRequests];
}

/**
 * Get performance summary statistics
 */
export function getPerformanceSummary() {
  if (completedRequests.length === 0) {
    return {
      totalRequests: 0,
      averageDuration: 0,
      maxDuration: 0,
      errorRate: 0,
      slowRequests: 0,
    };
  }
  
  let totalDuration = 0;
  let maxDuration = 0;
  let errorCount = 0;
  let slowCount = 0;
  
  completedRequests.forEach(request => {
    if (!request.endTime) return;
    
    const duration = request.endTime - request.startTime;
    totalDuration += duration;
    
    if (duration > maxDuration) {
      maxDuration = duration;
    }
    
    if (request.error || (request.status && request.status >= 400)) {
      errorCount++;
    }
    
    if (duration > slowThresholdMs) {
      slowCount++;
    }
  });
  
  return {
    totalRequests: completedRequests.length,
    averageDuration: totalDuration / completedRequests.length,
    maxDuration,
    errorRate: errorCount / completedRequests.length,
    slowRequests: slowCount,
  };
}

/**
 * Reset all stored metrics
 */
export function resetMetrics(): void {
  requests.clear();
  completedRequests.length = 0;
}

/**
 * Enhanced fetch function with performance tracking
 */
export async function performanceTrackedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method || 'GET';
  const requestId = trackRequestStart(url, method);
  
  try {
    const response = await fetch(url, options);
    const clonedResponse = response.clone();
    
    // Get response size if possible
    let size: number | undefined;
    try {
      const text = await clonedResponse.text();
      size = text.length;
    } catch {
      // Ignore errors when trying to get size
    }
    
    trackRequestEnd(requestId, response.status, undefined, size);
    return response;
  } catch (error) {
    trackRequestEnd(requestId, undefined, error.message);
    throw error;
  }
}