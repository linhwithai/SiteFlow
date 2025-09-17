'use client';

import { ArrowLeft, SaveIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Validation schema
const workItemFormSchema = z.object({
  workItemTitle: z.string().min(1, 'Tên hạng mục là bắt buộc').max(200, 'Tên hạng mục quá dài'),
  workItemDescription: z.string().max(1000, 'Mô tả quá dài').optional(),
  workItemType: z.string().min(1, 'Loại hạng mục là bắt buộc'),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTo: z.string().max(100, 'Người thực hiện quá dài').optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().int().min(0, 'Giờ ước tính phải không âm').optional(),
  actualHours: z.number().int().min(0, 'Giờ thực tế phải không âm').optional(),
  progress: z.number().int().min(0, 'Tiến độ phải từ 0-100').max(100, 'Tiến độ phải từ 0-100'),
  tags: z.string().max(500, 'Thẻ quá dài').optional(),
  notes: z.string().max(1000, 'Ghi chú quá dài').optional(),
});

type WorkItemFormData = z.infer<typeof workItemFormSchema>;

// Types
type Project = {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  projectManagerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function CreateWorkItemPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<WorkItemFormData>({
    resolver: zodResolver(workItemFormSchema),
    defaultValues: {
      workItemTitle: '',
      workItemDescription: '',
      workItemType: '',
      status: 'planned',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
      estimatedHours: undefined,
      actualHours: undefined,
      progress: 0,
      tags: '',
      notes: '',
    },
  });

  // Fetch project details
  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      setProject(data.success ? data.data : data);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Không thể tải thông tin dự án');
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await fetchProject();
      
      setLoading(false);
    };

    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // Handle form submission
  const handleSubmit = async (data: WorkItemFormData) => {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      const requestBody = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        estimatedHours: data.estimatedHours || null,
        actualHours: data.actualHours || null,
        tags: data.tags || null,
        notes: data.notes || null,
      };

      const response = await fetch(`/api/projects/${projectId}/work-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_demo_1',
          'x-user-id': 'test-user-123'
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        const workItemData = responseData.success ? responseData.data : responseData;
        
        // Navigate to the created work item detail page
        router.push(`/dashboard/projects/${projectId}/work-items/${workItemData.id}`);
      } else {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        
        if (errorData.error?.details && Array.isArray(errorData.error.details)) {
          const validationErrors = errorData.error.details.map((err: any) => 
            `${err.path.join('.')}: ${err.message}`
          ).join('\n');
          throw new Error(`Validation errors:\n${validationErrors}`);
        }
        
        throw new Error(errorData.error?.message || `Failed to create work item: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setSubmitError(errorMessage);
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/projects/${projectId}/work-items`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dự án', href: '/dashboard/projects' }, { label: 'Đang tải...' }]} />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dự án', href: '/dashboard/projects' }, { label: 'Lỗi' }]} />
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <XIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Không tìm thấy dự án'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Link href="/dashboard/projects">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Danh sách dự án
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: 'Dự án',
      href: '/dashboard/projects',
    },
    {
      label: project.name,
      href: `/dashboard/projects/${project.id}`,
    },
    {
      label: 'Hạng mục',
      href: `/dashboard/projects/${project.id}/work-items`,
    },
    {
      label: 'Tạo mới',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${project.id}/work-items`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Tạo hạng mục mới
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600 dark:text-gray-400">
                Dự án: {project.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workItemTitle">Tên hạng mục *</Label>
                <Input
                  id="workItemTitle"
                  {...form.register('workItemTitle')}
                  placeholder="Nhập tên hạng mục"
                />
                {form.formState.errors.workItemTitle && (
                  <p className="text-sm text-red-600">{form.formState.errors.workItemTitle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workItemDescription">Mô tả</Label>
                <Textarea
                  id="workItemDescription"
                  {...form.register('workItemDescription')}
                  placeholder="Nhập mô tả hạng mục"
                  rows={3}
                />
                {form.formState.errors.workItemDescription && (
                  <p className="text-sm text-red-600">{form.formState.errors.workItemDescription.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workItemType">Loại hạng mục *</Label>
                <Select
                  value={form.watch('workItemType')}
                  onValueChange={(value) => form.setValue('workItemType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại hạng mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concrete_work">Công việc bê tông</SelectItem>
                    <SelectItem value="steel_work">Công việc thép</SelectItem>
                    <SelectItem value="masonry">Xây dựng</SelectItem>
                    <SelectItem value="finishing">Hoàn thiện</SelectItem>
                    <SelectItem value="mep_installation">Lắp đặt MEP</SelectItem>
                    <SelectItem value="inspection">Kiểm tra</SelectItem>
                    <SelectItem value="safety_check">Kiểm tra an toàn</SelectItem>
                    <SelectItem value="excavation">Đào đất</SelectItem>
                    <SelectItem value="foundation">Móng</SelectItem>
                    <SelectItem value="roofing">Mái</SelectItem>
                    <SelectItem value="plumbing">Hệ thống nước</SelectItem>
                    <SelectItem value="electrical">Hệ thống điện</SelectItem>
                    <SelectItem value="painting">Sơn</SelectItem>
                    <SelectItem value="landscaping">Cảnh quan</SelectItem>
                    <SelectItem value="cleanup">Dọn dẹp</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.workItemType && (
                  <p className="text-sm text-red-600">{form.formState.errors.workItemType.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status and Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái và độ ưu tiên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái *</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value) => form.setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Đã lên kế hoạch</SelectItem>
                    <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                    <SelectItem value="on_hold">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên *</Label>
                <Select
                  value={form.watch('priority')}
                  onValueChange={(value) => form.setValue('priority', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.priority && (
                  <p className="text-sm text-red-600">{form.formState.errors.priority.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Tiến độ (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  {...form.register('progress', { valueAsNumber: true })}
                  placeholder="0"
                />
                {form.formState.errors.progress && (
                  <p className="text-sm text-red-600">{form.formState.errors.progress.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment and Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Phân công và thời gian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Người thực hiện</Label>
                <Input
                  id="assignedTo"
                  {...form.register('assignedTo')}
                  placeholder="Nhập tên người thực hiện"
                />
                {form.formState.errors.assignedTo && (
                  <p className="text-sm text-red-600">{form.formState.errors.assignedTo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Hạn hoàn thành</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...form.register('dueDate')}
                />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.dueDate.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Giờ ước tính</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    {...form.register('estimatedHours', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {form.formState.errors.estimatedHours && (
                    <p className="text-sm text-red-600">{form.formState.errors.estimatedHours.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualHours">Giờ thực tế</Label>
                  <Input
                    id="actualHours"
                    type="number"
                    min="0"
                    {...form.register('actualHours', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {form.formState.errors.actualHours && (
                    <p className="text-sm text-red-600">{form.formState.errors.actualHours.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Thẻ</Label>
                <Input
                  id="tags"
                  {...form.register('tags')}
                  placeholder="Nhập thẻ, phân cách bằng dấu phẩy"
                />
                {form.formState.errors.tags && (
                  <p className="text-sm text-red-600">{form.formState.errors.tags.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  placeholder="Nhập ghi chú"
                  rows={3}
                />
                {form.formState.errors.notes && (
                  <p className="text-sm text-red-600">{form.formState.errors.notes.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <XIcon className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang tạo...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                Tạo hạng mục
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
