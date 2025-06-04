import { refreshAccessToken } from '@/lib/spotify';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	// Only allow in development
	if (process.env.NODE_ENV !== 'development') {
		return NextResponse.json(
			{ error: 'This endpoint is only available in development' },
			{ status: 403 }
		);
	}

	try {
		const session = await getServerSession();

		if (!session) {
			return NextResponse.json({ error: 'No session found' }, { status: 401 });
		}

		// For development testing, we'll extract refresh token from request body
		const body = await request.json();
		const { refreshToken } = body;

		if (!refreshToken) {
			return NextResponse.json(
				{ error: 'No refresh token provided' },
				{ status: 400 }
			);
		}

		console.log('🔧 Manual token refresh requested (development)');

		const refreshedToken = await refreshAccessToken(refreshToken);

		return NextResponse.json({
			success: true,
			message: 'Token refreshed successfully',
			tokenInfo: {
				hasAccessToken: !!refreshedToken.accessToken,
				hasRefreshToken: !!refreshedToken.refreshToken,
				expiresAt: refreshedToken.expiresAt,
				expiresIn: Math.floor(
					(refreshedToken.expiresAt * 1000 - Date.now()) / 1000 / 60
				), // minutes
			},
		});
	} catch (error) {
		console.error('❌ Manual token refresh failed:', error);

		return NextResponse.json(
			{
				error: 'Token refresh failed',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
