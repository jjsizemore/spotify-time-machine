import { refreshAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { refreshToken } = body;

		if (!refreshToken) {
			return NextResponse.json(
				{ error: 'Refresh token is required' },
				{ status: 400 }
			);
		}

		const tokenData = await refreshAccessToken(refreshToken);

		return NextResponse.json(tokenData);
	} catch (error) {
		console.error('Token refresh API error:', error);
		return NextResponse.json(
			{ error: 'Failed to refresh token' },
			{ status: 500 }
		);
	}
}
