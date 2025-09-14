-- Add title column to daily_log table
ALTER TABLE daily_log ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled Daily Log';

-- Update existing records with a proper title
UPDATE daily_log SET title = 'Daily Log ' || id WHERE title = 'Untitled Daily Log';

-- Make title column NOT NULL without default
ALTER TABLE daily_log ALTER COLUMN title SET NOT NULL;
ALTER TABLE daily_log ALTER COLUMN title DROP DEFAULT;

