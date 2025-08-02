const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/mobile';

async function testMissionProgress() {
  console.log('🧪 Testing Mission Progress Update...');
  
  try {
    // Test with user_id = 1
    const userId = 1;
    
    // Get initial mission stats
    console.log('\n📊 Getting initial mission stats...');
    const initialStats = await fetch(`${BASE_URL}/missions/stats?user_id=${userId}`);
    const initialData = await initialStats.json();
    console.log('Initial Mission Stats:', initialData);
    
    // Get user missions
    console.log('\n📋 Getting user missions...');
    const missionsResponse = await fetch(`${BASE_URL}/my-missions?user_id=${userId}`);
    const missionsData = await missionsResponse.json();
    console.log('User Missions:', missionsData);
    
    // Check if user has any missions
    if (missionsData.success && missionsData.data.length > 0) {
      console.log('\n✅ User has missions, checking progress...');
      
      // Calculate expected progress
      const totalMissions = initialData.data.total_missions;
      const completedMissions = initialData.data.completed_missions;
      const progressPercentage = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
      
      console.log(`📈 Progress Calculation:`);
      console.log(`- Total Missions: ${totalMissions}`);
      console.log(`- Completed Missions: ${completedMissions}`);
      console.log(`- Progress Percentage: ${progressPercentage.toFixed(1)}%`);
      console.log(`- Total Points Earned: ${initialData.data.total_points_earned}`);
      
      // Check if progress should be visible
      if (totalMissions > 0) {
        console.log('✅ Progress should be visible in the app');
      } else {
        console.log('⚠️ No missions found - user needs to accept missions first');
      }
    } else {
      console.log('\n⚠️ No missions found for user');
      console.log('To test progress update:');
      console.log('1. Go to DailyMission screen');
      console.log('2. Accept some missions');
      console.log('3. Complete some missions');
      console.log('4. Return to WellnessApp to see progress');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMissionProgress(); 