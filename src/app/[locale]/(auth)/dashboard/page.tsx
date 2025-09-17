'use client';

import { 
  Building2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  ListIcon, 
  MapPin, 
  Plus, 
  Search, 
  TrendingUp, 
  Users,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';
import { EnhancedStatsCards } from '@/components/EnhancedStatsCards';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { SystemNotifications, SystemNotificationsCompact } from '@/components/SystemNotifications';
import { RecentActivities } from '@/components/RecentActivities';
import { ProgressOverview } from '@/components/ProgressOverview';

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
  progress?: number;
  workItemsCount?: number;
  dailyLogsCount?: number;
  photosCount?: number;
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
  totalWorkItems: number;
  completedWorkItems: number;
  totalDailyLogs: number;
  overdueProjects: number;
};


type DailyLog = {
  id: number;
  projectId: number;
  logTitle: string;
  constructionDate: string;
  weather: string | null;
  temperature: number | null;
  constructionWorkDescription: string;
  dailyWorkHours: number;
  laborCount: number;
  issues: string | null;
  notes: string | null;
  projectName?: string;
  createdById: string;
  createdAt: string;
};

type DashboardData = {
  projects: Project[];
  dailyLogs: DailyLog[];
  stats: ProjectStats;
  recentActivities: any[];
  upcomingDeadlines: any[];
  criticalIssues: any[];
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


// Define columns for Projects DataTable
const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: 'Dự án',
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="size-6 text-blue-600" />
            </div>
          </div>
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
    accessorKey: 'progress',
    header: 'Tiến độ',
    cell: ({ row }) => {
      const progress = row.getValue('progress') as number | undefined;
      if (progress === undefined) return <span className="text-sm text-gray-500">-</span>;
      
      return (
        <div className="flex items-center space-x-2">
          <Progress value={progress} className="w-16 h-2" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
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
    accessorKey: 'workItemsCount',
    header: 'Hạng mục',
    cell: ({ row }) => {
      const count = row.getValue('workItemsCount') as number | undefined;
      return (
        <div className="flex items-center text-sm">
          <Target className="size-4 mr-1 text-gray-400" />
          {count || 0}
        </div>
      );
    },
  },
];


export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [projectsResponse, statsResponse] = await Promise.all([
          fetch('/api/projects?limit=10'),
          fetch('/api/projects/stats')
        ]);

        const [projectsData, statsData] = await Promise.all([
          projectsResponse.json(),
          statsResponse.json()
        ]);

        // Mock recent activities and other data
        const recentActivities = [
          {
            id: '1',
            description: 'Dự án "Chung cư The Sun City" đã hoàn thành 75%',
            timestamp: '2 giờ trước',
            type: 'project' as const,
          },
          {
            id: '2',
            description: 'Nhật ký thi công mới được tạo cho dự án "Mega Mall"',
            timestamp: '4 giờ trước',
            type: 'daily_log' as const,
          },
          {
            id: '3',
            description: 'Dự án "Trường học Công nghệ" bắt đầu thi công',
            timestamp: '6 giờ trước',
            type: 'project' as const,
          },
          {
            id: '4',
            description: 'Dự án "Tòa nhà văn phòng" đã được phê duyệt',
            timestamp: '1 ngày trước',
            type: 'project' as const,
          }
        ];

        setData({
          projects: projectsData.projects || [],
          dailyLogs: [], // Will be populated from individual project APIs
          stats: statsData,
          recentActivities,
          upcomingDeadlines: [],
          criticalIssues: []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter projects based on search and status
  const filteredProjects = data?.projects.filter(project => {
    const matchesSearch = searchInput === '' || 
      project.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      (project.workItemDescription && project.workItemDescription.toLowerCase().includes(searchInput.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard ERP</h1>
          <p className="text-muted-foreground">
            Tổng quan toàn diện về dự án, hạng mục và tiến độ thi công
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 size-4" />
            Làm mới
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <EnhancedStatsCards stats={data?.stats || null} isLoading={isLoading} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="projects">Dự án</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <QuickActionsPanel />
            
            {/* Recent Activities */}
            <RecentActivities activities={data?.recentActivities || []} />
          </div>

          {/* Progress Overview */}
          <ProgressOverview projects={data?.projects || []} />

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Dự án gần đây</CardTitle>
              <CardDescription>
                Các dự án được cập nhật gần đây nhất
              </CardDescription>
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
                <DataTable columns={projectColumns} data={data?.projects.slice(0, 5) || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 gap-2">
                  <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm dự án..."
                      className="pl-10"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 size-4" />
                    Bộ lọc
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách dự án</CardTitle>
              <CardDescription>
                Hiển thị {filteredProjects.length} dự án
              </CardDescription>
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
                <DataTable columns={projectColumns} data={filteredProjects} />
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Thống kê dự án
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Biểu đồ thống kê sẽ được hiển thị ở đây</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Xu hướng tiến độ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Biểu đồ xu hướng sẽ được hiển thị ở đây</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
