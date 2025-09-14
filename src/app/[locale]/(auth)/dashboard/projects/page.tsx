'use client';

import { Building2, Edit, Eye, Filter, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ProjectModal } from '@/components/ProjectModal';
import { ProjectStats } from '@/components/ProjectStats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROJECT_STATUS } from '@/types/Enum';
import type { CreateProjectRequest, Project, ProjectFilters, ProjectListResponse, ProjectStats as ProjectStatsType, UpdateProjectRequest } from '@/types/Project';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const statusLabels = {
  [PROJECT_STATUS.PLANNING]: 'Lập kế hoạch',
  [PROJECT_STATUS.ACTIVE]: 'Đang thực hiện',
  [PROJECT_STATUS.ON_HOLD]: 'Tạm dừng',
  [PROJECT_STATUS.COMPLETED]: 'Hoàn thành',
  [PROJECT_STATUS.CANCELLED]: 'Hủy bỏ',
};

const statusColors = {
  [PROJECT_STATUS.PLANNING]: 'bg-blue-100 text-blue-800',
  [PROJECT_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [PROJECT_STATUS.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [PROJECT_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800',
  [PROJECT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStatsType | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cache, setCache] = useState<Map<string, ProjectListResponse>>(new Map());

  const limit = 12;

  // Generate cache key for filters
  const getCacheKey = (filters: ProjectFilters, page: number) => {
    return JSON.stringify({ ...filters, page, limit });
  };

  // Clear cache when data changes
  const clearCache = () => {
    setCache(new Map());
    console.log('🗑️ Cache cleared');
  };

  // Cache management with size limit
  const addToCache = (key: string, data: ProjectListResponse) => {
    setCache((prev) => {
      const newCache = new Map(prev);

      // Limit cache size to 50 entries
      if (newCache.size >= 50) {
        const firstKey = newCache.keys().next().value;
        if (firstKey) {
          newCache.delete(firstKey);
        }
      }

      newCache.set(key, data);
      console.log(`💾 Cached data for key: ${key} (Cache size: ${newCache.size})`);
      return newCache;
    });
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch projects with caching
  const fetchProjects = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      // Check cache first
      const cacheKey = getCacheKey(filters, page);
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        console.log('🚀 Cache HIT for:', cacheKey);
        setProjects(cachedData.projects);
        setTotal(cachedData.pagination.total);
        if (showLoading) {
          setIsLoading(false);
        }
        return;
      }

      // Fetch from API if not cached
      console.log('📡 Cache MISS - Fetching from API for:', cacheKey);
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

      // Cache the result
      addToCache(cacheKey, data);

      setProjects(data.projects);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [page, filters, limit, cache]);

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
    setPage(1);
  };

  // Debounced search effect
  useEffect(() => {
    if (searchInput !== (filters.search || '')) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput || undefined }));
      setPage(1);
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput, filters.search]);

  // Handle create project
  const handleCreateProject = async (data: CreateProjectRequest) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      // Clear cache and refresh projects list and stats
      clearCache();
      await fetchProjects();
      await fetchStats();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  // Handle update project
  const handleUpdateProject = async (projectId: string, data: UpdateProjectRequest) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      // Clear cache and refresh projects list
      clearCache();
      await fetchProjects();
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  // Handle delete project
  const handleDeleteProject = async (project: Project) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Bạn có chắc chắn muốn xóa dự án "${project.name}"?`)) {
      try {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete project');
        }

        // Clear cache and refresh projects list and stats when deleting
        clearCache();
        await fetchProjects();
        await fetchStats();
      } catch (error) {
        console.error('Error deleting project:', error);
        // eslint-disable-next-line no-alert
        window.alert('Có lỗi xảy ra khi xóa dự án');
      }
    }
  };

  // Get project manager name
  const getProjectManagerName = (projectManagerId: string | null | undefined) => {
    if (!projectManagerId) {
      return 'Chưa phân công';
    }
    const user = users.find(u => u.id === projectManagerId);
    return user ? `${user.name} (${user.role})` : 'Không xác định';
  };

  // Load data on mount
  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchStats();
  }, []);

  // Only fetch projects when filters change (without loading spinner)
  useEffect(() => {
    if (filters.search || filters.status) {
      setIsFiltering(true);
    }
    fetchProjects(false).finally(() => {
      setIsFiltering(false);
    });
  }, [fetchProjects]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý dự án
          </h1>
          <div className="mx-3 h-6 w-px bg-gray-300" />
          <p className="text-sm text-gray-600">
            Quản lý và theo dõi tất cả các dự án xây dựng
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 size-4" />
            Tạo dự án mới
          </Button>
        </div>
      </div>

      {/* Project Statistics */}
      {stats && <ProjectStats stats={stats} isLoading={isStatsLoading} />}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative max-w-sm flex-1">
                {isSearching || isFiltering
                  ? (
                      <div className="absolute left-3 top-2.5 size-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    )
                  : (
                      <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
                    )}
                <Input
                  placeholder="Tìm kiếm dự án..."
                  className="pl-10"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </div>
              <Select
                value={filters.status || 'all'}
                onValueChange={value => handleFiltersChange({ ...filters, status: value === 'all' ? undefined : value as any })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 size-4" />
                Bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Dự án
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Quản lý
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ngày bắt đầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading
                  ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex items-center justify-center">
                            <div className="size-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                            <span className="ml-2">Đang tải...</span>
                          </div>
                        </td>
                      </tr>
                    )
                  : projects.length === 0
                    ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            Không có dự án nào
                          </td>
                        </tr>
                      )
                    : (
                        projects.map(project => (
                          <tr key={project.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-blue-100">
                                  <Building2 className="size-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    <button
                                      onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
                                      className="hover:text-blue-600 hover:underline"
                                    >
                                      {project.name}
                                    </button>
                                  </div>
                                  <div className="text-sm text-gray-500">{project.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {getProjectManagerName(project.projectManagerId)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <Badge className={statusColors[project.status]}>
                                {statusLabels[project.status]}
                              </Badge>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                <div className="mr-2 h-2 w-16 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-blue-600"
                                    style={{ width: `${(project as any).progress || 0}%` }}
                                  >
                                  </div>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {(project as any).progress || 0}
                                  %
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : '-'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditingProject(project)}>
                                    <Edit className="mr-2 size-4" />
                                    Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => window.location.href = `/dashboard/projects/${project.id}`}>
                                    <Eye className="mr-2 size-4" />
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteProject(project)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Xóa
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị
            {' '}
            {((page - 1) * limit) + 1}
            {' '}
            đến
            {' '}
            {Math.min(page * limit, total)}
            {' '}
            trong tổng số
            {' '}
            {total}
            {' '}
            dự án
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page * limit >= total}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateProject as (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>}
        users={users}
        project={null}
      />

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSave={async (data) => {
          if (editingProject) {
            await handleUpdateProject(editingProject.id, data as UpdateProjectRequest);
          }
        }}
        users={users}
        project={editingProject}
      />
    </div>
  );
}
