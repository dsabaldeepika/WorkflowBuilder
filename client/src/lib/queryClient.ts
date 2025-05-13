import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Enhanced Error handling for API requests
 * Provides detailed error messages from the server
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Standardized fetch API request with error handling and content type headers
 * @param method HTTP method to use
 * @param url The API endpoint URL
 * @param body Optional request body (will be JSON stringified)
 * @param options Additional fetch options
 * @returns Promise with the parsed JSON response
 */
export async function apiRequest<T = any>(
  method: string,
  url: string,
  body?: any,
  options?: RequestInit,
): Promise<T> {
  // Create cache key for requests when appropriate
  const cacheKey = method === 'GET' ? url : undefined;
  
  // Prepare request options
  const fetchOptions: RequestInit = {
    method,
    ...options,
    headers: {
      ...(options?.headers || {}),
      'Content-Type': 'application/json',
    },
    credentials: "include",
  };
  
  // Add body for non-GET requests
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  // Use AbortController for request timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
  fetchOptions.signal = controller.signal;
  
  try {
    const res = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    await throwIfResNotOk(res);
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: The server took too long to respond');
    }
    throw error;
  }
}

// Type definitions
type UnauthorizedBehavior = "returnNull" | "throw";
type QueryFnOptions = {
  on401: UnauthorizedBehavior;
  timeout?: number;
}

/**
 * Enhanced query function factory with improved error handling and performance
 */
export const getQueryFn: <T>(options: QueryFnOptions) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, timeout = 30000 }) =>
  async ({ queryKey }) => {
    // Extract URL and params from queryKey
    const url = Array.isArray(queryKey) ? queryKey[0] as string : queryKey as string;
    
    // Use AbortController for request timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const res = await fetch(url, {
        credentials: "include",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      // Parse the response efficiently
      return await res.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond');
      }
      throw error;
    }
  };

/**
 * Optimized QueryClient configuration for high-performance applications
 * - Implements intelligent cache management
 * - Provides optimal stale time and refetch strategies
 * - Includes performance-focused error handling
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: import.meta.env.PROD ? false : true, // Only refetch in development
      staleTime: 5 * 60 * 1000, // 5 minutes - balance between freshness and performance
      cacheTime: 10 * 60 * 1000, // 10 minutes - keep unused data in cache for longer
      retry: (failureCount, error) => {
        // Only retry network errors, not 4xx/5xx responses
        if (error instanceof Error && error.message.includes('network')) {
          return failureCount < 3; // Retry network errors up to 3 times
        }
        return false;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Retry mutations once for transient errors
      onError: (err: any) => {
        console.error('Mutation error:', err);
        // Additional error handling/reporting could be added here
      },
    },
  },
});
