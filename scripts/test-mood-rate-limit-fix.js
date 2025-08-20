const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMoodRateLimitFix() {
  console.log('🧪 Testing Mood Tracking Rate Limit Fix...\n');

  try {
    // Test 1: Check if mood tracking endpoints are now categorized as 'tracking'
    console.log('📊 Test 1: Making multiple requests to mood tracking endpoint...');
    
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(
        axios.get(`${BASE_URL}/mobile/mood_tracking`, {
          params: { user_id: 1, limit: 5 },
          timeout: 5000
        })
          .then(response => ({ 
            success: true, 
            index: i, 
            status: response.status,
            rateLimitRemaining: response.headers['x-ratelimit-remaining'],
            rateLimitLimit: response.headers['x-ratelimit-limit']
          }))
          .catch(error => ({ 
            success: false, 
            index: i, 
            error: error.response?.data || error.message,
            status: error.response?.status,
            rateLimitRemaining: error.response?.headers?.['x-ratelimit-remaining'],
            rateLimitLimit: error.response?.headers?.['x-ratelimit-limit']
          }))
      );
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Successful requests: ${successful}`);
    console.log(`❌ Failed requests: ${failed}`);

    // Check rate limit headers from successful requests
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
      const firstResult = successfulResults[0];
      console.log(`📊 Rate Limit Info:`);
      console.log(`   - Limit: ${firstResult.rateLimitLimit}`);
      console.log(`   - Remaining: ${firstResult.rateLimitRemaining}`);
      
      // Check if it's using tracking rate limit (1000) instead of default (500)
      if (firstResult.rateLimitLimit === '1000') {
        console.log('✅ Mood tracking is now using TRACKING rate limit (1000 requests per 15 minutes)');
      } else if (firstResult.rateLimitLimit === '500') {
        console.log('❌ Mood tracking is still using DEFAULT rate limit (500 requests per 15 minutes)');
      } else {
        console.log(`⚠️ Unknown rate limit: ${firstResult.rateLimitLimit}`);
      }
    }

    if (failed > 0) {
      console.log('\n⚠️ Some requests failed. This might indicate rate limiting is still too restrictive.');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   Request ${r.index}: Status ${r.status} - ${r.error.message || r.error}`);
        if (r.rateLimitLimit) {
          console.log(`   Rate Limit: ${r.rateLimitLimit}, Remaining: ${r.rateLimitRemaining}`);
        }
      });
    } else {
      console.log('✅ All requests succeeded. Rate limiting appears to be working correctly.');
    }

    // Test 2: Check wellness endpoints
    console.log('\n📊 Test 2: Testing wellness endpoints...');
    
    const wellnessResponse = await axios.get(`${BASE_URL}/mobile/wellness/activities/public`, {
      timeout: 5000
    });
    
    console.log(`✅ Wellness endpoint response: ${wellnessResponse.status}`);
    console.log(`📊 Wellness Rate Limit: ${wellnessResponse.headers['x-ratelimit-limit']}`);
    console.log(`📊 Wellness Remaining: ${wellnessResponse.headers['x-ratelimit-remaining']}`);

    // Test 3: Clear rate limits for development
    console.log('\n🧹 Test 3: Clearing rate limits for development...');
    
    try {
      await axios.get(`${BASE_URL}/clear-rate-limit`);
      console.log('✅ Rate limits cleared successfully');
    } catch (error) {
      console.log('⚠️ Could not clear rate limits (this is normal in production)');
    }

    console.log('\n🎯 Summary:');
    console.log('- Mood tracking endpoints should now use 1000 requests per 15 minutes');
    console.log('- Wellness endpoints should also use 1000 requests per 15 minutes');
    console.log('- This should resolve the "Too many requests" errors for mood tracking');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMoodRateLimitFix();
