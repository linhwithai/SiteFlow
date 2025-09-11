'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, MapPinIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PROJECT_STATUS } from '@/types/Enum';
import type { CreateProjectRequest, Project, UpdateProjectRequest } from '@/types/Project';

const projectFormSchema = z.object({
  name: z.string().min(1, 'Tên dự án là bắt buộc').max(255, 'Tên dự án quá dài'),
  description: z.string().max(1000, 'Mô tả quá dài').optional(),
  address: z.string().max(500, 'Địa chỉ quá dài').optional(),
  city: z.string().max(100, 'Tên thành phố quá dài').optional(),
  province: z.string().max(100, 'Tên tỉnh quá dài').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().min(0, 'Ngân sách phải là số dương').optional(),
  projectManagerId: z.string().optional(),
  status: z.enum(Object.values(PROJECT_STATUS) as [string, ...string[]]).optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

type ProjectFormProps = {
  project?: Project;
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ProjectForm({ project, onSubmit, onCancel, isLoading = false }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      address: project?.address || '',
      city: project?.city || '',
      province: project?.province || '',
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      budget: project?.budget || undefined,
      projectManagerId: project?.projectManagerId || '',
      status: project?.status || PROJECT_STATUS.PLANNING,
    },
  });

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);

      // Convert form data to API format
      const apiData: CreateProjectRequest | UpdateProjectRequest = {
        name: data.name,
        description: data.description || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        province: data.province || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        budget: data.budget || undefined,
        projectManagerId: data.projectManagerId || undefined,
        ...(project && { status: data.status }),
      };

      await onSubmit(apiData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="size-5" />
          {project ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}
        </CardTitle>
        <CardDescription>
          {project
            ? 'Cập nhật thông tin dự án'
            : 'Nhập thông tin để tạo dự án mới'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên dự án *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Nhập tên dự án"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Ngân sách (VNĐ)</Label>
                <Input
                  id="budget"
                  type="number"
                  {...register('budget', { valueAsNumber: true })}
                  placeholder="Nhập ngân sách"
                  className={errors.budget ? 'border-red-500' : ''}
                />
                {errors.budget && (
                  <p className="text-sm text-red-500">{errors.budget.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả dự án</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Mô tả chi tiết về dự án"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-medium">
              <MapPinIcon className="size-5" />
              Thông tin địa điểm
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Nhập địa chỉ"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Thành phố</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Nhập thành phố"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Tỉnh</Label>
                <Input
                  id="province"
                  {...register('province')}
                  placeholder="Nhập tỉnh"
                  className={errors.province ? 'border-red-500' : ''}
                />
                {errors.province && (
                  <p className="text-sm text-red-500">{errors.province.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-medium">
              <CalendarIcon className="size-5" />
              Thời gian dự án
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Manager */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quản lý dự án</h3>

            <div className="space-y-2">
              <Label htmlFor="projectManagerId">ID Quản lý dự án</Label>
              <Input
                id="projectManagerId"
                {...register('projectManagerId')}
                placeholder="Nhập ID quản lý dự án"
                className={errors.projectManagerId ? 'border-red-500' : ''}
              />
              {errors.projectManagerId && (
                <p className="text-sm text-red-500">{errors.projectManagerId.message}</p>
              )}
            </div>
          </div>

          {/* Status (only for edit mode) */}
          {project && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Trạng thái dự án</h3>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={PROJECT_STATUS.PLANNING}>Lập kế hoạch</option>
                  <option value={PROJECT_STATUS.ACTIVE}>Đang thực hiện</option>
                  <option value={PROJECT_STATUS.ON_HOLD}>Tạm dừng</option>
                  <option value={PROJECT_STATUS.COMPLETED}>Hoàn thành</option>
                  <option value={PROJECT_STATUS.CANCELLED}>Hủy bỏ</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Đang lưu...' : project ? 'Cập nhật' : 'Tạo dự án'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
