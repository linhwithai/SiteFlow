'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PROJECT_STATUS } from '@/types/Enum';
import type { CreateProjectRequest, Project, UpdateProjectRequest } from '@/types/Project';
import { cn } from '@/utils/Helpers';

const projectSchema = z.object({
  name: z.string().min(1, 'Tên dự án là bắt buộc').max(255, 'Tên dự án quá dài'),
  description: z.string().max(1000, 'Mô tả quá dài').optional(),
  address: z.string().max(500, 'Địa chỉ quá dài').optional(),
  city: z.string().max(100, 'Tên thành phố quá dài').optional(),
  province: z.string().max(100, 'Tên tỉnh quá dài').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
  projectManagerId: z.string().optional(),
  status: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type ProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>;
  users: User[];
  project?: Project | null; // null = create mode, Project = edit mode
  isLoading?: boolean;
};

const statusLabels = {
  [PROJECT_STATUS.PLANNING]: 'Lập kế hoạch',
  [PROJECT_STATUS.ACTIVE]: 'Đang thực hiện',
  [PROJECT_STATUS.ON_HOLD]: 'Tạm dừng',
  [PROJECT_STATUS.COMPLETED]: 'Hoàn thành',
  [PROJECT_STATUS.CANCELLED]: 'Hủy bỏ',
};

export function ProjectModal({ isOpen, onClose, onSave, users, project, isLoading = false }: ProjectModalProps) {
  const isEditMode = !!project;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      address: project?.address || '',
      city: project?.city || '',
      province: project?.province || '',
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      budget: project?.budget?.toString() || '',
      projectManagerId: project?.projectManagerId || 'none',
      status: project?.status || PROJECT_STATUS.PLANNING,
    },
  });

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      if (isEditMode) {
        // Edit mode - return UpdateProjectRequest
        const submitData: UpdateProjectRequest = {
          name: data.name,
          description: data.description || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          province: data.province || undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          budget: data.budget ? Number.parseFloat(data.budget) : undefined,
          projectManagerId: data.projectManagerId === 'none' ? undefined : data.projectManagerId,
          status: data.status as any,
        };
        await onSave(submitData);
      } else {
        // Create mode - return CreateProjectRequest
        const submitData: CreateProjectRequest = {
          name: data.name,
          description: data.description || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          province: data.province || undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          budget: data.budget ? Number.parseFloat(data.budget) : undefined,
          projectManagerId: data.projectManagerId === 'none' ? undefined : data.projectManagerId,
        };
        await onSave(submitData);
      }
      form.reset();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} project:`, error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Cập nhật thông tin chi tiết của dự án.'
              : 'Điền thông tin chi tiết để tạo dự án mới trong hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Tên dự án */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên dự án *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên dự án" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Mô tả */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả chi tiết về dự án"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Địa chỉ */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa chỉ dự án" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Thành phố */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thành phố</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập thành phố" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tỉnh */}
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tỉnh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ngày bắt đầu */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? (
                                  new Date(field.value).toLocaleDateString('vi-VN')
                                )
                              : (
                                  <span>Chọn ngày bắt đầu</span>
                                )}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={date => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                          disabled={date => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ngày kết thúc */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? (
                                  new Date(field.value).toLocaleDateString('vi-VN')
                                )
                              : (
                                  <span>Chọn ngày kết thúc</span>
                                )}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={date => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                          disabled={date => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ngân sách */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngân sách (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập ngân sách"
                        {...field}
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quản lý dự án */}
              <FormField
                control={form.control}
                name="projectManagerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quản lý dự án</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quản lý dự án" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Trạng thái - chỉ hiển thị trong edit mode */}
              {isEditMode && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEditMode ? 'Cập nhật dự án' : 'Tạo dự án'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
