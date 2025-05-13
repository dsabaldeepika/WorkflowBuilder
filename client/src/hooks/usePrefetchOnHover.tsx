import { useCallback } from 'react';
import { prefetchOnHover } from '@/lib/prefetch';

/**
 * Hook for efficient prefetching of route data on hover
 * 
 * @param route The route to prefetch when hovered
 * @returns Object with onMouseEnter and onMouseLeave handlers
 */
export function usePrefetchOnHover(route: string) {
  // Create stable reference to cleanup function
  let cleanupFunction: (() => void) | undefined;
  
  // Create memoized handlers
  const handleMouseEnter = useCallback(() => {
    cleanupFunction = prefetchOnHover(route);
  }, [route]);
  
  const handleMouseLeave = useCallback(() => {
    if (cleanupFunction) {
      cleanupFunction();
      cleanupFunction = undefined;
    }
  }, []);
  
  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
}

/**
 * Component wrapper to add prefetching behavior to navigation elements
 */
export function PrefetchLink({
  to,
  children,
  className,
  activeClassName,
  ...props
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  [key: string]: any;
}) {
  const prefetchHandlers = usePrefetchOnHover(to);
  
  return (
    <a
      href={to}
      className={className}
      {...prefetchHandlers}
      {...props}
    >
      {children}
    </a>
  );
}