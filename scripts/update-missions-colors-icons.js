const mysql = require('mysql2/promise');

/**
 * Script untuk mengupdate missions dengan colors dan icons yang sesuai
 */

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phc_mobile'
};

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

async function updateMissionsColorsIcons() {
  console.log('🎨 Updating missions with colors and icons...\n');

  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Get all missions
    const [missions] = await connection.execute('SELECT id, title, category, color, icon FROM missions');
    console.log(`📊 Found ${missions.length} missions`);

    // Update each mission with appropriate color and icon
    let updatedCount = 0;
    for (const mission of missions) {
      const defaults = categoryDefaults[mission.category] || categoryDefaults.general;
      
      // Only update if color or icon is null
      if (!mission.color || !mission.icon) {
        const updateSql = 'UPDATE missions SET color = ?, icon = ? WHERE id = ?';
        await connection.execute(updateSql, [defaults.color, defaults.icon, mission.id]);
        
        console.log(`✅ Updated mission "${mission.title}" (${mission.category})`);
        console.log(`   - Color: ${defaults.color}`);
        console.log(`   - Icon: ${defaults.icon}`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipping mission "${mission.title}" - already has color and icon`);
      }
    }

    console.log(`\n📈 Update Summary:`);
    console.log(`   - Total missions: ${missions.length}`);
    console.log(`   - Updated: ${updatedCount}`);
    console.log(`   - Skipped: ${missions.length - updatedCount}`);

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const [updatedMissions] = await connection.execute('SELECT id, title, category, color, icon FROM missions');
    
    const missionsWithColors = updatedMissions.filter(m => m.color);
    const missionsWithIcons = updatedMissions.filter(m => m.icon);
    
    console.log(`   - Missions with colors: ${missionsWithColors.length}/${updatedMissions.length}`);
    console.log(`   - Missions with icons: ${missionsWithIcons.length}/${updatedMissions.length}`);

    if (missionsWithColors.length === updatedMissions.length && missionsWithIcons.length === updatedMissions.length) {
      console.log('✅ All missions now have colors and icons!');
    } else {
      console.log('⚠️  Some missions still missing colors or icons');
    }

  } catch (error) {
    console.error('❌ Error updating missions:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

async function showCurrentMissions() {
  console.log('\n📋 Current missions in database:');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [missions] = await connection.execute('SELECT id, title, category, color, icon FROM missions ORDER BY id');
    
    missions.forEach(mission => {
      const colorStatus = mission.color ? '✅' : '❌';
      const iconStatus = mission.icon ? '✅' : '❌';
      console.log(`   ${mission.id}. ${mission.title} (${mission.category})`);
      console.log(`      Color: ${colorStatus} ${mission.color || 'null'}`);
      console.log(`      Icon: ${iconStatus} ${mission.icon || 'null'}`);
    });
    
  } catch (error) {
    console.error('❌ Error showing missions:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function main() {
  console.log('🎯 Missions Colors & Icons Update Tool');
  console.log('=======================================\n');
  
  await showCurrentMissions();
  await updateMissionsColorsIcons();
  
  console.log('\n✅ Update complete!');
  console.log('📋 Next steps:');
  console.log('1. Test the mobile app');
  console.log('2. Check if missions are now displayed with colors and icons');
  console.log('3. Remove debug code if everything works');
}

main().catch(console.error); 