'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, DownloadIcon, ZoomInIcon, ZoomOutIcon, RotateCwIcon } from 'lucide-react';
import { ProjectPhoto } from '@/types/DailyLog';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: ProjectPhoto[];
  initialIndex?: number;
  title?: string;
}

export function PhotoGalleryModal({ 
  isOpen, 
  onClose, 
  photos, 
  initialIndex = 0,
  title = 'Hình ảnh thi công'
}: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, initialIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        handleRotate();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handleDownload = () => {
    if (currentPhoto?.url) {
      const link = document.createElement('a');
      link.href = currentPhoto.url;
      link.download = currentPhoto.name || `photo-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">
            {title} ({currentIndex + 1}/{photos.length})
          </DialogTitle>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {title} ({currentIndex + 1}/{photos.length})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="flex items-center gap-2"
              >
                <ZoomOutIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="flex items-center gap-2"
              >
                <ZoomInIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="flex items-center gap-2"
              >
                <RotateCwIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <DownloadIcon className="size-4" />
                Tải xuống
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          {/* Main Image */}
          <div className="relative flex h-[60vh] items-center justify-center bg-black overflow-hidden">
            <img
              src={currentPhoto?.url}
              alt={currentPhoto?.caption || currentPhoto?.name || `Photo ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                cursor: zoom > 1 ? 'grab' : 'default'
              }}
            />

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </>
            )}
          </div>

          {/* Photo Info */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {(currentPhoto?.caption || currentPhoto?.name) && (
                  <>
                    <p className="text-sm text-gray-700">
                      <strong>Tên file:</strong> {currentPhoto?.name}
                    </p>
                    {currentPhoto?.caption && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Mô tả:</strong> {currentPhoto.caption}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Zoom: {Math.round(zoom * 100)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Phím tắt: ← → (điều hướng), +/- (zoom), R (xoay), Esc (đóng)
                </p>
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {photos.length > 1 && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      index === currentIndex
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.name}
                      className="size-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
