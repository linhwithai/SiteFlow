import { Building2, Calendar, FileText, PlusIcon, Users } from 'lucide-react';
import Link from 'next/link';

import { OrganizationInfo } from '@/components/OrganizationInfo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata(_props: { params: { locale: string } }) {
  return {
    title: 'Dashboard - SiteFlow',
    description: 'Quản lý dự án xây dựng',
  };
}

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h1 className="mb-2 text-2xl font-bold">
          Chào mừng đến với SiteFlow
        </h1>
        <p className="text-blue-100">
          Nền tảng quản lý dự án xây dựng thông minh cho các công ty Việt Nam
        </p>
      </div>

      {/* Organization Info */}
      <OrganizationInfo />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dự án</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Logs</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành viên</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bắt đầu nhanh</CardTitle>
            <CardDescription>
              Các hành động phổ biến để quản lý dự án
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/projects/new">
              <Button className="w-full justify-start" variant="outline">
                <PlusIcon className="mr-2 size-4" />
                Tạo dự án mới
              </Button>
            </Link>
            <Link href="/dashboard/projects">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="mr-2 size-4" />
                Quản lý dự án
              </Button>
            </Link>
            <Link href="/dashboard/projects/demo">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="mr-2 size-4" />
                Demo dự án (không cần DB)
              </Button>
            </Link>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 size-4" />
              Tạo daily log
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 size-4" />
              Mời thành viên
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dự án gần đây</CardTitle>
            <CardDescription>
              Các dự án bạn đang tham gia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              <Building2 className="mx-auto mb-4 size-12 opacity-50" />
              <p>Chưa có dự án nào</p>
              <p className="text-sm">Tạo dự án đầu tiên để bắt đầu</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>
            Các hoạt động mới nhất trong tổ chức
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-4 size-12 opacity-50" />
            <p>Chưa có hoạt động nào</p>
            <p className="text-sm">Các hoạt động sẽ hiển thị ở đây</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
