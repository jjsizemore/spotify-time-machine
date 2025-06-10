import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
	return (
		<div className="min-h-screen bg-spotify-black flex items-center justify-center">
			<div className="text-center">
				<LoadingSpinner size="lg" />
				<p className="text-spotify-light-gray mt-4">
					Loading your music journey...
				</p>
			</div>
		</div>
	);
}
