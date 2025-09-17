'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, BarChart3, Target, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GanttChart } from '@/components/GanttChart';
import { WorkItem } from '@/types/WorkItem';
import { useWorkItems } from '@/hooks/useWorkItems';

export default function WorkItemsSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use work items hook
  const {
    workItems,
    stats: workItemStats,
    isLoading: isLoadingWorkItems,
    error: workItemError,
  } = useWorkItems({ projectId: Number(projectId) });

  // Fetch project details
  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Calculate project dates
  const projectStartDate = project?.startDate ? new Date(project.startDate) : new Date();
  const projectEndDate = project?.endDate ? new Date(project.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  // Convert work items to Gantt format
  const ganttWorkItems = workItems.map((item, index) => ({
    id: item.id,
    workItemTitle: item.workItemTitle,
    status: item.status,
    priority: item.priority,
    assignedTo: item.assignedTo,
    startDate: item.workDate ? new Date(item.workDate) : new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000),
    endDate: item.dueDate ? new Date(item.dueDate) : new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000),
    progress: item.progress || 0,
    criticalPath: item.priority === 'urgent' || item.priority === 'high',
  }));

  // Calculate stats
  const stats = {
    totalWorkItems: workItems.length,
    completedWorkItems: workItems.filter(item => item.status === 'completed').length,
    inProgressWorkItems: workItems.filter(item => item.status === 'in_progress').length,
    plannedWorkItems: workItems.filter(item => item.status === 'planned').length,
    overdueWorkItems: 0,
    averageProgress: workItems.length > 0 ? 
      Math.round(workItems.reduce((sum, item) => sum + (item.progress || 0), 0) / workItems.length) : 0,
    criticalPathItems: workItems.filter(item => item.priority === 'urgent' || item.priority === 'high').length,
    totalMilestones: 0,
    completedMilestones: 0,
    overdueMilestones: 0,
    totalRisks: 0,
    openRisks: 0,
    highRisks: 0,
    totalIssues: 0,
    openIssues: 0,
    criticalIssues: 0
  };

  const breadcrumbItems = [
    {
      label: 'Dự án',
      href: '/dashboard/projects',
    },
    {
      label: `Dự án ${projectId}`,
      href: `/dashboard/projects/${projectId}`,
    },
    {
      label: 'Hạng mục',
      href: `/dashboard/projects/${projectId}/work-items`,
    },
    {
      label: 'Bảng tiến độ',
    },
  ];

  if (loading || isLoadingWorkItems) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${projectId}/work-items`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Bảng Tiến Độ Dự Án
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quản lý lịch trình và theo dõi tiến độ các hạng mục
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Xuất lịch trình
          </Button>
          <Button size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Báo cáo tiến độ
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng hạng mục</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalWorkItems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.completedWorkItems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Target className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đang thực hiện</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.inProgressWorkItems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tiến độ TB</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageProgress}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="gantt" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Gantt Chart
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="critical-path" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Đường găng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="space-y-6">
          <GanttChart
            workItems={ganttWorkItems}
            milestones={[]}
            startDate={projectStartDate}
            endDate={projectEndDate}
            onItemUpdate={(item) => {
              console.log('Update work item:', item);
              // Handle work item update
            }}
            onItemMove={(item, newStart, newEnd) => {
              console.log('Move work item:', item, newStart, newEnd);
              // Handle work item move
            }}
            onMilestoneUpdate={(milestone) => {
              console.log('Update milestone:', milestone);
              // Handle milestone update
            }}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Timeline view sẽ được phát triển trong phiên bản tương lai.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical-path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân Tích Đường Găng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Hạng mục đường găng</h3>
                    <div className="space-y-2">
                      {ganttWorkItems
                        .filter(item => item.criticalPath)
                        .map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.workItemTitle}</p>
                              <p className="text-sm text-gray-600">
                                {item.startDate?.toLocaleDateString('vi-VN')} - {item.endDate?.toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            <Badge variant="destructive">
                              {item.progress}%
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Thống kê</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng hạng mục găng:</span>
                        <span className="font-medium">{stats.criticalPathItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian dự án:</span>
                        <span className="font-medium">
                          {Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24))} ngày
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiến độ trung bình:</span>
                        <span className="font-medium">{stats.averageProgress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
