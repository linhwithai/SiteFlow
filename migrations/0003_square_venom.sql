-- Add title column with default value first
ALTER TABLE "daily_log" ADD COLUMN "title" text;

-- Update existing records with a proper title
UPDATE "daily_log" SET "title" = 'Daily Log ' || "id" WHERE "title" IS NULL;

-- Make title column NOT NULL
ALTER TABLE "daily_log" ALTER COLUMN "title" SET NOT NULL;