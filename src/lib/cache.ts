// Simple in-memory cache for diagnostic questions
// In production, consider using Redis or a more sophisticated caching solution

interface CacheItem<T = unknown> {
  value: T;
  expiry: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem>();

  set<T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
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
      if (now > item.expiry) {
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
      if (now > item.expiry) {
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