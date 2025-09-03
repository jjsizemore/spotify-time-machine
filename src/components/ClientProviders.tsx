import { ConsentAwareAnalytics } from '@/components/analytics/ConsentAwareAnalytics';
import {
	ConsentManagerDialog,
	ConsentManagerProvider,
	CookieBanner,
} from '@c15t/nextjs';
// Server Component wrapper for global client+server capable providers.
// Moved from a client component to a server component because @c15t/nextjs
// calls Next.js request APIs (e.g. headers()) which are only valid in a
// server/request scope. Rendering the consent provider on the server avoids
// the runtime error: "headers was called outside a request scope".
import React from 'react';

interface Props {
	children: React.ReactNode;
}

export default function ClientProviders({ children }: Props) {
	return (
		<ConsentManagerProvider
			options={{
				mode: 'c15t',
				backendURL: '/api/c15t',
			}}
		>
			{children}
			{/* Client components consuming consent context */}
			<ConsentAwareAnalytics />
			<CookieBanner />
			<ConsentManagerDialog />
		</ConsentManagerProvider>
	);
}
