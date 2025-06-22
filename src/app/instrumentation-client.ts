// PostHog initialization with EEA-aware consent checking
// Only requires user consent for users in the European Economic Area

import posthog from 'posthog-js';

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

// Function to check consent from storage (since we can't use React hooks here)
function hasUserConsented(): boolean {
	if (typeof window === 'undefined') return false;

	try {
		// Check for c15t consent in localStorage
		const consentData = localStorage.getItem('c15t-consent-state');
		if (consentData) {
			const parsed = JSON.parse(consentData);
			// Check if user has given any consent (analytics, functional, etc.)
			const hasConsent = Object.values(parsed).some(
				(consent) => consent === true
			);
			if (process.env.NODE_ENV === 'development') {
				console.log(
					'🍪 Consent check (c15t):',
					hasConsent ? 'granted' : 'not granted'
				);
			}
			return hasConsent;
		}

		// Fallback: check for any existing consent indicators
		const hasAnalyticsGa = localStorage.getItem('ga-consent') === 'granted';
		const hasAnalyticsGeneral =
			localStorage.getItem('analytics-consent') === 'true';
		const fallbackConsent = hasAnalyticsGa || hasAnalyticsGeneral;

		if (process.env.NODE_ENV === 'development' && fallbackConsent) {
			console.log(
				'🍪 Consent check (fallback):',
				fallbackConsent ? 'granted' : 'not granted'
			);
		}

		return fallbackConsent;
	} catch (error) {
		console.warn('Error checking consent state:', error);
		return false;
	}
}

// Function to detect if user is in EEA
async function isEEAUser(): Promise<boolean> {
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
				console.log('🌍 PostHog: EEA user detected via timezone:', timezone);
			}
			return true;
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
						`🌍 PostHog: Location detected via IP: ${countryCode} (${isEEA ? 'EEA' : 'Non-EEA'})`
					);
				}
				return isEEA;
			} else {
				// If geolocation fails, assume non-EEA (default to loading analytics)
				if (process.env.NODE_ENV === 'development') {
					console.log(
						'🌍 PostHog: Geolocation API failed, assuming non-EEA user'
					);
				}
				return false;
			}
		} catch (geoError) {
			if (process.env.NODE_ENV === 'development') {
				console.debug(
					'🌍 PostHog: Geolocation failed, assuming non-EEA user:',
					geoError
				);
			}
			return false;
		}
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.debug(
				'🌍 PostHog: Location detection failed, assuming non-EEA user:',
				error
			);
		}
		return false;
	}
}

// Add visual dev indicator for PostHog
function addPostHogDevIndicator(userType: string) {
	if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
		// Remove existing indicator if present
		const existingIndicator = document.getElementById('posthog-dev-indicator');
		if (existingIndicator) {
			existingIndicator.remove();
		}

		// Add new indicator
		const indicator = document.createElement('div');
		indicator.id = 'posthog-dev-indicator';
		indicator.style.cssText = `
			position: fixed;
			top: 40px;
			right: 10px;
			background-color: #FF6B35;
			color: white;
			padding: 4px 8px;
			border-radius: 4px;
			font-size: 12px;
			z-index: 9999;
			font-family: monospace;
		`;
		indicator.textContent = '🔍 PostHog ON';
		indicator.title = `PostHog active: ${userType}`;
		document.body.appendChild(indicator);

		// Auto-remove after 10 seconds
		setTimeout(() => {
			const indicator = document.getElementById('posthog-dev-indicator');
			if (indicator) indicator.remove();
		}, 10000);
	}
}

// Initialize PostHog with EEA-aware consent checking
if (typeof window !== 'undefined') {
	if (process.env.NODE_ENV === 'development') {
		console.log('🔍 PostHog initialization starting...');
	}

	isEEAUser().then((userIsInEEA) => {
		let shouldInitialize = false;
		let userTypeReason = '';

		if (userIsInEEA) {
			// For EEA users, require explicit consent
			shouldInitialize = hasUserConsented();
			userTypeReason = shouldInitialize
				? 'EEA user with consent'
				: 'EEA user without consent';
			if (!shouldInitialize && process.env.NODE_ENV === 'development') {
				console.log('🚫 PostHog not initialized - EEA user without consent');
			}
		} else {
			// For non-EEA users, initialize by default
			shouldInitialize = true;
			userTypeReason = 'non-EEA user';
		}

		if (shouldInitialize && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
			posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
				api_host:
					process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
				ui_host: 'https://us.posthog.com',
				capture_pageview: 'history_change',
				capture_pageleave: true,
				capture_exceptions: true,
				debug: process.env.NODE_ENV === 'development',
				persistence: 'localStorage+cookie',
				opt_out_capturing_by_default: false,
			});

			if (process.env.NODE_ENV === 'development') {
				console.log(`🔍 PostHog initialized for ${userTypeReason}`);
				addPostHogDevIndicator(userTypeReason);
			}
		} else if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(
					'⚠️ PostHog not initialized - missing NEXT_PUBLIC_POSTHOG_KEY'
				);
			}
		}
	});

	// Listen for consent changes and initialize PostHog when consent is granted (for EEA users)
	window.addEventListener('storage', (event) => {
		if (event.key === 'c15t-consent-state' && !posthog.__loaded) {
			if (process.env.NODE_ENV === 'development') {
				console.log(
					'🍪 Consent change detected, checking if PostHog should initialize...'
				);
			}

			isEEAUser().then((userIsInEEA) => {
				if (userIsInEEA) {
					const newConsentGiven = hasUserConsented();
					if (newConsentGiven && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
						posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
							api_host:
								process.env.NEXT_PUBLIC_POSTHOG_HOST ||
								'https://us.i.posthog.com',
							ui_host: 'https://us.posthog.com',
							capture_pageview: 'history_change',
							capture_pageleave: true,
							capture_exceptions: true,
							debug: process.env.NODE_ENV === 'development',
							persistence: 'localStorage+cookie',
							opt_out_capturing_by_default: false,
						});

						const userTypeReason = 'EEA user with consent (post-consent)';
						if (process.env.NODE_ENV === 'development') {
							console.log(
								'🔍 PostHog initialized after EEA user granted consent'
							);
							addPostHogDevIndicator(userTypeReason);
						}
					}
				}
			});
		}
	});
}

// NOTE: PostHog is now initialized with EEA-aware consent checking
// This loads analytics by default for non-EEA users while still respecting
// GDPR requirements for EEA users who must provide explicit consent.
