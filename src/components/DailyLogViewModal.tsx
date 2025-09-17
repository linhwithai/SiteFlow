'use client';

import { CalendarIcon, ClockIcon, CloudIcon, ImageIcon, ThermometerIcon, UsersIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { DailyLog } from '@/types/DailyLog';

type DailyLogViewModalProps = {
  dailyLog: DailyLog | null;
  isOpen: boolean;
  onClose: () => void;
};

export function DailyLogViewModal({ dailyLog, isOpen, onClose }: DailyLogViewModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!dailyLog) return null;

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="size-5" />
                Chi tiết nhật ký thi công
              </DialogTitle>
              <DialogDescription className="mt-1">
                {formatDate(dailyLog.logDate)} - Tạo lúc {formatTime(dailyLog.createdAt)}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{dailyLog.title}</CardTitle>
              <CardDescription>
                Nhật ký thi công ngày {formatDate(dailyLog.logDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">{dailyLog.workHours}</span> giờ
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">{dailyLog.workersCount}</span> người
                  </span>
                </div>
                {dailyLog.weather && (
                  <div className="flex items-center gap-2">
                    <CloudIcon className="size-4 text-muted-foreground" />
                    <span className="text-sm">{dailyLog.weather}</span>
                  </div>
                )}
                {dailyLog.temperature && (
                  <div className="flex items-center gap-2">
                    <ThermometerIcon className="size-4 text-muted-foreground" />
                    <span className="text-sm">
                      {dailyLog.temperature}°C
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mô tả công việc xây dựng</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {dailyLog.workDescription}
              </p>
            </CardContent>
          </Card>

          {/* Issues */}
          {dailyLog.issues && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-destructive">Vấn đề phát sinh trong thi công</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {dailyLog.issues}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {dailyLog.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ghi chú kỹ thuật</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {dailyLog.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {dailyLog.photos && dailyLog.photos.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  Hình ảnh thi công ({dailyLog.photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {dailyLog.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="group relative cursor-pointer"
                      onClick={() => setSelectedPhotoIndex(index)}
                    >
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={photo.url}
                          alt={photo.caption || photo.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">
                          {photo.name}
                        </p>
                        <p className="text-xs text-white/80">
                          {formatFileSize(photo.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Lightbox */}
          {dailyLog.photos && dailyLog.photos.length > 0 && (
            <Dialog open={selectedPhotoIndex >= 0} onOpenChange={() => setSelectedPhotoIndex(-1)}>
              <DialogContent className="max-w-5xl max-h-[90vh] p-0">
                <div className="relative">
                  <img
                    src={dailyLog.photos[selectedPhotoIndex]?.url}
                    alt={dailyLog.photos[selectedPhotoIndex]?.caption || dailyLog.photos[selectedPhotoIndex]?.name}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedPhotoIndex(-1)}
                      className="h-8 w-8 p-0"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 text-white p-3 rounded-lg">
                      <p className="font-medium">
                        {dailyLog.photos[selectedPhotoIndex]?.name}
                      </p>
                      <p className="text-sm text-white/80">
                        {formatFileSize(dailyLog.photos[selectedPhotoIndex]?.size || 0)}
                      </p>
                      {dailyLog.photos[selectedPhotoIndex]?.caption && (
                        <p className="text-sm text-white/80 mt-1">
                          {dailyLog.photos[selectedPhotoIndex]?.caption}
                        </p>
                      )}
                    </div>
                  </div>
                  {dailyLog.photos.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-2">
                        {dailyLog.photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedPhotoIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === selectedPhotoIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}







