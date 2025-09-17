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
import { Progress } from '@/components/ui/progressPercentage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';
import { useAppStore } from '@/store/useAppStore';

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

type WorkItem = {
  id: number;
  projectId: number;
  workItemTitle: string;
  workItemDescription: string | null;
  workItemType: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  dueDate: string | null;
  estimatedWorkHours: number | null;
  actualWorkHours: number | null;
  projectName?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
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
  workItems: WorkItem[];
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

const workItemStatusLabels = {
  'planned': 'Kế hoạch',
  'in_progress': 'Đang thực hiện',
  'completed': 'Hoàn thành',
  'cancelled': 'Đã hủy',
};

const workItemStatusColors = {
  'planned': 'bg-blue-100 text-blue-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
};

const priorityLabels = {
  'low': 'Thấp',
  'medium': 'Trung bình',
  'high': 'Cao',
  'urgent': 'Khẩn cấp',
};

const priorityColors = {
  'low': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-orange-100 text-orange-800',
  'urgent': 'bg-red-100 text-red-800',
};

// Enhanced Stats Cards Component
const EnhancedStatsCards = ({ stats, isLoading }: { stats: ProjectStats | null; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsData = [
    {
      title: 'Tổng dự án',
      value: stats.total,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Đang thực hiện',
      value: stats.active,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Hoàn thành',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Tổng ngân sách',
      value: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        notation: 'compact',
      }).format(stats.totalBudget),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      change: '+15%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div className="flex items-center text-xs">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 ml-1">so với tháng trước</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Quick Actions Panel Component
const QuickActionsPanel = () => {
  const actions = [
    {
      title: 'Tạo dự án mới',
      description: 'Thêm công trình xây dựng mới',
      icon: Building2,
      href: '/dashboard/projects/new',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Ghi nhật ký thi công',
      description: 'Cập nhật tiến độ hôm nay',
      icon: FileText,
      href: '/dashboard/daily-logs/new',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Tạo hạng mục',
      description: 'Thêm công việc mới',
      icon: Target,
      href: '/dashboard/work-items/new',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: 'Báo cáo tổng hợp',
      description: 'Xuất báo cáo PDF/Excel',
      icon: Download,
      href: '/dashboard/reports',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
        <CardDescription>
          Các chức năng thường sử dụng để tăng hiệu suất làm việc
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-4 justify-start w-full hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Activities Component
const RecentActivities = ({ activities }: { activities: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
        <CardDescription>
          Các thay đổi và cập nhật mới nhất trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Chưa có hoạt động nào</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Progress Overview Component
const ProgressOverview = ({ projects }: { projects: Project[] }) => {
  const activeProjects = projects.filter(p => p.status === CONSTRUCTION_PROJECT_STATUS.ACTIVE);
  const totalProgress = activeProjects.length > 0 
    ? activeProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / activeProjects.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tổng quan tiến độ</CardTitle>
        <CardDescription>
          Tiến độ trung bình của các dự án đang thực hiện
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tiến độ trung bình</span>
            <span className="text-sm font-bold">{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Dự án đang thực hiện:</span>
              <span className="ml-2 font-medium">{activeProjects.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Hoàn thành:</span>
              <span className="ml-2 font-medium text-green-600">
                {projects.filter(p => p.status === CONSTRUCTION_PROJECT_STATUS.COMPLETED).length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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

// Define columns for Work Items DataTable
const workItemColumns: ColumnDef<WorkItem>[] = [
  {
    accessorKey: 'workItemTitle',
    header: 'Hạng mục',
    cell: ({ row }) => {
      const workItem = row.original;
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            <Link 
              href={`/dashboard/projects/${workItem.projectId}`}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {workItem.workItemTitle}
            </Link>
          </div>
          {workItem.workItemDescription && (
            <div className="text-xs text-gray-500 truncate max-w-xs">
              {workItem.workItemDescription}
            </div>
          )}
          <div className="flex items-center text-xs text-gray-400">
            <Building2 className="size-3 mr-1" />
            {workItem.projectName || 'Dự án không xác định'}
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
      const label = workItemStatusLabels[status as keyof typeof workItemStatusLabels] || status;
      const colorClass = workItemStatusColors[status as keyof typeof workItemStatusColors] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={colorClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'priority',
    header: 'Ưu tiên',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string;
      const label = priorityLabels[priority as keyof typeof priorityLabels] || priority;
      const colorClass = priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={colorClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Hạn hoàn thành',
    cell: ({ row }) => {
      const date = row.getValue('dueDate') as string | null;
      if (!date) return <span className="text-gray-500">Chưa xác định</span>;
      
      const isOverdue = new Date(date) < new Date() && row.original.status !== 'completed';
      
      return (
        <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : ''}`}>
          <Calendar className="size-4 mr-2 text-gray-400" />
          {new Date(date).toLocaleDateString('vi-VN')}
          {isOverdue && <span className="ml-1 text-xs text-red-600">(Quá hạn)</span>}
        </div>
      );
    },
  },
  {
    accessorKey: 'estimatedWorkHours',
    header: 'Giờ ước tính',
    cell: ({ row }) => {
      const hours = row.getValue('estimatedWorkHours') as number | null;
      const actualHours = row.getValue('actualWorkHours') as number | null;
      
      return (
        <div className="text-sm">
          <div>{hours ? `${hours}h` : '-'}</div>
          {actualHours && (
            <div className="text-xs text-gray-500">
              Thực tế: {actualHours}h
            </div>
          )}
        </div>
      );
    },
  },
];

export default function DashboardPageNew() {
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
        
        const [projectsResponse, workItemsResponse, dailyLogsResponse, statsResponse] = await Promise.all([
          fetch('/api/projects?limit=10'),
          fetch('/api/work-items?limit=10'),
          fetch('/api/daily-logs?limit=10'),
          fetch('/api/projects/stats')
        ]);

        const [projectsData, workItemsData, dailyLogsData, statsData] = await Promise.all([
          projectsResponse.json(),
          workItemsResponse.json(),
          dailyLogsResponse.json(),
          statsResponse.json()
        ]);

        // Mock recent activities and other data
        const recentActivities = [
          {
            description: 'Dự án "Chung cư The Sun City" đã hoàn thành 75%',
            timestamp: '2 giờ trước'
          },
          {
            description: 'Hạng mục "Đổ bê tông móng" đã hoàn thành',
            timestamp: '4 giờ trước'
          },
          {
            description: 'Nhật ký thi công mới được tạo cho dự án "Mega Mall"',
            timestamp: '6 giờ trước'
          },
          {
            description: 'Dự án "Trường học Công nghệ" bắt đầu thi công',
            timestamp: '1 ngày trước'
          }
        ];

        setData({
          projects: projectsData.projects || [],
          workItems: workItemsData.workItems || [],
          dailyLogs: dailyLogsData.dailyLogs || [],
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="projects">Dự án</TabsTrigger>
          <TabsTrigger value="work-items">Hạng mục</TabsTrigger>
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

        {/* Work Items Tab */}
        <TabsContent value="work-items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hạng mục công việc</CardTitle>
              <CardDescription>
                Quản lý và theo dõi các hạng mục thi công
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
                <DataTable columns={workItemColumns} data={data?.workItems || []} />
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
