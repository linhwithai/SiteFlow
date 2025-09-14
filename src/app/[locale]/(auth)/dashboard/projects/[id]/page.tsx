'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ProjectDetail } from '@/components/ProjectDetail';
import { ProjectTaskList } from '@/components/ProjectTaskList';
import { ProjectTaskStats } from '@/components/ProjectTaskStats';
import { ProjectTaskForm } from '@/components/ProjectTaskForm';
import { useProjectTasks } from '@/hooks/useProjectTasks';
import type { Project, ProjectTask } from '@/types/Project';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, List } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Task management
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Use project tasks hook
  const {
    tasks,
    stats,
    loading: tasksLoading,
    createTask,
    updateTask,
    deleteTask,
  } = useProjectTasks({ 
    projectId: parseInt(projectId), 
    autoFetch: true 
  });

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

      const data: Project = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit project
  const handleEditProject = (project: Project) => {
    router.push(`/dashboard/projects/${project.id}/edit`);
  };

  // Handle delete project
  const handleDeleteProject = async (project: Project) => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Redirect to projects list
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      // alert('Có lỗi xảy ra khi xóa dự án');
    } finally {
      setIsDeleting(false);
    }
  };

  // Task handlers
  const handleCreateTask = async (data: any) => {
    const result = await createTask(data);
    if (result) {
      setShowTaskForm(false);
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (editingTask) {
      const result = await updateTask(parseInt(editingTask.id), data);
      if (result) {
        setEditingTask(null);
        setShowTaskForm(false);
      }
    }
  };

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleTaskUpdate = async (taskId: number, updates: Partial<ProjectTask>) => {
    await updateTask(taskId, updates);
  };


  // Load project on mount
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="mb-6 h-4 w-1/2 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-64 rounded bg-gray-200"></div>
              <div className="h-48 rounded bg-gray-200"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 rounded bg-gray-200"></div>
              <div className="h-32 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Không tìm thấy dự án
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            type="button"
            onClick={() => router.push('/dashboard/projects')}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Quay lại danh sách dự án
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <ProjectDetail
        project={project}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        isLoading={isDeleting}
      />

      {/* Task Management Section */}
      <div className="space-y-6">
        {/* Task Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Task Management</h2>
          <Button
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ProjectTaskForm
                task={editingTask || undefined}
                projectId={parseInt(projectId)}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
                loading={tasksLoading}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ProjectTaskList
              tasks={tasks || []}
              loading={tasksLoading}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleDeleteTask}
              onTaskEdit={handleEditTask}
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <ProjectTaskStats
              stats={stats}
              loading={tasksLoading}
            />
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Project details will be shown here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
