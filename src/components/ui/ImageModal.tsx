import Image from 'next/image';
import { Suspense, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';

type GalleryImage = {
  id: number;
  title: string;
  description: string;
  src: string;
};

type ImageModalProps = {
  selectedImage: GalleryImage;
  isLoading: boolean;
  onClose: () => void;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
};

export const ImageModal = ({ selectedImage, isLoading, onClose, onImageLoad }: ImageModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedImage) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedImage, onClose]);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-spotify-black/90 flex items-center justify-center z-[100] p-2 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative bg-spotify-dark-gray rounded-lg shadow-2xl max-w-full max-h-full flex flex-col items-center overflow-hidden border border-spotify-medium-gray"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image container - mobile optimized */}
        <div
          className={`relative transition-all duration-300 ease-in-out w-full
						${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
						fixed inset-0 bg-spotify-black z-[110] flex items-center justify-center
					`}
          style={{
            width: '100vw',
            height: '100vh',
          }}
        >
          {/* Loading Spinner with Suspense */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-spotify-black/60 z-[115]">
              <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-spotify-light-gray text-sm">Loading image...</p>
              </div>
            </div>
          )}

          {/* Close button for fullscreen mode */}
          <button
            onClick={onClose}
            aria-label="Close fullscreen"
            className="absolute top-4 right-8 z-[120] text-spotify-light-gray hover:text-spotify-white p-3 bg-spotify-dark-gray/80 hover:bg-spotify-medium-gray/80 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors duration-200 border border-spotify-medium-gray"
          >
            <FiX size={24} />
          </button>

          {/* Image with Suspense boundary */}
          <div className={`relative w-full h-full max-w-full max-h-full`}>
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-spotify-black z-[116]">
                  <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-spotify-light-gray text-sm">Loading image...</p>
                  </div>
                </div>
              }
            >
              <Image
                src={selectedImage.src}
                alt={selectedImage.title}
                fill
                sizes="100vw"
                className={`object-contain ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                } transition-opacity duration-300`}
                onLoad={onImageLoad}
                priority
              />
            </Suspense>
          </div>

          {/* Image title and description overlay */}
          {!isLoading && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-spotify-black via-spotify-black/85 to-transparent backdrop-blur-sm border-t border-spotify-medium-gray/30 p-6 z-[118]">
              <div className="bg-spotify-dark-gray/80 backdrop-blur-md rounded-lg p-4 border border-spotify-medium-gray/40">
                <h2
                  className="text-spotify-white text-xl font-bold mb-2 drop-shadow-lg"
                  id="modal-title"
                  style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                >
                  {selectedImage.title}
                </h2>
                <p
                  className="text-spotify-light-gray text-sm drop-shadow-md"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                >
                  {selectedImage.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
