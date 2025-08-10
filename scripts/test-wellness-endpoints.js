const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/mobile';

async function testWellnessEndpoints() {
  console.log('🧪 Testing Wellness Endpoints...');
  
  try {
    // Test mission stats endpoint
    console.log('\n📊 Testing Mission Stats Endpoint...');
    const statsResponse = await fetch(`${BASE_URL}/missions/stats?user_id=1`);
    const statsData = await statsResponse.json();
    console.log('Mission Stats Response:', statsData);
    
    // Test my missions endpoint
    console.log('\n📋 Testing My Missions Endpoint...');
    const missionsResponse = await fetch(`${BASE_URL}/my-missions?user_id=1`);
    const missionsData = await missionsResponse.json();
    console.log('My Missions Response:', missionsData);
    
    // Test today's summary endpoint
    console.log('\n📅 Testing Today Summary Endpoint...');
    const summaryResponse = await fetch(`${BASE_URL}/tracking/today-summary?user_id=1`);
    const summaryData = await summaryResponse.json();
    console.log('Today Summary Response:', summaryData);
    
    // Test detailed metrics endpoint
    console.log('\n📈 Testing Detailed Metrics Endpoint...');
    const metricsResponse = await fetch(`${BASE_URL}/tracking/detailed-metrics?user_id=1`);
    const metricsData = await metricsResponse.json();
    console.log('Detailed Metrics Response:', metricsData);
    
    console.log('\n✅ All endpoint tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWellnessEndpoints(); 