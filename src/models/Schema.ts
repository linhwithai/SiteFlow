import {
  bigint,
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.
// Designed for Construction Project Management SaaS Platform

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

// Need a database for production? Check out https://www.prisma.io/?via=saasboilerplatesrc
// Tested and compatible with Next.js Boilerplate

// ===== ORGANIZATION SCHEMA =====
// Maps to Clerk Organization for multi-tenancy
export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(), // Clerk Organization ID
    name: text('name').notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    description: text('description'),
    logo: text('logo'),
    address: text('address'),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    // Stripe billing fields
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    // System fields
    isActive: boolean('is_active').default(true).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
      slugIdx: uniqueIndex('organization_slug_idx').on(table.slug),
    };
  },
);

// ===== PROJECT SCHEMA =====
// Construction projects within an organization
export const projectSchema = pgTable('project', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  // Project details
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  budget: bigint('budget', { mode: 'number' }), // in VND
  status: varchar('status', { length: 20 }).default('planning').notNull(), // planning, active, on_hold, completed, cancelled
  // Project manager info
  projectManagerId: text('project_manager_id'), // Clerk User ID
  // System fields
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ===== DAILY LOG SCHEMA =====
// Daily construction logs for each project
export const dailyLogSchema = pgTable('daily_log', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projectSchema.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  // Log details
  logDate: timestamp('log_date', { mode: 'date' }).notNull(),
  weather: text('weather'),
  temperature: integer('temperature'), // in Celsius
  // Work progress
  workDescription: text('work_description').notNull(),
  workHours: integer('work_hours').default(8),
  workersCount: integer('workers_count').default(0),
  // Issues and notes
  issues: text('issues'),
  notes: text('notes'),
  // System fields
  createdById: text('created_by_id').notNull(), // Clerk User ID
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ===== PROJECT PHOTOS SCHEMA =====
// Photos and documents for projects
export const projectPhotoSchema = pgTable('project_photo', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projectSchema.id, { onDelete: 'cascade' }),
  dailyLogId: integer('daily_log_id').references(() => dailyLogSchema.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  // File details
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileUrl: text('file_url').notNull(), // Cloudinary URL
  thumbnailUrl: text('thumbnail_url'),
  fileSize: bigint('file_size', { mode: 'number' }), // in bytes
  mimeType: text('mime_type').notNull(),
  // Photo metadata
  caption: text('caption'),
  tags: text('tags'), // JSON array of tags
  // System fields
  uploadedById: text('uploaded_by_id').notNull(), // Clerk User ID
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ===== LEGACY TODO SCHEMA (for backward compatibility) =====
export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
