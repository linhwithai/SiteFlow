CREATE TABLE IF NOT EXISTS "employee" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"clerk_user_id" text,
	"employee_code" varchar(20) NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"position" text,
	"department" text,
	"hire_date" timestamp,
	"salary" bigint,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" text,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_account" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"account_code" varchar(20) NOT NULL,
	"account_name" text NOT NULL,
	"account_type" varchar(20) NOT NULL,
	"parent_account_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" text,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" integer,
	"transaction_date" timestamp NOT NULL,
	"amount" bigint NOT NULL,
	"currency" varchar(3) DEFAULT 'VND' NOT NULL,
	"description" text,
	"reference_number" varchar(50),
	"account_debit_id" integer,
	"account_credit_id" integer,
	"created_by_id" text NOT NULL,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"item_code" varchar(20) NOT NULL,
	"item_name" text NOT NULL,
	"category" text,
	"unit_of_measure" varchar(10),
	"unit_cost" bigint,
	"current_stock" integer DEFAULT 0 NOT NULL,
	"min_stock_level" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" text,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"supplier_code" varchar(20) NOT NULL,
	"company_name" text NOT NULL,
	"contact_person" text,
	"email" text,
	"phone" text,
	"address" text,
	"tax_code" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" text,
	"updated_by_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_log" ADD COLUMN "updated_by_id" text;--> statement-breakpoint
ALTER TABLE "daily_log" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_log" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "daily_log" ADD COLUMN "deleted_by_id" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "created_by_id" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "updated_by_id" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "deleted_by_id" text;--> statement-breakpoint
ALTER TABLE "project_photo" ADD COLUMN "updated_by_id" text;--> statement-breakpoint
ALTER TABLE "project_photo" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_photo" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_photo" ADD COLUMN "deleted_by_id" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "created_by_id" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "updated_by_id" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "deleted_by_id" text;--> statement-breakpoint
ALTER TABLE "project_task" ADD COLUMN "created_by_id" text;--> statement-breakpoint
ALTER TABLE "project_task" ADD COLUMN "updated_by_id" text;--> statement-breakpoint
ALTER TABLE "project_task" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_task" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_task" ADD COLUMN "deleted_by_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employee" ADD CONSTRAINT "employee_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "financial_account" ADD CONSTRAINT "financial_account_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "supplier" ADD CONSTRAINT "supplier_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
