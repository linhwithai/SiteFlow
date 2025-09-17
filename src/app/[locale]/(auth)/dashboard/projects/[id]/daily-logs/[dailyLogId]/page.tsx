'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  CloudIcon, 
  EditIcon, 
  ImageIcon, 
  ThermometerIcon, 
  UsersIcon, 
  TrashIcon, 
  DownloadIcon,
  Building2,
  FileTextIcon,
  PlusIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  EyeIcon,
  ShareIcon,
  PrinterIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem } from '@/components/Breadcrumb';
import { PhotoGalleryModal } from '@/components/PhotoGalleryModal';
import type { DailyLog, ProjectPhoto } from '@/types/DailyLog';

interface Project {
  id: number;
  name: string;
  description?: string;
  status?: string;
}

export default function DailyLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const dailyLogId = params.dailyLogId as string;

  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<ProjectPhoto[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
      icon: <EyeIcon className="h-4 w-4" />
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

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTemperatureLabel = (temp: number) => {
    if (temp < 20) return 'Lạnh - Mùa đông';
    if (temp < 25) return 'Mát mẻ - Thời tiết dễ chịu';
    if (temp < 30) return 'Ấm áp - Thời tiết lý tưởng';
    if (temp < 35) return 'Nóng - Cần che chắn';
    return 'Rất nóng - Hạn chế làm việc';
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather.toLowerCase()) {
      case 'sunny':
      case 'nắng':
        return '☀️';
      case 'cloudy':
      case 'nhiều mây':
        return '☁️';
      case 'rainy':
      case 'mưa':
        return '🌧️';
      case 'stormy':
      case 'bão':
        return '⛈️';
      case 'foggy':
      case 'sương mù':
        return '🌫️';
      case 'snowy':
      case 'tuyết':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  const handlePhotoGallery = () => {
    if (dailyLog?.photos && dailyLog.photos.length > 0) {
      setGalleryPhotos(dailyLog.photos);
      setGalleryTitle(`${dailyLog.title || 'Nhật ký thi công'} - ${formatDate(dailyLog.logDate)}`);
      setGalleryOpen(true);
    }
  };


  const handleDelete = async () => {
    if (!dailyLog) return;

    if (confirm('Bạn có chắc chắn muốn xóa nhật ký này? Hành động này không thể hoàn tác.')) {
      try {
        setIsDeleting(true);
        const response = await fetch(`/api/projects/${projectId}/daily-logs/${dailyLogId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push(`/dashboard/projects/${projectId}/daily-logs`);
        } else {
          const errorData = await response.json();
          alert(errorData.error?.message || 'Có lỗi xảy ra khi xóa nhật ký');
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa nhật ký');
      } finally {
        setIsDeleting(false);
      }
    }
  };


  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: dailyLog?.title || 'Nhật ký thi công',
          text: `Nhật ký thi công - ${formatDate(dailyLog?.logDate || new Date())}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link vào clipboard');
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
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-16" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dailyLog) {
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/projects/${projectId}/daily-logs`)}
            className="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{dailyLog.title || 'Nhật ký thi công'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formatDate(dailyLog.logDate)}
              </Badge>
              <span className="text-muted-foreground text-sm">
                Tạo lúc {formatTime(dailyLog.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <ShareIcon className="size-4" />
            Chia sẻ
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <PrinterIcon className="size-4" />
            In
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/projects/${projectId}/daily-logs/${dailyLogId}/edit`)}
            className="flex items-center gap-2"
          >
            <EditIcon className="size-4" />
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <TrashIcon className="size-4" />
            )}
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </div>

      {/* Project Info Card */}
      {project && (
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
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                </div>
                Mô tả công việc thi công
              </CardTitle>
              <CardDescription>
                Chi tiết công việc đã thực hiện trong ngày
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {dailyLog.workDescription}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          {dailyLog.issues && (
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-800 dark:text-red-200">
                  <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  Vấn đề phát sinh trong thi công
                </CardTitle>
                <CardDescription className="text-red-700 dark:text-red-300">
                  Các vấn đề cần được xử lý và theo dõi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-red-700 leading-relaxed">
                    {dailyLog.issues}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {dailyLog.notes && (
            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-amber-800 dark:text-amber-200">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <FileTextIcon className="h-4 w-4 text-amber-600" />
                  </div>
                  Ghi chú kỹ thuật
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  Các ghi chú quan trọng và đề xuất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-amber-700 leading-relaxed">
                    {dailyLog.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Gallery */}
          {dailyLog.photos && dailyLog.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  Hình ảnh thi công ({dailyLog.photos.length})
                </CardTitle>
                <CardDescription>
                  Hình ảnh minh chứng cho công việc đã thực hiện
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {dailyLog.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="group relative overflow-hidden rounded-lg border bg-gray-50 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                      onClick={handlePhotoGallery}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || photo.name}
                        className="h-32 w-full object-cover transition-transform group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded-full bg-white/90 p-3 shadow-lg">
                          <EyeIcon className="size-5 text-gray-700" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePhotoGallery}
                    className="w-full"
                  >
                    <ImageIcon className="size-4 mr-2" />
                    Xem tất cả ảnh ({dailyLog.photos.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Thông tin thi công
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <ClockIcon className="size-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-blue-900">{dailyLog.workHours}h</p>
                  <p className="text-sm text-blue-600">Giờ làm việc</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <UsersIcon className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-900">{dailyLog.workersCount}</p>
                  <p className="text-sm text-green-600">Công nhân</p>
                </div>
              </div>

              {dailyLog.weather && (
                <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <span className="text-2xl">{getWeatherIcon(dailyLog.weather)}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-orange-900 capitalize">{dailyLog.weather}</p>
                    <p className="text-sm text-orange-600">Thời tiết</p>
                  </div>
                </div>
              )}

              {dailyLog.temperature && (
                <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <ThermometerIcon className="size-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-red-900">{dailyLog.temperature}°C</p>
                    <p className="text-sm text-red-600">{getTemperatureLabel(dailyLog.temperature)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-600" />
                Thông tin dự án
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ID Dự án:</span>
                <Badge variant="outline">{dailyLog.projectId}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ngày tạo:</span>
                <span className="text-sm font-medium">{formatDateTime(dailyLog.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Người tạo:</span>
                <Badge variant="secondary" className="text-xs">
                  {dailyLog.createdById || 'Không xác định'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cập nhật:</span>
                <span className="text-sm font-medium">{formatDateTime(dailyLog.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusIcon className="h-5 w-5 text-gray-600" />
                Thao tác nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/projects/${projectId}/daily-logs/new`)}
              >
                <PlusIcon className="size-4 mr-2" />
                Tạo nhật ký mới
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/projects/${projectId}/daily-logs`)}
              >
                <CalendarIcon className="size-4 mr-2" />
                Xem tất cả nhật ký
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/projects/${projectId}`)}
              >
                <Building2 className="size-4 mr-2" />
                Về dự án
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        photos={galleryPhotos}
        title={galleryTitle}
      />
    </div>
  );
}