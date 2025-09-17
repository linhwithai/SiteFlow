'use client';

import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface SystemNotificationsProps {
  notifications?: Notification[];
  maxItems?: number;
}

export function SystemNotifications({ notifications = [], maxItems = 5 }: SystemNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications if none provided
  const mockNotifications: Notification[] = notifications.length > 0 ? notifications : [
    {
      id: '1',
      type: 'warning',
      title: 'Dự án sắp quá hạn',
      message: 'Dự án "Chung cư The Sun City" còn 3 ngày nữa đến hạn hoàn thành',
      timestamp: '2 giờ trước',
      read: false,
      action: {
        label: 'Xem chi tiết',
        href: '/dashboard/projects/1'
      }
    },
    {
      id: '2',
      type: 'info',
      title: 'Nhật ký thi công mới',
      message: 'Dự án "Mega Mall" vừa có nhật ký thi công mới được cập nhật',
      timestamp: '4 giờ trước',
      read: false,
      action: {
        label: 'Xem nhật ký',
        href: '/dashboard/projects/2/daily-logs'
      }
    },
    {
      id: '3',
      type: 'success',
      title: 'Hạng mục hoàn thành',
      message: 'Hạng mục "Đổ bê tông móng" đã được hoàn thành thành công',
      timestamp: '6 giờ trước',
      read: true,
      action: {
        label: 'Xem hạng mục',
        href: '/dashboard/projects/1/work-items'
      }
    },
    {
      id: '4',
      type: 'error',
      title: 'Lỗi hệ thống',
      message: 'Có lỗi xảy ra khi tải dữ liệu dự án. Vui lòng thử lại.',
      timestamp: '1 ngày trước',
      read: true
    }
  ];

  const unreadCount = mockNotifications.filter(n => !n.read).length;
  const displayNotifications = mockNotifications.slice(0, maxItems);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBadgeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Thông báo</CardTitle>
            <CardDescription className="text-xs">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {displayNotifications.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Không có thông báo nào</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {displayNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        if (notification.action) {
                          window.location.href = notification.action.href;
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {notification.timestamp}
                            </span>
                            <Badge className={`text-xs ${getBadgeColor(notification.type)}`}>
                              {notification.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for header
export function SystemNotificationsCompact() {
  return <SystemNotifications maxItems={3} />;
}