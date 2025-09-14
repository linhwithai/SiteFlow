'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { DailyLogList } from '@/components/DailyLogList';
import { DailyLogModal } from '@/components/DailyLogModal';
import { Button } from '@/components/ui/button';
import { useDailyLogs } from '@/hooks/useDailyLogs';

export default function DailyLogsPage() {
  const {
    dailyLogs,
    stats,
    loading,
    error,
    // filters,
    setFilters,
    fetchDailyLogs,
    createDailyLog,
    updateDailyLog,
    deleteDailyLog,
    uploadPhoto,
    deletePhoto,
    updatePhotoCaption,
  } = useDailyLogs();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  const handleCreateLog = () => {
    setEditingLog(null);
    setIsModalOpen(true);
  };

  const handleEditLog = (log: any) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleDeleteLog = async (id: any) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhật ký này?')) {
      await deleteDailyLog(id);
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingLog) {
      await updateDailyLog((editingLog as any).id, data);
    } else {
      await createDailyLog(data);
    }
    setIsModalOpen(false);
    setEditingLog(null);
  };

  const handlePhotoUpload = async (file) => {
    if (!editingLog) return;
    
    try {
      setIsPhotoLoading(true);
      await uploadPhoto(editingLog.id, file);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handlePhotoDelete = async (photoId) => {
    if (!editingLog) return;
    
    try {
      await deletePhoto(editingLog.id, photoId);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handlePhotoUpdateCaption = async (photoId, caption) => {
    if (!editingLog) return;
    
    try {
      await updatePhotoCaption(editingLog.id, photoId, caption);
    } catch (error) {
      console.error('Error updating photo caption:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600">
              Lỗi:
              {error}
            </p>
            <Button onClick={() => fetchDailyLogs()} className="mt-4">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhật ký Công trình</h1>
          <p className="mt-2 text-muted-foreground">
            Quản lý và theo dõi tiến độ công việc hàng ngày
          </p>
        </div>
        <Button onClick={handleCreateLog} className="flex items-center gap-2">
          <Plus className="size-4" />
          Tạo nhật ký mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
              <svg className="size-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng nhật ký</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
              <svg className="size-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tuần này</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.thisWeek || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900">
              <svg className="size-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng giờ làm</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.totalWorkHours || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
              <svg className="size-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng công nhân</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.totalWorkers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Logs List */}
      <DailyLogList
        dailyLogs={dailyLogs}
        total={dailyLogs.length}
        page={1}
        limit={10}
        onPageChange={() => {}}
        onEdit={handleEditLog}
        onDelete={handleDeleteLog}
        // filters={filters}
        onFiltersChange={setFilters}
        isLoading={loading}
        onCreateNew={handleCreateLog}
      />

      {/* Modal */}
      <DailyLogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLog(null);
        }}
        onSubmit={handleSubmit}
        dailyLog={editingLog || undefined}
        projectId={1}
        onPhotoUpload={handlePhotoUpload}
        onPhotoDelete={handlePhotoDelete}
        onPhotoUpdateCaption={handlePhotoUpdateCaption}
        isPhotoLoading={isPhotoLoading}
      />
    </div>
  );
}
