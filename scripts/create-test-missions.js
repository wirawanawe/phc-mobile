#!/usr/bin/env node

/**
 * Create Test Missions
 * 
 * This script creates test missions in the database for testing purposes.
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
      host: 'dash.doctorphc.id',
  user: 'root',
  password: '',
  database: 'phc_dashboard',
  port: 3306
};

async function createTestMissions() {
  console.log('🧪 Creating test missions...\n');

  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check if missions already exist
    const [existingMissions] = await connection.execute(
      'SELECT COUNT(*) as count FROM missions WHERE category IN ("health_tracking", "fitness")'
    );

    if (existingMissions[0].count > 0) {
      console.log(`⚠️ Found ${existingMissions[0].count} existing missions, skipping creation`);
      return;
    }

    // Create test missions
    const testMissions = [
      {
        title: 'Minum Air 8 Gelas',
        description: 'Minum minimal 8 gelas air putih setiap hari untuk menjaga kesehatan',
        category: 'health_tracking',
        sub_category: 'WATER_INTAKE',
        target_value: 2000,
        unit: 'ml',
        points: 10,
        difficulty: 'easy',
        is_active: true,
        type: 'daily'
      },
      {
        title: 'Jalan Kaki 10.000 Langkah',
        description: 'Berjalan kaki minimal 10.000 langkah setiap hari',
        category: 'fitness',
        sub_category: 'STEPS',
        target_value: 10000,
        unit: 'steps',
        points: 15,
        difficulty: 'medium',
        is_active: true,
        type: 'daily'
      },
      {
        title: 'Tidur 8 Jam',
        description: 'Tidur minimal 8 jam setiap malam untuk istirahat yang cukup',
        category: 'health_tracking',
        sub_category: 'SLEEP_DURATION',
        target_value: 8,
        unit: 'hours',
        points: 12,
        difficulty: 'easy',
        is_active: true,
        type: 'daily'
      },
      {
        title: 'Olahraga 30 Menit',
        description: 'Berolahraga minimal 30 menit setiap hari',
        category: 'fitness',
        sub_category: 'EXERCISE_DURATION',
        target_value: 30,
        unit: 'minutes',
        points: 20,
        difficulty: 'medium',
        is_active: true,
        type: 'daily'
      },
      {
        title: 'Makan Buah 3 Porsi',
        description: 'Makan minimal 3 porsi buah setiap hari',
        category: 'health_tracking',
        sub_category: 'NUTRITION',
        target_value: 3,
        unit: 'servings',
        points: 8,
        difficulty: 'easy',
        is_active: true,
        type: 'daily'
      }
    ];

    console.log('📝 Creating test missions...');
    
    for (const mission of testMissions) {
      const [result] = await connection.execute(
        `INSERT INTO missions (
          title, description, category, sub_category, target_value, 
          unit, points, difficulty, is_active, type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          mission.title,
          mission.description,
          mission.category,
          mission.sub_category,
          mission.target_value,
          mission.unit,
          mission.points,
          mission.difficulty,
          mission.is_active,
          mission.type
        ]
      );
      
      console.log(`✅ Created mission: ${mission.title} (ID: ${result.insertId})`);
    }

    // Create user missions for user ID 1 (Super Admin) - DISABLED
    console.log('\n👤 Creating user missions for Super Admin...');
    console.log('⚠️  Auto-active missions disabled. Users must manually accept missions.');
    
    // Commented out auto-active mission creation
    /*
    const [missions] = await connection.execute('SELECT id FROM missions WHERE is_active = true');
    
    for (const mission of missions) {
      // Check if user mission already exists
      const [existingUserMission] = await connection.execute(
        'SELECT id FROM user_missions WHERE user_id = 1 AND mission_id = ?',
        [mission.id]
      );

      if (existingUserMission.length === 0) {
        const [result] = await connection.execute(
          `INSERT INTO user_missions (
            user_id, mission_id, status, current_value, target_value, 
            progress, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            1, // Super Admin user ID
            mission.id,
            'active',
            0,
            mission.target_value || 0,
            0
          ]
        );
        
        console.log(`✅ Created user mission for mission ID ${mission.id} (User Mission ID: ${result.insertId})`);
      } else {
        console.log(`⚠️ User mission already exists for mission ID ${mission.id}`);
      }
    }
    */

    console.log('\n🎉 Test missions created successfully!');
    console.log(`📊 Created ${testMissions.length} missions`);
    console.log(`👤 Created user missions for Super Admin`);

  } catch (error) {
    console.error('❌ Error creating test missions:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
createTestMissions()
  .then(() => {
    console.log('\n🏁 Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
