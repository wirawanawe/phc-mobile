const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/mobile';

async function addTestMissions() {
  console.log('🧪 Adding Test Missions...');
  
  try {
    const userId = 1;
    
    // First, get available missions
    console.log('\n📋 Getting available missions...');
    const missionsResponse = await fetch(`${BASE_URL}/missions`);
    const missionsData = await missionsResponse.json();
    
    if (missionsData.success && missionsData.data.length > 0) {
      console.log(`Found ${missionsData.data.length} available missions`);
      
      // Accept first 3 missions
      const missionsToAccept = missionsData.data.slice(0, 3);
      
      for (let i = 0; i < missionsToAccept.length; i++) {
        const mission = missionsToAccept[i];
        console.log(`\n🎯 Accepting mission: ${mission.title}`);
        
        const acceptResponse = await fetch(`${BASE_URL}/missions/accept/${mission.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });
        
        const acceptData = await acceptResponse.json();
        console.log('Accept response:', acceptData);
        
        if (acceptData.success) {
          console.log(`✅ Mission "${mission.title}" accepted successfully`);
          
          // Update progress for this mission (simulate completion)
          if (acceptData.data && acceptData.data.user_mission_id) {
            console.log(`📈 Updating progress for mission...`);
            
            const progressResponse = await fetch(`${BASE_URL}/missions/progress/${acceptData.data.user_mission_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: userId,
                current_value: mission.target_value, // Complete the mission
                status: 'completed'
              }),
            });
            
            const progressData = await progressResponse.json();
            console.log('Progress update response:', progressData);
            
            if (progressData.success) {
              console.log(`✅ Mission "${mission.title}" completed!`);
            }
          }
        }
      }
      
      // Check updated stats
      console.log('\n📊 Checking updated mission stats...');
      const statsResponse = await fetch(`${BASE_URL}/missions/stats?user_id=${userId}`);
      const statsData = await statsResponse.json();
      console.log('Updated Mission Stats:', statsData);
      
    } else {
      console.log('❌ No missions available to accept');
    }
    
  } catch (error) {
    console.error('❌ Error adding test missions:', error);
  }
}

addTestMissions(); 