#!/usr/bin/env node

/**
 * Test script for Project Listing API
 * Tests the GET /api/projects endpoint
 */

const API_BASE_URL = 'http://localhost:3000';

async function testProjectListing() {
  console.log('🔍 Testing Project Listing API...\n');
  
  try {
    // Test 1: Basic project listing
    console.log('📋 Test 1: Basic project listing...');
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body (raw):');
    console.log(responseText);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('Response data (parsed):');
      console.log(JSON.stringify(responseData, null, 2));
      
      if (response.ok) {
        console.log('✅ Project listing successful!');
        console.log('Number of projects:', responseData.data?.projects?.length || 0);
      } else {
        console.log('❌ Project listing failed!');
      }
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Error stack:', error.stack);
  }
}

async function testProjectListingWithParams() {
  console.log('\n🔍 Testing Project Listing with Parameters...\n');
  
  try {
    // Test with pagination parameters
    const params = new URLSearchParams({
      page: '1',
      limit: '10',
      search: 'test'
    });
    
    console.log('📋 Test 2: Project listing with parameters...');
    console.log('URL:', `${API_BASE_URL}/api/projects?${params.toString()}`);
    
    const response = await fetch(`${API_BASE_URL}/api/projects?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0'
      }
    });
    
    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Project listing with parameters successful!');
    } else {
      console.log('❌ Project listing with parameters failed!');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

async function testProjectStats() {
  console.log('\n📊 Testing Project Stats API...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0'
      }
    });
    
    console.log('Stats response status:', response.status);
    const statsData = await response.json();
    console.log('Stats response data:', JSON.stringify(statsData, null, 2));
    
    if (response.ok) {
      console.log('✅ Project stats successful!');
    } else {
      console.log('❌ Project stats failed!');
    }
    
  } catch (error) {
    console.error('❌ Stats test failed:', error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🧪 Project Listing API Test Suite');
  console.log('==================================\n');
  
  await testProjectListing();
  await testProjectListingWithParams();
  await testProjectStats();
  
  console.log('\n🏁 All tests completed!');
}

// Run tests
runAllTests().catch(console.error);



