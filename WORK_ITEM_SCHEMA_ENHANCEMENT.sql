-- ========================================
-- WORK ITEM SCHEMA ENHANCEMENT FOR CONSTRUCTION
-- ========================================
-- This file contains the enhanced schema for construction work items
-- with additional fields required for professional construction project management

-- ========================================
-- 1. ENHANCED CONSTRUCTION WORK ITEM SCHEMA
-- ========================================

-- Drop existing table if needed (for development only)
-- DROP TABLE IF EXISTS construction_work_item CASCADE;

-- Create enhanced construction work item table
CREATE TABLE IF NOT EXISTS construction_work_item_enhanced (
  -- Basic Information
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES construction_project(id) ON DELETE CASCADE,
  daily_log_id INTEGER REFERENCES construction_log(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  
  -- Work Item Basic Details
  work_item_title TEXT NOT NULL,
  work_item_description TEXT,
  work_item_type VARCHAR(20) DEFAULT 'concrete_work' NOT NULL,
  status VARCHAR(20) DEFAULT 'planned' NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium' NOT NULL,
  
  -- WBS (Work Breakdown Structure) Information
  phase_id INTEGER, -- References construction_phase table
  sub_phase_id INTEGER, -- References construction_sub_phase table
  work_package_id INTEGER, -- References work_package table
  parent_work_item_id INTEGER REFERENCES construction_work_item_enhanced(id),
  work_item_level INTEGER DEFAULT 1 NOT NULL,
  work_item_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Assignment Information
  assigned_to TEXT, -- Clerk User ID
  assigned_by TEXT, -- Clerk User ID
  supervisor_id TEXT, -- Clerk User ID
  foreman_id TEXT, -- Clerk User ID
  crew_members TEXT[], -- Array of Clerk User IDs
  
  -- Scheduling Information
  work_date TIMESTAMP,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  
  -- Time Tracking
  estimated_work_hours INTEGER,
  actual_work_hours INTEGER,
  estimated_duration_days INTEGER,
  actual_duration_days INTEGER,
  
  -- Technical Information
  specification TEXT,
  technical_requirements TEXT,
  quality_standards TEXT[],
  safety_requirements TEXT[],
  environmental_requirements TEXT[],
  building_code VARCHAR(50),
  drawing_number VARCHAR(50),
  revision_number VARCHAR(20),
  
  -- Work Details
  construction_location TEXT,
  weather_condition TEXT,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  wind_speed DECIMAL(5,2),
  precipitation DECIMAL(5,2),
  weather_impact TEXT,
  
  -- Resource Information
  labor_count INTEGER DEFAULT 0,
  required_skills TEXT[],
  certifications TEXT[],
  materials TEXT, -- JSON array of materials
  equipment TEXT, -- JSON array of equipment
  material_details JSONB, -- Detailed material information
  equipment_details JSONB, -- Detailed equipment information
  
  -- Cost and Budget Information
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  budget_code VARCHAR(50),
  cost_center VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'VND',
  labor_cost DECIMAL(15,2),
  material_cost DECIMAL(15,2),
  equipment_cost DECIMAL(15,2),
  overhead_cost DECIMAL(15,2),
  
  -- Progress and KPI Information
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  physical_progress INTEGER DEFAULT 0 CHECK (physical_progress >= 0 AND physical_progress <= 100),
  financial_progress INTEGER DEFAULT 0 CHECK (financial_progress >= 0 AND financial_progress <= 100),
  milestones JSONB, -- Array of milestone objects
  kpis JSONB, -- Array of KPI objects
  performance_metrics JSONB, -- Array of performance metric objects
  
  -- Risk and Issue Management
  risks JSONB, -- Array of risk objects
  issues JSONB, -- Array of issue objects
  mitigation_plans TEXT[],
  contingency_plans TEXT[],
  
  -- Dependencies and Links
  dependencies JSONB, -- Array of dependency objects
  predecessors INTEGER[], -- Array of work item IDs
  successors INTEGER[], -- Array of work item IDs
  critical_path BOOLEAN DEFAULT FALSE,
  float_days INTEGER DEFAULT 0,
  
  -- Quality and Inspection
  inspection_required BOOLEAN DEFAULT FALSE,
  inspection_date TIMESTAMP,
  inspector_id TEXT,
  inspection_result TEXT,
  quality_checklist JSONB, -- Array of quality check objects
  approval_required BOOLEAN DEFAULT FALSE,
  approver_id TEXT,
  approval_date TIMESTAMP,
  approval_status VARCHAR(20),
  
  -- Safety Information
  safety_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, very_high
  safety_equipment TEXT[],
  safety_procedures TEXT[],
  safety_incidents JSONB, -- Array of safety incident objects
  safety_training TEXT[],
  
  -- Regulatory Compliance
  regulatory_compliance TEXT[],
  permits JSONB, -- Array of permit objects
  licenses JSONB, -- Array of license objects
  certifications JSONB, -- Array of certification objects
  
  -- Document Management
  documents JSONB, -- Array of document objects
  photos JSONB, -- Array of photo objects
  videos JSONB, -- Array of video objects
  drawings JSONB, -- Array of drawing objects
  specifications JSONB, -- Array of specification objects
  
  -- Additional Information
  notes TEXT,
  tags TEXT[],
  
  -- ERP Audit Trail Fields
  created_by_id TEXT,
  updated_by_id TEXT,
  version INTEGER DEFAULT 1 NOT NULL,
  
  -- ERP Soft Delete Fields
  deleted_at TIMESTAMP,
  deleted_by_id TEXT,
  
  -- System Fields
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ========================================
-- 2. SUPPORTING TABLES
-- ========================================

-- Construction Phase Table
CREATE TABLE IF NOT EXISTS construction_phase (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES construction_project(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  phase_name VARCHAR(100) NOT NULL,
  phase_description TEXT,
  phase_order INTEGER NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Construction Sub-Phase Table
CREATE TABLE IF NOT EXISTS construction_sub_phase (
  id SERIAL PRIMARY KEY,
  phase_id INTEGER NOT NULL REFERENCES construction_phase(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  sub_phase_name VARCHAR(100) NOT NULL,
  sub_phase_description TEXT,
  sub_phase_order INTEGER NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Work Package Table
CREATE TABLE IF NOT EXISTS work_package (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES construction_project(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  package_name VARCHAR(100) NOT NULL,
  package_description TEXT,
  package_code VARCHAR(50) UNIQUE NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ========================================
-- 3. INDEXES FOR PERFORMANCE
-- ========================================

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_work_item_project_id ON construction_work_item_enhanced(project_id);
CREATE INDEX IF NOT EXISTS idx_work_item_organization_id ON construction_work_item_enhanced(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_item_status ON construction_work_item_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_work_item_priority ON construction_work_item_enhanced(priority);
CREATE INDEX IF NOT EXISTS idx_work_item_assigned_to ON construction_work_item_enhanced(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_item_work_date ON construction_work_item_enhanced(work_date);
CREATE INDEX IF NOT EXISTS idx_work_item_due_date ON construction_work_item_enhanced(due_date);

-- WBS indexes
CREATE INDEX IF NOT EXISTS idx_work_item_phase_id ON construction_work_item_enhanced(phase_id);
CREATE INDEX IF NOT EXISTS idx_work_item_sub_phase_id ON construction_work_item_enhanced(sub_phase_id);
CREATE INDEX IF NOT EXISTS idx_work_item_work_package_id ON construction_work_item_enhanced(work_package_id);
CREATE INDEX IF NOT EXISTS idx_work_item_parent_id ON construction_work_item_enhanced(parent_work_item_id);
CREATE INDEX IF NOT EXISTS idx_work_item_level ON construction_work_item_enhanced(work_item_level);
CREATE INDEX IF NOT EXISTS idx_work_item_code ON construction_work_item_enhanced(work_item_code);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_work_item_critical_path ON construction_work_item_enhanced(critical_path);
CREATE INDEX IF NOT EXISTS idx_work_item_inspection_required ON construction_work_item_enhanced(inspection_required);
CREATE INDEX IF NOT EXISTS idx_work_item_approval_required ON construction_work_item_enhanced(approval_required);

-- JSON indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_work_item_materials_gin ON construction_work_item_enhanced USING GIN (material_details);
CREATE INDEX IF NOT EXISTS idx_work_item_equipment_gin ON construction_work_item_enhanced USING GIN (equipment_details);
CREATE INDEX IF NOT EXISTS idx_work_item_risks_gin ON construction_work_item_enhanced USING GIN (risks);
CREATE INDEX IF NOT EXISTS idx_work_item_issues_gin ON construction_work_item_enhanced USING GIN (issues);

-- ========================================
-- 4. CONSTRAINTS
-- ========================================

-- Add constraints
ALTER TABLE construction_work_item_enhanced 
ADD CONSTRAINT chk_work_item_progress CHECK (progress >= 0 AND progress <= 100);

ALTER TABLE construction_work_item_enhanced 
ADD CONSTRAINT chk_work_item_physical_progress CHECK (physical_progress >= 0 AND physical_progress <= 100);

ALTER TABLE construction_work_item_enhanced 
ADD CONSTRAINT chk_work_item_financial_progress CHECK (financial_progress >= 0 AND financial_progress <= 100);

ALTER TABLE construction_work_item_enhanced 
ADD CONSTRAINT chk_work_item_work_item_level CHECK (work_item_level >= 1);

ALTER TABLE construction_work_item_enhanced 
ADD CONSTRAINT chk_work_item_float_days CHECK (float_days >= 0);

-- ========================================
-- 5. TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_work_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_work_item_updated_at
  BEFORE UPDATE ON construction_work_item_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION update_work_item_updated_at();

-- ========================================
-- 6. SAMPLE DATA FOR TESTING
-- ========================================

-- Insert sample phases
INSERT INTO construction_phase (project_id, organization_id, phase_name, phase_description, phase_order, status) VALUES
(1, 'org_demo_1', 'Giai đoạn 1: Chuẩn bị', 'Chuẩn bị mặt bằng và thiết kế', 1, 'completed'),
(1, 'org_demo_1', 'Giai đoạn 2: Thi công móng', 'Thi công móng và tầng hầm', 2, 'in_progress'),
(1, 'org_demo_1', 'Giai đoạn 3: Thi công khung', 'Thi công khung bê tông cốt thép', 3, 'planned'),
(1, 'org_demo_1', 'Giai đoạn 4: Hoàn thiện', 'Hoàn thiện nội thất và ngoại thất', 4, 'planned');

-- Insert sample sub-phases
INSERT INTO construction_sub_phase (phase_id, organization_id, sub_phase_name, sub_phase_description, sub_phase_order, status) VALUES
(1, 'org_demo_1', 'Khảo sát địa chất', 'Khảo sát địa chất và địa hình', 1, 'completed'),
(1, 'org_demo_1', 'Thiết kế kiến trúc', 'Thiết kế kiến trúc và kết cấu', 2, 'completed'),
(2, 'org_demo_1', 'Đào móng', 'Đào móng và xử lý nền', 1, 'in_progress'),
(2, 'org_demo_1', 'Đổ bê tông móng', 'Đổ bê tông móng và tường hầm', 2, 'planned');

-- Insert sample work packages
INSERT INTO work_package (project_id, organization_id, package_name, package_description, package_code, status) VALUES
(1, 'org_demo_1', 'Gói 1: Công tác đất', 'Đào đất, san lấp, xử lý nền', 'WP-001', 'in_progress'),
(1, 'org_demo_1', 'Gói 2: Công tác bê tông', 'Đổ bê tông móng, cột, dầm, sàn', 'WP-002', 'planned'),
(1, 'org_demo_1', 'Gói 3: Công tác thép', 'Gia công và lắp đặt cốt thép', 'WP-003', 'planned'),
(1, 'org_demo_1', 'Gói 4: Công tác hoàn thiện', 'Sơn, lát gạch, lắp đặt cửa', 'WP-004', 'planned');

-- ========================================
-- 7. VIEWS FOR COMMON QUERIES
-- ========================================

-- View for work item summary
CREATE OR REPLACE VIEW work_item_summary AS
SELECT 
  w.id,
  w.work_item_code,
  w.work_item_title,
  w.status,
  w.priority,
  w.progress,
  w.assigned_to,
  w.work_date,
  w.due_date,
  w.estimated_work_hours,
  w.actual_work_hours,
  w.estimated_cost,
  w.actual_cost,
  p.phase_name,
  sp.sub_phase_name,
  wp.package_name,
  w.created_at,
  w.updated_at
FROM construction_work_item_enhanced w
LEFT JOIN construction_phase p ON w.phase_id = p.id
LEFT JOIN construction_sub_phase sp ON w.sub_phase_id = sp.id
LEFT JOIN work_package wp ON w.work_package_id = wp.id
WHERE w.is_active = TRUE;

-- View for critical path analysis
CREATE OR REPLACE VIEW critical_path_analysis AS
SELECT 
  w.id,
  w.work_item_code,
  w.work_item_title,
  w.status,
  w.progress,
  w.work_date,
  w.due_date,
  w.float_days,
  w.critical_path,
  w.estimated_work_hours,
  w.actual_work_hours
FROM construction_work_item_enhanced w
WHERE w.is_active = TRUE
ORDER BY w.work_date, w.priority DESC;

-- ========================================
-- 8. FUNCTIONS FOR COMMON OPERATIONS
-- ========================================

-- Function to calculate work item progress
CREATE OR REPLACE FUNCTION calculate_work_item_progress(work_item_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  progress_value INTEGER;
BEGIN
  SELECT 
    CASE 
      WHEN status = 'completed' THEN 100
      WHEN status = 'cancelled' THEN 0
      WHEN actual_work_hours IS NOT NULL AND estimated_work_hours IS NOT NULL AND estimated_work_hours > 0 THEN
        LEAST(100, GREATEST(0, (actual_work_hours * 100) / estimated_work_hours))
      ELSE COALESCE(progress, 0)
    END
  INTO progress_value
  FROM construction_work_item_enhanced
  WHERE id = work_item_id;
  
  RETURN COALESCE(progress_value, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update work item progress
CREATE OR REPLACE FUNCTION update_work_item_progress(work_item_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE construction_work_item_enhanced
  SET progress = calculate_work_item_progress(work_item_id)
  WHERE id = work_item_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 9. COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE construction_work_item_enhanced IS 'Enhanced construction work items with comprehensive project management features';
COMMENT ON COLUMN construction_work_item_enhanced.work_item_code IS 'Unique work item code following WBS structure (e.g., WBS-001, WBS-001.1)';
COMMENT ON COLUMN construction_work_item_enhanced.work_item_level IS 'Level in work breakdown structure (1=Phase, 2=Sub-phase, 3=Work Package, 4=Task)';
COMMENT ON COLUMN construction_work_item_enhanced.critical_path IS 'Indicates if this work item is on the critical path';
COMMENT ON COLUMN construction_work_item_enhanced.float_days IS 'Number of days this work item can be delayed without affecting project completion';
COMMENT ON COLUMN construction_work_item_enhanced.material_details IS 'JSON array containing detailed material information';
COMMENT ON COLUMN construction_work_item_enhanced.equipment_details IS 'JSON array containing detailed equipment information';
COMMENT ON COLUMN construction_work_item_enhanced.risks IS 'JSON array containing risk assessment information';
COMMENT ON COLUMN construction_work_item_enhanced.issues IS 'JSON array containing issue tracking information';

-- ========================================
-- END OF SCHEMA ENHANCEMENT
-- ========================================

