'use client';

import { BarChart3, CalendarIcon, FileTextIcon, ImageIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  // Calculate project progress based on actual data
  const calculateProgress = () => {
    if (!project.startDate || !project.endDate) return 0;
    
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const today = new Date();
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (elapsedDays <= 0) return 0;
    if (elapsedDays >= totalDays) return 100;
    
    return Math.round((elapsedDays / totalDays) * 100);
  };

  const progress = calculateProgress();
  
  const calculateDays = () => {
    if (!project.startDate || !project.endDate) return { daysElapsed: 0, daysRemaining: 0 };
    
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const today = new Date();
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    
    return {
      daysElapsed: Math.max(0, elapsedDays),
      daysRemaining: remainingDays,
    };
  };

  const { daysElapsed, daysRemaining } = calculateDays();

  // Calculate weekly progress based on actual data
  const calculateWeeklyProgress = () => {
    if (!project.startDate || !project.endDate) return [];
    
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const today = new Date();
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(totalDays / 7);
    
    const weeklyData = [];
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Calculate progress for this week
      const weekElapsed = Math.min(7, Math.ceil((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
      const weekProgress = Math.min(100, Math.round((weekElapsed / 7) * 100));
      
      // Use actual data if available, otherwise show calculated progress
      const logs = dailyLogStats?.thisWeek || 0;
      const photos = photosCount || 0;
      
      weeklyData.push({
        week: `Tuần ${i + 1}`,
        progress: weekProgress,
        logs: Math.round(logs / weeks) || 0,
        photos: Math.round(photos / weeks) || 0,
      });
    }
    
    return weeklyData;
  };

  const weeklyProgress = calculateWeeklyProgress();

  // State for recent activities
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  // Fetch recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoadingActivities(true);
        const response = await fetch(`/api/projects/${project.id}/activities`);
        if (response.ok) {
          const data = await response.json();
          setRecentActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [project.id]);

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string | Date) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  };

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
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Tiến độ tổng thể</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-4" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-blue-500"></div>
                    {daysElapsed} ngày đã qua
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-gray-300"></div>
                    {daysRemaining} ngày còn lại
                  </span>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Timeline dự án</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatDate(project.startDate)}</span>
                    <span>{formatDate(project.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <div className="flex items-center gap-2">
                <FileTextIcon className="size-4 text-purple-600" />
                <span className="text-sm font-medium">Nhật ký thi công</span>
              </div>
              <span className="font-bold text-purple-600 text-lg">{dailyLogStats?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-orange-600" />
                <span className="text-sm font-medium">Hình ảnh công trường</span>
              </div>
              <span className="font-bold text-orange-600 text-lg">{photosCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-green-600" />
                <span className="text-sm font-medium">Công nhân TB</span>
              </div>
              <span className="font-bold text-green-600 text-lg">{dailyLogStats?.averageWorkers || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-blue-600" />
                <span className="text-sm font-medium">Tổng giờ làm</span>
              </div>
              <span className="font-bold text-blue-600 text-lg">
                {dailyLogStats?.totalWorkHours || 0}h
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
            {weeklyProgress.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto size-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Chưa có dữ liệu tiến độ theo tuần</p>
              </div>
            ) : (
              weeklyProgress.map((week, index) => (
                <div key={index} className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{week.week}</span>
                    <span className="font-bold text-green-600 text-lg">
                      {week.progress}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                        style={{ width: `${week.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <FileTextIcon className="size-3 text-purple-500" />
                          {week.logs} nhật ký
                        </span>
                        <span className="flex items-center gap-1">
                          <ImageIcon className="size-3 text-orange-500" />
                          {week.photos} ảnh
                        </span>
                      </div>
                      <span className="text-gray-400">
                        {week.progress < 30 ? 'Bắt đầu' : week.progress < 70 ? 'Đang thực hiện' : 'Gần hoàn thành'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
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
            {isLoadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600"></div>
                  Đang tải hoạt động...
                </div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CalendarIcon className="size-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Chưa có hoạt động nào</p>
                <p className="text-xs text-gray-400">Các hoạt động sẽ xuất hiện ở đây khi có nhật ký hoặc ảnh mới</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={activity.id || index} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  <div className="shrink-0">
                    {activity.type === 'daily-log' && (
                      <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <FileTextIcon className="size-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    {activity.type === 'photo-upload' && (
                      <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <ImageIcon className="size-5 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(activity.timestamp)}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">User {activity.userId}</span>
                      {activity.type === 'daily-log' && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          Nhật ký
                        </span>
                      )}
                      {activity.type === 'photo-upload' && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          Hình ảnh
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button
              onClick={onViewDailyLogs}
              className="group flex flex-col items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 transition-all hover:bg-purple-100 hover:shadow-md dark:border-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 dark:bg-purple-800 dark:group-hover:bg-purple-700">
                <FileTextIcon className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Nhật ký thi công</div>
                <div className="text-xs text-purple-500 dark:text-purple-400">Ghi chép hàng ngày</div>
              </div>
            </button>
            <button
              onClick={onViewPhotos}
              className="group flex flex-col items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 transition-all hover:bg-orange-100 hover:shadow-md dark:border-orange-800 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200 dark:bg-orange-800 dark:group-hover:bg-orange-700">
                <ImageIcon className="size-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Hình ảnh công trường</div>
                <div className="text-xs text-orange-500 dark:text-orange-400">Quản lý ảnh</div>
              </div>
            </button>
            <button
              onClick={onGenerateReport}
              className="group flex flex-col items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 transition-all hover:bg-blue-100 hover:shadow-md dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 dark:bg-blue-800 dark:group-hover:bg-blue-700">
                <BarChart3 className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Báo cáo dự án</div>
                <div className="text-xs text-blue-500 dark:text-blue-400">Xuất báo cáo</div>
              </div>
            </button>
            <button
              onClick={onViewTimeline}
              className="group flex flex-col items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 transition-all hover:bg-green-100 hover:shadow-md dark:border-green-800 dark:bg-green-900/20 dark:hover:bg-green-900/30"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 dark:bg-green-800 dark:group-hover:bg-green-700">
                <CalendarIcon className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">Timeline dự án</div>
                <div className="text-xs text-green-500 dark:text-green-400">Lịch trình</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
