'use client';

// Temporarily disable Clerk for testing
// import { enUS, frFR } from '@clerk/localizations';
// import { ClerkProvider } from '@clerk/nextjs';

import { AppConfig } from '@/utils/AppConfig';

export default function AuthLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Temporarily bypass Clerk authentication for testing
  return (
    <div className="min-h-screen bg-gray-50">
      {props.children}
    </div>
  );
}
