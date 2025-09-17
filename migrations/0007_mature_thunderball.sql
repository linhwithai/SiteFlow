-- Migration to rename tables to construction-specific names
-- Step 1: Create new tables with construction names

CREATE TABLE IF NOT EXISTS "construction_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"organization_id" text NOT NULL,
	"log_title" text NOT NULL,
	"construction_date" timestamp NOT NULL,
	"weather" text,
	"temperature" integer,
	"construction_work_description" text NOT NULL,
	"daily_work_hours" integer DEFAULT 8,
	"labor_count" integer DEFAULT 0,
	"issues" text,
	"notes" text,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "construction_photo" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"daily_log_id" integer,
	"organization_id" text NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"file_size" bigint,
	"mime_type" text NOT NULL,
	"caption" text,
	"tags" text,
	"uploaded_by_id" text NOT NULL,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "construction_project" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"address" text,
	"city" text,
	"province" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"budget" bigint,
	"status" varchar(20) DEFAULT 'planning' NOT NULL,
	"project_manager_id" text,
	"created_by_id" text,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "construction_task" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"organization_id" text NOT NULL,
	"task_title" text NOT NULL,
	"task_description" text,
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"task_type" varchar(20) DEFAULT 'construction' NOT NULL,
	"assigned_to" text,
	"assigned_by" text,
	"due_date" timestamp,
	"completed_at" timestamp,
	"estimated_work_hours" integer,
	"actual_work_hours" integer,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"tags" text,
	"dependencies" text,
	"created_by_id" text,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "construction_work_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"task_id" integer,
	"daily_log_id" integer,
	"organization_id" text NOT NULL,
	"work_item_title" text NOT NULL,
	"work_item_description" text,
	"work_item_type" varchar(20) DEFAULT 'concrete_work' NOT NULL,
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"assigned_to" text,
	"assigned_by" text,
	"work_date" timestamp,
	"due_date" timestamp,
	"completed_at" timestamp,
	"estimated_work_hours" integer,
	"actual_work_hours" integer,
	"construction_location" text,
	"weather" text,
	"labor_count" integer DEFAULT 0,
	"materials" text,
	"equipment" text,
	"notes" text,
	"created_by_id" text,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "construction_task_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"daily_log_id" integer,
	"work_item_id" integer,
	"organization_id" text NOT NULL,
	"progress_date" timestamp NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"construction_work_description" text NOT NULL,
	"daily_work_hours" integer DEFAULT 0,
	"labor_count" integer DEFAULT 0,
	"issues" text,
	"notes" text,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Step 2: Copy data from old tables to new tables
INSERT INTO "construction_project" (
	"id", "organization_id", "name", "description", "address", "city", "province", 
	"start_date", "end_date", "budget", "status", "project_manager_id", 
	"created_by_id", "updated_by_id", "version", "deleted_at", "deleted_by_id", 
	"is_active", "updated_at", "created_at"
)
SELECT 
	"id", "organization_id", "name", "description", "address", "city", "province", 
	"start_date", "end_date", "budget", "status", "project_manager_id", 
	"created_by_id", "updated_by_id", "version", "deleted_at", "deleted_by_id", 
	"is_active", "updated_at", "created_at"
FROM "project";

INSERT INTO "construction_log" (
	"id", "project_id", "organization_id", "log_title", "construction_date", 
	"weather", "temperature", "construction_work_description", "daily_work_hours", 
	"labor_count", "issues", "notes", "created_by_id", "updated_by_id", 
	"version", "deleted_at", "deleted_by_id", "updated_at", "created_at"
)
SELECT 
	"id", "project_id", "organization_id", "title", "log_date", 
	"weather", "temperature", "work_description", "work_hours", 
	"workers_count", "issues", "notes", "created_by_id", "updated_by_id", 
	"version", "deleted_at", "deleted_by_id", "updated_at", "created_at"
FROM "daily_log";

INSERT INTO "construction_photo" (
	"id", "project_id", "daily_log_id", "organization_id", "file_name", 
	"original_name", "file_url", "thumbnail_url", "file_size", "mime_type", 
	"caption", "tags", "uploaded_by_id", "updated_by_id", "version", 
	"deleted_at", "deleted_by_id", "updated_at", "created_at"
)
SELECT 
	"id", "project_id", "daily_log_id", "organization_id", "file_name", 
	"original_name", "file_url", "thumbnail_url", "file_size", "mime_type", 
	"caption", "tags", "uploaded_by_id", "updated_by_id", "version", 
	"deleted_at", "deleted_by_id", "updated_at", "created_at"
FROM "project_photo";

INSERT INTO "construction_task" (
	"id", "project_id", "organization_id", "task_title", "task_description", 
	"status", "priority", "task_type", "assigned_to", "assigned_by", 
	"due_date", "completed_at", "estimated_work_hours", "actual_work_hours", 
	"progress_percentage", "tags", "dependencies", "created_by_id", "updated_by_id", 
	"version", "deleted_at", "deleted_by_id", "is_active", "updated_at", "created_at"
)
SELECT 
	"id", "project_id", "organization_id", "title", "description", 
	"status", "priority", "type", "assigned_to", "assigned_by", 
	"due_date", "completed_at", "estimated_hours", "actual_hours", 
	"progress", "tags", "dependencies", "created_by_id", "updated_by_id", 
	"version", "deleted_at", "deleted_by_id", "is_active", "updated_at", "created_at"
FROM "project_task";

-- Step 3: Add foreign key constraints
ALTER TABLE "construction_log" ADD CONSTRAINT "construction_log_project_id_construction_project_id_fk" 
FOREIGN KEY ("project_id") REFERENCES "public"."construction_project"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_log" ADD CONSTRAINT "construction_log_organization_id_organization_id_fk" 
FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_photo" ADD CONSTRAINT "construction_photo_project_id_construction_project_id_fk" 
FOREIGN KEY ("project_id") REFERENCES "public"."construction_project"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_photo" ADD CONSTRAINT "construction_photo_daily_log_id_construction_log_id_fk" 
FOREIGN KEY ("daily_log_id") REFERENCES "public"."construction_log"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_photo" ADD CONSTRAINT "construction_photo_organization_id_organization_id_fk" 
FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_project" ADD CONSTRAINT "construction_project_organization_id_organization_id_fk" 
FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_task" ADD CONSTRAINT "construction_task_project_id_construction_project_id_fk" 
FOREIGN KEY ("project_id") REFERENCES "public"."construction_project"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_task" ADD CONSTRAINT "construction_task_organization_id_organization_id_fk" 
FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_work_item" ADD CONSTRAINT "construction_work_item_project_id_construction_project_id_fk" 
FOREIGN KEY ("project_id") REFERENCES "public"."construction_project"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_work_item" ADD CONSTRAINT "construction_work_item_task_id_construction_task_id_fk" 
FOREIGN KEY ("task_id") REFERENCES "public"."construction_task"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_work_item" ADD CONSTRAINT "construction_work_item_daily_log_id_construction_log_id_fk" 
FOREIGN KEY ("daily_log_id") REFERENCES "public"."construction_log"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_work_item" ADD CONSTRAINT "construction_work_item_organization_id_organization_id_fk" 
FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_task_progress" ADD CONSTRAINT "construction_task_progress_task_id_construction_task_id_fk" 
FOREIGN KEY ("task_id") REFERENCES "public"."construction_task"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_task_progress" ADD CONSTRAINT "construction_task_progress_daily_log_id_construction_log_id_fk" 
FOREIGN KEY ("daily_log_id") REFERENCES "public"."construction_log"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_task_progress" ADD CONSTRAINT "construction_task_progress_work_item_id_construction_work_item_id_fk" 
FOREIGN KEY ("work_item_id") REFERENCES "public"."construction_work_item"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "construction_task_progress" ADD CONSTRAINT "construction_task_progress_organization_id_organization_id_fk" 
FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;

-- Step 4: Update financial_transaction to reference new table
ALTER TABLE "financial_transaction" DROP CONSTRAINT IF EXISTS "financial_transaction_project_id_project_id_fk";
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_project_id_construction_project_id_fk" 
FOREIGN KEY ("project_id") REFERENCES "public"."construction_project"("id") ON DELETE set null ON UPDATE no action;

-- Step 5: Drop old tables (with CASCADE to handle dependencies)
DROP TABLE IF EXISTS "project_photo" CASCADE;
DROP TABLE IF EXISTS "task_progress" CASCADE;
DROP TABLE IF EXISTS "work_item" CASCADE;
DROP TABLE IF EXISTS "project_task" CASCADE;
DROP TABLE IF EXISTS "daily_log" CASCADE;
DROP TABLE IF EXISTS "project" CASCADE;
DROP TABLE IF EXISTS "todo" CASCADE;












