/**
 * Intelligent prefetching system for PumpFlux
 * 
 * This module provides functions for prefetching resources based on user behavior 
 * to improve perceived performance. It includes:
 * 
 * 1. Route-based prefetching
 * 2. Data prefetching for React Query
 * 3. Adaptive prefetching based on network conditions
 */

import { queryClient } from './queryClient';

// Map of routes to their associated API endpoints
const ROUTE_DATA_MAP: Record<string, string[]> = {
  '/templates': ['/api/workflow/templates'],
  '/workflow-builder': ['/api/node-types', '/api/integrations'],
  '/health-dashboard': ['/api/workflow/health/summary', '/api/workflow/executions/recent'],
  '/workflow-templates': ['/api/workflow/templates/featured'],
  '/performance': ['/api/performance/metrics'],
  '/workflow-animations': []
};

// For now, we're not using actual dynamic imports since 
// we don't know the actual paths to these components
// Instead, we're just defining the routes for data prefetching
const ROUTE_COMPONENT_MAP: Record<string, (() => Promise<any>) | null> = {
  '/templates': null,
  '/workflow-builder': null,
  '/health-dashboard': null,
  '/performance': null,
  '/workflow-animations': null
};

/**
 * Check if we should prefetch resources based on network conditions
 * Avoids prefetching on slow connections to preserve bandwidth
 */
function shouldPrefetch(): boolean {
  // Access navigator.connection API if available (see types/global.d.ts)
  if (navigator.connection) {
    // Don't prefetch on slow connections or when save-data is enabled
    if (
      navigator.connection.saveData ||
      navigator.connection.effectiveType === 'slow-2g' ||
      navigator.connection.effectiveType === '2g'
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Prefetch API data for route transitions to improve perceived performance
 * @param queryKeys Array of query keys to prefetch
 */
export const prefetchRouteData = async (queryKeys: string[]): Promise<void> => {
  if (!shouldPrefetch()) return;

  // Prefetch each API endpoint in parallel
  await Promise.allSettled(
    queryKeys.map(key => {
      return queryClient.prefetchQuery({
        queryKey: [key],
        staleTime: 30 * 1000 // 30 seconds
      });
    })
  );
};

/**
 * Preload components and their data for specific routes
 * @param routes Array of routes to preload
 */
export const preloadRoutes = async (routes: string[]): Promise<void> => {
  if (!shouldPrefetch()) return;

  // For each route, preload both component and data in parallel
  await Promise.allSettled(
    routes.flatMap(route => {
      const promises = [];
      
      // Prefetch component if available
      const componentLoader = ROUTE_COMPONENT_MAP[route];
      if (componentLoader) {
        promises.push(componentLoader());
      }
      
      // Prefetch associated data
      promises.push(prefetchRouteData(ROUTE_DATA_MAP[route] || []));
      
      return promises;
    })
  );
};

/**
 * Intelligent prefetching based on user navigation patterns
 * Call this function when a user hovers over navigation items
 * @param route The route being hovered
 * @returns A cleanup function to cancel prefetching if needed
 */
export const prefetchOnHover = (route: string): (() => void) | undefined => {
  if (!shouldPrefetch() || !route) return undefined;

  // Get data endpoints for this route
  const dataEndpoints = ROUTE_DATA_MAP[route] || [];

  // Get component loader for this route
  const componentLoader = ROUTE_COMPONENT_MAP[route];
  
  // Start prefetching component if available
  if (componentLoader) {
    componentLoader();
  }
  
  // Start prefetching data
  prefetchRouteData(dataEndpoints);

  // Return a cleanup function that can abort prefetching if needed
  return () => {
    // Could implement abort logic here if needed
    console.debug(`Prefetch canceled for ${route}`);
  };
};