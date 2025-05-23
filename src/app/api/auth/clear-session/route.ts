import { NextResponse } from 'next/server';

export async function GET() {
	const response = NextResponse.json({ success: true });

	// Clear all possible auth cookies
	const cookiesToClear = [
		'next-auth.session-token',
		'next-auth.callback-url',
		'next-auth.csrf-token',
		'__Secure-next-auth.session-token',
		'__Secure-next-auth.callback-url',
		'__Secure-next-auth.csrf-token',
		'__Host-next-auth.csrf-token',
	];

	cookiesToClear.forEach((cookieName) => {
		// Clear the cookie with various path and domain options to ensure it's removed
		response.cookies.delete(cookieName);
	});

	return response;
}
