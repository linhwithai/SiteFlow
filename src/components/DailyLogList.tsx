'use client';

import { CalendarIcon, ClockIcon, CloudIcon, EditIcon, EyeIcon, FilterIcon, ImageIcon, PlusIcon, SearchIcon, ThermometerIcon, TrashIcon, UsersIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { PhotoGalleryModal } from '@/components/PhotoGalleryModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { DailyLog, DailyLogFilters } from '@/types/DailyLog';

type DailyLogListProps = {
  dailyLogs?: DailyLog[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: DailyLogFilters) => void;
  onEdit: (dailyLog: DailyLog) => void;
  onDelete: (dailyLog: DailyLog) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
  error?: string | null;
  projectId: number;
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
  onView,
  onCreateNew,
  isLoading = false,
  error = null,
  projectId,
}: DailyLogListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');

  // Memoized handlers for better performance
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    onFiltersChange({ search: value || undefined });
  }, [onFiltersChange]);

  const handleDateFromChange = useCallback((value: string) => {
    setDateFrom(value);
    onFiltersChange({
      logDateFrom: value ? new Date(value).toISOString() : undefined,
      logDateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
    });
  }, [onFiltersChange, dateTo]);

  const handleDateToChange = useCallback((value: string) => {
    setDateTo(value);
    onFiltersChange({
      logDateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
      logDateTo: value ? new Date(value).toISOString() : undefined,
    });
  }, [onFiltersChange, dateFrom]);

  const handleView = useCallback((dailyLog: DailyLog) => {
    router.push(`/dashboard/projects/${projectId}/daily-logs/${dailyLog.id}`);
  }, [router, projectId]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    onFiltersChange({});
  }, [onFiltersChange]);

  // Memoized format functions
  const formatDate = useCallback((date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const handlePhotoGallery = useCallback((dailyLog: DailyLog) => {
    if (dailyLog.photos && dailyLog.photos.length > 0) {
      setGalleryPhotos(dailyLog.photos);
      setGalleryTitle(`${dailyLog.title || 'Nhật ký thi công'} - ${formatDate(dailyLog.logDate)}`);
      setGalleryOpen(true);
    }
  }, [formatDate]);

  const formatTime = useCallback((date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Memoized calculations
  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);
  const hasFilters = useMemo(() => searchTerm || dateFrom || dateTo, [searchTerm, dateFrom, dateTo]);
  const startIndex = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const endIndex = useMemo(() => Math.min(page * limit, total), [page, limit, total]);

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <XIcon className="size-8 text-destructive" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-destructive">
            Lỗi tải dữ liệu
          </h3>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground">
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Danh sách nhật ký thi công</h2>
          <p className="text-muted-foreground">
            Hiển thị
            {' '}
            {startIndex}
            -
            {endIndex}
            {' '}
            trong tổng số
            {' '}
            {total}
            {' '}
            nhật ký thi công
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <PlusIcon className="size-4" />
            Tạo nhật ký mới
          </Button>
        )}
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FilterIcon className="size-5" />
            <CardTitle className="text-lg">Bộ lọc</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm trong mô tả công việc, vấn đề kỹ thuật..."
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Từ ngày</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => handleDateFromChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Đến ngày</label>
              <Input
                type="date"
                value={dateTo}
                onChange={e => handleDateToChange(e.target.value)}
              />
            </div>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-2">
              <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  <SearchIcon className="size-3" />
                  "
                  {searchTerm}
                  "
                </Badge>
              )}
              {dateFrom && (
                <Badge variant="outline" className="gap-1">
                  <CalendarIcon className="size-3" />
                  Từ:
                  {' '}
                  {new Date(dateFrom).toLocaleDateString('vi-VN')}
                </Badge>
              )}
              {dateTo && (
                <Badge variant="outline" className="gap-1">
                  <CalendarIcon className="size-3" />
                  Đến:
                  {' '}
                  {new Date(dateTo).toLocaleDateString('vi-VN')}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 px-2 text-xs"
              >
                <XIcon className="mr-1 size-3" />
                Xóa tất cả
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Logs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="size-8" />
                      <Skeleton className="size-8" />
                      <Skeleton className="size-8" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (dailyLogs?.length || 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
                <CalendarIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {hasFilters ? 'Không tìm thấy nhật ký phù hợp' : 'Chưa có nhật ký thi công nào'}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                {hasFilters
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác.'
                  : 'Bắt đầu tạo nhật ký thi công đầu tiên để theo dõi tiến độ dự án.'}
              </p>
              <div className="flex justify-center gap-3">
                {hasFilters && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Xóa bộ lọc
                  </Button>
                )}
                {onCreateNew && !hasFilters && (
                  <Button onClick={onCreateNew}>
                    <PlusIcon className="mr-2 size-4" />
                    Tạo nhật ký đầu tiên
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          (dailyLogs || []).map(dailyLog => (
            <Card key={dailyLog.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-1 flex items-center gap-2 text-lg">
                      <CalendarIcon className="size-5 text-blue-600" />
                      {dailyLog.title || 'Nhật ký thi công'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="size-3" />
                        {formatDate(dailyLog.logDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        {formatTime(dailyLog.createdAt)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(dailyLog)}
                      className="hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(dailyLog)}
                      className="hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                      title="Chỉnh sửa"
                    >
                      <EditIcon className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(dailyLog)}
                      className="text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      title="Xóa"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Work Description */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-800">
                      <div className="size-2 rounded-full bg-blue-500" />
                      Mô tả công việc xây dựng
                    </h4>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                      {dailyLog.workDescription}
                    </p>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                        <ClockIcon className="size-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {dailyLog.workHours}
                          h
                        </p>
                        <p className="text-xs text-blue-600">Giờ làm việc</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
                        <UsersIcon className="size-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900">{dailyLog.workersCount}</p>
                        <p className="text-xs text-green-600">Công nhân</p>
                      </div>
                    </div>
                    {dailyLog.weather && (
                      <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-orange-100">
                          <CloudIcon className="size-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-900">{dailyLog.weather}</p>
                          <p className="text-xs text-orange-600">Thời tiết</p>
                        </div>
                      </div>
                    )}
                    {dailyLog.temperature && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-red-100">
                          <ThermometerIcon className="size-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-900">
                            {dailyLog.temperature}
                            °C
                          </p>
                          <p className="text-xs text-red-600">Nhiệt độ</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Issues */}
                  {dailyLog.issues && (
                    <div className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
                      <h4 className="mb-3 flex items-center gap-2 font-medium text-red-800">
                        <div className="size-2 rounded-full bg-red-500" />
                        Vấn đề phát sinh trong thi công
                      </h4>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-red-700">
                        {dailyLog.issues}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {dailyLog.notes && (
                    <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
                      <h4 className="mb-3 flex items-center gap-2 font-medium text-yellow-800">
                        <div className="size-2 rounded-full bg-yellow-500" />
                        Ghi chú kỹ thuật
                      </h4>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-yellow-700">
                        {dailyLog.notes}
                      </p>
                    </div>
                  )}

                  {/* Photo Gallery */}
                  {dailyLog.photos && dailyLog.photos.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="mb-3 flex items-center gap-2">
                        <ImageIcon className="size-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Hình ảnh thi công (
                          {dailyLog.photos.length}
                          )
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {dailyLog.photos.slice(0, 6).map(photo => (
                          <div
                            key={photo.id}
                            className="group relative shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-gray-50 transition-all hover:shadow-md"
                            onClick={() => handlePhotoGallery(dailyLog)}
                            title="Click để xem gallery"
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption || photo.name}
                              className="size-16 object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <div className="rounded-full bg-white/90 p-1">
                                <EyeIcon className="size-3 text-gray-700" />
                              </div>
                            </div>
                          </div>
                        ))}
                        {dailyLog.photos.length > 6 && (
                          <div
                            className="flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-lg border bg-gray-100 transition-all hover:bg-gray-200"
                            onClick={() => handlePhotoGallery(dailyLog)}
                            title="Click để xem tất cả ảnh"
                          >
                            <div className="text-center">
                              <span className="text-sm font-semibold text-gray-600">
                                +
                                {dailyLog.photos.length - 6}
                              </span>
                              <p className="text-xs text-gray-500">ảnh</p>
                            </div>
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

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Hiển thị
                {' '}
                {startIndex}
                -
                {endIndex}
                {' '}
                trong tổng số
                {' '}
                {total}
                {' '}
                nhật ký
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1"
                >
                  <span className="sr-only">Trang trước</span>
                  ←
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    if (pageNum > totalPages) {
                      return null;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className="size-8 p-0"
                        aria-label={`Trang ${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-1"
                >
                  <span className="sr-only">Trang sau</span>
                  →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
