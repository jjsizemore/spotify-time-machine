'use client';

import Image from 'next/image';

interface FeatureShowcaseItemProps {
	title: string;
	description: string;
	imageUrl: string;
	imageAlt: string;
	imageWidth: number;
	imageHeight: number;
	previewUrl: string;
	reverseLayout?: boolean;
}

const FeatureShowcaseItem: React.FC<FeatureShowcaseItemProps> = ({
	title,
	description,
	imageUrl,
	imageAlt,
	imageWidth,
	imageHeight,
	previewUrl,
	reverseLayout = false,
}) => {
	const handlePreviewClick = () => {
		window.open(previewUrl, '_blank');
	};

	return (
		<div
			className={`w-full flex flex-col md:flex-row items-stretch justify-center gap-8 ${
				reverseLayout ? 'md:flex-row-reverse' : ''
			}`}
		>
			{/* Image Side */}
			<div
				className="basis-full w-full md:basis-1/3 md:w-1/3 flex items-center justify-center bg-spotify-dark-gray rounded-lg p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200"
				onClick={handlePreviewClick}
			>
				<Image
					src={imageUrl}
					alt={imageAlt}
					width={imageWidth}
					height={imageHeight}
					className="rounded-lg w-full h-auto"
					priority={false} // Assuming these are not LCP images
				/>
			</div>
			{/* Text Side */}
			<div className="basis-full w-full md:basis-2/3 md:w-2/3 flex flex-col justify-center py-4 md:py-0 md:pl-8">
				{' '}
				{/* Added md:pl-8 for spacing when text is wider */}
				<h2 className="text-2xl font-bold text-spotify-white mb-4">{title}</h2>
				<p className="text-spotify-light-gray mb-4">{description}</p>
			</div>
		</div>
	);
};

export default FeatureShowcaseItem;
