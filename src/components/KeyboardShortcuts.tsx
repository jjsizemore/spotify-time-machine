'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function KeyboardShortcuts() {
	const router = useRouter();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Skip if user is typing in an input field
			if (
				document.activeElement?.tagName === 'INPUT' ||
				document.activeElement?.tagName === 'TEXTAREA' ||
				document.activeElement?.getAttribute('contenteditable') === 'true'
			) {
				return;
			}

			// Check for Alt/Option key combinations
			if (e.altKey) {
				switch (e.key) {
					case 'd': // Alt+D - Dashboard
						e.preventDefault();
						router.push('/dashboard');
						break;
					case 'h': // Alt+H - History
						e.preventDefault();
						router.push('/history');
						break;
					case 'p': // Alt+P - Playlist Generator
						e.preventDefault();
						router.push('/playlist-generator');
						break;
					default:
						break;
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [router]);

	return null; // This component doesn't render anything
}
