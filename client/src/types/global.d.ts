/**
 * Type declarations for browser APIs used in PumpFlux
 */

/**
 * NetworkInformation API provides information about the network connection
 * Used for adaptive prefetching based on network conditions
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
 */
interface NetworkInformation extends EventTarget {
  // The effective type of the connection
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  
  // Estimated downlink speed in Mbps
  downlink: number;
  
  // Estimated effective round-trip time in ms
  rtt: number;
  
  // Whether the user has requested reduced data usage
  saveData: boolean;
  
  // Event handler for connection changes
  onchange?: EventListener;
}

/**
 * Extend Navigator interface to include connection property
 */
interface Navigator {
  connection?: NetworkInformation;
}

/**
 * Performance Observer entry types
 */
interface PerformanceObserverEntryList {
  getEntries(): PerformanceEntry[];
  getEntriesByType(type: string): PerformanceEntry[];
  getEntriesByName(name: string, type?: string): PerformanceEntry[];
}

/**
 * PerformanceNavigationTiming provides timing information about navigation events
 */
interface PerformanceNavigationTiming extends PerformanceEntry {
  domComplete: number;
  domContentLoadedEventEnd: number;
  domContentLoadedEventStart: number;
  domInteractive: number;
  loadEventEnd: number;
  loadEventStart: number;
  redirectCount: number;
  type: 'navigate' | 'reload' | 'back_forward' | 'prerender';
}