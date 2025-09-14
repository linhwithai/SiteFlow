/**
 * Error Fallback Components for different error scenarios
 * 
 * These components provide consistent error UI across the application
 */

'use client';

import { AlertTriangle, RefreshCw, Home, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  type?: 'network' | 'permission' | 'not-found' | 'server' | 'generic';
  title?: string;
  description?: string;
  showRetry?: boolean;
  showHome?: boolean;
}

export function ErrorFallback({
  error,
  resetError,
  type = 'generic',
  title,
  description,
  showRetry = true,
  showHome = true,
}: ErrorFallbackProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          iconColor: 'text-orange-600',
          iconBg: 'bg-orange-100',
          title: title || 'Lỗi kết nối mạng',
          description: description || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.',
        };
      case 'permission':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          title: title || 'Không có quyền truy cập',
          description: description || 'Bạn không có quyền thực hiện hành động này. Vui lòng liên hệ quản trị viên.',
        };
      case 'not-found':
        return {
          icon: AlertTriangle,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          title: title || 'Không tìm thấy',
          description: description || 'Tài nguyên bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
        };
      case 'server':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          title: title || 'Lỗi máy chủ',
          description: description || 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.',
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
          title: title || 'Đã xảy ra lỗi',
          description: description || 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại.',
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className={`mx-auto w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <CardTitle className="text-xl text-gray-900">{config.title}</CardTitle>
        <CardDescription className="text-gray-600">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && process.env.NODE_ENV === 'development' && (
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Chi tiết lỗi:</strong> {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer">Stack trace</summary>
                <pre className="text-xs text-gray-500 mt-1 overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
        <div className="flex space-x-2">
          {showRetry && resetError && (
            <Button onClick={resetError} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          )}
          {showHome && (
            <Button onClick={() => window.location.href = '/dashboard'} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Specific error fallback components
export function NetworkErrorFallback({ error, resetError }: { error?: Error; resetError?: () => void }) {
  return (
    <ErrorFallback
      error={error}
      resetError={resetError}
      type="network"
      showRetry={true}
      showHome={true}
    />
  );
}

export function PermissionErrorFallback({ error, resetError }: { error?: Error; resetError?: () => void }) {
  return (
    <ErrorFallback
      error={error}
      resetError={resetError}
      type="permission"
      showRetry={false}
      showHome={true}
    />
  );
}

export function NotFoundErrorFallback({ error, resetError }: { error?: Error; resetError?: () => void }) {
  return (
    <ErrorFallback
      error={error}
      resetError={resetError}
      type="not-found"
      showRetry={false}
      showHome={true}
    />
  );
}

export function ServerErrorFallback({ error, resetError }: { error?: Error; resetError?: () => void }) {
  return (
    <ErrorFallback
      error={error}
      resetError={resetError}
      type="server"
      showRetry={true}
      showHome={true}
    />
  );
}

// Loading error fallback
export function LoadingErrorFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
}

// Empty state fallback
export function EmptyStateFallback({
  title = 'Không có dữ liệu',
  description = 'Chưa có dữ liệu để hiển thị.',
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action}
    </div>
  );
}
