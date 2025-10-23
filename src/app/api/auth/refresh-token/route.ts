import { JWT, getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { refreshAccessToken } from '@/lib/spotify';

// Enhanced POST handler with better request handling and context
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      name: 'POST /api/auth/refresh-token',
      op: 'http.server',
      attributes: {
        'http.method': 'POST',
        'http.route': '/api/auth/refresh-token',
      },
    },
    async (span) => {
      try {
        // Enhanced request validation
        if (
          !request.headers.get('content-type')?.includes('application/json') &&
          request.method === 'POST' &&
          request.headers.get('content-length') !== '0'
        ) {
          return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
        }

        // Retrieve the NextAuth token server-side from the request cookies
        // Using async pattern for better performance
        const nextAuthToken: JWT | null = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (!nextAuthToken?.refreshToken) {
          console.error('No refresh token available in server session');

          // Enhanced Sentry context
          Sentry.setContext('auth', {
            hasToken: !!nextAuthToken,
            hasRefreshToken: !!nextAuthToken?.refreshToken,
            userAgent: request.headers.get('user-agent'),
            origin: request.headers.get('origin'),
          });

          // Add span attributes for better debugging
          span.setAttributes({
            'auth.token_present': !!nextAuthToken,
            'auth.refresh_token_present': !!nextAuthToken?.refreshToken,
          });

          return NextResponse.json(
            { error: 'Not authenticated' },
            {
              status: 401,
              headers: {
                'Cache-Control': 'no-store',
                'X-Content-Type-Options': 'nosniff',
              },
            }
          );
        }

        // Add request tracking
        span.setAttributes({
          'auth.token_expiry': nextAuthToken.expiresAt as number,
          'auth.time_to_expiry': (nextAuthToken.expiresAt as number) * 1000 - Date.now(),
        });

        const tokenData = await refreshAccessToken(nextAuthToken.refreshToken);

        // Enhanced response with security headers
        return NextResponse.json(
          {
            accessToken: tokenData.accessToken,
            expiresAt: tokenData.expiresAt,
          },
          {
            status: 200,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'DENY',
            },
          }
        );
      } catch (error) {
        console.error('Token refresh API error:', error);

        // Enhanced error handling with more context
        Sentry.captureException(error, {
          contexts: {
            request: {
              url: request.url,
              method: request.method,
              headers: Object.fromEntries(request.headers.entries()),
            },
          },
        });

        // Add error attributes to span
        span.setAttributes({
          'error.type': error instanceof Error ? error.constructor.name : 'Unknown',
          'error.message': error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
          { error: 'Failed to refresh token' },
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
