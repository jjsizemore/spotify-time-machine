/**
 * Utility functions for token management and monitoring
 */

export interface TokenInfo {
	isValid: boolean;
	isExpiringSoon: boolean;
	minutesUntilExpiry: number;
	status: 'valid' | 'expiring_soon' | 'expired' | 'missing';
}

/**
 * Analyzes token status and provides detailed information
 */
export function analyzeTokenStatus(expiresAt?: number): TokenInfo {
	if (!expiresAt) {
		return {
			isValid: false,
			isExpiringSoon: false,
			minutesUntilExpiry: 0,
			status: 'missing',
		};
	}

	const now = Date.now();
	const expirationTime = expiresAt * 1000; // Convert to milliseconds
	const minutesUntilExpiry = Math.floor((expirationTime - now) / 1000 / 60);

	// Token is expired
	if (now >= expirationTime) {
		return {
			isValid: false,
			isExpiringSoon: false,
			minutesUntilExpiry: 0,
			status: 'expired',
		};
	}

	// Token expires within 10 minutes
	const isExpiringSoon = minutesUntilExpiry <= 10;

	return {
		isValid: true,
		isExpiringSoon,
		minutesUntilExpiry,
		status: isExpiringSoon ? 'expiring_soon' : 'valid',
	};
}

/**
 * Checks if a token should be refreshed proactively
 */
export function shouldRefreshToken(
	expiresAt?: number,
	bufferMinutes = 5
): boolean {
	if (!expiresAt) return false;

	const now = Date.now();
	const expirationTime = expiresAt * 1000;
	const bufferTime = bufferMinutes * 60 * 1000;

	return now + bufferTime >= expirationTime;
}

/**
 * Formats token expiry time for display
 */
export function formatTokenExpiry(expiresAt?: number): string {
	if (!expiresAt) return 'Unknown';

	const tokenInfo = analyzeTokenStatus(expiresAt);

	if (tokenInfo.status === 'expired') {
		return 'Expired';
	}

	if (tokenInfo.minutesUntilExpiry < 1) {
		return 'Expires in less than 1 minute';
	}

	if (tokenInfo.minutesUntilExpiry < 60) {
		return `Expires in ${tokenInfo.minutesUntilExpiry} minutes`;
	}

	const hours = Math.floor(tokenInfo.minutesUntilExpiry / 60);
	const minutes = tokenInfo.minutesUntilExpiry % 60;

	if (minutes === 0) {
		return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
	}

	return `Expires in ${hours}h ${minutes}m`;
}
