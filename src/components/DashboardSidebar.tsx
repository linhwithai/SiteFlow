'use client';

import { 
  Building2, 
  Calendar, 
  ChevronDown, 
  HelpCircle, 
  Home, 
  Menu, 
  MessageCircle, 
  PlusIcon, 
  Settings, 
  Users, 
  X, 
  Camera, 
  MapPin, 
  Wrench,
  CheckSquare,
  User,
  BarChart3,
  FileText,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/Helpers';

// Core Management - Essential daily operations
const coreNavigation = [
  {
    name: 'Tổng quan',
    href: '/dashboard',
    icon: Home,
    description: 'Bảng điều khiển chính',
    priority: 'high',
  },
  {
    name: 'Dự án xây dựng',
    href: '/dashboard/projects',
    icon: Building2,
    description: 'Quản lý công trình xây dựng',
    priority: 'high',
    badge: '12', // Active projects count
  },
  {
    name: 'Tất cả hạng mục',
    href: '/dashboard/work-items',
    icon: CheckSquare,
    description: 'Xem tất cả hạng mục từ các dự án',
    priority: 'medium',
    badge: '5', // Pending work items count
  },
];

// Media & Documentation
const mediaNavigation = [
  {
    name: 'Thư viện tài liệu',
    href: '/dashboard/photos',
    icon: Camera,
    description: 'Ảnh công trình và tài liệu',
    priority: 'medium',
  },
  {
    name: 'Báo cáo tiến độ',
    href: '/dashboard/reports',
    icon: FileText,
    description: 'Báo cáo thi công và thống kê',
    priority: 'medium',
  },
];

// Planning & Analytics
const planningNavigation = [
  {
    name: 'Lịch thi công',
    href: '/dashboard/calendar',
    icon: Calendar,
    description: 'Lịch trình thi công và sự kiện',
    priority: 'low',
  },
  {
    name: 'Vị trí công trình',
    href: '/dashboard/map',
    icon: MapPin,
    description: 'Bản đồ vị trí các công trình',
    priority: 'low',
  },
  {
    name: 'Phân tích tiến độ',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Thống kê và phân tích tiến độ',
    priority: 'low',
  },
];

// Settings & Configuration - All user, organization, and system settings
const settingsMenu = [
  // Personal Settings
  {
    name: 'Hồ sơ cá nhân',
    href: '/dashboard/user-profile',
    icon: User,
    description: 'Thông tin cá nhân',
    category: 'personal',
  },
  {
    name: 'Thông báo',
    href: '/dashboard/notifications',
    icon: Bell,
    description: 'Thông báo hệ thống',
    category: 'personal',
    badge: '3', // Unread notifications
  },
  // Organization Settings
  {
    name: 'Thông tin công ty',
    href: '/dashboard/organization',
    icon: Building2,
    description: 'Chi tiết công ty xây dựng',
    category: 'organization',
  },
  {
    name: 'Nhân sự',
    href: '/dashboard/organization-profile/organization-members',
    icon: Users,
    description: 'Quản lý nhân sự',
    category: 'organization',
  },
  {
    name: 'Cài đặt công ty',
    href: '/dashboard/organization-profile',
    icon: Wrench,
    description: 'Cấu hình công ty',
    category: 'organization',
  },
  // System Settings
  {
    name: 'Cài đặt hệ thống',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Cấu hình hệ thống',
    category: 'system',
  },
  {
    name: 'API & Webhooks',
    href: '/dashboard/api-settings',
    icon: Wrench,
    description: 'Quản lý API và webhooks',
    category: 'system',
  },
  {
    name: 'Phản hồi',
    href: '/dashboard/feedback',
    icon: MessageCircle,
    description: 'Gửi phản hồi',
    category: 'system',
  },
  {
    name: 'Trợ giúp',
    href: '/dashboard/help',
    icon: HelpCircle,
    description: 'Hướng dẫn sử dụng',
    category: 'system',
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // Mặc định mở
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  // Navigation item component with badge support
  const NavigationItem = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <Link href={item.href}>
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start text-left h-12 relative',
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:text-white hover:bg-gray-800',
        )}
      >
        <item.icon className="mr-3 size-5" />
        <div className="flex flex-col items-start flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs bg-blue-500 text-white">
                {item.badge}
              </Badge>
            )}
          </div>
          <span className="text-xs text-gray-400">{item.description}</span>
        </div>
      </Button>
    </Link>
  );

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
        'fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-700 transition-transform duration-300 ease-in-out',
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
              {/* Core Management - Essential daily operations */}
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Quản lý thi công
                  </h3>
                </div>
                {coreNavigation.map((item) => (
                  <NavigationItem 
                    key={item.name} 
                    item={item} 
                    isActive={pathname === item.href} 
                  />
                ))}
              </div>

              <Separator className="my-4 bg-gray-700" />

              {/* Media & Documentation */}
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Tài liệu & Hình ảnh
                  </h3>
                </div>
                {mediaNavigation.map((item) => (
                  <NavigationItem 
                    key={item.name} 
                    item={item} 
                    isActive={pathname === item.href} 
                  />
                ))}
              </div>

              <Separator className="my-4 bg-gray-700" />

              {/* Planning & Analytics */}
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Lập kế hoạch & Thống kê
                  </h3>
                </div>
                {planningNavigation.map((item) => (
                  <NavigationItem 
                    key={item.name} 
                    item={item} 
                    isActive={pathname === item.href} 
                  />
                ))}
              </div>

              <Separator className="my-4 bg-gray-700" />

              {/* Settings & Configuration - Unified menu for all settings */}
              <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <div className="flex items-center">
                      <Settings className="mr-3 size-5" />
                      <span className="text-sm font-medium">Cài đặt & Cấu hình</span>
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
                  {/* Personal Settings */}
                  <div className="space-y-1">
                    <div className="px-3 py-1">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cá nhân
                      </h4>
                    </div>
                    {settingsMenu
                      .filter(item => item.category === 'personal')
                      .map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.name} href={item.href}>
                            <Button
                              variant={isActive ? 'default' : 'ghost'}
                              className={cn(
                                'w-full justify-start text-left text-sm h-10',
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-800',
                              )}
                            >
                              <item.icon className="mr-3 size-4" />
                              <div className="flex flex-col items-start flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.name}</span>
                                  {item.badge && (
                                    <Badge variant="secondary" className="text-xs bg-blue-500 text-white">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400">{item.description}</span>
                              </div>
                            </Button>
                          </Link>
                        );
                      })}
                  </div>

                  {/* Organization Settings */}
                  <div className="space-y-1 mt-3">
                    <div className="px-3 py-1">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Công ty
                      </h4>
                    </div>
                    {settingsMenu
                      .filter(item => item.category === 'organization')
                      .map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.name} href={item.href}>
                            <Button
                              variant={isActive ? 'default' : 'ghost'}
                              className={cn(
                                'w-full justify-start text-left text-sm h-10',
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-800',
                              )}
                            >
                              <item.icon className="mr-3 size-4" />
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-gray-400">{item.description}</span>
                              </div>
                            </Button>
                          </Link>
                        );
                      })}
                  </div>

                  {/* System Settings */}
                  <div className="space-y-1 mt-3">
                    <div className="px-3 py-1">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hệ thống
                      </h4>
                    </div>
                    {settingsMenu
                      .filter(item => item.category === 'system')
                      .map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.name} href={item.href}>
                            <Button
                              variant={isActive ? 'default' : 'ghost'}
                              className={cn(
                                'w-full justify-start text-left text-sm h-10',
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-800',
                              )}
                            >
                              <item.icon className="mr-3 size-4" />
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-gray-400">{item.description}</span>
                              </div>
                            </Button>
                          </Link>
                        );
                      })}
                  </div>
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
                  Tạo công trình mới
                </Button>
              </Link>
              <Link href="/dashboard/tasks/new">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                  <CheckSquare className="mr-2 size-4" />
                  Tạo hạng mục
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
