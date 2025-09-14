'use client';

import { ChevronLeft, ChevronRight, Download, Eye, MoreVertical, RotateCw, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { OptimizedImage } from './OptimizedImage';

type Photo = {
  id: string;
  url: string;
  publicId: string;
  name: string;
  size: number;
  uploadedAt: Date;
  tags?: string[];
};

type PhotoGalleryProps = {
  photos: Photo[];
  onDelete?: (photoId: string) => Promise<void>;
  onDownload?: (photo: Photo) => Promise<void>;
  selectedPhotoId?: string | null;
  onPhotoSelected?: (photoId: string | null) => void;
  className?: string;
};

export function PhotoGallery({
  photos,
  onDelete,
  onDownload,
  selectedPhotoId,
  onPhotoSelected,
  className = '',
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Auto-select photo when selectedPhotoId changes
  useEffect(() => {
    if (selectedPhotoId && photos.length > 0) {
      const photo = photos.find(p => p.id === selectedPhotoId);
      if (photo) {
        setSelectedPhoto(photo);
        setCurrentIndex(photos.findIndex(p => p.id === selectedPhotoId));
        setZoomLevel(1);
        setRotation(0);
      }
    }
  }, [selectedPhotoId, photos]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Lightbox functions
  const openLightbox = useCallback((photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
    setZoomLevel(1);
    setRotation(0);
    onPhotoSelected?.(photo.id);
  }, [onPhotoSelected]);

  const closeLightbox = useCallback(() => {
    setSelectedPhoto(null);
    setZoomLevel(1);
    setRotation(0);
    onPhotoSelected?.(null);
  }, [onPhotoSelected]);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (photos.length > 0) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
      setCurrentIndex(newIndex);
      const newPhoto = photos[newIndex];
      if (newPhoto) {
        setSelectedPhoto(newPhoto);
      }
      setZoomLevel(1);
      setRotation(0);
    }
  }, [currentIndex, photos]);

  const goToNext = useCallback(() => {
    if (photos.length > 0) {
      const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
      const newPhoto = photos[newIndex];
      if (newPhoto) {
        setSelectedPhoto(newPhoto);
      }
      setZoomLevel(1);
      setRotation(0);
    }
  }, [currentIndex, photos]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement> | KeyboardEvent) => {
    if (!selectedPhoto) {
      return;
    }

    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
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
  }, [selectedPhoto, closeLightbox, goToPrevious, goToNext, handleZoomIn, handleZoomOut, handleRotate]);

  // Batch selection functions
  const togglePhotoSelection = useCallback((photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  }, []);

  const selectAllPhotos = useCallback(() => {
    setSelectedPhotos(new Set(photos.map(photo => photo.id)));
  }, [photos]);

  const clearSelection = useCallback(() => {
    setSelectedPhotos(new Set());
  }, []);

  // Batch actions
  const downloadSelectedPhotos = useCallback(async () => {
    if (!onDownload) {
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        Array.from(selectedPhotos).map((photoId) => {
          const photo = photos.find(p => p.id === photoId);
          if (photo) {
            return onDownload(photo);
          }
          return Promise.resolve();
        }),
      );
      clearSelection();
    } catch (error) {
      console.error('Error downloading photos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPhotos, onDownload, clearSelection, photos]);

  const deleteSelectedPhotos = useCallback(async () => {
    if (!onDelete) {
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        Array.from(selectedPhotos).map(photoId => onDelete(photoId)),
      );
      clearSelection();
    } catch (error) {
      console.error('Error deleting photos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPhotos, onDelete, clearSelection]);

  // Global keyboard event listener
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleGlobalKeyDown);
    }

    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedPhoto, handleKeyDown]);

  if (photos.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Eye className="size-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
          Chưa có ảnh nào
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Hãy upload ảnh đầu tiên để xem gallery
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Gallery Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Thư viện ảnh (
              {photos.length}
              )
            </h3>
            {selectedPhotos.size > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedPhotos.size}
                {' '}
                đã chọn
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isBatchMode
              ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBatchMode(true)}
                  >
                    Chọn nhiều
                  </Button>
                )
              : (
                  <div className="flex items-center gap-2">
                    {/* Select All - Only for small collections */}
                    {photos.length <= 10 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // eslint-disable-next-line no-alert
                          if (window.confirm(`Bạn có chắc chắn muốn chọn tất cả ${photos.length} ảnh?\n\nLưu ý: Hành động xóa sẽ ảnh hưởng đến tất cả ảnh đã chọn.`)) {
                            selectAllPhotos();
                          }
                        }}
                        disabled={selectedPhotos.size === photos.length}
                        className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
                      >
                        Chọn tất cả
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      disabled={selectedPhotos.size === 0}
                    >
                      Bỏ chọn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsBatchMode(false);
                        clearSelection();
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                )}
          </div>
        </div>

        {/* Batch Actions */}
        {isBatchMode && selectedPhotos.size > 0 && (
          <div className="space-y-3">
            {/* Warning Message */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-white">
                  !
                </div>
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Cảnh báo: Bạn đã chọn
                  {' '}
                  {selectedPhotos.size}
                  {' '}
                  ảnh. Hành động xóa không thể hoàn tác!
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Đã chọn
                {' '}
                {selectedPhotos.size}
                {' '}
                ảnh:
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadSelectedPhotos}
                disabled={isLoading || !onDownload}
                className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
              >
                <Download className="mr-1 size-4" />
                Tải
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const message = `⚠️ CẢNH BÁO ⚠️\n\nBạn sắp xóa ${selectedPhotos.size} ảnh vĩnh viễn!\n\nHành động này không thể hoàn tác.\n\nBạn có chắc chắn muốn tiếp tục?`;
                  // eslint-disable-next-line no-alert
                  if (window.confirm(message)) {
                    deleteSelectedPhotos();
                  }
                }}
                disabled={isLoading || !onDelete}
                className="text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
              >
                <Trash2 className="mr-1 size-4" />
                Xóa
              </Button>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          }}
        >
          {photos.map((photo, index) => {
            const isSelected = selectedPhotos.has(photo.id);
            return (
              <Card
                key={photo.id}
                className={`group overflow-hidden transition-all duration-200 ${
                  isSelected ? 'shadow-lg ring-2 ring-blue-500' : ''
                } ${isBatchMode ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (isBatchMode) {
                    togglePhotoSelection(photo.id);
                  } else {
                    openLightbox(photo, index);
                  }
                }}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <OptimizedImage
                      src={photo.url}
                      alt={photo.name}
                      className="size-full transition-transform group-hover:scale-105"
                      loading="lazy"
                      quality={85}
                      width={300}
                      height={300}
                    />

                    {/* Selection Checkbox */}
                    {isBatchMode && (
                      <div className="absolute left-2 top-2">
                        <div className={`flex size-6 items-center justify-center rounded border-2 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 bg-white'
                        }`}
                        >
                          {isSelected && (
                            <svg className="size-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Overlay - View Image Icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/30">
                      <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg dark:bg-gray-800/90">
                          <Eye className="size-6 text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="absolute right-2 top-2 flex flex-wrap gap-1">
                        {photo.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {photo.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +
                            {photo.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Photo Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white" title={photo.name}>
                          {photo.name}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatFileSize(photo.size)}</span>
                          <span>{formatDate(photo.uploadedAt)}</span>
                        </div>
                      </div>

                      {/* Action Menu - Safe Position */}
                      <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="size-8 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                              onClick={e => e.stopPropagation()}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {onDownload && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDownload(photo);
                                }}
                                className="cursor-pointer"
                              >
                                <Download className="mr-2 size-4" />
                                Tải ảnh
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // eslint-disable-next-line no-alert
                                  if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
                                    onDelete(photo.id);
                                  }
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Xóa ảnh
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <div
            className="relative flex size-full items-center justify-center"
            onKeyDown={handleKeyDown}
            onClick={closeLightbox}
            tabIndex={0}
            role="button"
            aria-label="Close photo viewer"
          >
            {/* Close Button */}
            <Button
              className="absolute right-4 top-4 z-10"
              variant="secondary"
              size="sm"
              onClick={closeLightbox}
            >
              <X className="size-4" />
            </Button>

            {/* Controls */}
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRotate}
                className="bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <RotateCw className="size-4" />
              </Button>
              <span className="rounded bg-black/50 px-2 text-sm text-white">
                {Math.round(zoomLevel * 100)}
                %
              </span>
            </div>

            {/* Action Buttons */}
            <div className="absolute right-16 top-4 z-10 flex items-center gap-2">
              {onDownload && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onDownload(selectedPhoto)}
                  className="bg-white/90 text-gray-700 hover:bg-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800"
                  title="Tải ảnh"
                >
                  <Download className="size-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
                      onDelete(selectedPhoto.id);
                      closeLightbox();
                    }
                  }}
                  className="bg-white/90 text-red-600 hover:bg-red-50 dark:bg-gray-800/90 dark:text-red-400 dark:hover:bg-red-900/30"
                  title="Xóa ảnh"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <Button
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  variant="secondary"
                  size="sm"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  variant="secondary"
                  size="sm"
                  onClick={goToNext}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </>
            )}

            {/* Image */}
            <div className="flex size-full items-center justify-center">
              <OptimizedImage
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                }}
                width={800}
                height={600}
              />
            </div>

            {/* Photo Counter */}
            {photos.length > 1 && (
              <div className="absolute left-1/2 top-4 -translate-x-1/2 text-sm text-white">
                {currentIndex + 1}
                {' '}
                /
                {photos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
