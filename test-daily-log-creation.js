#!/usr/bin/env node

/**
 * Test script for Daily Log Creation API
 * Tests the POST /api/projects/{id}/daily-logs endpoint
 */

const API_BASE_URL = 'http://localhost:3000';

// Test data
const testProjectId = 36; // Replace with actual project ID
const testDailyLogData = {
  projectId: testProjectId,
  title: 'Test Daily Log Creation',
  logDate: '2024-01-15',
  weather: 'Sunny',
  temperature: 25,
  workDescription: 'Test daily log creation via API',
  workHours: 8,
  workersCount: 5, // Changed from laborCount to workersCount
  issues: 'No issues reported',
  notes: 'This is a test daily log created via API'
  // Removed equipmentUsed, materialsUsed, photos as they're not in schema
};

async function testDailyLogCreation() {
  console.log('🚀 Starting Daily Log Creation API Test...\n');
  
  try {
    // Test 1: Create daily log
    console.log('📝 Test 1: Creating daily log...');
    console.log('Request data:', JSON.stringify(testDailyLogData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/daily-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDailyLogData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Daily log created successfully!');
      console.log('Created daily log ID:', responseData.data?.id);
      
      // Test 2: Verify creation by fetching the created log
      if (responseData.data?.id) {
        console.log('\n📋 Test 2: Verifying created daily log...');
        const verifyResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/daily-logs/${responseData.data.id}`);
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Daily log verification successful!');
          console.log('Verified data:', JSON.stringify(verifyData, null, 2));
        } else {
          console.log('❌ Daily log verification failed!');
          console.log('Verification error:', await verifyResponse.text());
        }
      }
      
      // Test 3: Test with invalid data
      console.log('\n🧪 Test 3: Testing with invalid data...');
      const invalidData = {
        projectId: testProjectId,
        logDate: 'invalid-date', // Invalid date format
        workHours: -5, // Negative work hours
        laborCount: 'invalid' // Invalid type
      };
      
      const invalidResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/daily-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData)
      });
      
      console.log('Invalid request status:', invalidResponse.status);
      const invalidResponseData = await invalidResponse.json();
      console.log('Invalid request response:', JSON.stringify(invalidResponseData, null, 2));
      
      if (!invalidResponse.ok) {
        console.log('✅ Invalid data correctly rejected!');
      } else {
        console.log('❌ Invalid data was accepted (this should not happen)!');
      }
      
    } else {
      console.log('❌ Daily log creation failed!');
      console.log('Error details:', responseData);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Error stack:', error.stack);
  }
}

async function testDailyLogList() {
  console.log('\n📋 Testing Daily Log List API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/daily-logs`);
    
    console.log('List response status:', response.status);
    const listData = await response.json();
    console.log('List response data:', JSON.stringify(listData, null, 2));
    
    if (response.ok) {
      console.log('✅ Daily log list fetched successfully!');
      console.log('Total daily logs:', listData.data?.dailyLogs?.length || 0);
    } else {
      console.log('❌ Daily log list fetch failed!');
    }
    
  } catch (error) {
    console.error('❌ List test failed with error:', error.message);
  }
}

async function testDailyLogStats() {
  console.log('\n📊 Testing Daily Log Stats API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/daily-logs/stats`);
    
    console.log('Stats response status:', response.status);
    const statsData = await response.json();
    console.log('Stats response data:', JSON.stringify(statsData, null, 2));
    
    if (response.ok) {
      console.log('✅ Daily log stats fetched successfully!');
    } else {
      console.log('❌ Daily log stats fetch failed!');
    }
    
  } catch (error) {
    console.error('❌ Stats test failed with error:', error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🧪 Daily Log API Test Suite');
  console.log('============================\n');
  
  await testDailyLogCreation();
  await testDailyLogList();
  await testDailyLogStats();
  
  console.log('\n🏁 All tests completed!');
}

// Run tests
runAllTests().catch(console.error);
