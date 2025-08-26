const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function diagnoseMissionsIssue() {
  console.log('🔍 Diagnosing missions issue...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('   Error:', error.message);
      return;
    }

    // Test 2: Check missions endpoint
    console.log('\n2️⃣ Testing missions endpoint...');
    try {
      const missionsResponse = await axios.get(`${BASE_URL}/mobile/missions`, { timeout: 10000 });
      console.log('✅ Missions endpoint is accessible');
      console.log('   Response status:', missionsResponse.status);
      console.log('   Success:', missionsResponse.data.success);
      console.log('   Data length:', missionsResponse.data.data?.length || 0);
      
      if (missionsResponse.data.data && missionsResponse.data.data.length > 0) {
        console.log('   Sample mission:', {
          id: missionsResponse.data.data[0].id,
          title: missionsResponse.data.data[0].title,
          category: missionsResponse.data.data[0].category
        });
      } else {
        console.log('   ⚠️ No missions data returned');
      }
    } catch (error) {
      console.log('❌ Missions endpoint failed');
      console.log('   Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }

    // Test 3: Check my-missions endpoint
    console.log('\n3️⃣ Testing my-missions endpoint...');
    try {
      const myMissionsResponse = await axios.get(`${BASE_URL}/mobile/missions/my-missions`, { timeout: 10000 });
      console.log('✅ My-missions endpoint is accessible');
      console.log('   Response status:', myMissionsResponse.status);
      console.log('   Success:', myMissionsResponse.data.success);
      console.log('   Data length:', myMissionsResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ My-missions endpoint failed');
      console.log('   Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }

    // Test 4: Check mission stats endpoint
    console.log('\n4️⃣ Testing mission stats endpoint...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/mobile/missions/stats?date=2025-01-20`, { timeout: 10000 });
      console.log('✅ Mission stats endpoint is accessible');
      console.log('   Response status:', statsResponse.status);
      console.log('   Success:', statsResponse.data.success);
      console.log('   Stats data:', statsResponse.data.data);
    } catch (error) {
      console.log('❌ Mission stats endpoint failed');
      console.log('   Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }

    // Test 5: Check database directly
    console.log('\n5️⃣ Testing database connection...');
    try {
      const dbResponse = await axios.get(`${BASE_URL}/test-db`, { timeout: 10000 });
      console.log('✅ Database connection is working');
      console.log('   Response:', dbResponse.data);
    } catch (error) {
      console.log('❌ Database connection failed');
      console.log('   Error:', error.message);
    }

    // Test 6: Check missions table
    console.log('\n6️⃣ Testing missions table...');
    try {
      const missionsTableResponse = await axios.get(`${BASE_URL}/mobile/missions/test-query`, { timeout: 10000 });
      console.log('✅ Missions table is accessible');
      console.log('   Response:', missionsTableResponse.data);
    } catch (error) {
      console.log('❌ Missions table query failed');
      console.log('   Error:', error.message);
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

// Run the diagnostic
diagnoseMissionsIssue();
