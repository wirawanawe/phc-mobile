#!/usr/bin/env node

/**
 * Script untuk mendiagnosis dan memperbaiki masalah database produksi
 * di server https://dash.doctorphc.id
 */

const https = require('https');

// Test production server endpoints
async function testProductionEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'dash.doctorphc.id',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Database-Fixer/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Main diagnostic function
async function diagnoseProductionDatabase() {
  console.log('🔍 Diagnosing Production Database Issues...\n');
  
  // Test 1: Health check
  console.log('1. Testing Health Endpoint...');
  try {
    const health = await testProductionEndpoint('/api/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data)}`);
    console.log('   ✅ Health endpoint working\n');
  } catch (error) {
    console.log(`   ❌ Health endpoint failed: ${error.message}\n`);
    return;
  }

  // Test 2: Database connection via auth endpoint
  console.log('2. Testing Database Connection via Auth...');
  try {
    const auth = await testProductionEndpoint('/api/mobile/auth/me');
    console.log(`   Status: ${auth.status}`);
    console.log(`   Response: ${JSON.stringify(auth.data)}`);
    
    if (auth.status === 401 && auth.data.message === 'Authorization header required') {
      console.log('   ✅ Auth endpoint accessible (database working)\n');
    } else {
      console.log('   ⚠️  Unexpected auth response\n');
    }
  } catch (error) {
    console.log(`   ❌ Auth endpoint failed: ${error.message}\n`);
  }

  // Test 3: Login endpoint (this will show the database error)
  console.log('3. Testing Login Endpoint (Database Test)...');
  try {
    const login = await testProductionEndpoint('/api/mobile/auth/login', 'POST', {
      email: 'test@mobile.com',
      password: 'password123'
    });
    
    console.log(`   Status: ${login.status}`);
    console.log(`   Response: ${JSON.stringify(login.data, null, 2)}`);
    
    if (login.data.message && login.data.message.includes('Database error')) {
      console.log('\n   🔍 DATABASE ERROR DETECTED:');
      console.log(`   Error: ${login.data.message}`);
      
      if (login.data.message.includes('Access denied')) {
        console.log('\n   📋 DIAGNOSIS: MySQL Access Denied');
        console.log('   This indicates one of the following issues:');
        console.log('   1. Wrong MySQL password in .env.local');
        console.log('   2. MySQL user does not exist');
        console.log('   3. MySQL user does not have proper permissions');
        console.log('   4. .env.local file is missing or not loaded');
      }
    }
  } catch (error) {
    console.log(`   ❌ Login test failed: ${error.message}\n`);
  }

  // Generate fix recommendations
  console.log('\n🔧 RECOMMENDED FIXES:\n');
  
  console.log('1. CHECK .env.local FILE ON PRODUCTION SERVER:');
  console.log('   SSH to production server and check:');
  console.log('   ```bash');
  console.log('   cd /www/wwwroot/dashapp  # or your app directory');
  console.log('   ls -la .env.local');
  console.log('   cat .env.local');
  console.log('   ```\n');
  
  console.log('2. VERIFY MYSQL CREDENTIALS:');
  console.log('   Test MySQL connection manually:');
  console.log('   ```bash');
  console.log('   mysql -u root -p');
  console.log('   # OR');
  console.log('   mysql -u phc_user -p');
  console.log('   ```\n');
  
  console.log('3. CREATE/UPDATE .env.local FILE:');
  console.log('   ```bash');
  console.log('   nano .env.local');
  console.log('   ```');
  console.log('   Content should be:');
  console.log('   ```env');
  console.log('   DB_HOST=localhost');
  console.log('   DB_USER=root  # or phc_user');
  console.log('   DB_PASSWORD=your_mysql_password_here');
  console.log('   DB_NAME=phc_dashboard');
  console.log('   JWT_SECRET=your_jwt_secret_min_32_chars');
  console.log('   NODE_ENV=production');
  console.log('   PORT=3000');
  console.log('   ```\n');
  
  console.log('4. SET FILE PERMISSIONS:');
  console.log('   ```bash');
  console.log('   chmod 600 .env.local');
  console.log('   chown www-data:www-data .env.local  # if using Apache/Nginx');
  console.log('   ```\n');
  
  console.log('5. RESTART APPLICATION:');
  console.log('   ```bash');
  console.log('   pm2 restart dash-app');
  console.log('   # OR');
  console.log('   systemctl restart your-app-service');
  console.log('   ```\n');
  
  console.log('6. TEST AFTER FIXING:');
  console.log('   Run this script again to verify the fix');
}

// Run the diagnostic
if (require.main === module) {
  diagnoseProductionDatabase().catch(console.error);
}

module.exports = { diagnoseProductionDatabase, testProductionEndpoint };
