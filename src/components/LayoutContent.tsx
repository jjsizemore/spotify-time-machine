'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import KeyboardShortcuts from './KeyboardShortcuts';
import Header from './Header';
import Footer from './Footer';

export function LayoutContent({ children }: { children: React.ReactNode }) {
	const { status } = useSession();
	const pathname = usePathname();

	// Don't show navigation on landing page or signin page
	const isAuthPage = pathname === '/' || pathname === '/auth/signin';
	const isAuthenticated = status === 'authenticated';

	// Only show Header and Footer if user is authenticated
	const showNavigation = isAuthenticated && !isAuthPage;

	return (
		<div className="flex flex-col min-h-screen">
			{showNavigation && <Header />}

			<main className="flex-grow">
				{children}
			</main>

			{showNavigation && <Footer />}
			{showNavigation && <KeyboardShortcuts />}
		</div>
	);
}