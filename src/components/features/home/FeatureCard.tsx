import ActionButton from '@/ui/ActionButton';
import Link from 'next/link';

interface FeatureCardProps {
	title: string;
	description: string;
	buttonText: string;
	href: string;
	className?: string;
}

export default function FeatureCard({
	title,
	description,
	buttonText,
	href,
	className = '',
}: FeatureCardProps) {
	return (
		<div
			className={`bg-spotify-dark-gray p-6 rounded-lg hover:bg-spotify-dark-gray/80 transition h-full ${className}`}
		>
			<h2 className="text-2xl font-bold text-spotify-green mb-4">{title}</h2>
			<p className="text-spotify-light-gray mb-4">{description}</p>
			<Link href={href}>
				<ActionButton variant="primary">{buttonText}</ActionButton>
			</Link>
		</div>
	);
}
