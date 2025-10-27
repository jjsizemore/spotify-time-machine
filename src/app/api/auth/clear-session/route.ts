import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// Enhanced GET handler with better request context and security
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      name: 'GET /api/auth/clear-session',
      op: 'http.server',
      attributes: {
        'http.method': 'GET',
        'http.route': '/api/auth/clear-session',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    },
    async (span) => {
      try {
        // Create response with enhanced security headers
        const response = NextResponse.json(
          { success: true, timestamp: new Date().toISOString() },
          {
            status: 200,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'DENY',
              'Referrer-Policy': 'no-referrer',
            },
          }
        );

        // Enhanced cookie clearing with all possible variants
        const cookiesToClear = [
          'next-auth.session-token',
          'next-auth.callback-url',
          'next-auth.csrf-token',
          'next-auth.pkce.code_verifier',
          'next-auth.state',
          'next-auth.nonce',
          '__Secure-next-auth.session-token',
          '__Secure-next-auth.callback-url',
          '__Secure-next-auth.csrf-token',
          '__Host-next-auth.csrf-token',
        ];

        // Clear cookies with proper domain and path handling
        for (const cookieName of cookiesToClear) {
          // Clear with default options - delete only accepts the cookie name
          response.cookies.delete(cookieName);
        }

        // Add span success attributes
        span.setAttributes({
          'cookies.cleared_count': cookiesToClear.length,
          'session.cleared': true,
        });

        return response;
      } catch (error) {
        console.error('Clear session API error:', error);

        // Enhanced error handling
        Sentry.captureException(error, {
          contexts: {
            request: {
              url: request.url,
              method: request.method,
              origin: request.headers.get('origin'),
              referer: request.headers.get('referer'),
            },
          },
        });

        span.setAttributes({
          'error.occurred': true,
          'error.type': error instanceof Error ? error.constructor.name : 'Unknown',
        });

        return NextResponse.json(
          { error: 'Failed to clear session' },
          {
            status: 500,
            headers: {
              'Cache-Control': 'no-store',
              'X-Content-Type-Options': 'nosniff',
            },
          }
        );
      }
    }
  );
}
