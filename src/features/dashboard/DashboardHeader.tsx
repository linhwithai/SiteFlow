'use client';

import { UserButton } from '@clerk/nextjs';

import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Separator } from '@/components/ui/separator';

export const DashboardHeader = () => {
  return (
    <>
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
            <UserButton
              userProfileMode="navigation"
              userProfileUrl="/dashboard/user-profile"
              appearance={{
                elements: {
                  rootBox: 'px-2 py-1.5 text-white',
                  userButtonPopoverCard: 'bg-white',
                  userButtonPopoverActionButton: 'text-gray-900',
                },
              }}
            />
          </li>
        </ul>
      </div>
    </>
  );
};
