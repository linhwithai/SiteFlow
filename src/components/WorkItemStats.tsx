'use client';

import { 
  FileTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  UsersIcon,
  TrendingUpIcon,
  CalendarIcon
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { WorkItemStats } from '@/types/WorkItem';

interface WorkItemStatsProps {
  stats: WorkItemStats | null;
  isLoading: boolean;
}

export function WorkItemStats({ stats, isLoading }: WorkItemStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <FileTextIcon className="mx-auto size-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Chưa có dữ liệu thống kê
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Thống kê sẽ hiển thị khi có hạng mục công việc
        </p>
      </div>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const progressRate = stats.averageProgress || 0;
  const overdueRate = stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hạng mục</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả hạng mục công việc
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% tổng số hạng mục
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Hạng mục đang triển khai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              {overdueRate}% tổng số hạng mục
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Tiến độ tổng thể
            </CardTitle>
            <CardDescription>
              Tỷ lệ hoàn thành trung bình của tất cả hạng mục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tiến độ trung bình</span>
                <span className="text-2xl font-bold">{progressRate}%</span>
              </div>
              <Progress value={progressRate} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">{stats.planned}</div>
                  <div className="text-xs text-muted-foreground">Lên kế hoạch</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">{stats.inProgress}</div>
                  <div className="text-xs text-muted-foreground">Đang thực hiện</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground">Hoàn thành</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Thời gian làm việc
            </CardTitle>
            <CardDescription>
              Tổng thời gian ước tính và thực tế
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Giờ ước tính</span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.totalEstimatedHours}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Giờ thực tế</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.totalActualHours}h
                </span>
              </div>
              {stats.totalEstimatedHours > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Tỷ lệ hoàn thành thời gian</span>
                    <span>
                      {Math.round((stats.totalActualHours / stats.totalEstimatedHours) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(stats.totalActualHours / stats.totalEstimatedHours) * 100} 
                    className="h-2" 
                  />
                </div>
              )}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chênh lệch</span>
                  <span className={`font-medium ${
                    stats.totalActualHours > stats.totalEstimatedHours 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {stats.totalActualHours > stats.totalEstimatedHours ? '+' : ''}
                    {stats.totalActualHours - stats.totalEstimatedHours}h
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Phân bổ trạng thái
          </CardTitle>
          <CardDescription>
            Chi tiết trạng thái của các hạng mục công việc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Lên kế hoạch</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {stats.total > 0 ? Math.round((stats.planned / stats.total) * 100) : 0}%
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Đang thực hiện</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Hoàn thành</div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-red-700 dark:text-red-300">Hủy bỏ</div>
              <div className="text-xs text-red-600 dark:text-red-400">
                {stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0}%
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
              <div className="text-2xl font-bold text-gray-600">{stats.overdue}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">Quá hạn</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}







