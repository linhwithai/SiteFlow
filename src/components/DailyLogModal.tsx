'use client';

import { DailyLogForm } from '@/components/DailyLogForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CreateDailyLogRequest, DailyLog, ProjectPhoto, UpdateDailyLogRequest } from '@/types/DailyLog';

type DailyLogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dailyLog?: DailyLog;
  onSubmit: (data: CreateDailyLogRequest | UpdateDailyLogRequest) => Promise<void>;
  isLoading?: boolean;
  onPhotoUpload?: (file: File) => Promise<void>;
  onPhotoDelete?: (photoId: string) => Promise<void>;
  onPhotoUpdateCaption?: (photoId: string, caption: string) => Promise<void>;
  isPhotoLoading?: boolean;
  photos?: ProjectPhoto[];
};

export function DailyLogModal({
  isOpen,
  onClose,
  dailyLog,
  onSubmit,
  isLoading = false,
  onPhotoUpload,
  onPhotoDelete,
  onPhotoUpdateCaption,
  isPhotoLoading = false,
  photos = [],
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
          </DialogTitle>
          <DialogDescription>
            {dailyLog
              ? 'Cập nhật thông tin nhật ký công trình'
              : 'Ghi lại tiến độ công việc hàng ngày cho dự án'}
          </DialogDescription>
        </DialogHeader>

        <DailyLogForm
          dailyLog={dailyLog}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          onPhotoUpload={onPhotoUpload}
          onPhotoDelete={onPhotoDelete}
          onPhotoUpdateCaption={onPhotoUpdateCaption}
          photos={photos}
          isPhotoLoading={isPhotoLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
