import { useState, useEffect, useRef, useCallback } from 'react';
import { createVirtualListConfig } from '@/lib/utils';
import { debounce } from '@/lib/utils';

interface VirtualListOptions {
  /**
   * Total number of items in the list
   */
  itemCount: number;
  /**
   * Height of each item in pixels
   */
  itemHeight: number;
  /**
   * Container height in pixels
   */
  containerHeight: number;
  /**
   * Number of items to render beyond visible area (default: 5)
   */
  overscan?: number;
}

interface VirtualListResult<T> {
  /**
   * Ref to attach to the scrollable container
   */
  containerRef: React.RefObject<HTMLDivElement>;
  /**
   * Items to render based on current scroll position
   */
  virtualItems: {
    index: number;
    start: number;
    item: T;
  }[];
  /**
   * Total height of the virtual list
   */
  totalHeight: number;
}

/**
 * Hook for implementing virtualized lists with high performance
 * Only renders items that are visible in the viewport
 * 
 * @param items Array of items to virtualize
 * @param options Configuration options
 * @returns Virtual list state and container ref
 */
export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
): VirtualListResult<T> {
  const { itemCount, itemHeight, containerHeight, overscan = 5 } = options;
  
  // Create ref for the scrollable container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate visible range based on container height
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
  
  // State for tracking scroll position
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate total height of all items
  const totalHeight = itemCount * itemHeight;
  
  // Calculate start and end indices based on scroll position
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  // Create virtual items array with positioning info
  const virtualItems = items
    .slice(startIndex, endIndex + 1)
    .map((item, index) => ({
      index: startIndex + index,
      start: (startIndex + index) * itemHeight,
      item,
    }));
  
  // Handle scroll events with debouncing for better performance
  const handleScroll = useCallback(
    debounce(() => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    }, 10),
    []
  );
  
  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
  
  return {
    containerRef,
    virtualItems,
    totalHeight,
  };
}

/**
 * Component for rendering virtualized lists with automatic height management
 */
export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
}) {
  const { containerRef, virtualItems, totalHeight } = useVirtualList(items, {
    itemCount: items.length,
    itemHeight,
    containerHeight,
    overscan,
  });
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto relative ${className || ''}`}
      style={{ height: containerHeight }}
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: totalHeight }} className="relative w-full">
        {virtualItems.map(({ index, start, item }) => (
          <div
            key={index}
            className="absolute w-full"
            style={{
              top: start,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}