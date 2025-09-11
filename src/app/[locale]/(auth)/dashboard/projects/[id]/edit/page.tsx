'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ProjectForm } from '@/components/ProjectForm';
import type { Project, UpdateProjectRequest } from '@/types/Project';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch project details
  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard/projects');
          return;
        }
        throw new Error('Failed to fetch project');
      }

      const data: Project = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (data: UpdateProjectRequest) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      const updatedProject = await response.json();

      // Redirect to project detail page
      router.push(`/dashboard/projects/${updatedProject.id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      // alert(`Có lỗi xảy ra khi cập nhật dự án: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="mb-6 h-4 w-1/2 rounded bg-gray-200"></div>
          <div className="h-96 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Không tìm thấy dự án
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            type="button"
            onClick={() => router.push('/dashboard/projects')}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Quay lại danh sách dự án
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Chỉnh sửa dự án
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Cập nhật thông tin dự án:
          {' '}
          {project.name}
        </p>
      </div>

      {/* Project Form */}
      <ProjectForm
        project={project}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
}
