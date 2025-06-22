'use client';

import { useConsentManager } from '@c15t/nextjs';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';
import { useEffect, useState } from 'react';

// List of EEA country codes (EU + Iceland, Liechtenstein, Norway)
const EEA_COUNTRIES = [
	'AT',
	'BE',
	'BG',
	'HR',
	'CY',
	'CZ',
	'DK',
	'EE',
	'FI',
	'FR',
	'DE',
	'GR',
	'HU',
	'IE',
	'IT',
	'LV',
	'LT',
	'LU',
	'MT',
	'NL',
	'PL',
	'PT',
	'RO',
	'SK',
	'SI',
	'ES',
	'SE',
	'IS',
	'LI',
	'NO',
];

function useUserLocation() {
	const [isEEAUser, setIsEEAUser] = useState<boolean | null>(null);

	useEffect(() => {
		async function detectUserLocation() {
			try {
				// Try to get user's country from their timezone first
				const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

				// Common EEA timezones (quick check)
				const eeaTimezones = [
					'Europe/Amsterdam',
					'Europe/Athens',
					'Europe/Berlin',
					'Europe/Brussels',
					'Europe/Budapest',
					'Europe/Copenhagen',
					'Europe/Dublin',
					'Europe/Helsinki',
					'Europe/Lisbon',
					'Europe/London',
					'Europe/Luxembourg',
					'Europe/Madrid',
					'Europe/Oslo',
					'Europe/Paris',
					'Europe/Prague',
					'Europe/Rome',
					'Europe/Stockholm',
					'Europe/Vienna',
					'Europe/Warsaw',
					'Europe/Zurich',
					'Atlantic/Reykjavik',
				];

				if (eeaTimezones.some((tz) => timezone.includes(tz.split('/')[1]))) {
					if (process.env.NODE_ENV === 'development') {
						console.log('🌍 EEA user detected via timezone:', timezone);
					}
					setIsEEAUser(true);
					return;
				}

				// If timezone doesn't indicate EEA, try IP-based geolocation
				try {
					const response = await fetch('https://ipapi.co/json/', {
						signal: AbortSignal.timeout(3000), // 3 second timeout
					});

					if (response.ok) {
						const data = await response.json();
						const countryCode = data.country_code;
						const isEEA = EEA_COUNTRIES.includes(countryCode);
						if (process.env.NODE_ENV === 'development') {
							console.log(
								`🌍 Location detected via IP: ${countryCode} (${isEEA ? 'EEA' : 'Non-EEA'})`
							);
						}
						setIsEEAUser(isEEA);
					} else {
						// If geolocation fails, assume non-EEA (default to loading analytics)
						if (process.env.NODE_ENV === 'development') {
							console.log('🌍 Geolocation API failed, assuming non-EEA user');
						}
						setIsEEAUser(false);
					}
				} catch (geoError) {
					if (process.env.NODE_ENV === 'development') {
						console.debug(
							'🌍 Geolocation failed, assuming non-EEA user:',
							geoError
						);
					}
					setIsEEAUser(false);
				}
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.debug(
						'🌍 Location detection failed, assuming non-EEA user:',
						error
					);
				}
				setIsEEAUser(false);
			}
		}

		detectUserLocation();
	}, []);

	return isEEAUser;
}

export function ConsentAwareAnalytics() {
	const { hasConsented } = useConsentManager();
	const isEEAUser = useUserLocation();
	const [analyticsLoaded, setAnalyticsLoaded] = useState(false);

	// Still loading location detection
	if (isEEAUser === null) {
		if (process.env.NODE_ENV === 'development') {
			console.log('📊 Analytics blocked - detecting user location...');
		}
		return null; // Don't load analytics until we know user's location
	}

	// For EEA users, require explicit consent
	if (isEEAUser) {
		const hasAnalyticsConsent = hasConsented();
		if (!hasAnalyticsConsent) {
			if (process.env.NODE_ENV === 'development') {
				console.log('📊 Analytics blocked - EEA user without consent');
			}
			return null;
		}
	}

	// Analytics should load - log this in development
	if (process.env.NODE_ENV === 'development' && !analyticsLoaded) {
		const reason = isEEAUser ? 'EEA user with consent' : 'non-EEA user';
		console.log(`📊 Analytics loading for ${reason}`);
		setAnalyticsLoaded(true);
	}

	// For non-EEA users, load analytics by default
	// For EEA users who have consented, also load analytics
	return (
		<>
			{/* Development indicator */}
			{process.env.NODE_ENV === 'development' && (
				<div
					style={{
						position: 'fixed',
						top: '10px',
						right: '10px',
						backgroundColor: '#1DB954',
						color: 'white',
						padding: '4px 8px',
						borderRadius: '4px',
						fontSize: '12px',
						zIndex: 9999,
						fontFamily: 'monospace',
					}}
					title={`Analytics active: ${isEEAUser ? 'EEA user with consent' : 'Non-EEA user'}`}
				>
					📊 Analytics ON
				</div>
			)}

			{/* Google Analytics 4 for Core Web Vitals */}
			<Script
				src="https://www.googletagmanager.com/gtag/js?id=G-CD6VHDL1HS"
				strategy="afterInteractive"
				onLoad={() => {
					if (process.env.NODE_ENV === 'development') {
						console.log('📊 Google Analytics script loaded');
					}
				}}
			/>
			<Script
				id="google-analytics"
				strategy="afterInteractive"
				onLoad={() => {
					if (process.env.NODE_ENV === 'development') {
						console.log('📊 Google Analytics initialized');
					}
				}}
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
					${process.env.NODE_ENV === 'development' ? 'console.log("📊 Google Analytics config executed");' : ''}
				`,
				}}
			/>

			{/* Vercel Analytics */}
			<Analytics
				beforeSend={(event) => {
					if (process.env.NODE_ENV === 'development') {
						console.log('📊 Vercel Analytics event:', event.type);
					}
					return event;
				}}
			/>
		</>
	);
}
