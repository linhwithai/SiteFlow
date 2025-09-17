'use client';

import { Building2, Calendar, DollarSign, Edit, Eye, Filter, MapPin, MoreHorizontal, Plus, Search, Trash2, User } from 'lucide-react';
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
import { CONSTRUCTION_PROJECT_STATUS } from '@/types/Enum';

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

type ProjectStats = {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  cancelled: number;
  planning: number;
  totalBudget: number;
  averageBudget: number;
};

type ProjectListResponse = {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Status labels and colors
const statusLabels = {
  [CONSTRUCTION_PROJECT_STATUS.PLANNING]: 'Lập kế hoạch',
  [CONSTRUCTION_PROJECT_STATUS.ACTIVE]: 'Đang thi công',
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const limit = 12;

  // Fetch functions for external use (like delete)
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchInput && { search: searchInput }),
      });

      const response = await fetch(`/api/projects?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data: ProjectListResponse = await response.json();
      setProjects(data.projects);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/projects/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch project stats');
      }
      const data: ProjectStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching project stats:', error);
    }
  };

  // Get project manager name
  const getProjectManagerName = (projectManagerId: string | null | undefined) => {
    if (!projectManagerId) return 'Chưa phân công';
    const user = users.find(u => u.id === projectManagerId);
    return user ? user.name : 'Không xác định';
  };

  // Handle delete project
  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa công trình "${project.name}"?`)) {
      try {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete project');
        }

        await Promise.all([
          fetchProjects(),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Error deleting project:', error);
        window.alert('Có lỗi xảy ra khi xóa công trình');
      }
    }
  };

  // Define columns for DataTable
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: 'Công trình',
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center space-x-3">
            {/* Project Thumbnail */}
            <div className="flex-shrink-0">
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
                <Building2 className="size-6 text-blue-600" />
              </div>
            </div>
            
            {/* Project Info */}
            <div className="min-w-0 flex-1">
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
              >
                {project.name}
              </Link>
              <p className="text-sm text-gray-500 truncate">
                {project.description || 'Không có mô tả'}
              </p>
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <MapPin className="size-3 mr-1" />
                {project.city && project.province 
                  ? `${project.city}, ${project.province}` 
                  : 'Chưa xác định vị trí'
                }
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'projectManagerId',
      header: 'Quản lý',
      cell: ({ row }) => {
        const projectManagerId = row.getValue('projectManagerId') as string | null;
        return (
          <div className="flex items-center text-sm">
            <User className="size-4 mr-2 text-gray-400" />
            {getProjectManagerName(projectManagerId)}
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
      accessorKey: 'startDate',
      header: 'Ngày bắt đầu',
      cell: ({ row }) => {
        const date = row.getValue('startDate') as string | null;
        if (!date) return <span className="text-sm text-gray-500">Chưa xác định</span>;
        return (
          <div className="flex items-center text-sm">
            <Calendar className="size-4 mr-2 text-gray-400" />
            {new Date(date).toLocaleDateString('vi-VN')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/projects/${project.id}`}>
                  <Eye className="mr-2 size-4" />
                  Xem chi tiết
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/projects/${project.id}/edit`}>
                  <Edit className="mr-2 size-4" />
                  Chỉnh sửa
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteProject(project)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 size-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Single useEffect with smart loading logic
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      // Load static data only if not already loaded
      if (users.length === 0 && stats === null) {
        const [usersData, statsData] = await Promise.all([
          fetch('/api/users').then(res => res.json()),
          fetch('/api/projects/stats').then(res => res.json())
        ]);
        
        if (isMounted) {
          setUsers(usersData.users || []);
          setStats(statsData);
        }
      }
      
      // Always load projects
      if (isMounted) {
        setIsLoading(true);
        try {
          const searchParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(statusFilter !== 'all' && { status: statusFilter }),
            ...(searchInput && { search: searchInput }),
          });

          const response = await fetch(`/api/projects?${searchParams}`);
          if (!response.ok) {
            throw new Error('Failed to fetch projects');
          }

          const data = await response.json();
          setProjects(data.projects);
          setTotal(data.pagination.total);
        } catch (error) {
          console.error('Error fetching projects:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [page, searchInput, statusFilter, users.length, stats]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý công trình</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả các công trình xây dựng
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 size-4" />
            Tạo công trình mới
          </Link>
        </Button>
      </div>

      {/* Project Statistics */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng công trình</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Building2 className="size-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang thi công</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="size-4 rounded-full bg-green-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="size-4 rounded-full bg-gray-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng ngân sách</p>
                  <p className="text-lg font-bold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      notation: 'compact',
                    }).format(stats.totalBudget)}
                  </p>
                </div>
                <DollarSign className="size-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm công trình..."
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
          <CardTitle>Danh sách công trình</CardTitle>
          <CardDescription>
            Hiển thị {projects.length} trong tổng số {total} công trình
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
            <DataTable columns={columns} data={projects} />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị {((page - 1) * limit) + 1} đến {Math.min(page * limit, total)} trong tổng số {total} công trình
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= total}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}