'use client';

import { DailyLogForm } from '@/components/DailyLogForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CreateDailyLogRequest, DailyLog, ProjectPhoto, UpdateDailyLogRequest } from '@/types/DailyLog';

type DailyLogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dailyLog?: DailyLog;
  projectId: number;
  projectName?: string;
  onSubmit: (data: CreateDailyLogRequest | UpdateDailyLogRequest) => Promise<void>;
  isLoading?: boolean;
  onPhotoUpload?: (file: File) => Promise<void>;
  onPhotoDelete?: (photoId: string) => Promise<void>;
  isPhotoLoading?: boolean;
  isUploadingToCloudinary?: boolean;
  photos?: ProjectPhoto[];
  pendingPhotos?: Array<{file: File, cloudinaryResult: any}>;
};

export function DailyLogModal({
  isOpen,
  onClose,
  dailyLog,
  projectId,
  projectName,
  onSubmit,
  isLoading = false,
  onPhotoUpload,
  onPhotoDelete,
  isPhotoLoading = false,
  isUploadingToCloudinary = false,
  photos = [],
  pendingPhotos = [],
}: DailyLogModalProps) {
  const handleSubmit = async (data: CreateDailyLogRequest | UpdateDailyLogRequest) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {dailyLog ? 'Chỉnh sửa Nhật ký Công trình' : 'Tạo Nhật ký Công trình Mới'}
            {projectName && (
              <span className="block text-sm font-normal text-gray-600 mt-1">
                Dự án: {projectName}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {dailyLog
              ? 'Cập nhật thông tin nhật ký công trình'
              : projectName 
                ? `Ghi lại tiến độ công việc hàng ngày cho dự án ${projectName}`
                : 'Ghi lại tiến độ công việc hàng ngày cho dự án'}
          </DialogDescription>
        </DialogHeader>

        <DailyLogForm
          dailyLog={dailyLog}
          projectId={projectId}
          projectName={projectName}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          onPhotoUpload={onPhotoUpload}
          onPhotoDelete={onPhotoDelete}
          photos={photos}
          pendingPhotos={pendingPhotos}
          isPhotoLoading={isPhotoLoading}
          isUploadingToCloudinary={isUploadingToCloudinary}
        />
      </DialogContent>
    </Dialog>
  );
}
