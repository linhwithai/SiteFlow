'use client';

import { Calendar, Edit, Eye, Filter, Plus, Search, Trash2, User, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkItemForm } from '@/components/WorkItemForm';

// Types
type WorkItem = {
  id: number;
  projectId: number;
  workItemTitle: string;
  workItemDescription: string | null;
  workItemType: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  workDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  estimatedWorkHours: number | null;
  actualWorkHours: number | null;
  constructionLocation: string | null;
  projectName?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
};

type WorkItemListResponse = {
  workItems: WorkItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type WorkItemStats = {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalEstimatedHours: number;
  totalActualHours: number;
};

// Status labels and colors
const statusLabels: Record<string, string> = {
  'planned': 'Kế hoạch',
  'in_progress': 'Đang thực hiện',
  'completed': 'Hoàn thành',
  'cancelled': 'Đã hủy',
};

const statusColors: Record<string, string> = {
  'planned': 'bg-blue-100 text-blue-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
};

const priorityLabels: Record<string, string> = {
  'low': 'Thấp',
  'medium': 'Trung bình',
  'high': 'Cao',
  'urgent': 'Khẩn cấp',
};

const priorityColors: Record<string, string> = {
  'low': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-orange-100 text-orange-800',
  'urgent': 'bg-red-100 text-red-800',
};

const workItemTypeLabels: Record<string, string> = {
  'concrete_work': 'Bê tông',
  'steel_work': 'Thép',
  'masonry': 'Xây tường',
  'finishing': 'Hoàn thiện',
  'mep_installation': 'Lắp đặt MEP',
  'inspection': 'Kiểm tra',
  'safety_check': 'Kiểm tra an toàn',
};

// Define columns for DataTable
const columns: ColumnDef<WorkItem>[] = [
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
    accessorKey: 'workItemType',
    header: 'Loại',
    cell: ({ row }) => {
      const type = row.getValue('workItemType') as string;
      return (
        <div className="text-sm">
          {workItemTypeLabels[type] || type}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const label = statusLabels[status] || status;
      const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
      
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
      const label = priorityLabels[priority] || priority;
      const colorClass = priorityColors[priority] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={colorClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'assignedToName',
    header: 'Người được giao',
    cell: ({ row }) => {
      const assignedTo = row.getValue('assignedToName') as string | null;
      return (
        <div className="flex items-center text-sm">
          <User className="size-4 mr-2 text-gray-400" />
          {assignedTo || 'Chưa giao'}
        </div>
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
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => {
      const workItem = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <Eye className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/dashboard/projects/${workItem.projectId}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              Xem dự án
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(workItem)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(workItem.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function WorkItemsPage() {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [stats, setStats] = useState<WorkItemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  
  // Pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    workItemType: 'all',
    projectId: '',
    assignedTo: '',
  });

  // Fetch work items from API
  const fetchWorkItems = async () => {
    try {
      setIsLoading(true);
      
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== 'all')
        ),
      });

      const response = await fetch(`/api/work-items?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch work items');
      }

      const data: WorkItemListResponse = await response.json();
      setWorkItems(data.workItems);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching work items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/work-items/stats');
      if (response.ok) {
        const statsData: WorkItemStats = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle actions
  const handleEdit = (workItem: WorkItem) => {
    setEditingWorkItem(workItem);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa hạng mục này?')) {
      try {
        const response = await fetch(`/api/work-items/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchWorkItems();
          await fetchStats();
        } else {
          alert('Lỗi khi xóa hạng mục');
        }
      } catch (error) {
        console.error('Error deleting work item:', error);
        alert('Lỗi khi xóa hạng mục');
      }
    }
  };

  const handleCreate = () => {
    setEditingWorkItem(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
    try {
      const url = editingWorkItem 
        ? `/api/work-items/${editingWorkItem.id}` 
        : '/api/work-items';
      
      const method = editingWorkItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingWorkItem(null);
        await fetchWorkItems();
        await fetchStats();
      } else {
        alert('Lỗi khi lưu hạng mục');
      }
    } catch (error) {
      console.error('Error saving work item:', error);
      alert('Lỗi khi lưu hạng mục');
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchWorkItems();
    fetchStats();
  }, [pagination.page, filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tất cả hạng mục</h1>
          <p className="text-muted-foreground">
            Xem và quản lý tất cả hạng mục công việc từ các dự án
          </p>
        </div>
        <Button onClick={handleCreate} className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Tạo hạng mục mới
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng hạng mục</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kế hoạch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <Input
                placeholder="Tìm theo tên hạng mục..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="planned">Kế hoạch</SelectItem>
                  <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ưu tiên</label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ưu tiên</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại</label>
              <Select value={filters.workItemType} onValueChange={(value) => setFilters({ ...filters, workItemType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="concrete_work">Bê tông</SelectItem>
                  <SelectItem value="steel_work">Thép</SelectItem>
                  <SelectItem value="masonry">Xây tường</SelectItem>
                  <SelectItem value="finishing">Hoàn thiện</SelectItem>
                  <SelectItem value="mep_installation">Lắp đặt MEP</SelectItem>
                  <SelectItem value="inspection">Kiểm tra</SelectItem>
                  <SelectItem value="safety_check">Kiểm tra an toàn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hạng mục</CardTitle>
          <CardDescription>
            Tổng cộng {pagination.total} hạng mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={workItems}
            isLoading={isLoading}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              totalPages: pagination.totalPages,
              onPageChange: (page) => setPagination({ ...pagination, page }),
            }}
          />
        </CardContent>
      </Card>

      {/* Work Item Modal */}
      <WorkItemForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWorkItem(null);
        }}
        onSubmit={handleModalSubmit}
        workItem={editingWorkItem}
        projectId={editingWorkItem?.projectId || 0}
      />
    </div>
  );
}








