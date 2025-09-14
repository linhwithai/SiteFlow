import { useState, useEffect, useCallback } from 'react';

export type Project = {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  projectManagerId?: string;
  status: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectFilters = {
  page?: number;
  limit?: number;
  status?: string;
  city?: string;
  province?: string;
  projectManagerId?: string;
  isActive?: boolean;
  search?: string;
};

export type ProjectListResponse = {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: ProjectFilters;
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 100, // Get more projects for dropdown
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (filters.page) searchParams.set('page', filters.page.toString());
      if (filters.limit) searchParams.set('limit', filters.limit.toString());
      if (filters.status) searchParams.set('status', filters.status);
      if (filters.city) searchParams.set('city', filters.city);
      if (filters.province) searchParams.set('province', filters.province);
      if (filters.projectManagerId) searchParams.set('projectManagerId', filters.projectManagerId);
      if (filters.isActive !== undefined) searchParams.set('isActive', filters.isActive.toString());
      if (filters.search) searchParams.set('search', filters.search);

      const response = await fetch(`/api/projects?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data: ProjectListResponse = await response.json();
      setProjects(data.projects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    filters,
    setFilters,
    fetchProjects,
  };
}



