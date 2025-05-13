import { ReactNode, useCallback, useEffect, memo } from 'react';
import { Link, LinkProps } from 'wouter';
import { prefetchOnHover } from '../lib/prefetch';

/**
 * Custom hook that sets up element mouseover/mouseout listeners for route prefetching
 * @param route The route to prefetch on hover
 * @returns An object containing refs to attach to elements
 */
export function usePrefetchOnHover(route: string) {
  const handleMouseEnter = useCallback(() => {
    return prefetchOnHover(route);
  }, [route]);

  return { onMouseEnter: handleMouseEnter };
}

/**
 * Enhanced Link component that prefetches resources when hovered
 * Uses our resource prefetching system to load components and data ahead of navigation
 */
export const PrefetchLink = memo(({
  children,
  to,
  ...rest
}: LinkProps & { children: ReactNode }) => {
  // Set up prefetching callback
  const prefetch = useCallback(() => {
    const cleanup = prefetchOnHover(to);
    return cleanup;
  }, [to]);

  // Clean up any pending prefetch operations on unmount
  useEffect(() => {
    return () => {
      const cleanup = prefetch();
      if (cleanup) cleanup();
    };
  }, [prefetch]);
  
  return (
    <Link 
      {...rest} 
      to={to} 
      onMouseEnter={prefetch} 
      onFocus={prefetch}
    >
      {children}
    </Link>
  );
});

PrefetchLink.displayName = 'PrefetchLink';