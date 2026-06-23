/**
 * Simple in-memory rate limiter.
 *
 * Tracks request counts per key within a rolling window.
 * State is per-isolate, so this is suitable for basic throttling,
 * not for distributed rate limiting across many worker instances.
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });
 *   if (limiter.check("login:admin:1.2.3.4")) {
 *     return NextResponse.json({ error: "too many requests" }, { status: 429 });
 *   }
 */

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

interface Entry {
  count: number;
  resetAt: number;
}

export function createRateLimiter({ maxRequests, windowMs }: RateLimiterOptions) {
  const store = new Map<string, Entry>();

  // Periodically clean up expired entries to prevent memory leaks
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  };

  // Clean up every 60 seconds
  const interval = setInterval(cleanup, 60_000);
  // Allow the timer to not block process exit
  if (interval.unref) interval.unref();

  return {
    /**
     * Check if the request should be rate-limited.
     * Returns true if the limit is exceeded (caller should return 429).
     */
    check(key: string): boolean {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now >= entry.resetAt) {
        // New window
        store.set(key, { count: 1, resetAt: now + windowMs });
        return false;
      }

      entry.count++;
      if (entry.count > maxRequests) {
        return true; // Rate limited
      }

      return false;
    },

    /**
     * Get the remaining requests in the current window for a key.
     */
    remaining(key: string): number {
      const now = Date.now();
      const entry = store.get(key);
      if (!entry || now >= entry.resetAt) return maxRequests;
      return Math.max(0, maxRequests - entry.count);
    },

    /** Clean up all state */
    dispose() {
      clearInterval(interval);
      store.clear();
    },
  };
}
