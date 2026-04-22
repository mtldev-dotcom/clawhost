/**
 * Rate Limiting Module
 * Simple in-memory rate limiting for auth and API endpoints
 * Uses sliding window algorithm
 * 
 * NOTE: For production with multiple instances, use Redis or Upstash rate limit
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Simple in-memory store (reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

function parseLimitConfig(envValue?: string, defaultConfig: RateLimitConfig = { maxRequests: 100, windowMs: 15 * 60 * 1000 }): RateLimitConfig {
  if (!envValue) return defaultConfig
  
  const parts = envValue.split('_')
  if (parts.length !== 2) return defaultConfig
  
  const count = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  
  if (isNaN(count) || isNaN(minutes)) return defaultConfig
  
  return {
    maxRequests: count,
    windowMs: minutes * 60 * 1000
  }
}

// Default configurations from environment
const AUTH_CONFIG = parseLimitConfig(process.env.RATE_LIMIT_AUTH, { maxRequests: 10, windowMs: 15 * 60 * 1000 })
const API_CONFIG = parseLimitConfig(process.env.RATE_LIMIT_API, { maxRequests: 100, windowMs: 15 * 60 * 1000 })
const PROVISION_CONFIG = parseLimitConfig(undefined, { maxRequests: 5, windowMs: 60 * 60 * 1000 }) // 5 per hour

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier (e.g., IP + endpoint, userId)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining info
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)
  
  // Reset if window has expired
  if (entry && entry.resetAt <= now) {
    rateLimitStore.delete(identifier)
  }
  
  // Get or create entry
  const currentEntry = rateLimitStore.get(identifier)
  const windowStart = currentEntry?.resetAt ?? now + config.windowMs
  const currentCount = currentEntry?.count ?? 0
  
  if (currentCount >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: windowStart
    }
  }
  
  // Increment counter
  rateLimitStore.set(identifier, {
    count: currentCount + 1,
    resetAt: windowStart
  })
  
  return {
    allowed: true,
    remaining: config.maxRequests - currentCount - 1,
    resetAt: windowStart
  }
}

/**
 * Check rate limit for auth endpoints (more strict)
 */
export function checkAuthRateLimit(identifier: string) {
  return checkRateLimit(`auth:${identifier}`, AUTH_CONFIG)
}

/**
 * Check rate limit for general API endpoints
 */
export function checkApiRateLimit(identifier: string) {
  return checkRateLimit(`api:${identifier}`, API_CONFIG)
}

/**
 * Check rate limit for provisioning operations (very strict)
 */
export function checkProvisionRateLimit(identifier: string) {
  return checkRateLimit(`provision:${identifier}`, PROVISION_CONFIG)
}

/**
 * Create a rate limited response
 */
export function createRateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(AUTH_CONFIG.maxRequests),
        'X-RateLimit-Remaining': '0'
      }
    }
  )
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

/**
 * Get client's IP from request
 */
export function getClientIP(request: Request): string {
  // Check X-Forwarded-For header (for behind proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  // Check X-Real-IP
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback - use cf-connecting-ip or similar
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP
  }
  
  // Last resort - unknown
  return 'unknown'
}
