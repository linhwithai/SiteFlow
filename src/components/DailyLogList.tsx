'use client';

import { CalendarIcon, ClockIcon, CloudIcon, EditIcon, ImageIcon, PlusIcon, ThermometerIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { DailyLog, DailyLogFilters } from '@/types/DailyLog';

type DailyLogListProps = {
  dailyLogs: DailyLog[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: DailyLogFilters) => void;
  onEdit: (dailyLog: DailyLog) => void;
  onDelete: (dailyLog: DailyLog) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
};

export function DailyLogList({
  dailyLogs,
  total,
  page,
  limit,
  onPageChange,
  onFiltersChange,
  onEdit,
  onDelete,
  onCreateNew,
  isLoading = false,
}: DailyLogListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ search: value || undefined });
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    onFiltersChange({
      logDateFrom: value ? new Date(value).toISOString() : undefined,
      logDateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
    });
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    onFiltersChange({
      logDateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
      logDateTo: value ? new Date(value).toISOString() : undefined,
    });
  };

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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Nhật ký Công trình</h2>
          <p className="text-muted-foreground">
            Tổng cộng
            {' '}
            {total}
            {' '}
            nhật ký
          </p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <PlusIcon className="size-4" />
          Tạo nhật ký mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Tìm kiếm</label>
              <Input
                placeholder="Tìm trong mô tả công việc, vấn đề, ghi chú..."
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Từ ngày</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => handleDateFromChange(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Đến ngày</label>
              <Input
                type="date"
                value={dateTo}
                onChange={e => handleDateToChange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Logs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Đang tải...</p>
          </div>
        ) : dailyLogs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CalendarIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Chưa có nhật ký nào</h3>
              <p className="mb-4 text-muted-foreground">
                Bắt đầu tạo nhật ký công trình đầu tiên của bạn
              </p>
              <Button onClick={onCreateNew}>
                <PlusIcon className="mr-2 size-4" />
                Tạo nhật ký mới
              </Button>
            </CardContent>
          </Card>
        ) : (
          dailyLogs.map(dailyLog => (
            <Card key={dailyLog.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CalendarIcon className="size-5" />
                      {formatDate(dailyLog.logDate)}
                    </CardTitle>
                    <CardDescription>
                      Tạo lúc
                      {' '}
                      {formatTime(dailyLog.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(dailyLog)}
                    >
                      <EditIcon className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(dailyLog)}
                      className="text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Work Description */}
                  <div>
                    <h4 className="mb-2 font-medium">Mô tả công việc</h4>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {dailyLog.workDescription}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">{dailyLog.workHours}</span>
                        {' '}
                        giờ
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">{dailyLog.workersCount}</span>
                        {' '}
                        người
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
                          {dailyLog.temperature}
                          °C
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Issues */}
                  {dailyLog.issues && (
                    <div>
                      <h4 className="mb-2 font-medium text-destructive">Vấn đề phát sinh</h4>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {dailyLog.issues}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {dailyLog.notes && (
                    <div>
                      <h4 className="mb-2 font-medium">Ghi chú</h4>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {dailyLog.notes}
                      </p>
                    </div>
                  )}

                  {/* Photo Preview */}
                  {dailyLog.photos && dailyLog.photos.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {dailyLog.photos.length} ảnh
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {dailyLog.photos.slice(0, 3).map((photo) => (
                          <div key={photo.id} className="flex-shrink-0">
                            <img
                              src={photo.url}
                              alt={photo.caption || photo.name}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          </div>
                        ))}
                        {dailyLog.photos.length > 3 && (
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              +{dailyLog.photos.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang
            {' '}
            {page}
            {' '}
            /
            {' '}
            {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
