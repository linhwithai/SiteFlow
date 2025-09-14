'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ClockIcon, CloudIcon, ThermometerIcon, UsersIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { DailyLogPhotoUpload } from '@/components/DailyLogPhotoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CreateDailyLogRequest, DailyLog, ProjectPhoto, UpdateDailyLogRequest } from '@/types/DailyLog';

// Validation schema
const dailyLogFormSchema = z.object({
  logDate: z.string().min(1, 'Ngày làm việc là bắt buộc'),
  weather: z.string().max(100, 'Mô tả thời tiết quá dài').optional(),
  temperature: z.number().int().min(-50).max(60, 'Nhiệt độ phải từ -50 đến 60°C').optional(),
  workDescription: z.string().min(1, 'Mô tả công việc là bắt buộc').max(2000, 'Mô tả công việc quá dài'),
  workHours: z.number().int().min(0).max(24, 'Số giờ làm việc phải từ 0 đến 24').default(8),
  workersCount: z.number().int().min(0, 'Số công nhân phải không âm').default(0),
  issues: z.string().max(1000, 'Mô tả vấn đề quá dài').optional(),
  notes: z.string().max(1000, 'Ghi chú quá dài').optional(),
});

type DailyLogFormData = z.infer<typeof dailyLogFormSchema>;

type DailyLogFormProps = {
  projectId: number;
  dailyLog?: DailyLog;
  onSubmit: (data: CreateDailyLogRequest | UpdateDailyLogRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onPhotoUpload?: (file: File) => Promise<void>;
  onPhotoDelete?: (photoId: string) => Promise<void>;
  onPhotoUpdateCaption?: (photoId: string, caption: string) => Promise<void>;
  photos?: ProjectPhoto[];
  isPhotoLoading?: boolean;
};

export function DailyLogForm({ 
  projectId, 
  dailyLog, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  onPhotoUpload,
  onPhotoDelete,
  onPhotoUpdateCaption,
  photos = [],
  isPhotoLoading = false,
}: DailyLogFormProps) {
  const form = useForm<DailyLogFormData>({
    resolver: zodResolver(dailyLogFormSchema),
    defaultValues: {
      logDate: dailyLog ? new Date(dailyLog.logDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      weather: dailyLog?.weather || '',
      temperature: dailyLog?.temperature || undefined,
      workDescription: dailyLog?.workDescription || '',
      workHours: dailyLog?.workHours || 8,
      workersCount: dailyLog?.workersCount || 0,
      issues: dailyLog?.issues || '',
      notes: dailyLog?.notes || '',
    },
  });

  const handleSubmit = async (data: DailyLogFormData) => {
    const submitData = {
      ...data,
      logDate: new Date(data.logDate).toISOString(),
      projectId,
    };

    await onSubmit(submitData);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="size-5" />
          {dailyLog ? 'Chỉnh sửa Nhật ký Công trình' : 'Tạo Nhật ký Công trình Mới'}
        </CardTitle>
        <CardDescription>
          {dailyLog ? 'Cập nhật thông tin nhật ký công trình' : 'Ghi lại tiến độ công việc hàng ngày'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Log Date */}
            <FormField
              control={form.control}
              name="logDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày làm việc *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weather and Temperature Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="weather"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CloudIcon className="size-4" />
                      Thời tiết
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Nắng, mưa, âm u..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ThermometerIcon className="size-4" />
                      Nhiệt độ (°C)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 25"
                        {...field}
                        onChange={e => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Work Description */}
            <FormField
              control={form.control}
              name="workDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả công việc *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết công việc đã thực hiện trong ngày..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Work Hours and Workers Count Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="workHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ClockIcon className="size-4" />
                      Số giờ làm việc
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        {...field}
                        onChange={e => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workersCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UsersIcon className="size-4" />
                      Số công nhân
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={e => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Issues */}
            <FormField
              control={form.control}
              name="issues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vấn đề phát sinh</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả các vấn đề, khó khăn gặp phải trong ngày..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú thêm</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Các ghi chú khác về công trình..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            {onPhotoUpload && onPhotoDelete && onPhotoUpdateCaption && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ảnh công trình</h3>
                  <p className="text-sm text-gray-600">
                    Tải lên ảnh để ghi lại tiến độ công việc hàng ngày
                  </p>
                </div>
                <DailyLogPhotoUpload
                  photos={photos}
                  onUpload={onPhotoUpload}
                  onDelete={onPhotoDelete}
                  onUpdateCaption={onPhotoUpdateCaption}
                  isLoading={isPhotoLoading}
                  maxPhotos={10}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? 'Đang lưu...' : (dailyLog ? 'Cập nhật' : 'Tạo mới')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
