import ActionButton from '@/ui/ActionButton';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-spotify-black flex items-center justify-center px-4">
			<div className="text-center max-w-md">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-spotify-white mb-4">404</h1>
					<h2 className="text-2xl font-bold text-spotify-green mb-4">
						Page Not Found
					</h2>
					<p className="text-spotify-light-gray mb-6">
						The page you're looking for doesn't exist or has been moved. Let's
						get you back to your music journey!
					</p>
				</div>

				<div className="space-y-4">
					<Link href="/dashboard">
						<ActionButton variant="primary">Go Home</ActionButton>
					</Link>
				</div>
			</div>
		</div>
	);
}
