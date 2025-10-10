'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function ThankYouPage() {
  const router = useRouter();

  // Ensure all auth tokens are cleared on page load
  useEffect(() => {
    const clearAllAuth = async () => {
      try {
        sessionStorage.removeItem('sign_in_process_started'); // Clear sign-in attempt flag
        // Clear any localStorage/sessionStorage auth data
        localStorage.removeItem('spotify-auth-state');
        sessionStorage.removeItem('spotify-auth-state');

        // Clear auth cookies via our API
        await fetch('/api/auth/clear-session');
      } catch (error) {
        console.error('Error clearing auth state:', error);
      }
    };

    clearAllAuth();
  }, []);

  // Automatically redirect to the home page after 5 seconds
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-spotify-black p-6 text-center">
      <div className="max-w-lg mx-auto">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-spotify-green">Jermaine's</h1>
            <Image
              src="/spotify-icon.png"
              alt="Spotify Logo"
              width={64}
              height={64}
              className="drop-shadow-lg"
            />
            <h1 className="text-2xl font-bold text-spotify-green">Time Machine</h1>
          </Link>
        </div>

        <h2 className="text-3xl font-bold text-spotify-white mb-4">
          Thanks for Using Jermaine's Spotify Time Machine!
        </h2>
        <p className="text-spotify-light-gray mb-8">
          You have been successfully logged out. We hope you enjoyed exploring your Spotify history!
        </p>

        <p className="text-spotify-light-gray text-sm mb-12">
          You will be redirected to the home page in 5 seconds...
        </p>

        <Link
          href="/"
          className="px-6 py-3 bg-spotify-green hover:bg-spotify-green/90 text-black font-bold rounded-full transition-colors inline-block"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
