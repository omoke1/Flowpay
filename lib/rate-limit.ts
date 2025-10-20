import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (will use environment variables)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiting
  general: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    analytics: true,
  }),

  // Payment creation rate limiting (more restrictive)
  payments: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 payment requests per minute
    analytics: true,
  }),

  // Payment link creation rate limiting
  paymentLinks: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 payment link creations per minute
    analytics: true,
  }),

  // Webhook rate limiting
  webhooks: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(50, "1 m"), // 50 webhook calls per minute
    analytics: true,
  }),

  // Settings operations rate limiting
  settings: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 settings operations per minute
    analytics: true,
  }),
};

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return "unknown";
}

/**
 * Check rate limit for a specific endpoint
 */
export async function checkRateLimit(
  request: Request,
  endpoint: keyof typeof rateLimiters
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  error?: string;
}> {
  try {
    const ip = getClientIP(request);
    const { success, limit, remaining, reset } = await rateLimiters[endpoint].limit(ip);
    // Upstash returns `reset` as a unix epoch in seconds; convert to Date
    const resetDate = new Date(typeof reset === "number" ? reset * 1000 : Date.now());
    
    return {
      success,
      limit,
      remaining,
      reset: resetDate,
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // If rate limiting fails, allow the request but log the error
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
      error: "Rate limiting service unavailable",
    };
  }
}

/**
 * Middleware function to apply rate limiting to API routes
 */
export async function withRateLimit(
  request: Request,
  endpoint: keyof typeof rateLimiters,
  handler: () => Promise<Response>
): Promise<Response> {
  const rateLimitResult = await checkRateLimit(request, endpoint);
  
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        reset: rateLimitResult.reset,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toISOString(),
        },
      }
    );
  }
  
  // Add rate limit headers to successful responses
  const response = await handler();
  response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
  response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toISOString());
  
  return response;
}

/**
 * Check if rate limiting is configured
 */
export function isRateLimitConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
