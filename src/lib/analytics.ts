/**
 * Robust analytics utilities with error handling (client-safe)
 */

import { PUBLIC_ENV, getClientEnvOrDefault } from './clientEnv';

export const initializeAnalytics = async () => {
  if (globalThis.window === undefined) {
    return;
  }

  // Only initialize in production by default; allow opt-in for dev via NEXT_PUBLIC_FORCE_ANALYTICS
  const isDev = PUBLIC_ENV.NODE_ENV === 'development';
  const forceAnalytics = getClientEnvOrDefault('NEXT_PUBLIC_FORCE_ANALYTICS', 'false') === 'true';
  if (isDev && !forceAnalytics) {
    console.log('📊 Analytics disabled in development mode');
    return;
  }

  const posthogKey = PUBLIC_ENV.POSTHOG_KEY;
  const posthogHost = PUBLIC_ENV.POSTHOG_HOST;

  if (!posthogKey) {
    console.warn('PostHog key not configured');
    return;
  }

  try {
    // Test network connectivity first
    const testResponse = await fetch(`${posthogHost}/decide/`, {
      method: 'HEAD',
      mode: 'no-cors',
    }).catch(() => null);

    if (!testResponse && isDev) {
      console.warn('PostHog endpoint not reachable, skipping initialization');
      return;
    }

    // Dynamic import with timeout
    const loadPostHog = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('PostHog load timeout')), 5000);

      import('posthog-js')
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    });

    const posthog = (await loadPostHog) as any;

    posthog.default.init(posthogKey, {
      api_host: posthogHost,
      loaded: () => {
        console.log('📊 PostHog initialized successfully');
      },
      capture_pageview: true,
      capture_pageleave: true,
      request_batching: true,
      session_recording: {
        maskAllInputs: true,
      },
    });

    return posthog.default;
  } catch (error) {
    if (isDev) {
      console.warn('Analytics initialization failed:', error);
    }
    // Fail silently in production
    return null;
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (globalThis.window === undefined) return;

  try {
    const posthog = (globalThis.window as any).posthog;
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  } catch (error) {
    if (PUBLIC_ENV.NODE_ENV === 'development') {
      console.warn('Event tracking failed:', error);
    }
  }
};
