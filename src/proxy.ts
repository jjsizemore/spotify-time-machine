import { ipAddress } from '@vercel/functions';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getValidatedEnv } from '@/lib/envConfig';

// Define a basic rate limiting structure
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In a production environment, this should be replaced with Redis or another distributed store
const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_STORE_MAX_KEYS = 5000; // Safety cap for memory

function evictIfNeeded() {
  if (rateLimitStore.size <= RATE_LIMIT_STORE_MAX_KEYS) return;
  const entries = Array.from(rateLimitStore.entries());
  entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
  const removeCount = entries.length - RATE_LIMIT_STORE_MAX_KEYS;
  for (let i = 0; i < removeCount; i++) {
    const [key] = entries[i];
    rateLimitStore.delete(key);
  }
}

// Rate limit configuration
const RATE_LIMIT_MAX = 100; // Maximum requests in time window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

// Check if a request exceeds rate limits
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (now > entry.resetTime) {
    // Reset window has passed
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(ip, entry);

  // Check if over limit
  const limited = entry.count > RATE_LIMIT_MAX;
  evictIfNeeded();
  return limited;
}

// Helper function to check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  // Check for auth session cookies
  const authSession =
    request.cookies.get('next-auth.session-token') ||
    request.cookies.get('__Secure-next-auth.session-token');

  return !!authSession;
}

// Next.js 16 proxy function (replaces middleware)
export function proxy(request: NextRequest) {
  const env = getValidatedEnv();

  // Get client IP
  const ip = ipAddress(request) || 'unknown';

  // Reduced logging - only log essential information
  if (env.NODE_ENV === 'development' || env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log('[PROXY] Path:', request.nextUrl.pathname);
  }

  // For ALL auth routes, bypass completely - no checks, no rate limiting
  // This is critical for OAuth flow (PKCE, callbacks, sessions, etc.)
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    // Pass through without any interference - NextAuth needs full control
    return NextResponse.next();
  }

  // For protected routes, check if auth is missing and redirect to home
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/history') ||
    request.nextUrl.pathname.startsWith('/playlist-generator');

  if (isProtectedRoute && !isAuthenticated(request)) {
    // Redirect to landing page if auth is missing
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Only apply rate limiting to non-auth API routes
  if (
    request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    // Check rate limit
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    // For API routes that require auth, check if auth session exists
    if (!isAuthenticated(request)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  // Continue with the request
  return NextResponse.next();
}

// Cleanup old entries from rate limit store (every 15 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [ip, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
          rateLimitStore.delete(ip);
        }
      }
    },
    15 * 60 * 1000
  );
}

// Specify which routes should be protected
export const config = {
  matcher: ['/dashboard/:path*', '/history/:path*', '/playlist-generator/:path*', '/api/:path*'],
};
