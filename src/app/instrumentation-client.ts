// PostHog initialization moved to ConsentAwareAnalytics component to respect user consent
// This file is disabled to prevent unconditional tracking without user consent

// import posthog from 'posthog-js';

// posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY! as string, {
// 	api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
// 	ui_host: 'https://us.posthog.com',
// 	capture_pageview: 'history_change',
// 	capture_pageleave: true, // Enable pageleave capture
// 	capture_exceptions: true, // Enable error tracking
// 	debug: process.env.NODE_ENV === 'development',
// });

// NOTE: PostHog is now initialized conditionally in src/components/ConsentAwareAnalytics.tsx
// only after the user has given explicit consent for analytics tracking.
