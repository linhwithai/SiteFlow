import { useCallback, useState } from 'react';

type Photo = {
  id: string;
  url: string;
  publicId: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: Date;
  tags?: string[];
};

type UsePhotoUploadOptions = {
  folder?: string;
  tags?: string[];
  projectId?: number;
  onSuccess?: (photo: Photo) => void;
  onError?: (error: Error) => void;
};

export function usePhotoUpload(options: UsePhotoUploadOptions = {}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = useCallback(async (file: File): Promise<Photo> => {
    console.log('📸 Starting photo upload:', file.name);
    console.log('📸 Setting isUploading to true');
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Validate file before upload
      if (!file.type.startsWith('image/')) {
        throw new Error('File phải là ảnh');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File quá lớn. Kích thước tối đa là 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', options.folder || 'siteflow');
      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      const photo: Photo = {
        id: result.data.publicId,
        url: result.data.url,
        publicId: result.data.publicId,
        name: result.data.originalName,
        size: result.data.size,
        width: result.data.width || 0,
        height: result.data.height || 0,
        uploadedAt: new Date(),
        tags: options.tags,
      };

      // Save photo to database if projectId is provided
      if (options.projectId) {
        try {
          const saveResponse = await fetch(`/api/projects/${options.projectId}/photos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              publicId: result.data.publicId,
              url: result.data.url,
              name: result.data.originalName,
              size: result.data.size,
              width: result.data.width || 0, // Fallback to 0 if undefined
              height: result.data.height || 0, // Fallback to 0 if undefined
              tags: options.tags || [],
            }),
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.error || 'Failed to save photo to database');
          }

          const saveResult = await saveResponse.json();
          // Update photo with database ID
          photo.id = saveResult.photo.id.toString();
        } catch (saveError) {
          console.error('Error saving photo to database:', saveError);
          // Continue with local state even if database save fails
          // But show a warning to the user
          setError('Ảnh đã upload thành công nhưng có lỗi khi lưu vào cơ sở dữ liệu');
        }
      }

      setPhotos(prev => [...prev, photo]);
      options.onSuccess?.(photo);

      return photo;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      setError(error.message);
      options.onError?.(error);
      throw error;
    } finally {
      console.log('📸 Photo upload finished:', file.name);
      // Delay resetting upload state to ensure UI updates properly
      setTimeout(() => {
        console.log('📸 Setting isUploading to false');
        setIsUploading(false);
        setUploadProgress(0);
      }, 100);
    }
  }, [options]);

  const removePhoto = useCallback(async (photoId: string) => {
    try {
      // Find the photo to get its publicId
      const photo = photos.find(p => p.id === photoId);
      if (!photo) {
        return;
      }

      // Delete from both Cloudinary and database in one API call
      if (options.projectId) {
        const response = await fetch(`/api/projects/${options.projectId}/photos/${photoId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete photo');
        }
      } else {
        // Fallback: only delete from Cloudinary if no projectId
        const cloudinaryResponse = await fetch(`/api/upload/${photo.publicId}`, {
          method: 'DELETE',
        });

        if (!cloudinaryResponse.ok) {
          throw new Error('Failed to delete photo from Cloudinary');
        }
      }

      // Remove from local state
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Delete failed');
      setError(error.message);
      options.onError?.(error);
    }
  }, [photos, options]);

  const downloadPhoto = useCallback(async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Download failed');
      setError(error.message);
      options.onError?.(error);
    }
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setPhotosFromData = useCallback((photosData: Photo[]) => {
    setPhotos(photosData);
  }, []);

  const loadPhotos = useCallback(async () => {
    if (!options.projectId) {
      console.log('❌ No projectId provided for loading photos');
      return;
    }

    try {
      console.log('📸 Loading photos for project:', options.projectId);
      const response = await fetch(`/api/projects/${options.projectId}/photos`);
      if (!response.ok) {
        throw new Error('Failed to load photos');
      }

      const result = await response.json();
      console.log('📸 Photos API response:', result);
      
      const photosData: Photo[] = result.photos.map((photo: any) => ({
        id: photo.id.toString(),
        url: photo.url,
        publicId: photo.publicId,
        name: photo.name,
        size: photo.size,
        uploadedAt: new Date(photo.createdAt),
        tags: photo.tags || [],
      }));

      console.log('📸 Processed photos data:', photosData);
      setPhotos(photosData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Load photos failed');
      console.error('❌ Error loading photos:', error);
      setError(error.message);
      options.onError?.(error);
    }
  }, [options.projectId]);

  return {
    photos,
    isUploading,
    uploadProgress,
    error,
    uploadPhoto,
    removePhoto,
    downloadPhoto,
    clearError,
    setPhotosFromData,
    loadPhotos,
  };
}
