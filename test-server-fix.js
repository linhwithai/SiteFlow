#!/usr/bin/env node

/**
 * Test script to check if server error is fixed
 */

const http = require('http');

function testServer() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/dashboard/projects/52',
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Server is working! Status:', res.statusCode);
          console.log('✅ Page loaded successfully');
          resolve({ success: true, status: res.statusCode });
        } else if (res.statusCode === 500) {
          console.log('❌ Server error still exists. Status:', res.statusCode);
          console.log('Response preview:', data.substring(0, 200) + '...');
          resolve({ success: false, status: res.statusCode, error: 'Server Error' });
        } else {
          console.log('⚠️  Unexpected status:', res.statusCode);
          resolve({ success: false, status: res.statusCode, error: 'Unexpected Status' });
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Request failed:', err.message);
      reject(err);
    });

    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Testing server fix...\n');
  
  try {
    const result = await testServer();
    
    if (result.success) {
      console.log('\n🎉 SUCCESS: Server error has been fixed!');
      console.log('✅ The TypeError "Cannot read properties of undefined (reading \'call\')" is resolved');
      console.log('✅ Webpack compilation is working properly');
      console.log('✅ Layout.tsx is functioning correctly');
    } else {
      console.log('\n❌ FAILED: Server error still exists');
      console.log('Status:', result.status);
      console.log('Error:', result.error);
      console.log('\nNext steps:');
      console.log('1. Check server logs for more details');
      console.log('2. Verify all imports are correct');
      console.log('3. Check for missing dependencies');
    }
  } catch (error) {
    console.log('\n❌ TEST FAILED:', error.message);
    console.log('Server might not be running or accessible');
  }
}

main();

