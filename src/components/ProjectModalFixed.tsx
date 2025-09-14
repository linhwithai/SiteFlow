'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2, ImageIcon, InfoIcon } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PhotoUpload } from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { cn } from '@/libs/utils';
import { PROJECT_STATUS } from '@/types/Enum';
import type { CreateProjectRequest, Project, UpdateProjectRequest } from '@/types/Project';

const projectSchema = z.object({
  name: z.string().min(1, 'Tên dự án là bắt buộc'),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
  projectManagerId: z.string().optional(),
  status: z.nativeEnum(PROJECT_STATUS).optional(),
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
  project?: Project | null;
  isLoading?: boolean;
  onPhotosReady?: (photos: any[]) => void; // Callback for photos that need to be saved
  onUploadStateChange?: (isUploading: boolean) => void; // Callback for upload state changes
};

const statusLabels = {
  [PROJECT_STATUS.PLANNING]: 'Lập kế hoạch',
  [PROJECT_STATUS.ACTIVE]: 'Đang thực hiện',
  [PROJECT_STATUS.ON_HOLD]: 'Tạm dừng',
  [PROJECT_STATUS.COMPLETED]: 'Hoàn thành',
  [PROJECT_STATUS.CANCELLED]: 'Hủy bỏ',
};

export function ProjectModalFixed({ isOpen, onClose, onSave, users, project, isLoading = false, onPhotosReady, onUploadStateChange }: ProjectModalProps) {
  console.log('🔍 ProjectModalFixed rendered, isOpen:', isOpen);
  
  const isEditMode = !!project;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      address: project?.address || '',
      city: project?.city || '',
      province: project?.province || '',
      startDate: project?.startDate ? project.startDate.split('T')[0] : '',
      endDate: project?.endDate ? project.endDate.split('T')[0] : '',
      budget: project?.budget?.toString() || '',
      projectManagerId: project?.projectManagerId || 'none',
      status: project?.status || PROJECT_STATUS.PLANNING,
    },
  });

  // Photo upload state using usePhotoUpload hook
  const {
    photos,
    isUploading: isUploadingPhoto,
    error: photoError,
    uploadPhoto,
    clearError: clearPhotoError,
  } = usePhotoUpload({
    folder: project ? `projects/${project.id}` : 'projects',
    tags: ['project', form.watch('name') || 'new-project'],
    projectId: project?.id ? Number(project.id) : undefined,
  });

  // Notify parent component about upload state changes
  React.useEffect(() => {
    if (onUploadStateChange) {
      onUploadStateChange(isUploadingPhoto);
    }
  }, [isUploadingPhoto, onUploadStateChange]);

  // For new projects, we need to handle photos differently
  // Store photos that will be saved after project creation
  const [pendingPhotos, setPendingPhotos] = React.useState<any[]>([]);

  // Custom photo upload handler for new projects
  const handlePhotoUploadForNewProject = async (file: File) => {
    try {
      // Upload to Cloudinary first
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'projects');
      formData.append('tags', ['project', form.watch('name') || 'new-project'].join(','));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Store photo data to be saved after project creation
      const photoData = {
        id: result.data.publicId,
        url: result.data.url,
        publicId: result.data.publicId,
        name: result.data.originalName,
        size: result.data.size,
        uploadedAt: new Date(),
        tags: ['project', form.watch('name') || 'new-project'],
      };

      setPendingPhotos(prev => [...prev, photoData]);
      console.log('📸 Photo uploaded and stored for later save:', photoData);
      
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      throw error;
    }
  };

  // Use appropriate upload handler based on mode
  const photoUploadHandler = isEditMode ? uploadPhoto : handlePhotoUploadForNewProject;
  const displayPhotos = isEditMode ? photos : pendingPhotos;

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      if (isEditMode) {
        const submitData: UpdateProjectRequest = {
          name: data.name,
          description: data.description,
          address: data.address,
          city: data.city,
          province: data.province,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          budget: data.budget ? Number.parseFloat(data.budget) : undefined,
          projectManagerId: data.projectManagerId === 'none' ? undefined : data.projectManagerId,
          status: data.status,
        };
        await onSave(submitData);
      } else {
        const submitData: CreateProjectRequest = {
          name: data.name,
          description: data.description,
          address: data.address,
          city: data.city,
          province: data.province,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          budget: data.budget ? Number.parseFloat(data.budget) : undefined,
          projectManagerId: data.projectManagerId === 'none' ? undefined : data.projectManagerId,
        };
        
        // For new projects, we need to handle photos after project creation
        const uploadedPhotos = [...pendingPhotos]; // Store current photos before clearing
        
        await onSave(submitData);
        
        // Save photos to database after project creation
        if (uploadedPhotos.length > 0) {
          console.log('📸 Photos to be saved after project creation:', uploadedPhotos);
          // Notify parent component about photos that need to be saved
          if (onPhotosReady) {
            console.log('📤 Calling onPhotosReady with photos:', uploadedPhotos);
            onPhotosReady(uploadedPhotos);
          } else {
            console.log('❌ onPhotosReady callback is not provided');
          }
        } else {
          console.log('ℹ️ No photos to save');
        }
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
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <InfoIcon className="size-4" />
                  Thông tin cơ bản
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  Hình ảnh
                  {displayPhotos.length > 0 && (
                    <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      {displayPhotos.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
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
                                  ? (new Date(field.value)).toLocaleDateString('vi-VN')
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
                                  ? (new Date(field.value)).toLocaleDateString('vi-VN')
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
              </TabsContent>

              <TabsContent value="photos" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Hình ảnh dự án</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload hình ảnh liên quan đến dự án. Hỗ trợ JPEG, PNG, WebP, GIF (tối đa 10MB mỗi ảnh).
                    </p>
                  </div>

                  <PhotoUpload
                    onUpload={photoUploadHandler}
                    photos={displayPhotos}
                    maxFiles={20}
                    folder={project ? `projects/${project.id}` : 'projects'}
                    tags={['project', form.watch('name') || 'new-project']}
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading || isUploadingPhoto}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isUploadingPhoto && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEditMode ? 'Cập nhật dự án' : (isLoading ? 'Đang tạo...' : 'Tạo dự án')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

