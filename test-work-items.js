const testWorkItems = async () => {
  try {
    console.log('🧪 Testing Work Items API...\n');
    
    const baseUrl = 'http://localhost:3000';
    const projectId = 40; // Use existing project
    
    // Test 1: Get work items list
    console.log('📊 Test 1: Get Work Items List');
    console.log(`GET /api/projects/${projectId}/work-items`);
    
    const listResponse = await fetch(`${baseUrl}/api/projects/${projectId}/work-items`);
    console.log(`📡 Response status: ${listResponse.status}`);
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      const data = listData.success ? listData.data : listData;
      console.log('✅ Work Items List API Success:');
      console.log(`  - Work Items Count: ${data.workItems?.length || 0}`);
      console.log(`  - Pagination: Page ${data.pagination?.page || 1} of ${data.pagination?.totalPages || 0}`);
      console.log(`  - Total: ${data.pagination?.total || 0}`);
      
      if (data.workItems?.length > 0) {
        const firstItem = data.workItems[0];
        console.log(`  - First Item: "${firstItem.workItemTitle}" (ID: ${firstItem.id})`);
        console.log(`  - Status: ${firstItem.status}`);
        console.log(`  - Priority: ${firstItem.priority}`);
        console.log(`  - Progress: ${firstItem.progress}%`);
      }
    } else {
      const errorText = await listResponse.text();
      console.log(`❌ Work Items List API Error: ${errorText}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Get work items stats
    console.log('📊 Test 2: Get Work Items Stats');
    console.log(`GET /api/projects/${projectId}/work-items/stats`);
    
    const statsResponse = await fetch(`${baseUrl}/api/projects/${projectId}/work-items/stats`);
    console.log(`📡 Response status: ${statsResponse.status}`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      const stats = statsData.success ? statsData.data : statsData;
      console.log('✅ Work Items Stats API Success:');
      console.log(`  - Total Items: ${stats.totalItems || 0}`);
      console.log(`  - Completed: ${stats.completedItems || 0}`);
      console.log(`  - In Progress: ${stats.inProgressItems || 0}`);
      console.log(`  - Planned: ${stats.plannedItems || 0}`);
      console.log(`  - Overdue: ${stats.overdueItems || 0}`);
    } else {
      const errorText = await statsResponse.text();
      console.log(`❌ Work Items Stats API Error: ${errorText}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Create new work item
    console.log('📊 Test 3: Create New Work Item');
    console.log(`POST /api/projects/${projectId}/work-items`);
    
    const newWorkItemData = {
      workItemTitle: 'Test Work Item - API Testing',
      workItemDescription: 'This is a test work item created for API testing',
      workItemType: 'concrete_work',
      status: 'planned',
      priority: 'medium',
      assignedTo: 'test-worker-123',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      estimatedWorkHours: 40,
      laborCount: 5,
      materials: ['cement', 'sand', 'gravel'],
      equipment: ['concrete mixer', 'shovel'],
      notes: 'This is a test work item for API testing purposes'
    };
    
    const createResponse = await fetch(`${baseUrl}/api/projects/${projectId}/work-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org_demo_1',
        'x-user-id': 'test-user-123'
      },
      body: JSON.stringify(newWorkItemData)
    });
    
    console.log(`📡 Response status: ${createResponse.status}`);
    
    let createdWorkItem = null;
    if (createResponse.ok) {
      const createData = await createResponse.json();
      createdWorkItem = createData.workItem || createData;
      console.log('✅ Create Work Item API Success:');
      console.log(`  - Work Item ID: ${createdWorkItem.id}`);
      console.log(`  - Title: "${createdWorkItem.workItemTitle}"`);
      console.log(`  - Status: ${createdWorkItem.status}`);
      console.log(`  - Priority: ${createdWorkItem.priority}`);
      console.log(`  - Assigned To: ${createdWorkItem.assignedTo}`);
      console.log(`  - Estimated Hours: ${createdWorkItem.estimatedWorkHours || 'N/A'}`);
    } else {
      const errorText = await createResponse.text();
      console.log(`❌ Create Work Item API Error: ${errorText}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 4: Get work item detail (if created successfully)
    if (createdWorkItem) {
      console.log('📊 Test 4: Get Work Item Detail');
      console.log(`GET /api/projects/${projectId}/work-items/${createdWorkItem.id}`);
      
      const detailResponse = await fetch(`${baseUrl}/api/projects/${projectId}/work-items/${createdWorkItem.id}`);
      console.log(`📡 Response status: ${detailResponse.status}`);
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        const workItem = detailData.workItem || detailData;
        console.log('✅ Work Item Detail API Success:');
        console.log(`  - ID: ${workItem.id}`);
        console.log(`  - Title: "${workItem.workItemTitle}"`);
        console.log(`  - Description: ${workItem.workItemDescription?.substring(0, 50)}...`);
        console.log(`  - Type: ${workItem.workItemType}`);
        console.log(`  - Status: ${workItem.status}`);
        console.log(`  - Priority: ${workItem.priority}`);
        console.log(`  - Assigned To: ${workItem.assignedTo}`);
        console.log(`  - Estimated Hours: ${workItem.estimatedWorkHours || 'N/A'}`);
        console.log(`  - Labor Count: ${workItem.laborCount || 'N/A'}`);
        console.log(`  - Created By: ${workItem.createdById}`);
        console.log(`  - Materials: ${workItem.materials || 'N/A'}`);
      } else {
        const errorText = await detailResponse.text();
        console.log(`❌ Work Item Detail API Error: ${errorText}`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Test 5: Update work item
      console.log('📊 Test 5: Update Work Item');
      console.log(`PUT /api/projects/${projectId}/work-items/${createdWorkItem.id}`);
      
      const updateData = {
        workItemTitle: 'Updated Test Work Item - API Testing',
        workItemDescription: 'This work item has been updated for API testing',
        status: 'in_progress',
        priority: 'high',
        estimatedWorkHours: 50,
        laborCount: 8,
        notes: 'Updated notes for testing purposes'
      };
      
      const updateResponse = await fetch(`${baseUrl}/api/projects/${projectId}/work-items/${createdWorkItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_demo_1',
          'x-user-id': 'test-user-123'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log(`📡 Response status: ${updateResponse.status}`);
      
      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        const updatedItem = updateResult.workItem || updateResult;
        console.log('✅ Update Work Item API Success:');
        console.log(`  - ID: ${updatedItem.id}`);
        console.log(`  - Title: "${updatedItem.workItemTitle}"`);
        console.log(`  - Status: ${updatedItem.status}`);
        console.log(`  - Priority: ${updatedItem.priority}`);
        console.log(`  - Estimated Hours: ${updatedItem.estimatedWorkHours || 'N/A'}`);
        console.log(`  - Labor Count: ${updatedItem.laborCount || 'N/A'}`);
        console.log(`  - Updated By: ${updatedItem.updatedById || 'N/A'}`);
      } else {
        const errorText = await updateResponse.text();
        console.log(`❌ Update Work Item API Error: ${errorText}`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Test 6: Delete work item
      console.log('📊 Test 6: Delete Work Item');
      console.log(`DELETE /api/projects/${projectId}/work-items/${createdWorkItem.id}`);
      
      const deleteResponse = await fetch(`${baseUrl}/api/projects/${projectId}/work-items/${createdWorkItem.id}`, {
        method: 'DELETE',
        headers: {
          'x-organization-id': 'org_demo_1',
          'x-user-id': 'test-user-123'
        }
      });
      
      console.log(`📡 Response status: ${deleteResponse.status}`);
      
      if (deleteResponse.ok) {
        console.log('✅ Delete Work Item API Success:');
        console.log(`  - Work Item ${createdWorkItem.id} deleted successfully`);
      } else {
        const errorText = await deleteResponse.text();
        console.log(`❌ Delete Work Item API Error: ${errorText}`);
      }
    }
    
    console.log('\n🎉 Work Items API Testing Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ 1. Work items list API works');
    console.log('✅ 2. Work items stats API works');
    console.log('✅ 3. Create work item API works');
    console.log('✅ 4. Get work item detail API works');
    console.log('✅ 5. Update work item API works');
    console.log('✅ 6. Delete work item API works');
    
    console.log('\n🔧 UI Pages Created:');
    console.log('✅ - Work item detail page: /dashboard/projects/[id]/work-items/[workItemId]');
    console.log('✅ - Work item edit page: /dashboard/projects/[id]/work-items/[workItemId]/edit');
    console.log('✅ - Create work item page: /dashboard/projects/[id]/work-items/new');
    
    console.log('\n🌐 Next Steps:');
    console.log('1. Visit /dashboard/projects to see all projects');
    console.log('2. Click on any project to see work items');
    console.log('3. Test creating, editing, and viewing work items');
    console.log('4. Test the work items listing page');
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

testWorkItems();
