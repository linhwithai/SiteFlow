'use client';

import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Bell
} from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type NotificationType = 'info' | 'warning' | 'success' | 'error';

type SystemNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type SystemNotificationsProps = {
  notifications?: SystemNotification[];
  onDismiss?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
};

// Mock notifications - sẽ được thay thế bằng API thực
const mockNotifications: SystemNotification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Ngân sách sắp hết',
    message: 'Dự án "Tòa nhà A" đã sử dụng 85% ngân sách',
    timestamp: '2 phút trước',
    isRead: false,
    action: {
      label: 'Xem chi tiết',
      onClick: () => {} // TODO: Implement view budget details
    }
  },
  {
    id: '2',
    type: 'info',
    title: 'Deadline sắp tới',
    message: '3 dự án có deadline trong 7 ngày tới',
    timestamp: '15 phút trước',
    isRead: false,
    action: {
      label: 'Xem lịch',
      onClick: () => {} // TODO: Implement view calendar
    }
  },
  {
    id: '3',
    type: 'success',
    title: 'Dự án hoàn thành',
    message: 'Dự án "Cải tạo nhà xưởng" đã hoàn thành đúng hạn',
    timestamp: '1 giờ trước',
    isRead: true
  },
  {
    id: '4',
    type: 'info',
    title: 'Thành viên mới',
    message: 'Nguyễn Văn A đã tham gia team',
    timestamp: '2 giờ trước',
    isRead: true
  }
];

const notificationIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertTriangle,
};

const notificationColors = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export function SystemNotifications({ 
  notifications = mockNotifications,
  onDismiss,
  onMarkAsRead 
}: SystemNotificationsProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const handleDismiss = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
    onDismiss?.(id);
  };

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    onMarkAsRead?.(id);
  };

  const unreadCount = localNotifications.filter(n => !n.isRead).length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="size-5" />
            Thông báo hệ thống
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => localNotifications.forEach(n => !n.isRead && handleMarkAsRead(n.id))}
              className="text-xs"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {localNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có thông báo mới</p>
          </div>
        ) : (
          localNotifications.map((notification) => {
            const Icon = notificationIcons[notification.type];
            const colorClass = notificationColors[notification.type];
            
            return (
              <Alert 
                key={notification.id} 
                className={`relative ${colorClass} ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="size-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs mt-1 opacity-90">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs opacity-70">{notification.timestamp}</span>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Mới
                            </Badge>
                          )}
                        </div>
                        {notification.action && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={notification.action.onClick}
                            className="mt-2 h-6 px-2 text-xs"
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="size-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Alert>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for header
export function SystemNotificationsCompact() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-96 max-w-[calc(100vw-2rem)]">
            <SystemNotifications />
          </div>
        </>
      )}
    </div>
  );
}
