'use client';

import { BarChart3, Building2, Calendar, ChevronDown, ClipboardList, FileText, HelpCircle, Home, Menu, MessageCircle, PlusIcon, Settings, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/utils/Helpers';

const navigation = [
  {
    name: 'Trang chủ',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Tổng quan',
    href: '/dashboard/overview',
    icon: BarChart3,
  },
  {
    name: 'Quản lý dự án',
    href: '/dashboard/projects',
    icon: Building2,
  },
  {
    name: 'Nhật ký công trình',
    href: '/dashboard/daily-logs',
    icon: ClipboardList,
  },
  {
    name: 'Báo cáo',
    href: '/dashboard/reports',
    icon: FileText,
  },
  {
    name: 'Lịch',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
];

const settingsMenu = [
  {
    name: 'Quản lý tổ chức',
    href: '/dashboard/organization',
    icon: Building2,
  },
  {
    name: 'Thành viên',
    href: '/dashboard/organization-profile/organization-members',
    icon: Users,
  },
  {
    name: 'Cài đặt tổ chức',
    href: '/dashboard/organization-profile',
    icon: Settings,
  },
  {
    name: 'Phàn nàn - Góp ý',
    href: '/dashboard/feedback',
    icon: MessageCircle,
  },
  {
    name: 'Thiết lập',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    name: 'Trung tâm trợ giúp',
    href: '/dashboard/help',
    icon: HelpCircle,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // Mặc định mở
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Floating Hamburger Button - Always Visible */}
      <div className="fixed left-4 top-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="bg-gray-900 text-white shadow-lg transition-all duration-200 ease-in-out hover:scale-105 hover:bg-gray-800"
        >
          <div className="transition-all duration-200 ease-in-out">
            {isOpen ? <X className="size-5 rotate-0" /> : <Menu className="size-5 rotate-0" />}
          </div>
        </Button>
      </div>

      {/* Sidebar - Always Visible */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-700 transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700 p-4">
            <div className="flex items-center">
              <div className="mr-3 flex size-8 items-center justify-center rounded bg-blue-600">
                <Building2 className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">SITE FLOW</h2>
                <p className="text-xs text-gray-400">Construction Management</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {/* Main Navigation */}
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start text-left',
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800',
                        )}
                      >
                        <item.icon className="mr-3 size-5" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-gray-700" />

              {/* Settings Menu with Collapsible */}
              <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <div className="flex items-center">
                      <Settings className="mr-3 size-5" />
                      <span className="text-sm font-medium">
                        Cài đặt
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform',
                        isSettingsOpen && 'rotate-180',
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="ml-4 space-y-1">
                  {settingsMenu.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className={cn(
                            'w-full justify-start text-left text-sm',
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800',
                          )}
                        >
                          <item.icon className="mr-3 size-4" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </nav>

            {/* Quick Action */}
            <div className="px-2 pb-4">
              <Link href="/dashboard/projects/new">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <PlusIcon className="mr-2 size-4" />
                  Tạo dự án mới
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
