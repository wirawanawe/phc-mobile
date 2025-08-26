const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../dash-app/.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function resetAllMissions() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Step 1: Delete all user_missions first (due to foreign key constraint)
    console.log('\n🗑️ Step 1: Deleting all user_missions...');
    await connection.execute('DELETE FROM user_missions');
    console.log('✅ All user_missions deleted');

    // Step 2: Delete all missions
    console.log('\n🗑️ Step 2: Deleting all missions...');
    await connection.execute('DELETE FROM missions');
    console.log('✅ All missions deleted');

    // Step 3: Reset auto increment
    console.log('\n🔄 Step 3: Resetting auto increment...');
    await connection.execute('ALTER TABLE missions AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE user_missions AUTO_INCREMENT = 1');
    console.log('✅ Auto increment reset');

    // Step 4: Create new clean missions
    console.log('\n✨ Step 4: Creating new clean missions...');
    
    const newMissions = [
      // HEALTH TRACKING
      {
        title: 'Minum Air 8 Gelas',
        description: 'Minum minimal 8 gelas air putih dalam sehari untuk menjaga hidrasi tubuh',
        category: 'health_tracking',
        sub_category: 'WATER_INTAKE',
        type: 'daily',
        target_value: 8,
        unit: 'gelas',
        points: 15,
        difficulty: 'easy',
        icon: 'cup-water',
        color: '#3B82F6',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'water_tracking',
          column: 'amount',
          aggregation: 'SUM',
          date_column: 'tracked_date'
        })
      },
      {
        title: 'Minum Air 10 Gelas',
        description: 'Minum minimal 10 gelas air putih dalam sehari untuk aktivitas tinggi',
        category: 'health_tracking',
        sub_category: 'WATER_INTAKE',
        type: 'daily',
        target_value: 10,
        unit: 'gelas',
        points: 20,
        difficulty: 'medium',
        icon: 'cup-water',
        color: '#1D4ED8',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'water_tracking',
          column: 'amount',
          aggregation: 'SUM',
          date_column: 'tracked_date'
        })
      },
      {
        title: 'Tidur 7 Jam',
        description: 'Tidur minimal 7 jam untuk kesehatan optimal',
        category: 'health_tracking',
        sub_category: 'SLEEP_HOURS',
        type: 'daily',
        target_value: 7,
        unit: 'jam',
        points: 20,
        difficulty: 'medium',
        icon: 'sleep',
        color: '#7C3AED',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'sleep_tracking',
          column: 'duration_hours',
          aggregation: 'AVG',
          date_column: 'sleep_date'
        })
      },
      {
        title: 'Tidur 8 Jam',
        description: 'Tidur minimal 8 jam untuk pemulihan maksimal',
        category: 'health_tracking',
        sub_category: 'SLEEP_HOURS',
        type: 'daily',
        target_value: 8,
        unit: 'jam',
        points: 25,
        difficulty: 'hard',
        icon: 'sleep',
        color: '#5B21B6',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'sleep_tracking',
          column: 'duration_hours',
          aggregation: 'AVG',
          date_column: 'sleep_date'
        })
      },

      // FITNESS
      {
        title: 'Olahraga 30 Menit',
        description: 'Lakukan olahraga atau aktivitas fisik selama minimal 30 menit',
        category: 'fitness',
        sub_category: 'EXERCISE_DURATION',
        type: 'daily',
        target_value: 30,
        unit: 'menit',
        points: 25,
        difficulty: 'medium',
        icon: 'dumbbell',
        color: '#059669',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'fitness_tracking',
          column: 'duration_minutes',
          aggregation: 'SUM',
          date_column: 'exercise_date'
        })
      },
      {
        title: 'Olahraga 45 Menit',
        description: 'Lakukan olahraga intensif selama minimal 45 menit',
        category: 'fitness',
        sub_category: 'EXERCISE_DURATION',
        type: 'daily',
        target_value: 45,
        unit: 'menit',
        points: 35,
        difficulty: 'hard',
        icon: 'dumbbell',
        color: '#047857',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'fitness_tracking',
          column: 'duration_minutes',
          aggregation: 'SUM',
          date_column: 'exercise_date'
        })
      },
      {
        title: 'Jalan 10.000 Langkah',
        description: 'Capai target 10.000 langkah dalam sehari',
        category: 'fitness',
        sub_category: 'STEP_COUNT',
        type: 'daily',
        target_value: 10000,
        unit: 'langkah',
        points: 30,
        difficulty: 'medium',
        icon: 'walk',
        color: '#10B981',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'fitness_tracking',
          column: 'steps',
          aggregation: 'SUM',
          date_column: 'exercise_date'
        })
      },

      // NUTRITION
      {
        title: 'Makan 3 Kali Sehari',
        description: 'Makan 3 kali sehari dengan porsi seimbang',
        category: 'nutrition',
        sub_category: 'MEAL_COUNT',
        type: 'daily',
        target_value: 3,
        unit: 'meals',
        points: 20,
        difficulty: 'easy',
        icon: 'food-apple',
        color: '#F59E0B',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'meal_logging',
          column: 'meal_type',
          aggregation: 'COUNT_DISTINCT',
          date_column: 'meal_date'
        })
      },
      {
        title: 'Makan 4 Kali Sehari',
        description: 'Makan 4 kali sehari dengan porsi kecil',
        category: 'nutrition',
        sub_category: 'MEAL_COUNT',
        type: 'daily',
        target_value: 4,
        unit: 'meals',
        points: 30,
        difficulty: 'medium',
        icon: 'food-apple',
        color: '#D97706',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'meal_logging',
          column: 'meal_type',
          aggregation: 'COUNT_DISTINCT',
          date_column: 'meal_date'
        })
      },
      {
        title: 'Konsumsi 60g Protein',
        description: 'Konsumsi minimal 60 gram protein dalam sehari',
        category: 'nutrition',
        sub_category: 'PROTEIN_INTAKE',
        type: 'daily',
        target_value: 60,
        unit: 'gram',
        points: 35,
        difficulty: 'medium',
        icon: 'food-steak',
        color: '#DC2626',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'meal_logging',
          column: 'protein',
          aggregation: 'SUM',
          date_column: 'meal_date'
        })
      },

      // MENTAL HEALTH
      {
        title: 'Mood Stabil',
        description: 'Jaga mood tetap stabil sepanjang hari',
        category: 'mental_health',
        sub_category: 'MOOD_SCORE',
        type: 'daily',
        target_value: 5,
        unit: 'mood_score',
        points: 25,
        difficulty: 'easy',
        icon: 'emoticon-neutral',
        color: '#6B7280',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'mood_tracking',
          column: 'mood_score',
          aggregation: 'AVG',
          date_column: 'tracked_date'
        })
      },
      {
        title: 'Mood Baik',
        description: 'Jaga mood tetap baik sepanjang hari',
        category: 'mental_health',
        sub_category: 'MOOD_SCORE',
        type: 'daily',
        target_value: 6,
        unit: 'mood_score',
        points: 35,
        difficulty: 'medium',
        icon: 'emoticon-happy',
        color: '#10B981',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'mood_tracking',
          column: 'mood_score',
          aggregation: 'AVG',
          date_column: 'tracked_date'
        })
      },
      {
        title: 'Stress Minimal',
        description: 'Jaga tingkat stress tetap minimal',
        category: 'mental_health',
        sub_category: 'STRESS_LEVEL',
        type: 'daily',
        target_value: 2,
        unit: 'stress_level',
        points: 40,
        difficulty: 'medium',
        icon: 'brain',
        color: '#8B5CF6',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'mood_tracking',
          column: 'stress_level',
          aggregation: 'AVG',
          date_column: 'tracked_date'
        })
      },

      // DAILY HABIT
      {
        title: 'Sarapan Pagi',
        description: 'Jangan lewatkan sarapan pagi untuk energi optimal',
        category: 'daily_habit',
        sub_category: 'BREAKFAST_HABIT',
        type: 'daily',
        target_value: 1,
        unit: 'kali',
        points: 15,
        difficulty: 'easy',
        icon: 'food-croissant',
        color: '#F59E0B',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'meal_logging',
          column: 'meal_type',
          aggregation: 'COUNT',
          date_column: 'meal_date',
          filter: "meal_type = 'breakfast'"
        })
      },
      {
        title: 'Meditasi 10 Menit',
        description: 'Lakukan meditasi selama 10 menit untuk ketenangan pikiran',
        category: 'daily_habit',
        sub_category: 'MEDITATION',
        type: 'daily',
        target_value: 10,
        unit: 'menit',
        points: 25,
        difficulty: 'medium',
        icon: 'meditation',
        color: '#7C3AED',
        is_active: true,
        tracking_mapping: JSON.stringify({
          table: 'wellness_activities',
          column: 'duration',
          aggregation: 'SUM',
          date_column: 'completed_at',
          filter: "activity_type = 'meditation'"
        })
      }
    ];

    // Insert new missions
    const insertSql = `
      INSERT INTO missions (
        title, description, category, sub_category, type, target_value, unit, 
        points, difficulty, icon, color, is_active, tracking_mapping, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    for (const mission of newMissions) {
      await connection.execute(insertSql, [
        mission.title,
        mission.description,
        mission.category,
        mission.sub_category,
        mission.type,
        mission.target_value,
        mission.unit,
        mission.points,
        mission.difficulty,
        mission.icon,
        mission.color,
        mission.is_active,
        mission.tracking_mapping
      ]);
    }

    console.log(`✅ Created ${newMissions.length} new missions`);

    // Step 5: Verify the results
    console.log('\n🔍 Step 5: Verifying results...');
    
    const [missionCount] = await connection.execute('SELECT COUNT(*) as count FROM missions');
    const [userMissionCount] = await connection.execute('SELECT COUNT(*) as count FROM user_missions');
    
    console.log(`📊 Total missions: ${missionCount[0].count}`);
    console.log(`📊 Total user missions: ${userMissionCount[0].count}`);

    // Show sample missions
    const [sampleMissions] = await connection.execute(`
      SELECT id, title, category, points, target_value, unit 
      FROM missions 
      ORDER BY id 
      LIMIT 5
    `);

    console.log('\n📋 Sample missions created:');
    sampleMissions.forEach(mission => {
      console.log(`   ${mission.id}. ${mission.title} (${mission.category}) - ${mission.target_value} ${mission.unit} - ${mission.points} points`);
    });

    console.log('\n🎉 Mission reset completed successfully!');
    console.log('✨ All old missions have been deleted and new clean missions have been created.');
    console.log('🔧 This should resolve the invalid mission errors.');

  } catch (error) {
    console.error('❌ Error during mission reset:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  resetAllMissions()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { resetAllMissions };
