'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ProjectDetail } from '@/components/ProjectDetail';

// Types
type Project = {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  projectManagerId: string | null;
  progress: number;
  clientName: string | null;
  clientContact: string | null;
  clientEmail: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  photos?: Array<{
    id: string;
    url: string;
    publicId: string;
    name: string;
    size: number;
    uploadedAt: Date;
    tags?: string[];
  }>;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      const projectData: Project = await response.json();
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Handle project edit
  const handleEdit = () => {
    router.push(`/dashboard/projects/${projectId}/edit`);
  };

  // Handle project delete
  const handleDelete = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Có lỗi xảy ra khi xóa dự án. Vui lòng thử lại.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải thông tin dự án...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Không tìm thấy dự án
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/dashboard/projects">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách dự án
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {project.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chi tiết dự án xây dựng
          </p>
        </div>
      </div>

      {/* Project Detail Component */}
      <ProjectDetail
        project={project}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}