import { useState, useEffect, useCallback, useRef } from 'react';

interface UseParallelDataFetchingOptions {
  projectId: number;
  enabled?: boolean;
}

interface UseParallelDataFetchingReturn {
  data: {
    project: any;
    workItems: any[];
    dailyLogs: any[];
    workItemStats: any;
    dailyLogStats: any;
    photos: any[];
    activities: any[];
  };
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Request deduplication cache with security considerations
const requestCache = new Map<string, { promise: Promise<any>; timestamp: number; ttl: number }>();

// Cache configuration
const CACHE_TTL = process.env.NODE_ENV === 'development' ? 5000 : 30000; // 5s dev, 30s prod
const MAX_CACHE_SIZE = 100;

const fetchWithDeduplication = async (url: string) => {
  const now = Date.now();
  
  // Check if we have a valid cached request
  const cached = requestCache.get(url);
  if (cached && (now - cached.timestamp) < cached.ttl) {
    console.log('🚀 Cache HIT:', url);
    return cached.promise;
  }
  
  console.log('🔄 Cache MISS:', url);
  
  // Create new request
  const promise = fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // Add any auth headers here if needed
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .catch((error) => {
      // Remove failed requests from cache immediately
      requestCache.delete(url);
      throw error;
    });
  
  // Store in cache with metadata
  requestCache.set(url, {
    promise,
    timestamp: now,
    ttl: CACHE_TTL,
  });
  
  // Cleanup old entries if cache is too large
  if (requestCache.size > MAX_CACHE_SIZE) {
    const oldestKey = requestCache.keys().next().value;
    requestCache.delete(oldestKey);
  }
  
  // Auto-cleanup after TTL
  setTimeout(() => {
    requestCache.delete(url);
  }, CACHE_TTL);
  
  try {
    const result = await promise;
    return result;
  } catch (error) {
    // Remove failed requests from cache
    requestCache.delete(url);
    throw error;
  }
};

// Debug utilities for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugCache = () => {
    console.log('📊 Cache Debug Info:');
    console.log('Cache size:', requestCache.size);
    console.log('Cache entries:', Array.from(requestCache.entries()).map(([key, value]) => ({
      key,
      timestamp: new Date(value.timestamp).toISOString(),
      ttl: value.ttl,
      age: Date.now() - value.timestamp,
    })));
  };
  
  (window as any).clearCache = () => {
    requestCache.clear();
    console.log('🧹 Cache cleared');
  };
}

export function useParallelDataFetching({ 
  projectId, 
  enabled = true 
}: UseParallelDataFetchingOptions): UseParallelDataFetchingReturn {
  const [data, setData] = useState({
    project: null,
    workItems: [],
    dailyLogs: [],
    workItemStats: null,
    dailyLogStats: null,
    photos: [],
    activities: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!projectId || !enabled) return;

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Define all API endpoints
      const endpoints = [
        { key: 'project', url: `/api/projects/${projectId}` },
        { key: 'workItems', url: `/api/projects/${projectId}/work-items?page=1&limit=10` },
        { key: 'dailyLogs', url: `/api/projects/${projectId}/daily-logs?page=1&limit=10` },
        { key: 'workItemStats', url: `/api/projects/${projectId}/work-items/stats` },
        { key: 'dailyLogStats', url: `/api/projects/${projectId}/daily-logs/stats` },
        { key: 'photos', url: `/api/projects/${projectId}/photos` },
        { key: 'activities', url: `/api/projects/${projectId}/activities` },
      ];

      // Execute all requests in parallel
      const promises = endpoints.map(async ({ key, url }) => {
        try {
          const response = await fetchWithDeduplication(url);
          return { key, data: response.success ? response.data : response };
        } catch (err) {
          console.error(`Error fetching ${key}:`, err);
          return { key, data: null, error: err };
        }
      });

      // Wait for all requests to complete
      const results = await Promise.allSettled(promises);
      
      // Process results
      const newData = {
        project: null,
        workItems: [],
        dailyLogs: [],
        workItemStats: null,
        dailyLogStats: null,
        photos: [],
        activities: [],
      };

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { key, data: resultData } = result.value;
          if (resultData && !resultData.error) {
            switch (key) {
              case 'project':
                newData.project = resultData;
                break;
              case 'workItems':
                newData.workItems = resultData.workItems || [];
                break;
              case 'dailyLogs':
                newData.dailyLogs = resultData.dailyLogs || [];
                break;
              case 'workItemStats':
                newData.workItemStats = resultData;
                break;
              case 'dailyLogStats':
                newData.dailyLogStats = resultData;
                break;
              case 'photos':
                newData.photos = resultData.photos || [];
                break;
              case 'activities':
                newData.activities = resultData.activities || [];
                break;
            }
          }
        }
      });

      setData(newData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error in parallel data fetching:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAllData,
  };
}
