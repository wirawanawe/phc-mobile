#!/usr/bin/env node

/**
 * Database Migration Script: Fix Wellness Activities Schema
 * 
 * This script fixes the wellness_activities table schema to match
 * the frontend expectations and resolve the "Unknown column 'name'" error.
 */

const mysql = require('mysql2/promise');

// Database configuration - update these values for your environment
const dbConfig = {
  host: 'localhost',
  user: 'root', // Update with your database user
  password: '', // Update with your database password
  database: 'phc_database', // Update with your database name
  port: 3306
};

async function fixWellnessActivitiesSchema() {
  let connection;
  
  try {
    console.log('🔧 Starting wellness_activities schema fix...');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if table exists
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'wellness_activities'
    `);
    
    if (tables.length === 0) {
      console.log('📋 Creating wellness_activities table...');
      
      // Create the table with correct schema
      await connection.execute(`
        CREATE TABLE wellness_activities (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          duration_minutes INT DEFAULT 0,
          calories_burn INT DEFAULT 0,
          difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
          instructions TEXT,
          image_url VARCHAR(500),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ wellness_activities table created successfully');
      
      // Insert sample data
      await connection.execute(`
        INSERT INTO wellness_activities (title, description, category, duration_minutes, calories_burn, difficulty_level, instructions) VALUES
        ('Morning Yoga Session', 'Start your day with gentle yoga and meditation', 'yoga', 30, 120, 'easy', 'Find a quiet space and follow the guided session'),
        ('Lunch Break Walking Group', 'Join colleagues for a refreshing walk during lunch', 'fitness', 20, 80, 'easy', 'Meet at the main entrance for a group walk'),
        ('Healthy Cooking Workshop', 'Learn to prepare nutritious meals for busy professionals', 'nutrition', 60, 150, 'medium', 'Bring your own ingredients and learn healthy cooking techniques'),
        ('Stress Management Seminar', 'Learn effective techniques to manage workplace stress', 'mental', 45, 100, 'medium', 'Interactive seminar with practical exercises'),
        ('Team Building Exercise', 'Fun team activities to build camaraderie and wellness', 'social', 90, 200, 'easy', 'Group activities to improve team dynamics'),
        ('Evening Meditation Circle', 'Unwind with guided meditation and mindfulness', 'yoga', 25, 80, 'easy', 'Quiet meditation session to end your day')
      `);
      
      console.log('✅ Sample wellness activities inserted');
      
    } else {
      console.log('📋 wellness_activities table exists, checking schema...');
      
      // Check current table structure
      const [columns] = await connection.execute(`
        DESCRIBE wellness_activities
      `);
      
      const columnNames = columns.map(col => col.Field);
      console.log('Current columns:', columnNames);
      
      // Check if 'name' column exists (old schema)
      if (columnNames.includes('name')) {
        console.log('🔄 Found old schema with "name" column, updating to "title"...');
        
        // Rename 'name' column to 'title'
        await connection.execute(`
          ALTER TABLE wellness_activities 
          CHANGE COLUMN name title VARCHAR(255) NOT NULL
        `);
        
        console.log('✅ Renamed "name" column to "title"');
      }
      
      // Add missing columns if they don't exist
      const requiredColumns = [
        { name: 'description', type: 'TEXT' },
        { name: 'category', type: 'VARCHAR(100)' },
        { name: 'duration_minutes', type: 'INT DEFAULT 0' },
        { name: 'calories_burn', type: 'INT DEFAULT 0' },
        { name: 'difficulty_level', type: "ENUM('easy', 'medium', 'hard') DEFAULT 'easy'" },
        { name: 'instructions', type: 'TEXT' },
        { name: 'image_url', type: 'VARCHAR(500)' },
        { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE' },
        { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
      ];
      
      for (const column of requiredColumns) {
        if (!columnNames.includes(column.name)) {
          console.log(`➕ Adding missing column: ${column.name}`);
          await connection.execute(`
            ALTER TABLE wellness_activities 
            ADD COLUMN ${column.name} ${column.type}
          `);
        }
      }
      
      console.log('✅ Schema update completed');
    }
    
    // Verify the final schema
    const [finalColumns] = await connection.execute(`
      DESCRIBE wellness_activities
    `);
    
    console.log('\n📋 Final wellness_activities table structure:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Test query to ensure it works
    const [testResult] = await connection.execute(`
      SELECT id, title, description, category, duration_minutes, 
             calories_burn, difficulty_level, instructions, 
             image_url, is_active, created_at, updated_at
      FROM wellness_activities 
      LIMIT 1
    `);
    
    console.log('\n✅ Test query successful!');
    console.log('Sample data:', testResult[0]);
    
    console.log('\n🎉 Wellness activities schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing wellness_activities schema:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
if (require.main === module) {
  fixWellnessActivitiesSchema()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { fixWellnessActivitiesSchema }; 