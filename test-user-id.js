#!/usr/bin/env node

/**
 * Test to check if user ID extraction is working
 */

const API_BASE_URL = 'http://localhost:3000';

async function testUserIdExtraction() {
  console.log('🔍 Testing user ID extraction...\n');
  
  try {
    // Test with a simple request to see what headers are sent
    const response = await fetch(`${API_BASE_URL}/api/projects/36/daily-logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0',
        'X-User-ID': 'test-user-123', // Try to send user ID in header
        'X-Organization-ID': 'org_demo_1' // Try to send org ID in header
      }
    });
    
    console.log('GET response status:', response.status);
    const data = await response.json();
    console.log('GET response data:', JSON.stringify(data, null, 2));
    
    // Now test POST with headers
    console.log('\n🧪 Testing POST with custom headers...');
    const postResponse = await fetch(`${API_BASE_URL}/api/projects/36/daily-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0',
        'X-User-ID': 'test-user-123',
        'X-Organization-ID': 'org_demo_1'
      },
      body: JSON.stringify({
        title: 'Test with Headers',
        logDate: '2024-01-15',
        workDescription: 'Test with custom headers',
        workHours: 8,
        workersCount: 2
      })
    });
    
    console.log('POST response status:', postResponse.status);
    const postData = await postResponse.json();
    console.log('POST response data:', JSON.stringify(postData, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserIdExtraction().catch(console.error);



