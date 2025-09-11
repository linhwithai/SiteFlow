'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ProjectForm } from '@/components/ProjectForm';
import type { CreateProjectRequest, UpdateProjectRequest } from '@/types/Project';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProjectRequest | UpdateProjectRequest) => {
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

      // Redirect to project detail page
      router.push(`/dashboard/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      // alert(`Có lỗi xảy ra khi tạo dự án: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
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
          Tạo dự án mới
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Nhập thông tin để tạo dự án xây dựng mới
        </p>
      </div>

      {/* Project Form */}
      <ProjectForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
}
