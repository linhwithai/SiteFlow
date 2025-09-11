'use client';

import { CalendarIcon, MapPinIcon, MoreHorizontalIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PROJECT_STATUS } from '@/types/Enum';
import type { Project, ProjectFilters } from '@/types/Project';

type ProjectListProps = {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: ProjectFilters) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
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
  onEdit,
  onDelete: _onDelete,
  isLoading = false,
}: ProjectListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ search: value || undefined });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    onFiltersChange({ status: status as any || undefined });
  };

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
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
          <div className="flex flex-col gap-4 sm:flex-row">
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
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={e => handleStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading
        ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 rounded bg-gray-200"></div>
                      <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        : projects.length === 0
          ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="mb-4 text-gray-400">
                    <CalendarIcon className="mx-auto size-12" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    Chưa có dự án nào
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Hãy tạo dự án đầu tiên để bắt đầu quản lý công việc
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard/projects/new')}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="size-4" />
                    Tạo dự án mới
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => (
                  <Card key={project.id} className="transition-shadow hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="truncate text-lg">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="truncate">
                            {project.description || 'Không có mô tả'}
                          </CardDescription>
                        </div>
                        <div className="ml-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[project.status]}`}
                          >
                            {statusLabels[project.status]}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0"
                            onClick={() => {
                              // TODO: Implement dropdown menu
                              // console.log('More options for project:', project.id);
                            }}
                          >
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Location */}
                      {(project.address || project.city) && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPinIcon className="mt-0.5 size-4 shrink-0" />
                          <span className="truncate">
                            {[project.address, project.city, project.province]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Timeline */}
                      {(project.startDate || project.endDate) && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="mt-0.5 size-4 shrink-0" />
                          <span>
                            {project.startDate && formatDate(project.startDate)}
                            {project.startDate && project.endDate && ' - '}
                            {project.endDate && formatDate(project.endDate)}
                          </span>
                        </div>
                      )}

                      {/* Budget */}
                      {project.budget && (
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(project.budget)}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => onEdit(project)}
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="size-8 p-0"
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
            disabled={page >= totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
