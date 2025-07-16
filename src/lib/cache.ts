// Simple in-memory cache for diagnostic questions
// In production, consider using Redis or a more sophisticated caching solution

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTtl = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTtl): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for monitoring
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.cache.size,
      active,
      expired,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

// Singleton instance
export const cache = new SimpleCache();

// Cache key generators for consistency
export const cacheKeys = {
  diagnosticQuestions: (examType: string) => `diagnostic:questions:${examType}`,
  examData: (examType: string) => `exam:${examType}`,
  userSession: (userId: string) => `user:session:${userId}`,
} as const;

// Cleanup expired items every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
} 