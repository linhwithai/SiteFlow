'use client';

import { Calendar, Download, Eye, Image as ImageIcon, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { OptimizedImage } from '@/components/OptimizedImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Photo = {
  id: number;
  fileName: string;
  originalName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  tags?: string;
  createdAt: string;
  uploadedById: string;
  dailyLogId?: number;
};

type RecentPhotosOverviewProps = {
  photos: Photo[];
  onViewPhoto?: (photo: Photo) => void;
  onDownloadPhoto?: (photoId: number) => void;
  onDeletePhoto?: (photoId: number) => void;
  maxPhotos?: number;
  showActions?: boolean;
};

export function RecentPhotosOverview({
  photos,
  onViewPhoto,
  onDownloadPhoto,
  onDeletePhoto,
  maxPhotos = 6,
  showActions = true,
}: RecentPhotosOverviewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Sort photos by creation date (newest first) and limit
  const recentPhotos = photos
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxPhotos);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePhotoClick = (photo: Photo) => {
    if (onViewPhoto) {
      onViewPhoto(photo);
    } else {
      setSelectedPhoto(photo);
    }
  };

  const handleDownload = (e: React.MouseEvent, photoId: number) => {
    e.stopPropagation();
    onDownloadPhoto?.(photoId);
  };

  const handleDelete = (e: React.MouseEvent, photoId: number) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      onDeletePhoto?.(photoId);
    }
  };

  if (recentPhotos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Hình ảnh mới nhất
          </CardTitle>
          <CardDescription>
            Chưa có hình ảnh nào được upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <ImageIcon className="size-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              Upload ảnh để xem tiến độ dự án
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Hình ảnh mới nhất
          </CardTitle>
          <CardDescription>
            {recentPhotos.length}
            {' '}
            ảnh gần đây nhất từ công trường
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recentPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
                onClick={() => handlePhotoClick(photo)}
              >
                {/* Photo */}
                <div className="aspect-square overflow-hidden">
                  <OptimizedImage
                    src={photo.thumbnailUrl || photo.fileUrl || ''}
                    alt={photo.caption || photo.originalName || 'Project photo'}
                    width={200}
                    height={200}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>

                {/* Overlay with info */}
                <div className="absolute inset-0 bg-black bg-opacity-0 transition-all group-hover:bg-opacity-30">
                  {/* View icon on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg dark:bg-gray-800/90">
                      <Eye className="size-6 text-gray-700 dark:text-gray-300" />
                    </div>
                  </div>

                  {/* Photo info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {photo.caption || photo.originalName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-white/80">
                          <Calendar className="size-3" />
                          {formatDate(photo.createdAt)}
                        </div>
                      </div>

                      {/* Actions dropdown */}
                      {showActions && (onDownloadPhoto || onDeletePhoto) && (
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="size-6 p-0 text-white hover:bg-white/20"
                                onClick={e => e.stopPropagation()}
                              >
                                <MoreVertical className="size-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              {onDownloadPhoto && (
                                <DropdownMenuItem
                                  onClick={e => handleDownload(e, photo.id)}
                                  className="cursor-pointer"
                                >
                                  <Download className="mr-2 size-3" />
                                  Tải ảnh
                                </DropdownMenuItem>
                              )}
                              {onDeletePhoto && (
                                <DropdownMenuItem
                                  onClick={e => handleDelete(e, photo.id)}
                                  className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                >
                                  <Trash2 className="mr-2 size-3" />
                                  Xóa ảnh
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* New badge for very recent photos */}
                  {index < 2 && (
                    <div className="absolute right-2 top-2">
                      <Badge variant="secondary" className="text-xs">
                        Mới
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* View all photos link */}
          {photos.length > maxPhotos && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                Xem tất cả
                {' '}
                {photos.length}
                {' '}
                ảnh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo modal for viewing */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 z-10 bg-white/90 text-gray-700 hover:bg-white"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </Button>
            <OptimizedImage
              src={selectedPhoto.fileUrl || ''}
              alt={selectedPhoto.caption || selectedPhoto.originalName || 'Project photo'}
              width={800}
              height={600}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <h3 className="font-medium">{selectedPhoto.caption || selectedPhoto.originalName}</h3>
              <p className="text-sm text-white/80">
                {formatDate(selectedPhoto.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
