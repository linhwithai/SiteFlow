'use client';

import { BarChart3, CalendarIcon, Download, EditIcon, FileTextIcon, PlusIcon, TrashIcon, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DailyLogList } from '@/components/DailyLogList';
import { DailyLogModal } from '@/components/DailyLogModal';
import { PhotoGallery } from '@/components/PhotoGallery';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ProjectOverview } from '@/components/ProjectOverview';
import { RecentPhotosOverview } from '@/components/RecentPhotosOverview';
import { WorkItemList } from '@/components/WorkItemList';
import { WorkItemStats } from '@/components/WorkItemStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useWorkItems } from '@/hooks/useWorkItems';
import type { CreateDailyLogRequest, DailyLog, UpdateDailyLogRequest } from '@/types/DailyLog';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';
import type { Project } from '@/types/Project';

type ProjectDetailProps = {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  isLoading?: boolean;
};

const statusLabels = {
  [CONSTRUCTION_PROJECT_STATUS.PLANNING]: 'Lập kế hoạch',
  [CONSTRUCTION_PROJECT_STATUS.ACTIVE]: 'Đang thực hiện',
  [CONSTRUCTION_PROJECT_STATUS.ON_HOLD]: 'Tạm dừng',
  [CONSTRUCTION_PROJECT_STATUS.COMPLETED]: 'Hoàn thành',
  [CONSTRUCTION_PROJECT_STATUS.CANCELLED]: 'Hủy bỏ',
};

const statusColors = {
  [CONSTRUCTION_PROJECT_STATUS.PLANNING]: 'bg-blue-100 text-blue-800',
  [CONSTRUCTION_PROJECT_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [CONSTRUCTION_PROJECT_STATUS.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [CONSTRUCTION_PROJECT_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800',
  [CONSTRUCTION_PROJECT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
};

export function ProjectDetail({ project, onEdit, onDelete, isLoading = false }: ProjectDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Daily Logs state
  const [isDailyLogModalOpen, setIsDailyLogModalOpen] = useState(false);
  const [editingDailyLog, setEditingDailyLog] = useState<DailyLog | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  // const [deletingDailyLog, setDeletingDailyLog] = useState<DailyLog | null>(null);


  // Use Daily Logs hook
  const {
    dailyLogs,
    stats: dailyLogStats,
    loading: isLoadingDailyLogs,
    createDailyLog,
    updateDailyLog,
    deleteDailyLog,
    applyFilters,
    changePage,
  } = useDailyLogs({ projectId: Number(project.id) });

  // Work Items state
  const [availableTemplates, setAvailableTemplates] = useState<Array<{ id: string; name: string; description: string; workItemCount: number }>>([]);

  // Work Items hook
  const {
    workItems,
    stats: workItemStats,
    isLoading: isLoadingWorkItems,
    error: workItemError,
    filters: workItemFilters,
    setFilters: setWorkItemFilters,
    createWorkItem,
    updateWorkItem,
    deleteWorkItem,
    importFromTemplate,
    clearError: clearWorkItemError,
  } = useWorkItems({ projectId: project.id, autoFetch: true });

  // Photo Upload state
  const {
    photos,
    isUploading: isUploadingPhoto,
    error: photoError,
    uploadPhoto,
    removePhoto,
    downloadPhoto,
    clearError: clearPhotoError,
    loadPhotos,
  } = usePhotoUpload({
    folder: `projects/${project.id}`,
    tags: ['project', project.name],
    projectId: Number(project.id),
  });

  // Load photos on component mount
  useEffect(() => {
    if (project?.id) {
      console.log('🔄 Loading photos for project:', project.id);
      loadPhotos();
    }
  }, [project?.id, loadPhotos]);

  // Load work item templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(`/api/projects/${project.id}/work-items/import`);
        if (response.ok) {
          const data = await response.json();
          setAvailableTemplates(data.templates || []);
        }
      } catch (error) {
        console.error('Error fetching work item templates:', error);
      }
    };

    if (project?.id) {
      fetchTemplates();
    }
  }, [project?.id]);

  // Auto-select photo when selectedPhotoId changes
  useEffect(() => {
    if (selectedPhotoId && photos.length > 0) {
      // Find the photo by ID and trigger selection
      const photo = photos.find(p => p.id === selectedPhotoId);
      if (photo) {
        console.log('📸 Auto-selecting photo:', photo.name);
        // Photo selection is now handled by PhotoGallery component
      }
    }
  }, [selectedPhotoId, photos]);

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (!amount) return 'N/A';
    
    // If it's already a formatted string, return as is
    if (typeof amount === 'string') {
      return amount;
    }
    
    // If it's a number, format it
    if (typeof amount === 'number') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    }
    
    return 'N/A';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    // Multi-step confirmation for project deletion
    const step1 = confirm(
      `⚠️ CẢNH BÁO NGHIÊM TRỌNG ⚠️\n\n`
      + `Bạn sắp XÓA VĨNH VIỄN dự án "${project.name}"!\n\n`
      + `Hành động này sẽ xóa:\n`
      + `• Tất cả ảnh và tài liệu của dự án (cả trong database và Cloudinary)\n`
      + `• Tất cả nhật ký công trình\n`
      + `• Tất cả dữ liệu liên quan\n\n`
      + `Hành động này KHÔNG THỂ HOÀN TÁC!\n\n`
      + `Bạn có chắc chắn muốn tiếp tục?`,
    );

    if (!step1) {
      return;
    }

    // Second confirmation with project name verification
    const projectName = prompt(
      `Để xác nhận việc xóa dự án, vui lòng nhập chính xác tên dự án:\n\n`
      + `"${project.name}"\n\n`
      + `Nhập tên dự án để tiếp tục:`,
    );

    if (projectName !== project.name) {
      alert('Tên dự án không khớp! Việc xóa đã bị hủy để bảo vệ dữ liệu.');
      return;
    }

    // Final confirmation
    const step3 = confirm(
      `🚨 XÁC NHẬN CUỐI CÙNG 🚨\n\n`
      + `Bạn sắp XÓA VĨNH VIỄN dự án "${project.name}"!\n\n`
      + `Sau khi xóa, tất cả dữ liệu sẽ bị mất vĩnh viễn!\n\n`
      + `Bạn có chắc chắn 100% muốn xóa dự án này?\n\n`
      + `Nhấn OK để xóa, Cancel để hủy.`,
    );

    if (!step3) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(project);
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Có lỗi xảy ra khi xóa dự án. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Daily Log handlers
  const handleCreateDailyLog = () => {
    setEditingDailyLog(null);
    setIsDailyLogModalOpen(true);
  };

  const handleEditDailyLog = (dailyLog: DailyLog) => {
    setEditingDailyLog(dailyLog);
    setIsDailyLogModalOpen(true);
  };

  const handleDeleteDailyLog = async (dailyLog: DailyLog) => {
    // eslint-disable-next-line no-alert
    if (confirm('Bạn có chắc chắn muốn xóa nhật ký này?')) {
      try {
        // setDeletingDailyLog(dailyLog);
        await deleteDailyLog(dailyLog.id);
      } catch (error) {
        console.error('Error deleting daily log:', error);
      } finally {
        // setDeletingDailyLog(null);
      }
    }
  };

  // Work Item handlers
  const handleCreateWorkItem = async (data: any) => {
    try {
      await createWorkItem(data);
    } catch (error) {
      console.error('Error creating work item:', error);
    }
  };

  const handleUpdateWorkItem = async (id: number, data: any) => {
    try {
      await updateWorkItem(id, data);
    } catch (error) {
      console.error('Error updating work item:', error);
    }
  };

  const handleDeleteWorkItem = async (id: number) => {
    try {
      await deleteWorkItem(id);
    } catch (error) {
      console.error('Error deleting work item:', error);
    }
  };

  const handleImportFromTemplate = async (templateId: string) => {
    try {
      await importFromTemplate(templateId);
    } catch (error) {
      console.error('Error importing work items:', error);
    }
  };

  const handleWorkItemFilterChange = (key: string, value: string) => {
    // Convert "all" to empty string for API filtering
    const filterValue = value === 'all' ? '' : value;
    setWorkItemFilters({ ...workItemFilters, [key]: filterValue });
  };

  const handleDailyLogSubmit = async (data: CreateDailyLogRequest | UpdateDailyLogRequest) => {
    try {
      if (editingDailyLog) {
        await updateDailyLog(editingDailyLog.id, data as UpdateDailyLogRequest);
      } else {
        await createDailyLog(data as CreateDailyLogRequest);
      }
    } catch (error) {
      console.error('Error saving daily log:', error);
      throw error; // Re-throw to let the form handle the error
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
      {/* Enhanced Header with Key Info */}
      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-3xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[project.status]}`}
              >
                {statusLabels[project.status]}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {project.startDate ? formatDate(project.startDate) : 'N/A'}
                {' '}
                -
                {project.endDate ? formatDate(project.endDate) : 'N/A'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Budget:
                {' '}
                {project.budget ? formatCurrency(project.budget) : 'N/A'}
              </span>
              {project.investor && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Chủ đầu tư: {project.investor}
                </span>
              )}
              {project.contractor && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Đơn vị thi công: {project.contractor}
                </span>
              )}
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
              className="flex items-center gap-2 border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:border-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              title="⚠️ CẢNH BÁO: Xóa dự án sẽ xóa vĩnh viễn tất cả dữ liệu!"
            >
              <TrashIcon className="size-4" />
              {isDeleting ? 'Đang xóa...' : 'Xóa dự án'}
            </Button>
          </div>
        </div>

        {/* Interactive Stats Cards with Actions */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Progress Card */}
          <div className="group relative rounded-lg border border-blue-200 bg-white/50 p-4 text-center transition-all duration-200 hover:shadow-lg hover:shadow-blue-100 dark:border-blue-800 dark:bg-gray-800/50 dark:hover:shadow-blue-900/20">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {(() => {
                // Calculate progress based on project status and actual data
                switch (project.status) {
                  case CONSTRUCTION_PROJECT_STATUS.PLANNING:
                    return '10%';
                  case CONSTRUCTION_PROJECT_STATUS.ACTIVE:
                    // Calculate based on time elapsed if we have dates
                    if (project.startDate && project.endDate) {
                      const start = new Date(project.startDate);
                      const end = new Date(project.endDate);
                      const today = new Date();
                      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                      const elapsedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                      const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 10), 90);
                      return `${Math.round(progress)}%`;
                    }
                    return '50%';
                  case CONSTRUCTION_PROJECT_STATUS.ON_HOLD:
                    return '30%';
                  case CONSTRUCTION_PROJECT_STATUS.COMPLETED:
                    return '100%';
                  case CONSTRUCTION_PROJECT_STATUS.CANCELLED:
                    return '0%';
                  default:
                    return '0%';
                }
              })()}
            </div>
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Tiến độ</div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Dự án</div>

            {/* Hover Actions */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-blue-50/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-blue-900/20">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-white text-blue-600 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-blue-900/30">
                  <BarChart3 className="mr-1 size-3" />
                  Xem báo cáo
                </Button>
                <Button size="sm" variant="outline" className="bg-white text-blue-600 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-blue-900/30">
                  <CalendarIcon className="mr-1 size-3" />
                  Timeline
                </Button>
              </div>
            </div>
          </div>

          {/* Days Remaining Card */}
          <div className="group relative rounded-lg border border-green-200 bg-white/50 p-4 text-center transition-all duration-200 hover:shadow-lg hover:shadow-green-100 dark:border-green-800 dark:bg-gray-800/50 dark:hover:shadow-green-900/20">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {(() => {
                if (!project.endDate) return 'N/A';
                
                const today = new Date();
                const endDate = new Date(project.endDate);
                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) return 'Quá hạn';
                if (diffDays === 0) return 'Hôm nay';
                return diffDays.toString();
              })()}
            </div>
            <div className="text-sm font-medium text-green-700 dark:text-green-300">Ngày còn lại</div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Hoàn thành</div>

            {/* Hover Actions */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-green-50/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-green-900/20">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-white text-green-600 hover:bg-green-100 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-green-900/30">
                  <CalendarIcon className="mr-1 size-3" />
                  Xem lịch
                </Button>
                <Button size="sm" variant="outline" className="bg-white text-green-600 hover:bg-green-100 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-green-900/30">
                  <BarChart3 className="mr-1 size-3" />
                  Cập nhật
                </Button>
              </div>
            </div>
          </div>

          {/* Daily Logs Card */}
          <div className="group relative rounded-lg border border-purple-200 bg-white/50 p-4 text-center transition-all duration-200 hover:shadow-lg hover:shadow-purple-100 dark:border-purple-800 dark:bg-gray-800/50 dark:hover:shadow-purple-900/20">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{dailyLogStats?.total || 0}</div>
            <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Nhật ký</div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Công trình</div>

            {/* Hover Actions */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-purple-50/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-purple-900/20">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-white text-purple-600 hover:bg-purple-100 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-purple-900/30" onClick={() => setActiveTab('daily-logs')}>
                  <CalendarIcon className="mr-1 size-3" />
                  Xem nhật ký
                </Button>
                <Button size="sm" variant="outline" className="bg-white text-purple-600 hover:bg-purple-100 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-purple-900/30" onClick={handleCreateDailyLog}>
                  <PlusIcon className="mr-1 size-3" />
                  Thêm mới
                </Button>
              </div>
            </div>
          </div>

          {/* Photos Card */}
          <div className="group relative rounded-lg border border-orange-200 bg-white/50 p-4 text-center transition-all duration-200 hover:shadow-lg hover:shadow-orange-100 dark:border-orange-800 dark:bg-gray-800/50 dark:hover:shadow-orange-900/20">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{photos.length}</div>
            <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Hình ảnh</div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Công trường</div>

            {/* Hover Actions */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-orange-50/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-orange-900/20">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-white text-orange-600 hover:bg-orange-100 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/30" onClick={() => setActiveTab('photos')}>
                  <Upload className="mr-1 size-3" />
                  Xem ảnh
                </Button>
                <Button size="sm" variant="outline" className="bg-white text-orange-600 hover:bg-orange-100 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/30" onClick={() => setActiveTab('photos')}>
                  <PlusIcon className="mr-1 size-3" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs with Work Items */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <TabsList className="grid h-auto w-full grid-cols-4 bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="flex flex-col items-center gap-2 p-4 data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:border-blue-800 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <BarChart3 className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Tổng quan</div>
                  <div className="text-xs text-gray-500">Thông tin chung</div>
                </div>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="work-items"
              className="flex flex-col items-center gap-2 p-4 data-[state=active]:border data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm dark:data-[state=active]:border-indigo-800 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-300"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <FileTextIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Hạng mục</div>
                  <div className="text-xs text-gray-500">Công việc</div>
                </div>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="daily-logs"
              className="flex flex-col items-center gap-2 p-4 data-[state=active]:border data-[state=active]:border-purple-200 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm dark:data-[state=active]:border-purple-800 dark:data-[state=active]:bg-purple-900/20 dark:data-[state=active]:text-purple-300"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <CalendarIcon className="size-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 font-semibold">
                    Nhật ký
                    {dailyLogStats && dailyLogStats.total > 0 && (
                      <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs text-white">
                        {dailyLogStats.total}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Thi công</div>
                </div>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="photos"
              className="flex flex-col items-center gap-2 p-4 data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-sm dark:data-[state=active]:border-green-800 dark:data-[state=active]:bg-green-900/20 dark:data-[state=active]:text-green-300"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Upload className="size-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 font-semibold">
                    Hình ảnh
                    {photos.length > 0 && (
                      <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">
                        {photos.length}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Công trường</div>
                </div>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <ProjectOverview
            project={project}
            dailyLogStats={dailyLogStats || undefined}
            photosCount={photos.length}
            onViewDailyLogs={() => setActiveTab('daily-logs')}
            onViewPhotos={() => setActiveTab('photos')}
            onGenerateReport={() => {
              alert('Tạo báo cáo dự án');
            }}
            onViewTimeline={() => {
              alert('Xem timeline dự án');
            }}
          />

          {/* Recent Photos Overview */}
          <RecentPhotosOverview
            photos={photos
              .filter(photo => photo && photo.url) // Filter out invalid photos
              .map(photo => ({
                id: Number(photo.id),
                fileName: photo.name || '',
                originalName: photo.name || '',
                fileUrl: photo.url || '',
                thumbnailUrl: photo.url || '', // Use same URL for thumbnail
                caption: '',
                tags: Array.isArray(photo.tags) ? photo.tags.join(', ') : (photo.tags || ''),
                createdAt: (() => {
                  try {
                    if (!photo.uploadedAt) return new Date().toISOString();
                    const date = new Date(photo.uploadedAt);
                    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
                  } catch {
                    return new Date().toISOString();
                  }
                })(),
                uploadedById: '',
                dailyLogId: undefined,
              }))}
            onViewPhoto={(photo) => {
              // Navigate to photos tab and show the specific photo in gallery
              setActiveTab('photos');
              setSelectedPhotoId(photo.id.toString());
              console.log('Viewing photo:', photo);
            }}
            onDownloadPhoto={(photoId) => {
              const photo = photos.find(p => Number(p.id) === photoId);
              if (photo) {
                downloadPhoto(photo);
              }
            }}
            onDeletePhoto={photoId => removePhoto(photoId.toString())}
            maxPhotos={6}
            showActions
          />
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          {/* Unified Photo Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quản lý ảnh dự án</CardTitle>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Upload và quản lý hình ảnh cho dự án
                    {' '}
                    {project.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  {photos.length > 0 && (
                    <Button
                      onClick={() => {
                        // Download all photos as ZIP
                        console.log('Download all photos as ZIP');
                        alert('Tính năng download ZIP đang được phát triển!');
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="size-4" />
                      Tải tất cả
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enhanced Photo Upload */}
              <PhotoUpload
                onUpload={uploadPhoto}
                photos={photos}
                maxFiles={20}
                folder={`projects/${project.id}`}
                tags={['project', project.name]}
                disabled={isUploadingPhoto}
              />

              {/* Error Display */}
              {photoError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                  <p className="text-sm text-red-600 dark:text-red-400">{photoError}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearPhotoError}
                    className="mt-2"
                  >
                    Đóng
                  </Button>
                </div>
              )}

              {/* Photo Gallery */}
              <PhotoGallery
                photos={photos}
                onDelete={removePhoto}
                onDownload={downloadPhoto}
                selectedPhotoId={selectedPhotoId}
                onPhotoSelected={photoId => setSelectedPhotoId(photoId)}
              />

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-items" className="space-y-6">
          {/* Work Items Stats */}
          <WorkItemStats 
            stats={workItemStats} 
            isLoading={isLoadingWorkItems} 
          />

          {/* Work Items Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="size-5 text-indigo-600" />
                    Hạng mục công việc
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Quản lý và theo dõi các hạng mục thi công
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/dashboard/projects/${project.id}/work-items`)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FileTextIcon className="size-4" />
                    Xem tất cả
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WorkItemList
                workItems={workItems}
                isLoading={isLoadingWorkItems}
                onCreateWorkItem={handleCreateWorkItem}
                onUpdateWorkItem={handleUpdateWorkItem}
                onDeleteWorkItem={handleDeleteWorkItem}
                onImportFromTemplate={handleImportFromTemplate}
                availableTemplates={availableTemplates}
                search={workItemFilters.search}
                onSearchChange={(value) => handleWorkItemFilterChange('search', value)}
                workItemTypeFilter={workItemFilters.workItemType}
                onWorkItemTypeFilterChange={(value) => handleWorkItemFilterChange('workItemType', value)}
                statusFilter={workItemFilters.status}
                onStatusFilterChange={(value) => handleWorkItemFilterChange('status', value)}
                priorityFilter={workItemFilters.priority}
                onPriorityFilterChange={(value) => handleWorkItemFilterChange('priority', value)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-logs" className="space-y-6">
          {/* Enhanced Daily Logs Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="size-5 text-purple-600" />
                    Nhật ký thi công
                  </CardTitle>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Ghi chép và theo dõi tiến độ thi công hàng ngày
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/dashboard/projects/${project.id}/daily-logs`)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="size-4" />
                    Xem tất cả
                  </Button>
                  <Button
                    onClick={handleCreateDailyLog}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="size-4" />
                    Thêm nhật ký
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DailyLogList
                dailyLogs={dailyLogs}
                total={0}
                page={1}
                limit={10}
                onPageChange={changePage}
                onFiltersChange={applyFilters}
                onEdit={handleEditDailyLog}
                onDelete={handleDeleteDailyLog}
                onCreateNew={handleCreateDailyLog}
                isLoading={isLoadingDailyLogs}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Daily Log Modal */}
      <DailyLogModal
        isOpen={isDailyLogModalOpen}
        onClose={() => setIsDailyLogModalOpen(false)}
        projectId={Number(project.id)}
        projectName={project.name}
        dailyLog={editingDailyLog || undefined}
        onSubmit={handleDailyLogSubmit}
        isLoading={isLoadingDailyLogs}
      />
    </div>
  );
}
