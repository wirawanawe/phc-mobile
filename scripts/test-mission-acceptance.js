const { query } = require('../dash-app/lib/db');

async function testMissionAcceptance() {
  try {
    console.log('🧪 Testing mission acceptance flow...');
    
    // Test 1: Check if missions exist
    const missions = await query('SELECT id, title, is_active FROM missions WHERE is_active = 1 LIMIT 5');
    console.log('📋 Available missions:', missions);
    
    if (missions.length === 0) {
      console.log('❌ No active missions found');
      return;
    }
    
    // Test 2: Check if users exist
    const users = await query('SELECT id, name, email FROM mobile_users LIMIT 5');
    console.log('👥 Available users:', users);
    
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const testUserId = users[0].id;
    const testMissionId = missions[0].id;
    
    // Test 3: Check current user missions
    const currentUserMissions = await query(
      'SELECT um.*, m.title FROM user_missions um JOIN missions m ON um.mission_id = m.id WHERE um.user_id = ?',
      [testUserId]
    );
    console.log('📊 Current user missions:', currentUserMissions);
    
    // Test 4: Simulate mission acceptance
    console.log(`🎯 Simulating mission acceptance: User ${testUserId}, Mission ${testMissionId}`);
    
    // Check if user already has this mission
    const existingMission = await query(
      'SELECT id, status FROM user_missions WHERE user_id = ? AND mission_id = ?',
      [testUserId, testMissionId]
    );
    
    if (existingMission.length > 0) {
      console.log('🔄 User already has this mission:', existingMission[0]);
      
      // Update progress to test
      const updateResult = await query(
        'UPDATE user_missions SET progress = 50, updated_at = NOW() WHERE id = ?',
        [existingMission[0].id]
      );
      console.log('📈 Updated mission progress');
    } else {
      // Accept new mission
      const acceptResult = await query(
        'INSERT INTO user_missions (user_id, mission_id, status, progress, created_at, updated_at) VALUES (?, ?, "active", 0, NOW(), NOW())',
        [testUserId, testMissionId]
      );
      console.log('✅ Mission accepted:', acceptResult);
    }
    
    // Test 5: Check updated user missions
    const updatedUserMissions = await query(
      'SELECT um.*, m.title FROM user_missions um JOIN missions m ON um.mission_id = m.id WHERE um.user_id = ?',
      [testUserId]
    );
    console.log('📊 Updated user missions:', updatedUserMissions);
    
    // Test 6: Check mission stats
    const stats = await query(`
      SELECT 
        COUNT(*) as total_missions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_missions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_missions,
        SUM(CASE WHEN status = 'completed' THEN m.points ELSE 0 END) as total_points_earned
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ?
    `, [testUserId]);
    
    console.log('📈 Mission stats:', stats[0]);
    
    console.log('✅ Mission acceptance test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in mission acceptance test:', error);
  }
}

// Run the test
testMissionAcceptance().then(() => {
  console.log('🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
}); 