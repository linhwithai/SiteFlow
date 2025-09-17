#!/usr/bin/env node

/**
 * Simple test for Daily Log Creation API
 * Tests with minimal data to debug the issue
 */

const API_BASE_URL = 'http://localhost:3000';

// Minimal test data
const testProjectId = 36;
const minimalData = {
  title: 'Simple Test',
  logDate: '2024-01-15',
  workDescription: 'Simple test description'
};

async function testMinimalDailyLogCreation() {
  console.log('🧪 Testing minimal daily log creation...\n');
  
  try {
    console.log('Request data:', JSON.stringify(minimalData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/daily-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Minimal daily log created successfully!');
    } else {
      console.log('❌ Minimal daily log creation failed!');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test with different project ID
async function testWithDifferentProject() {
  console.log('\n🧪 Testing with different project ID...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/1/daily-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalData)
    });
    
    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test project existence
async function testProjectExists() {
  console.log('\n🧪 Testing if project exists...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}`);
    console.log('Project response status:', response.status);
    
    if (response.ok) {
      const projectData = await response.json();
      console.log('Project data:', JSON.stringify(projectData, null, 2));
    } else {
      const errorData = await response.json();
      console.log('Project error:', JSON.stringify(errorData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Project test failed with error:', error.message);
  }
}

// Run all tests
async function runTests() {
  await testProjectExists();
  await testMinimalDailyLogCreation();
  await testWithDifferentProject();
}

runTests().catch(console.error);



