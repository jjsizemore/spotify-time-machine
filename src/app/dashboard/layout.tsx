import { generateEnhancedMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateEnhancedMetadata({
	title: 'Dashboard',
	description:
		'View your personalized Spotify listening statistics, including top artists, tracks, and genres. Analyze your music trends and discover insights about your listening habits with interactive visualizations.',
	path: '/dashboard',
	image: '/previews/dashboard-preview.jpeg',
	tags: [
		'Spotify dashboard',
		'music analytics',
		'listening statistics',
		'top artists',
		'top tracks',
		'music visualization',
	],
});

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
