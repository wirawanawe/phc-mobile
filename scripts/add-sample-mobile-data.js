const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_db',
  port: process.env.DB_PORT || 3306
};

async function addSampleData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Add sample wellness activities
    console.log('Adding sample wellness activities...');
    const activities = [
      {
        title: 'Morning Yoga',
        description: 'Start your day with gentle yoga stretches to improve flexibility and reduce stress',
        category: 'fitness',
        duration_minutes: 15,
        difficulty: 'beginner',
        points: 10,
        is_active: 1
      },
      {
        title: 'Meditation',
        description: 'Practice mindfulness meditation for mental clarity and stress relief',
        category: 'mental_health',
        duration_minutes: 10,
        difficulty: 'beginner',
        points: 8,
        is_active: 1
      },
      {
        title: 'Walking',
        description: 'Take a brisk walk outdoors to improve cardiovascular health',
        category: 'fitness',
        duration_minutes: 30,
        difficulty: 'beginner',
        points: 15,
        is_active: 1
      },
      {
        title: 'Strength Training',
        description: 'Build muscle and improve bone density with resistance exercises',
        category: 'fitness',
        duration_minutes: 45,
        difficulty: 'intermediate',
        points: 20,
        is_active: 1
      },
      {
        title: 'Deep Breathing',
        description: 'Practice deep breathing exercises for relaxation and stress management',
        category: 'mental_health',
        duration_minutes: 5,
        difficulty: 'beginner',
        points: 5,
        is_active: 1
      },
      {
        title: 'Swimming',
        description: 'Low-impact full-body workout that improves cardiovascular fitness',
        category: 'fitness',
        duration_minutes: 30,
        difficulty: 'intermediate',
        points: 18,
        is_active: 1
      },
      {
        title: 'Journaling',
        description: 'Write down your thoughts and feelings for emotional well-being',
        category: 'mental_health',
        duration_minutes: 15,
        difficulty: 'beginner',
        points: 8,
        is_active: 1
      },
      {
        title: 'Cycling',
        description: 'Cardiovascular exercise that strengthens legs and improves endurance',
        category: 'fitness',
        duration_minutes: 45,
        difficulty: 'intermediate',
        points: 20,
        is_active: 1
      }
    ];

    for (const activity of activities) {
      await connection.execute(
        'INSERT INTO available_wellness_activities (title, description, category, duration_minutes, difficulty, points, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [activity.title, activity.description, activity.category, activity.duration_minutes, activity.difficulty, activity.points, activity.is_active]
      );
    }

    // Add sample mood tracking data
    console.log('Adding sample mood tracking data...');
    const moodData = [
      {
        user_id: 1,
        mood_level: 'happy',
        mood_score: 8,
        stress_level: 'low',
        energy_level: 'high',
        sleep_quality: 'good',
        tracking_date: '2025-01-15',
        notes: 'Had a great workout this morning'
      },
      {
        user_id: 1,
        mood_level: 'neutral',
        mood_score: 5,
        stress_level: 'moderate',
        energy_level: 'medium',
        sleep_quality: 'fair',
        tracking_date: '2025-01-14',
        notes: 'Busy day at work'
      },
      {
        user_id: 2,
        mood_level: 'very_happy',
        mood_score: 10,
        stress_level: 'low',
        energy_level: 'high',
        sleep_quality: 'excellent',
        tracking_date: '2025-01-15',
        notes: 'Completed my fitness goal!'
      },
      {
        user_id: 2,
        mood_level: 'sad',
        mood_score: 3,
        stress_level: 'high',
        energy_level: 'low',
        sleep_quality: 'poor',
        tracking_date: '2025-01-13',
        notes: 'Not feeling well today'
      }
    ];

    for (const mood of moodData) {
      await connection.execute(
        'INSERT INTO mood_tracking (user_id, mood_level, mood_score, stress_level, energy_level, sleep_quality, tracking_date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [mood.user_id, mood.mood_level, mood.mood_score, mood.stress_level, mood.energy_level, mood.sleep_quality, mood.tracking_date, mood.notes]
      );
    }

    // Add sample sleep tracking data
    console.log('Adding sample sleep tracking data...');
    const sleepData = [
      {
        user_id: 1,
        sleep_date: '2025-01-15',
        bedtime: '22:30:00',
        wake_time: '06:30:00',
        sleep_hours: 8,
        sleep_duration_minutes: 480,
        sleep_quality: 'good',
        deep_sleep_hours: 2,
        rem_sleep_hours: 1.5,
        light_sleep_hours: 4.5,
        sleep_efficiency: 85,
        notes: 'Slept well, feeling refreshed'
      },
      {
        user_id: 1,
        sleep_date: '2025-01-14',
        bedtime: '23:00:00',
        wake_time: '07:00:00',
        sleep_hours: 8,
        sleep_duration_minutes: 480,
        sleep_quality: 'excellent',
        deep_sleep_hours: 2.5,
        rem_sleep_hours: 2,
        light_sleep_hours: 3.5,
        sleep_efficiency: 90,
        notes: 'Very restful sleep'
      },
      {
        user_id: 2,
        sleep_date: '2025-01-15',
        bedtime: '00:30:00',
        wake_time: '08:00:00',
        sleep_hours: 7.5,
        sleep_duration_minutes: 450,
        sleep_quality: 'fair',
        deep_sleep_hours: 1.5,
        rem_sleep_hours: 1,
        light_sleep_hours: 5,
        sleep_efficiency: 75,
        notes: 'Late to bed, but slept okay'
      }
    ];

    for (const sleep of sleepData) {
      await connection.execute(
        'INSERT INTO sleep_tracking (user_id, sleep_date, bedtime, wake_time, sleep_hours, sleep_duration_minutes, sleep_quality, deep_sleep_hours, rem_sleep_hours, light_sleep_hours, sleep_efficiency, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [sleep.user_id, sleep.sleep_date, sleep.bedtime, sleep.wake_time, sleep.sleep_hours, sleep.sleep_duration_minutes, sleep.sleep_quality, sleep.deep_sleep_hours, sleep.rem_sleep_hours, sleep.light_sleep_hours, sleep.sleep_efficiency, sleep.notes]
      );
    }

    // Add sample health data
    console.log('Adding sample health data...');
    const healthData = [
      {
        user_id: 1,
        data_type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        recorded_date: '2025-01-15',
        notes: 'Normal blood pressure reading'
      },
      {
        user_id: 1,
        data_type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        recorded_date: '2025-01-15',
        notes: 'Resting heart rate'
      },
      {
        user_id: 1,
        data_type: 'weight',
        value: 70,
        unit: 'kg',
        recorded_date: '2025-01-15',
        notes: 'Morning weight'
      },
      {
        user_id: 2,
        data_type: 'blood_sugar',
        value: 95,
        unit: 'mg/dL',
        recorded_date: '2025-01-15',
        notes: 'Fasting blood sugar'
      },
      {
        user_id: 2,
        data_type: 'temperature',
        value: 36.8,
        unit: '°C',
        recorded_date: '2025-01-15',
        notes: 'Body temperature'
      }
    ];

    for (const health of healthData) {
      await connection.execute(
        'INSERT INTO health_data (user_id, data_type, value, unit, recorded_date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [health.user_id, health.data_type, health.value, health.unit, health.recorded_date, health.notes]
      );
    }

    // Add sample user wellness activities
    console.log('Adding sample user wellness activities...');
    const userActivities = [
      {
        user_id: 1,
        activity_id: 1,
        notes: 'Great morning yoga session',
        mood_before: 'neutral',
        mood_after: 'happy',
        stress_level_before: 'moderate',
        stress_level_after: 'low',
        completed_at: '2025-01-15 07:00:00'
      },
      {
        user_id: 1,
        activity_id: 3,
        notes: '30-minute walk in the park',
        mood_before: 'happy',
        mood_after: 'very_happy',
        stress_level_before: 'low',
        stress_level_after: 'low',
        completed_at: '2025-01-15 18:00:00'
      },
      {
        user_id: 2,
        activity_id: 2,
        notes: 'Meditation helped clear my mind',
        mood_before: 'sad',
        mood_after: 'neutral',
        stress_level_before: 'high',
        stress_level_after: 'moderate',
        completed_at: '2025-01-15 20:00:00'
      }
    ];

    for (const activity of userActivities) {
      await connection.execute(
        'INSERT INTO user_wellness_activities (user_id, activity_id, notes, mood_before, mood_after, stress_level_before, stress_level_after, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [activity.user_id, activity.activity_id, activity.notes, activity.mood_before, activity.mood_after, activity.stress_level_before, activity.stress_level_after, activity.completed_at]
      );
    }

    // Add sample water tracking data
    console.log('Adding sample water tracking data...');
    const waterData = [
      {
        user_id: 1,
        water_intake: 2000,
        target_water: 2500,
        created_at: '2025-01-15 08:00:00'
      },
      {
        user_id: 1,
        water_intake: 1800,
        target_water: 2500,
        created_at: '2025-01-14 08:00:00'
      },
      {
        user_id: 2,
        water_intake: 2200,
        target_water: 2000,
        created_at: '2025-01-15 08:00:00'
      }
    ];

    for (const water of waterData) {
      await connection.execute(
        'INSERT INTO water_tracking (user_id, water_intake, target_water, created_at, updated_at) VALUES (?, ?, ?, ?, NOW())',
        [water.user_id, water.water_intake, water.target_water, water.created_at]
      );
    }

    console.log('Sample data added successfully!');

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the script
addSampleData();
