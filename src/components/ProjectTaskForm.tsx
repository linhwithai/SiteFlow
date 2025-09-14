'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, Tag, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// import { TASK_PRIORITY, TASK_TYPE } from '@/types/Enum';
import type { CreateProjectTaskRequest, ProjectTask, UpdateProjectTaskRequest } from '@/types/Project';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  type: z.enum(['CONSTRUCTION', 'INSPECTION', 'MAINTENANCE', 'SAFETY', 'QUALITY', 'ADMINISTRATIVE', 'OTHER']),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

type ProjectTaskFormProps = {
  task?: ProjectTask;
  projectId: number;
  onSubmit: (data: CreateProjectTaskRequest | UpdateProjectTaskRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const typeOptions = [
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'QUALITY', label: 'Quality' },
  { value: 'ADMINISTRATIVE', label: 'Administrative' },
  { value: 'OTHER', label: 'Other' },
];

export function ProjectTaskForm({
  task,
  projectId,
  onSubmit,
  onCancel,
  loading = false,
}: ProjectTaskFormProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [newDependency, setNewDependency] = useState('');

  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    // reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority?.toUpperCase() as any || 'MEDIUM',
      type: task?.type?.toUpperCase() as any || 'OTHER',
      assignedTo: task?.assignedTo || '',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: task?.estimatedHours || undefined,
    },
  });

  useEffect(() => {
    if (task) {
      setTags(task.tags || []);
      setDependencies(task.dependencies || []);
    }
  }, [task]);

  const watchedValues = watch();

  const handleFormSubmit = (data: TaskFormData) => {
    const formData = {
      ...data,
      projectId,
      tags: tags.length > 0 ? tags : undefined,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
    };

    onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addDependency = () => {
    if (newDependency.trim() && !dependencies.includes(newDependency.trim())) {
      setDependencies([...dependencies, newDependency.trim()]);
      setNewDependency('');
    }
  };

  const removeDependency = (depToRemove: string) => {
    setDependencies(dependencies.filter(dep => dep !== depToRemove));
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter task title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          {/* Priority and Type */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={watchedValues.priority}
                onValueChange={value => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={watchedValues.type}
                onValueChange={value => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment and Due Date */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  id="assignedTo"
                  {...register('assignedTo')}
                  placeholder="User ID or email"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Estimated Hours */}
          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 size-4 text-gray-400" />
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                {...register('estimatedHours', { valueAsNumber: true })}
                placeholder="0"
                className="pl-10"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-800"
                  >
                    <Tag className="size-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-600"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dependencies */}
          <div className="space-y-2">
            <Label>Dependencies (Task IDs)</Label>
            <div className="flex gap-2">
              <Input
                value={newDependency}
                onChange={e => setNewDependency(e.target.value)}
                placeholder="Add task ID"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addDependency())}
              />
              <Button type="button" onClick={addDependency} variant="outline">
                Add
              </Button>
            </div>
            {dependencies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {dependencies.map((dep, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800"
                  >
                    <span>
                      Task #
                      {dep}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDependency(dep)}
                      className="hover:text-gray-600"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
