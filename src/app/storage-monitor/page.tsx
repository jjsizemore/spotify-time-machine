'use client';

import Breadcrumb from '@/components/Breadcrumb';
import PageContainer from '@/components/PageContainer';
import StorageMonitor from '@/components/StorageMonitor';
import { generateWebApplicationSchema } from '@/lib/seo';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import React from 'react';

export default function StorageMonitorPage() {
	const { status } = useSession();

	// Generate structured data for the storage monitor page
	const storageMonitorSchema = generateWebApplicationSchema({
		'@type': 'WebPage',
		name: 'Storage Monitor - Spotify Time Machine',
		description:
			'Monitor your browser storage usage and manage cache for your Spotify Time Machine app. View storage quotas, clear cache, and request persistent storage.',
		mainEntity: {
			'@type': 'SoftwareApplication',
			name: 'Storage Monitor',
			description:
				'Browser storage management tool for monitoring cache usage and storage quotas',
			featureList: [
				'Storage quota monitoring',
				'Cache usage tracking',
				'Persistent storage management',
				'Storage information display',
				'Cache clearing functionality',
			],
		},
	});

	return (
		<PageContainer
			isLoading={status === 'loading'}
			maxWidth="4xl"
			className="min-h-screen pb-20"
		>
			{/* SEO-optimized heading structure */}
			<header className="mb-8">
				<h1 className="sr-only">
					Storage Monitor - Manage Your App's Storage Usage
				</h1>
				<Breadcrumb
					items={[
						{ name: 'Home', url: '/dashboard' },
						{ name: 'Storage Monitor', url: '/storage-monitor' },
					]}
				/>
			</header>

			{/* Structured Data */}
			<Script
				id="storage-monitor-structured-data"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(storageMonitorSchema),
				}}
			/>

			<div className="flex flex-col gap-8">
				{/* Page Header */}
				<div className="text-center space-y-4 mt-12">
					<h2 className="text-3xl font-bold text-spotify-white">
						Storage Monitor
					</h2>
					<p className="text-spotify-light-gray max-w-2xl mx-auto">
						Monitor your browser storage usage, track cache size, and manage
						storage settings for optimal performance of your Spotify Time
						Machine app.
					</p>
				</div>

				{/* Storage Monitor Component */}
				<div className="max-w-2xl mx-auto">
					<StorageMonitor />
				</div>

				{/* Information Section */}
				<div className="max-w-4xl mx-auto mt-12">
					<div className="bg-spotify-gray rounded-lg p-6 space-y-4 border border-spotify-medium-gray">
						<h3 className="text-xl font-semibold text-spotify-white mb-4 text-center">
							About Storage Management
						</h3>

						<div className="grid md:grid-cols-2 gap-12 text-sm text-spotify-light-gray">
							<div>
								<h4 className="font-semibold text-spotify-white mb-2">
									💾 Storage Types
								</h4>
								<ul className="space-y-1">
									<li>
										• <strong>localStorage:</strong> Up to 10MB for small data
									</li>
									<li>
										• <strong>IndexedDB:</strong> Up to 60% of disk space for
										large datasets
									</li>
									<li>
										• <strong>Cache API:</strong> For offline functionality
									</li>
								</ul>
							</div>

							<div>
								<h4 className="font-semibold text-spotify-white mb-2">
									🔒 Persistent Storage
								</h4>
								<ul className="space-y-1">
									<li>• Prevents automatic data eviction</li>
									<li>• Protects your music history cache</li>
									<li>• Improves offline experience</li>
								</ul>
							</div>

							<div>
								<h4 className="font-semibold text-spotify-white mb-2">
									⚡ Performance Tips
								</h4>
								<ul className="space-y-1">
									<li>• Clear cache when experiencing issues</li>
									<li>• Monitor storage usage regularly</li>
									<li>• Enable persistent storage for reliability</li>
								</ul>
							</div>

							<div>
								<h4 className="font-semibold text-spotify-white mb-2">
									🎵 Cached Data
								</h4>
								<ul className="space-y-1">
									<li>• Your liked tracks and playlists</li>
									<li>• Artist information and images</li>
									<li>• Album metadata and covers</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
