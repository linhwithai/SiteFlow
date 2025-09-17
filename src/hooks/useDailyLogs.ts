'use client';

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';

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
  
  // Cache for API responses
  const cacheRef = useRef<Map<string, { data: any; timestamp: number; ttl: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cache configuration
  const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  const MAX_CACHE_SIZE = 50;

  // Cache helper functions
  const getCacheKey = useCallback((endpoint: string, params: Record<string, any>) => {
    return `${endpoint}:${JSON.stringify(params)}`;
  }, []);

  const getFromCache = useCallback((key: string) => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      cacheRef.current.delete(key);
    }
    return null;
  }, []);

  const setCache = useCallback((key: string, data: any, ttl = CACHE_TTL) => {
    // Clean up old entries if cache is too large
    if (cacheRef.current.size >= MAX_CACHE_SIZE) {
      const oldestKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(oldestKey);
    }
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Abort previous request if new one is made
  const abortPreviousRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  }, []);

  // Fetch daily logs with caching
  const fetchDailyLogs = useCallback(async (page = 1, newFilters: DailyLogFilters = {}) => {
    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    // Create cache key
    const cacheKey = getCacheKey('daily-logs', { projectId, page, filters: newFilters });
    
    // Check cache first
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      setDailyLogs(cachedData.dailyLogs);
      setPagination(cachedData.pagination);
      setFilters(cachedData.filters);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Abort previous request
      abortPreviousRequest();

      const queryParams = new URLSearchParams();
      queryParams.set('page', page.toString());
      queryParams.set('limit', (pagination?.limit || 10).toString());

      if (newFilters.logDateFrom) {
        queryParams.set('constructionDateFrom', newFilters.logDateFrom);
      }
      if (newFilters.logDateTo) {
        queryParams.set('constructionDateTo', newFilters.logDateTo);
      }
      if (newFilters.weather) {
        queryParams.set('weather', newFilters.weather);
      }
      if (newFilters.workDescription) {
        queryParams.set('constructionWorkDescription', newFilters.workDescription);
      }
      if (newFilters.search) {
        queryParams.set('search', newFilters.search);
      }

      const response = await fetch(`/api/projects/${projectId}/daily-logs?${queryParams}`, {
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch daily logs');
      }

      const responseData = await response.json();
      
      // Handle API response structure: {success: true, data: {dailyLogs: [], pagination: {}}}
      const data: DailyLogListResponse = responseData.success ? responseData.data : responseData;

      // Cache the response
      setCache(cacheKey, data);

      setDailyLogs(data.dailyLogs || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
      setFilters(data.filters || {});
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was aborted, don't update state
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching daily logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, pagination?.limit || 10, getCacheKey, getFromCache, setCache, abortPreviousRequest]);

  // Fetch stats with caching
  const fetchStats = useCallback(async () => {
    if (!projectId) return;

    const cacheKey = getCacheKey('daily-logs-stats', { projectId });
    
    // Check cache first
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      setStats(cachedData);
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/daily-logs/stats`, {
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch daily log stats');
      }

      const responseData = await response.json();
      
      // Handle API response structure: {success: true, data: {stats}}
      const data: DailyLogStats = responseData.success ? responseData.data : responseData;
      
      // Cache the response
      setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes cache for stats
      
      setStats(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was aborted, don't update state
      }
      console.error('Error fetching daily log stats:', err);
    }
  }, [projectId, getCacheKey, getFromCache, setCache]);

  // Create daily log with optimistic updates
  const createDailyLog = useCallback(async (data: CreateDailyLogRequest) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Optimistic update
    const optimisticLog: DailyLog = {
      id: Date.now(), // Temporary ID
      projectId,
      organizationId: 'org_demo_1',
      title: data.title,
      logDate: new Date(data.logDate),
      weather: data.weather,
      temperature: data.temperature,
      workDescription: data.workDescription,
      workHours: data.workHours,
      workersCount: data.workersCount,
      issues: data.issues,
      notes: data.notes,
      createdById: 'test-user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photos: [],
    };

    // Add optimistic update to UI
    setDailyLogs(prev => [optimisticLog, ...(prev || [])]);

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/daily-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : errorData.error || errorData.message || 'Failed to create daily log';
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const newDailyLog: DailyLog = responseData.data || responseData;

      // Replace optimistic update with real data
      setDailyLogs(prev => (prev || []).map(log => 
        log.id === optimisticLog.id ? newDailyLog : log
      ));

      // Clear cache to force refresh
      clearCache();

      // Refetch data to ensure consistency
      await fetchDailyLogs(pagination.page, filters);

      // Update stats
      await fetchStats();

      return newDailyLog;
    } catch (err) {
      // Remove optimistic update on error
      setDailyLogs(prev => (prev || []).filter(log => log.id !== optimisticLog.id));
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fetchStats, clearCache]);

  // Update daily log with optimistic updates
  const updateDailyLog = useCallback(async (id: number, data: UpdateDailyLogRequest) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Store original log for rollback
    const originalLog = dailyLogs.find(log => log.id === id);
    if (!originalLog) {
      throw new Error('Daily log not found');
    }

    // Optimistic update
    const optimisticLog: DailyLog = {
      ...originalLog,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Apply optimistic update to UI
    setDailyLogs(prev =>
      (prev || []).map(log => log.id === id ? optimisticLog : log),
    );

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/daily-logs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : errorData.error || errorData.message || 'Failed to update daily log';
        throw new Error(errorMessage);
      }

      const updatedDailyLog: DailyLog = await response.json();

      // Replace optimistic update with real data
      setDailyLogs(prev =>
        (prev || []).map(log => log.id === id ? updatedDailyLog : log),
      );

      // Clear cache to force refresh
      clearCache();

      return updatedDailyLog;
    } catch (err) {
      // Rollback optimistic update on error
      setDailyLogs(prev =>
        (prev || []).map(log => log.id === id ? originalLog : log),
      );
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, dailyLogs, clearCache]);

  // Delete daily log with optimistic updates
  const deleteDailyLog = useCallback(async (id: number) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Store original log for rollback
    const originalLog = dailyLogs.find(log => log.id === id);
    if (!originalLog) {
      throw new Error('Daily log not found');
    }

    // Optimistic update - remove from UI immediately
    setDailyLogs(prev => (prev || []).filter(log => log.id !== id));

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/daily-logs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : errorData.error || errorData.message || 'Failed to delete daily log';
        throw new Error(errorMessage);
      }

      // Clear cache to force refresh
      clearCache();

      // Update stats
      await fetchStats();
    } catch (err) {
      // Rollback optimistic update on error
      setDailyLogs(prev => [...(prev || []), originalLog].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, dailyLogs, fetchStats, clearCache]);

  // Get single daily log
  const getDailyLog = useCallback(async (id: number): Promise<DailyLog | null> => {
    if (!projectId) {
      setError('Project ID is required');
      return null;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/daily-logs/${id}`);

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
  }, [projectId]);

  // Apply filters
  const applyFilters = useCallback((newFilters: DailyLogFilters) => {
    setFilters(newFilters);
    fetchDailyLogs(1, newFilters);
  }, [fetchDailyLogs]);

  // Change page
  const changePage = useCallback((page: number) => {
    fetchDailyLogs(page, filters);
  }, [fetchDailyLogs, filters]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearCache();
  }, [clearCache]);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchDailyLogs();
      fetchStats();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Memoized computed values
  const computedStats = useMemo(() => {
    if (!stats) return null;
    
    return {
      ...stats,
      averageWorkHours: stats.totalLogs > 0 ? stats.totalWorkHours / stats.totalLogs : 0,
      averageWorkers: stats.totalLogs > 0 ? stats.totalLaborCount / stats.totalLogs : 0,
    };
  }, [stats]);

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
    const photoResponse = await fetch(`/api/projects/${projectId}/daily-logs/${dailyLogId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: uploadResult.data.publicId,
        originalName: file.name,
        fileUrl: uploadResult.data.url,
        thumbnailUrl: uploadResult.data.thumbnailUrl,
        fileSize: file.size,
        mimeType: file.type,
      }),
    });

    if (!photoResponse.ok) {
      const error = await photoResponse.json();
      throw new Error(error.error || 'Failed to save photo');
    }

    const photo = await photoResponse.json();

    // Update local state
    setDailyLogs(prev => (prev || []).map(log =>
      log.id === dailyLogId
        ? { ...log, photos: [...(log.photos || []), photo] }
        : log,
    ));

    return photo;
  }, []);

  const deletePhoto = useCallback(async (dailyLogId: number, photoId: string): Promise<void> => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const response = await fetch(`/api/projects/${projectId}/daily-logs/${dailyLogId}/photos/${photoId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete photo');
    }

    // Update local state
    setDailyLogs(prev => (prev || []).map(log =>
      log.id === dailyLogId
        ? { ...log, photos: (log.photos || []).filter(photo => photo.id !== photoId) }
        : log,
    ));
  }, [projectId]);


  return {
    // Data
    dailyLogs,
    stats: computedStats,
    loading: isLoading,
    error,
    pagination,
    filters,
    
    // Actions
    setFilters,
    fetchDailyLogs,
    fetchStats,
    createDailyLog,
    updateDailyLog,
    deleteDailyLog,
    getDailyLog,
    uploadPhoto,
    deletePhoto,
    applyFilters,
    changePage,
    clearCache,
    cleanup,
    
    // Computed values
    hasData: (dailyLogs?.length || 0) > 0,
    isEmpty: (dailyLogs?.length || 0) === 0,
    isError: !!error,
    isLoading: isLoading,
  };
}
