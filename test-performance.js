#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests API response times and identifies bottlenecks
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_PROJECT_ID = 52; // Use existing project ID

// Test configurations
const TESTS = [
  {
    name: 'Projects List',
    url: '/api/projects',
    method: 'GET'
  },
  {
    name: 'Project Stats',
    url: '/api/projects/stats',
    method: 'GET'
  },
  {
    name: 'Project Detail',
    url: `/api/projects/${TEST_PROJECT_ID}`,
    method: 'GET'
  },
  {
    name: 'Work Items',
    url: `/api/projects/${TEST_PROJECT_ID}/work-items?page=1&limit=10`,
    method: 'GET'
  },
  {
    name: 'Work Items Stats',
    url: `/api/projects/${TEST_PROJECT_ID}/work-items/stats`,
    method: 'GET'
  },
  {
    name: 'Daily Logs',
    url: `/api/projects/${TEST_PROJECT_ID}/daily-logs?page=1&limit=10`,
    method: 'GET'
  },
  {
    name: 'Daily Logs Stats',
    url: `/api/projects/${TEST_PROJECT_ID}/daily-logs/stats`,
    method: 'GET'
  },
  {
    name: 'Photos',
    url: `/api/projects/${TEST_PROJECT_ID}/photos`,
    method: 'GET'
  },
  {
    name: 'Activities',
    url: `/api/projects/${TEST_PROJECT_ID}/activities`,
    method: 'GET'
  }
];

// Performance test results
const results = [];

// Helper function to make HTTP request
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const request = http.request(`${BASE_URL}${url}`, { method }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          statusCode: response.statusCode,
          responseTime,
          dataSize: data.length,
          success: response.statusCode >= 200 && response.statusCode < 300
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
    
    request.end();
  });
}

// Run single test
async function runTest(test) {
  console.log(`Testing ${test.name}...`);
  
  try {
    const result = await makeRequest(test.url, test.method);
    results.push({
      ...test,
      ...result,
      timestamp: new Date().toISOString()
    });
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${result.responseTime}ms (${result.statusCode})`);
    
  } catch (error) {
    console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    results.push({
      ...test,
      success: false,
      error: error.message,
      responseTime: 0,
      timestamp: new Date().toISOString()
    });
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Performance Tests...\n');
  
  // Sequential tests
  console.log('📊 Sequential API Calls:');
  for (const test of TESTS) {
    await runTest(test);
  }
  
  console.log('\n⚡ Parallel API Calls:');
  const parallelStartTime = Date.now();
  
  try {
    const parallelResults = await Promise.all(
      TESTS.map(test => makeRequest(test.url, test.method))
    );
    
    const parallelEndTime = Date.now();
    const parallelTotalTime = parallelEndTime - parallelStartTime;
    
    console.log(`✅ Parallel execution completed in ${parallelTotalTime}ms`);
    
    // Add parallel results
    TESTS.forEach((test, index) => {
      const result = parallelResults[index];
      results.push({
        ...test,
        ...result,
        parallel: true,
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.log(`❌ Parallel execution failed: ${error.message}`);
  }
  
  // Generate report
  generateReport();
}

// Generate performance report
function generateReport() {
  console.log('\n📈 Performance Report');
  console.log('='.repeat(50));
  
  // Group results by test name
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.name]) {
      acc[result.name] = [];
    }
    acc[result.name].push(result);
    return acc;
  }, {});
  
  // Calculate statistics
  Object.entries(groupedResults).forEach(([testName, testResults]) => {
    const sequential = testResults.find(r => !r.parallel);
    const parallel = testResults.find(r => r.parallel);
    
    console.log(`\n🔍 ${testName}:`);
    console.log(`  Sequential: ${sequential ? `${sequential.responseTime}ms` : 'N/A'}`);
    console.log(`  Parallel:   ${parallel ? `${parallel.responseTime}ms` : 'N/A'}`);
    
    if (sequential && parallel) {
      const improvement = ((sequential.responseTime - parallel.responseTime) / sequential.responseTime * 100).toFixed(1);
      console.log(`  Improvement: ${improvement}%`);
    }
  });
  
  // Calculate total time
  const sequentialTotal = results
    .filter(r => !r.parallel)
    .reduce((sum, r) => sum + r.responseTime, 0);
  
  const parallelTotal = results
    .filter(r => r.parallel)
    .reduce((sum, r) => sum + r.responseTime, 0);
  
  console.log(`\n⏱️  Total Time:`);
  console.log(`  Sequential: ${sequentialTotal}ms`);
  console.log(`  Parallel:   ${parallelTotal}ms`);
  console.log(`  Improvement: ${((sequentialTotal - parallelTotal) / sequentialTotal * 100).toFixed(1)}%`);
  
  // Identify slow endpoints
  console.log(`\n🐌 Slow Endpoints (>1000ms):`);
  const slowEndpoints = results
    .filter(r => !r.parallel && r.responseTime > 1000)
    .sort((a, b) => b.responseTime - a.responseTime);
  
  if (slowEndpoints.length > 0) {
    slowEndpoints.forEach(endpoint => {
      console.log(`  ${endpoint.name}: ${endpoint.responseTime}ms`);
    });
  } else {
    console.log('  None found! 🎉');
  }
  
  // Identify failed requests
  console.log(`\n❌ Failed Requests:`);
  const failedRequests = results.filter(r => !r.success);
  
  if (failedRequests.length > 0) {
    failedRequests.forEach(request => {
      console.log(`  ${request.name}: ${request.error || 'Unknown error'}`);
    });
  } else {
    console.log('  None found! 🎉');
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  
  if (sequentialTotal > 5000) {
    console.log('  - Implement parallel API calls to reduce total load time');
  }
  
  if (slowEndpoints.length > 0) {
    console.log('  - Optimize slow endpoints with database indexes');
    console.log('  - Implement caching for frequently accessed data');
  }
  
  if (results.some(r => r.dataSize > 100000)) {
    console.log('  - Consider pagination for large data sets');
    console.log('  - Implement data compression');
  }
  
  console.log('  - Add request deduplication to prevent duplicate calls');
  console.log('  - Implement client-side caching with SWR or React Query');
  console.log('  - Use database connection pooling');
  console.log('  - Add materialized views for complex queries');
  
  console.log('\n✨ Performance test completed!');
}

// Run the tests
runAllTests().catch(console.error);

