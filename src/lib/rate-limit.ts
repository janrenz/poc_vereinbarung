import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (for production, use Redis or similar)
const store = new Map<string, RateLimitStore>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // Cleanup every minute

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

/**
 * Rate limiting middleware
 * @param req NextRequest object
 * @param config Rate limit configuration
 * @returns NextResponse if rate limited, null otherwise
 */
export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return NextResponse.json(
      {
        error: config.message || "Too many requests, please try again later.",
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((entry.resetTime - now) / 1000).toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
        },
      }
    );
  }

  // Increment counter
  entry.count++;

  return null;
}

/**
 * Get client IP address from request
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return req.ip || "unknown";
}

/**
 * Preset rate limit configurations
 */
export const RateLimits = {
  // Authentication endpoints
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many login attempts, please try again in 15 minutes",
  },

  // Form operations
  FORM_CREATE: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many form creations, please try again later",
  },

  // Entry autosave
  ENTRY_SAVE: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "Autosave rate limit exceeded, please slow down",
  },

  // Access code attempts
  ACCESS_CODE: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many access code attempts, please try again later",
  },

  // Export operations
  EXPORT: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many export requests, please try again later",
  },

  // School search
  SCHOOL_SEARCH: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many search requests, please try again later",
  },

  // General API
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "API rate limit exceeded, please slow down",
  },
};

/**
 * Clean up rate limit store (for testing)
 */
export function clearRateLimitStore() {
  store.clear();
}
