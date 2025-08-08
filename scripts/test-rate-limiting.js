const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting Configuration...\n');

  try {
    // Test 1: Check if we can make multiple requests without hitting rate limit
    console.log('📊 Test 1: Making multiple requests to check rate limits...');
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.get(`${BASE_URL}/mobile/tracking/today-summary`, {
          params: { user_id: 1 },
          timeout: 5000
        })
          .then(response => ({ success: true, index: i, data: response.data }))
          .catch(error => ({ 
            success: false, 
            index: i, 
            error: error.response?.data || error.message,
            status: error.response?.status
          }))
      );
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Successful requests: ${successful}`);
    console.log(`❌ Failed requests: ${failed}`);

    if (failed > 0) {
      console.log('⚠️ Some requests failed. This might indicate rate limiting is still too restrictive.');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   Request ${r.index}: Status ${r.status} - ${r.error.message || r.error}`);
      });
    } else {
      console.log('✅ All requests succeeded. Rate limiting appears to be working correctly.');
    }

    // Test 2: Check specific endpoint types
    console.log('\n📊 Test 2: Testing different endpoint types...');
    
    const endpointTests = [
      { name: 'Tracking', url: '/mobile/tracking/today-summary', params: { user_id: 1 } },
      { name: 'Missions', url: '/mobile/missions/stats', params: { user_id: 1 } },
      { name: 'Search', url: '/mobile/food/search', params: { query: 'rice', user_id: 1 } }
    ];

    for (const test of endpointTests) {
      try {
        const response = await axios.get(`${BASE_URL}${test.url}`, {
          params: test.params,
          timeout: 5000
        });
        console.log(`✅ ${test.name}: Success`);
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 3: Check rate limit headers
    console.log('\n📊 Test 3: Checking rate limit headers...');
    
    try {
      const response = await axios.get(`${BASE_URL}/mobile/tracking/today-summary`, {
        params: { user_id: 1 },
        timeout: 5000
      });
      const headers = response.headers;
      
      console.log('📋 Response headers:');
      console.log(`   X-RateLimit-Limit: ${headers['x-ratelimit-limit'] || 'Not set'}`);
      console.log(`   X-RateLimit-Remaining: ${headers['x-ratelimit-remaining'] || 'Not set'}`);
      console.log(`   X-RateLimit-Reset: ${headers['x-ratelimit-reset'] || 'Not set'}`);
      
      if (headers['x-ratelimit-limit']) {
        console.log('✅ Rate limit headers are being set correctly.');
      } else {
        console.log('⚠️ Rate limit headers are not being set.');
      }
    } catch (error) {
      console.log(`❌ Error checking headers: ${error.message}`);
    }

    // Test 4: Test rate limiting by making many requests quickly
    console.log('\n📊 Test 4: Testing rate limiting with rapid requests...');
    
    const rapidPromises = [];
    for (let i = 0; i < 50; i++) {
      rapidPromises.push(
        axios.get(`${BASE_URL}/mobile/tracking/today-summary`, {
          params: { user_id: 1 },
          timeout: 2000
        })
          .then(response => ({ success: true, index: i }))
          .catch(error => ({ 
            success: false, 
            index: i, 
            error: error.response?.data || error.message,
            status: error.response?.status
          }))
      );
    }

    const rapidResults = await Promise.all(rapidPromises);
    const rapidSuccessful = rapidResults.filter(r => r.success).length;
    const rapidFailed = rapidResults.filter(r => !r.success).length;

    console.log(`✅ Rapid requests successful: ${rapidSuccessful}`);
    console.log(`❌ Rapid requests failed: ${rapidFailed}`);

    if (rapidFailed > 0) {
      const rateLimitErrors = rapidResults.filter(r => !r.success && r.status === 429).length;
      console.log(`   Rate limit errors (429): ${rateLimitErrors}`);
      console.log(`   Other errors: ${rapidFailed - rateLimitErrors}`);
    }

    console.log('\n🎉 Rate limiting test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRateLimiting();
