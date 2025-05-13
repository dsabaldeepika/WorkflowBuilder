import { useCallback, useEffect, useRef } from 'react';
import { prefetchOnHover } from '@/lib/prefetch';
import { useAdaptivePerformance } from './useAdaptivePerformance';

/**
 * A hook that handles resource prefetching on hover
 * 
 * This hook is used to prefetch resources (components and data)
 * when a user hovers over a link or navigation element
 * 
 * @param route The route to prefetch
 * @returns Object with event handlers for hover and leave
 */
export function usePrefetchOnHover(route: string) {
  const cleanupRef = useRef<(() => void) | undefined>();
  const { enablePrefetching } = useAdaptivePerformance();

  // Clean up any active prefetching
  const clearPrefetch = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = undefined;
    }
  }, []);

  // Cancel prefetching on unmount
  useEffect(() => clearPrefetch, [clearPrefetch]);

  // Handle mouse enter - start prefetching
  const handleMouseEnter = useCallback(() => {
    // Skip prefetching if disabled by adaptive performance
    if (!enablePrefetching) return;
    
    // Clear any existing prefetch
    clearPrefetch();
    
    // Start new prefetch and store cleanup function
    cleanupRef.current = prefetchOnHover(route);
  }, [route, clearPrefetch, enablePrefetching]);

  // Handle mouse leave - optionally cancel prefetching
  const handleMouseLeave = useCallback(() => {
    // We can choose to either cancel prefetching on mouse leave
    // or let it complete in the background
    
    // For now, we'll let it continue in the background
    // clearPrefetch();
  }, []);

  return {
    handleMouseEnter,
    handleMouseLeave,
    isPrefetchingEnabled: enablePrefetching
  };
}