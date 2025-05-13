import { useState, useEffect } from 'react';

/**
 * Device capability levels for adaptive rendering
 */
export type DeviceCapabilityLevel = 'low' | 'medium' | 'high';

/**
 * Result of the useAdaptivePerformance hook
 */
export interface AdaptivePerformanceResult {
  // Overall capability level of the device
  deviceCapabilityLevel: DeviceCapabilityLevel;
  
  // Whether animations should be enabled
  enableAnimations: boolean;
  
  // Whether high-quality visuals should be enabled
  enableHighQualityVisuals: boolean;
  
  // Whether virtualization should be used for long lists
  useVirtualization: boolean;
  
  // Maximum nodes to render without virtualization
  maxNodesWithoutVirtualization: number;
  
  // Whether to prefetch resources
  enablePrefetching: boolean;
  
  // Network connection type if available
  connectionType?: 'slow-2g' | '2g' | '3g' | '4g';
  
  // Whether data saving mode is active
  dataSavingActive: boolean;
}

/**
 * Hook that detects device capabilities and network conditions
 * to provide adaptive performance settings
 * 
 * @returns Performance settings to optimize the user experience
 */
export function useAdaptivePerformance(): AdaptivePerformanceResult {
  const [deviceCapabilityLevel, setDeviceCapabilityLevel] = useState<DeviceCapabilityLevel>('medium');
  const [connectionData, setConnectionData] = useState<{
    type?: 'slow-2g' | '2g' | '3g' | '4g';
    saveData: boolean;
  }>({ saveData: false });

  useEffect(() => {
    // Check hardware capabilities
    const checkHardwareCapabilities = () => {
      const memory = (navigator as any).deviceMemory;
      const cores = navigator.hardwareConcurrency || 2;
      
      // Determine device capability based on hardware
      if ((memory && memory <= 2) || cores <= 2) {
        return 'low';
      } else if ((memory && memory <= 4) || cores <= 4) {
        return 'medium';
      } else {
        return 'high';
      }
    };

    // Check network capabilities
    const checkNetworkCapabilities = () => {
      if (navigator.connection) {
        const connection = navigator.connection;
        return {
          type: connection.effectiveType as 'slow-2g' | '2g' | '3g' | '4g',
          saveData: connection.saveData
        };
      }
      return { saveData: false };
    };

    // Set initial detection results
    setDeviceCapabilityLevel(checkHardwareCapabilities());
    setConnectionData(checkNetworkCapabilities());

    // Listen for connection changes if the API is available
    if (navigator.connection) {
      const handleConnectionChange = () => {
        setConnectionData(checkNetworkCapabilities());
      };
      
      // Different browsers implement the connection API differently
      // Some use addEventListener, some use the onchange property
      if (typeof navigator.connection.addEventListener === 'function') {
        navigator.connection.addEventListener('change', handleConnectionChange);
        
        return () => {
          if (navigator.connection && typeof navigator.connection.removeEventListener === 'function') {
            navigator.connection.removeEventListener('change', handleConnectionChange);
          }
        };
      } else {
        // Fallback to onchange property
        // Using a more type-safe approach
        const conn = navigator.connection as any;
        if (conn) {
          conn.onchange = handleConnectionChange;
        }
        
        return () => {
          if (navigator.connection) {
            // Use type assertion for compatibility
            const conn = navigator.connection as any;
            if (conn) {
              conn.onchange = null;
            }
          }
        };
      }
    }
  }, []);

  // Derive performance settings from device capability and network
  return {
    deviceCapabilityLevel,
    enableAnimations: deviceCapabilityLevel !== 'low',
    enableHighQualityVisuals: deviceCapabilityLevel === 'high',
    useVirtualization: deviceCapabilityLevel === 'low' || deviceCapabilityLevel === 'medium',
    maxNodesWithoutVirtualization: 
      deviceCapabilityLevel === 'low' ? 50 : 
      deviceCapabilityLevel === 'medium' ? 200 : 
      500,
    enablePrefetching: 
      deviceCapabilityLevel !== 'low' && 
      connectionData.type !== 'slow-2g' && 
      connectionData.type !== '2g' &&
      !connectionData.saveData,
    connectionType: connectionData.type,
    dataSavingActive: connectionData.saveData
  };
}