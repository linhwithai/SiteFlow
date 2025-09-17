'use client';

import { useIsMobile } from '@/hooks/use-mobile';

import { DesktopSidebar } from '@/components/DesktopSidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { DesktopHeader } from '@/components/DesktopHeader';
import { MobileHeader } from '@/components/MobileHeader';

function MainContent({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) {
  return (
    <div className={`flex-1 bg-white transition-all duration-300 ease-in-out ${
      isMobile ? 'ml-0' : 'ml-72'
    }`}>
      <div className="mx-auto max-w-screen-xl px-3 pb-16 pt-6">
        {children}
      </div>
    </div>
  );
}

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-gray-900 shadow-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-3 py-4">
          {isMobile ? <MobileHeader /> : <DesktopHeader />}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        {isMobile ? (
          <MobileSidebar />
        ) : (
          <DesktopSidebar />
        )}

        {/* Main Content */}
        <MainContent isMobile={isMobile}>
          {children}
        </MainContent>
      </div>
    </div>
  );
}
