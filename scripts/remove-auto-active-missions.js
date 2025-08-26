#!/usr/bin/env node

/**
 * Remove Auto Active Missions
 * 
 * This script removes missions that were automatically set to active
 * and changes their status to 'available' so users can choose them manually.
 */

const { query } = require('../dash-app/lib/db');

async function removeAutoActiveMissions() {
  try {
    console.log('🔧 Removing auto-active missions...\n');
    
    // Check current active missions
    const activeMissions = await query(`
      SELECT um.id, um.user_id, um.mission_id, um.status, um.created_at, m.title
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.status = 'active'
      ORDER BY um.created_at DESC
    `);
    
    console.log(`📊 Found ${activeMissions.length} active missions:`);
    activeMissions.forEach(mission => {
      console.log(`   - ID: ${mission.id}, User: ${mission.user_id}, Mission: ${mission.title}, Created: ${mission.created_at}`);
    });
    
    if (activeMissions.length === 0) {
      console.log('✅ No active missions found. Nothing to remove.');
      return;
    }
    
    // Ask for confirmation
    console.log('\n⚠️  This will remove all active missions and make them available for manual selection.');
    console.log('   Users will need to manually accept missions they want to do.');
    
    // Remove all active missions
    const result = await query(`
      DELETE FROM user_missions 
      WHERE status = 'active'
    `);
    
    console.log(`\n✅ Successfully removed ${result.affectedRows} active missions`);
    console.log('🎯 Users can now manually accept missions from the mission list');
    
    // Verify removal
    const remainingActive = await query(`
      SELECT COUNT(*) as count FROM user_missions WHERE status = 'active'
    `);
    
    console.log(`📊 Remaining active missions: ${remainingActive[0].count}`);
    
  } catch (error) {
    console.error('❌ Error removing auto-active missions:', error);
  }
}

// Run the script
removeAutoActiveMissions().then(() => {
  console.log('\n🏁 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Script failed:', error);
  process.exit(1);
});
