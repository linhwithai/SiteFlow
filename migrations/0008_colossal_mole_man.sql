ALTER TABLE "construction_project" ADD COLUMN "project_type" varchar(50);--> statement-breakpoint
ALTER TABLE "construction_project" ADD COLUMN "building_area" integer;--> statement-breakpoint
ALTER TABLE "construction_project" ADD COLUMN "floors" integer;--> statement-breakpoint
ALTER TABLE "construction_project" ADD COLUMN "basement_floors" integer;--> statement-breakpoint
ALTER TABLE "construction_project" ADD COLUMN "investor" text;--> statement-breakpoint
ALTER TABLE "construction_project" ADD COLUMN "contractor" text;--> statement-breakpoint
ALTER TABLE "construction_project" ADD COLUMN "building_permit" varchar(100);