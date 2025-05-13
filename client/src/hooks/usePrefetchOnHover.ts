import { useCallback } from 'react';
import { prefetchOnHover } from '../lib/prefetch';

/**
 * Custom hook that sets up prefetching on hover for any element
 * @param route The route to prefetch on hover
 * @returns An object with event handler
 */
export function usePrefetchOnHover(route: string) {
  const handleMouseEnter = useCallback(() => {
    return prefetchOnHover(route);
  }, [route]);

  return { onMouseEnter: handleMouseEnter };
}