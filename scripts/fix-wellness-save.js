#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing Wellness Data Saving Issues...\n');

// Check backend endpoint
const checkBackendEndpoint = () => {
  console.log('🔍 Checking backend setup-wellness endpoint...');
  
  try {
    const endpointFile = 'dash-app/app/api/mobile/setup-wellness/route.js';
    if (fs.existsSync(endpointFile)) {
      const content = fs.readFileSync(endpointFile, 'utf8');
      
      // Check for required functions
      const checks = [
        { name: 'POST method', pattern: 'export async function POST' },
        { name: 'User authentication', pattern: 'getMobileUserFromRequest' },
        { name: 'Input validation', pattern: 'Validasi input' },
        { name: 'Database queries', pattern: 'INSERT INTO health_data' },
        { name: 'User update', pattern: 'UPDATE mobile_users' },
        { name: 'Age calculation', pattern: 'calculateAge' }
      ];
      
      checks.forEach(check => {
        if (content.includes(check.pattern)) {
          console.log(`✅ ${check.name} - Found`);
        } else {
          console.log(`❌ ${check.name} - Missing`);
        }
      });
      
      return true;
    } else {
      console.log('❌ Setup wellness endpoint not found');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking backend endpoint:', error.message);
    return false;
  }
};

// Check database tables
const checkDatabaseTables = () => {
  console.log('\n🗄️ Checking database tables...');
  
  try {
    const initScripts = [
      'dash-app/init-scripts/02-mobile-app-tables.sql',
      'dash-app/init-scripts/03-wellness-tables.sql'
    ];
    
    initScripts.forEach(script => {
      if (fs.existsSync(script)) {
        const content = fs.readFileSync(script, 'utf8');
        
        // Check for required tables
        const tables = [
          'mobile_users',
          'health_data',
          'user_missions',
          'wellness_activities'
        ];
        
        tables.forEach(table => {
          if (content.includes(`CREATE TABLE ${table}`) || content.includes(`CREATE TABLE \`${table}\``)) {
            console.log(`✅ Table ${table} - Found in ${script}`);
          } else {
            console.log(`❌ Table ${table} - Missing in ${script}`);
          }
        });
      } else {
        console.log(`⚠️ Script not found: ${script}`);
      }
    });
    
  } catch (error) {
    console.log('❌ Error checking database tables:', error.message);
  }
};

// Test API endpoint
const testAPIEndpoint = () => {
  console.log('\n🌐 Testing setup-wellness API endpoint...');
  
  try {
    // Test GET endpoint
    console.log('🔍 Testing GET /api/mobile/setup-wellness...');
    const getResult = execSync('curl -s http://localhost:3000/api/mobile/setup-wellness', { encoding: 'utf8' });
    
    if (getResult.includes('Unauthorized') || getResult.includes('success')) {
      console.log('✅ GET endpoint responding (requires auth)');
    } else {
      console.log('❌ GET endpoint not responding');
    }
    
    // Test POST endpoint with sample data
    console.log('🔍 Testing POST /api/mobile/setup-wellness...');
    const postData = JSON.stringify({
      weight: 70,
      height: 170,
      gender: 'male',
      activity_level: 'moderately_active',
      fitness_goal: 'weight_loss'
    });
    
    try {
      const postResult = execSync(`curl -s -X POST -H "Content-Type: application/json" -d '${postData}' http://localhost:3000/api/mobile/setup-wellness`, { encoding: 'utf8' });
      
      if (postResult.includes('Unauthorized') || postResult.includes('success') || postResult.includes('error')) {
        console.log('✅ POST endpoint responding (requires auth)');
      } else {
        console.log('❌ POST endpoint not responding');
      }
    } catch (error) {
      console.log('⚠️ POST endpoint test failed (expected without auth)');
    }
    
  } catch (error) {
    console.log('❌ Error testing API endpoint:', error.message);
  }
};

// Check frontend implementation
const checkFrontendImplementation = () => {
  console.log('\n📱 Checking frontend implementation...');
  
  try {
    const wellnessFile = 'src/screens/WellnessApp.tsx';
    if (fs.existsSync(wellnessFile)) {
      const content = fs.readFileSync(wellnessFile, 'utf8');
      
      // Check for required functions
      const checks = [
        { name: 'handleSaveProfile function', pattern: 'handleSaveProfile' },
        { name: 'setupWellness API call', pattern: 'apiService.setupWellness' },
        { name: 'Form validation', pattern: 'Mohon lengkapi semua data' },
        { name: 'Success handling', pattern: 'Wellness program berhasil disetup' },
        { name: 'Error handling', pattern: 'Terjadi kesalahan saat menyimpan data' }
      ];
      
      checks.forEach(check => {
        if (content.includes(check.pattern)) {
          console.log(`✅ ${check.name} - Found`);
        } else {
          console.log(`❌ ${check.name} - Missing`);
        }
      });
      
    } else {
      console.log('❌ WellnessApp.tsx not found');
    }
    
    // Check API service
    const apiFile = 'src/services/api.js';
    if (fs.existsSync(apiFile)) {
      const content = fs.readFileSync(apiFile, 'utf8');
      
      if (content.includes('setupWellness')) {
        console.log('✅ setupWellness API method - Found');
      } else {
        console.log('❌ setupWellness API method - Missing');
      }
    }
    
  } catch (error) {
    console.log('❌ Error checking frontend implementation:', error.message);
  }
};

// Check common issues
const checkCommonIssues = () => {
  console.log('\n🔍 Checking common issues...');
  
  try {
    // Check if backend is running
    try {
      const result = execSync('curl -s http://localhost:3000/api/health', { encoding: 'utf8' });
      if (result.includes('success') || result.length > 0) {
        console.log('✅ Backend server is running');
      } else {
        console.log('❌ Backend server not responding');
      }
    } catch (error) {
      console.log('❌ Backend server not accessible');
    }
    
    // Check database connection
    const dbFile = 'dash-app/lib/db.js';
    if (fs.existsSync(dbFile)) {
      console.log('✅ Database configuration file found');
    } else {
      console.log('❌ Database configuration file missing');
    }
    
    // Check authentication
    const authFile = 'dash-app/lib/auth.js';
    if (fs.existsSync(authFile)) {
      console.log('✅ Authentication file found');
    } else {
      console.log('❌ Authentication file missing');
    }
    
  } catch (error) {
    console.log('❌ Error checking common issues:', error.message);
  }
};

// Provide solutions
const provideSolutions = () => {
  console.log('\n🔧 Solutions for Wellness Data Saving Issues:');
  console.log('');
  
  console.log('1️⃣ **Check Backend Server:**');
  console.log('   cd dash-app');
  console.log('   npm run dev');
  console.log('');
  
  console.log('2️⃣ **Check Database Tables:**');
  console.log('   - Ensure mobile_users table exists');
  console.log('   - Ensure health_data table exists');
  console.log('   - Check if user has date_of_birth');
  console.log('');
  
  console.log('3️⃣ **Check User Authentication:**');
  console.log('   - Ensure user is logged in');
  console.log('   - Check if auth token is valid');
  console.log('   - Verify user exists in database');
  console.log('');
  
  console.log('4️⃣ **Check Input Validation:**');
  console.log('   - All fields must be filled');
  console.log('   - Weight and height must be > 0');
  console.log('   - Valid activity_level and fitness_goal');
  console.log('');
  
  console.log('5️⃣ **Check Network Connection:**');
  console.log('   - Ensure app can reach backend');
  console.log('   - Check for network timeouts');
  console.log('   - Use "Continue Offline" if needed');
  console.log('');
  
  console.log('6️⃣ **Debug Steps:**');
  console.log('   - Use "Debug Wellness" in Profile screen');
  console.log('   - Check browser console for errors');
  console.log('   - Check backend logs for errors');
  console.log('');
};

// Main execution
const main = () => {
  console.log('🏥 PHC Mobile - Wellness Data Saving Fixer\n');
  console.log('=' .repeat(60));
  
  checkBackendEndpoint();
  checkDatabaseTables();
  testAPIEndpoint();
  checkFrontendImplementation();
  checkCommonIssues();
  
  console.log('\n' + '=' .repeat(60));
  
  provideSolutions();
  
  console.log('\n🎯 **Common Causes of Save Issues:**');
  console.log('1. Backend server not running');
  console.log('2. Database tables missing');
  console.log('3. User not authenticated');
  console.log('4. Missing required fields');
  console.log('5. Invalid data values');
  console.log('6. Network connectivity issues');
  console.log('7. Database connection problems');
  
  console.log('\n🔧 **Quick Fix Steps:**');
  console.log('1. Start backend: cd dash-app && npm run dev');
  console.log('2. Check database tables exist');
  console.log('3. Ensure user is logged in');
  console.log('4. Fill all required fields');
  console.log('5. Check network connection');
  console.log('6. Use debug tools if issues persist');
  
  console.log('\n✅ **Wellness data saving should work after these fixes!**');
};

main();
