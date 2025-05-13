import React, { ReactNode, useCallback } from 'react';
import { Link } from 'wouter';
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

// Simplified component that wraps Link and adds prefetching
const PrefetchLinkSimple = ({ to, children, ...props }: { 
  to: string; 
  children: ReactNode;
  [key: string]: any;
}) => {
  const handlePrefetch = useCallback(() => {
    prefetchOnHover(to);
  }, [to]);

  return (
    <Link to={to} {...props} onMouseEnter={handlePrefetch}>
      {children}
    </Link>
  );
};

// Export PrefetchLink as named export
export const PrefetchLink = PrefetchLinkSimple;