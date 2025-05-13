import { queryClient } from './queryClient';
import { memoizeWithTTL } from './memoize';

// Tracking of which routes are being prefetched
const prefetchingRoutes = new Set<string>();

/**
 * Configuration for route-specific prefetching
 */
interface PrefetchConfig {
  // API endpoints to prefetch for this route
  apiEndpoints: string[];
  
  // Component code to prefetch (imported dynamically)
  componentImports: (() => Promise<unknown>)[];
  
  // Priority (higher = more important)
  priority: 'high' | 'medium' | 'low';
}

/**
 * Route prefetch configuration map
 * Add routes and their associated resources to prefetch
 * This allows for fine-grained control over what gets prefetched for each route
 */
const routePrefetchConfig: Record<string, PrefetchConfig> = {
  // Dashboard page
  '/': {
    apiEndpoints: [
      '/api/user', 
      '/api/workflows/recent',
      '/api/feature-flags',
    ],
    componentImports: [
      () => import('@/pages/dashboard-new'),
      () => import('@/components/page-header'),
      () => import('@/components/workflow/WorkflowAnimationCard'),
    ],
    priority: 'high',
  },
  
  // Performance optimization page
  '/performance': {
    apiEndpoints: [
      '/api/performance-metrics',
      '/api/feature-flags/performance',
    ],
    componentImports: [
      () => import('@/pages/performance-optimization-page'),
      () => import('@/components/performance/PerformanceMonitor'),
    ],
    priority: 'medium',
  },
  
  // Health dashboard
  '/health-dashboard': {
    apiEndpoints: [
      '/api/workflows/health',
      '/api/workflows/metrics',
      '/api/workflows/errors',
    ],
    componentImports: [
      () => import('@/pages/health-dashboard-page'),
      () => import('@/components/workflow/WorkflowHealthDashboard'),
    ],
    priority: 'medium',
  },
  
  // Workflow animations demo
  '/workflow-animations': {
    apiEndpoints: [],
    componentImports: [
      () => import('@/components/workflow/StateChangeAnimation'),
      () => import('@/components/workflow/WorkflowAnimationCard'),
    ],
    priority: 'low',
  },
  
  // Template explorer
  '/templates': {
    apiEndpoints: [
      '/api/workflow/templates',
      '/api/workflow/templates/categories',
    ],
    componentImports: [
      () => import('@/components/templates/WorkflowTemplates'),
      () => import('@/components/templates/TemplateSearch'),
    ],
    priority: 'medium',
  },
  
  // Pricing page
  '/pricing': {
    apiEndpoints: [
      '/api/subscription/plans',
    ],
    componentImports: [
      () => import('@/pages/pricing-page'),
    ],
    priority: 'low',
  },
  
  // Workflow creator
  '/create': {
    apiEndpoints: [
      '/api/node-types',
      '/api/workflows',
    ],
    componentImports: [
      () => import('@/components/workflow/WorkflowCanvas'),
      () => import('@/components/workflow/WorkflowNode'),
      () => import('@/components/workflow/ConnectionValidator'),
    ],
    priority: 'high',
  },
};

/**
 * Prefetch data for a specific API endpoint
 * Uses TanStack Query's prefetchQuery functionality
 * 
 * @param endpoint - API endpoint to prefetch
 * @returns Promise that resolves when prefetching is complete
 */
const prefetchApiData = async (endpoint: string): Promise<void> => {
  try {
    await queryClient.prefetchQuery({
      queryKey: [endpoint],
      staleTime: 30 * 1000, // 30 seconds
    });
    console.debug(`[Prefetch] Successfully prefetched API data for ${endpoint}`);
  } catch (error) {
    console.debug(`[Prefetch] Failed to prefetch API data for ${endpoint}`, error);
  }
};

/**
 * Prefetch a component by importing it dynamically
 * This leverages code splitting and webpack's dynamic imports
 * 
 * @param importFn - Dynamic import function for the component
 * @returns Promise that resolves when the import is complete
 */
const prefetchComponent = async (importFn: () => Promise<unknown>): Promise<void> => {
  try {
    await importFn();
    console.debug('[Prefetch] Successfully prefetched component');
  } catch (error) {
    console.debug('[Prefetch] Failed to prefetch component', error);
  }
};

/**
 * Memoized function to get route configuration with TTL cache
 * This prevents unnecessary work when the same route is requested multiple times
 */
const getRoutePrefetchConfig = memoizeWithTTL(
  (route: string): PrefetchConfig | undefined => {
    // Exact match
    if (routePrefetchConfig[route]) {
      return routePrefetchConfig[route];
    }
    
    // Pattern matching for dynamic routes (basic implementation)
    // This could be expanded to handle more complex route patterns
    for (const [pattern, config] of Object.entries(routePrefetchConfig)) {
      if (pattern.includes(':') && route.startsWith(pattern.split(':')[0])) {
        return config;
      }
    }
    
    return undefined;
  },
  { ttl: 60 * 1000 } // Cache for 1 minute
);

/**
 * Prefetch resources for a given route on hover
 * This is the main function that will be called by the usePrefetchOnHover hook
 * 
 * @param route - Route to prefetch resources for
 * @returns Cleanup function to cancel prefetching
 */
export function prefetchOnHover(route: string): () => void {
  // Skip if already prefetching this route
  if (prefetchingRoutes.has(route)) {
    return () => {}; // No-op cleanup function
  }
  
  // Mark route as being prefetched
  prefetchingRoutes.add(route);
  
  // Get prefetch configuration for this route
  const config = getRoutePrefetchConfig(route);
  
  if (!config) {
    console.debug(`[Prefetch] No prefetch configuration for route: ${route}`);
    prefetchingRoutes.delete(route);
    return () => {};
  }
  
  console.debug(`[Prefetch] Starting prefetch for route: ${route}`);
  
  // Track all pending prefetch operations
  const pendingOperations: Promise<void>[] = [];
  
  // Prefetch API data
  for (const endpoint of config.apiEndpoints) {
    pendingOperations.push(prefetchApiData(endpoint));
  }
  
  // Prefetch components
  for (const importFn of config.componentImports) {
    pendingOperations.push(prefetchComponent(importFn));
  }
  
  // Create a promise that resolves when all prefetching is complete
  const prefetchPromise = Promise.all(pendingOperations)
    .then(() => {
      console.debug(`[Prefetch] Completed prefetching for route: ${route}`);
      prefetchingRoutes.delete(route);
    })
    .catch(() => {
      console.debug(`[Prefetch] Error during prefetching for route: ${route}`);
      prefetchingRoutes.delete(route);
    });
  
  // Return a cleanup function that can be called to cancel prefetching
  return () => {
    if (prefetchingRoutes.has(route)) {
      console.debug(`[Prefetch] Canceled prefetching for route: ${route}`);
      prefetchingRoutes.delete(route);
    }
  };
}