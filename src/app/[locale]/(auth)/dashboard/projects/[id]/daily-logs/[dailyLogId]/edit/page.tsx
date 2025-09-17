'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  CloudIcon, 
  ThermometerIcon, 
  UsersIcon, 
  ImageIcon, 
  SaveIcon, 
  Building2, 
  FileTextIcon, 
  EditIcon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem } from '@/components/Breadcrumb';
import { DailyLogForm } from '@/components/DailyLogForm';
import type { DailyLog, ProjectPhoto } from '@/types/DailyLog';

interface Project {
  id: number;
  name: string;
  description?: string;
  status?: string;
  address?: string;
  city?: string;
  province?: string;
}

export default function EditDailyLogPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const dailyLogId = params.dailyLogId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<Array<{file: File, cloudinaryResult: any}>>([]);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Dự án xây dựng',
      href: '/dashboard/projects',
      icon: <Building2 className="h-4 w-4" />
    },
    {
      label: project?.name || 'Dự án',
      href: `/dashboard/projects/${projectId}`,
      icon: <FileTextIcon className="h-4 w-4" />
    },
    {
      label: 'Nhật ký thi công',
      href: `/dashboard/projects/${projectId}/daily-logs`,
      icon: <CalendarIcon className="h-4 w-4" />
    },
    {
      label: dailyLog?.title || 'Chi tiết',
      href: `/dashboard/projects/${projectId}/daily-logs/${dailyLogId}`,
      icon: <CalendarIcon className="h-4 w-4" />
    },
    {
      label: 'Chỉnh sửa',
      icon: <EditIcon className="h-4 w-4" />
    }
  ];

  // Fetch project details
  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        const projectData = data.success ? data.data : data;
        setProject(projectData);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    }
  }, [projectId]);

  // Fetch daily log details
  const fetchDailyLog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/projects/${projectId}/daily-logs/${dailyLogId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch daily log: ${response.status}`);
      }

      const data = await response.json();
      const logData = data.success ? data.data : data;
      setDailyLog(logData);
      setPhotos(logData.photos || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching daily log:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, dailyLogId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
    if (dailyLogId) {
      fetchDailyLog();
    }
  }, [projectId, dailyLogId, fetchProject, fetchDailyLog]);

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitError(null);
      setIsSubmitting(true);
      
      // Check if there are pending photo uploads
      if (isPhotoLoading) {
        setSubmitError('Vui lòng đợi upload ảnh hoàn tất trước khi cập nhật nhật ký');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare photos from pending photos (new uploads)
      const newPhotosToSubmit = pendingPhotos.map((photo, index) => {
        if (!photo.cloudinaryResult) {
          throw new Error('Photo upload incomplete - missing Cloudinary result');
        }
        if (!photo.cloudinaryResult.url) {
          throw new Error(`Photo ${index} missing url in Cloudinary result`);
        }
        return {
          url: photo.cloudinaryResult.url,
          name: photo.file.name,
          size: photo.file.size,
          width: photo.cloudinaryResult.width,
          height: photo.cloudinaryResult.height,
          caption: '', // Can be enhanced later
          thumbnailUrl: photo.cloudinaryResult.thumbnailUrl || photo.cloudinaryResult.url,
        };
      });

      // Combine existing photos with new photos
      const allPhotos = [...(photos || []), ...newPhotosToSubmit];

      const requestBody = {
        ...formData,
        photos: allPhotos,
      };

      // Update daily log
      const response = await fetch(`/api/projects/${projectId}/daily-logs/${dailyLogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const dailyLogData = data.success ? data.data : data;
        
        // Navigate back to the daily log detail page
        router.push(`/dashboard/projects/${projectId}/daily-logs/${dailyLogId}`);
      } else {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        
        // Handle validation errors with details
        if (errorData.error?.details && Array.isArray(errorData.error.details)) {
          const validationErrors = errorData.error.details.map((err: any) => 
            `${err.path.join('.')}: ${err.message}`
          ).join('\n');
          throw new Error(`Validation errors:\n${validationErrors}`);
        }
        
        throw new Error(errorData.error?.message || `Failed to update daily log: ${response.status}`);
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
    router.push(`/dashboard/projects/${projectId}/daily-logs/${dailyLogId}`);
  };

  // Photo upload handlers
  const handlePhotoUpload = async (file: File) => {
    try {
      setIsPhotoLoading(true);
      
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload photo: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      
      // Extract data from API response
      const cloudinaryData = result.success ? result.data : result;
      
      // Add to pending photos
      const tempPhoto = {
        file,
        cloudinaryResult: cloudinaryData,
      };
      
      setPendingPhotos(prev => [...prev, tempPhoto]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSubmitError(`Lỗi khi upload ảnh: ${errorMessage}`);
      console.error('Photo upload error:', err);
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    try {
      // Check if it's a pending photo (new upload)
      const pendingIndex = parseInt(photoId);
      if (!isNaN(pendingIndex) && pendingIndex < pendingPhotos.length) {
        setPendingPhotos(prev => prev.filter((_, index) => index !== pendingIndex));
      } else {
        // It's an existing photo - remove from photos array
        setPhotos(prev => prev.filter((_, index) => index.toString() !== photoId));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSubmitError(`Lỗi khi xóa ảnh: ${errorMessage}`);
      console.error('Photo delete error:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Form Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !dailyLog || !project) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Error State */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/projects/${projectId}/daily-logs`)}
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-red-600">Lỗi</h1>
            <p className="text-muted-foreground">Không thể tải thông tin nhật ký</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Nhật ký không tồn tại hoặc bạn không có quyền truy cập'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa nhật ký thi công</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {project.name}
              </Badge>
              <span className="text-muted-foreground text-sm">
                ID: {projectId} | Nhật ký: {dailyLogId}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="daily-log-form"
            disabled={isSubmitting || isPhotoLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : isPhotoLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang upload ảnh...
              </>
            ) : (
              <>
                <SaveIcon className="size-4" />
                Cập nhật nhật ký
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Project Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileTextIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                {project.name}
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                {project.description || 'Không có mô tả'}
              </p>
              {(project.address || project.city) && (
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                  {[project.address, project.city, project.province].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Trạng thái
              </p>
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                {project.status || 'Đang thi công'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {!submitError && pendingPhotos.length > 0 && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Đã upload {pendingPhotos.length} ảnh mới thành công. Bạn có thể tiếp tục cập nhật nhật ký.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/50">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <EditIcon className="h-4 w-4 text-blue-600" />
            </div>
            Chỉnh sửa thông tin nhật ký thi công
          </CardTitle>
          <CardDescription className="text-base">
            Cập nhật thông tin về công việc thi công. Tất cả các trường có dấu (*) là bắt buộc.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <DailyLogForm
            dailyLog={dailyLog}
            onSubmit={handleSubmit}
            projectId={parseInt(projectId)}
            projectName={project.name}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            onPhotoUpload={handlePhotoUpload}
            onPhotoDelete={handlePhotoDelete}
            photos={photos}
            pendingPhotos={pendingPhotos}
            isPhotoLoading={isPhotoLoading}
            isUploadingToCloudinary={isPhotoLoading}
            error={submitError}
          />
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ClockIcon className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                Mẹo chỉnh sửa nhật ký hiệu quả
              </h4>
              <ul className="text-amber-700 dark:text-amber-300 text-xs mt-1 space-y-1">
                <li>• Cập nhật thông tin chính xác về tiến độ công việc</li>
                <li>• Thêm ảnh mới để minh chứng cho các thay đổi</li>
                <li>• Ghi nhận các vấn đề mới phát sinh</li>
                <li>• Cập nhật số liệu về nhân lực và thời gian làm việc</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


