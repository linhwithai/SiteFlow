import { getTranslations } from 'next-intl/server';

import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-64 flex-1 bg-white transition-all duration-300 ease-in-out">
      <div className="mx-auto max-w-screen-xl px-3 pb-16 pt-6">
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-gray-900 shadow-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-3 py-4">
          <DashboardHeader />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <MainContent>
          {props.children}
        </MainContent>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
