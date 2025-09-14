import { useCallback, useEffect, useState } from 'react';

import type {
  CreateProjectTaskRequest,
  ProjectTask,
  ProjectTaskListResponse,
  ProjectTaskStats,
  UpdateProjectTaskRequest,
} from '@/types/Project';

type UseProjectTasksOptions = {
  projectId: number;
  autoFetch?: boolean;
};

type UseProjectTasksReturn = {
  // Data
  tasks: ProjectTask[];
  stats: ProjectTaskStats | null;
  loading: boolean;
  error: string | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  // Filters
  filters: {
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
    search?: string;
  };

  // Actions
  fetchTasks: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
    search?: string;
  }) => Promise<void>;

  createTask: (data: CreateProjectTaskRequest) => Promise<ProjectTask | null>;
  updateTask: (taskId: number, data: UpdateProjectTaskRequest) => Promise<ProjectTask | null>;
  deleteTask: (taskId: number) => Promise<boolean>;
  fetchStats: () => Promise<void>;

  // Utility
  setFilters: (filters: Partial<UseProjectTasksReturn['filters']>) => void;
  clearError: () => void;
};

export function useProjectTasks({
  projectId,
  autoFetch = true,
}: UseProjectTasksOptions): UseProjectTasksReturn {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [stats, setStats] = useState<ProjectTaskStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseProjectTasksReturn['pagination']>(null);
  const [filters, setFiltersState] = useState<UseProjectTasksReturn['filters']>({});

  // Fetch tasks
  const fetchTasks = useCallback(async (params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
    search?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params.page) {
        searchParams.set('page', params.page.toString());
      }
      if (params.limit) {
        searchParams.set('limit', params.limit.toString());
      }
      if (params.status) {
        searchParams.set('status', params.status);
      }
      if (params.priority) {
        searchParams.set('priority', params.priority);
      }
      if (params.type) {
        searchParams.set('type', params.type);
      }
      if (params.assignedTo) {
        searchParams.set('assignedTo', params.assignedTo);
      }
      if (params.search) {
        searchParams.set('search', params.search);
      }

      const response = await fetch(
        `/api/projects/${projectId}/tasks?${searchParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data: ProjectTaskListResponse = await response.json();
      setTasks(data.tasks);
      setPagination(data.pagination);
      setFiltersState(data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Create task
  const createTask = useCallback(async (data: CreateProjectTaskRequest): Promise<ProjectTask | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const result = await response.json();
      const newTask = result.task;

      // Add to local state
      setTasks(prev => [newTask, ...prev]);

      // Update pagination total
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total + 1 } : null);
      }

      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId, pagination]);

  // Update task
  const updateTask = useCallback(async (taskId: number, data: UpdateProjectTaskRequest): Promise<ProjectTask | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const result = await response.json();
      const updatedTask = result.task;

      // Update local state
      setTasks(prev => prev.map(task =>
        task.id === parseInt(taskId) ? updatedTask : task,
      ));

      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Delete task
  const deleteTask = useCallback(async (taskId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== parseInt(taskId)));

      // Update pagination total
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    } finally {
      setLoading(false);
    }
  }, [projectId, pagination]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/tasks/stats`);

      if (!response.ok) {
        throw new Error('Failed to fetch task statistics');
      }

      const data: ProjectTaskStats = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task statistics');
    }
  }, [projectId]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<UseProjectTasksReturn['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchTasks(filters);
    }
  }, [autoFetch, fetchTasks, filters]);

  // Auto-fetch stats when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      fetchStats();
    }
  }, [tasks, fetchStats]);

  return {
    tasks,
    stats,
    loading,
    error,
    pagination,
    filters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchStats,
    setFilters,
    clearError,
  };
}
