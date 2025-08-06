const BASE_URL = 'http://10.242.90.103:3000/api/mobile';

async function resetUserMissions(userId = 1, missionId = null) {
  try {
    console.log(`🔄 Resetting missions for user ID: ${userId}${missionId ? `, mission ID: ${missionId}` : ''}`);
    
    // First, let's see what missions the user currently has
    const myMissionsResponse = await fetch(`${BASE_URL}/my-missions?all_dates=true`);
    const myMissionsData = await myMissionsResponse.json();
    
    if (myMissionsData.success) {
      console.log('📊 Current user missions:');
      myMissionsData.data.forEach(um => {
        console.log(`  Mission ID: ${um.mission_id}, Status: ${um.status}, Title: ${um.mission_title}`);
      });
    }
    
    // Reset missions using the new endpoint
    const resetResponse = await fetch(`${BASE_URL}/missions/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        mission_id: missionId
      })
    });
    
    const resetData = await resetResponse.json();
    console.log('📊 Reset response:', resetData);
    
    if (resetData.success) {
      console.log('✅ Successfully reset missions!');
      
      // Try to accept mission ID 1 again
      console.log('\n🎯 Trying to accept mission ID 1 again...');
      const acceptResponse = await fetch(`${BASE_URL}/missions/accept/1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          mission_date: new Date().toISOString().split('T')[0]
        })
      });
      
      const acceptData = await acceptResponse.json();
      console.log('📊 Accept response:', acceptData);
      
      if (acceptData.success) {
        console.log('✅ Successfully accepted mission ID 1!');
      } else {
        console.log('❌ Still failed to accept mission ID 1:', acceptData.message);
      }
    } else {
      console.log('❌ Failed to reset missions:', resetData.message);
    }
    
  } catch (error) {
    console.error('❌ Error resetting missions:', error);
  }
}

// Reset all missions for user 1
resetUserMissions(1); 