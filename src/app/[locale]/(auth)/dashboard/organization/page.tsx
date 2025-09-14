'use client';

import { Building2, Plus, Settings, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Organization = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
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

const OrganizationPage = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch('/api/organization');
        if (!response.ok) {
          throw new Error('Failed to fetch organization');
        }

        const data = await response.json();
        setOrganization(data.organization);
        setMembers(data.members);
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching organization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="py-12 text-center">
        <Building2 className="mx-auto size-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tổ chức</h3>
        <p className="mt-1 text-sm text-gray-500">
          Bạn chưa thuộc tổ chức nào. Vui lòng liên hệ quản trị viên.
        </p>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'org:owner':
        return 'bg-red-100 text-red-800';
      case 'org:admin':
        return 'bg-blue-100 text-blue-800';
      case 'org:member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'org:owner':
        return 'Chủ sở hữu';
      case 'org:admin':
        return 'Quản trị viên';
      case 'org:member':
        return 'Thành viên';
      default:
        return 'Không xác định';
    }
  };

  const isOwner = organization.role === 'org:owner';
  const isAdmin = organization.role === 'org:admin' || isOwner;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tổ chức</h1>
          <p className="text-sm text-gray-600">
            Quản lý thông tin và thành viên của tổ chức
          </p>
        </div>
        {isAdmin && (
          <Button>
            <Settings className="mr-2 size-4" />
            Cài đặt
          </Button>
        )}
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="shrink-0">
              {organization.imageUrl
                ? (
                    <img
                      className="size-16 rounded-lg object-cover"
                      src={organization.imageUrl}
                      alt={organization.name}
                    />
                  )
                : (
                    <div className="flex size-16 items-center justify-center rounded-lg bg-gray-200">
                      <Building2 className="size-8 text-gray-400" />
                    </div>
                  )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{organization.name}</CardTitle>
              <CardDescription className="mt-1">
                {organization.slug && `@${organization.slug}`}
              </CardDescription>
              <div className="mt-2 flex items-center space-x-2">
                <Badge className={getRoleBadgeColor(organization.role)}>
                  {getRoleLabel(organization.role)}
                </Badge>
                <span className="text-sm text-gray-500">
                  Thành viên từ
                  {' '}
                  {new Date(organization.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Tổng thành viên</h4>
              <p className="text-2xl font-bold text-blue-600">
                {organization.membersCount || 0}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Dự án đang hoạt động</h4>
              <p className="text-2xl font-bold text-green-600">
                {stats?.activeProjects || 0}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Ngân sách tổng</h4>
              <p className="text-2xl font-bold text-purple-600">
                {stats
                  ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                  }).format(stats.totalBudget)
                  : '0 ₫'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="mr-2 size-5" />
                Thành viên tổ chức
              </CardTitle>
              <CardDescription>
                Quản lý quyền hạn và vai trò của các thành viên
              </CardDescription>
            </div>
            {isAdmin && (
              <Button>
                <Plus className="mr-2 size-4" />
                Mời thành viên
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thành viên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Tham gia</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="shrink-0">
                        {member.imageUrl
                          ? (
                              <img
                                className="size-8 rounded-full object-cover"
                                src={member.imageUrl}
                                alt={member.name}
                              />
                            )
                          : (
                              <div className="flex size-8 items-center justify-center rounded-full bg-gray-200">
                                <span className="text-sm font-medium text-gray-600">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        {member.role === organization.role && (
                          <div className="text-sm text-gray-500">Bạn</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.role === 'org:owner'
                      ? (
                          <Button variant="outline" size="sm" disabled>
                            Chủ sở hữu
                          </Button>
                        )
                      : isAdmin
                        ? (
                            <Button variant="outline" size="sm">
                              Quản lý
                            </Button>
                          )
                        : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Quyền hạn theo vai trò</CardTitle>
          <CardDescription>
            Tìm hiểu về các quyền hạn của từng vai trò trong tổ chức
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Owner Role */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center space-x-2">
                <Badge className="bg-red-100 text-red-800">Chủ sở hữu</Badge>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Quản lý tổ chức</li>
                <li>• Mời/xóa thành viên</li>
                <li>• Thay đổi vai trò</li>
                <li>• Xóa tổ chức</li>
                <li>• Quản lý dự án</li>
                <li>• Xem tất cả dữ liệu</li>
              </ul>
            </div>

            {/* Admin Role */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">Quản trị viên</Badge>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Mời thành viên</li>
                <li>• Quản lý dự án</li>
                <li>• Xem báo cáo</li>
                <li>• Cài đặt dự án</li>
                <li>• Không thể xóa tổ chức</li>
              </ul>
            </div>

            {/* Member Role */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">Thành viên</Badge>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Xem dự án được phân công</li>
                <li>• Cập nhật tiến độ</li>
                <li>• Tạo nhật ký</li>
                <li>• Upload ảnh dự án</li>
                <li>• Không quản lý tổ chức</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationPage;
