require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function debugMissionIssue() {
  let connection;
  
  try {
    console.log('🔍 Debugging Mission Issue...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    // Check if mission ID 1 exists
    const [missions] = await connection.execute(
      'SELECT id, title, description, is_active FROM missions WHERE id = 1'
    );
    
    if (missions.length === 0) {
      console.log('❌ Mission ID 1 does not exist');
      return;
    }
    
    console.log('📋 Mission ID 1 details:');
    console.log(JSON.stringify(missions[0], null, 2));
    console.log('');
    
    // Check all user missions for mission ID 1
    const [userMissions] = await connection.execute(
      `SELECT 
        um.id,
        um.user_id,
        um.mission_id,
        um.status,
        um.progress,
        um.mission_date,
        um.created_at,
        um.completed_at,
        u.name as user_name
      FROM user_missions um
      LEFT JOIN users u ON um.user_id = u.id
      WHERE um.mission_id = 1
      ORDER BY um.created_at DESC`
    );
    
    console.log(`📊 Found ${userMissions.length} user missions for mission ID 1:`);
    userMissions.forEach((um, index) => {
      console.log(`\n${index + 1}. User Mission ID: ${um.id}`);
      console.log(`   User: ${um.user_name || 'Unknown'} (ID: ${um.user_id})`);
      console.log(`   Status: ${um.status}`);
      console.log(`   Progress: ${um.progress}`);
      console.log(`   Mission Date: ${um.mission_date}`);
      console.log(`   Created: ${um.created_at}`);
      console.log(`   Completed: ${um.completed_at || 'Not completed'}`);
    });
    
    console.log('\n🔧 Possible Solutions:');
    console.log('1. If a user mission is marked as "completed", you can:');
    console.log('   - Reset it to "active" status');
    console.log('   - Delete the completed record to allow re-acceptance');
    console.log('   - Accept the mission for a different date');
    console.log('');
    console.log('2. If the mission is inactive, you can:');
    console.log('   - Activate the mission in the missions table');
    console.log('');
    console.log('3. To reset a completed mission, run:');
    console.log('   UPDATE user_missions SET status = "active", progress = 0, completed_at = NULL WHERE id = <user_mission_id>');
    console.log('');
    console.log('4. To delete a completed mission record, run:');
    console.log('   DELETE FROM user_missions WHERE id = <user_mission_id>');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Function to reset a specific user mission
async function resetUserMission(userMissionId) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'UPDATE user_missions SET status = "active", progress = 0, completed_at = NULL WHERE id = ?',
      [userMissionId]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ Successfully reset user mission ID ${userMissionId}`);
    } else {
      console.log(`❌ User mission ID ${userMissionId} not found`);
    }
    
  } catch (error) {
    console.error('❌ Error resetting user mission:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Function to delete a specific user mission
async function deleteUserMission(userMissionId) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'DELETE FROM user_missions WHERE id = ?',
      [userMissionId]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ Successfully deleted user mission ID ${userMissionId}`);
    } else {
      console.log(`❌ User mission ID ${userMissionId} not found`);
    }
    
  } catch (error) {
    console.error('❌ Error deleting user mission:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  const command = args[0];
  const userMissionId = parseInt(args[1]);
  
  if (command === 'reset' && userMissionId) {
    resetUserMission(userMissionId);
  } else if (command === 'delete' && userMissionId) {
    deleteUserMission(userMissionId);
  } else {
    console.log('Usage:');
    console.log('  node debug-mission-issue.js                    # Debug the issue');
    console.log('  node debug-mission-issue.js reset <id>         # Reset a user mission');
    console.log('  node debug-mission-issue.js delete <id>        # Delete a user mission');
  }
} else {
  debugMissionIssue();
} 