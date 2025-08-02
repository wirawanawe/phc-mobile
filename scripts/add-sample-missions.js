const { query } = require('../dash-app/lib/db');

async function addSampleMissions() {
  try {
    console.log('🔍 Checking existing missions...');
    
    // Check if missions exist
    const existingMissions = await query('SELECT COUNT(*) as count FROM missions WHERE is_active = 1');
    const count = existingMissions[0].count;
    
    console.log(`📊 Found ${count} active missions`);
    
    if (count > 0) {
      console.log('✅ Missions already exist, skipping...');
      return;
    }
    
    console.log('➕ Adding sample missions...');
    
    const sampleMissions = [
      {
        title: "Daily Water Intake",
        description: "Drink 8 glasses of water today to stay hydrated and healthy",
        category: "health_tracking",
        difficulty: "easy",
        points: 10,
        target_value: 8,
        unit: "glasses",
        type: "daily",
        icon: "water",
        color: "#3B82F6",
        is_active: true
      },
      {
        title: "Morning Exercise",
        description: "Do 30 minutes of exercise to boost your energy and fitness",
        category: "fitness",
        difficulty: "medium",
        points: 20,
        target_value: 30,
        unit: "minutes",
        type: "daily",
        icon: "dumbbell",
        color: "#F59E0B",
        is_active: true
      },
      {
        title: "Healthy Eating",
        description: "Eat 3 balanced meals today with proper nutrition",
        category: "nutrition",
        difficulty: "easy",
        points: 15,
        target_value: 3,
        unit: "meals",
        type: "daily",
        icon: "food-apple",
        color: "#EF4444",
        is_active: true
      },
      {
        title: "Mental Wellness",
        description: "Practice 10 minutes of meditation for mental clarity",
        category: "mental_health",
        difficulty: "medium",
        points: 25,
        target_value: 10,
        unit: "minutes",
        type: "daily",
        icon: "brain",
        color: "#8B5CF6",
        is_active: true
      },
      {
        title: "Sleep Quality",
        description: "Get 7-8 hours of quality sleep tonight",
        category: "health_tracking",
        difficulty: "easy",
        points: 15,
        target_value: 7,
        unit: "hours",
        type: "daily",
        icon: "moon",
        color: "#6366F1",
        is_active: true
      },
      {
        title: "Step Goal",
        description: "Walk 10,000 steps today for better health",
        category: "fitness",
        difficulty: "medium",
        points: 20,
        target_value: 10000,
        unit: "steps",
        type: "daily",
        icon: "walk",
        color: "#10B981",
        is_active: true
      },
      {
        title: "Stress Management",
        description: "Take 3 deep breathing breaks throughout the day",
        category: "mental_health",
        difficulty: "easy",
        points: 10,
        target_value: 3,
        unit: "breaks",
        type: "daily",
        icon: "heart-pulse",
        color: "#8B5CF6",
        is_active: true
      },
      {
        title: "Fruit Intake",
        description: "Eat 2 servings of fruits today",
        category: "nutrition",
        difficulty: "easy",
        points: 12,
        target_value: 2,
        unit: "servings",
        type: "daily",
        icon: "food-apple",
        color: "#EF4444",
        is_active: true
      }
    ];
    
    for (const mission of sampleMissions) {
      const sql = `
        INSERT INTO missions (
          title, description, category, difficulty, points, 
          target_value, unit, type, icon, color, is_active, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        mission.title,
        mission.description,
        mission.category,
        mission.difficulty,
        mission.points,
        mission.target_value,
        mission.unit,
        mission.type,
        mission.icon,
        mission.color,
        mission.is_active
      ]);
      
      console.log(`✅ Added mission: ${mission.title} (ID: ${result.insertId})`);
    }
    
    console.log('🎉 Sample missions added successfully!');
    
    // Verify missions were added
    const verifyMissions = await query('SELECT id, title, is_active FROM missions WHERE is_active = 1');
    console.log('📋 Active missions after adding:', verifyMissions);
    
  } catch (error) {
    console.error('❌ Error adding sample missions:', error);
  }
}

// Run the script
addSampleMissions().then(() => {
  console.log('🏁 Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 