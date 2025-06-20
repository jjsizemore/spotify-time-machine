'use client';

import { useConsentManager } from '@c15t/nextjs';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export function ConsentAwareAnalytics() {
	const { hasConsented } = useConsentManager();
	const [isPostHogInitialized, setIsPostHogInitialized] = useState(false);

	// Check if user has provided any consent
	const hasAnalyticsConsent = hasConsented();

	// Initialize PostHog when consent is given
	useEffect(() => {
		if (
			hasAnalyticsConsent &&
			!isPostHogInitialized &&
			typeof window !== 'undefined'
		) {
			// Dynamically import and initialize PostHog only with consent
			import('posthog-js')
				.then((posthog) => {
					if (!posthog.default.has_opted_out_capturing()) {
						posthog.default.init(
							process.env.NEXT_PUBLIC_POSTHOG_KEY! as string,
							{
								api_host:
									process.env.NEXT_PUBLIC_POSTHOG_HOST ||
									'https://us.i.posthog.com',
								ui_host: 'https://us.posthog.com',
								capture_pageview: 'history_change',
								capture_pageleave: true, // Enable pageleave capture
								capture_exceptions: true, // Enable error tracking
								debug: process.env.NODE_ENV === 'development',
								opt_out_capturing_by_default: false, // Since we're only initializing with consent
							}
						);
						setIsPostHogInitialized(true);
					}
				})
				.catch((error) => {
					console.warn('Failed to initialize PostHog:', error);
				});
		}
	}, [hasAnalyticsConsent, isPostHogInitialized]);

	// Only render analytics if user has consented
	if (!hasAnalyticsConsent) {
		return null;
	}

	return (
		<>
			{/* Google Analytics 4 for Core Web Vitals */}
			<Script
				src="https://www.googletagmanager.com/gtag/js?id=G-CD6VHDL1HS"
				strategy="afterInteractive"
			/>
			<Script
				id="google-analytics"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', 'G-CD6VHDL1HS', {
						page_title: document.title,
						page_location: window.location.href,
						custom_map: {
							'custom_parameter_1': 'core_web_vitals'
						}
					});
				`,
				}}
			/>

			{/* Vercel Analytics - Only with consent */}
			<Analytics />
		</>
	);
}
