const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function debugMiddleware() {
  console.log('🔍 Debugging Middleware for Mood Tracking...\n');

  try {
    // Test 1: Check mood tracking endpoint
    console.log('📊 Test 1: Testing mood tracking endpoint...');
    
    const response = await axios.get(`${BASE_URL}/mobile/mood_tracking`, {
      params: { user_id: 1, limit: 5 },
      timeout: 5000
    });
    
    console.log(`✅ Response Status: ${response.status}`);
    console.log(`📊 Rate Limit Headers:`);
    console.log(`   - X-RateLimit-Limit: ${response.headers['x-ratelimit-limit']}`);
    console.log(`   - X-RateLimit-Remaining: ${response.headers['x-ratelimit-remaining']}`);
    console.log(`   - X-RateLimit-Reset: ${response.headers['x-ratelimit-reset']}`);
    
    // Test 2: Check tracking endpoint for comparison
    console.log('\n📊 Test 2: Testing tracking endpoint for comparison...');
    
    const trackingResponse = await axios.get(`${BASE_URL}/mobile/tracking/today-summary`, {
      params: { user_id: 1 },
      timeout: 5000
    });
    
    console.log(`✅ Tracking Response Status: ${trackingResponse.status}`);
    console.log(`📊 Tracking Rate Limit Headers:`);
    console.log(`   - X-RateLimit-Limit: ${trackingResponse.headers['x-ratelimit-limit']}`);
    console.log(`   - X-RateLimit-Remaining: ${trackingResponse.headers['x-ratelimit-remaining']}`);
    
    // Test 3: Check wellness endpoint
    console.log('\n📊 Test 3: Testing wellness endpoint...');
    
    const wellnessResponse = await axios.get(`${BASE_URL}/mobile/wellness/activities/public`, {
      timeout: 5000
    });
    
    console.log(`✅ Wellness Response Status: ${wellnessResponse.status}`);
    console.log(`📊 Wellness Rate Limit Headers:`);
    console.log(`   - X-RateLimit-Limit: ${wellnessResponse.headers['x-ratelimit-limit']}`);
    console.log(`   - X-RateLimit-Remaining: ${wellnessResponse.headers['x-ratelimit-remaining']}`);
    
    console.log('\n🎯 Analysis:');
    console.log('- Mood tracking should use tracking rate limit (1000)');
    console.log('- Tracking endpoint should use tracking rate limit (1000)');
    console.log('- Wellness endpoint should use tracking rate limit (1000)');
    
    if (response.headers['x-ratelimit-limit'] === '1000') {
      console.log('✅ Mood tracking is using TRACKING rate limit');
    } else {
      console.log('❌ Mood tracking is NOT using TRACKING rate limit');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

// Run the debug
debugMiddleware();
