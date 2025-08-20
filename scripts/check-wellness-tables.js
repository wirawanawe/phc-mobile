#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Checking Wellness Database Tables...\n');

// Check if database tables exist
const checkDatabaseTables = () => {
  console.log('🗄️ Checking if wellness tables exist in database...');
  
  try {
    // Check if we can connect to database
    const dbConfigFile = 'dash-app/lib/db.js';
    if (!fs.existsSync(dbConfigFile)) {
      console.log('❌ Database configuration file not found');
      return false;
    }
    
    console.log('✅ Database configuration file found');
    
    // Try to check tables using MySQL command
    const tables = [
      'mobile_users',
      'health_data', 
      'user_missions',
      'wellness_activities',
      'missions'
    ];
    
    tables.forEach(table => {
      try {
        // This is a simple check - in real scenario you'd use proper database connection
        console.log(`🔍 Checking table: ${table}`);
        
        // Check if table exists in any of the SQL files
        const sqlFiles = [
          'dash-app/init-scripts/00-complete-setup.sql',
          'dash-app/init-scripts/02-mobile-app-tables.sql',
          'dash-app/init-scripts/03-mobile-tables.sql'
        ];
        
        let tableFound = false;
        sqlFiles.forEach(file => {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes(`CREATE TABLE.*${table}`) || content.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
              console.log(`✅ Table ${table} - Found in ${file}`);
              tableFound = true;
            }
          }
        });
        
        if (!tableFound) {
          console.log(`❌ Table ${table} - Not found in SQL files`);
        }
        
      } catch (error) {
        console.log(`❌ Error checking table ${table}:`, error.message);
      }
    });
    
  } catch (error) {
    console.log('❌ Error checking database tables:', error.message);
  }
};

// Check wellness program fields
const checkWellnessFields = () => {
  console.log('\n🏥 Checking wellness program fields...');
  
  try {
    const sqlFiles = [
      'dash-app/init-scripts/00-complete-setup.sql',
      'dash-app/init-scripts/02-mobile-app-tables.sql',
      'dash-app/init-scripts/03-mobile-tables.sql'
    ];
    
    const requiredFields = [
      'wellness_program_joined',
      'wellness_join_date',
      'fitness_goal',
      'activity_level'
    ];
    
    sqlFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        if (content.includes('mobile_users')) {
          console.log(`\n🔍 Checking ${file} for wellness fields:`);
          
          requiredFields.forEach(field => {
            if (content.includes(field)) {
              console.log(`✅ ${field} - Found`);
            } else {
              console.log(`❌ ${field} - Missing`);
            }
          });
        }
      }
    });
    
  } catch (error) {
    console.log('❌ Error checking wellness fields:', error.message);
  }
};

// Check if tables need to be created
const checkTableCreation = () => {
  console.log('\n🔧 Checking if tables need to be created...');
  
  try {
    // Check if complete setup script exists
    const setupScript = 'dash-app/init-scripts/00-complete-setup.sql';
    if (fs.existsSync(setupScript)) {
      console.log('✅ Complete setup script found');
      
      const content = fs.readFileSync(setupScript, 'utf8');
      
      // Check for key tables
      const keyTables = [
        'mobile_users',
        'health_data',
        'user_missions',
        'wellness_activities'
      ];
      
      keyTables.forEach(table => {
        if (content.includes(`CREATE TABLE.*${table}`) || content.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
          console.log(`✅ ${table} table creation found`);
        } else {
          console.log(`❌ ${table} table creation missing`);
        }
      });
      
    } else {
      console.log('❌ Complete setup script not found');
    }
    
  } catch (error) {
    console.log('❌ Error checking table creation:', error.message);
  }
};

// Provide solutions
const provideSolutions = () => {
  console.log('\n🔧 Solutions for Wellness Data Saving Issues:');
  console.log('');
  
  console.log('1️⃣ **Run Database Setup:**');
  console.log('   cd dash-app');
  console.log('   mysql -u [username] -p [database] < init-scripts/00-complete-setup.sql');
  console.log('');
  
  console.log('2️⃣ **Check Database Connection:**');
  console.log('   - Verify database credentials in lib/db.js');
  console.log('   - Ensure database server is running');
  console.log('   - Check if database exists');
  console.log('');
  
  console.log('3️⃣ **Verify Tables Exist:**');
  console.log('   - Run: SHOW TABLES; in MySQL');
  console.log('   - Check for mobile_users, health_data tables');
  console.log('   - Verify wellness fields exist');
  console.log('');
  
  console.log('4️⃣ **Check User Data:**');
  console.log('   - Ensure user exists in mobile_users table');
  console.log('   - Check if user has date_of_birth');
  console.log('   - Verify user authentication');
  console.log('');
  
  console.log('5️⃣ **Test API Endpoint:**');
  console.log('   - Ensure backend server is running');
  console.log('   - Test with valid authentication');
  console.log('   - Check for proper error messages');
  console.log('');
  
  console.log('6️⃣ **Debug Steps:**');
  console.log('   - Check backend logs for database errors');
  console.log('   - Use "Debug Wellness" in Profile screen');
  console.log('   - Verify all required fields are filled');
  console.log('');
};

// Main execution
const main = () => {
  console.log('🏥 PHC Mobile - Wellness Database Checker\n');
  console.log('=' .repeat(60));
  
  checkDatabaseTables();
  checkWellnessFields();
  checkTableCreation();
  
  console.log('\n' + '=' .repeat(60));
  
  provideSolutions();
  
  console.log('\n🎯 **Most Likely Issues:**');
  console.log('1. Database tables not created');
  console.log('2. Database connection problems');
  console.log('3. Missing wellness fields in mobile_users table');
  console.log('4. User not found in database');
  console.log('5. Authentication issues');
  console.log('6. Network connectivity problems');
  
  console.log('\n🔧 **Quick Fix Steps:**');
  console.log('1. Run database setup: cd dash-app && mysql -u [user] -p [db] < init-scripts/00-complete-setup.sql');
  console.log('2. Check database connection in lib/db.js');
  console.log('3. Ensure backend server is running');
  console.log('4. Verify user exists and is authenticated');
  console.log('5. Test wellness setup with valid data');
  console.log('6. Check backend logs for specific errors');
  
  console.log('\n✅ **After fixing database issues, wellness data saving should work!**');
};

main();
