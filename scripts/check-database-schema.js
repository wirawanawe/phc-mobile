const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'pr1k1t1w',
  database: 'phc_dashboard',
  port: 3306
};

async function checkDatabaseSchema() {
  let connection;
  
  try {
    console.log('🔍 Checking database schema...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check mood_tracking table structure
    console.log('\n1. Mood Tracking Table Structure:');
    const moodColumns = await connection.execute('DESCRIBE mood_tracking');
    console.log('Columns:', moodColumns[0].map(col => col.Field).join(', '));
    
    // Check water_tracking table structure
    console.log('\n2. Water Tracking Table Structure:');
    const waterColumns = await connection.execute('DESCRIBE water_tracking');
    console.log('Columns:', waterColumns[0].map(col => col.Field).join(', '));
    
    // Check fitness_tracking table structure
    console.log('\n3. Fitness Tracking Table Structure:');
    const fitnessColumns = await connection.execute('DESCRIBE fitness_tracking');
    console.log('Columns:', fitnessColumns[0].map(col => col.Field).join(', '));
    
    // Check meal_tracking table structure
    console.log('\n4. Meal Tracking Table Structure:');
    const mealColumns = await connection.execute('DESCRIBE meal_tracking');
    console.log('Columns:', mealColumns[0].map(col => col.Field).join(', '));
    
    // Check sleep_tracking table structure
    console.log('\n5. Sleep Tracking Table Structure:');
    const sleepColumns = await connection.execute('DESCRIBE sleep_tracking');
    console.log('Columns:', sleepColumns[0].map(col => col.Field).join(', '));
    
    console.log('\n✅ Database schema check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

checkDatabaseSchema();
