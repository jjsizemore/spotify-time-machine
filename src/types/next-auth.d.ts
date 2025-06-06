import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	interface Session extends DefaultSession {
		accessToken?: string;
		refreshToken?: string;
		expiresAt?: number;
		error?: string;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		accessToken?: string;
		refreshToken?: string;
		expiresAt?: number;
		error?: string;
	}
}
