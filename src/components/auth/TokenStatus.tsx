'use client';

import { analyzeTokenStatus, formatTokenExpiry } from '@/lib/tokenUtils';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface TokenStatusProps {
	className?: string;
}

export default function TokenStatus({ className = '' }: TokenStatusProps) {
	const { data: session } = useSession();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Only show in development mode and after mounting
	if (!mounted || process.env.NODE_ENV !== 'development') {
		return null;
	}

	if (!session) {
		return (
			<div
				className={`fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs font-mono border border-gray-600 z-50 ${className}`}
			>
				<div className="text-red-400">🔴 No Session</div>
			</div>
		);
	}

	const tokenInfo = analyzeTokenStatus(session.expiresAt);
	const hasError = !!session.error;

	const statusColor = hasError
		? 'text-red-400'
		: tokenInfo.isValid
			? tokenInfo.isExpiringSoon
				? 'text-yellow-400'
				: 'text-green-400'
			: 'text-red-400';

	const statusIcon = hasError
		? '🔴'
		: tokenInfo.isValid
			? tokenInfo.isExpiringSoon
				? '🟡'
				: '🟢'
			: '🔴';

	return (
		<div
			className={`fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs font-mono border border-gray-600 z-50 max-w-xs ${className}`}
		>
			<div className="mb-2 font-bold">Token Status (Dev)</div>

			<div className={`mb-1 ${statusColor}`}>
				{statusIcon} {tokenInfo.status.replace('_', ' ').toUpperCase()}
			</div>

			{session.error && (
				<div className="text-red-400 mb-1">❌ Error: {session.error}</div>
			)}

			<div className="text-gray-300 space-y-1">
				<div>🕐 {formatTokenExpiry(session.expiresAt)}</div>
				<div>🔑 Token: {session.accessToken ? 'Present' : 'Missing'}</div>
				<div>🔄 Refresh: {session.refreshToken ? 'Present' : 'Missing'}</div>
			</div>
		</div>
	);
}
