'use client';

import { 
  ArrowLeft, 
  CalendarIcon, 
  EditIcon, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  PauseCircle, 
  PlayCircle,
  Building2,
  MapPin,
  Target,
  TrendingUp,
  Users,
  Wrench,
  FileText,
  Shield,
  AlertTriangle,
  CheckSquare,
  BarChart3,
  Activity,
  Timer,
  DollarSign,
  Tag,
  Eye,
  Download,
  Share2,
  MoreVertical,
  ChevronRight,
  Star,
  Zap,
  Award,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
type Project = {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  projectManagerId: string | null;
  createdAt: string;
  updatedAt: string;
};

type WorkItem = {
  id: number;
  projectId: number;
  organizationId: string;
  workItemTitle: string;
  workItemDescription: string | null;
  workItemType: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  progress: number;
  tags: string | null;
  notes: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  updatedById: string | null;
};

export default function WorkItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const workItemId = params.workItemId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project details
  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      setProject(data.success ? data.data : data);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Không thể tải thông tin dự án');
    }
  };

  // Fetch work item details
  const fetchWorkItem = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/work-items/${workItemId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Hạng mục không tồn tại hoặc đã bị xóa');
          return;
        }
        throw new Error('Failed to fetch work item');
      }
      const data = await response.json();
      setWorkItem(data.success ? data.data : data);
    } catch (err) {
      console.error('Error fetching work item:', err);
      setError('Không thể tải thông tin hạng mục');
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchProject(),
        fetchWorkItem()
      ]);
      
      setLoading(false);
    };

    if (projectId && workItemId) {
      loadData();
    }
  }, [projectId, workItemId]);

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'planned':
        return { label: 'Đã lên kế hoạch', icon: CalendarIcon, color: 'bg-blue-100 text-blue-800' };
      case 'in_progress':
        return { label: 'Đang thực hiện', icon: PlayCircle, color: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { label: 'Hoàn thành', icon: CheckCircle, color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { label: 'Đã hủy', icon: XCircle, color: 'bg-red-100 text-red-800' };
      case 'on_hold':
        return { label: 'Tạm dừng', icon: PauseCircle, color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: status, icon: AlertCircle, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Get priority info
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'low':
        return { label: 'Thấp', color: 'bg-gray-100 text-gray-800' };
      case 'medium':
        return { label: 'Trung bình', color: 'bg-blue-100 text-blue-800' };
      case 'high':
        return { label: 'Cao', color: 'bg-orange-100 text-orange-800' };
      case 'urgent':
        return { label: 'Khẩn cấp', color: 'bg-red-100 text-red-800' };
      default:
        return { label: priority, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dự án', href: '/dashboard/projects' }, { label: 'Đang tải...' }]} />
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
          
          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-32" />
              <Skeleton className="h-24" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-40" />
              <Skeleton className="h-36" />
              <Skeleton className="h-28" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project || !workItem) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dự án', href: '/dashboard/projects' }, { label: 'Lỗi' }]} />
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Không tìm thấy hạng mục'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Hạng mục bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Link href="/dashboard/projects">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Danh sách dự án
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: 'Dự án',
      href: '/dashboard/projects',
    },
    {
      label: project.name,
      href: `/dashboard/projects/${project.id}`,
    },
    {
      label: 'Hạng mục',
      href: `/dashboard/projects/${project.id}/work-items`,
    },
    {
      label: workItem.workItemTitle,
    },
  ];

  const statusInfo = getStatusInfo(workItem.status);
  const priorityInfo = getPriorityInfo(workItem.priority);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${project.id}/work-items`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {workItem.workItemTitle}
              </h1>
              <Badge className={statusInfo.color} variant="secondary">
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>Dự án: {project.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>Loại: {workItem.workItemType}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>Tiến độ: {workItem.progress}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Xuất
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/projects/${projectId}/work-items/${workItemId}/edit`)}
            className="flex items-center gap-2"
          >
            <EditIcon className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tiến độ hoàn thành</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{workItem.progress}%</span>
            </div>
            <Progress value={workItem.progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Bắt đầu</span>
              <span>Hoàn thành</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Chi tiết
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Thời gian
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tài nguyên
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Mô tả hạng mục
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {workItem.workItemDescription || 'Không có mô tả chi tiết về hạng mục này.'}
                  </p>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Timer className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Giờ ước tính</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {workItem.estimatedHours || 0}h
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <CheckSquare className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Giờ thực tế</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {workItem.actualHours || 0}h
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {workItem.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      Ghi chú quan trọng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {workItem.notes}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Độ ưu tiên:</span>
                    <Badge className={priorityInfo.color}>
                      {priorityInfo.label}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-medium">{workItem.progress}%</span>
                    </div>
                    <Progress value={workItem.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Phân công
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Người thực hiện:</span>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <Badge variant="secondary" className="text-xs">
                        {workItem.assignedTo || 'Chưa phân công'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Người tạo:</span>
                    <Badge variant="outline" className="text-xs">
                      {workItem.createdById || 'Không xác định'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Project Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Dự án
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.address || 'Chưa có địa chỉ'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái dự án:</span>
                    <Badge variant="outline" className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Work Item Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Thông tin chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Loại hạng mục</p>
                    <p className="font-medium">{workItem.workItemType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mức độ ưu tiên</p>
                    <Badge className={priorityInfo.color}>
                      {priorityInfo.label}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {workItem.workItemDescription || 'Không có mô tả chi tiết'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {workItem.tags && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-600" />
                    Thẻ phân loại
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {workItem.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Thời gian thực hiện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hạn hoàn thành:</span>
                    <span className="text-sm font-medium">
                      {formatDate(workItem.dueDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Giờ ước tính:</span>
                    <span className="text-sm font-medium">
                      {workItem.estimatedHours || 'Chưa xác định'}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Giờ thực tế:</span>
                    <span className="text-sm font-medium">
                      {workItem.actualHours || 'Chưa có'}h
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tạo lúc:</span>
                    <span className="text-sm font-medium">
                      {formatTime(workItem.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cập nhật lần cuối:</span>
                    <span className="text-sm font-medium">
                      {formatTime(workItem.updatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Người cập nhật:</span>
                    <span className="text-sm font-medium">
                      {workItem.updatedById || 'Không xác định'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Nhân lực
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Người thực hiện:</span>
                  <Badge variant="secondary">
                    {workItem.assignedTo || 'Chưa phân công'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Người tạo:</span>
                  <Badge variant="outline">
                    {workItem.createdById || 'Không xác định'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Thiết bị & Vật liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Thông tin thiết bị và vật liệu sẽ được cập nhật trong phiên bản tương lai.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
