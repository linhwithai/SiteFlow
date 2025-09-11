'use client';

import { CalendarIcon, CheckCircleIcon, ClockIcon, DollarSignIcon, PauseIcon, XCircleIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProjectStats as ProjectStatsType } from '@/types/Project';

type ProjectStatsProps = {
  stats: ProjectStatsType;
  isLoading?: boolean;
};

export function ProjectStats({ stats, isLoading = false }: ProjectStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-8 w-1/3 rounded bg-gray-200"></div>
              <div className="h-3 w-2/3 rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng dự án',
      value: stats.total,
      description: 'Tất cả dự án',
      icon: CalendarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Đang thực hiện',
      value: stats.active,
      description: 'Dự án đang hoạt động',
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Tạm dừng',
      value: stats.onHold,
      description: 'Dự án tạm dừng',
      icon: PauseIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Hoàn thành',
      value: stats.completed,
      description: 'Dự án đã hoàn thành',
      icon: CheckCircleIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      title: 'Hủy bỏ',
      value: stats.cancelled,
      description: 'Dự án đã hủy',
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`size-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Tổng ngân sách
            </CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <DollarSignIcon className="size-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.totalBudget)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tổng ngân sách tất cả dự án
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Ngân sách trung bình
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <ClockIcon className="size-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.averageBudget)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ngân sách trung bình mỗi dự án
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan tiến độ</CardTitle>
          <CardDescription>
            Phân tích tổng quan về tình trạng dự án
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bars */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Hoàn thành</span>
                <span>
                  {stats.completed}
                  /
                  {stats.total}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-600 transition-all duration-300"
                  style={{
                    width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                  }}
                >
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Đang thực hiện</span>
                <span>
                  {stats.active}
                  /
                  {stats.total}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%`,
                  }}
                >
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Tạm dừng</span>
                <span>
                  {stats.onHold}
                  /
                  {stats.total}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-yellow-600 transition-all duration-300"
                  style={{
                    width: `${stats.total > 0 ? (stats.onHold / stats.total) * 100 : 0}%`,
                  }}
                >
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Hủy bỏ</span>
                <span>
                  {stats.cancelled}
                  /
                  {stats.total}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-red-600 transition-all duration-300"
                  style={{
                    width: `${stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0}%`,
                  }}
                >
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
