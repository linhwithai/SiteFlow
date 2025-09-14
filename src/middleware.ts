import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const isProtectedRoute = createRouteMatcher([
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
]);

const isApiRoute = createRouteMatcher([
  '/api(.*)',
  '/:locale/api(.*)',
]);

const isPublicApiRoute = createRouteMatcher([
  '/api/health',
  '/api/webhooks/bot',
  '/api/webhooks/clerk',
  '/api/upload',
]);

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Handle API routes
  if (isApiRoute(request)) {
    // Allow public API routes without authentication
    if (isPublicApiRoute(request)) {
      return NextResponse.next();
    }
    
    // Protect other API routes with Clerk authentication
    return clerkMiddleware(async (auth, _req) => {
      await auth.protect();
      return NextResponse.next();
    })(request, event);
  }

  if (
    request.nextUrl.pathname.includes('/sign-in')
    || request.nextUrl.pathname.includes('/sign-up')
    || isProtectedRoute(request)
  ) {
    return clerkMiddleware(async (auth, _req) => {
      if (isProtectedRoute(req)) {
        const locale
          = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';

        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          // `unauthenticatedUrl` is needed to avoid error: "Unable to find `next-intl` locale because the middleware didn't run on this request"
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      const authObj = await auth();

      if (
        authObj.userId
        && !authObj.orgId
        && req.nextUrl.pathname.includes('/dashboard')
        && !req.nextUrl.pathname.endsWith('/organization-selection')
        && !req.nextUrl.pathname.endsWith('/organization-profile')
      ) {
        const locale = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';
        const orgSelection = new URL(
          `${locale}/onboarding/organization-selection`,
          req.url,
        );

        return NextResponse.redirect(orgSelection);
      }

      return intlMiddleware(req);
    })(request, event);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'], // Also exclude tunnelRoute used in Sentry from the matcher
};
