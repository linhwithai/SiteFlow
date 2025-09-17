#!/usr/bin/env node

/**
 * Test script for Daily Log Creation with Photos
 * Tests the POST /api/projects/{id}/daily-logs endpoint with photo upload
 */

const API_BASE_URL = 'http://localhost:3000';

// Test data with photos
const testProjectId = 36;
const testDailyLogData = {
  projectId: testProjectId,
  title: 'Daily Log with Photos Test',
  logDate: '2024-01-15',
  weather: 'Sunny',
  temperature: 25,
  workDescription: 'Test daily log creation with photos via API',
  workHours: 8,
  workersCount: 5,
  issues: 'No issues reported',
  notes: 'This is a test daily log with photos created via API',
  photos: [
    {
      fileName: 'test-photo-1.jpg',
      originalName: 'construction-site-1.jpg',
      fileUrl: 'https://res.cloudinary.com/dy44qfit2/image/upload/v1758013600/projects/jmap937pemxhlbsj4mhy.jpg',
      thumbnailUrl: 'https://res.cloudinary.com/dy44qfit2/image/upload/w_300,h_300,c_fill/v1758013600/projects/jmap937pemxhlbsj4mhy.jpg',
      fileSize: 3986651,
      mimeType: 'image/jpeg',
      caption: 'Construction site overview',
      tags: ['construction', 'site', 'overview']
    },
    {
      fileName: 'test-photo-2.jpg',
      originalName: 'construction-detail-1.jpg',
      fileUrl: 'https://res.cloudinary.com/dy44qfit2/image/upload/v1758013635/daily-logs/hi7ezxbg2ksi3h0hr17y.jpg',
      thumbnailUrl: 'https://res.cloudinary.com/dy44qfit2/image/upload/w_300,h_300,c_fill/v1758013635/daily-logs/hi7ezxbg2ksi3h0hr17y.jpg',
      fileSize: 4435634,
      mimeType: 'image/jpeg',
      caption: 'Construction detail work',
      tags: ['construction', 'detail', 'work']
    }
  ]
};

async function testDailyLogWithPhotos() {
  console.log('🚀 Testing Daily Log Creation with Photos...\n');
  
  try {
    // Test 1: Create daily log with photos
    console.log('📝 Test 1: Creating daily log with photos...');
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
      console.log('✅ Daily log with photos created successfully!');
      console.log('Created daily log ID:', responseData.data?.id);
      
      // Test 2: Verify creation by fetching the created log
      if (responseData.data?.id) {
        console.log('\n📋 Test 2: Verifying created daily log with photos...');
        const verifyResponse = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/daily-logs/${responseData.data.id}`);
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Daily log verification successful!');
          console.log('Verified data:', JSON.stringify(verifyData, null, 2));
          
          // Check if photos were saved
          if (verifyData.data?.photos && verifyData.data.photos.length > 0) {
            console.log('✅ Photos were saved successfully!');
            console.log('Number of photos:', verifyData.data.photos.length);
            verifyData.data.photos.forEach((photo, index) => {
              console.log(`Photo ${index + 1}:`, {
                id: photo.id,
                fileName: photo.fileName,
                caption: photo.caption,
                tags: photo.tags
              });
            });
          } else {
            console.log('❌ No photos found in the created daily log');
          }
        } else {
          console.log('❌ Daily log verification failed!');
          console.log('Verification error:', await verifyResponse.text());
        }
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

async function testPhotoUploadAPI() {
  console.log('\n📸 Testing Photo Upload API...\n');
  
  try {
    // Test photo upload endpoint
    const photoData = {
      fileName: 'test-upload.jpg',
      originalName: 'construction-upload.jpg',
      fileUrl: 'https://res.cloudinary.com/dy44qfit2/image/upload/v1758013600/projects/jmap937pemxhlbsj4mhy.jpg',
      thumbnailUrl: 'https://res.cloudinary.com/dy44qfit2/image/upload/w_300,h_300,c_fill/v1758013600/projects/jmap937pemxhlbsj4mhy.jpg',
      fileSize: 3986651,
      mimeType: 'image/jpeg',
      caption: 'Test upload photo',
      tags: ['test', 'upload']
    };
    
    const response = await fetch(`${API_BASE_URL}/api/projects/${testProjectId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(photoData)
    });
    
    console.log('Photo upload response status:', response.status);
    const photoResponseData = await response.json();
    console.log('Photo upload response:', JSON.stringify(photoResponseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Photo upload successful!');
    } else {
      console.log('❌ Photo upload failed!');
    }
    
  } catch (error) {
    console.error('❌ Photo upload test failed:', error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🧪 Daily Log with Photos API Test Suite');
  console.log('========================================\n');
  
  await testDailyLogWithPhotos();
  await testPhotoUploadAPI();
  
  console.log('\n🏁 All tests completed!');
}

// Run tests
runAllTests().catch(console.error);



