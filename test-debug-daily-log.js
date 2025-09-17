#!/usr/bin/env node

/**
 * Debug test for Daily Log Creation API
 * Tests with detailed logging to find the exact issue
 */

const API_BASE_URL = 'http://localhost:3000';

// Test data with all required fields
const testData = {
  title: 'Debug Test',
  logDate: '2024-01-15',
  workDescription: 'Debug test description',
  workHours: 8,
  workersCount: 2,
  weather: 'Sunny',
  temperature: 25,
  issues: 'No issues',
  notes: 'Debug test notes'
};

async function debugDailyLogCreation() {
  console.log('🔍 Debugging daily log creation...\n');
  
  try {
    console.log('📤 Sending request to:', `${API_BASE_URL}/api/projects/36/daily-logs`);
    console.log('📤 Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/projects/36/daily-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Test/1.0'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('\n📥 Response received:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\n📥 Response body (raw):');
    console.log(responseText);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('\n📥 Response data (parsed):');
      console.log(JSON.stringify(responseData, null, 2));
    } catch (parseError) {
      console.log('\n❌ Failed to parse response as JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Test database connection
async function testDatabaseConnection() {
  console.log('\n🔍 Testing database connection...\n');
  
  try {
    // Test a simple GET request to see if the API is working
    const response = await fetch(`${API_BASE_URL}/api/projects/36/daily-logs`);
    console.log('GET response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connection working - got', data.data?.dailyLogs?.length || 0, 'daily logs');
    } else {
      console.log('❌ Database connection issue - GET failed');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

// Run debug tests
async function runDebugTests() {
  await testDatabaseConnection();
  await debugDailyLogCreation();
}

runDebugTests().catch(console.error);



