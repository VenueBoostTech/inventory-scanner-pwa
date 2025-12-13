import { useState } from 'react';
import { Package } from 'lucide-react';

interface GalleryImage {
  id: string;
  imagePath: string;
  imageThumbnailPath?: string;
  sortOrder: number;
}

interface ProductGalleryProps {
  mainImage: string | null;
  gallery: GalleryImage[];
  title: string;
}

export function ProductGallery({ mainImage, gallery, title }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine main image with gallery images
  const allImages = [
    ...(mainImage ? [{ id: 'main', imagePath: mainImage, sortOrder: 0 }] : []),
    ...gallery,
  ].sort((a, b) => a.sortOrder - b.sortOrder);

  if (allImages.length === 0) {
    return (
      <div className="relative w-full aspect-square overflow-hidden rounded-lg border border-border bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="rounded-lg bg-muted-foreground/10 p-2">
              <Package className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="h-0.5 w-10 rounded-full bg-muted-foreground/15" />
          </div>
        </div>
      </div>
    );
  }

  const currentImage = allImages[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full">
      <div className="relative w-full aspect-square overflow-hidden rounded-lg border border-border bg-muted/60">
        {currentImage.imagePath ? (
          <img
            src={currentImage.imagePath}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="h-full w-full object-cover"
            loading={currentIndex === 0 ? "eager" : "lazy"}
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Navigation arrows - only show if more than 1 image */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Swipe hint text */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/30 px-2 py-1 rounded">
            ← swipe for gallery →
          </div>
        )}
      </div>

      {/* Dot indicators */}
      {allImages.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-foreground'
                  : 'w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
