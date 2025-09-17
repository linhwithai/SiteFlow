/**
 * Development Helper Utilities
 * Provides debugging and cache management tools for development
 */

// Cache management utilities
export const cacheUtils = {
  // Get cache statistics
  getStats: () => {
    if (typeof window === 'undefined') return null;
    
    const cache = (window as any).__requestCache;
    if (!cache) return null;
    
    return {
      size: cache.size,
      entries: Array.from(cache.entries()).map(([key, value]: [string, any]) => ({
        key,
        timestamp: new Date(value.timestamp).toISOString(),
        ttl: value.ttl,
        age: Date.now() - value.timestamp,
        isExpired: (Date.now() - value.timestamp) > value.ttl,
      })),
    };
  },
  
  // Clear all caches
  clearAll: () => {
    if (typeof window === 'undefined') return;
    
    // Clear request cache
    if ((window as any).clearCache) {
      (window as any).clearCache();
    }
    
    // Clear browser caches
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('🧹 All caches cleared');
  },
  
  // Clear specific cache entry
  clearEntry: (url: string) => {
    if (typeof window === 'undefined') return;
    
    const cache = (window as any).__requestCache;
    if (cache && cache.has(url)) {
      cache.delete(url);
      console.log(`🧹 Cache entry cleared: ${url}`);
    }
  },
  
  // Force refresh all data
  forceRefresh: () => {
    if (typeof window === 'undefined') return;
    
    // Clear caches
    cacheUtils.clearAll();
    
    // Reload page
    window.location.reload();
  },
};

// Performance monitoring utilities
export const performanceUtils = {
  // Measure API call performance
  measureApiCall: async (url: string, fetchFn: () => Promise<any>) => {
    const startTime = performance.now();
    try {
      const result = await fetchFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`⏱️ API Call: ${url} - ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`❌ API Error: ${url} - ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },
  
  // Monitor component render performance
  measureRender: (componentName: string, renderFn: () => void) => {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`🎨 Render: ${componentName} - ${duration.toFixed(2)}ms`);
  },
};

// Development environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Debug logging utilities
export const debugLog = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`ℹ️ ${message}`, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, data);
    }
  },
  
  error: (message: string, data?: any) => {
    if (isDevelopment) {
      console.error(`❌ ${message}`, data);
    }
  },
  
  success: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, data);
    }
  },
};

// Cache configuration for different environments
export const cacheConfig = {
  development: {
    ttl: 5000, // 5 seconds
    maxSize: 50,
    enableDebug: true,
  },
  production: {
    ttl: 30000, // 30 seconds
    maxSize: 100,
    enableDebug: false,
  },
};

// Get current cache configuration
export const getCacheConfig = () => {
  return isDevelopment ? cacheConfig.development : cacheConfig.production;
};

// Development shortcuts for browser console
if (typeof window !== 'undefined' && isDevelopment) {
  // Make utilities available globally in development
  (window as any).cacheUtils = cacheUtils;
  (window as any).performanceUtils = performanceUtils;
  (window as any).debugLog = debugLog;
  
  // Add helpful console commands
  console.log(`
🚀 Development Helpers Available:
- cacheUtils.getStats() - Get cache statistics
- cacheUtils.clearAll() - Clear all caches
- cacheUtils.forceRefresh() - Force refresh all data
- performanceUtils.measureApiCall() - Measure API performance
- debugLog.info/warn/error/success() - Debug logging
  `);
}

