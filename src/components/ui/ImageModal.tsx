import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

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

export const ImageModal = ({
	selectedImage,
	isLoading,
	onClose,
	onImageLoad,
}: ImageModalProps) => {
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
				const focusableElements =
					modalRef.current.querySelectorAll<HTMLElement>(
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
			className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2 sm:p-4"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div
				className="relative bg-white rounded-lg shadow-2xl max-w-full max-h-full flex flex-col items-center overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Image container - mobile optimized */}
				<div
					className={`relative transition-all duration-300 ease-in-out w-full
						${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
						fixed inset-0 bg-black z-[110] flex items-center justify-center
					`}
					style={{
						width: '100vw',
						height: '100vh',
					}}
				>
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
							<div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-white"></div>
						</div>
					)}

					{/* Close button for fullscreen mode on mobile */}
					<button
						onClick={onClose}
						aria-label="Close fullscreen"
						className="absolute top-4 right-8 z-20 text-white hover:text-gray-300 p-3 bg-black/50 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center"
					>
						<FiX size={24} />
					</button>

					<div className={`relative w-full h-full max-w-full max-h-full`}>
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
					</div>
				</div>
			</div>
		</div>
	);
};
