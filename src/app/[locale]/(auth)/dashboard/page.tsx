'use client';

import { Building2, Calendar, CheckCircle, Clock, DollarSign, FileText, ListIcon, MapPin, Plus, Search, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progressPercentage';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';
import { EnhancedStatsCards } from '@/components/EnhancedStatsCards';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { SystemNotifications, SystemNotificationsCompact } from '@/components/SystemNotifications';
import { RecentActivities } from '@/components/RecentActivities';

// Types
type Project = {
  id: number;
  name: string;
  workItemDescription: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  createdAt: string;
  updatedAt: string;
};

type ProjectStats = {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  cancelled: number;
  planning: number;
  totalBudget: number;
  averageBudget: number;
};

type ProjectListResponse = {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Status labels and colors
const statusLabels = {
  [CONSTRUCTION_PROJECT_STATUS.PLANNING]: 'Lập kế hoạch',
  [CONSTRUCTION_PROJECT_STATUS.ACTIVE]: 'Đang thực hiện',
  [CONSTRUCTION_PROJECT_STATUS.ON_HOLD]: 'Tạm dừng',
  [CONSTRUCTION_PROJECT_STATUS.COMPLETED]: 'Hoàn thành',
  [CONSTRUCTION_PROJECT_STATUS.CANCELLED]: 'Hủy bỏ',
};

const statusColors = {
  [CONSTRUCTION_PROJECT_STATUS.PLANNING]: 'bg-blue-100 text-blue-800',
  [CONSTRUCTION_PROJECT_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [CONSTRUCTION_PROJECT_STATUS.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [CONSTRUCTION_PROJECT_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800',
  [CONSTRUCTION_PROJECT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
};

// Define columns for DataTable
const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: 'Dự án',
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex items-center space-x-3">
          {/* Project Thumbnail */}
          <div className="flex-shrink-0">
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="size-6 text-blue-600" />
            </div>
          </div>
          
          {/* Project Info */}
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
            >
              {project.name}
            </Link>
            <p className="text-sm text-gray-500 truncate">
              {project.workItemDescription || 'Không có mô tả'}
            </p>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <MapPin className="size-3 mr-1" />
              {project.city && project.province 
                ? `${project.city}, ${project.province}` 
                : 'Chưa xác định địa điểm'
              }
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const label = statusLabels[status as keyof typeof statusLabels] || status;
      const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={colorClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'budget',
    header: 'Ngân sách',
    cell: ({ row }) => {
      const budget = row.getValue('budget') as number | null;
      if (!budget) return <span className="text-sm text-gray-500">Chưa xác định</span>;
      
      return (
        <div className="flex items-center text-sm">
          <DollarSign className="size-4 mr-1 text-green-600" />
          <span className="font-medium">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
            }).format(budget)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Ngày bắt đầu',
    cell: ({ row }) => {
      const date = row.getValue('startDate') as string | null;
      if (!date) return <span className="text-sm text-gray-500">Chưa xác định</span>;
      
      return (
        <div className="flex items-center text-sm">
          <Calendar className="size-4 mr-2 text-gray-400" />
          {new Date(date).toLocaleDateString('vi-VN')}
        </div>
      );
    },
  },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch projects and stats in parallel
        const [projectsResponse, statsResponse] = await Promise.all([
          fetch('/api/projects?limit=5'),
          fetch('/api/projects/stats')
        ]);

        if (projectsResponse.ok && statsResponse.ok) {
          const projectsData: ProjectListResponse = await projectsResponse.json();
          const statsData: ProjectStats = await statsResponse.json();
          
          // Use projects without fetching photos for better performance
          setProjects(projectsData.projects);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="space-y-6">
      {/* Top Header - Welcome + Quick Actions + Notifications */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan về các dự án và hoạt động của bạn
          </p>
        </div>

        {/* Top Right - Quick Actions + Notifications */}
        <div className="flex items-center gap-3">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 size-4" />
              Tạo dự án
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 size-4" />
              Báo cáo
            </Button>
          </div>
          
          {/* Notifications */}
          <SystemNotificationsCompact />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm dự án, task, hoặc thành viên..." className="pl-8" />
        </div>
      </div>


      {/* Enhanced Stats Cards */}
      <EnhancedStatsCards stats={stats} isLoading={isLoading} />

      {/* Projects Table - Full Width */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
              <div>
              <CardTitle>Dự án gần đây</CardTitle>
              <CardDescription>
                Tổng cộng {projects.length} dự án gần đây
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <ListIcon className="mr-2 size-4" />
              Xem tất cả
            </Button>
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="size-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : (
            <DataTable columns={columns} data={projects} />
          )}
          </CardContent>
        </Card>

      {/* Quick Actions + Activities - Full Width Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
            <CardDescription>
              Các chức năng thường sử dụng để tăng hiệu suất làm việc
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="default"
                size="sm"
                className="h-auto p-4 justify-start"
                onClick={() => window.location.href = '/dashboard/projects?action=create'}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Tạo dự án</div>
                  <div className="text-xs opacity-80">Dự án mới</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-4 justify-start"
                onClick={() => window.location.href = '/dashboard/organization-profile/organization-members'}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Quản lý team</div>
                  <div className="text-xs opacity-80">Thành viên</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-4 justify-start"
                onClick={() => {}} // TODO: Implement export report
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Xuất báo cáo</div>
                  <div className="text-xs opacity-80">PDF/Excel</div>
              </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-4 justify-start"
                onClick={() => {}} // TODO: Implement import data
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Import dữ liệu</div>
                  <div className="text-xs opacity-80">Excel</div>
            </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <RecentActivities maxItems={5} />
      </div>


      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thống kê nhanh</CardTitle>
          <CardDescription>
            Tổng quan nhanh về trạng thái dự án
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Hoàn thành</span>
                      </div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.completed || 0}
                      </div>
                    </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Đang thực hiện</span>
                      </div>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.active || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Tạm dừng</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.onHold || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Tổng dự án</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.total || 0}
              </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
