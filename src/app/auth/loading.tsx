import LoadingSpinner from '@/ui/LoadingSpinner';

export default function AuthLoading() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-spotify-black">
			<div className="text-center">
				<LoadingSpinner size="lg" />
				<p className="text-spotify-light-gray mt-4">
					Setting up authentication...
				</p>
			</div>
		</div>
	);
}
