'use client';

import { Building2, Download, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickActionsPanel() {
  const actions = [
    {
      title: 'Tạo dự án mới',
      description: 'Thêm công trình xây dựng mới',
      icon: Building2,
      href: '/dashboard/projects/new',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Xem tất cả dự án',
      description: 'Quản lý và theo dõi dự án',
      icon: Building2,
      href: '/dashboard/projects',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Báo cáo tổng hợp',
      description: 'Xuất báo cáo PDF/Excel',
      icon: Download,
      href: '/dashboard/reports',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Cấu hình và quản lý',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
        <CardDescription>
          Các chức năng thường sử dụng để tăng hiệu suất làm việc
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-4 justify-start w-full hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}