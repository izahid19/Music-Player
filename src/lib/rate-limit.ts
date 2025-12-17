import { NextRequest, NextResponse } from 'next/server';
import redis from './redis';

interface RateLimitConfig {
  limit: number;      // Number of requests allowed
  window: number;     // Time window in seconds
  identifier?: string; // Optional custom identifier (e.g. email, user ID)
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export class RateLimiter {
  /**
   * Check rate limit for a request
   * @param request The NextRequest object to get IP from
   * @param keyPrefix A unique prefix for the limit (e.g., 'api:login', 'api:songs')
   * @param config Configuration for the rate limit
   */
  static async check(
    request: NextRequest, 
    keyPrefix: string, 
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    try {
      // Get IP address for anonymous limiting
      const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown-ip';
      
      // Use custom identifier if provided (e.g. email), otherwise fall back to IP
      const identifier = config.identifier || ip;
      
      const key = `ratelimit:${keyPrefix}:${identifier}`;
      
      // Increment request count
      const current = await redis.incr(key);
      
      // If this is the first request, set expiry
      if (current === 1) {
        await redis.expire(key, config.window);
      }
      
      // Get TTL for reset time
      const ttl = await redis.ttl(key);
      
      return {
        success: current <= config.limit,
        limit: config.limit,
        remaining: Math.max(0, config.limit - current),
        reset: Date.now() + (ttl * 1000)
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open if Redis is down (allow request but log error)
      return {
        success: true,
        limit: config.limit,
        remaining: 1,
        reset: Date.now() + config.window * 1000
      };
    }
  }

  /**
   * Helper to create a standard 429 response
   */
  static response(result: RateLimitResult): NextResponse {
    return NextResponse.json(
      { 
        error: 'Too many requests', 
        message: 'Please try again later',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString()
        }
      }
    );
  }
}
