// Simple test script using built-in Node.js modules
const http = require('http');

const testData = JSON.stringify({
  title: "Test Daily Log API",
  logDate: "2024-01-15",
  weather: "Sunny",
  temperature: 25,
  workDescription: "Testing API creation with proper data",
  workHours: 8,
  workersCount: 5,
  issues: "No issues during testing",
  notes: "API test notes"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/projects/36/daily-logs',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('🧪 Testing Daily Log Creation API...\n');
console.log('📤 Sending POST request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('📋 Request data:', testData);

const req = http.request(options, (res) => {
  console.log('\n📊 Response Status:', res.statusCode);
  console.log('📊 Response Headers:', res.headers);

  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('📊 Response Body:', responseBody);
    
    if (res.statusCode === 201) {
      console.log('\n✅ SUCCESS: Daily log created successfully!');
      try {
        const result = JSON.parse(responseBody);
        console.log('   - Daily Log ID:', result.id);
        console.log('   - Title:', result.logTitle);
        console.log('   - Date:', result.constructionDate);
      } catch (e) {
        console.log('   - Could not parse response JSON');
      }
    } else {
      console.log('\n❌ ERROR: Failed to create daily log');
      console.log('   - Status:', res.statusCode);
      console.log('   - Error:', responseBody);
    }
  });
});

req.on('error', (error) => {
  console.log('\n💥 EXCEPTION: Network error');
  console.log('   - Error:', error.message);
});

req.write(testData);
req.end();







