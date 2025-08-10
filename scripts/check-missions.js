const { query } = require('../dash-app/lib/db');

async function checkMissions() {
  try {
    console.log('🔍 Checking missions in database...');
    
    // Check all missions
    const allMissions = await query('SELECT id, title, is_active, category FROM missions ORDER BY created_at DESC');
    console.log('📋 All missions:', allMissions);
    
    // Check active missions only
    const activeMissions = await query('SELECT id, title, is_active, category FROM missions WHERE is_active = 1 ORDER BY created_at DESC');
    console.log('✅ Active missions:', activeMissions);
    
    // Check mission categories
    const categories = await query('SELECT DISTINCT category FROM missions WHERE is_active = 1');
    console.log('🏷️ Available categories:', categories);
    
    // Check if there are any missions at all
    if (allMissions.length === 0) {
      console.log('❌ No missions found in database');
      return;
    }
    
    if (activeMissions.length === 0) {
      console.log('⚠️ No active missions found. All missions are inactive.');
      
      // Show inactive missions
      const inactiveMissions = await query('SELECT id, title, is_active FROM missions WHERE is_active = 0');
      console.log('🚫 Inactive missions:', inactiveMissions);
    } else {
      console.log(`✅ Found ${activeMissions.length} active missions`);
    }
    
    // Check mission structure
    const sampleMission = await query('SELECT * FROM missions WHERE is_active = 1 LIMIT 1');
    if (sampleMission.length > 0) {
      console.log('📝 Sample mission structure:', Object.keys(sampleMission[0]));
    }
    
  } catch (error) {
    console.error('❌ Error checking missions:', error);
  }
}

// Run the check
checkMissions().then(() => {
  console.log('🏁 Mission check completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Mission check failed:', error);
  process.exit(1);
}); 