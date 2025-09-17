import { useState, useEffect, useCallback } from 'react';
import type { WorkItem, WorkItemStats, WorkItemFilters, CreateWorkItemRequest, UpdateWorkItemRequest } from '@/types/WorkItem';

interface UseWorkItemsOptions {
  projectId: number;
  autoFetch?: boolean;
}

interface UseWorkItemsReturn {
  workItems: WorkItem[];
  stats: WorkItemStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: WorkItemFilters;
  setFilters: (filters: WorkItemFilters) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  fetchWorkItems: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createWorkItem: (data: CreateWorkItemRequest) => Promise<WorkItem | null>;
  updateWorkItem: (id: number, data: UpdateWorkItemRequest) => Promise<WorkItem | null>;
  deleteWorkItem: (id: number) => Promise<boolean>;
  importFromTemplate: (templateId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useWorkItems({ projectId, autoFetch = true }: UseWorkItemsOptions): UseWorkItemsReturn {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [stats, setStats] = useState<WorkItemStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<WorkItemFilters>({});

  const fetchWorkItems = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '' && value !== 'all')
        ),
      });

      const response = await fetch(`/api/projects/${projectId}/work-items?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch work items');
      }

      const data = await response.json();
      setWorkItems(data.workItems || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work items';
      setError(errorMessage);
      console.error('Error fetching work items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, pagination.page, pagination.limit, filters]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: WorkItemFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  const fetchStats = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/work-items/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch work item stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching work item stats:', err);
    }
  }, [projectId]);

  const createWorkItem = useCallback(async (data: CreateWorkItemRequest): Promise<WorkItem | null> => {
    if (!projectId) return null;

    try {
      const response = await fetch(`/api/projects/${projectId}/work-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create work item');
      }

      const result = await response.json();
      const newWorkItem = result.workItem;

      // Add to local state
      setWorkItems(prev => [newWorkItem, ...prev]);
      
      // Refresh stats
      await fetchStats();

      return newWorkItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create work item';
      setError(errorMessage);
      console.error('Error creating work item:', err);
      return null;
    }
  }, [projectId, fetchStats]);

  const updateWorkItem = useCallback(async (id: number, data: UpdateWorkItemRequest): Promise<WorkItem | null> => {
    if (!projectId) return null;

    try {
      const response = await fetch(`/api/projects/${projectId}/work-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update work item');
      }

      const result = await response.json();
      const updatedWorkItem = result.workItem;

      // Update local state
      setWorkItems(prev => 
        prev.map(item => item.id === id ? updatedWorkItem : item)
      );
      
      // Refresh stats
      await fetchStats();

      return updatedWorkItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update work item';
      setError(errorMessage);
      console.error('Error updating work item:', err);
      return null;
    }
  }, [projectId, fetchStats]);

  const deleteWorkItem = useCallback(async (id: number): Promise<boolean> => {
    if (!projectId) return false;

    try {
      const response = await fetch(`/api/projects/${projectId}/work-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete work item');
      }

      // Remove from local state
      setWorkItems(prev => prev.filter(item => item.id !== id));
      
      // Refresh stats
      await fetchStats();

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete work item';
      setError(errorMessage);
      console.error('Error deleting work item:', err);
      return false;
    }
  }, [projectId, fetchStats]);

  const importFromTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    if (!projectId) return false;

    try {
      const response = await fetch(`/api/projects/${projectId}/work-items/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import work items');
      }

      const result = await response.json();
      
      // Refresh work items and stats
      await fetchWorkItems();
      await fetchStats();

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import work items';
      setError(errorMessage);
      console.error('Error importing work items:', err);
      return false;
    }
  }, [projectId, fetchWorkItems, fetchStats]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSetFilters = useCallback((newFilters: WorkItemFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  const handleSetPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handleSetLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchWorkItems();
      fetchStats();
    }
  }, [autoFetch, fetchWorkItems, fetchStats]);

  return {
    workItems,
    stats,
    isLoading,
    error,
    pagination,
    filters,
    setFilters: updateFilters,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
    fetchWorkItems,
    fetchStats,
    createWorkItem,
    updateWorkItem,
    deleteWorkItem,
    importFromTemplate,
    clearError,
  };
}
