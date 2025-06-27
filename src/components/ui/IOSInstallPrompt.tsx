'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiShare, FiX } from 'react-icons/fi';

export default function IOSInstallPrompt() {
	const [showPrompt, setShowPrompt] = useState(false);
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		// Detect iOS
		const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		setIsIOS(iOS);

		// Check if already installed (standalone mode)
		const standalone = window.matchMedia('(display-mode: standalone)').matches;
		setIsStandalone(standalone);

		// Show prompt for iOS users who haven't installed yet
		if (iOS && !standalone) {
			// Check if user has dismissed this before
			const dismissed = localStorage.getItem('ios-install-dismissed');
			const lastDismissed = dismissed ? parseInt(dismissed) : 0;
			const daysSinceDismissal =
				(Date.now() - lastDismissed) / (1000 * 60 * 60 * 24);

			// Show if never dismissed or it's been more than 7 days
			if (!dismissed || daysSinceDismissal > 7) {
				setTimeout(() => {
					setShowPrompt(true);
				}, 5000); // Show after 5 seconds
			}
		}
	}, []);

	const handleDismiss = () => {
		setShowPrompt(false);
		localStorage.setItem('ios-install-dismissed', Date.now().toString());
	};

	// Don't show if not iOS, already installed, or not prompted
	if (!isIOS || isStandalone || !showPrompt) {
		return null;
	}

	return (
		<div className="fixed bottom-4 left-4 right-4 bg-spotify-dark-gray border border-spotify-medium-gray rounded-lg shadow-2xl p-4 z-50 animate-slide-up">
			<div className="flex items-start gap-3">
				<div className="flex-shrink-0">
					<button
						onClick={handleDismiss}
						className="text-spotify-light-gray hover:text-spotify-white p-1 rounded transition-colors duration-200"
						aria-label="Dismiss install prompt"
					>
						<FiX size={20} />
					</button>
				</div>

				<div className="flex-1 min-w-0">
					<h3 className="text-spotify-white font-semibold text-sm mb-2">
						Install Spotify Time Machine
					</h3>
					<p className="text-spotify-light-gray text-xs mb-4">
						Add this app to your home screen for quick access and a native app
						experience.
					</p>

					<div className="space-y-3">
						<div className="flex items-center gap-3 text-xs">
							<div className="flex-shrink-0 w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center text-spotify-black font-bold">
								1
							</div>
							<div className="flex items-center gap-2 text-spotify-light-gray">
								<span>Tap the</span>
								<div className="inline-flex items-center gap-1 px-2 py-1 bg-spotify-medium-gray rounded border">
									<FiShare size={12} />
									<span className="text-xs">Share</span>
								</div>
								<span>button</span>
							</div>
						</div>

						<div className="flex items-center gap-3 text-xs">
							<div className="flex-shrink-0 w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center text-spotify-black font-bold">
								2
							</div>
							<div className="flex items-center gap-2 text-spotify-light-gray">
								<span>Select</span>
								<div className="inline-flex items-center gap-1 px-2 py-1 bg-spotify-medium-gray rounded border">
									<FiPlus size={12} />
									<span className="text-xs">Add to Home Screen</span>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-3 text-xs">
							<div className="flex-shrink-0 w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center text-spotify-black font-bold">
								3
							</div>
							<span className="text-spotify-light-gray">
								Tap "Add" to install
							</span>
						</div>
					</div>

					<div className="mt-4 pt-3 border-t border-spotify-medium-gray">
						<button
							onClick={handleDismiss}
							className="text-spotify-light-gray hover:text-spotify-white text-xs font-medium transition-colors duration-200"
						>
							Don't show this again
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
