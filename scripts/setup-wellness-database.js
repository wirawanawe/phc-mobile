#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Setting up Wellness Database...\n');

// Check if we're in the right directory
const checkDirectory = () => {
  console.log('📁 Checking directory structure...');
  
  if (!fs.existsSync('dash-app')) {
    console.log('❌ dash-app directory not found');
    console.log('💡 Please run this script from the phc-mobile root directory');
    return false;
  }
  
  console.log('✅ dash-app directory found');
  return true;
};

// Check database configuration
const checkDatabaseConfig = () => {
  console.log('\n🗄️ Checking database configuration...');
  
  const dbConfigFile = 'dash-app/lib/db.js';
  if (!fs.existsSync(dbConfigFile)) {
    console.log('❌ Database configuration file not found');
    return false;
  }
  
  console.log('✅ Database configuration file found');
  
  // Try to read database config
  try {
    const content = fs.readFileSync(dbConfigFile, 'utf8');
    if (content.includes('mysql') || content.includes('database')) {
      console.log('✅ Database configuration looks valid');
    } else {
      console.log('⚠️ Database configuration may need review');
    }
  } catch (error) {
    console.log('❌ Error reading database configuration:', error.message);
  }
  
  return true;
};

// Check required SQL scripts
const checkSQLScripts = () => {
  console.log('\n📜 Checking required SQL scripts...');
  
  const requiredScripts = [
    'dash-app/init-scripts/00-complete-setup.sql',
    'dash-app/init-scripts/16-add-wellness-program-fields.sql'
  ];
  
  let allScriptsFound = true;
  requiredScripts.forEach(script => {
    if (fs.existsSync(script)) {
      console.log(`✅ ${script} - Found`);
    } else {
      console.log(`❌ ${script} - Missing`);
      allScriptsFound = false;
    }
  });
  
  return allScriptsFound;
};

// Check if backend server is running
const checkBackendServer = () => {
  console.log('\n🌐 Checking backend server...');
  
  try {
    const result = execSync('curl -s http://localhost:3000/api/health', { encoding: 'utf8' });
    if (result.includes('success') || result.length > 0) {
      console.log('✅ Backend server is running');
      return true;
    } else {
      console.log('⚠️ Backend server responding but unexpected format');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend server not running');
    return false;
  }
};

// Provide setup instructions
const provideSetupInstructions = () => {
  console.log('\n🔧 Wellness Database Setup Instructions:');
  console.log('');
  
  console.log('1️⃣ **Start Backend Server:**');
  console.log('   cd dash-app');
  console.log('   npm run dev');
  console.log('');
  
  console.log('2️⃣ **Run Database Setup Scripts:**');
  console.log('   # Option 1: Run complete setup');
  console.log('   mysql -u [username] -p [database] < init-scripts/00-complete-setup.sql');
  console.log('');
  console.log('   # Option 2: Run wellness fields only');
  console.log('   mysql -u [username] -p [database] < init-scripts/16-add-wellness-program-fields.sql');
  console.log('');
  
  console.log('3️⃣ **Verify Database Tables:**');
  console.log('   mysql -u [username] -p [database]');
  console.log('   SHOW TABLES;');
  console.log('   DESCRIBE mobile_users;');
  console.log('   DESCRIBE health_data;');
  console.log('');
  
  console.log('4️⃣ **Check Wellness Fields:**');
  console.log('   SELECT wellness_program_joined, wellness_join_date, activity_level, fitness_goal');
  console.log('   FROM mobile_users LIMIT 5;');
  console.log('');
  
  console.log('5️⃣ **Test Wellness Setup:**');
  console.log('   - Open app and login');
  console.log('   - Try to setup wellness program');
  console.log('   - Check if data saves successfully');
  console.log('');
  
  console.log('6️⃣ **Debug if Issues Persist:**');
  console.log('   - Check backend logs for database errors');
  console.log('   - Use "Debug Wellness" in Profile screen');
  console.log('   - Verify database connection');
  console.log('');
};

// Check current database status
const checkCurrentStatus = () => {
  console.log('\n🔍 Checking current database status...');
  
  try {
    // Check if we can test the wellness endpoint
    console.log('🔍 Testing wellness setup endpoint...');
    const result = execSync('curl -s http://localhost:3000/api/mobile/setup-wellness', { encoding: 'utf8' });
    
    if (result.includes('Unauthorized')) {
      console.log('✅ Endpoint responding (requires authentication)');
    } else if (result.includes('success')) {
      console.log('✅ Endpoint responding with success');
    } else {
      console.log('⚠️ Endpoint responding but unexpected format');
    }
    
  } catch (error) {
    console.log('❌ Cannot test endpoint - backend may not be running');
  }
};

// Main execution
const main = () => {
  console.log('🏥 PHC Mobile - Wellness Database Setup\n');
  console.log('=' .repeat(60));
  
  const dirOk = checkDirectory();
  if (!dirOk) {
    console.log('\n❌ Please run this script from the phc-mobile root directory');
    return;
  }
  
  const dbConfigOk = checkDatabaseConfig();
  const scriptsOk = checkSQLScripts();
  const backendOk = checkBackendServer();
  checkCurrentStatus();
  
  console.log('\n' + '=' .repeat(60));
  
  if (!scriptsOk) {
    console.log('\n❌ **Missing required SQL scripts**');
    console.log('Please ensure all required SQL scripts are present');
  }
  
  if (!backendOk) {
    console.log('\n⚠️ **Backend server not running**');
    console.log('Please start the backend server first');
  }
  
  provideSetupInstructions();
  
  console.log('\n🎯 **Expected Results After Setup:**');
  console.log('✅ mobile_users table with wellness fields');
  console.log('✅ health_data table for storing wellness data');
  console.log('✅ user_missions table for tracking progress');
  console.log('✅ wellness_activities table for activities');
  console.log('✅ Backend API endpoints working');
  console.log('✅ Frontend can save wellness data');
  
  console.log('\n🔧 **Quick Setup Commands:**');
  console.log('1. Start backend: cd dash-app && npm run dev');
  console.log('2. Run setup: mysql -u [user] -p [db] < init-scripts/00-complete-setup.sql');
  console.log('3. Add wellness fields: mysql -u [user] -p [db] < init-scripts/16-add-wellness-program-fields.sql');
  console.log('4. Test wellness setup in app');
  
  console.log('\n✅ **After running these commands, wellness data saving should work!**');
};

main();
