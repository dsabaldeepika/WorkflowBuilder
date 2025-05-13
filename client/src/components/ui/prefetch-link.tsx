import { forwardRef, ReactNode } from 'react';
import { Link } from 'wouter';
import { usePrefetchOnHover } from '@/hooks/usePrefetchOnHover';
import { cn } from '@/lib/utils';

interface PrefetchLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  replace?: boolean;
}

/**
 * Enhanced Link component that prefetches resources when hovered
 */
export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ to, children, className, replace, ...props }, ref) => {
    const {
      handleMouseEnter,
      handleMouseLeave,
      isPrefetchingEnabled
    } = usePrefetchOnHover(to);

    return (
      <Link
        ref={ref}
        to={to}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          // We can optionally add analytics tracking here
          // e.g., trackEvent('navigation', { destination: to });
        }}
        className={cn(className)}
        replace={replace}
        {...props}
      >
        {children}
        {process.env.NODE_ENV === 'development' && isPrefetchingEnabled && (
          <span className="sr-only">
            (prefetching enabled for this link)
          </span>
        )}
      </Link>
    );
  }
);

PrefetchLink.displayName = 'PrefetchLink';