'use client';

import { ArrowLeftIcon, CalendarIcon, ClockIcon, CloudIcon, EditIcon, ThermometerIcon, TrashIcon, UsersIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoGallery } from '@/components/PhotoGallery';
import type { DailyLog, ProjectPhoto } from '@/types/DailyLog';

type DailyLogDetailProps = {
  dailyLog: DailyLog;
  onEdit: (dailyLog: DailyLog) => void;
  onDelete: (dailyLog: DailyLog) => void;
  onBack: () => void;
  isLoading?: boolean;
  onPhotoDelete?: (photoId: string) => Promise<void>;
  onPhotoDownload?: (photo: ProjectPhoto) => Promise<void>;
};

export function DailyLogDetail({ 
  dailyLog, 
  onEdit, 
  onDelete, 
  onBack, 
  isLoading = false,
  onPhotoDelete,
  onPhotoDownload,
}: DailyLogDetailProps) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeftIcon className="mr-2 size-4" />
          Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CalendarIcon className="size-6" />
            Nhật ký Công trình
          </h1>
          <p className="text-muted-foreground">
            {formatDate(dailyLog.logDate)}
            {' '}
            -
            {formatTime(dailyLog.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onEdit(dailyLog)}
            disabled={isLoading}
          >
            <EditIcon className="mr-2 size-4" />
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(dailyLog)}
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <TrashIcon className="mr-2 size-4" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Work Description */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả công việc</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {dailyLog.workDescription}
              </p>
            </CardContent>
          </Card>

          {/* Issues */}
          {dailyLog.issues && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Vấn đề phát sinh</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {dailyLog.issues}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {dailyLog.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {dailyLog.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {dailyLog.photos && dailyLog.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ảnh công trình ({dailyLog.photos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoGallery
                  photos={dailyLog.photos.map(photo => ({
                    id: photo.id,
                    url: photo.url,
                    publicId: photo.publicId,
                    name: photo.name,
                    size: photo.size,
                    uploadedAt: photo.uploadedAt,
                    tags: photo.tags,
                  }))}
                  onDelete={onPhotoDelete}
                  onDownload={onPhotoDownload}
                  className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats and Info */}
        <div className="space-y-6">
          {/* Work Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê công việc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">Số giờ làm việc</span>
                </div>
                <Badge variant="secondary">
                  {dailyLog.workHours}
                  {' '}
                  giờ
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">Số công nhân</span>
                </div>
                <Badge variant="secondary">
                  {dailyLog.workersCount}
                  {' '}
                  người
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Weather Info */}
          {(dailyLog.weather || dailyLog.temperature) && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin thời tiết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyLog.weather && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudIcon className="size-4 text-muted-foreground" />
                      <span className="text-sm">Thời tiết</span>
                    </div>
                    <Badge variant="outline">
                      {dailyLog.weather}
                    </Badge>
                  </div>
                )}

                {dailyLog.temperature && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThermometerIcon className="size-4 text-muted-foreground" />
                      <span className="text-sm">Nhiệt độ</span>
                    </div>
                    <Badge variant="outline">
                      {dailyLog.temperature}
                      °C
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hệ thống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">ID nhật ký:</span>
                {' '}
                {dailyLog.id}
              </div>
              <div>
                <span className="font-medium">ID dự án:</span>
                {' '}
                {dailyLog.projectId}
              </div>
              <div>
                <span className="font-medium">Tạo bởi:</span>
                {' '}
                {dailyLog.createdById}
              </div>
              <div>
                <span className="font-medium">Tạo lúc:</span>
                {' '}
                {formatTime(dailyLog.createdAt)}
              </div>
              <div>
                <span className="font-medium">Cập nhật lúc:</span>
                {' '}
                {formatTime(dailyLog.updatedAt)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
