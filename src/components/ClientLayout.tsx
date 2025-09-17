'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useEffect } from 'react';

export function ClientLayout({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: any;
}) {
  // Register service worker for PWA functionality - TEMPORARILY DISABLED
  useEffect(() => {
    // Clear existing service worker and cache
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Unregister existing service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          console.log('Unregistering service worker:', registration.scope);
          registration.unregister();
        });
      });
      
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            console.log('Deleting cache:', cacheName);
            caches.delete(cacheName);
          });
        });
      }
    }
  }, []);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
