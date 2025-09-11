'use client';

import { useOrganization } from '@clerk/nextjs';
import { Building2, Calendar, MapPin, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type OrganizationInfoProps = {
  className?: string;
};

export function OrganizationInfo({ className = '' }: OrganizationInfoProps) {
  const { organization, isLoaded } = useOrganization();

  if (!isLoaded) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className={`rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20 ${className}`}>
        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <Building2 className="size-5" />
          <span className="font-medium">Chưa chọn tổ chức</span>
        </div>
        <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-300">
          Vui lòng chọn hoặc tạo tổ chức để tiếp tục
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
            <Building2 className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {organization.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @
              {organization.slug}
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Hoạt động
        </Badge>
      </div>

      {/* Organization Details */}
      <div className="space-y-3">
        {organization.imageUrl && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="size-4 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <span>Có logo tổ chức</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="size-4" />
          <span>
            {organization.membersCount}
            {' '}
            thành viên
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="size-4" />
          <span>
            Tạo ngày
            {' '}
            {new Date(organization.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>

        {!!organization.publicMetadata?.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="size-4" />
            <span>{String(organization.publicMetadata.address)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex gap-2">
          <button type="button" className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Quản lý tổ chức
          </button>
          <button type="button" className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Mời thành viên
          </button>
        </div>
      </div>
    </div>
  );
}
