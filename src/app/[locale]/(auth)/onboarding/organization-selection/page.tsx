import { OrganizationList } from '@clerk/nextjs';
import { Building2, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: { params: { locale: string } }) {
  const _t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    title: 'Chọn Tổ Chức - SiteFlow',
    description: 'Chọn hoặc tạo tổ chức để quản lý dự án xây dựng',
  };
}

const OrganizationSelectionPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
            <Building2 className="size-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Chọn Tổ Chức
        </h1>
        <p className="mx-auto max-w-md text-gray-600 dark:text-gray-300">
          Chọn tổ chức để quản lý dự án xây dựng hoặc tạo tổ chức mới
        </p>
      </div>

      {/* Organization List */}
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="mb-6 flex items-center gap-2">
            <Users className="size-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tổ Chức Của Bạn
            </h2>
          </div>

          <OrganizationList
            afterSelectOrganizationUrl="/dashboard"
            afterCreateOrganizationUrl="/dashboard"
            hidePersonal
            skipInvitationScreen
            appearance={{
              elements: {
                rootBox: 'w-full',
                cardBox: 'w-full border-0 shadow-none',
                organizationListBox: 'space-y-3',
                organizationPreviewBox: 'border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors',
                organizationPreviewMainIdentifier: 'text-gray-900 dark:text-white font-medium',
                organizationPreviewSecondaryIdentifier: 'text-gray-500 dark:text-gray-400 text-sm',
                organizationSwitcherTrigger: 'w-full justify-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors',
                organizationSwitcherTriggerIcon: 'text-gray-400',
                organizationSwitcherPopoverCard: 'border border-gray-200 dark:border-gray-700 shadow-lg',
                organizationSwitcherPopoverActionButton: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                organizationSwitcherPopoverActionButtonText: 'text-gray-700 dark:text-gray-300',
                organizationSwitcherPopoverFooter: 'border-t border-gray-200 dark:border-gray-700',
                organizationSwitcherPopoverFooterActionButton: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
                createOrganizationButton: 'w-full bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg p-4 font-medium transition-colors',
                createOrganizationButtonText: 'text-white',
                organizationSwitcherPopoverActionButtonIcon: 'text-gray-400',
              },
            }}
          />
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chưa có tổ chức? Tạo tổ chức mới để bắt đầu quản lý dự án xây dựng
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const dynamic = 'force-dynamic';

export default OrganizationSelectionPage;
