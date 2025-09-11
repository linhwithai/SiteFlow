'use client';

import { useEffect, useState } from 'react';

import { ProjectList } from '@/components/ProjectList';
import { ProjectStats } from '@/components/ProjectStats';
import type { Project, ProjectFilters, ProjectListResponse, ProjectStats as ProjectStatsType } from '@/types/Project';

export default function ProjectsDemoPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStatsType | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const limit = 12;

  // Fetch projects from mock API
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        ),
      });

      const response = await fetch(`/api/projects/mock?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data: ProjectListResponse = await response.json();
      setProjects(data.projects);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch project stats from mock API
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const response = await fetch('/api/projects/stats/mock');
      if (!response.ok) {
        throw new Error('Failed to fetch project stats');
      }

      const data: ProjectStatsType = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching project stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: ProjectFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Handle edit project
  const handleEditProject = (_project: Project) => {
    alert('Chức năng chỉnh sửa sẽ được triển khai khi có database!');
  };

  // Handle delete project
  const handleDeleteProject = async (_project: Project) => {
    alert('Chức năng xóa sẽ được triển khai khi có database!');
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchProjects();
  }, [page, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Demo - Quản lý dự án
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Demo UI với dữ liệu mẫu (không cần database)
        </p>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Lưu ý:</strong> Đây là trang demo sử dụng dữ liệu mẫu. 
            Để sử dụng chức năng đầy đủ, hãy cấu hình database theo hướng dẫn trong file DATABASE_SETUP.md
          </p>
        </div>
      </div>

      {/* Project Statistics */}
      {stats && <ProjectStats stats={stats} isLoading={isStatsLoading} />}

      {/* Project List */}
      <ProjectList
        projects={projects}
        total={total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onFiltersChange={handleFiltersChange}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        isLoading={isLoading}
      />
    </div>
  );
}
