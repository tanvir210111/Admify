/**
 * Rate Limiter Subsystem with Pluggable Storage Abstraction
 *
 * Architecture:
 * - Storage Abstraction: Standard interface (increment, get, reset, cleanup)
 * - Default Store: MemoryRateLimitStore (In-memory sliding window, zero external dependencies)
 * - Multi-Instance Readiness: Can be seamlessly swapped with a RedisRateLimitStore
 *   implementing the same interface when deploying to multi-server clusters.
 * - Client Identification: Sanitized IP extraction with x-forwarded-for handling.
 * - Scope: Applied exclusively to public visitor endpoints (e.g. /api/chat/*).
 *   Internal authenticated messaging (/api/conversations/*) is completely exempt.
 */

export class MemoryRateLimitStore {
  constructor({ cleanupIntervalMs = 5 * 60 * 1000 } = {}) {
    this.hits = new Map(); // Map<key, { count, resetTime }>
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
    // Unref interval so it doesn't prevent Node.js tests or processes from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  async increment(key, windowMs) {
    const now = Date.now();
    let record = this.hits.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      this.hits.set(key, record);
      return { count: 1, resetTime: record.resetTime, allowed: true };
    }

    record.count += 1;
    this.hits.set(key, record);
    return { count: record.count, resetTime: record.resetTime, allowed: true };
  }

  async get(key) {
    const record = this.hits.get(key);
    if (!record || Date.now() > record.resetTime) return null;
    return record;
  }

  async reset(key) {
    if (key) {
      this.hits.delete(key);
    } else {
      this.hits.clear();
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      if (now > record.resetTime) {
        this.hits.delete(key);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Extracts and sanitizes the client IP from request headers and socket information.
 */
export function extractClientIp(req) {
  if (!req) return '127.0.0.1';

  // Check x-forwarded-for header (first IP in chain is client IP)
  const forwarded = req.headers && (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']);
  if (forwarded && typeof forwarded === 'string') {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) {
      return firstIp.replace(/^::ffff:/, '');
    }
  }

  const socketAddr = req.socket?.remoteAddress || req.connection?.remoteAddress;
  if (socketAddr && typeof socketAddr === 'string') {
    return socketAddr.replace(/^::ffff:/, '');
  }

  return '127.0.0.1';
}

/**
 * Rate Limiter Middleware Factory
 */
export function createRateLimiter({
  windowMs = 60 * 1000, // 1 minute
  max = 25, // 25 requests per window
  message = 'Too many requests. Please wait a moment before sending another message.',
  store = new MemoryRateLimitStore(),
  keyGenerator = extractClientIp,
} = {}) {
  const middleware = async (req, res, next) => {
    try {
      const key = keyGenerator(req);
      const record = await store.increment(key, windowMs);

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      if (record.count > max) {
        return res.status(429).json({
          success: false,
          message,
          retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000),
        });
      }

      next();
    } catch (err) {
      // In case of rate limiter store failure, fail open to avoid dropping legitimate user traffic
      console.warn('[RateLimiter Error]', err.message);
      next();
    }
  };

  // Expose store and config on middleware function for testing and inspectability
  middleware.store = store;
  middleware.windowMs = windowMs;
  middleware.max = max;

  return middleware;
}

// ── Pre-configured singleton instance for public chat endpoints ───────────────
export const defaultChatStore = new MemoryRateLimitStore({ cleanupIntervalMs: 5 * 60 * 1000 });

export const publicChatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 25, // 25 messages per minute
  message: 'Too many requests. Please wait a moment before sending another message.',
  store: defaultChatStore,
});

export default {
  MemoryRateLimitStore,
  extractClientIp,
  createRateLimiter,
  publicChatRateLimiter,
  defaultChatStore,
};
