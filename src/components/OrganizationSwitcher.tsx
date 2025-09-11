'use client';

import { useOrganization, useOrganizationList } from '@clerk/nextjs';
import { Building2, ChevronDown, Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type OrganizationSwitcherProps = {
  className?: string;
};

export function OrganizationSwitcher({ className = '' }: OrganizationSwitcherProps) {
  const { organization } = useOrganization();
  const { organizationList, setActive } = useOrganizationList();

  if (!organization) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="size-5 text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400">Chưa chọn tổ chức</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between ${className}`}
        >
          <div className="flex items-center gap-2">
            <div className="rounded bg-blue-100 p-1 dark:bg-blue-900">
              <Building2 className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="max-w-[200px] truncate font-medium">
              {organization.name}
            </span>
          </div>
          <ChevronDown className="size-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="start">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Tổ chức của bạn
          </p>
        </div>

        {organizationList?.map(org => (
          <DropdownMenuItem
            key={org.organization.id}
            onClick={() => setActive({ organization: org.organization })}
            className={`flex cursor-pointer items-center gap-2 ${
              org.organization.id === organization.id
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : ''
            }`}
          >
            <div className="rounded bg-gray-100 p-1 dark:bg-gray-700">
              <Building2 className="size-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{org.organization.name}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                @
                {org.organization.slug}
              </p>
            </div>
            {org.organization.id === organization.id && (
              <div className="size-2 rounded-full bg-blue-600"></div>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            // This will trigger the organization creation flow
            window.location.href = '/onboarding/organization-selection';
          }}
          className="flex cursor-pointer items-center gap-2"
        >
          <div className="rounded bg-green-100 p-1 dark:bg-green-900">
            <Plus className="size-4 text-green-600 dark:text-green-400" />
          </div>
          <span>Tạo tổ chức mới</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            // This will trigger the organization invitation flow
            window.location.href = '/dashboard/organization-profile';
          }}
          className="flex cursor-pointer items-center gap-2"
        >
          <div className="rounded bg-purple-100 p-1 dark:bg-purple-900">
            <Users className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span>Mời thành viên</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
