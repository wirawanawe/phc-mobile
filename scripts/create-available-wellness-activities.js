const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
      host: process.env.DB_HOST || 'dash.doctorphc.id',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pr1k1t1w',
  database: process.env.DB_NAME || 'phc_dashboard',
  port: process.env.DB_PORT || 3306
};

async function createAvailableWellnessActivities() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check if available_wellness_activities table already exists
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'available_wellness_activities'
    `);
    
    if (tables.length > 0) {
      console.log('✅ available_wellness_activities table already exists.');
      
      // Check if there are already activities
      const [existingActivities] = await connection.execute(`
        SELECT COUNT(*) as count FROM available_wellness_activities
      `);
      
      if (existingActivities[0].count > 0) {
        console.log(`✅ Found ${existingActivities[0].count} existing activities. Skipping creation.`);
        return;
      }
    } else {
      // Create the available_wellness_activities table
      console.log('📝 Creating available_wellness_activities table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS available_wellness_activities (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          duration_minutes INT DEFAULT 0,
          difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
          points INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      await connection.execute(createTableSQL);
      console.log('✅ available_wellness_activities table created successfully.');
    }
    
    // Sample wellness activities data
    const sampleActivities = [
      {
        title: 'Morning Yoga',
        description: 'Start your day with gentle yoga stretches to improve flexibility and reduce stress',
        category: 'fitness',
        duration_minutes: 15,
        difficulty: 'easy',
        points: 10,
        is_active: true
      },
      {
        title: 'Meditation',
        description: 'Practice mindfulness meditation to improve mental clarity and reduce anxiety',
        category: 'mental_health',
        duration_minutes: 10,
        difficulty: 'easy',
        points: 8,
        is_active: true
      },
      {
        title: 'Walking',
        description: 'Take a brisk walk outdoors to improve cardiovascular health and boost mood',
        category: 'fitness',
        duration_minutes: 30,
        difficulty: 'medium',
        points: 15,
        is_active: true
      },
      {
        title: 'Deep Breathing',
        description: 'Practice deep breathing exercises to reduce stress and improve focus',
        category: 'mental_health',
        duration_minutes: 5,
        difficulty: 'easy',
        points: 5,
        is_active: true
      },
      {
        title: 'Stretching',
        description: 'Full body stretching routine to improve flexibility and prevent injury',
        category: 'fitness',
        duration_minutes: 20,
        difficulty: 'medium',
        points: 12,
        is_active: true
      },
      {
        title: 'Journaling',
        description: 'Write in your journal to process thoughts and improve emotional well-being',
        category: 'mental_health',
        duration_minutes: 15,
        difficulty: 'easy',
        points: 8,
        is_active: true
      },
      {
        title: 'Hydration Check',
        description: 'Drink a glass of water and track your daily water intake',
        category: 'nutrition',
        duration_minutes: 1,
        difficulty: 'easy',
        points: 3,
        is_active: true
      },
      {
        title: 'Gratitude Practice',
        description: 'Write down three things you are grateful for today',
        category: 'mental_health',
        duration_minutes: 5,
        difficulty: 'easy',
        points: 6,
        is_active: true
      },
      {
        title: 'Quick Workout',
        description: 'Do a quick 10-minute bodyweight workout',
        category: 'fitness',
        duration_minutes: 10,
        difficulty: 'medium',
        points: 12,
        is_active: true
      },
      {
        title: 'Mindful Eating',
        description: 'Eat a meal mindfully, focusing on taste, texture, and hunger cues',
        category: 'nutrition',
        duration_minutes: 20,
        difficulty: 'medium',
        points: 10,
        is_active: true
      },
      {
        title: 'Reading',
        description: 'Read a book or article for personal growth and relaxation',
        category: 'mental_health',
        duration_minutes: 20,
        difficulty: 'easy',
        points: 8,
        is_active: true
      },
      {
        title: 'Nature Walk',
        description: 'Take a walk in nature to connect with the environment and reduce stress',
        category: 'fitness',
        duration_minutes: 25,
        difficulty: 'easy',
        points: 12,
        is_active: true
      },
      {
        title: 'Progressive Muscle Relaxation',
        description: 'Practice progressive muscle relaxation to reduce tension and anxiety',
        category: 'mental_health',
        duration_minutes: 15,
        difficulty: 'medium',
        points: 10,
        is_active: true
      },
      {
        title: 'Healthy Snack',
        description: 'Choose and eat a healthy snack mindfully',
        category: 'nutrition',
        duration_minutes: 5,
        difficulty: 'easy',
        points: 4,
        is_active: true
      },
      {
        title: 'Dance',
        description: 'Dance to your favorite music for fun and exercise',
        category: 'fitness',
        duration_minutes: 15,
        difficulty: 'medium',
        points: 12,
        is_active: true
      }
    ];
    
    console.log('📝 Inserting sample wellness activities...');
    
    for (const activity of sampleActivities) {
      await connection.execute(`
        INSERT INTO available_wellness_activities (title, description, category, duration_minutes, difficulty, points, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        activity.title,
        activity.description,
        activity.category,
        activity.duration_minutes,
        activity.difficulty,
        activity.points,
        activity.is_active
      ]);
    }
    
    console.log(`✅ Successfully added ${sampleActivities.length} sample wellness activities!`);
    
    // Verify the insertion
    const [verification] = await connection.execute(`
      SELECT COUNT(*) as count FROM available_wellness_activities
    `);
    
    console.log(`📊 Total wellness activities in database: ${verification[0].count}`);
    
    // Show sample activities
    const [sample] = await connection.execute(`
      SELECT id, title, category, difficulty, points FROM available_wellness_activities LIMIT 5
    `);
    
    console.log('\n📋 Sample activities:');
    sample.forEach(activity => {
      console.log(`  ${activity.id}. ${activity.title} (${activity.category}) - ${activity.difficulty} - ${activity.points} points`);
    });
    
  } catch (error) {
    console.error('❌ Error creating available wellness activities:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createAvailableWellnessActivities();
