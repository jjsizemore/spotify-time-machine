'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

const SIGN_IN_PROCESS_STARTED_KEY = 'sign_in_process_started';

export default function SignIn() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
	const error = searchParams?.get('error');

	useEffect(() => {
		if (error) {
			console.error('Sign-in error:', error);
			sessionStorage.removeItem(SIGN_IN_PROCESS_STARTED_KEY);
			const timer = setTimeout(() => {
				router.replace('/');
			}, 3000);
			return () => clearTimeout(timer);
		}

		const signInProcessAlreadyStarted = sessionStorage.getItem(SIGN_IN_PROCESS_STARTED_KEY) === 'true';

		if (!signInProcessAlreadyStarted) {
			sessionStorage.setItem(SIGN_IN_PROCESS_STARTED_KEY, 'true');
			signIn('spotify', { callbackUrl });
		}
		// If the process was already started, we just show the loading spinner below
		// and wait for NextAuth/Spotify to complete its redirects.
	}, [callbackUrl, error, router]);

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-spotify-black">
				<div className="text-center p-6">
					<h2 className="text-2xl font-bold text-spotify-red mb-4">Authentication Error</h2>
					<p className="text-spotify-light-gray mb-8">
						There was a problem signing you in. Redirecting to home page...
					</p>
				</div>
			</div>
		);
	}

	// Default: show loading spinner. This will be shown if no error,
	// or if signInProcessAlreadyStarted is true (meaning we're waiting for redirect).
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-spotify-black">
			<div className="text-center">
				<LoadingSpinner size="lg" />
				<p className="text-spotify-light-gray mt-4">
					Connecting to Spotify...
				</p>
			</div>
		</div>
	);
}

