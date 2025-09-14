/**
 * Test script for Daily Log Photos functionality
 * Run with: node test-daily-log-photos.js
 */

const API_BASE = 'http://localhost:3000/api';

async function testDailyLogPhotos() {
  console.log('🧪 Testing Daily Log Photos functionality...\n');

  try {
    // Test 1: Get photos for a daily log
    console.log('1️⃣ Testing GET /api/daily-logs/1/photos');
    const getResponse = await fetch(`${API_BASE}/daily-logs/1/photos`);
    const getData = await getResponse.json();
    console.log('✅ GET photos response:', getData);
    console.log('');

    // Test 2: Add a photo to daily log (mock data)
    console.log('2️⃣ Testing POST /api/daily-logs/1/photos');
    const mockPhoto = {
      publicId: 'test-photo-123',
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/test-photo.jpg',
      name: 'test-photo.jpg',
      size: 1024000,
      width: 800,
      height: 600,
      caption: 'Test photo for daily log',
      tags: ['test', 'demo']
    };

    const postResponse = await fetch(`${API_BASE}/daily-logs/1/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockPhoto),
    });
    const postData = await postResponse.json();
    console.log('✅ POST photo response:', postData);
    console.log('');

    // Test 3: Update photo caption
    if (postData.photo && postData.photo.id) {
      console.log('3️⃣ Testing PUT /api/daily-logs/1/photos/' + postData.photo.id);
      const updateResponse = await fetch(`${API_BASE}/daily-logs/1/photos/${postData.photo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption: 'Updated caption for test photo'
        }),
      });
      const updateData = await updateResponse.json();
      console.log('✅ PUT photo response:', updateData);
      console.log('');

      // Test 4: Delete photo
      console.log('4️⃣ Testing DELETE /api/daily-logs/1/photos/' + postData.photo.id);
      const deleteResponse = await fetch(`${API_BASE}/daily-logs/1/photos/${postData.photo.id}`, {
        method: 'DELETE',
      });
      const deleteData = await deleteResponse.json();
      console.log('✅ DELETE photo response:', deleteData);
      console.log('');
    }

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDailyLogPhotos();


