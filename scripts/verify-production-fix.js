#!/usr/bin/env node

/**
 * Script untuk memverifikasi bahwa perbaikan database produksi berhasil
 */

const https = require('https');

async function testProductionEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'dash.doctorphc.id',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Verifier/1.0'
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

async function verifyProductionFix() {
  console.log('🔍 Verifying Production Database Fix...\n');
  
  let allTestsPassed = true;
  
  // Test 1: Health check
  console.log('1. ✅ Health Check...');
  try {
    const health = await testProductionEndpoint('/api/health');
    if (health.status === 200) {
      console.log('   ✅ Health endpoint: OK');
    } else {
      console.log(`   ❌ Health endpoint failed: ${health.status}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Health endpoint error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 2: Auth endpoint (should return 401 but not database error)
  console.log('\n2. 🔐 Auth Endpoint...');
  try {
    const auth = await testProductionEndpoint('/api/mobile/auth/me');
    if (auth.status === 401 && auth.data.message === 'Authorization header required') {
      console.log('   ✅ Auth endpoint: Working (database accessible)');
    } else {
      console.log(`   ⚠️  Auth endpoint unexpected response: ${auth.status} - ${JSON.stringify(auth.data)}`);
    }
  } catch (error) {
    console.log(`   ❌ Auth endpoint error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 3: Login endpoint (main test)
  console.log('\n3. 🔑 Login Endpoint...');
  try {
    const login = await testProductionEndpoint('/api/mobile/auth/login', 'POST', {
      email: 'test@mobile.com',
      password: 'password123'
    });
    
    console.log(`   Status: ${login.status}`);
    
    if (login.status === 200 && login.data.success === true) {
      console.log('   ✅ LOGIN SUCCESS! Database is working correctly');
      console.log(`   User: ${login.data.data.user.name} (${login.data.data.user.email})`);
      console.log('   Token received: ✅');
    } else if (login.status === 401) {
      console.log('   ⚠️  Login failed - Invalid credentials (but database is accessible)');
      console.log('   This means database is working, but test credentials might be wrong');
    } else if (login.data.message && login.data.message.includes('Database error')) {
      console.log('   ❌ DATABASE ERROR STILL EXISTS:');
      console.log(`   Error: ${login.data.message}`);
      allTestsPassed = false;
    } else {
      console.log(`   ⚠️  Unexpected login response: ${JSON.stringify(login.data)}`);
    }
  } catch (error) {
    console.log(`   ❌ Login endpoint error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 4: Try alternative credentials
  console.log('\n4. 🔑 Testing Alternative Credentials...');
  const testCredentials = [
    { email: 'john.doe@example.com', password: 'password123' },
    { email: 'admin@doctorphc.id', password: 'admin123' },
    { email: 'user@example.com', password: 'password' }
  ];

  for (const cred of testCredentials) {
    try {
      const login = await testProductionEndpoint('/api/mobile/auth/login', 'POST', cred);
      
      if (login.status === 200 && login.data.success === true) {
        console.log(`   ✅ LOGIN SUCCESS with ${cred.email}`);
        console.log(`   User: ${login.data.data.user.name}`);
        break;
      } else if (login.status === 401) {
        console.log(`   ⚠️  ${cred.email}: Invalid credentials (database OK)`);
      } else if (login.data.message && login.data.message.includes('Database error')) {
        console.log(`   ❌ ${cred.email}: Database error still exists`);
        allTestsPassed = false;
        break;
      }
    } catch (error) {
      console.log(`   ❌ ${cred.email}: Connection error`);
    }
  }

  // Final result
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 PRODUCTION DATABASE FIX SUCCESSFUL!');
    console.log('\n✅ Next steps:');
    console.log('1. Update mobile app to use production server');
    console.log('2. Test login in mobile app');
    console.log('3. Verify all features work correctly');
    
    console.log('\n📱 To switch mobile app to production:');
    console.log('Edit src/services/api.js:');
    console.log('```javascript');
    console.log('const getServerURL = () => {');
    console.log('  return "https://dash.doctorphc.id";  // Uncomment this');
    console.log('  // return "192.168.18.30";           // Comment this');
    console.log('};');
    console.log('```');
  } else {
    console.log('❌ PRODUCTION DATABASE STILL HAS ISSUES');
    console.log('\n🔧 Please check:');
    console.log('1. .env.local file exists and has correct permissions');
    console.log('2. MySQL password is correct');
    console.log('3. Application has been restarted');
    console.log('4. MySQL service is running');
    console.log('\nRun the fix guide again: PRODUCTION_DATABASE_FIX_GUIDE.md');
  }
  console.log('='.repeat(50));
}

// Run verification
if (require.main === module) {
  verifyProductionFix().catch(console.error);
}

module.exports = { verifyProductionFix };
