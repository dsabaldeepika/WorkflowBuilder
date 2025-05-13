import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 * Efficiently merges and deduplicated Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param func Function to debounce
 * @param wait Milliseconds to wait
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per threshold
 * @param func Function to throttle
 * @param threshold Milliseconds to wait between invocations
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  threshold: number = 250
): (...args: Parameters<T>) => void {
  let last: number = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    const now = Date.now();
    
    if (last && now < last + threshold) {
      // Reset the timer
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        last = now;
        func.apply(context, args);
      }, threshold);
    } else {
      last = now;
      func.apply(context, args);
    }
  };
}

/**
 * Shallow comparison of objects to avoid unnecessary rerenders
 * @param objA First object
 * @param objB Second object
 * @returns True if objects are shallow equal
 */
export function shallowEqual<T extends Record<string, any>>(
  objA: T,
  objB: T
): boolean {
  if (objA === objB) return true;
  
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) return false;
  
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      objA[keysA[i]] !== objB[keysA[i]]
    ) {
      return false;
    }
  }
  
  return true;
}

/**
 * Detect if the device is a mobile device based on screen size and touch capability
 * @returns True if the device is likely a mobile device
 */
export function isMobileDevice(): boolean {
  const ua = navigator.userAgent;
  
  // Check for common mobile user agents
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
    return true;
  }
  
  // Check screen size
  if (window.innerWidth <= 768) {
    return true;
  }
  
  // Check for touch capability
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Creates a unique ID for element identification
 * @returns Unique ID string
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Formats a number with commas as thousands separators
 * @param num Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Detect browser support for performance-intensive features
 * @returns Object with feature support flags
 */
export function detectBrowserCapabilities() {
  return {
    webgl: !!window.WebGLRenderingContext,
    webgl2: !!window.WebGL2RenderingContext,
    webWorkers: !!window.Worker,
    sharedWorkers: !!window.SharedWorker,
    serviceWorkers: 'serviceWorker' in navigator,
    webp: (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0),
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    mutationObserver: 'MutationObserver' in window,
    performanceObserver: 'PerformanceObserver' in window,
  };
}

/**
 * Get the device performance profile to adapt rendering quality
 * @returns Device performance category (high, medium, low)
 */
export function getDevicePerformance(): 'high' | 'medium' | 'low' {
  // Use hardwareConcurrency as a rough estimate of device capability
  const cores = navigator.hardwareConcurrency || 1;
  
  // Use deviceMemory as available
  const memory = (navigator as any).deviceMemory || 4;
  
  if (cores >= 8 && memory >= 8) return 'high';
  if (cores >= 4 && memory >= 4) return 'medium';
  return 'low';
}

/**
 * Safely parse JSON with error handling
 * @param text Text to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn('Error parsing JSON:', e);
    return fallback;
  }
}

/**
 * Chunk an array into smaller arrays of specified size
 * @param array Array to chunk
 * @param size Chunk size
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Creates a virtual list configuration for rendering large lists efficiently
 * @param totalItems Total number of items
 * @param itemHeight Height of each item
 * @param visibleItems Number of items visible at once
 * @returns Configuration for virtual list rendering
 */
export function createVirtualListConfig(
  totalItems: number,
  itemHeight: number,
  visibleItems: number
) {
  // Calculate total height
  const totalHeight = totalItems * itemHeight;
  
  // Calculate overscan (extra items rendered outside viewport)
  const overscan = Math.ceil(visibleItems / 2);
  
  return {
    totalHeight,
    getVisibleRange: (scrollTop: number) => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        totalItems - 1,
        Math.ceil((scrollTop + visibleItems * itemHeight) / itemHeight) + overscan
      );
      
      return {
        startIndex,
        endIndex,
        items: endIndex - startIndex + 1,
        offsetY: startIndex * itemHeight,
      };
    }
  };
}
