'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, DollarSignIcon, FileTextIcon, ImageIcon, InfoIcon, MapPinIcon, UserIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PhotoUpload } from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';
import type { CreateProjectRequest, Project, UpdateProjectRequest } from '@/types/Project';

const projectFormSchema = z.object({
  name: z.string().min(1, 'Tên công trình là bắt buộc').max(255, 'Tên công trình quá dài'),
  description: z.string().max(1000, 'Mô tả quá dài').optional(),
  address: z.string().max(500, 'Địa chỉ quá dài').optional(),
  city: z.string().max(100, 'Tên thành phố quá dài').optional(),
  province: z.string().max(100, 'Tên tỉnh quá dài').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.union([z.string().transform(val => val === '' ? undefined : val), z.number()]).optional(),
  projectManagerId: z.string().optional(),
  status: z.enum(Object.values(CONSTRUCTION_PROJECT_STATUS) as [string, ...string[]]).optional(),
  // Thêm các trường mới cho ngành xây dựng
  investor: z.string().max(255, 'Tên chủ đầu tư quá dài').optional(),
  contractor: z.string().max(255, 'Tên đơn vị thi công quá dài').optional(),
  buildingPermit: z.string().max(100, 'Số giấy phép xây dựng quá dài').optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['endDate'],
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

type ProjectFormProps = {
  project?: Project;
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest, photos?: any[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onPhotosReady?: (photos: any[]) => void;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function ProjectForm({ project, onSubmit, onCancel, isLoading = false, onPhotosReady }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Photo upload state
  const {
    photos,
    isUploading: isUploadingPhoto,
    error: photoError,
    uploadPhoto,
    clearError: clearPhotoError,
    loadPhotos,
  } = usePhotoUpload({
    projectId: project?.id ? Number(project.id) : undefined,
    folder: project ? `projects/${project.id}` : 'projects',
    tags: ['project', project?.name || 'new-project'],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
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
      status: project?.status || CONSTRUCTION_PROJECT_STATUS.PLANNING,
      investor: project?.investor || '',
      contractor: project?.contractor || '',
      buildingPermit: project?.buildingPermit || '',
    },
  });

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

  // Load photos when component mounts in edit mode
  useEffect(() => {
    if (project?.id) {
      loadPhotos();
    }
  }, [project?.id, loadPhotos]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const apiData: CreateProjectRequest | UpdateProjectRequest = {
        name: data.name,
        description: data.description || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        province: data.province || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        budget: data.budget || undefined,
        projectManagerId: data.projectManagerId === 'none' ? undefined : data.projectManagerId || undefined,
        // Thêm các trường mới cho ngành xây dựng
        investor: data.investor || undefined,
        contractor: data.contractor || undefined,
        buildingPermit: data.buildingPermit || undefined,
        ...(project && { status: data.status }),
      };

      // Nếu đang tạo dự án mới và có ảnh, truyền ảnh trực tiếp vào onSubmit
      if (!project && photos.length > 0) {
        // Truyền ảnh trực tiếp vào onSubmit để xử lý đồng thời
        await onSubmit(apiData, photos);
      } else {
        // Cập nhật dự án hoặc tạo dự án không có ảnh
        await onSubmit(apiData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <FileTextIcon className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {project ? 'Chỉnh sửa công trình' : 'Tạo công trình mới'}
            </CardTitle>
            <CardDescription className="mt-1">
              {project
                ? 'Cập nhật thông tin công trình xây dựng'
                : 'Điền thông tin để tạo công trình xây dựng mới'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <InfoIcon className="size-4" />
                Thông tin cơ bản
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <ImageIcon className="size-4" />
                Hình ảnh
                {photos.length > 0 && (
                  <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                    {photos.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-5 text-gray-600" />
                  <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
                </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên công trình *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ví dụ: Chung cư cao cấp ABC, Nhà máy sản xuất XYZ"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả công trình</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Mô tả chi tiết về công trình xây dựng, quy mô, đặc điểm kỹ thuật..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>


          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPinIcon className="size-5 text-gray-600" />
              <h3 className="text-lg font-medium">Thông tin địa điểm</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ công trình</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-gray-600" />
              <h3 className="text-lg font-medium">Thời gian thực hiện</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

          {/* Budget & Financial */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSignIcon className="size-5 text-gray-600" />
              <h3 className="text-lg font-medium">Tài chính & Đầu tư</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Tổng mức đầu tư (VNĐ)</Label>
              <Input
                id="budget"
                type="text"
                {...register('budget')}
                placeholder="Ví dụ: 50 tỷ VNĐ, 1.5 tỷ, N/A, hoặc để trống"
                className={errors.budget ? 'border-red-500' : ''}
              />
              {errors.budget && (
                <p className="text-sm text-red-500">{errors.budget.message}</p>
              )}
            </div>

            {/* Chủ đầu tư và đơn vị thi công */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="investor">Chủ đầu tư</Label>
                <Input
                  id="investor"
                  {...register('investor')}
                  placeholder="Tên công ty chủ đầu tư"
                  className={errors.investor ? 'border-red-500' : ''}
                />
                {errors.investor && (
                  <p className="text-sm text-red-500">{errors.investor.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor">Đơn vị thi công</Label>
                <Input
                  id="contractor"
                  {...register('contractor')}
                  placeholder="Tên công ty thi công"
                  className={errors.contractor ? 'border-red-500' : ''}
                />
                {errors.contractor && (
                  <p className="text-sm text-red-500">{errors.contractor.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buildingPermit">Số giấy phép xây dựng</Label>
              <Input
                id="buildingPermit"
                {...register('buildingPermit')}
                placeholder="Ví dụ: GPXD-2024-001234"
                className={errors.buildingPermit ? 'border-red-500' : ''}
              />
              {errors.buildingPermit && (
                <p className="text-sm text-red-500">{errors.buildingPermit.message}</p>
              )}
            </div>
          </div>

          {/* Project Management */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserIcon className="size-5 text-gray-600" />
              <h3 className="text-lg font-medium">Quản lý công trình</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectManagerId">Chỉ huy trưởng công trình</Label>
              <Select
                value={watch('projectManagerId') || 'none'}
                onValueChange={value => setValue('projectManagerId', value)}
              >
                <SelectTrigger className={errors.projectManagerId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={isLoadingUsers ? 'Đang tải...' : 'Chọn chỉ huy trưởng'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                      {' '}
                      (
                      {user.role}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectManagerId && (
                <p className="text-sm text-red-500">{errors.projectManagerId.message}</p>
              )}
            </div>
          </div>

          {/* Status (only for edit mode) */}
          {project && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Trạng thái công trình</h3>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái thi công</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={CONSTRUCTION_PROJECT_STATUS.PLANNING}>Lập kế hoạch</option>
                  <option value={CONSTRUCTION_PROJECT_STATUS.ACTIVE}>Đang thi công</option>
                  <option value={CONSTRUCTION_PROJECT_STATUS.ON_HOLD}>Tạm dừng</option>
                  <option value={CONSTRUCTION_PROJECT_STATUS.COMPLETED}>Hoàn thành</option>
                  <option value={CONSTRUCTION_PROJECT_STATUS.CANCELLED}>Hủy bỏ</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>
          )}

            </TabsContent>

            <TabsContent value="photos" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Hình ảnh công trình</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload hình ảnh thiết kế, hiện trạng, tiến độ thi công. Hỗ trợ JPEG, PNG, WebP, GIF (tối đa 10MB mỗi ảnh).
                  </p>
                </div>

                <PhotoUpload
                  onUpload={uploadPhoto}
                  photos={photos}
                  maxFiles={20}
                  folder={project ? `projects/${project.id}` : 'projects'}
                  tags={['project', watch('name') || 'new-project']}
                  disabled={isUploadingPhoto}
                />

                {photoError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                    <p className="text-sm text-red-600 dark:text-red-400">{photoError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearPhotoError}
                      className="mt-2"
                    >
                      Xóa lỗi
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading || isUploadingPhoto}
              className="min-w-[100px]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || isUploadingPhoto}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting || isLoading || isUploadingPhoto
                ? (
                    <div className="flex items-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Đang xử lý...
                    </div>
                  )
                : (
                    project ? 'Cập nhật công trình' : 'Tạo công trình mới'
                  )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
