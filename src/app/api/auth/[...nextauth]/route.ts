import { createHash, randomBytes } from 'crypto';
import { refreshAccessToken, scopes } from '@/lib/spotify';
import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const handler = NextAuth({
	providers: [
		SpotifyProvider({
			clientId: process.env.SPOTIFY_CLIENT_ID!,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
			checks: ['pkce'],
			authorization: {
				params: {
					scope: scopes,
				},
			},
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			// Initial sign in
			if (account) {
				token.accessToken = account.access_token;
				token.refreshToken = account.refresh_token;
				token.expiresAt = account.expires_at;
				return token;
			}

			// Return the token if it's still valid
			if (Date.now() < (token.expiresAt as number) * 1000) {
				return token;
			}

			// Token has expired, refresh it
			try {
				const refreshedToken = await refreshAccessToken(
					token.refreshToken as string
				);
				token.accessToken = refreshedToken.accessToken;
				token.expiresAt = refreshedToken.expiresAt;
				return token;
			} catch (error) {
				console.error('Error refreshing access token', error);
				return { ...token, error: 'RefreshAccessTokenError' };
			}
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken as string | undefined;
			session.refreshToken = token.refreshToken as string | undefined;
			session.expiresAt = token.expiresAt as number | undefined;
			session.error = token.error as string | undefined;
			return session;
		},
	},
	pages: {
		signIn: '/auth/signin',
	},
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
	},
	cookies: {
		sessionToken: {
			name: `next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
			},
		},
		callbackUrl: {
			name: `next-auth.callback-url`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
			},
		},
		csrfToken: {
			name: `next-auth.csrf-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
			},
		},
	},
});

export { handler as GET, handler as POST };
