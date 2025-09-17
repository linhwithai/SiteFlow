'use client';

import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export function DesktopHeader() {
  return (
    <div className="flex w-full items-center justify-end">
      <ul className="flex items-center gap-x-1.5 [&_li[data-fade]:hover]:opacity-100 [&_li[data-fade]]:opacity-60">
        <li data-fade>
          <div className="text-white">
            <LocaleSwitcher />
          </div>
        </li>

        <li>
          <Separator orientation="vertical" className="h-4 bg-gray-600" />
        </li>

        <li>
          {/* Temporarily replace UserButton with simple button for testing */}
          <Button 
            variant="ghost" 
            className="px-2 py-1.5 text-white hover:bg-gray-700"
          >
            Test User
          </Button>
        </li>
      </ul>
    </div>
  );
}
