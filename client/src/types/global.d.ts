/**
 * Custom type definitions to extend global interfaces
 */

// NetworkInformation API that's not fully supported in TypeScript yet
interface NetworkInformation {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  onchange?: EventListener;
}

// Extend Navigator to include the connection property
interface Navigator {
  connection?: NetworkInformation;
}