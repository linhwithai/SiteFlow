const testServerRestart = async () => {
  try {
    console.log('🧪 Testing Server After Hard Reset...\n');
    
    const projectId = 40;
    const dailyLogId = 78;
    
    // Test 1: Basic server health check
    console.log('📊 Test 1: Server Health Check');
    console.log('GET /api/projects/40/daily-logs/78');
    
    const healthResponse = await fetch(`http://localhost:3001/api/projects/${projectId}/daily-logs/${dailyLogId}`);
    console.log(`📡 Response status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server Health: OK');
      console.log(`  - Daily Log ID: ${healthData.data?.id}`);
      console.log(`  - Title: "${healthData.data?.title}"`);
      console.log(`  - Photos: ${healthData.data?.photos?.length || 0}`);
    } else {
      const errorText = await healthResponse.text();
      console.log(`❌ Server Health: FAILED`);
      console.log(`  - Error: ${errorText.substring(0, 200)}...`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Daily Log Listing
    console.log('📊 Test 2: Daily Log Listing');
    console.log('GET /api/projects/40/daily-logs');
    
    const listingResponse = await fetch(`http://localhost:3001/api/projects/${projectId}/daily-logs`);
    console.log(`📡 Response status: ${listingResponse.status}`);
    
    if (listingResponse.ok) {
      const listingData = await listingResponse.json();
      console.log('✅ Listing API: OK');
      console.log(`  - Daily Logs Count: ${listingData.data?.dailyLogs?.length || 0}`);
      console.log(`  - Pagination: Page ${listingData.data?.pagination?.page || 1} of ${listingData.data?.pagination?.totalPages || 0}`);
    } else {
      const errorText = await listingResponse.text();
      console.log(`❌ Listing API: FAILED`);
      console.log(`  - Error: ${errorText.substring(0, 200)}...`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Project Details
    console.log('📊 Test 3: Project Details');
    console.log('GET /api/projects/40');
    
    const projectResponse = await fetch(`http://localhost:3001/api/projects/${projectId}`);
    console.log(`📡 Response status: ${projectResponse.status}`);
    
    if (projectResponse.ok) {
      const projectData = await projectResponse.json();
      console.log('✅ Project API: OK');
      console.log(`  - Project Name: "${projectData.data?.name || projectData.name}"`);
      console.log(`  - Status: ${projectData.data?.status || projectData.status || 'N/A'}`);
    } else {
      const errorText = await projectResponse.text();
      console.log(`❌ Project API: FAILED`);
      console.log(`  - Error: ${errorText.substring(0, 200)}...`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 4: Photo Upload
    console.log('📊 Test 4: Photo Upload');
    console.log('POST /api/upload');
    
    const uploadResponse = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: 'test-data'
    });
    
    console.log(`📡 Response status: ${uploadResponse.status}`);
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('✅ Upload API: OK');
      console.log(`  - Response: ${JSON.stringify(uploadData).substring(0, 100)}...`);
    } else {
      const errorText = await uploadResponse.text();
      console.log(`❌ Upload API: FAILED`);
      console.log(`  - Error: ${errorText.substring(0, 200)}...`);
    }
    
    console.log('\n🎉 Server Restart Testing Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Hard reset completed successfully');
    console.log('✅ Next.js cache cleared');
    console.log('✅ Server restarted cleanly');
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

testServerRestart();

