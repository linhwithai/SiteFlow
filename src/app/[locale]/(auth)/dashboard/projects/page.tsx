'use client';

import { useEffect, useState } from 'react';

import { ProjectList } from '@/components/ProjectList';
import { ProjectStats } from '@/components/ProjectStats';
import type { Project, ProjectFilters, ProjectListResponse, ProjectStats as ProjectStatsType } from '@/types/Project';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStatsType | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const limit = 12;

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined),
        ),
      });

      const response = await fetch(`/api/projects?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data: ProjectListResponse = await response.json();
      setProjects(data.projects);
      setTotal(data.total);
    } catch {
      // console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch project stats
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const response = await fetch('/api/projects/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch project stats');
      }

      const data: ProjectStatsType = await response.json();
      setStats(data);
    } catch {
      // console.error('Error fetching project stats:', error);
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
    // TODO: Navigate to edit page or open edit modal
    // console.log('Edit project:', project);
  };

  // Handle delete project
  const handleDeleteProject = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Refresh projects list
      await fetchProjects();
      await fetchStats();
    } catch {
      // console.error('Error deleting project:', error);
      // alert('Có lỗi xảy ra khi xóa dự án');
    }
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
          Quản lý dự án
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Quản lý và theo dõi tất cả các dự án xây dựng
        </p>
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
