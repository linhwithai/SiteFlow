/**
 * Error Boundary Component for ERP System
 * 
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */

'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Component, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/libs/Logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  level?: 'page' | 'component' | 'critical';
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details
    const errorId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: this.props.level || 'component',
      },
    });

    // Log to our logger
    logger.error('Error caught by ErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId,
      level: this.props.level || 'component',
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI based on level
      const { level = 'component' } = this.props;
      
      if (level === 'critical') {
        return this.renderCriticalError();
      } else if (level === 'page') {
        return this.renderPageError();
      } else {
        return this.renderComponentError();
      }
    }

    return this.props.children;
  }

  private renderCriticalError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Hệ thống gặp lỗi nghiêm trọng</CardTitle>
            <CardDescription className="text-gray-600">
              Xin lỗi, đã xảy ra lỗi không thể khôi phục. Vui lòng liên hệ quản trị viên.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {this.state.errorId && (
              <div className="p-3 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Mã lỗi:</strong> {this.state.errorId}
                </p>
              </div>
            )}
            <div className="flex space-x-2">
              <Button onClick={this.handleRetry} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
              <Button onClick={this.handleGoHome} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  private renderPageError() {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <CardTitle className="text-lg text-gray-900">Trang này gặp lỗi</CardTitle>
            <CardDescription className="text-gray-600">
              Không thể tải nội dung trang. Vui lòng thử lại hoặc quay lại trang trước.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {this.state.errorId && (
              <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                Mã lỗi: {this.state.errorId}
              </div>
            )}
            <div className="flex space-x-2">
              <Button onClick={this.handleRetry} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tải lại
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  private renderComponentError() {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Component gặp lỗi</h3>
            <p className="text-sm text-red-600 mt-1">
              Không thể hiển thị component này. Vui lòng thử lại.
            </p>
            {this.state.errorId && (
              <p className="text-xs text-red-500 mt-2">
                Mã lỗi: {this.state.errorId}
              </p>
            )}
            <Button
              onClick={this.handleRetry}
              size="sm"
              variant="outline"
              className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error boundary state
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    const errorId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo?.componentStack,
        },
      },
    });

    logger.error('Error handled by useErrorHandler:', {
      error: error.message,
      stack: error.stack,
      errorId,
    });

    return errorId;
  };
}
