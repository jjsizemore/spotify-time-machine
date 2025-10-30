'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import LoadingSpinner from '@/ui/LoadingSpinner';
import ActionButton from '@/ui/ActionButton';

const SIGN_IN_PROCESS_STARTED_KEY = 'sign_in_process_started';

// Error type definitions for better error handling
interface ErrorInfo {
  title: string;
  message: string;
  suggestion: string;
  retryable: boolean;
}

// Enhanced error mapping for different error types
const getErrorInfo = (error: string | null): ErrorInfo => {
  switch (error) {
    case 'OAuthCallback':
      return {
        title: 'OAuth Authentication Failed',
        message: 'There was a problem during the Spotify authentication process.',
        suggestion:
          'This might be due to cookie settings or browser restrictions. Try clearing your browser cache and cookies, or try a different browser.',
        retryable: true,
      };
    case 'Callback':
      return {
        title: 'Authentication Callback Error',
        message: 'The authentication process was interrupted or failed to complete.',
        suggestion:
          'Please ensure you have a stable internet connection and that cookies are enabled in your browser.',
        retryable: true,
      };
    case 'AccessDenied':
    case 'access_denied':
      return {
        title: 'Access Denied',
        message: 'You declined to authorize the application or the authorization was cancelled.',
        suggestion:
          'To use this app, you need to grant permission to access your Spotify account. Please try signing in again and click "Agree" when prompted.',
        retryable: true,
      };
    case 'Configuration':
      return {
        title: 'Configuration Error',
        message: 'There is a problem with the application configuration.',
        suggestion:
          'This is a technical issue on our end. Please try again later or contact support if the problem persists.',
        retryable: false,
      };
    case 'Verification':
      return {
        title: 'Verification Failed',
        message: 'Unable to verify your authentication credentials.',
        suggestion: 'This might be a temporary issue. Please try signing in again.',
        retryable: true,
      };
    default:
      return {
        title: 'Authentication Error',
        message: error
          ? `Authentication failed: ${error}`
          : 'An unexpected error occurred during sign-in.',
        suggestion:
          'Please try signing in again. If the problem persists, try clearing your browser cache or using a different browser.',
        retryable: true,
      };
  }
};

// Extracted content into a new component to be wrapped by Suspense
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const error = searchParams?.get('error');
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(10);

  const errorInfo = error ? getErrorInfo(error) : null;

  // Handle retry logic
  const handleRetry = async () => {
    setIsRetrying(true);
    // Clear any existing sign-in process state
    sessionStorage.removeItem(SIGN_IN_PROCESS_STARTED_KEY);

    try {
      // Small delay to prevent rapid retries
      await new Promise((resolve) => setTimeout(resolve, 500));
      await signIn('spotify', { callbackUrl });
    } catch (err) {
      console.error('Retry sign-in failed:', err);
      setIsRetrying(false);
    }
  };

  // Handle manual navigation back to home
  const handleGoHome = () => {
    router.replace('/');
  };

  useEffect(() => {
    if (error) {
      const signInProcessState = sessionStorage.getItem(SIGN_IN_PROCESS_STARTED_KEY);

      // Enhanced error logging
      console.error('Sign-in error details:', {
        error,
        errorType: typeof error,
        callbackUrl,
        signInProcessState,
        timestamp: new Date().toISOString(),
        url: globalThis.location.href,
        userAgent: navigator.userAgent,
        cookies: document.cookie ? 'present' : 'none',
      });

      sessionStorage.removeItem(SIGN_IN_PROCESS_STARTED_KEY);

      // Auto-redirect countdown for non-retryable errors
      if (!errorInfo?.retryable) {
        const timer = setInterval(() => {
          setAutoRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.replace('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
      // No cleanup needed for retryable errors
      return undefined;
    } else {
      const signInProcessAlreadyStarted =
        sessionStorage.getItem(SIGN_IN_PROCESS_STARTED_KEY) === 'true';

      if (!signInProcessAlreadyStarted) {
        sessionStorage.setItem(SIGN_IN_PROCESS_STARTED_KEY, 'true');
        signIn('spotify', { callbackUrl });
      }
      // No cleanup needed for the sign-in process
      return undefined;
    }
  }, [callbackUrl, error, router, errorInfo?.retryable]);

  if (error && errorInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-spotify-black px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-spotify-dark-gray rounded-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-spotify-red/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-spotify-red"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-bold text-spotify-white">{errorInfo.title}</h2>

          {/* Error Message */}
          <p className="text-spotify-light-gray">{errorInfo.message}</p>

          {/* Suggestion */}
          <div className="bg-spotify-black/50 rounded-md p-4 text-left">
            <h4 className="text-sm font-semibold text-spotify-white mb-2">💡 What you can do:</h4>
            <p className="text-sm text-spotify-light-gray">{errorInfo.suggestion}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {errorInfo.retryable ? (
              <>
                <ActionButton onClick={handleRetry} disabled={isRetrying} className="w-full">
                  {isRetrying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Retrying...</span>
                    </div>
                  ) : (
                    'Try Again'
                  )}
                </ActionButton>
                <ActionButton onClick={handleGoHome} variant="secondary" className="w-full">
                  Go to Homepage
                </ActionButton>
              </>
            ) : (
              <>
                <p className="text-spotify-light-gray text-sm">
                  Redirecting to homepage in {autoRedirectCountdown} seconds...
                </p>
                <ActionButton onClick={handleGoHome} className="w-full">
                  Go to Homepage Now
                </ActionButton>
              </>
            )}
          </div>

          {/* Technical Details (for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-spotify-light-gray cursor-pointer hover:text-spotify-white">
                Technical Details (Dev Mode)
              </summary>
              <div className="mt-2 p-3 bg-spotify-black rounded text-xs font-mono text-spotify-light-gray">
                <p>
                  <strong>Error Code:</strong> {error}
                </p>
                <p>
                  <strong>Callback URL:</strong> {callbackUrl}
                </p>
                <p>
                  <strong>Timestamp:</strong> {new Date().toISOString()}
                </p>
                <p>
                  <strong>URL:</strong> {globalThis.location.href}
                </p>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Default: show loading spinner. This will be shown if no error,
  // or if signInProcessAlreadyStarted is true (meaning we're waiting for redirect).
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-spotify-black">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <h2 className="text-xl font-semibold text-spotify-white">Connecting to Spotify</h2>
        <p className="text-spotify-light-gray">
          You'll be redirected to Spotify to authorize the app...
        </p>
        <div className="max-w-md mx-auto mt-6">
          <div className="bg-spotify-dark-gray rounded-lg p-4 text-sm text-spotify-light-gray">
            <p className="mb-2">
              <strong className="text-spotify-white">Taking too long?</strong>
            </p>
            <p>
              Make sure pop-ups are enabled and try refreshing the page if nothing happens after 30
              seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback UI component
function SignInFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-spotify-black">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-spotify-light-gray mt-4">Loading sign-in page...</p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}
