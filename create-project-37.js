const createProject37 = async () => {
  try {
    console.log('🧪 Creating project with ID 37...');
    
    const projectData = {
      name: 'Project 37 - Test Construction',
      workItemDescription: 'Test project for debugging daily logs',
      address: '123 Construction Street',
      city: 'Test City',
      province: 'Test Province',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      budget: 2000000,
      status: 'IN_PROGRESS',
      isActive: true
    };
    
    console.log('📤 Creating project with data:', projectData);
    
    const response = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData)
    });
    
    console.log('📡 Response status:', response.status);
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Project created with ID:', data.id);
      
      // Now test the specific project API
      console.log('🧪 Testing project API for ID:', data.id);
      const getResponse = await fetch(`http://localhost:3000/api/projects/${data.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 GET Response status:', getResponse.status);
      const getResponseText = await getResponse.text();
      console.log('📄 GET Response body:', getResponseText);
      
    } else {
      console.error('❌ Error creating project:', responseText);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

createProject37();



