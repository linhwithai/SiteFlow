/**
 * Clerk Organization Webhook Handler
 *
 * This endpoint handles organization creation, updates, and deletion
 * from Clerk and syncs the data with our database
 */

import type { WebhookEvent } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { syncOrganizationWithClerk } from '@/libs/Organization';
import { organizationSchema } from '@/models/Schema';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'organization.created':
        await handleOrganizationCreated(evt.data);
        break;
      case 'organization.updated':
        await handleOrganizationUpdated(evt.data);
        break;
      case 'organization.deleted':
        await handleOrganizationDeleted(evt.data);
        break;
      default:
        logger.info(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

async function handleOrganizationCreated(data: any) {
  const { id, name, slug, image_url } = data;

  await syncOrganizationWithClerk(id, {
    name: name || 'Untitled Organization',
    slug: slug || await generateSlugFromName(name),
    logo: image_url,
  });

  logger.info(`Organization created: ${id}`);
}

async function handleOrganizationUpdated(data: any) {
  const { id, name, slug, image_url } = data;

  await syncOrganizationWithClerk(id, {
    name: name || 'Untitled Organization',
    slug: slug || await generateSlugFromName(name),
    logo: image_url,
  });

  logger.info(`Organization updated: ${id}`);
}

async function handleOrganizationDeleted(data: any) {
  const { id } = data;

  // Await the database connection
  const database = await db;

  // Soft delete by setting isActive to false
  await database
    .update(organizationSchema)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(organizationSchema.id, id));

  logger.info(`Organization deleted: ${id}`);
}

async function generateSlugFromName(name: string): Promise<string> {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
