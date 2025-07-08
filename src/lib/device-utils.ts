/**
 * Device detection and performance utilities
 * Separated for better testability and caching
 */

// Extend Navigator interface to include connection and deviceMemory properties
interface NavigatorConnection {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
}

interface ExtendedNavigator extends Navigator {
  connection?: NavigatorConnection;
  deviceMemory?: number;
}

// Cache detection results to avoid repeated calculations
let deviceCache: {
  isLowEnd?: boolean;
  isMobile?: boolean;
} = {};

/**
 * Detects if the current device is likely low-end based on hardware specs
 * Results are cached for performance
 */
export const isLowEndDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  if (deviceCache.isLowEnd !== undefined) {
    return deviceCache.isLowEnd;
  }

  try {
    // Safe property access with proper typing
    const extendedNavigator = navigator as ExtendedNavigator;
    const connection = extendedNavigator.connection;
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 4;
    const deviceMemory = extendedNavigator.deviceMemory ?? 4;
    
    const isLowEnd = (
      // Low core count (likely low-end mobile)
      hardwareConcurrency <= 2 ||
      // Low memory
      deviceMemory <= 2 ||
      // Slow connection (if supported)
      (connection && connection.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) ||
      // Legacy mobile patterns
      /Android\s*[4-5]\.|Windows\s*Phone/i.test(navigator.userAgent)
    );

    deviceCache.isLowEnd = isLowEnd;
    return isLowEnd;
  } catch {
    // Safe fallback
    deviceCache.isLowEnd = false;
    return false;
  }
};

/**
 * Detects if the current device is mobile
 * Results are cached for performance
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  if (deviceCache.isMobile !== undefined) {
    return deviceCache.isMobile;
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera\s*Mini/i.test(
    navigator.userAgent
  );

  deviceCache.isMobile = isMobile;
  return isMobile;
};

/**
 * Checks if user prefers reduced motion
 * Note: Not cached as this preference can change during session
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  } catch {
    return false;
  }
};

/**
 * Clears the device detection cache
 * Useful for testing or when device capabilities change
 */
export const clearDeviceCache = (): void => {
  deviceCache = {};
};

/**
 * Gets device performance level for optimization decisions
 */
export const getDevicePerformanceLevel = (): 'high' | 'medium' | 'low' => {
  if (typeof window === 'undefined') return 'medium';

  const isLowEnd = isLowEndDevice();
  const isMobile = isMobileDevice();

  if (isLowEnd) return 'low';
  if (isMobile) return 'medium';
  return 'high';
}; 