#!/usr/bin/env node

/**
 * Test script for Daily Log Photo Upload API
 * Tests the POST /api/projects/[id]/daily-logs/[dailyLogId]/photos endpoint
 */

const API_BASE_URL = 'http://localhost:3000';

async function testDailyLogPhotoUpload() {
  console.log('🔍 Testing Daily Log Photo Upload API...\n');
  
  try {
    // First, create a daily log
    console.log('📋 Step 1: Creating a daily log...');
    const dailyLogResponse = await fetch(`${API_BASE_URL}/api/projects/37/daily-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 37,
        title: 'Test Daily Log for Photo Upload',
        logDate: new Date().toISOString(),
        workHours: 8,
        workersCount: 5,
        weather: 'sunny',
        temperature: 25,
        workDescription: 'Testing photo upload',
        notes: 'This is a test daily log',
        photos: []
      })
    });
    
    if (!dailyLogResponse.ok) {
      const error = await dailyLogResponse.json();
      console.log('❌ Failed to create daily log:', error);
      return;
    }
    
    const dailyLog = await dailyLogResponse.json();
    console.log('✅ Daily log created:', dailyLog);
    console.log('Daily log ID:', dailyLog.data.id);
    
    // Now test photo upload
    console.log('\n📸 Step 2: Testing photo upload...');
    const photoResponse = await fetch(`${API_BASE_URL}/api/projects/37/daily-logs/${dailyLog.data.id}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'test-photo-123',
        originalName: 'test-photo.jpg',
        fileUrl: 'https://example.com/test-photo.jpg',
        thumbnailUrl: 'https://example.com/test-photo-thumb.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
        caption: 'Test photo caption',
        tags: ['test', 'photo']
      })
    });
    
    console.log('Photo upload response status:', photoResponse.status);
    
    if (!photoResponse.ok) {
      const error = await photoResponse.json();
      console.log('❌ Photo upload failed:', error);
      return;
    }
    
    const photo = await photoResponse.json();
    console.log('✅ Photo uploaded successfully:', photo);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run test
testDailyLogPhotoUpload().catch(console.error);
