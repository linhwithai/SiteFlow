'use client';

import { 
  BarChart3, 
  Download, 
  FileText, 
  Filter, 
  Plus, 
  Settings, 
  Upload, 
  Users,
  Calendar,
  Mail,
  Bell
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type QuickActionsPanelProps = {
  onCreateProject?: () => void;
  onExportReport?: () => void;
  onImportData?: () => void;
  onManageUsers?: () => void;
};

export function QuickActionsPanel({ 
  onCreateProject,
  onExportReport,
  onImportData,
  onManageUsers 
}: QuickActionsPanelProps) {
  const primaryActions = [
    {
      title: 'Tạo dự án mới',
      description: 'Bắt đầu một dự án mới',
      icon: Plus,
      onClick: onCreateProject,
      href: '/dashboard/projects?action=create',
      variant: 'default' as const,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Xuất báo cáo',
      description: 'Tải xuống báo cáo tổng hợp',
      icon: Download,
      onClick: onExportReport,
      variant: 'outline' as const,
      color: 'hover:bg-green-50'
    },
    {
      title: 'Import dữ liệu',
      description: 'Nhập dữ liệu từ file Excel',
      icon: Upload,
      onClick: onImportData,
      variant: 'outline' as const,
      color: 'hover:bg-purple-50'
    },
    {
      title: 'Quản lý người dùng',
      description: 'Thêm/xóa thành viên team',
      icon: Users,
      onClick: onManageUsers,
      href: '/dashboard/organization-profile/organization-members',
      variant: 'outline' as const,
      color: 'hover:bg-orange-50'
    }
  ];

  const secondaryActions = [
    {
      title: 'Lịch dự án',
      description: 'Xem timeline và deadline',
      icon: Calendar,
      href: '/dashboard/calendar',
      color: 'hover:bg-blue-50'
    },
    {
      title: 'Thống kê nâng cao',
      description: 'Phân tích chi tiết hiệu suất',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'hover:bg-green-50'
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Cấu hình và tùy chỉnh',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'hover:bg-gray-50'
    },
    {
      title: 'Thông báo',
      description: 'Xem tất cả thông báo',
      icon: Bell,
      href: '/dashboard/notifications',
      color: 'hover:bg-yellow-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thao tác nhanh</CardTitle>
        <CardDescription>
          Các chức năng thường sử dụng để tăng hiệu suất làm việc
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Thao tác chính</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {primaryActions.map((action, index) => {
              const Icon = action.icon;
              const content = (
                <Button
                  variant={action.variant}
                  className={`w-full justify-start h-auto p-4 ${action.color}`}
                  onClick={action.onClick}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="size-5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs opacity-80">{action.description}</div>
                    </div>
                  </div>
                </Button>
              );

              return action.href ? (
                <Link key={index} href={action.href}>
                  {content}
                </Link>
              ) : (
                <div key={index}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Secondary Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Chức năng khác</h4>
          <div className="grid grid-cols-2 gap-2">
            {secondaryActions.map((action, index) => {
              const Icon = action.icon;
              const content = (
                <Button
                  variant="ghost"
                  className={`w-full justify-start h-auto p-3 ${action.color}`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="size-4 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{action.title}</div>
                      <div className="text-xs opacity-70">{action.description}</div>
                    </div>
                  </div>
                </Button>
              );

              return action.href ? (
                <Link key={index} href={action.href}>
                  {content}
                </Link>
              ) : (
                <div key={index}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Thống kê nhanh</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">62</div>
              <div className="text-xs text-blue-600">Dự án tổng</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-xs text-green-600">Hoàn thành</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

