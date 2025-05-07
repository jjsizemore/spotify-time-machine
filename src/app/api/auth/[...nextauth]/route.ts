import { refreshAccessToken, scopes } from '@/lib/spotify';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const prisma = new PrismaClient();

const handler = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		SpotifyProvider({
			clientId: process.env.SPOTIFY_CLIENT_ID!,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
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
				const refreshedToken = await refreshAccessToken(token.refreshToken as string);
				token.accessToken = refreshedToken.accessToken;
				token.expiresAt = refreshedToken.expiresAt;
				return token;
			} catch (error) {
				console.error('Error refreshing access token', error);
				return { ...token, error: 'RefreshAccessTokenError' };
			}
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.refreshToken = token.refreshToken;
			session.expiresAt = token.expiresAt;
			session.error = token.error;
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
});

export { handler as GET, handler as POST };
