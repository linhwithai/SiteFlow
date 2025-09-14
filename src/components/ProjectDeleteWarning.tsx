'use client';

import { AlertTriangle, Shield, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProjectDeleteWarning() {
  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Shield className="size-5" />
          Cảnh báo bảo mật dữ liệu
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 text-amber-600 dark:text-amber-400" />
            <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium">
                ⚠️ Việc xóa dự án là hành động NGUY HIỂM và KHÔNG THỂ HOÀN TÁC!
              </p>
              <div className="space-y-1 pl-2">
                <p>• Tất cả ảnh và tài liệu sẽ bị xóa vĩnh viễn (cả database và Cloudinary)</p>
                <p>• Tất cả nhật ký công trình sẽ bị mất</p>
                <p>• Tất cả dữ liệu liên quan sẽ bị xóa</p>
                <p>• Hành động này không thể hoàn tác</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <Trash2 className="size-4" />
              <span className="font-medium">
                Lưu ý: Chỉ xóa dự án khi thực sự cần thiết và đã sao lưu dữ liệu quan trọng.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
