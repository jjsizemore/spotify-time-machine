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
				console.log('🔑 Initial sign-in, storing tokens');
				token.accessToken = account.access_token;
				token.refreshToken = account.refresh_token;
				token.expiresAt = account.expires_at;
				return token;
			}

			// Add buffer time: refresh token 5 minutes before expiration instead of waiting for expiry
			const bufferTime = 5 * 60; // 5 minutes in seconds
			const expirationTime = (token.expiresAt as number) - bufferTime;

			// Return the token if it's still valid (with buffer)
			if (Date.now() < expirationTime * 1000) {
				return token;
			}

			// Token will expire soon or has expired, refresh it
			console.log('⏰ Token expires soon or has expired, refreshing...');
			try {
				const refreshedToken = await refreshAccessToken(
					token.refreshToken as string
				);

				console.log('✅ Token refresh successful');

				// Update token with refreshed values
				return {
					...token,
					accessToken: refreshedToken.accessToken,
					refreshToken: refreshedToken.refreshToken, // Important: update refresh token if new one provided
					expiresAt: refreshedToken.expiresAt,
					error: undefined, // Clear any previous errors
				};
			} catch (error) {
				console.error('❌ Error refreshing access token:', error);

				// Return token with error flag - this will trigger re-authentication
				return {
					...token,
					error: 'RefreshAccessTokenError',
					// Don't clear the tokens yet - let the client handle re-auth
				};
			}
		},
		async session({ session, token }) {
			// Pass token information to the session
			session.accessToken = token.accessToken as string | undefined;
			session.refreshToken = token.refreshToken as string | undefined;
			session.expiresAt = token.expiresAt as number | undefined;
			session.error = token.error as string | undefined;

			// Add debugging info in development
			if (process.env.NODE_ENV === 'development') {
				const timeToExpiry = token.expiresAt
					? Math.floor(
							((token.expiresAt as number) * 1000 - Date.now()) / 1000 / 60
						)
					: 0;
				console.log(`🕐 Token expires in ${timeToExpiry} minutes`);
			}

			return session;
		},
	},
	pages: {
		signIn: '/auth/signin',
	},
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
		// Reduce session max age to ensure token refresh happens regularly
		maxAge: 60 * 60, // 1 hour (same as Spotify token expiry)
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
		// Critical: Add PKCE-specific cookies
		pkceCodeVerifier: {
			name: `next-auth.pkce.code_verifier`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 15, // 15 minutes
			},
		},
		state: {
			name: `next-auth.state`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 15, // 15 minutes
			},
		},
		nonce: {
			name: `next-auth.nonce`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 15, // 15 minutes
			},
		},
	},
	// Enhanced debugging for development
	debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
