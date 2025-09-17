'use client';

import { ArrowLeft, FileTextIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Breadcrumb } from '@/components/Breadcrumb';
import { WorkItemList } from '@/components/WorkItemList';
import { WorkItemStats } from '@/components/WorkItemStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkItems } from '@/hooks/useWorkItems';
import type { CreateWorkItemRequest, UpdateWorkItemRequest, WorkItem } from '@/types/WorkItem';

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

export default function ProjectWorkItemsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTemplates, setAvailableTemplates] = useState<Array<{ id: string; name: string; description: string; workItemCount: number }>>([]);

  // Work Items hook
  const {
    workItems,
    stats: workItemStats,
    isLoading: isLoadingWorkItems,
    error: workItemError,
    filters: workItemFilters,
    setFilters: setWorkItemFilters,
    createWorkItem,
    updateWorkItem,
    deleteWorkItem,
    importFromTemplate,
    clearError: clearWorkItemError,
  } = useWorkItems({ projectId: Number(projectId), autoFetch: true });

  // Fetch project details
  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard/projects');
          return;
        }
        throw new Error('Failed to fetch project');
      }

      const projectData: Project = await response.json();
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Load work item templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/work-items/import`);
        if (response.ok) {
          const data = await response.json();
          setAvailableTemplates(data.templates || []);
        }
      } catch (error) {
        console.error('Error fetching work item templates:', error);
      }
    };

    if (projectId) {
      fetchTemplates();
    }
  }, [projectId]);

  // Work Item handlers
  const handleCreateWorkItem = async (data: CreateWorkItemRequest) => {
    try {
      await createWorkItem(data);
    } catch (error) {
      console.error('Error creating work item:', error);
    }
  };

  const handleUpdateWorkItem = async (id: number, data: UpdateWorkItemRequest) => {
    try {
      await updateWorkItem(id, data);
    } catch (error) {
      console.error('Error updating work item:', error);
    }
  };

  const handleDeleteWorkItem = async (id: number) => {
    try {
      await deleteWorkItem(id);
    } catch (error) {
      console.error('Error deleting work item:', error);
    }
  };

  const handleImportFromTemplate = async (templateId: string) => {
    try {
      await importFromTemplate(templateId);
    } catch (error) {
      console.error('Error importing work items:', error);
    }
  };

  const handleWorkItemFilterChange = (key: string, value: string) => {
    // Convert "all" to empty string for API filtering
    const filterValue = value === 'all' ? '' : value;
    setWorkItemFilters({ ...workItemFilters, [key]: filterValue });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải thông tin dự án...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Không tìm thấy dự án
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/dashboard/projects">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách dự án
          </Button>
        </Link>
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
      label: 'Hạng mục công việc',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileTextIcon className="h-6 w-6 text-indigo-600" />
              Hạng mục công việc
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Dự án: {project.name}
            </p>
          </div>
        </div>
        <Button onClick={() => handleCreateWorkItem({ workItemTitle: 'Hạng mục mới', workItemType: 'concrete_work' })} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Thêm hạng mục
        </Button>
      </div>

      {/* Work Items Stats */}
      <WorkItemStats 
        stats={workItemStats} 
        isLoading={isLoadingWorkItems} 
      />

      {/* Work Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5 text-indigo-600" />
            Danh sách hạng mục công việc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkItemList
            workItems={workItems}
            isLoading={isLoadingWorkItems}
            onCreateWorkItem={handleCreateWorkItem}
            onUpdateWorkItem={handleUpdateWorkItem}
            onDeleteWorkItem={handleDeleteWorkItem}
            onImportFromTemplate={handleImportFromTemplate}
            availableTemplates={availableTemplates}
            search={workItemFilters.search}
            onSearchChange={(value) => handleWorkItemFilterChange('search', value)}
            workItemTypeFilter={workItemFilters.workItemType}
            onWorkItemTypeFilterChange={(value) => handleWorkItemFilterChange('workItemType', value)}
            statusFilter={workItemFilters.status}
            onStatusFilterChange={(value) => handleWorkItemFilterChange('status', value)}
            priorityFilter={workItemFilters.priority}
            onPriorityFilterChange={(value) => handleWorkItemFilterChange('priority', value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}