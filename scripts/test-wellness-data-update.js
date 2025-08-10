const apiService = require('../src/services/api.js');

async function testWellnessDataUpdate() {
  console.log('🧪 Testing Wellness Data Update...');
  
  try {
    // Initialize API service
    await apiService.initialize();
    
    // Test mission stats
    console.log('\n📊 Testing Mission Stats...');
    const missionStats = await apiService.getMissionStats();
    console.log('Mission Stats Response:', missionStats);
    
    // Test my missions
    console.log('\n📋 Testing My Missions...');
    const myMissions = await apiService.getMyMissions();
    console.log('My Missions Response:', myMissions);
    
    // Test today's summary
    console.log('\n📅 Testing Today Summary...');
    const todaySummary = await apiService.getTodaySummary();
    console.log('Today Summary Response:', todaySummary);
    
    // Test detailed metrics
    console.log('\n📈 Testing Detailed Metrics...');
    const detailedMetrics = await apiService.getDetailedMetrics({
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      period: 'week'
    });
    console.log('Detailed Metrics Response:', detailedMetrics);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWellnessDataUpdate(); 