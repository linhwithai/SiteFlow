'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  quality?: number;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
};

export function OptimizedImage({
  src,
  alt,
  className = '',
  style,
  onClick,
  loading = 'lazy',
  quality = 80,
  width,
  height,
  placeholder,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading !== 'lazy' || !imgRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      },
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [loading]);

  // Generate optimized image URL with Cloudinary transformations
  const getOptimizedSrc = (originalSrc: string) => {
    if (!isInView) {
      return placeholder || '';
    }

    // Check if originalSrc is valid
    if (!originalSrc || typeof originalSrc !== 'string') {
      return placeholder || '';
    }

    // If it's a Cloudinary URL, add transformations
    if (originalSrc.includes('cloudinary.com')) {
      const baseUrl = originalSrc.split('/upload/')[0];
      const publicId = originalSrc.split('/upload/')[1];

      const transformations = [
        `q_${quality}`,
        'f_auto',
        'c_limit',
        width ? `w_${width}` : '',
        height ? `h_${height}` : '',
      ].filter(Boolean).join(',');

      return `${baseUrl}/upload/${transformations}/${publicId}`;
    }

    return originalSrc;
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onClick={onClick}
    >
      {/* Loading State */}
      {isLoading && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800">
          <AlertCircle className="mb-2 size-8" />
          <span className="text-sm">Lỗi tải ảnh</span>
        </div>
      )}

      {/* Image */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`size-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          width={width}
          height={height}
        />
      )}

      {/* Placeholder */}
      {!isInView && placeholder && (
        <div
          className="size-full bg-gray-200 bg-cover bg-center dark:bg-gray-700"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
    </div>
  );
}

// Hook for generating responsive image URLs
export function useResponsiveImage(
  src: string,
  sizes: { mobile: number; tablet: number; desktop: number } = {
    mobile: 400,
    tablet: 600,
    desktop: 800,
  },
) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    const updateSrc = () => {
      if (!src || typeof src !== 'string' || !src.includes('cloudinary.com')) {
        setCurrentSrc(src);
        return;
      }

      const width = window.innerWidth;
      let targetWidth = sizes.desktop;

      if (width < 768) {
        targetWidth = sizes.mobile;
      } else if (width < 1024) {
        targetWidth = sizes.tablet;
      }

      const baseUrl = src.split('/upload/')[0];
      const publicId = src.split('/upload/')[1];

      const transformations = [
        `q_80`,
        'f_auto',
        'c_limit',
        `w_${targetWidth}`,
      ].join(',');

      setCurrentSrc(`${baseUrl}/upload/${transformations}/${publicId}`);
    };

    updateSrc();
    window.addEventListener('resize', updateSrc);
    return () => window.removeEventListener('resize', updateSrc);
  }, [src, sizes]);

  return currentSrc;
}
