const testDBConnection = async () => {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test projects listing API
    const response = await fetch('http://localhost:3000/api/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📡 Projects API status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Projects found:', data.data?.projects?.length || 0);
      console.log('📋 First few projects:', data.data?.projects?.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
    } else {
      const errorText = await response.text();
      console.error('❌ Projects API error:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

testDBConnection();



