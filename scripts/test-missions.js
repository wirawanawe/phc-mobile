const BASE_URL = 'http://10.242.90.103:3000/api/mobile';

async function testMissions() {
  try {
    console.log('🔍 Testing missions API...');
    
    // Get available missions
    const missionsResponse = await fetch(`${BASE_URL}/missions`);
    const missionsData = await missionsResponse.json();
    
    if (missionsData.success) {
      console.log('✅ Available missions:');
      missionsData.missions.forEach(mission => {
        console.log(`  ID: ${mission.id}, Title: ${mission.title}, Category: ${mission.category}, Points: ${mission.points}`);
      });
      
      // Try to accept a different mission (not ID 1)
      const availableMission = missionsData.missions.find(m => m.id !== 1);
      if (availableMission) {
        console.log(`\n🎯 Trying to accept mission ID ${availableMission.id}: ${availableMission.title}`);
        
        const acceptResponse = await fetch(`${BASE_URL}/missions/accept/${availableMission.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 1, // Assuming user ID 1
            mission_date: new Date().toISOString().split('T')[0]
          })
        });
        
        const acceptData = await acceptResponse.json();
        console.log('📊 Accept response:', acceptData);
        
        if (acceptData.success) {
          console.log('✅ Successfully accepted mission!');
        } else {
          console.log('❌ Failed to accept mission:', acceptData.message);
        }
      } else {
        console.log('❌ No available missions found (other than ID 1)');
      }
    } else {
      console.log('❌ Failed to get missions:', missionsData.message);
    }
  } catch (error) {
    console.error('❌ Error testing missions:', error);
  }
}

testMissions(); 