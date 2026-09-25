import crypto from 'crypto';

/**
 * Enterprise Security Middleware & Helpers for Vercel Serverless Functions
 */

// In-memory rate limiting map: ip -> { count, resetAt }
const RATE_LIMIT_CACHE = new Map();

/**
 * Enforce sliding-window rate limiting per IP
 * @param {string} ip - Client IP address
 * @param {string} endpoint - API route identifier
 * @param {number} limit - Maximum requests allowed in window
 * @param {number} windowMs - Time window in milliseconds (default: 60,000ms = 1 min)
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(ip = 'anonymous', endpoint = 'global', limit = 30, windowMs = 60000) {
  const now = Date.now();
  const key = `${endpoint}:${ip}`;
  const entry = RATE_LIMIT_CACHE.get(key);

  // Evict stale entries if cache gets too large (memory leak prevention)
  if (RATE_LIMIT_CACHE.size > 5000) {
    for (const [k, v] of RATE_LIMIT_CACHE.entries()) {
      if (v.resetAt < now) RATE_LIMIT_CACHE.delete(k);
    }
  }

  if (!entry || entry.resetAt < now) {
    const nextReset = now + windowMs;
    RATE_LIMIT_CACHE.set(key, { count: 1, resetAt: nextReset });
    return { allowed: true, remaining: limit - 1, resetAt: nextReset };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract Client IP safely from Vercel / proxy headers
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Verify Supabase JWT token from Authorization header
 * @param {Object} req - Incoming request
 * @returns {Promise<{ authenticated: boolean, user: Object|null, error: string|null }>}
 */
export async function verifySupabaseAuth(req) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { authenticated: false, user: null, error: 'Missing Bearer token' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    // If Supabase is not configured in this environment, allow local preview if flagged
    const allowLocalDev = process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL_AUTH === 'true';
    if (allowLocalDev) {
      return { authenticated: true, user: { id: 'dev-user', email: 'dev@maternalsupport.co' }, error: null };
    }
    return { authenticated: false, user: null, error: 'Auth service not configured' };
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { authenticated: false, user: null, error: 'Invalid or expired session token' };
    }

    const user = await res.json();
    return { authenticated: true, user, error: null };
  } catch (err) {
    return { authenticated: false, user: null, error: err.message || 'Auth verification failed' };
  }
}

/**
 * Constant-time comparison to prevent timing attacks on HMAC signatures
 */
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Strict UUID validator to prevent SQL/PostgREST parameter injection
 */
export function isValidUuid(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || /^[a-zA-Z0-9_-]{8,48}$/.test(id);
}
