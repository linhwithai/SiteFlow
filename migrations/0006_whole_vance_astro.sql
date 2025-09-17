CREATE TABLE IF NOT EXISTS "task_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"daily_log_id" integer,
	"work_item_id" integer,
	"organization_id" text NOT NULL,
	"progress_date" timestamp NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"work_description" text NOT NULL,
	"work_hours" integer DEFAULT 0,
	"workers_count" integer DEFAULT 0,
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"task_id" integer,
	"daily_log_id" integer,
	"organization_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"work_type" varchar(20) DEFAULT 'construction' NOT NULL,
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"assigned_to" text,
	"assigned_by" text,
	"work_date" timestamp,
	"due_date" timestamp,
	"completed_at" timestamp,
	"estimated_hours" integer,
	"actual_hours" integer,
	"location" text,
	"weather" text,
	"workers_count" integer DEFAULT 0,
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_daily_log_id_daily_log_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_log"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_work_item_id_work_item_id_fk" FOREIGN KEY ("work_item_id") REFERENCES "public"."work_item"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work_item" ADD CONSTRAINT "work_item_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work_item" ADD CONSTRAINT "work_item_task_id_project_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_task"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work_item" ADD CONSTRAINT "work_item_daily_log_id_daily_log_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_log"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work_item" ADD CONSTRAINT "work_item_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
