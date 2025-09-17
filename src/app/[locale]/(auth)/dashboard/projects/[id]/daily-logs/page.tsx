'use client';

import { ArrowLeft, CalendarIcon, PlusIcon, BarChart3, TrendingUp, Clock, Users, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Breadcrumb } from '@/components/Breadcrumb';
import { DailyLogList } from '@/components/DailyLogList';
import { DailyLogModal } from '@/components/DailyLogModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import type { CreateDailyLogRequest, DailyLog, ProjectPhoto, UpdateDailyLogRequest } from '@/types/DailyLog';

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

export default function ProjectDailyLogsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDailyLogModalOpen, setIsDailyLogModalOpen] = useState(false);
  const [editingDailyLog, setEditingDailyLog] = useState<DailyLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<Array<{file: File, cloudinaryResult: any}>>([]);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use Daily Logs hook
  const {
    dailyLogs,
    stats: dailyLogStats,
    loading: isLoadingDailyLogs,
    createDailyLog,
    updateDailyLog,
    deleteDailyLog,
    uploadPhoto,
    deletePhoto,
    applyFilters,
    changePage,
    pagination,
    fetchDailyLogs,
    fetchStats,
  } = useDailyLogs({ projectId: Number(projectId) });

  // Fetch project details
  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Dự án không tồn tại hoặc đã bị xóa');
          return;
        }
        throw new Error('Failed to fetch project');
      }

      const projectData: Project = await response.json();
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Không thể tải thông tin dự án. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh both project data and daily logs data
      await Promise.all([
        fetchProject(),
        fetchDailyLogs(pagination?.page || 1, filters),
        fetchStats()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Refresh daily logs when component mounts (user navigates back)
  useEffect(() => {
    if (projectId) {
      fetchDailyLogs(1, {}); // Always fetch first page with no filters
      fetchStats();
    }
  }, [projectId]); // Only depend on projectId to avoid infinite loops

  // Refresh data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleFocus = () => {
      if (projectId) {
        // Page became visible, refresh data
        setRefreshTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [projectId]);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && projectId) {
      fetchDailyLogs(pagination?.page || 1, {});
      fetchStats();
    }
  }, [refreshTrigger, projectId, pagination?.page, fetchDailyLogs, fetchStats]);

  // Daily Log handlers
  const handleCreateDailyLog = () => {
    router.push(`/dashboard/projects/${projectId}/daily-logs/new`);
  };

  const handleEditDailyLog = (dailyLog: DailyLog) => {
    setEditingDailyLog(dailyLog);
    setPhotos(dailyLog.photos || []);
    setPendingPhotos([]);
    setIsDailyLogModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDailyLogModalOpen(false);
    setEditingDailyLog(null);
    setPhotos([]);
    setPendingPhotos([]);
  };

  const handleDeleteDailyLog = async (dailyLog: DailyLog) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhật ký này?')) {
      try {
        await deleteDailyLog(dailyLog.id);
      } catch (error) {
        console.error('Error deleting daily log:', error);
      }
    }
  };

  const handleDailyLogSubmit = async (data: CreateDailyLogRequest | UpdateDailyLogRequest) => {
    try {
      if (editingDailyLog) {
        // Update existing daily log
        await updateDailyLog(editingDailyLog.id, data as UpdateDailyLogRequest);
        // Upload any pending photos
        if (pendingPhotos.length > 0) {
          await uploadPendingPhotos(editingDailyLog.id);
        }
        setIsDailyLogModalOpen(false);
      } else {
        // Create new daily log first
        const newDailyLog = await createDailyLog(data as CreateDailyLogRequest);
        // Upload any pending photos
        if (pendingPhotos.length > 0) {
          await uploadPendingPhotos(newDailyLog.id);
        }
        setIsDailyLogModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving daily log:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  // Upload pending photos to daily log
  const uploadPendingPhotos = async (dailyLogId: number) => {
    try {
      setIsPhotoLoading(true);
      for (const pendingPhoto of pendingPhotos) {
        // Save to database using Cloudinary result
        const photoResponse = await fetch(`/api/projects/${projectId}/daily-logs/${dailyLogId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: pendingPhoto.cloudinaryResult.data.publicId,
            originalName: pendingPhoto.file.name,
            fileUrl: pendingPhoto.cloudinaryResult.data.url,
            thumbnailUrl: pendingPhoto.cloudinaryResult.data.thumbnailUrl || undefined,
            fileSize: pendingPhoto.file.size,
            mimeType: pendingPhoto.file.type,
          }),
        });

        if (!photoResponse.ok) {
          const error = await photoResponse.json();
          throw new Error(error.message || 'Failed to save photo');
        }

        const photo = await photoResponse.json();
        setPhotos(prev => [...prev, photo]);
      }
      setPendingPhotos([]);
    } catch (error) {
      console.error('Error uploading pending photos:', error);
      throw error;
    } finally {
      setIsPhotoLoading(false);
    }
  };

  // Upload file to Cloudinary first
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'daily-logs');
    formData.append('public_id', `daily-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload to Cloudinary');
    }

    return await response.json();
  };

  // Photo handlers
  const handlePhotoUpload = async (file: File) => {
    try {
      setIsUploadingToCloudinary(true);
      
      // Upload to Cloudinary first
      const cloudinaryResult = await uploadToCloudinary(file);
      
      if (editingDailyLog) {
        // If editing existing daily log, save to database immediately
        const newPhoto = await uploadPhoto(editingDailyLog.id, file);
        setPhotos(prev => [...prev, newPhoto]);
      } else {
        // If creating new daily log, store Cloudinary result for later
        const pendingPhoto = {
          file,
          cloudinaryResult,
        };
        setPendingPhotos(prev => [...prev, pendingPhoto]);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    } finally {
      setIsUploadingToCloudinary(false);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (editingDailyLog) {
      // Delete existing photo
      try {
        await deletePhoto(editingDailyLog.id, photoId);
        setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
      }
    } else {
      // Remove from pending photos (using index as ID for pending photos)
      const index = parseInt(photoId);
      if (!isNaN(index)) {
        setPendingPhotos(prev => prev.filter((_, i) => i !== index));
      }
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dự án', href: '/dashboard/projects' }, { label: 'Đang tải...' }]} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải thông tin dự án...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dự án', href: '/dashboard/projects' }, { label: 'Lỗi' }]} />
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Không tìm thấy dự án'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
            <Link href="/dashboard/projects">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách dự án
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
      label: 'Nhật ký thi công',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
              Nhật ký thi công
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600 dark:text-gray-400">
                Dự án: {project.name}
              </p>
              <Badge variant="secondary" className="text-xs">
                {project.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={handleCreateDailyLog} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Thêm nhật ký
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Card */}
      {dailyLogStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng nhật ký</p>
                  <p className="text-2xl font-bold text-purple-600">{dailyLogStats.totalLogs || 0}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Giờ làm việc</p>
                  <p className="text-2xl font-bold text-green-600">{dailyLogStats.totalWorkHours || 0}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng lao động</p>
                  <p className="text-2xl font-bold text-blue-600">{dailyLogStats.totalLaborCount || 0}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">7 ngày qua</p>
                  <p className="text-2xl font-bold text-orange-600">{dailyLogStats.recentActivity || 0}</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-purple-600" />
            Danh sách nhật ký thi công
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DailyLogList
            dailyLogs={dailyLogs || []}
            total={pagination?.total || 0}
            page={pagination?.page || 1}
            limit={pagination?.limit || 10}
            onPageChange={changePage}
            onFiltersChange={applyFilters}
            onEdit={handleEditDailyLog}
            onDelete={handleDeleteDailyLog}
            onView={(dailyLog) => {
              // View is now handled by navigation to detail page
              console.log('Viewing daily log:', dailyLog.id);
            }}
            isLoading={isLoadingDailyLogs}
            projectId={parseInt(params.id as string)}
          />
        </CardContent>
      </Card>

      {/* Daily Log Modal */}
      <DailyLogModal
        isOpen={isDailyLogModalOpen}
        onClose={handleCloseModal}
        projectId={Number(project.id)}
        projectName={project.name}
        dailyLog={editingDailyLog || undefined}
        onSubmit={handleDailyLogSubmit}
        isLoading={isLoadingDailyLogs}
        onPhotoUpload={handlePhotoUpload}
        onPhotoDelete={handlePhotoDelete}
        photos={photos}
        pendingPhotos={pendingPhotos}
        isPhotoLoading={isPhotoLoading}
        isUploadingToCloudinary={isUploadingToCloudinary}
      />
    </div>
  );
}