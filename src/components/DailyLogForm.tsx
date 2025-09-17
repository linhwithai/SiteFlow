'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ClockIcon, CloudIcon, ThermometerIcon, UsersIcon, Building2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PhotoUpload } from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CreateDailyLogRequest, DailyLog, ProjectPhoto, UpdateDailyLogRequest } from '@/types/DailyLog';

// Validation schema
const dailyLogFormSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(200, 'Tiêu đề quá dài'),
  logDate: z.string().min(1, 'Ngày làm việc là bắt buộc'),
  weather: z.string().max(100, 'Mô tả thời tiết quá dài').optional(),
  temperature: z.number().int().min(15).max(35, 'Nhiệt độ phải từ 15 đến 35°C').optional(),
  workDescription: z.string().min(1, 'Mô tả công việc là bắt buộc').max(2000, 'Mô tả công việc quá dài'),
  workHours: z.number().int().min(0).max(24, 'Số giờ làm việc phải từ 0 đến 24').default(8),
  workersCount: z.number().int().min(0, 'Số công nhân phải không âm').default(0),
  issues: z.string().max(1000, 'Mô tả vấn đề quá dài').optional(),
  notes: z.string().max(1000, 'Ghi chú quá dài').optional(),
});

type DailyLogFormData = z.infer<typeof dailyLogFormSchema>;

type DailyLogFormProps = {
  dailyLog?: DailyLog;
  projectId: number;
  projectName?: string;
  onSubmit: (data: CreateDailyLogRequest | UpdateDailyLogRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onPhotoUpload?: (file: File) => Promise<void>;
  onPhotoDelete?: (photoId: string) => Promise<void>;
  photos?: ProjectPhoto[];
  pendingPhotos?: Array<{file: File, cloudinaryResult: any}>;
  isPhotoLoading?: boolean;
  isUploadingToCloudinary?: boolean;
  error?: string | null;
};

export function DailyLogForm({
  dailyLog,
  projectId,
  projectName,
  onSubmit,
  onCancel,
  isLoading = false,
  onPhotoUpload,
  onPhotoDelete,
  photos = [],
  pendingPhotos = [],
  isPhotoLoading = false,
  isUploadingToCloudinary = false,
  error = null,
}: DailyLogFormProps) {
  const form = useForm<DailyLogFormData>({
    resolver: zodResolver(dailyLogFormSchema),
    defaultValues: {
      title: dailyLog?.title || '',
      logDate: dailyLog ? (() => {
        try {
          const date = new Date(dailyLog.logDate);
          return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
        } catch {
          return new Date().toISOString().split('T')[0];
        }
      })() : new Date().toISOString().split('T')[0],
      weather: dailyLog?.weather || '',
      temperature: dailyLog?.temperature ?? undefined,
      workDescription: dailyLog?.workDescription || '',
      workHours: dailyLog?.workHours ?? 8,
      workersCount: dailyLog?.workersCount ?? 0,
      issues: dailyLog?.issues || '',
      notes: dailyLog?.notes || '',
    },
  });

  const handleSubmit = async (data: DailyLogFormData) => {
    try {
      const submitData = {
        // Remove projectId from form data as it's already in the URL
        title: data.title,
        logDate: new Date(data.logDate).toISOString(),
        weather: data.weather === '' ? undefined : data.weather,
        temperature: data.temperature === undefined ? undefined : data.temperature,
        workDescription: data.workDescription,
        workHours: data.workHours,
        workersCount: data.workersCount,
        issues: data.issues === '' ? undefined : data.issues,
        notes: data.notes === '' ? undefined : data.notes,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting daily log form:', error);
      throw error;
    }
  };

  const weatherOptions = [
    { value: 'sunny', label: 'Nắng' },
    { value: 'cloudy', label: 'Nhiều mây' },
    { value: 'rainy', label: 'Mưa' },
    { value: 'stormy', label: 'Bão' },
    { value: 'foggy', label: 'Sương mù' },
    { value: 'snowy', label: 'Tuyết' },
  ];

  const temperatureRanges = [
    { value: undefined, label: 'Không chọn' },
    { value: 15, label: 'Dưới 20°C (Lạnh - Mùa đông)' },
    { value: 20, label: '20-25°C (Mát mẻ - Thời tiết dễ chịu)' },
    { value: 25, label: '25-30°C (Ấm áp - Thời tiết lý tưởng)' },
    { value: 30, label: '30-35°C (Nóng - Cần che chắn)' },
    { value: 35, label: 'Trên 35°C (Rất nóng - Hạn chế làm việc)' },
  ];

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form id="daily-log-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>
                {projectName ? 'Dự án đã được cố định, nhập tiêu đề nhật ký' : 'Chọn dự án và nhập tiêu đề nhật ký'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Selection */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dự án *</FormLabel>
                    {projectName ? (
                      <>
                        <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                          <Building2 className="size-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{projectName}</span>
                          <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            Cố định
                          </span>
                        </div>
                        <input type="hidden" {...field} />
                      </>
                    ) : (
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn dự án" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Projects would be loaded here */}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề nhật ký thi công *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Đổ bê tông cột tầng 1 - Khu A"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Work Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClockIcon className="h-5 w-5 text-green-600" />
                Tiến độ công việc
              </CardTitle>
              <CardDescription>Mô tả chi tiết công việc đã thực hiện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Work Hours and Workers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="workHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số giờ làm việc</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="24"
                          placeholder="8"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || value === null || value === undefined) {
                              field.onChange(8); // Default value
                            } else {
                              const num = parseInt(value);
                              field.onChange(isNaN(num) ? 8 : num);
                            }
                          }}
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
                      <FormLabel>Số công nhân</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || value === null || value === undefined) {
                              field.onChange(0); // Default value
                            } else {
                              const num = parseInt(value);
                              field.onChange(isNaN(num) ? 0 : num);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Environmental Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CloudIcon className="h-5 w-5 text-blue-500" />
                Điều kiện môi trường
              </CardTitle>
              <CardDescription>Thông tin về thời tiết và nhiệt độ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weather */}
                <FormField
                  control={form.control}
                  name="weather"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời tiết</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thời tiết" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weatherOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Temperature */}
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <ThermometerIcon className="h-4 w-4" />
                        Nhiệt độ
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'undefined' ? undefined : parseInt(value))} value={field.value?.toString() || 'undefined'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn khoảng nhiệt độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {temperatureRanges.map((range) => (
                            <SelectItem key={range.value || 'undefined'} value={range.value?.toString() || 'undefined'}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chọn khoảng nhiệt độ phù hợp với điều kiện thời tiết thực tế
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Thông tin bổ sung
              </CardTitle>
              <CardDescription>Vấn đề phát sinh và ghi chú thêm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Issues */}
              <FormField
                control={form.control}
                name="issues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vấn đề phát sinh</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả các vấn đề, khó khăn gặp phải trong quá trình thi công..."
                        className="min-h-[100px]"
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
                        placeholder="Ghi chú, nhận xét, đề xuất..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Photo Upload Section */}
          {onPhotoUpload && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UsersIcon className="h-5 w-5 text-purple-600" />
                  Hình ảnh minh chứng
                </CardTitle>
                <CardDescription>Upload hình ảnh minh chứng cho công việc đã thực hiện</CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload
                  onUpload={onPhotoUpload}
                  onDelete={onPhotoDelete}
                  photos={photos}
                  pendingPhotos={pendingPhotos}
                  isLoading={isPhotoLoading || isUploadingToCloudinary}
                />
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
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
              disabled={isLoading || isPhotoLoading || isUploadingToCloudinary}
              className="min-w-[120px]"
            >
              {isLoading ? 'Đang lưu...' : 
               isPhotoLoading || isUploadingToCloudinary ? 'Đang upload ảnh...' : 
               dailyLog ? 'Cập nhật' : 'Tạo nhật ký'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}