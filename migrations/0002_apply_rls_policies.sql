-- Apply Row-Level Security (RLS) policies for Construction Management SaaS
-- This migration enables multi-tenancy using Clerk Organization IDs

-- Enable RLS on all tables
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE project ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photo ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo ENABLE ROW LEVEL SECURITY;

-- Organization table policies
-- Users can only see organizations they belong to
CREATE POLICY "Users can view their organizations" ON organization
  FOR SELECT USING (
    id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Only organization owners can update organization details
CREATE POLICY "Owners can update organization" ON organization
  FOR UPDATE USING (
    id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid() 
      AND role = 'org:owner'
    )
  );

-- Project table policies
-- Users can only see projects from their organizations
CREATE POLICY "Users can view organization projects" ON project
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create projects in their organizations
CREATE POLICY "Users can create projects" ON project
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Project managers and admins can update projects
CREATE POLICY "Managers can update projects" ON project
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    ) AND (
      project_manager_id = auth.uid() OR
      organization_id IN (
        SELECT organization_id 
        FROM clerk.organization_memberships 
        WHERE user_id = auth.uid() 
        AND role IN ('org:owner', 'org:admin')
      )
    )
  );

-- Project managers and admins can delete projects
CREATE POLICY "Managers can delete projects" ON project
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    ) AND (
      project_manager_id = auth.uid() OR
      organization_id IN (
        SELECT organization_id 
        FROM clerk.organization_memberships 
        WHERE user_id = auth.uid() 
        AND role IN ('org:owner', 'org:admin')
      )
    )
  );

-- Daily log table policies
-- Users can view daily logs from their organization projects
CREATE POLICY "Users can view organization daily logs" ON daily_log
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create daily logs for their organization projects
CREATE POLICY "Users can create daily logs" ON daily_log
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update their own daily logs or if they're project managers/admins
CREATE POLICY "Users can update daily logs" ON daily_log
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    ) AND (
      created_by_id = auth.uid() OR
      project_id IN (
        SELECT id FROM project 
        WHERE project_manager_id = auth.uid()
      ) OR
      organization_id IN (
        SELECT organization_id 
        FROM clerk.organization_memberships 
        WHERE user_id = auth.uid() 
        AND role IN ('org:owner', 'org:admin')
      )
    )
  );

-- Users can delete their own daily logs or if they're project managers/admins
CREATE POLICY "Users can delete daily logs" ON daily_log
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    ) AND (
      created_by_id = auth.uid() OR
      project_id IN (
        SELECT id FROM project 
        WHERE project_manager_id = auth.uid()
      ) OR
      organization_id IN (
        SELECT organization_id 
        FROM clerk.organization_memberships 
        WHERE user_id = auth.uid() 
        AND role IN ('org:owner', 'org:admin')
      )
    )
  );

-- Project photo table policies
-- Users can view photos from their organization projects
CREATE POLICY "Users can view organization photos" ON project_photo
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Users can upload photos to their organization projects
CREATE POLICY "Users can upload photos" ON project_photo
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update their own photos or if they're project managers/admins
CREATE POLICY "Users can update photos" ON project_photo
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    ) AND (
      uploaded_by_id = auth.uid() OR
      project_id IN (
        SELECT id FROM project 
        WHERE project_manager_id = auth.uid()
      ) OR
      organization_id IN (
        SELECT organization_id 
        FROM clerk.organization_memberships 
        WHERE user_id = auth.uid() 
        AND role IN ('org:owner', 'org:admin')
      )
    )
  );

-- Users can delete their own photos or if they're project managers/admins
CREATE POLICY "Users can delete photos" ON project_photo
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id 
      FROM clerk.organization_memberships 
      WHERE user_id = auth.uid()
    ) AND (
      uploaded_by_id = auth.uid() OR
      project_id IN (
        SELECT id FROM project 
        WHERE project_manager_id = auth.uid()
      ) OR
      organization_id IN (
        SELECT organization_id 
        FROM clerk.organization_memberships 
        WHERE user_id = auth.uid() 
        AND role IN ('org:owner', 'org:admin')
      )
    )
  );

-- Todo table policies (legacy)
-- Users can only see their own todos
CREATE POLICY "Users can view own todos" ON todo
  FOR SELECT USING (owner_id = auth.uid());

-- Users can create their own todos
CREATE POLICY "Users can create own todos" ON todo
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own todos
CREATE POLICY "Users can update own todos" ON todo
  FOR UPDATE USING (owner_id = auth.uid());

-- Users can delete their own todos
CREATE POLICY "Users can delete own todos" ON todo
  FOR DELETE USING (owner_id = auth.uid());
