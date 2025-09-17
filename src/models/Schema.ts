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
    // ERP Audit Trail fields
    createdById: text('created_by_id'),
    updatedById: text('updated_by_id'),
    version: integer('version').default(1).notNull(),
    // ERP Soft Delete fields
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
    deletedById: text('deleted_by_id'),
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

// ===== CONSTRUCTION PROJECT SCHEMA =====
// Construction projects within an organization
export const constructionProjectSchema = pgTable('construction_project', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address'),
  city: text('city'),
  province: text('province'),
  // Project details
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  budget: text('budget'), // in VND - can be any text value
  status: varchar('status', { length: 20 }).default('planning').notNull(), // planning, active, on_hold, completed, cancelled
  // Project manager info
  projectManagerId: text('project_manager_id'), // Clerk User ID
  // Construction-specific fields
  projectType: varchar('project_type', { length: 50 }), // residential, commercial, office, industrial, infrastructure, bridge, other
  buildingArea: integer('building_area'), // in m²
  floors: integer('floors'), // number of floors
  basementFloors: integer('basement_floors'), // number of basement floors
  investor: text('investor'), // investor company name
  contractor: text('contractor'), // contractor company name
  buildingPermit: varchar('building_permit', { length: 100 }), // building permit number
  // ERP Audit Trail fields
  createdById: text('created_by_id'),
  updatedById: text('updated_by_id'),
  version: integer('version').default(1).notNull(),
  // ERP Soft Delete fields
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  deletedById: text('deleted_by_id'),
  // System fields
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ===== CONSTRUCTION LOG SCHEMA =====
// Daily construction logs for each project
export const constructionLogSchema = pgTable('construction_log', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => constructionProjectSchema.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  // Log details
  logTitle: text('log_title').notNull(),
  constructionDate: timestamp('construction_date', { mode: 'date' }).notNull(),
  weather: text('weather'),
  temperature: integer('temperature'), // in Celsius
  // Work progress
  constructionWorkDescription: text('construction_work_description').notNull(),
  dailyWorkHours: integer('daily_work_hours').default(8),
  laborCount: integer('labor_count').default(0),
  // Issues and notes
  issues: text('issues'),
  notes: text('notes'),
  // ERP Audit Trail fields
  createdById: text('created_by_id').notNull(), // Clerk User ID
  updatedById: text('updated_by_id'),
  version: integer('version').default(1).notNull(),
  // ERP Soft Delete fields
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  deletedById: text('deleted_by_id'),
  // System fields
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ===== CONSTRUCTION PHOTOS SCHEMA =====
// Photos and documents for construction projects
export const constructionPhotoSchema = pgTable('construction_photo', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => constructionProjectSchema.id, { onDelete: 'cascade' }),
  dailyLogId: integer('daily_log_id').references(() => constructionLogSchema.id, { onDelete: 'cascade' }),
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
  // ERP Audit Trail fields
  uploadedById: text('uploaded_by_id').notNull(), // Clerk User ID
  updatedById: text('updated_by_id'),
  version: integer('version').default(1).notNull(),
  // ERP Soft Delete fields
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  deletedById: text('deleted_by_id'),
  // System fields
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});


// ===== CONSTRUCTION WORK ITEM SCHEMA =====
// Detailed construction work items that can be linked to tasks, daily logs, or standalone
export const constructionWorkItemSchema = pgTable('construction_work_item', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => constructionProjectSchema.id, { onDelete: 'cascade' }),
  dailyLogId: integer('daily_log_id').references(() => constructionLogSchema.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  // Work item details
  workItemTitle: text('work_item_title').notNull(),
  workItemDescription: text('work_item_description'),
  workItemType: varchar('work_item_type', { length: 20 }).default('concrete_work').notNull(), // concrete_work, steel_work, masonry, finishing, mep_installation, inspection, safety_check
  status: varchar('status', { length: 20 }).default('planned').notNull(), // planned, in_progress, completed, cancelled
  priority: varchar('priority', { length: 10 }).default('medium').notNull(), // low, medium, high, urgent
  // Assignment
  assignedTo: text('assigned_to'), // Clerk User ID
  assignedBy: text('assigned_by'), // Clerk User ID
  // Scheduling
  workDate: timestamp('work_date', { mode: 'date' }),
  dueDate: timestamp('due_date', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  // Time tracking
  estimatedWorkHours: integer('estimated_work_hours'),
  actualWorkHours: integer('actual_work_hours'),
  // Work details
  constructionLocation: text('construction_location'),
  weather: text('weather'),
  laborCount: integer('labor_count').default(0),
  materials: text('materials'), // JSON array of materials
  equipment: text('equipment'), // JSON array of equipment
  notes: text('notes'),
  // ERP Audit Trail fields
  createdById: text('created_by_id'),
  updatedById: text('updated_by_id'),
  version: integer('version').default(1).notNull(),
  // ERP Soft Delete fields
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  deletedById: text('deleted_by_id'),
  // System fields
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});


// ===== LEGACY TODO SCHEMA (REMOVED - Not suitable for construction project management) =====
// This schema has been removed as it's not suitable for professional construction project management
// Use constructionWorkItemSchema instead for proper project management

// ===== ERP FINANCIAL MANAGEMENT SCHEMA =====
// Financial accounts for ERP system
export const financialAccountSchema = pgTable('financial_account', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  accountCode: varchar('account_code', { length: 20 }).notNull(),
  accountName: text('account_name').notNull(),
  accountType: varchar('account_type', { length: 20 }).notNull(), // asset, liability, equity, revenue, expense
  parentAccountId: integer('parent_account_id'),
  isActive: boolean('is_active').default(true).notNull(),
  // ERP Audit Trail fields
  createdById: text('created_by_id'),
  updatedById: text('updated_by_id'),
  version: integer('version').default(1).notNull(),
  // ERP Soft Delete fields
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  deletedById: text('deleted_by_id'),
  // System fields
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Financial transactions for ERP system
export const financialTransactionSchema = pgTable('financial_transaction', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  projectId: integer('project_id').references(() => constructionProjectSchema.id, { onDelete: 'set null' }),
  transactionDate: timestamp('transaction_date', { mode: 'date' }).notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: varchar('currency', { length: 3 }).default('VND').notNull(),
  description: text('description'),
  referenceNumber: varchar('reference_number', { length: 50 }),
  accountDebitId: integer('account_debit_id'),
  accountCreditId: integer('account_credit_id'),
  // ERP Audit Trail fields
  createdById: text('created_by_id').notNull(),
  updatedById: text('updated_by_id'),
  version: integer('version').default(1).notNull(),
  // ERP Soft Delete fields
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  deletedById: text('deleted_by_id'),
  // System fields
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ===== ERP HUMAN RESOURCES SCHEMA =====
// Employee management for ERP system
export const employeeSchema = pgTable('employee', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  clerkUserId: text('clerk_user_id'),
  employeeCode: varchar('employee_code', { length: 20 }).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  position: text('position'),
  department: text('department'),
  hireDate: timestamp('hire_date', { mode: 'date' }),
  salary: bigint('salary', { mode: 'number' }),
  isActive: boolean('is_active').default(true).notNull(),
  // ERP Audit Trail fields
  createdById: text('created_by_id'),
  updatedById: text('updated_by_id'),
  version: integer('version').default(1).notNull(),
  // ERP Soft Delete fields
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  deletedById: text('deleted_by_id'),
  // System fields
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ===== ERP SUPPLY CHAIN SCHEMA =====
// Supplier management for ERP system
export const supplierSchema = pgTable('supplier', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  supplierCode: varchar('supplier_code', { length: 20 }).notNull(),
  companyName: text('company_name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxCode: varchar('tax_code', { length: 20 }),
  isActive: boolean('is_active').default(true).notNull(),
  // ERP Audit Trail fields
  createdById: text('created_by_id'),
  updatedById: text('updated_by_id'),
  version: integer('version').default(1).notNull(),
  // ERP Soft Delete fields
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  deletedById: text('deleted_by_id'),
  // System fields
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Inventory items for ERP system
export const inventoryItemSchema = pgTable('inventory_item', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),
  itemCode: varchar('item_code', { length: 20 }).notNull(),
  itemName: text('item_name').notNull(),
  category: text('category'),
  unitOfMeasure: varchar('unit_of_measure', { length: 10 }),
  unitCost: bigint('unit_cost', { mode: 'number' }),
  currentStock: integer('current_stock').default(0).notNull(),
  minStockLevel: integer('min_stock_level').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  // ERP Audit Trail fields
  createdById: text('created_by_id'),
  updatedById: text('updated_by_id'),
  version: integer('version').default(1).notNull(),
  // ERP Soft Delete fields
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  deletedById: text('deleted_by_id'),
  // System fields
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
