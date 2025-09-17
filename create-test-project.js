const createTestProject = async () => {
  try {
    console.log('🧪 Creating test project...');
    
    const projectData = {
      name: 'Test Project 37',
      workItemDescription: 'Test project for debugging',
      address: '123 Test Street',
      city: 'Test City',
      province: 'Test Province',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      budget: 1000000,
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
      console.log('✅ Project created:', data);
      return data.data?.id || data.id;
    } else {
      console.error('❌ Error creating project:', responseText);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

createTestProject();



