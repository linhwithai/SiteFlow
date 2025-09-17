-- ========================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ========================================
-- This file contains database indexes to improve query performance
-- Run this script to optimize database performance

-- ========================================
-- 1. PROJECTS TABLE INDEXES
-- ========================================

-- Composite index for common project queries
CREATE INDEX IF NOT EXISTS idx_projects_org_status_active 
ON construction_project(organization_id, status, is_active) 
WHERE is_active = true;

-- Index for project listing with filters
CREATE INDEX IF NOT EXISTS idx_projects_org_city_province 
ON construction_project(organization_id, city, province);

-- Index for project search
CREATE INDEX IF NOT EXISTS idx_projects_search 
ON construction_project USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(address, '')));

-- Index for project manager queries
CREATE INDEX IF NOT EXISTS idx_projects_manager 
ON construction_project(project_manager_id, organization_id);

-- Index for project dates
CREATE INDEX IF NOT EXISTS idx_projects_dates 
ON construction_project(start_date, end_date) 
WHERE start_date IS NOT NULL AND end_date IS NOT NULL;

-- ========================================
-- 2. WORK ITEMS TABLE INDEXES
-- ========================================

-- Composite index for work items by project
CREATE INDEX IF NOT EXISTS idx_work_items_project_active 
ON construction_work_item(project_id, is_active, status) 
WHERE is_active = true;

-- Index for work items by assigned user
CREATE INDEX IF NOT EXISTS idx_work_items_assigned 
ON construction_work_item(assigned_to, project_id, status);

-- Index for work items by priority
CREATE INDEX IF NOT EXISTS idx_work_items_priority 
ON construction_work_item(priority, project_id, status);

-- Index for work items by work date
CREATE INDEX IF NOT EXISTS idx_work_items_work_date 
ON construction_work_item(work_date, project_id) 
WHERE work_date IS NOT NULL;

-- Index for work items by due date
CREATE INDEX IF NOT EXISTS idx_work_items_due_date 
ON construction_work_item(due_date, project_id) 
WHERE due_date IS NOT NULL;

-- Index for work items by work type
CREATE INDEX IF NOT EXISTS idx_work_items_type 
ON construction_work_item(work_item_type, project_id, status);

-- Covering index for work items stats
CREATE INDEX IF NOT EXISTS idx_work_items_stats_covering 
ON construction_work_item(project_id, status, priority, progress) 
INCLUDE (id, work_item_title, assigned_to, work_date, due_date, estimated_work_hours, actual_work_hours)
WHERE is_active = true;

-- ========================================
-- 3. DAILY LOGS TABLE INDEXES
-- ========================================

-- Composite index for daily logs by project
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_date 
ON construction_log(project_id, log_date DESC, created_at DESC);

-- Index for daily logs by date range
CREATE INDEX IF NOT EXISTS idx_daily_logs_date_range 
ON construction_log(log_date, project_id) 
WHERE log_date IS NOT NULL;

-- Index for daily logs by created by
CREATE INDEX IF NOT EXISTS idx_daily_logs_created_by 
ON construction_log(created_by_id, project_id, log_date DESC);

-- Covering index for daily logs stats
CREATE INDEX IF NOT EXISTS idx_daily_logs_stats_covering 
ON construction_log(project_id, log_date) 
INCLUDE (id, title, work_description, work_hours, workers_count, weather, temperature)
WHERE deleted_at IS NULL;

-- ========================================
-- 4. PHOTOS TABLE INDEXES
-- ========================================

-- Index for photos by project
CREATE INDEX IF NOT EXISTS idx_photos_project 
ON construction_photo(project_id, uploaded_at DESC);

-- Index for photos by daily log
CREATE INDEX IF NOT EXISTS idx_photos_daily_log 
ON construction_photo(daily_log_id, project_id) 
WHERE daily_log_id IS NOT NULL;

-- Index for photos by uploader
CREATE INDEX IF NOT EXISTS idx_photos_uploader 
ON construction_photo(uploaded_by_id, project_id, uploaded_at DESC);

-- ========================================
-- 5. ACTIVITIES TABLE INDEXES
-- ========================================

-- Index for activities by project
CREATE INDEX IF NOT EXISTS idx_activities_project 
ON construction_activity(project_id, created_at DESC);

-- Index for activities by user
CREATE INDEX IF NOT EXISTS idx_activities_user 
ON construction_activity(user_id, project_id, created_at DESC);

-- Index for activities by type
CREATE INDEX IF NOT EXISTS idx_activities_type 
ON construction_activity(activity_type, project_id, created_at DESC);

-- ========================================
-- 6. ORGANIZATION TABLE INDEXES
-- ========================================

-- Index for organization lookup
CREATE INDEX IF NOT EXISTS idx_organization_slug 
ON organization(slug) 
WHERE slug IS NOT NULL;

-- Index for organization stripe customer
CREATE INDEX IF NOT EXISTS idx_organization_stripe 
ON organization(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- ========================================
-- 7. MATERIALIZED VIEWS FOR COMPLEX QUERIES
-- ========================================

-- Materialized view for project statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS project_stats_mv AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.status as project_status,
  p.organization_id,
  COUNT(DISTINCT wi.id) as work_item_count,
  COUNT(DISTINCT dl.id) as daily_log_count,
  COUNT(DISTINCT ph.id) as photo_count,
  AVG(wi.progress) as average_progress,
  COUNT(DISTINCT CASE WHEN wi.status = 'completed' THEN wi.id END) as completed_work_items,
  COUNT(DISTINCT CASE WHEN wi.status = 'in_progress' THEN wi.id END) as in_progress_work_items,
  COUNT(DISTINCT CASE WHEN wi.status = 'planned' THEN wi.id END) as planned_work_items,
  SUM(wi.estimated_work_hours) as total_estimated_hours,
  SUM(wi.actual_work_hours) as total_actual_hours,
  MAX(dl.log_date) as last_daily_log_date,
  MAX(wi.updated_at) as last_work_item_update,
  p.created_at,
  p.updated_at
FROM construction_project p
LEFT JOIN construction_work_item wi ON p.id = wi.project_id AND wi.is_active = true
LEFT JOIN construction_log dl ON p.id = dl.project_id AND dl.deleted_at IS NULL
LEFT JOIN construction_photo ph ON p.id = ph.project_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.status, p.organization_id, p.created_at, p.updated_at;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_stats_mv_project_id 
ON project_stats_mv(project_id);

-- ========================================
-- 8. FUNCTIONS FOR REFRESHING MATERIALIZED VIEWS
-- ========================================

-- Function to refresh project stats materialized view
CREATE OR REPLACE FUNCTION refresh_project_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY project_stats_mv;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY project_stats_mv;
  -- Add more materialized views here as needed
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 9. TRIGGERS FOR AUTO-REFRESH
-- ========================================

-- Function to trigger materialized view refresh
CREATE OR REPLACE FUNCTION trigger_refresh_project_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh materialized view asynchronously
  PERFORM pg_notify('refresh_project_stats', '');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for project updates
CREATE TRIGGER trigger_project_stats_refresh
  AFTER INSERT OR UPDATE OR DELETE ON construction_project
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_project_stats();

-- Trigger for work item updates
CREATE TRIGGER trigger_work_item_stats_refresh
  AFTER INSERT OR UPDATE OR DELETE ON construction_work_item
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_project_stats();

-- Trigger for daily log updates
CREATE TRIGGER trigger_daily_log_stats_refresh
  AFTER INSERT OR UPDATE OR DELETE ON construction_log
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_project_stats();

-- ========================================
-- 10. QUERY OPTIMIZATION HINTS
-- ========================================

-- Analyze tables to update statistics
ANALYZE construction_project;
ANALYZE construction_work_item;
ANALYZE construction_log;
ANALYZE construction_photo;
ANALYZE construction_activity;
ANALYZE organization;

-- ========================================
-- 11. PERFORMANCE MONITORING QUERIES
-- ========================================

-- Query to check index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan,
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 100 THEN 'LOW_USAGE'
    ELSE 'HIGH_USAGE'
  END as usage_level
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Query to check slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 1000 -- Queries taking more than 1 second
ORDER BY mean_time DESC
LIMIT 20;

-- ========================================
-- 12. CLEANUP AND MAINTENANCE
-- ========================================

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete old activities (older than 1 year)
  DELETE FROM construction_activity 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Delete old photos (older than 2 years and not referenced)
  DELETE FROM construction_photo 
  WHERE uploaded_at < NOW() - INTERVAL '2 years'
  AND id NOT IN (
    SELECT DISTINCT photo_id FROM construction_activity 
    WHERE photo_id IS NOT NULL
  );
  
  -- Vacuum tables
  VACUUM ANALYZE construction_activity;
  VACUUM ANALYZE construction_photo;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- END OF PERFORMANCE OPTIMIZATION INDEXES
-- ========================================

