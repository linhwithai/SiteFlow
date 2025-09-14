'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  // MoreHorizontal,
  Edit,
  PlayCircle,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { TASK_STATUS, TASK_PRIORITY, TASK_TYPE } from '@/types/Enum';
import type { ProjectTask } from '@/types/Project';

type ProjectTaskListProps = {
  tasks: ProjectTask[];
  loading?: boolean;
  onTaskUpdate?: (taskId: number, updates: Partial<ProjectTask>) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskEdit?: (task: ProjectTask) => void;
};

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: PlayCircle },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

export function ProjectTaskList({
  tasks,
  loading = false,
  onTaskUpdate: _onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
}: ProjectTaskListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesSearch = searchTerm === ''
      || task.title.toLowerCase().includes(searchTerm.toLowerCase())
      || (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesPriority && matchesSearch;
  });

  // const handleStatusChange = (taskId: number, newStatus: string) => {
  //   onTaskUpdate?.(taskId, { status: newStatus as any });
  // };

  // const handleProgressChange = (taskId: number, newProgress: number) => {
  //   onTaskUpdate?.(taskId, { progress: newProgress });
  // };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {Object.entries(priorityConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0
          ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No tasks found</p>
                </CardContent>
              </Card>
            )
          : (
              filteredTasks.map((task) => {
                const statusInfo = statusConfig[task.status as keyof typeof statusConfig];
                const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig];
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={task.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <StatusIcon className="size-5 text-gray-500" />
                            <h3 className="text-lg font-semibold">{task.title}</h3>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                            <Badge className={priorityInfo.color}>
                              {priorityInfo.label}
                            </Badge>
                          </div>

                          {task.description && (
                            <p className="mb-3 text-gray-600">{task.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {task.assignedTo && (
                              <div className="flex items-center gap-1">
                                <User className="size-4" />
                                <span>
                                  Assigned to:
                                  {task.assignedTo}
                                </span>
                              </div>
                            )}

                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="size-4" />
                                <span>
                                  Due:
                                  {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: vi })}
                                </span>
                              </div>
                            )}

                            {task.estimatedHours && (
                              <div className="flex items-center gap-1">
                                <Clock className="size-4" />
                                <span>
                                  {task.estimatedHours}
                                  h estimated
                                </span>
                              </div>
                            )}

                            {task.actualHours && (
                              <div className="flex items-center gap-1">
                                <Clock className="size-4" />
                                <span>
                                  {task.actualHours}
                                  h actual
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {task.progress}
                                %
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                              <Tag className="size-4 text-gray-500" />
                              <div className="flex flex-wrap gap-1">
                                {task.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="ml-4 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTaskEdit?.(task)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTaskDelete?.(Number.parseInt(task.id))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
      </div>
    </div>
  );
}
