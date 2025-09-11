'use client';

import { CalendarIcon, EditIcon, MapPinIcon, TrashIcon, UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PROJECT_STATUS } from '@/types/Enum';
import type { Project } from '@/types/Project';

type ProjectDetailProps = {
  project: Project;
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

export function ProjectDetail({ project, onEdit, onDelete, isLoading = false }: ProjectDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if (confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      try {
        setIsDeleting(true);
        await onDelete(project);
        router.push('/dashboard/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="mb-6 h-4 w-1/2 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-64 rounded bg-gray-200"></div>
            <div className="h-64 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-bold text-gray-900 dark:text-white">
            {project.name}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[project.status]}`}
            >
              {statusLabels[project.status]}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tạo lúc
              {' '}
              {formatDateTime(project.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onEdit(project)}
            className="flex items-center gap-2"
          >
            <EditIcon className="size-4" />
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <TrashIcon className="size-4" />
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả dự án</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                {project.description || 'Chưa có mô tả dự án'}
              </p>
            </CardContent>
          </Card>

          {/* Location */}
          {(project.address || project.city || project.province) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinIcon className="size-5" />
                  Địa điểm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.address && (
                    <div>
                      <span className="font-medium">Địa chỉ:</span>
                      <p className="text-gray-700 dark:text-gray-300">{project.address}</p>
                    </div>
                  )}
                  {(project.city || project.province) && (
                    <div>
                      <span className="font-medium">Khu vực:</span>
                      <p className="text-gray-700 dark:text-gray-300">
                        {[project.city, project.province].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {(project.startDate || project.endDate) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="size-5" />
                  Thời gian dự án
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {project.startDate && (
                    <div>
                      <span className="font-medium">Ngày bắt đầu:</span>
                      <p className="text-gray-700 dark:text-gray-300">
                        {formatDate(project.startDate)}
                      </p>
                    </div>
                  )}
                  {project.endDate && (
                    <div>
                      <span className="font-medium">Ngày kết thúc:</span>
                      <p className="text-gray-700 dark:text-gray-300">
                        {formatDate(project.endDate)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Manager */}
          {project.projectManagerId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="size-5" />
                  Quản lý dự án
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  ID:
                  {' '}
                  {project.projectManagerId}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Budget */}
          {project.budget && (
            <Card>
              <CardHeader>
                <CardTitle>Ngân sách</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(project.budget)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
                  <span className="font-medium">{statusLabels[project.status]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hoạt động:</span>
                  <span className="font-medium">
                    {project.isActive ? 'Có' : 'Không'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cập nhật lần cuối:</span>
                  <span className="font-medium">
                    {formatDateTime(project.updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
