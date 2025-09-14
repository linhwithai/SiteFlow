'use client';

import { useCallback, useEffect, useState } from 'react';

import type { CreateDailyLogRequest, DailyLog, DailyLogFilters, DailyLogListResponse, DailyLogStats, ProjectPhoto, UpdateDailyLogRequest } from '@/types/DailyLog';

type UseDailyLogsOptions = {
  projectId?: number;
  autoFetch?: boolean;
};

export function useDailyLogs({ projectId, autoFetch = true }: UseDailyLogsOptions = {}) {
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [stats, setStats] = useState<DailyLogStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<DailyLogFilters>({});

  // Fetch daily logs
  const fetchDailyLogs = useCallback(async (page = 1, newFilters: DailyLogFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.set('page', page.toString());
      queryParams.set('limit', pagination.limit.toString());

      if (projectId) {
        queryParams.set('projectId', projectId.toString());
      }
      if (newFilters.logDateFrom) {
        queryParams.set('logDateFrom', newFilters.logDateFrom);
      }
      if (newFilters.logDateTo) {
        queryParams.set('logDateTo', newFilters.logDateTo);
      }
      if (newFilters.weather) {
        queryParams.set('weather', newFilters.weather);
      }
      if (newFilters.workDescription) {
        queryParams.set('workDescription', newFilters.workDescription);
      }
      if (newFilters.search) {
        queryParams.set('search', newFilters.search);
      }

      const response = await fetch(`/api/daily-logs?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch daily logs');
      }

      const data: DailyLogListResponse = await response.json();

      setDailyLogs(data.dailyLogs);
      setPagination(data.pagination);
      setFilters(data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching daily logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, pagination.limit]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/daily-logs/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch daily log stats');
      }

      const data: DailyLogStats = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching daily log stats:', err);
    }
  }, []);

  // Create daily log
  const createDailyLog = useCallback(async (data: CreateDailyLogRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/daily-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create daily log');
      }

      const newDailyLog: DailyLog = await response.json();

      // Add to current list
      setDailyLogs(prev => [newDailyLog, ...prev]);

      // Update stats
      await fetchStats();

      return newDailyLog;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats]);

  // Update daily log
  const updateDailyLog = useCallback(async (id: number, data: UpdateDailyLogRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/daily-logs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update daily log');
      }

      const updatedDailyLog: DailyLog = await response.json();

      // Update in current list
      setDailyLogs(prev =>
        prev.map(log => log.id === id ? updatedDailyLog : log),
      );

      return updatedDailyLog;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete daily log
  const deleteDailyLog = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/daily-logs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete daily log');
      }

      // Remove from current list
      setDailyLogs(prev => prev.filter(log => log.id !== id));

      // Update stats
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats]);

  // Get single daily log
  const getDailyLog = useCallback(async (id: number): Promise<DailyLog | null> => {
    try {
      const response = await fetch(`/api/daily-logs/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch daily log');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback((newFilters: DailyLogFilters) => {
    setFilters(newFilters);
    fetchDailyLogs(1, newFilters);
  }, [fetchDailyLogs]);

  // Change page
  const changePage = useCallback((page: number) => {
    fetchDailyLogs(page, filters);
  }, [fetchDailyLogs, filters]);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchDailyLogs();
      fetchStats();
    }
  }, []);

  // Photo management functions
  const uploadPhoto = useCallback(async (dailyLogId: number, file: File): Promise<ProjectPhoto> => {
    // First upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'daily-logs');
    formData.append('public_id', `daily-log-${dailyLogId}-${Date.now()}`);

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.message || 'Failed to upload photo');
    }

    const uploadResult = await uploadResponse.json();

    // Then save to database
    const photoResponse = await fetch(`/api/daily-logs/${dailyLogId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicId: uploadResult.data.publicId,
        url: uploadResult.data.url,
        name: file.name,
        size: file.size,
        width: uploadResult.data.width,
        height: uploadResult.data.height,
      }),
    });

    if (!photoResponse.ok) {
      const error = await photoResponse.json();
      throw new Error(error.message || 'Failed to save photo');
    }

    const photo = await photoResponse.json();

    // Update local state
    setDailyLogs(prev => prev.map(log =>
      log.id === dailyLogId
        ? { ...log, photos: [...(log.photos || []), photo] }
        : log,
    ));

    return photo;
  }, []);

  const deletePhoto = useCallback(async (dailyLogId: number, photoId: string): Promise<void> => {
    const response = await fetch(`/api/daily-logs/${dailyLogId}/photos/${photoId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete photo');
    }

    // Update local state
    setDailyLogs(prev => prev.map(log =>
      log.id === dailyLogId
        ? { ...log, photos: (log.photos || []).filter(photo => photo.id !== photoId) }
        : log,
    ));
  }, []);

  const updatePhotoCaption = useCallback(async (dailyLogId: number, photoId: string, caption: string): Promise<void> => {
    const response = await fetch(`/api/daily-logs/${dailyLogId}/photos/${photoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ caption }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update photo caption');
    }

    // Update local state
    setDailyLogs(prev => prev.map(log =>
      log.id === dailyLogId
        ? {
            ...log,
            photos: (log.photos || []).map(photo =>
              photo.id === photoId ? { ...photo, caption } : photo,
            ),
          }
        : log,
    ));
  }, []);

  return {
    dailyLogs,
    stats,
    loading: isLoading,
    error,
    pagination,
    filters,
    setFilters,
    fetchDailyLogs,
    fetchStats,
    createDailyLog,
    updateDailyLog,
    deleteDailyLog,
    getDailyLog,
    uploadPhoto,
    deletePhoto,
    updatePhotoCaption,
    applyFilters,
    changePage,
  };
}
