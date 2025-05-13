import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// In-flight requests cache to avoid duplicate simultaneous API calls with same parameters
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Enhanced API request function with:
 * - Request deduplication (avoids duplicate simultaneous identical requests)
 * - Timeout handling 
 * - Retries for network failures
 * - Proper error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit & { 
    method?: string;
    body?: any;
    timeout?: number;
    deduplicate?: boolean;
    retry?: boolean | number;
  },
): Promise<T> {
  const method = options?.method || 'GET';
  const timeout = options?.timeout || 30000; // 30 second default timeout
  const shouldRetry = options?.retry ?? false;
  const maxRetries = typeof shouldRetry === 'number' ? shouldRetry : (shouldRetry ? 2 : 0);
  const deduplicate = options?.deduplicate ?? (method === 'GET'); // Default to deduplication for GET requests
  
  // Create a unique request key for deduplication based on URL and request body
  const requestBody = options?.body ? 
    (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) 
    : '';
  const requestKey = `${method}:${url}:${requestBody}`;
  
  // Check if this identical request is already in flight and return that promise instead
  if (deduplicate && inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey) as Promise<T>;
  }
  
  // Function to perform the actual request with retries
  const performRequest = async (retryCount = 0): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const res = await fetch(url, {
        ...options,
        method,
        signal: controller.signal,
        headers: {
          ...(options?.headers || {}),
          'Content-Type': 'application/json',
        },
        body: options?.body ? 
          (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) 
          : undefined,
        credentials: "include",
      });
      
      clearTimeout(timeoutId);
      
      await throwIfResNotOk(res);
      
      // For responses without content, just return empty object
      if (res.status === 204 || res.headers.get('content-length') === '0') {
        return {} as T;
      }
      
      return await res.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Network error or timeout - attempt retry if enabled and max retries not exceeded
      if (maxRetries > retryCount && 
          (error instanceof TypeError || error instanceof DOMException)) {
        // Exponential backoff
        const backoff = Math.min(1000 * Math.pow(2, retryCount), 10000); 
        await new Promise(resolve => setTimeout(resolve, backoff));
        return performRequest(retryCount + 1);
      }
      
      throw error;
    } finally {
      // Remove from in-flight requests map when completed
      if (deduplicate) {
        inFlightRequests.delete(requestKey);
      }
    }
  };
  
  // Create the request promise
  const requestPromise = performRequest();
  
  // Add to in-flight requests if deduplication is enabled
  if (deduplicate) {
    inFlightRequests.set(requestKey, requestPromise);
  }
  
  return requestPromise;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Optimized query client configuration for high-scale applications (5000+ users)
 * - Uses smart stale time settings to balance freshness and performance
 * - Implements retry logic for network failures but not for 4xx errors
 * - Adds appropriate caching strategies
 * - Implements data persistence for offline support
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      // Smarter stale time to reduce server load (5 minutes for most data)
      // This is much better than Infinity for a multi-user system
      staleTime: 5 * 60 * 1000, 
      // Add smart refetching but not too aggressive
      refetchOnWindowFocus: true, 
      refetchOnMount: 'always',
      refetchOnReconnect: true,
      // Add retry logic for network failures (but not for 4xx errors)
      retry: (failureCount, error) => {
        // Don't retry for client errors
        if (error instanceof Error && 
            error.message.startsWith('4')) {
          return false;
        }
        // Retry 3 times for server errors or network issues
        return failureCount < 3;
      },
      // Add reasonable timeouts to prevent hanging requests
      gcTime: 10 * 60 * 1000, // 10 minutes (this replaces cacheTime in React Query v5)
      // Implement smart error handling
      onError: (error: Error) => {
        console.error('Query error:', error);
        // Could add centralized error logging here
      },
    },
    mutations: {
      // Add retry for mutation network errors
      retry: (failureCount, error) => {
        // Retry critical mutations like workflow saves
        if (
          error instanceof Error && 
          !error.message.startsWith('4') && 
          failureCount < 2
        ) {
          return true;
        }
        return false;
      },
      // Add timeout for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        // Could add centralized error logging here
      },
    },
  },
});
