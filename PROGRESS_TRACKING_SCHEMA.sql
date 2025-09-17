-- ========================================
-- PROGRESS TRACKING SCHEMA FOR CONSTRUCTION
-- ========================================
-- This file contains the enhanced schema for progress tracking
-- with Gantt chart, critical path, and milestone management

-- ========================================
-- 1. ENHANCED WORK ITEM SCHEMA
-- ========================================

-- Add progress tracking fields to existing work item table
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS actual_start_date TIMESTAMP;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS actual_end_date TIMESTAMP;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS actual_duration INTEGER DEFAULT 0;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS buffer_days INTEGER DEFAULT 0;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS physical_progress INTEGER DEFAULT 0 CHECK (physical_progress >= 0 AND physical_progress <= 100);
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS financial_progress INTEGER DEFAULT 0 CHECK (financial_progress >= 0 AND financial_progress <= 100);
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS critical_path BOOLEAN DEFAULT FALSE;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS float_days INTEGER DEFAULT 0;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS lag_days INTEGER DEFAULT 0;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(15,2);
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(15,2);
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS budget_code VARCHAR(50);
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS cost_center VARCHAR(50);
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS baseline_start_date TIMESTAMP;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS baseline_end_date TIMESTAMP;
ALTER TABLE construction_work_item ADD COLUMN IF NOT EXISTS baseline_duration INTEGER DEFAULT 0;

-- ========================================
-- 2. WORK ITEM DEPENDENCIES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS work_item_dependencies (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES construction_project(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  predecessor_id INTEGER NOT NULL REFERENCES construction_work_item(id) ON DELETE CASCADE,
  successor_id INTEGER NOT NULL REFERENCES construction_work_item(id) ON DELETE CASCADE,
  dependency_type VARCHAR(20) DEFAULT 'finish_to_start' NOT NULL, -- finish_to_start, start_to_start, finish_to_finish, start_to_finish
  lag_days INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Ensure no circular dependencies
  CONSTRAINT no_circular_dependency CHECK (predecessor_id != successor_id),
  -- Ensure dependencies are within the same project
  CONSTRAINT same_project_dependency CHECK (
    (SELECT project_id FROM construction_work_item WHERE id = predecessor_id) = 
    (SELECT project_id FROM construction_work_item WHERE id = successor_id)
  )
);

-- ========================================
-- 3. WORK ITEM MILESTONES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS work_item_milestones (
  id SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES construction_work_item(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES construction_project(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  milestone_name VARCHAR(200) NOT NULL,
  milestone_description TEXT,
  target_date TIMESTAMP NOT NULL,
  actual_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- pending, completed, overdue, cancelled
  importance VARCHAR(10) DEFAULT 'medium' NOT NULL, -- low, medium, high, critical
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_by_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ========================================
-- 4. WORK ITEM BASELINES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS work_item_baselines (
  id SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES construction_work_item(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES construction_project(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  baseline_name VARCHAR(200) NOT NULL,
  baseline_version INTEGER DEFAULT 1 NOT NULL,
  baseline_start_date TIMESTAMP NOT NULL,
  baseline_end_date TIMESTAMP NOT NULL,
  baseline_duration INTEGER NOT NULL,
  baseline_cost DECIMAL(15,2),
  baseline_notes TEXT,
  created_by_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Ensure only one active baseline per work item
  UNIQUE(work_item_id, baseline_version)
);

-- ========================================
-- 5. WORK ITEM RISKS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS work_item_risks (
  id SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES construction_work_item(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES construction_project(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  risk_name VARCHAR(200) NOT NULL,
  risk_description TEXT,
  risk_category VARCHAR(50), -- technical, financial, schedule, resource, external
  probability VARCHAR(10) DEFAULT 'medium' NOT NULL, -- low, medium, high
  impact VARCHAR(10) DEFAULT 'medium' NOT NULL, -- low, medium, high
  severity VARCHAR(10) DEFAULT 'medium' NOT NULL, -- low, medium, high, critical
  status VARCHAR(20) DEFAULT 'open' NOT NULL, -- open, mitigated, closed, accepted
  mitigation_plan TEXT,
  contingency_plan TEXT,
  owner_id TEXT,
  identified_date TIMESTAMP DEFAULT NOW() NOT NULL,
  target_mitigation_date TIMESTAMP,
  actual_mitigation_date TIMESTAMP,
  created_by_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ========================================
-- 6. WORK ITEM ISSUES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS work_item_issues (
  id SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES construction_work_item(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES construction_project(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  issue_title VARCHAR(200) NOT NULL,
  issue_description TEXT,
  issue_type VARCHAR(50), -- technical, safety, quality, schedule, cost, resource
  severity VARCHAR(10) DEFAULT 'medium' NOT NULL, -- low, medium, high, critical
  status VARCHAR(20) DEFAULT 'open' NOT NULL, -- open, in_progress, resolved, closed
  assigned_to_id TEXT,
  reported_by_id TEXT,
  reported_date TIMESTAMP DEFAULT NOW() NOT NULL,
  resolved_date TIMESTAMP,
  resolution TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ========================================
-- 7. WORK ITEM RESOURCE ALLOCATION TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS work_item_resource_allocation (
  id SERIAL PRIMARY KEY,
  work_item_id INTEGER NOT NULL REFERENCES construction_work_item(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES construction_project(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL, -- human, equipment, material, external
  resource_id TEXT NOT NULL, -- ID of the resource (user_id, equipment_id, etc.)
  resource_name VARCHAR(200) NOT NULL,
  allocated_quantity DECIMAL(10,2) DEFAULT 1,
  allocated_unit VARCHAR(20), -- hours, days, pieces, kg, etc.
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  cost_per_unit DECIMAL(15,2),
  total_cost DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'allocated' NOT NULL, -- allocated, active, completed, cancelled
  notes TEXT,
  created_by_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ========================================
-- 8. PROJECT SCHEDULE VIEWS
-- ========================================

-- View for project schedule overview
CREATE OR REPLACE VIEW project_schedule_overview AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.start_date as project_start_date,
  p.end_date as project_end_date,
  COUNT(wi.id) as total_work_items,
  COUNT(CASE WHEN wi.status = 'completed' THEN 1 END) as completed_work_items,
  COUNT(CASE WHEN wi.critical_path = true THEN 1 END) as critical_path_items,
  AVG(wi.progress) as average_progress,
  MIN(wi.start_date) as earliest_start_date,
  MAX(wi.end_date) as latest_end_date
FROM construction_project p
LEFT JOIN construction_work_item wi ON p.id = wi.project_id
WHERE p.is_active = true AND wi.is_active = true
GROUP BY p.id, p.name, p.start_date, p.end_date;

-- View for critical path analysis
CREATE OR REPLACE VIEW critical_path_analysis AS
SELECT 
  wi.id as work_item_id,
  wi.work_item_title,
  wi.start_date,
  wi.end_date,
  wi.duration,
  wi.float_days,
  wi.critical_path,
  wi.progress,
  wi.status,
  p.name as project_name
FROM construction_work_item wi
JOIN construction_project p ON wi.project_id = p.id
WHERE wi.critical_path = true 
  AND wi.is_active = true 
  AND p.is_active = true
ORDER BY wi.start_date;

-- View for milestone tracking
CREATE OR REPLACE VIEW milestone_tracking AS
SELECT 
  m.id as milestone_id,
  m.milestone_name,
  m.target_date,
  m.actual_date,
  m.status,
  m.importance,
  m.completion_percentage,
  wi.work_item_title,
  p.name as project_name,
  CASE 
    WHEN m.actual_date IS NOT NULL THEN 
      EXTRACT(DAYS FROM (m.actual_date - m.target_date))
    WHEN m.target_date < NOW() AND m.status != 'completed' THEN 
      EXTRACT(DAYS FROM (NOW() - m.target_date))
    ELSE 0
  END as days_variance
FROM work_item_milestones m
JOIN construction_work_item wi ON m.work_item_id = wi.id
JOIN construction_project p ON m.project_id = p.id
WHERE wi.is_active = true AND p.is_active = true
ORDER BY m.target_date;

-- ========================================
-- 9. INDEXES FOR PERFORMANCE
-- ========================================

-- Work item indexes
CREATE INDEX IF NOT EXISTS idx_work_item_start_date ON construction_work_item(start_date);
CREATE INDEX IF NOT EXISTS idx_work_item_end_date ON construction_work_item(end_date);
CREATE INDEX IF NOT EXISTS idx_work_item_critical_path ON construction_work_item(critical_path);
CREATE INDEX IF NOT EXISTS idx_work_item_progress ON construction_work_item(progress);
CREATE INDEX IF NOT EXISTS idx_work_item_status ON construction_work_item(status);

-- Dependencies indexes
CREATE INDEX IF NOT EXISTS idx_dependencies_predecessor ON work_item_dependencies(predecessor_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_successor ON work_item_dependencies(successor_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_project ON work_item_dependencies(project_id);

-- Milestones indexes
CREATE INDEX IF NOT EXISTS idx_milestones_work_item ON work_item_milestones(work_item_id);
CREATE INDEX IF NOT EXISTS idx_milestones_target_date ON work_item_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON work_item_milestones(status);

-- Risks indexes
CREATE INDEX IF NOT EXISTS idx_risks_work_item ON work_item_risks(work_item_id);
CREATE INDEX IF NOT EXISTS idx_risks_severity ON work_item_risks(severity);
CREATE INDEX IF NOT EXISTS idx_risks_status ON work_item_risks(status);

-- Issues indexes
CREATE INDEX IF NOT EXISTS idx_issues_work_item ON work_item_issues(work_item_id);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON work_item_issues(severity);
CREATE INDEX IF NOT EXISTS idx_issues_status ON work_item_issues(status);

-- Resource allocation indexes
CREATE INDEX IF NOT EXISTS idx_resource_work_item ON work_item_resource_allocation(work_item_id);
CREATE INDEX IF NOT EXISTS idx_resource_type ON work_item_resource_allocation(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_status ON work_item_resource_allocation(status);

-- ========================================
-- 10. FUNCTIONS FOR CRITICAL PATH CALCULATION
-- ========================================

-- Function to calculate critical path for a project
CREATE OR REPLACE FUNCTION calculate_critical_path(project_id_param INTEGER)
RETURNS TABLE (
  work_item_id INTEGER,
  work_item_title TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  duration INTEGER,
  float_days INTEGER,
  is_critical BOOLEAN
) AS $$
BEGIN
  -- Reset critical path flag
  UPDATE construction_work_item 
  SET critical_path = false 
  WHERE project_id = project_id_param;
  
  -- Calculate forward pass (earliest start/end times)
  WITH RECURSIVE forward_pass AS (
    -- Start with work items that have no predecessors
    SELECT 
      wi.id,
      wi.work_item_title,
      wi.start_date,
      wi.end_date,
      wi.duration,
      wi.start_date as earliest_start,
      wi.start_date + INTERVAL '1 day' * wi.duration as earliest_end,
      0 as level
    FROM construction_work_item wi
    LEFT JOIN work_item_dependencies d ON wi.id = d.successor_id
    WHERE wi.project_id = project_id_param 
      AND d.successor_id IS NULL
      AND wi.is_active = true
    
    UNION ALL
    
    -- Recursively calculate for dependent work items
    SELECT 
      wi.id,
      wi.work_item_title,
      wi.start_date,
      wi.end_date,
      wi.duration,
      GREATEST(wi.start_date, fp.earliest_end + INTERVAL '1 day' * COALESCE(d.lag_days, 0)) as earliest_start,
      GREATEST(wi.start_date, fp.earliest_end + INTERVAL '1 day' * COALESCE(d.lag_days, 0)) + INTERVAL '1 day' * wi.duration as earliest_end,
      fp.level + 1
    FROM construction_work_item wi
    JOIN work_item_dependencies d ON wi.id = d.successor_id
    JOIN forward_pass fp ON d.predecessor_id = fp.id
    WHERE wi.project_id = project_id_param AND wi.is_active = true
  ),
  -- Calculate backward pass (latest start/end times)
  backward_pass AS (
    -- Start with work items that have no successors
    SELECT 
      wi.id,
      wi.end_date as latest_end,
      wi.end_date - INTERVAL '1 day' * wi.duration as latest_start
    FROM construction_work_item wi
    LEFT JOIN work_item_dependencies d ON wi.id = d.predecessor_id
    WHERE wi.project_id = project_id_param 
      AND d.predecessor_id IS NULL
      AND wi.is_active = true
    
    UNION ALL
    
    -- Recursively calculate for predecessor work items
    SELECT 
      wi.id,
      LEAST(wi.end_date, bp.latest_start - INTERVAL '1 day' * COALESCE(d.lag_days, 0)) as latest_end,
      LEAST(wi.end_date, bp.latest_start - INTERVAL '1 day' * COALESCE(d.lag_days, 0)) - INTERVAL '1 day' * wi.duration as latest_start
    FROM construction_work_item wi
    JOIN work_item_dependencies d ON wi.id = d.predecessor_id
    JOIN backward_pass bp ON d.successor_id = bp.id
    WHERE wi.project_id = project_id_param AND wi.is_active = true
  )
  -- Calculate float and identify critical path
  SELECT 
    wi.id,
    wi.work_item_title,
    wi.start_date,
    wi.end_date,
    wi.duration,
    EXTRACT(DAYS FROM (bp.latest_end - fp.earliest_end))::INTEGER as float_days,
    (EXTRACT(DAYS FROM (bp.latest_end - fp.earliest_end)) = 0) as is_critical
  FROM construction_work_item wi
  JOIN forward_pass fp ON wi.id = fp.id
  JOIN backward_pass bp ON wi.id = bp.id
  WHERE wi.project_id = project_id_param AND wi.is_active = true;
  
  -- Update critical path flag
  UPDATE construction_work_item 
  SET critical_path = true 
  WHERE project_id = project_id_param 
    AND id IN (
      SELECT work_item_id 
      FROM calculate_critical_path(project_id_param) 
      WHERE is_critical = true
    );
  
  RETURN QUERY SELECT * FROM calculate_critical_path(project_id_param);
END;
$$ LANGUAGE plpgsql;

-- Function to update work item progress
CREATE OR REPLACE FUNCTION update_work_item_progress(
  work_item_id_param INTEGER,
  progress_param INTEGER,
  physical_progress_param INTEGER DEFAULT NULL,
  financial_progress_param INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE construction_work_item
  SET 
    progress = progress_param,
    physical_progress = COALESCE(physical_progress_param, physical_progress),
    financial_progress = COALESCE(financial_progress_param, financial_progress),
    updated_at = NOW()
  WHERE id = work_item_id_param;
  
  -- Update status based on progress
  UPDATE construction_work_item
  SET status = CASE
    WHEN progress = 0 THEN 'planned'
    WHEN progress > 0 AND progress < 100 THEN 'in_progress'
    WHEN progress = 100 THEN 'completed'
    ELSE status
  END
  WHERE id = work_item_id_param;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 11. TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update work item duration when dates change
CREATE OR REPLACE FUNCTION update_work_item_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
    NEW.duration = EXTRACT(DAYS FROM (NEW.end_date - NEW.start_date))::INTEGER;
  END IF;
  
  IF NEW.actual_start_date IS NOT NULL AND NEW.actual_end_date IS NOT NULL THEN
    NEW.actual_duration = EXTRACT(DAYS FROM (NEW.actual_end_date - NEW.actual_start_date))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update duration
CREATE TRIGGER trigger_update_work_item_duration
  BEFORE UPDATE ON construction_work_item
  FOR EACH ROW
  EXECUTE FUNCTION update_work_item_duration();

-- ========================================
-- 12. SAMPLE DATA FOR TESTING
-- ========================================

-- Insert sample dependencies
INSERT INTO work_item_dependencies (project_id, organization_id, predecessor_id, successor_id, dependency_type, lag_days, description) VALUES
(1, 'org_demo_1', 1, 2, 'finish_to_start', 0, 'Foundation must be completed before framing'),
(1, 'org_demo_1', 2, 3, 'finish_to_start', 1, 'Framing must be completed before roofing'),
(1, 'org_demo_1', 3, 4, 'finish_to_start', 0, 'Roofing must be completed before finishing');

-- Insert sample milestones
INSERT INTO work_item_milestones (work_item_id, project_id, organization_id, milestone_name, milestone_description, target_date, importance, created_by_id) VALUES
(1, 1, 'org_demo_1', 'Foundation Complete', 'Foundation work completed and inspected', '2024-01-15', 'critical', 'test-user-123'),
(2, 1, 'org_demo_1', 'Framing Complete', 'Structural framing completed', '2024-02-15', 'high', 'test-user-123'),
(3, 1, 'org_demo_1', 'Roofing Complete', 'Roofing work completed', '2024-03-15', 'high', 'test-user-123'),
(4, 1, 'org_demo_1', 'Project Complete', 'All work completed and ready for handover', '2024-04-15', 'critical', 'test-user-123');

-- ========================================
-- END OF PROGRESS TRACKING SCHEMA
-- ========================================

