import { useState, useEffect, useCallback } from 'react';
import { getDevicePerformance, detectBrowserCapabilities } from '@/lib/utils';

interface PerformanceSettings {
  /**
   * Visual quality level (lower for better performance)
   */
  qualityLevel: 'high' | 'medium' | 'low';
  
  /**
   * Enable complex animations and effects
   */
  enableAnimations: boolean;
  
  /**
   * Use virtualization for long lists
   */
  useVirtualization: boolean;
  
  /**
   * Maximum items to render at once
   */
  maxItemsToRender: number;
  
  /**
   * Use WebGL or Canvas for rendering complex visuals
   */
  useWebGL: boolean;
  
  /**
   * Use web workers for heavy operations
   */
  useWebWorkers: boolean;
  
  /**
   * Enable image lazy loading
   */
  lazyLoadImages: boolean;
  
  /**
   * Debounce time for expensive operations
   */
  debounceTime: number;
  
  /**
   * Use intersection observer for visibility-based optimizations
   */
  useIntersectionObserver: boolean;
}

/**
 * Default performance settings based on device capability
 */
function getDefaultSettings(performanceProfile: 'high' | 'medium' | 'low', capabilities: any): PerformanceSettings {
  const defaults: Record<string, PerformanceSettings> = {
    high: {
      qualityLevel: 'high',
      enableAnimations: true,
      useVirtualization: true,
      maxItemsToRender: 100,
      useWebGL: true,
      useWebWorkers: true,
      lazyLoadImages: true,
      debounceTime: 100,
      useIntersectionObserver: true,
    },
    medium: {
      qualityLevel: 'medium',
      enableAnimations: true,
      useVirtualization: true,
      maxItemsToRender: 50,
      useWebGL: capabilities.webgl,
      useWebWorkers: true,
      lazyLoadImages: true,
      debounceTime: 150,
      useIntersectionObserver: true,
    },
    low: {
      qualityLevel: 'low',
      enableAnimations: false,
      useVirtualization: true,
      maxItemsToRender: 20,
      useWebGL: false,
      useWebWorkers: false,
      lazyLoadImages: true,
      debounceTime: 200,
      useIntersectionObserver: capabilities.intersectionObserver,
    }
  };
  
  return defaults[performanceProfile];
}

/**
 * Hook for adaptive performance optimizations
 * Automatically adjusts rendering and animation quality based on device capability
 * 
 * @returns Performance settings object
 */
export function useAdaptivePerformance(): PerformanceSettings {
  // Detect device performance profile
  const [performanceProfile, setPerformanceProfile] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Detect browser capabilities
  const [capabilities, setCapabilities] = useState<any>({
    webgl: false,
    webgl2: false,
    webWorkers: false,
    sharedWorkers: false,
    serviceWorkers: false,
    webp: false,
    intersectionObserver: false,
    resizeObserver: false,
    mutationObserver: false,
    performanceObserver: false,
  });
  
  // Settings derived from performance profile and capabilities
  const [settings, setSettings] = useState<PerformanceSettings>(
    getDefaultSettings('medium', capabilities)
  );
  
  // Measure device performance and set profile
  useEffect(() => {
    // Get initial performance estimate
    const profile = getDevicePerformance();
    setPerformanceProfile(profile);
    
    // Detect browser capabilities
    const detectedCapabilities = detectBrowserCapabilities();
    setCapabilities(detectedCapabilities);
    
    // Set initial settings
    setSettings(getDefaultSettings(profile, detectedCapabilities));
    
    // Dynamically test performance if needed for more accurate assessment
    const testPerformance = async () => {
      // Only run this test on medium profiles to determine if they should be upgraded or downgraded
      if (profile !== 'medium') return;
      
      const startTime = performance.now();
      
      // Performance test: rendering many DOM nodes
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.visibility = 'hidden';
      document.body.appendChild(testElement);
      
      for (let i = 0; i < 1000; i++) {
        const el = document.createElement('div');
        el.textContent = `Test ${i}`;
        testElement.appendChild(el);
      }
      
      // Force layout calculation
      testElement.getBoundingClientRect();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Clean up
      document.body.removeChild(testElement);
      
      // Adjust profile based on test results
      if (duration < 50) {
        setPerformanceProfile('high');
        setSettings(getDefaultSettings('high', detectedCapabilities));
      } else if (duration > 200) {
        setPerformanceProfile('low');
        setSettings(getDefaultSettings('low', detectedCapabilities));
      }
    };
    
    // Run the performance test after a delay
    const timerId = setTimeout(testPerformance, 2000);
    
    return () => clearTimeout(timerId);
  }, []);
  
  // Method to update individual settings
  const updateSetting = useCallback((key: keyof PerformanceSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Monitor runtime performance and adjust settings if needed
  useEffect(() => {
    let frameDrops = 0;
    let lastTimestamp = 0;
    let consecutiveSlowFrames = 0;
    
    // Set up frame monitoring to detect performance issues
    const checkFrameRate = (timestamp: number) => {
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
        requestAnimationFrame(checkFrameRate);
        return;
      }
      
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Normal frame time is ~16.7ms (60fps)
      // If we're seeing frames taking longer than 50ms, that's a problem
      if (delta > 50) {
        consecutiveSlowFrames++;
        frameDrops++;
        
        // If we have multiple consecutive slow frames, take action
        if (consecutiveSlowFrames >= 5) {
          // Reduce settings if we're dropping frames
          if (settings.qualityLevel === 'high') {
            updateSetting('qualityLevel', 'medium');
            updateSetting('maxItemsToRender', 50);
          } else if (settings.qualityLevel === 'medium') {
            updateSetting('qualityLevel', 'low');
            updateSetting('enableAnimations', false);
            updateSetting('maxItemsToRender', 20);
          }
          
          consecutiveSlowFrames = 0;
        }
      } else {
        consecutiveSlowFrames = 0;
      }
      
      requestAnimationFrame(checkFrameRate);
    };
    
    // Start monitoring frame rate
    const frameId = requestAnimationFrame(checkFrameRate);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [settings.qualityLevel, updateSetting]);
  
  return settings;
}