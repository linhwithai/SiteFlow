'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon, 
  WrenchIcon, 
  FileTextIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { WorkItem, WorkItemType, WorkItemStatus, WorkItemPriority } from '@/types/WorkItem';
import { WORK_ITEM_TYPE_LABELS, WORK_ITEM_STATUS_LABELS, WORK_ITEM_PRIORITY_LABELS, WORK_ITEM_STATUS_COLORS, WORK_ITEM_PRIORITY_COLORS } from '@/types/WorkItem';
import { WorkItemForm } from './WorkItemForm';

interface WorkItemListProps {
  workItems: WorkItem[];
  isLoading: boolean;
  onCreateWorkItem: (data: any) => Promise<void>;
  onUpdateWorkItem: (id: number, data: any) => Promise<void>;
  onDeleteWorkItem: (id: number) => Promise<void>;
  onImportFromTemplate: (templateId: string) => Promise<void>;
  availableTemplates: Array<{ id: string; name: string; description: string; workItemCount: number }>;
  search: string;
  onSearchChange: (search: string) => void;
  workItemTypeFilter: string;
  onWorkItemTypeFilterChange: (type: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
}

export function WorkItemList({
  workItems,
  isLoading,
  onCreateWorkItem,
  onUpdateWorkItem,
  onDeleteWorkItem,
  onImportFromTemplate,
  availableTemplates,
  search,
  onSearchChange,
  workItemTypeFilter,
  onWorkItemTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}: WorkItemListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleCreateWorkItem = async (data: any) => {
    await onCreateWorkItem(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateWorkItem = async (data: any) => {
    if (editingWorkItem) {
      await onUpdateWorkItem(editingWorkItem.id, data);
      setEditingWorkItem(null);
    }
  };

  const handleDeleteWorkItem = async (id: number) => {
    await onDeleteWorkItem(id);
  };

  const handleImportFromTemplate = async () => {
    if (selectedTemplate) {
      await onImportFromTemplate(selectedTemplate);
      setIsImportDialogOpen(false);
      setSelectedTemplate('');
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Chưa xác định';
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'Không hợp lệ';
    }
  };

  const formatHours = (hours: number | undefined) => {
    if (!hours) return 'Chưa xác định';
    return `${hours}h`;
  };

  const workItemTypes = Object.entries(WORK_ITEM_TYPE_LABELS) as [WorkItemType, string][];
  const statuses = Object.entries(WORK_ITEM_STATUS_LABELS) as [WorkItemStatus, string][];
  const priorities = Object.entries(WORK_ITEM_PRIORITY_LABELS) as [WorkItemPriority, string][];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hạng mục công việc</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý các hạng mục công việc trong dự án
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FileTextIcon className="size-4" />
                Import mẫu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import hạng mục công việc từ mẫu</DialogTitle>
                <DialogDescription>
                  Chọn một mẫu để import danh sách hạng mục công việc có sẵn
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mẫu hạng mục công việc" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-sm text-gray-500">
                            {template.workItemCount} hạng mục
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleImportFromTemplate}
                    disabled={!selectedTemplate}
                  >
                    Import
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="size-4" />
                Tạo hạng mục
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <WorkItemForm
                onSubmit={handleCreateWorkItem}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="size-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Tìm kiếm hạng mục..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={workItemTypeFilter || 'all'} onValueChange={onWorkItemTypeFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Loại hạng mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {workItemTypes.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter || 'all'} onValueChange={onStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statuses.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter || 'all'} onValueChange={onPriorityFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
                {priorities.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Items Table */}
      <Card>
        <CardContent className="p-0">
          {workItems.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="mx-auto size-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Chưa có hạng mục công việc
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Bắt đầu bằng cách tạo hạng mục công việc đầu tiên hoặc import từ mẫu có sẵn
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusIcon className="size-4 mr-2" />
                  Tạo hạng mục đầu tiên
                </Button>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                  <FileTextIcon className="size-4 mr-2" />
                  Import từ mẫu
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên hạng mục</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Độ ưu tiên</TableHead>
                  <TableHead>Ngày thực hiện</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Lao động</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workItems.map((workItem) => (
                  <TableRow key={workItem.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{workItem.workItemTitle}</div>
                        {workItem.workItemDescription && (
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {workItem.workItemDescription}
                          </div>
                        )}
                        {workItem.constructionLocation && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPinIcon className="size-3" />
                            {workItem.constructionLocation}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {WORK_ITEM_TYPE_LABELS[workItem.workItemType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={WORK_ITEM_STATUS_COLORS[workItem.status]}>
                        {WORK_ITEM_STATUS_LABELS[workItem.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={WORK_ITEM_PRIORITY_COLORS[workItem.priority]}>
                        {WORK_ITEM_PRIORITY_LABELS[workItem.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <CalendarIcon className="size-3" />
                        {formatDate(workItem.workDate)}
                      </div>
                      {workItem.dueDate && (
                        <div className="text-xs text-gray-500">
                          Hạn: {formatDate(workItem.dueDate)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {workItem.estimatedWorkHours && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            Ước tính: {formatHours(workItem.estimatedWorkHours)}
                          </div>
                        )}
                        {workItem.actualWorkHours && (
                          <div className="flex items-center gap-1 text-green-600">
                            <ClockIcon className="size-3" />
                            Thực tế: {formatHours(workItem.actualWorkHours)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {workItem.laborCount > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <UsersIcon className="size-3" />
                          {workItem.laborCount} người
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingWorkItem(workItem)}
                        >
                          <EditIcon className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                              <TrashIcon className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa hạng mục "{workItem.workItemTitle}"? 
                                Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteWorkItem(workItem.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingWorkItem} onOpenChange={() => setEditingWorkItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingWorkItem && (
            <WorkItemForm
              workItem={editingWorkItem}
              onSubmit={handleUpdateWorkItem}
              onCancel={() => setEditingWorkItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
