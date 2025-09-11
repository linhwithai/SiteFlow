'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ProjectDetail } from '@/components/ProjectDetail';
import type { Project } from '@/types/Project';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle edit project
  const handleEditProject = (project: Project) => {
    router.push(`/dashboard/projects/${project.id}/edit`);
  };

  // Handle delete project
  const handleDeleteProject = async (project: Project) => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Redirect to projects list
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      // alert('Có lỗi xảy ra khi xóa dự án');
    } finally {
      setIsDeleting(false);
    }
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-64 rounded bg-gray-200"></div>
              <div className="h-48 rounded bg-gray-200"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 rounded bg-gray-200"></div>
              <div className="h-32 rounded bg-gray-200"></div>
            </div>
          </div>
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
    <ProjectDetail
      project={project}
      onEdit={handleEditProject}
      onDelete={handleDeleteProject}
      isLoading={isDeleting}
    />
  );
}
