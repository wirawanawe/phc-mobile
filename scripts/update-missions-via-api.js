const fetch = require('node-fetch');

/**
 * Script untuk mengupdate missions dengan colors dan icons melalui API
 */

const API_BASE_URL = 'http://10.242.90.103:3000/api/mobile';

const categoryDefaults = {
  daily_habit: { color: '#10B981', icon: 'check-circle' },
  fitness: { color: '#F59E0B', icon: 'dumbbell' },
  mental_health: { color: '#8B5CF6', icon: 'brain' },
  nutrition: { color: '#EF4444', icon: 'food-apple' },
  health_tracking: { color: '#3B82F6', icon: 'heart-pulse' },
  education: { color: '#6366F1', icon: 'book-open' },
  consultation: { color: '#06B6D4', icon: 'doctor' },
  general: { color: '#E53E3E', icon: 'help-circle' }
};

async function updateMissionsViaAPI() {
  console.log('🎨 Updating missions with colors and icons via API...\n');

  try {
    // Get current missions
    console.log('📋 Getting current missions...');
    const missionsResponse = await fetch(`${API_BASE_URL}/missions`);
    const missionsData = await missionsResponse.json();
    
    if (!missionsData.missions) {
      console.log('❌ No missions found in API response');
      return;
    }

    console.log(`📊 Found ${missionsData.missions.length} missions`);

    // Check which missions need updates
    const missionsToUpdate = missionsData.missions.filter(mission => 
      !mission.color || !mission.icon
    );

    console.log(`🔍 Found ${missionsToUpdate.length} missions that need updates`);

    if (missionsToUpdate.length === 0) {
      console.log('✅ All missions already have colors and icons!');
      return;
    }

    // Show current state
    console.log('\n📋 Current missions state:');
    missionsData.missions.forEach(mission => {
      const colorStatus = mission.color ? '✅' : '❌';
      const iconStatus = mission.icon ? '✅' : '❌';
      console.log(`   ${mission.id}. ${mission.title} (${mission.category})`);
      console.log(`      Color: ${colorStatus} ${mission.color || 'null'}`);
      console.log(`      Icon: ${iconStatus} ${mission.icon || 'null'}`);
    });

    // Show what will be updated
    console.log('\n🎨 Missions that will be updated:');
    missionsToUpdate.forEach(mission => {
      const defaults = categoryDefaults[mission.category] || categoryDefaults.general;
      console.log(`   ${mission.id}. ${mission.title} (${mission.category})`);
      console.log(`      → Color: ${mission.color || 'null'} → ${defaults.color}`);
      console.log(`      → Icon: ${mission.icon || 'null'} → ${defaults.icon}`);
    });

    // Note: Since we don't have a direct API endpoint to update missions,
    // we'll provide the SQL commands to run manually
    console.log('\n📝 SQL Commands to run manually:');
    console.log('=====================================');
    
    missionsToUpdate.forEach(mission => {
      const defaults = categoryDefaults[mission.category] || categoryDefaults.general;
      console.log(`UPDATE missions SET color = '${defaults.color}', icon = '${defaults.icon}' WHERE id = ${mission.id};`);
    });

    console.log('\n💡 Alternative: Update via dashboard admin panel');
    console.log('   1. Go to http://10.242.90.103:3000/settings/missions');
    console.log('   2. Edit each mission and add color/icon');
    console.log('   3. Or use the SQL commands above');

  } catch (error) {
    console.error('❌ Error updating missions:', error.message);
  }
}

async function testUpdatedMissions() {
  console.log('\n🔍 Testing missions after update...');
  
  try {
    const missionsResponse = await fetch(`${API_BASE_URL}/missions`);
    const missionsData = await missionsResponse.json();
    
    if (missionsData.missions) {
      const missionsWithColors = missionsData.missions.filter(m => m.color);
      const missionsWithIcons = missionsData.missions.filter(m => m.icon);
      
      console.log(`📊 Missions with colors: ${missionsWithColors.length}/${missionsData.missions.length}`);
      console.log(`📊 Missions with icons: ${missionsWithIcons.length}/${missionsData.missions.length}`);
      
      if (missionsWithColors.length === missionsData.missions.length && missionsWithIcons.length === missionsData.missions.length) {
        console.log('✅ All missions now have colors and icons!');
      } else {
        console.log('⚠️  Some missions still missing colors or icons');
      }
    }
  } catch (error) {
    console.error('❌ Error testing missions:', error.message);
  }
}

async function generateMobileAppFix() {
  console.log('\n🔧 Mobile app fix (already implemented):');
  console.log('==========================================');
  console.log('✅ Added processMissionData function to handle missing fields');
  console.log('✅ Added default colors and icons based on category');
  console.log('✅ Updated loadData function to process missions');
  console.log('✅ Added debugging logs to track data flow');
  console.log('✅ Added empty state UI for when no missions are available');
}

async function main() {
  console.log('🎯 Missions Update Tool');
  console.log('=======================\n');
  
  await updateMissionsViaAPI();
  await testUpdatedMissions();
  await generateMobileAppFix();
  
  console.log('\n✅ Analysis complete!');
  console.log('📋 Next steps:');
  console.log('1. Run the SQL commands above to update database');
  console.log('2. Test the mobile app - missions should now display');
  console.log('3. Check console logs for debugging information');
  console.log('4. Remove debug code once everything works');
}

main().catch(console.error); 