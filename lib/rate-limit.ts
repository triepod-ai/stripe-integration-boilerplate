import { NextRequest } from 'next/server'

/**
 * Rate limiting storage
 * In production, use Redis or a proper database
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  return `${ip}:${userAgent.substring(0, 50)}`
}

/**
 * Check if request is within rate limit
 *
 * @param key - Unique identifier for the client
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if within limit, false if limit exceeded
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    cleanupRateLimitMap()
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitMap(): void {
  const now = Date.now()
  const keysToDelete: string[] = []

  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key)
    }
  })

  keysToDelete.forEach((key) => rateLimitMap.delete(key))
}

/**
 * Get remaining requests for a key
 */
export function getRemainingRequests(key: string, limit: number = 10): number {
  const entry = rateLimitMap.get(key)
  if (!entry) return limit

  const now = Date.now()
  if (now > entry.resetTime) return limit

  return Math.max(0, limit - entry.count)
}

/**
 * Get time until rate limit resets (in seconds)
 */
export function getResetTime(key: string): number {
  const entry = rateLimitMap.get(key)
  if (!entry) return 0

  const now = Date.now()
  if (now > entry.resetTime) return 0

  return Math.ceil((entry.resetTime - now) / 1000)
}
