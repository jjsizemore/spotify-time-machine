'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageModal } from '@/ui/ImageModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handlePreviewClick = () => {
    setIsImageLoading(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsImageLoading(true);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Create gallery image object for the modal
  const galleryImage = {
    id: 1, // Single image, so ID can be static
    title: title,
    description: description,
    src: previewUrl, // Use the preview URL as the full-size image source
  };

  return (
    <div
      className={`w-full flex flex-col md:flex-row items-stretch justify-center gap-8 ${
        reverseLayout ? 'md:flex-row-reverse' : ''
      }`}
    >
      {/* Image Side */}
      <button
        type="button"
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
      </button>
      {/* Text Side */}
      <div className="basis-full w-full md:basis-2/3 md:w-2/3 flex flex-col justify-center py-4 md:py-0 md:pl-8">
        {' '}
        {/* Added md:pl-8 for spacing when text is wider */}
        <h2 className="text-2xl font-bold text-spotify-white mb-4">{title}</h2>
        <p className="text-spotify-light-gray mb-4">{description}</p>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <ImageModal
          selectedImage={galleryImage}
          isLoading={isImageLoading}
          onClose={handleCloseModal}
          onImageLoad={handleImageLoad}
        />
      )}
    </div>
  );
};

export default FeatureShowcaseItem;
