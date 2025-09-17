'use client';

import { ArrowLeft, CalendarIcon, EditIcon, FileTextIcon, Upload, BarChart3, Users, MapPin, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectOverview } from '@/components/ProjectOverview';
import { DailyLogList } from '@/components/DailyLogList';
import { WorkItemList } from '@/components/WorkItemList';
import { PhotoGallery } from '@/components/PhotoGallery';
import { PhotoUpload } from '@/components/PhotoUpload';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import { useWorkItems } from '@/hooks/useWorkItems';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

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
  progress: number;
  clientName: string | null;
  clientContact: string | null;
  clientEmail: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  photos?: Array<{
    id: string;
    url: string;
    publicId: string;
    name: string;
    size: number;
    uploadedAt: Date;
    tags?: string[];
  }>;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks for data fetching
  const {
    dailyLogs,
    stats: dailyLogStats,
    isLoading: isLoadingDailyLogs,
    error: dailyLogError,
    fetchDailyLogs,
    fetchStats: fetchDailyLogStats,
  } = useDailyLogs({ projectId });

  const {
    workItems,
    stats: workItemStats,
    isLoading: isLoadingWorkItems,
    error: workItemError,
    fetchWorkItems,
    fetchStats: fetchWorkItemStats,
  } = useWorkItems({ projectId });

  const {
    handlePhotoUpload,
    handlePhotoDelete,
    isUploading,
    uploadProgress,
  } = usePhotoUpload({ projectId });

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data.success ? data.data : data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error('Error fetching project:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Fetch additional data
  useEffect(() => {
    if (projectId) {
      fetchDailyLogs(1, {});
      fetchWorkItems();
      fetchDailyLogStats();
      fetchWorkItemStats();
    }
  }, [projectId, fetchDailyLogs, fetchWorkItems, fetchDailyLogStats, fetchWorkItemStats]);

  const breadcrumbItems = [
    {
      label: 'Dự án',
      href: '/dashboard/projects',
    },
    {
      label: project?.name || 'Dự án',
      href: `/dashboard/projects/${projectId}`,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-500 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lỗi tải dữ liệu</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {project?.name || 'Dự án'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {project?.description || 'Mô tả dự án'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <EditIcon className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload ảnh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileTextIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hạng mục</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workItemStats?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nhật ký</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dailyLogStats?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tiến độ TB</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workItemStats?.averageProgress || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workItemStats?.completed || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="work-items" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            Hạng mục
          </TabsTrigger>
          <TabsTrigger value="daily-logs" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Nhật ký
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Hình ảnh
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectOverview project={project} />
        </TabsContent>

        <TabsContent value="work-items" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Hạng mục công việc</h2>
            <Link href={`/dashboard/projects/${projectId}/work-items`}>
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </div>
          <WorkItemList 
            workItems={workItems.slice(0, 5)} 
            isLoading={isLoadingWorkItems}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </TabsContent>

        <TabsContent value="daily-logs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Nhật ký thi công</h2>
            <Link href={`/dashboard/projects/${projectId}/daily-logs`}>
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </div>
          <DailyLogList 
            dailyLogs={dailyLogs.slice(0, 5)} 
            isLoading={isLoadingDailyLogs}
            onEdit={() => {}}
            onDelete={() => {}}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Hình ảnh dự án</h2>
            <Button 
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload ảnh'}
            </Button>
          </div>
          <PhotoGallery 
            photos={project?.photos || []} 
            onDelete={handlePhotoDelete}
          />
          <PhotoUpload
            onUpload={handlePhotoUpload}
            onDelete={handlePhotoDelete}
            photos={project?.photos || []}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

