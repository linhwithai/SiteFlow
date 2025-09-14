'use client';

import { BarChart3, CalendarIcon, FileTextIcon, ImageIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type ProjectOverviewProps = {
  project: {
    id: string | number;
    name: string;
    status: string;
    startDate?: string | Date | undefined;
    endDate?: string | Date | undefined;
    budget?: number | undefined;
    description?: string;
  };
  dailyLogStats?: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    totalWorkHours: number;
    averageWorkHours: number;
    totalWorkers: number;
    averageWorkers: number;
  };
  photosCount: number;
  onViewDailyLogs: () => void;
  onViewPhotos: () => void;
  onGenerateReport: () => void;
  onViewTimeline: () => void;
};

export function ProjectOverview({
  project,
  dailyLogStats,
  photosCount,
  onViewDailyLogs,
  onViewPhotos,
  onGenerateReport,
  onViewTimeline,
}: ProjectOverviewProps) {
  // Calculate project progress (mock data for now)
  const progress = 75;
  const daysRemaining = 15;
  const daysTotal = 30;
  const daysElapsed = daysTotal - daysRemaining;

  // Mock data for charts
  const weeklyProgress = [
    { week: 'Tuần 1', progress: 20, logs: 5, photos: 12 },
    { week: 'Tuần 2', progress: 35, logs: 8, photos: 18 },
    { week: 'Tuần 3', progress: 50, logs: 12, photos: 25 },
    { week: 'Tuần 4', progress: 65, logs: 15, photos: 32 },
    { week: 'Tuần 5', progress: 75, logs: 18, photos: 40 },
  ];

  const recentActivities = [
    {
      type: 'daily-log',
      title: 'Nhật ký mới được tạo',
      description: 'Cập nhật tiến độ xây dựng móng cầu',
      timestamp: '2 giờ trước',
      user: 'Nguyễn Văn A',
    },
    {
      type: 'photo-upload',
      title: 'Ảnh công trường mới',
      description: '5 ảnh được upload từ công trường',
      timestamp: '4 giờ trước',
      user: 'Trần Thị B',
    },
    {
      type: 'daily-log',
      title: 'Báo cáo tuần',
      description: 'Tổng kết công việc tuần 5',
      timestamp: '1 ngày trước',
      user: 'Lê Văn C',
    },
  ];

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Project Progress Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Progress Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-5 text-blue-600" />
              Tiến độ dự án
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiến độ tổng thể</span>
                  <span className="font-semibold text-blue-600">
                    {progress}
                    %
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {daysElapsed}
                    {' '}
                    ngày đã qua
                  </span>
                  <span>
                    {daysRemaining}
                    {' '}
                    ngày còn lại
                  </span>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-medium">Timeline dự án</h4>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-xs text-gray-500">
                    {formatDate(project.startDate)}
                    {' '}
                    -
                    {formatDate(project.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileTextIcon className="size-4 text-purple-600" />
                <span className="text-sm">Nhật ký</span>
              </div>
              <span className="font-semibold text-purple-600">{dailyLogStats?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-orange-600" />
                <span className="text-sm">Hình ảnh</span>
              </div>
              <span className="font-semibold text-orange-600">{photosCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-green-600" />
                <span className="text-sm">Công nhân</span>
              </div>
              <span className="font-semibold text-green-600">{dailyLogStats?.averageWorkers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-blue-600" />
                <span className="text-sm">Giờ làm việc</span>
              </div>
              <span className="font-semibold text-blue-600">
                {dailyLogStats?.totalWorkHours || 0}
                h
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-green-600" />
            Tiến độ theo tuần
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyProgress.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{week.week}</span>
                  <span className="text-sm text-gray-500">
                    {week.progress}
                    %
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                      style={{ width: `${week.progress}%` }}
                    />
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>
                      {week.logs}
                      {' '}
                      nhật ký
                    </span>
                    <span>•</span>
                    <span>
                      {week.photos}
                      {' '}
                      ảnh
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="size-5 text-purple-600" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="shrink-0">
                  {activity.type === 'daily-log' && (
                    <div className="flex size-8 items-center justify-center rounded-full bg-purple-100">
                      <FileTextIcon className="size-4 text-purple-600" />
                    </div>
                  )}
                  {activity.type === 'photo-upload' && (
                    <div className="flex size-8 items-center justify-center rounded-full bg-orange-100">
                      <ImageIcon className="size-4 text-orange-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{activity.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button
              onClick={onViewDailyLogs}
              className="flex flex-col items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-4 transition-colors hover:bg-purple-100"
            >
              <FileTextIcon className="size-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Xem nhật ký</span>
            </button>
            <button
              onClick={onViewPhotos}
              className="flex flex-col items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4 transition-colors hover:bg-orange-100"
            >
              <ImageIcon className="size-6 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Xem hình ảnh</span>
            </button>
            <button
              onClick={onGenerateReport}
              className="flex flex-col items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
            >
              <BarChart3 className="size-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Tạo báo cáo</span>
            </button>
            <button
              onClick={onViewTimeline}
              className="flex flex-col items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 transition-colors hover:bg-green-100"
            >
              <CalendarIcon className="size-6 text-green-600" />
              <span className="text-sm font-medium text-green-700">Xem timeline</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
