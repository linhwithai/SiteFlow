// Test script to test daily log creation API
const fetch = require('node-fetch');

async function testDailyLogCreation() {
  console.log('🧪 Testing Daily Log Creation API...\n');

  const projectId = 36;
  const apiUrl = `http://localhost:3000/api/projects/${projectId}/daily-logs`;

  const testData = {
    title: 'Test Daily Log API',
    logDate: '2024-01-15', // YYYY-MM-DD format
    weather: 'Sunny',
    temperature: 25,
    workDescription: 'Testing API creation with proper data',
    workHours: 8,
    workersCount: 5,
    issues: 'No issues during testing',
    notes: 'API test notes'
  };

  console.log('✅ Test 1: API Request Data');
  console.log('   - Project ID:', projectId);
  console.log('   - API URL:', apiUrl);
  console.log('   - Test Data:', JSON.stringify(testData, null, 2));

  try {
    console.log('\n📤 Sending POST request...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📊 Response Body:', responseText);

    if (response.ok) {
      console.log('\n✅ SUCCESS: Daily log created successfully!');
      const result = JSON.parse(responseText);
      console.log('   - Daily Log ID:', result.id);
      console.log('   - Title:', result.logTitle);
      console.log('   - Date:', result.constructionDate);
    } else {
      console.log('\n❌ ERROR: Failed to create daily log');
      console.log('   - Status:', response.status);
      console.log('   - Error:', responseText);
    }

  } catch (error) {
    console.log('\n💥 EXCEPTION: Network or parsing error');
    console.log('   - Error:', error.message);
    console.log('   - Stack:', error.stack);
  }
}

// Run the test
testDailyLogCreation().catch(console.error);






