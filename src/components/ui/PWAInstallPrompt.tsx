'use client';

import { useEffect, useState } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showInstallPrompt, setShowInstallPrompt] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		// Check if app is already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			setIsInstalled(true);
			return;
		}

		// Listen for beforeinstallprompt event
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);

			// Show install prompt after a delay (better UX)
			setTimeout(() => {
				setShowInstallPrompt(true);
			}, 3000);
		};

		// Listen for app installed event
		const handleAppInstalled = () => {
			setIsInstalled(true);
			setShowInstallPrompt(false);
			setDeferredPrompt(null);
			console.log('PWA was installed');
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener(
				'beforeinstallprompt',
				handleBeforeInstallPrompt
			);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		// Show the install prompt
		await deferredPrompt.prompt();

		// Wait for the user to respond
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			console.log('User accepted the install prompt');
		} else {
			console.log('User dismissed the install prompt');
		}

		// Clear the saved prompt
		setDeferredPrompt(null);
		setShowInstallPrompt(false);
	};

	const handleDismiss = () => {
		setShowInstallPrompt(false);
		// Don't show again for this session
		sessionStorage.setItem('pwa-install-dismissed', 'true');
	};

	// Don't show if already installed or dismissed this session
	if (isInstalled || !showInstallPrompt || !deferredPrompt) {
		return null;
	}

	// Check if dismissed this session
	if (sessionStorage.getItem('pwa-install-dismissed')) {
		return null;
	}

	return (
		<div className="fixed bottom-4 right-4 bg-spotify-dark-gray border border-spotify-medium-gray rounded-lg shadow-2xl p-4 max-w-sm z-50 animate-slide-up">
			<div className="flex items-start gap-3">
				<div className="flex-shrink-0 w-10 h-10 bg-spotify-green rounded-lg flex items-center justify-center">
					<FiDownload className="text-spotify-black" size={20} />
				</div>

				<div className="flex-1 min-w-0">
					<h3 className="text-spotify-white font-semibold text-sm mb-1">
						Install Spotify Time Machine
					</h3>
					<p className="text-spotify-light-gray text-xs mb-3">
						Add to your home screen for quick access and a native app
						experience.
					</p>

					<div className="flex gap-2">
						<button
							onClick={handleInstallClick}
							className="bg-spotify-green hover:bg-spotify-green/90 text-spotify-black text-xs font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
						>
							Install
						</button>
						<button
							onClick={handleDismiss}
							className="text-spotify-light-gray hover:text-spotify-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
						>
							Maybe Later
						</button>
					</div>
				</div>

				<button
					onClick={handleDismiss}
					className="flex-shrink-0 text-spotify-light-gray hover:text-spotify-white p-1 rounded transition-colors duration-200"
					aria-label="Dismiss install prompt"
				>
					<FiX size={16} />
				</button>
			</div>
		</div>
	);
}
