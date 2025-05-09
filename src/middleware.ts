import { ipAddress } from '@vercel/functions';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define a basic rate limiting structure
interface RateLimitEntry {
	count: number;
	resetTime: number;
}

// In-memory store for rate limiting
// In a production environment, this should be replaced with Redis or another distributed store
const rateLimitStore = new Map<string, RateLimitEntry>();

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
	return entry.count > RATE_LIMIT_MAX;
}

// This function runs before the auth check
export function middleware(request: NextRequest) {
	// Get client IP
	const ip = ipAddress(request) || 'unknown';

	// Check for auth session and state cookies
	const authSession =
		request.cookies.get('next-auth.session-token') ||
		request.cookies.get('__Secure-next-auth.session-token');
	const stateCookie =
		request.cookies.get('next-auth.state') ||
		request.cookies.get('__Secure-next-auth.state');

	console.log('[MIDDLEWARE] Path:', request.nextUrl.pathname);
	console.log('[MIDDLEWARE] All Cookies:', request.cookies.getAll());
	console.log('[MIDDLEWARE] authSession cookie:', authSession);
	console.log('[MIDDLEWARE] stateCookie:', stateCookie);

	// For protected routes, check if auth is missing and redirect to home
	const isProtectedRoute =
		request.nextUrl.pathname.startsWith('/dashboard') ||
		request.nextUrl.pathname.startsWith('/history') ||
		request.nextUrl.pathname.startsWith('/playlist-generator');

	if (isProtectedRoute && !authSession) {
		// Redirect to landing page if auth is missing
		return NextResponse.redirect(new URL('/', request.url));
	}

	// Only apply rate limiting to API routes
	if (request.nextUrl.pathname.startsWith('/api')) {
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
		if (!request.nextUrl.pathname.startsWith('/api/auth') && !authSession) {
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

	// For auth callback route, ensure cookies can be set properly
	// Also handle possible missing state cookie which could indicate OAuth state mismatch
	if (request.nextUrl.pathname.startsWith('/api/auth/callback')) {
		console.log(
			'[MIDDLEWARE] /api/auth/callback hit. State cookie value:',
			stateCookie?.value
		);
		// If the state cookie is missing during callback, redirect to sign in
		if (!stateCookie && request.nextUrl.searchParams.has('state')) {
			console.error(
				'[MIDDLEWARE] State cookie MISSING on callback with state param. Redirecting to /.'
			);
			return NextResponse.redirect(new URL('/', request.url));
		}
		console.log(
			'[MIDDLEWARE] State cookie present or no state param on callback. Proceeding.'
		);

		const response = NextResponse.next();
		return response;
	}

	// Continue with the authentication check for protected routes
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

// Use withAuth to protect routes that require authentication
export default withAuth({
	callbacks: {
		authorized: ({ token }) => {
			return !!token;
		},
	},
	pages: {
		signIn: '/auth/signin',
	},
});

// Specify which routes should be protected
export const config = {
	matcher: [
		'/dashboard/:path*',
		'/history/:path*',
		'/playlist-generator/:path*',
	],
};
