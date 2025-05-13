import { ReactNode, useCallback } from 'react';
import { Link } from 'wouter';
import { prefetchOnHover } from '../../lib/prefetch';

interface PrefetchLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  replace?: boolean;
}

/**
 * Enhanced Link component that prefetches resources when hovered
 */
export function PrefetchLink({
  children,
  to,
  ...rest
}: PrefetchLinkProps) {
  const handlePrefetch = useCallback(() => {
    prefetchOnHover(to);
  }, [to]);
  
  return (
    <Link 
      to={to} 
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      {...rest} 
    >
      {children}
    </Link>
  );
}