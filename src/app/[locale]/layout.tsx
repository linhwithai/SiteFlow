import '@/styles/global.css';

import type { Metadata } from 'next';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';

import { ClientLayout } from '@/components/ClientLayout';
import { DemoBadge } from '@/components/DemoBadge';
import { AllLocales } from '@/utils/AppConfig';

export const metadata: Metadata = {
  title: 'SiteFlow - Quản lý Dự án Xây dựng',
  description: 'Nền tảng quản lý dự án xây dựng cho các công ty vừa và nhỏ tại Việt Nam',
  keywords: ['xây dựng', 'quản lý dự án', 'nhật ký công trình', 'construction', 'project management'],
  authors: [{ name: 'SiteFlow Team' }],
  creator: 'SiteFlow',
  publisher: 'SiteFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'vi-VN': '/vi',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    title: 'SiteFlow - Quản lý Dự án Xây dựng',
    description: 'Nền tảng quản lý dự án xây dựng cho các công ty vừa và nhỏ tại Việt Nam',
    siteName: 'SiteFlow',
    images: [
      {
        url: '/assets/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SiteFlow - Quản lý Dự án Xây dựng',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteFlow - Quản lý Dự án Xây dựng',
    description: 'Nền tảng quản lý dự án xây dựng cho các công ty vừa và nhỏ tại Việt Nam',
    images: ['/assets/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
    {
      rel: 'manifest',
      url: '/manifest.json',
    },
  ],
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SiteFlow',
    'msapplication-TileColor': '#4F46E5',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#4F46E5',
  },
};

export function generateStaticParams() {
  return AllLocales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  try {
    // Set locale for next-intl
    if (props.params?.locale) {
      unstable_setRequestLocale(props.params.locale);
    }

    // Get messages from server
    const messages = await getMessages();

    // The `suppressHydrationWarning` in <html> is used to prevent hydration errors caused by `next-themes`.
    // Solution provided by the package itself: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app

    // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
    // which dynamically adds a `style` attribute to the body tag.
    return (
      <html lang={props.params?.locale || 'en'} suppressHydrationWarning>
        <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
          {/* PRO: Dark mode support for Shadcn UI */}
          <ClientLayout locale={props.params?.locale || 'en'} messages={messages || {}}>
            {props.children}

            <DemoBadge />
          </ClientLayout>
        </body>
      </html>
    );
  } catch (error) {
    console.error('Layout error:', error);
    // Fallback layout
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Layout Error</h1>
              <p className="text-gray-600">Please refresh the page or contact support.</p>
            </div>
          </div>
        </body>
      </html>
    );
  }
}
