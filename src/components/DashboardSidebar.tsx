'use client';

import { Building2, Calendar, ChevronDown, ClipboardList, HelpCircle, Home, Menu, MessageCircle, PlusIcon, Settings, Users, X, Camera, PieChart, MapPin, Wrench } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/utils/Helpers';

// Main navigation - Core features
const mainNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Tổng quan hệ thống',
  },
  {
    name: 'Dự án',
    href: '/dashboard/projects',
    icon: Building2,
    description: 'Quản lý dự án xây dựng',
  },
  {
    name: 'Nhật ký',
    href: '/dashboard/daily-logs',
    icon: ClipboardList,
    description: 'Nhật ký công trình hàng ngày',
  },
  {
    name: 'Thư viện ảnh',
    href: '/dashboard/photos',
    icon: Camera,
    description: 'Quản lý ảnh và tài liệu',
  },
];

// Secondary navigation - Analysis & Planning
const secondaryNavigation = [
  {
    name: 'Báo cáo',
    href: '/dashboard/reports',
    icon: PieChart,
    description: 'Báo cáo và thống kê',
  },
  {
    name: 'Lịch',
    href: '/dashboard/calendar',
    icon: Calendar,
    description: 'Lịch làm việc và sự kiện',
  },
  {
    name: 'Bản đồ',
    href: '/dashboard/map',
    icon: MapPin,
    description: 'Vị trí dự án trên bản đồ',
  },
];

// Organization management
const organizationMenu = [
  {
    name: 'Thông tin tổ chức',
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
    icon: Wrench,
  },
];

// System settings
const systemMenu = [
  {
    name: 'Cài đặt hệ thống',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    name: 'Phản hồi',
    href: '/dashboard/feedback',
    icon: MessageCircle,
  },
  {
    name: 'Trợ giúp',
    href: '/dashboard/help',
    icon: HelpCircle,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // Mặc định mở
  const [isOrganizationOpen, setIsOrganizationOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);

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
              {/* Main Navigation - Core Features */}
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Chức năng chính
                  </h3>
                </div>
                {mainNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start text-left h-12',
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800',
                        )}
                      >
                        <item.icon className="mr-3 size-5" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-400">{item.description}</span>
                        </div>
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-gray-700" />

              {/* Secondary Navigation - Analysis & Planning */}
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Phân tích & Lập kế hoạch
                  </h3>
                </div>
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start text-left h-12',
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800',
                        )}
                      >
                        <item.icon className="mr-3 size-5" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-400">{item.description}</span>
                        </div>
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-gray-700" />

              {/* Organization Management */}
              <Collapsible open={isOrganizationOpen} onOpenChange={setIsOrganizationOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <div className="flex items-center">
                      <Building2 className="mr-3 size-5" />
                      <span className="text-sm font-medium">Tổ chức</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform',
                        isOrganizationOpen && 'rotate-180',
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="ml-4 space-y-1">
                  {organizationMenu.map((item) => {
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

              {/* System Settings */}
              <Collapsible open={isSystemOpen} onOpenChange={setIsSystemOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <div className="flex items-center">
                      <Settings className="mr-3 size-5" />
                      <span className="text-sm font-medium">Hệ thống</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform',
                        isSystemOpen && 'rotate-180',
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="ml-4 space-y-1">
                  {systemMenu.map((item) => {
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

            {/* Quick Actions */}
            <div className="px-2 pb-4 space-y-2">
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Thao tác nhanh
                </h3>
              </div>
              <Link href="/dashboard/projects/new">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <PlusIcon className="mr-2 size-4" />
                  Tạo dự án mới
                </Button>
              </Link>
              <Link href="/dashboard/daily-logs/new">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                  <ClipboardList className="mr-2 size-4" />
                  Ghi nhật ký
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
