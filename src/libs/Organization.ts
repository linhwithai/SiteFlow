/**
 * Organization Management Utilities
 *
 * This file contains utilities for working with Clerk Organizations
 * and managing organization-related data in the database
 */

// import { auth } from '@clerk/nextjs/server'; // Temporarily disabled for testing
import { and, eq } from 'drizzle-orm';

import { organizationSchema } from '@/models/Schema';

import { db } from './DB';

/**
 * Get the current user's organization ID from Clerk auth
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  // Temporarily return demo organization ID for testing
  return 'org_demo_1';
  // const { orgId } = await auth();
  // return orgId || null;
}

/**
 * Get the current user's ID from Clerk auth
 */
export async function getCurrentUserId(): Promise<string | null> {
  // Temporarily return demo user ID for testing
  return 'demo-user-1';
  // const { userId } = await auth();
  // return userId;
}

/**
 * Get organization details by ID
 */
export async function getOrganizationById(organizationId: string) {
  // Await the database connection
  const database = await db;

  const [organization] = await database
    .select()
    .from(organizationSchema)
    .where(eq(organizationSchema.id, organizationId))
    .limit(1);

  return organization;
}

/**
 * Create or update organization in database
 * This should be called when a user creates or updates an organization in Clerk
 */
export async function syncOrganizationWithClerk(
  clerkOrganizationId: string,
  organizationData: {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  },
) {
  // Await the database connection
  const database = await db;

  // Check if organization exists
  const existingOrg = await getOrganizationById(clerkOrganizationId);

  if (existingOrg) {
    // Update existing organization
    const [updatedOrg] = await database
      .update(organizationSchema)
      .set({
        name: organizationData.name,
        slug: organizationData.slug,
        description: organizationData.description,
        logo: organizationData.logo,
        address: organizationData.address,
        phone: organizationData.phone,
        email: organizationData.email,
        website: organizationData.website,
        updatedAt: new Date(),
      })
      .where(eq(organizationSchema.id, clerkOrganizationId))
      .returning();

    return updatedOrg;
  } else {
    // Create new organization
    const [newOrg] = await database
      .insert(organizationSchema)
      .values({
        id: clerkOrganizationId,
        name: organizationData.name,
        slug: organizationData.slug,
        description: organizationData.description,
        logo: organizationData.logo,
        address: organizationData.address,
        phone: organizationData.phone,
        email: organizationData.email,
        website: organizationData.website,
      })
      .returning();

    return newOrg;
  }
}

/**
 * Check if user has permission to access organization
 */
export async function hasOrganizationAccess(organizationId: string): Promise<boolean> {
  const currentOrgId = await getCurrentOrganizationId();
  return currentOrgId === organizationId;
}

/**
 * Check if user has specific role in organization
 */
export async function hasOrganizationRole(
  organizationId: string,
  _requiredRole: 'org:owner' | 'org:admin' | 'org:member',
): Promise<boolean> {
  // This would typically check against Clerk's organization membership
  // For now, we'll implement a basic check
  const hasAccess = await hasOrganizationAccess(organizationId);

  if (!hasAccess) {
    return false;
  }

  // TODO: Implement role checking with Clerk's organization membership API
  // For now, return true if user has access
  return true;
}

/**
 * Get all organizations for current user
 */
export async function getUserOrganizations() {
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return [];
  }

  // TODO: Implement getting user's organizations from Clerk
  // For now, return empty array
  return [];
}

/**
 * Validate organization slug uniqueness
 */
export async function isOrganizationSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  // Await the database connection
  const database = await db;

  const conditions = [eq(organizationSchema.slug, slug)];

  if (excludeId) {
    conditions.push(eq(organizationSchema.id, excludeId));
  }

  const existing = await database
    .select({ id: organizationSchema.id })
    .from(organizationSchema)
    .where(and(...conditions))
    .limit(1);

  return existing.length === 0;
}

/**
 * Generate unique organization slug
 */
export async function generateUniqueSlug(baseName: string): Promise<string> {
  const slug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let counter = 1;
  let uniqueSlug = slug;

  while (!(await isOrganizationSlugUnique(uniqueSlug))) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
