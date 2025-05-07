import { scopes } from '@/lib/spotify';
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
			if (account) {
				token.accessToken = account.access_token;
				token.refreshToken = account.refresh_token;
				token.expiresAt = account.expires_at;
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.refreshToken = token.refreshToken;
			session.expiresAt = token.expiresAt;
			return session;
		},
	},
	pages: {
		signIn: '/auth/signin',
	},
});

export { handler as GET, handler as POST };
