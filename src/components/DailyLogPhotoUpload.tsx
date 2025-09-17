'use client';

import { Camera, ImageIcon, Loader2, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectPhoto } from '@/types/DailyLog';

type DailyLogPhotoUploadProps = {
  photos: ProjectPhoto[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
  onUpdateCaption: (photoId: string, caption: string) => Promise<void>;
  isLoading?: boolean;
  maxPhotos?: number;
  disabled?: boolean;
};

export function DailyLogPhotoUpload({
  photos,
  onUpload,
  onDelete,
  onUpdateCaption,
  isLoading = false,
  maxPhotos = 10,
  disabled = false,
}: DailyLogPhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  }, [onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  }, [onUpload]);

  const startEditingCaption = (photo: ProjectPhoto) => {
    setEditingCaption(photo.id);
    setCaptionValue(photo.caption || '');
  };

  const saveCaption = async (photoId: string) => {
    await onUpdateCaption(photoId, captionValue);
    setEditingCaption(null);
    setCaptionValue('');
  };

  const cancelEditing = () => {
    setEditingCaption(null);
    setCaptionValue('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={disabled ? undefined : handleDrag}
        onDragLeave={disabled ? undefined : handleDrag}
        onDragOver={disabled ? undefined : handleDrag}
        onDrop={disabled ? undefined : handleDrop}
      >
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100">
            {isLoading
              ? (
                  <Loader2 className="size-6 animate-spin text-gray-600" />
                )
              : (
                  <Camera className="size-6 text-gray-600" />
                )}
          </div>
          <div className="mt-4">
            <Label htmlFor="photo-upload" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {disabled 
                  ? 'Tải lên ảnh sau khi lưu nhật ký'
                  : isLoading 
                    ? 'Đang tải lên...' 
                    : 'Kéo thả ảnh vào đây hoặc nhấp để chọn'
                }
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                {disabled ? 'Chức năng sẽ khả dụng sau khi lưu nhật ký' : 'PNG, JPG, GIF lên đến 10MB'}
              </span>
            </Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled || isLoading || photos.length >= maxPhotos}
            />
          </div>
          {photos.length >= maxPhotos && (
            <p className="mt-2 text-sm text-red-600">
              Đã đạt giới hạn tối đa
              {' '}
              {maxPhotos}
              {' '}
              ảnh
            </p>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Ảnh đã tải lên (
              {photos.length}
              )
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {photos.map(photo => (
              <Card key={photo.id} className="group relative overflow-hidden">
                <CardContent className="p-0">
                  {/* Photo */}
                  <div className="relative aspect-square">
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.name}
                      className="size-full object-cover"
                    />

                    {/* Overlay Actions */}
                    {!disabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-50">
                        <div className="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(photo.id)}
                            className="size-8 p-0"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photo Info */}
                  <div className="space-y-2 p-3">
                    <div className="truncate text-xs text-gray-500">
                      {photo.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatFileSize(photo.size)}
                    </div>

                    {/* Caption */}
                    <div className="space-y-1">
                      {editingCaption === photo.id
                        ? (
                            <div className="space-y-2">
                              <Textarea
                                value={captionValue}
                                onChange={e => setCaptionValue(e.target.value)}
                                placeholder="Thêm mô tả cho ảnh..."
                                className="min-h-[60px] text-xs"
                                rows={2}
                                disabled={disabled}
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => saveCaption(photo.id)}
                                  className="h-6 px-2 text-xs"
                                  disabled={disabled}
                                >
                                  Lưu
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditing}
                                  className="h-6 px-2 text-xs"
                                  disabled={disabled}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          )
                        : (
                            <div
                              className={`flex min-h-[40px] items-center text-xs text-gray-600 ${
                                disabled ? 'cursor-default' : 'cursor-pointer hover:text-gray-800'
                              }`}
                              onClick={disabled ? undefined : () => startEditingCaption(photo)}
                            >
                              {photo.caption || (disabled ? 'Mô tả ảnh' : 'Nhấp để thêm mô tả...')}
                            </div>
                          )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !isLoading && (
        <div className="py-8 text-center">
          <ImageIcon className="mx-auto size-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có ảnh nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tải lên ảnh để ghi lại tiến độ công việc
          </p>
        </div>
      )}
    </div>
  );
}
