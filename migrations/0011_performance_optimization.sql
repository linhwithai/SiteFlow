-- ========================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ========================================
-- This migration adds database indexes to improve query performance

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
-- 7. ANALYZE TABLES TO UPDATE STATISTICS
-- ========================================

-- Analyze tables to update statistics
ANALYZE construction_project;
ANALYZE construction_work_item;
ANALYZE construction_log;
ANALYZE construction_photo;
ANALYZE construction_activity;
ANALYZE organization;

