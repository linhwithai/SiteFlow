CREATE TABLE IF NOT EXISTS "project_task" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"organization_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'todo' NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"type" varchar(20) DEFAULT 'other' NOT NULL,
	"assigned_to" text,
	"assigned_by" text,
	"due_date" timestamp,
	"completed_at" timestamp,
	"estimated_hours" integer,
	"actual_hours" integer,
	"progress" integer DEFAULT 0 NOT NULL,
	"tags" text,
	"dependencies" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_task" ADD CONSTRAINT "project_task_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_task" ADD CONSTRAINT "project_task_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
