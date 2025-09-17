'use client';

import { Building2, Calendar, Edit, Mail, MapPin, Phone, Plus, Settings, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Types
type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  foundedYear: number | null;
  headquarters: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
  membersCount: number;
  role: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  imageUrl: string | null;
};

type ProjectStats = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pausedProjects: number;
  totalBudget: number;
};

// Role labels and colors
const roleLabels: Record<string, string> = {
  'admin': 'Quản trị viên',
  'manager': 'Quản lý',
  'engineer': 'Kỹ sư',
  'supervisor': 'Giám sát',
  'member': 'Thành viên',
};

const roleColors: Record<string, string> = {
  'admin': 'bg-red-100 text-red-800',
  'manager': 'bg-blue-100 text-blue-800',
  'engineer': 'bg-green-100 text-green-800',
  'supervisor': 'bg-yellow-100 text-yellow-800',
  'member': 'bg-gray-100 text-gray-800',
};

// Define columns for members DataTable
const memberColumns: ColumnDef<Member>[] = [
  {
    accessorKey: 'name',
    header: 'Thành viên',
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
              <Users className="size-5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{member.name}</div>
            <div className="text-sm text-gray-500">{member.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Vai trò',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const label = roleLabels[role] || role;
      const colorClass = roleColors[role] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={colorClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'joinedAt',
    header: 'Ngày tham gia',
    cell: ({ row }) => {
      const date = row.getValue('joinedAt') as string;
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
    cell: () => {
      // const member = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
            >
              <Edit className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function OrganizationPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        
        // Fetch organization data
        const orgResponse = await fetch('/api/organization');
        if (orgResponse.ok) {
          const orgData: Organization = await orgResponse.json();
          setOrganization(orgData);
        }

        // Fetch members
        const membersResponse = await fetch('/api/organization/members');
        if (membersResponse.ok) {
          const membersData: Member[] = await membersResponse.json();
          setMembers(membersData);
        }

        // Fetch stats
        const statsResponse = await fetch('/api/projects/stats');
        if (statsResponse.ok) {
          const statsData: ProjectStats = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy thông tin tổ chức</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổ chức</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin tổ chức và thành viên
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Mời thành viên
        </Button>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex size-16 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="size-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{organization.name}</CardTitle>
              <CardDescription>
                {organization.description || 'Không có mô tả'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Ngành nghề</label>
              <p className="text-sm">{organization.industry || 'Chưa xác định'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Quy mô</label>
              <p className="text-sm">{organization.size || 'Chưa xác định'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Năm thành lập</label>
              <p className="text-sm">{organization.foundedYear || 'Chưa xác định'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Trụ sở chính</label>
              <p className="text-sm">{organization.headquarters || 'Chưa xác định'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Website</label>
              <p className="text-sm">
                {organization.website ? (
                  <a 
                    href={organization.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                ) : 'Chưa xác định'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Email liên hệ</label>
              <div className="flex items-center text-sm">
                <Mail className="size-4 mr-2 text-gray-400" />
                {organization.contactEmail || 'Chưa xác định'}
              </div>
            </div>
          </div>
          
          {(organization.address || organization.phone) && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid gap-4 md:grid-cols-2">
                {organization.address && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                    <div className="flex items-start text-sm">
                      <MapPin className="size-4 mr-2 text-gray-400 mt-0.5" />
                      {organization.address}
                    </div>
                  </div>
                )}
                {organization.phone && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Điện thoại</label>
                    <div className="flex items-center text-sm">
                      <Phone className="size-4 mr-2 text-gray-400" />
                      {organization.phone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng dự án</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dự án đang thi công</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dự án hoàn thành</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completedProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng ngân sách</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalBudget 
                  ? new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(stats.totalBudget)
                  : 'Chưa xác định'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Thành viên</CardTitle>
              <CardDescription>
                Tổng cộng {members.length} thành viên
              </CardDescription>
            </div>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Thêm thành viên
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={memberColumns}
            data={members}
          />
        </CardContent>
      </Card>
    </div>
  );
}