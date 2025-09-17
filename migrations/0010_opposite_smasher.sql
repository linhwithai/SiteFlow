-- Drop foreign key constraint first
ALTER TABLE "construction_work_item" DROP CONSTRAINT IF EXISTS "construction_work_item_task_id_construction_task_id_fk";
--> statement-breakpoint
-- Drop the column
ALTER TABLE "construction_work_item" DROP COLUMN IF EXISTS "task_id";
--> statement-breakpoint
-- Drop tables
DROP TABLE IF EXISTS "construction_task_progress";
--> statement-breakpoint
DROP TABLE IF EXISTS "construction_task";