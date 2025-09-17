'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ProjectForm } from '@/components/ProjectForm';
import type { CreateProjectRequest, UpdateProjectRequest } from '@/types/Project';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<any[]>([]);

  const handleSubmit = async (data: CreateProjectRequest | UpdateProjectRequest, photos?: any[]) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const newProject = await response.json();

      // Nếu có ảnh được truyền trực tiếp hoặc đang chờ, lưu chúng vào database
      const photosToSave = photos || pendingPhotos;
      if (photosToSave.length > 0) {
        await savePhotosToProject(newProject.id, photosToSave);
      }

      // Redirect to project detail page
      router.push(`/dashboard/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      // alert(`Có lỗi xảy ra khi tạo dự án: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotosReady = (photos: any[]) => {
    setPendingPhotos(photos);
  };

  const savePhotosToProject = async (projectId: number, photos: any[]) => {
    try {
      for (const photo of photos) {
        const response = await fetch(`/api/projects/${projectId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicId: photo.publicId,
            url: photo.url,
            name: photo.name,
            size: photo.size,
            width: photo.width || 0,
            height: photo.height || 0,
            tags: photo.tags || [],
          }),
        });

        if (!response.ok) {
          console.error('Failed to save photo:', photo.name);
        }
      }
    } catch (error) {
      console.error('Error saving photos to project:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tạo công trình mới
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Nhập thông tin để tạo công trình xây dựng mới
        </p>
      </div>

      {/* Project Form */}
      <ProjectForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        onPhotosReady={handlePhotosReady}
      />
    </div>
  );
}
