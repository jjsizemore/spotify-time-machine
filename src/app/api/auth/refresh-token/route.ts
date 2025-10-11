import { JWT, getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { refreshAccessToken } from '@/lib/spotify';

export async function POST(request: Request) {
  return Sentry.startSpan(
    {
      name: 'POST /api/auth/refresh-token',
      op: 'http.server',
    },
    async (_span) => {
      try {
        // Retrieve the NextAuth token server-side from the request cookies
        const nextAuthToken: JWT | null = await getToken({
          req: request as any,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (!nextAuthToken || !nextAuthToken.refreshToken) {
          console.error('No refresh token available in server session');
          Sentry.setContext('auth', {
            hasToken: !!nextAuthToken,
            hasRefreshToken: !!nextAuthToken?.refreshToken,
          });
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const tokenData = await refreshAccessToken(nextAuthToken.refreshToken);

        // IMPORTANT: Do not return the refresh token to the client. Only return access token and expiry.
        return NextResponse.json({
          accessToken: tokenData.accessToken,
          expiresAt: tokenData.expiresAt,
        });
      } catch (error) {
        console.error('Token refresh API error:', error);
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
      }
    }
  );
}
