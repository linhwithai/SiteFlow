'use client';

import { CalendarIcon, MapPinIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditProjectModal } from '@/components/EditProjectModal';
import { Input } from '@/components/ui/input';
import { PROJECT_STATUS } from '@/types/Enum';
import type { Project, ProjectFilters, UpdateProjectRequest } from '@/types/Project';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type ProjectListProps = {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: ProjectFilters) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onUpdate: (projectId: string, data: UpdateProjectRequest) => Promise<void>;
  isLoading?: boolean;
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

export function ProjectList({
  projects,
  total,
  page,
  limit,
  onPageChange,
  onFiltersChange,
  onEdit: _onEdit,
  onDelete: _onDelete,
  onUpdate,
  isLoading = false,
}: ProjectListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const getProjectManagerName = (projectManagerId: string) => {
    const user = users.find(u => u.id === projectManagerId);
    return user ? `${user.name} (${user.role})` : projectManagerId;
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ search: value || undefined });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    onFiltersChange({ status: status as any || undefined });
  };

  // Handle edit project modal
  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  const handleSaveProject = async (data: UpdateProjectRequest) => {
    if (!editingProject) return;
    
    try {
      setIsUpdating(true);
      await onUpdate(editingProject.id, data);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý dự án
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tổng cộng
            {' '}
            {total}
            {' '}
            dự án
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/projects/new')}
          className="flex items-center gap-2"
        >
          <PlusIcon className="size-4" />
          Tạo dự án mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm dự án..."
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={e => handleStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value={PROJECT_STATUS.PLANNING}>Lập kế hoạch</option>
                <option value={PROJECT_STATUS.ACTIVE}>Đang thực hiện</option>
                <option value={PROJECT_STATUS.ON_HOLD}>Tạm dừng</option>
                <option value={PROJECT_STATUS.COMPLETED}>Hoàn thành</option>
                <option value={PROJECT_STATUS.CANCELLED}>Hủy bỏ</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 size-12 rounded-full bg-gray-100 p-3">
              <SearchIcon className="size-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Không tìm thấy dự án
            </h3>
            <p className="text-gray-500">
              Hãy thử thay đổi bộ lọc hoặc tạo dự án mới.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Card key={project.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {project.description || 'Không có mô tả'}
                    </CardDescription>
                  </div>
                  <div className="ml-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[project.status]
                      }`}
                    >
                      {statusLabels[project.status]}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Location */}
                  {project.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="size-4" />
                      <span className="truncate">{project.address}</span>
                    </div>
                  )}

                  {/* Dates */}
                  {project.startDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="size-4" />
                      <span>
                        {formatDate(project.startDate)}
                        {project.endDate && ` - ${formatDate(project.endDate)}`}
                      </span>
                    </div>
                  )}

                  {/* Budget */}
                  {project.budget && (
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(project.budget)}
                    </div>
                  )}

                  {/* Project Manager */}
                  {project.projectManagerId && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Quản lý:
                      {' '}
                      {isLoadingUsers ? 'Đang tải...' : getProjectManagerName(project.projectManagerId)}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(project)}
                      className="flex-1"
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      className="flex-1"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị
            {' '}
            {(page - 1) * limit + 1}
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
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Trước
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        project={editingProject}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProject}
        isLoading={isUpdating}
      />
    </div>
  );
}
