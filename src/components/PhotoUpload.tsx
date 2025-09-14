'use client';

import { AlertCircle, CheckCircle, FileImage, Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type PhotoUploadProps = {
  onUpload: (file: File) => Promise<any>;
  onRemove?: (index: number) => void;
  onSave?: () => Promise<void>;
  photos?: Array<{
    id: string;
    url: string;
    publicId: string;
    name: string;
    size: number;
  }>;
  maxFiles?: number;
  folder?: string;
  tags?: string[];
  disabled?: boolean;
  className?: string;
  pendingFiles?: File[];
};

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type UploadFile = {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  preview?: string;
};

const defaultPhotos: Array<{
  id: string;
  url: string;
  publicId: string;
  name: string;
  size: number;
}> = [];

const defaultTags: string[] = [];
const defaultPendingFiles: File[] = [];

export function PhotoUpload({
  onUpload,
  onRemove: _onRemove,
  onSave: _onSave,
  photos = defaultPhotos,
  maxFiles = 10,
  folder: _folder = 'siteflow',
  tags: _tags = defaultTags,
  disabled = false,
  className = '',
  pendingFiles: _pendingFiles = defaultPendingFiles,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return `File ${file.name} không phải là ảnh.`;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return `File ${file.name} quá lớn. Kích thước tối đa là 10MB.`;
    }

    return null;
  }, []);

  const createPreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    // Clear success message when starting new upload
    setShowSuccessMessage(false);

    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - photos.length;

    if (fileArray.length > remainingSlots) {
      setErrors(prev => [...prev, `Chỉ có thể upload tối đa ${remainingSlots} ảnh nữa.`]);
      return;
    }

    const newUploadFiles: UploadFile[] = [];
    const newErrors: string[] = [];

    // Validate and prepare files
    for (const file of fileArray) {
      if (photos.length + newUploadFiles.length >= maxFiles) {
        break;
      }

      const validationError = validateFile(file);
      if (validationError) {
        newErrors.push(validationError);
        continue;
      }

      const preview = createPreview(file);
      newUploadFiles.push({
        file,
        status: 'idle',
        progress: 0,
        preview,
      });
    }

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    setErrors(prev => [...prev, ...newErrors]);

    // Upload files
    for (let i = 0; i < newUploadFiles.length; i++) {
      const uploadFile = newUploadFiles[i];
      if (!uploadFile) {
        continue;
      }

      try {
        setUploadFiles(prev => prev.map(f =>
          f.file === uploadFile.file ? { ...f, status: 'uploading' } : f,
        ));

        setIsUploading(true);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadFiles(prev => prev.map(f =>
            f.file === uploadFile.file
              ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 90) }
              : f,
          ));
        }, 200);

        await onUpload(uploadFile.file);

        clearInterval(progressInterval);

        setUploadFiles(prev => prev.map(f =>
          f.file === uploadFile.file
            ? { ...f, status: 'success', progress: 100 }
            : f,
        ));

        // Show success message
        setShowSuccessMessage(true);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadFiles(prev => prev.map(f =>
          f.file === uploadFile.file
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : f,
        ));
      } finally {
        setIsUploading(false);
      }
    }
  }, [maxFiles, photos.length, validateFile, createPreview, onUpload]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) {
      return;
    }

    // Clear success message when starting new upload
    setShowSuccessMessage(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (disabled) {
      return;
    }
    fileInputRef.current?.click();
  };

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const removeUploadFile = useCallback((index: number) => {
    setUploadFiles((prev) => {
      const file = prev[index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  }, []);

  // Auto-remove successful uploads after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setUploadFiles((prev) => {
        const toRemove = prev.filter(f => f.status === 'success');
        toRemove.forEach((f) => {
          if (f.preview) {
            URL.revokeObjectURL(f.preview);
          }
        });
        return prev.filter(f => f.status !== 'success');
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [uploadFiles]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showSuccessMessage]);

  // Auto-hide success message when upload files change
  useEffect(() => {
    if (showSuccessMessage && uploadFiles.length === 0) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showSuccessMessage, uploadFiles.length]);

  // Reset success message when component mounts
  useEffect(() => {
    setShowSuccessMessage(false);
  }, []);

  // Clear success message when photos change (new uploads)
  useEffect(() => {
    if (showSuccessMessage) {
      setShowSuccessMessage(false);
    }
  }, [photos.length, showSuccessMessage]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`relative border-2 border-dashed transition-all duration-200 ${
          dragActive
            ? 'scale-105 border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              {isUploading
                ? (
                    <Loader2 className="size-6 animate-spin text-blue-600" />
                  )
                : dragActive
                  ? (
                      <FileImage className="size-6 text-blue-600" />
                    )
                  : (
                      <Upload className="size-6 text-gray-600 dark:text-gray-400" />
                    )}
            </div>

            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              {isUploading ? 'Đang upload...' : dragActive ? 'Thả ảnh vào đây' : 'Upload ảnh'}
            </h3>

            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {dragActive
                ? 'Thả ảnh để bắt đầu upload'
                : 'Kéo thả ảnh vào đây hoặc click để chọn file'}
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <span>Hỗ trợ: JPEG, PNG, WebP, GIF</span>
              <span>•</span>
              <span>Tối đa 10MB</span>
              <span>•</span>
              <span>
                Còn lại:
                {maxFiles - photos.length}
                {' '}
                ảnh
              </span>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="w-full" />
                <p className="mt-1 text-xs text-gray-500">
                  {Math.round(uploadProgress)}
                  %
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
              <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setErrors(prev => prev.filter((_, idx) => idx !== index))}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={clearErrors}
            className="w-full"
          >
            Xóa tất cả lỗi
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Đang upload (
            {uploadFiles.length}
            )
          </h4>
          {uploadFiles.map((uploadFile, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              {uploadFile.preview && (
                <img
                  src={uploadFile.preview}
                  alt={uploadFile.file.name}
                  className="size-12 rounded object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {uploadFile.file.name}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={uploadFile.progress} className="h-2 flex-1" />
                  <span className="text-xs text-gray-500">
                    {Math.round(uploadFile.progress)}
                    %
                  </span>
                </div>
                {uploadFile.error && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {uploadFile.error}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {uploadFile.status === 'success' && (
                  <CheckCircle className="size-5 text-green-600" />
                )}
                {uploadFile.status === 'error' && (
                  <AlertCircle className="size-5 text-red-600" />
                )}
                {uploadFile.status === 'uploading' && (
                  <Loader2 className="size-5 animate-spin text-blue-600" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadFile(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-5 text-green-600" />
            <span className="text-sm text-green-600 dark:text-green-400">
              Đã có
              {' '}
              {photos.length}
              {' '}
              ảnh được lưu thành công. Xem trong thư viện ảnh bên dưới.
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSuccessMessage(false)}
            className="size-6 p-0 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !isUploading && (
        <div className="py-8 text-center">
          <ImageIcon className="mx-auto mb-4 size-12 text-gray-400 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Chưa có ảnh nào. Hãy upload ảnh đầu tiên!
          </p>
        </div>
      )}
    </div>
  );
}
