/**
 * Caching System for ERP API
 * 
 * This module provides caching functionality to improve performance
 * and reduce database load
 */

import { logger } from './Logger';

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  keyPrefix?: string; // Key prefix for namespacing
}

interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

// In-memory cache store (in production, use Redis)
const cacheStore = new Map<string, CacheEntry>();

// Default configurations for different data types
export const CACHE_CONFIGS = {
  // User data
  USER: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    keyPrefix: 'user',
  },
  
  // Organization data
  ORGANIZATION: {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 100,
    keyPrefix: 'org',
  },
  
  // Project data
  PROJECT: {
    ttl: 2 * 60 * 1000, // 2 minutes
    maxSize: 5000,
    keyPrefix: 'project',
  },
  
  // Financial data (shorter TTL for accuracy)
  FINANCIAL: {
    ttl: 1 * 60 * 1000, // 1 minute
    maxSize: 2000,
    keyPrefix: 'financial',
  },
  
  // Reports (longer TTL as they're expensive to generate)
  REPORTS: {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 100,
    keyPrefix: 'report',
  },
  
  // Static data (longer TTL)
  STATIC: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxSize: 500,
    keyPrefix: 'static',
  },
} as const;

export class CacheManager {
  private config: CacheConfig;
  private store: Map<string, CacheEntry>;

  constructor(config: CacheConfig) {
    this.config = config;
    this.store = cacheStore;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const entry = this.store.get(fullKey);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.store.delete(fullKey);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    logger.debug('Cache hit', {
      key: fullKey,
      accessCount: entry.accessCount,
      age: Date.now() - entry.createdAt,
    });

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, customTtl?: number): Promise<void> {
    const fullKey = this.getFullKey(key);
    const ttl = customTtl || this.config.ttl;
    const now = Date.now();

    // Check size limit
    if (this.config.maxSize && this.store.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: now + ttl,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now,
    };

    this.store.set(fullKey, entry);

    logger.debug('Cache set', {
      key: fullKey,
      ttl,
      size: this.store.size,
    });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    const deleted = this.store.delete(fullKey);

    if (deleted) {
      logger.debug('Cache deleted', { key: fullKey });
    }

    return deleted;
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    const entry = this.store.get(fullKey);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.store.delete(fullKey);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.store.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    totalAccesses: number;
    expiredEntries: number;
  } {
    const now = Date.now();
    let totalAccesses = 0;
    let expiredEntries = 0;

    for (const entry of this.store.values()) {
      totalAccesses += entry.accessCount;
      if (entry.expiresAt < now) {
        expiredEntries++;
      }
    }

    const hitRate = totalAccesses > 0 ? totalAccesses / (totalAccesses + this.store.size) : 0;

    return {
      size: this.store.size,
      hitRate,
      totalAccesses,
      expiredEntries,
    };
  }

  /**
   * Get full cache key with prefix
   */
  private getFullKey(key: string): string {
    return this.config.keyPrefix ? `${this.config.keyPrefix}:${key}` : key;
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.store.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    
    for (let i = 0; i < toRemove; i++) {
      if (entries[i]) {
        if (entries[i]) {
          this.store.delete(entries[i][0]);
        }
      }
    }

    logger.debug('Evicted LRU entries', { count: toRemove });
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.store.delete(key));

    if (expiredKeys.length > 0) {
      logger.debug('Cleaned up expired cache entries', {
        count: expiredKeys.length,
      });
    }
  }
}

// Factory function to create cache managers for different data types
export function createCacheManager(type: keyof typeof CACHE_CONFIGS): CacheManager {
  const config = CACHE_CONFIGS[type];
  return new CacheManager(config);
}

// Global cache managers
export const userCache = createCacheManager('USER');
export const organizationCache = createCacheManager('ORGANIZATION');
export const projectCache = createCacheManager('PROJECT');
export const financialCache = createCacheManager('FINANCIAL');
export const reportsCache = createCacheManager('REPORTS');
export const staticCache = createCacheManager('STATIC');

// Cache decorator for functions
export function cached<T extends (...args: any[]) => Promise<any>>(
  cacheManager: CacheManager,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const key = keyGenerator(...args);
      
      // Try to get from cache
      const cached = await cacheManager.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);
      
      // Store in cache
      await cacheManager.set(key, result, ttl);
      
      return result;
    };
  };
}

// Cache invalidation helpers
export class CacheInvalidator {
  /**
   * Invalidate cache by pattern
   */
  static async invalidatePattern(pattern: string): Promise<number> {
    let count = 0;
    const regex = new RegExp(pattern);

    for (const key of cacheStore.keys()) {
      if (regex.test(key)) {
        cacheStore.delete(key);
        count++;
      }
    }

    logger.info('Cache invalidated by pattern', { pattern, count });
    return count;
  }

  /**
   * Invalidate cache for specific organization
   */
  static async invalidateOrganization(orgId: string): Promise<number> {
    return this.invalidatePattern(`org:${orgId}:*`);
  }

  /**
   * Invalidate cache for specific project
   */
  static async invalidateProject(projectId: number): Promise<number> {
    return this.invalidatePattern(`project:${projectId}:*`);
  }

  /**
   * Invalidate cache for specific user
   */
  static async invalidateUser(userId: string): Promise<number> {
    return this.invalidatePattern(`user:${userId}:*`);
  }
}

// Periodic cleanup
setInterval(() => {
  userCache.cleanup();
  organizationCache.cleanup();
  projectCache.cleanup();
  financialCache.cleanup();
  reportsCache.cleanup();
  staticCache.cleanup();
}, 5 * 60 * 1000); // Clean up every 5 minutes
