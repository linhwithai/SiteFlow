'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileSidebar } from '@/components/MobileSidebar';

export function MobileHeader() {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
      {/* Mobile Menu Button */}
      <MobileSidebar>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-800"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </MobileSidebar>

      {/* Logo */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white">SITE FLOW</h1>
      </div>

      {/* Placeholder for user actions */}
      <div className="w-10 h-10" /> {/* Spacer to center logo */}
    </div>
  );
}
