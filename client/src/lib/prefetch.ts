import { queryClient } from './queryClient';

/**
 * Prefetch API data for route transitions to improve perceived performance
 * @param queryKeys Array of query keys to prefetch
 */
export const prefetchRouteData = async (queryKeys: string[]) => {
  try {
    await Promise.allSettled(
      queryKeys.map(key => 
        queryClient.prefetchQuery({
          queryKey: [key],
          staleTime: 2 * 60 * 1000, // 2 minutes
        })
      )
    );
  } catch (error) {
    console.warn('Prefetch error:', error);
    // Fail silently - prefetching is just an optimization
  }
};

/**
 * Preload components and their data for specific routes
 * @param routes Array of routes to preload
 */
export const preloadRoutes = async (routes: string[]) => {
  // Map of routes to their components and data dependencies
  const routeModules: Record<string, {
    component: () => Promise<any>;
    data?: string[];
  }> = {
    '/': {
      component: () => import('../pages/dashboard-new'),
      data: ['/api/workflows', '/api/feature-flags'],
    },
    '/templates': {
      component: () => import('../pages/templates-page'),
      data: ['/api/workflow/templates'],
    },
    '/workflow-builder': {
      component: () => import('../pages/workflow-builder'),
      data: ['/api/node-types']
    },
    '/health-dashboard': {
      component: () => import('../pages/health-dashboard-page'),
      data: ['/api/workflows/stats', '/api/workflows/health']
    },
    '/monitoring': {
      component: () => import('../pages/workflow-monitoring'),
      data: ['/api/workflows']
    },
    '/pricing': {
      component: () => import('../pages/pricing-page'),
      data: ['/api/subscription/plans']
    },
    '/performance': {
      component: () => import('../pages/performance-optimization-page'),
      data: []
    },
  };

  try {
    // Process each route
    for (const route of routes) {
      const routeConfig = routeModules[route];
      if (routeConfig) {
        // Start loading the component in parallel
        const componentPromise = routeConfig.component();
        
        // Fetch data if available
        if (routeConfig.data && routeConfig.data.length > 0) {
          await prefetchRouteData(routeConfig.data);
        }
        
        // Wait for component to load
        await componentPromise;
      }
    }
  } catch (error) {
    console.warn('Route preloading error:', error);
    // Fail silently - preloading is an optimization
  }
};

/**
 * Intelligent prefetching based on user navigation patterns
 * Call this function when a user hovers over navigation items
 * @param route The route being hovered
 */
export const prefetchOnHover = (route: string) => {
  // Don't prefetch if the device might be on a limited data plan
  // Skip prefetching on slow connections to save data
  if (navigator.connection && 
      ['slow-2g', '2g'].includes(navigator.connection.effectiveType)) {
    return;
  }
  
  // Start preloading with a slight delay to avoid unnecessary loads
  const timerId = setTimeout(() => {
    preloadRoutes([route]);
  }, 100);
  
  // Return a cleanup function to cancel prefetch if hover was brief
  return () => clearTimeout(timerId);
};