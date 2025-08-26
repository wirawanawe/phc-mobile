const { execSync } = require('child_process');

// Test all possible IP addresses
const testIPs = [
  'localhost',
  '127.0.0.1',
  '10.242.90.103',
  '192.168.193.150',
  '192.168.0.209',
  '10.0.2.2' // Android emulator
];

console.log('🔍 Testing IP Configuration for PHC Mobile App\n');

async function testIP(ip) {
  try {
    console.log(`🌐 Testing ${ip}:3000...`);
    
    // Test health endpoint
    const healthUrl = `http://${ip}:3000/api/health`;
    const healthResponse = execSync(`curl -s -o /dev/null -w "%{http_code}" ${healthUrl}`, { encoding: 'utf8' });
    
    if (healthResponse.trim() === '200') {
      console.log(`✅ ${ip}:3000 - Health endpoint accessible`);
      
      // Test mobile auth endpoint
      const authUrl = `http://${ip}:3000/api/mobile/auth/login`;
      const authResponse = execSync(`curl -s -X POST ${authUrl} -H "Content-Type: application/json" -d '{"email":"test@mobile.com","password":"password123"}'`, { encoding: 'utf8' });
      
      try {
        const authData = JSON.parse(authResponse);
        if (authData.success) {
          console.log(`✅ ${ip}:3000 - Mobile auth working`);
          
          // Test water tracking with token
          const token = authData.data.accessToken;
          const waterUrl = `http://${ip}:3000/api/mobile/tracking/water`;
          const waterResponse = execSync(`curl -s -X POST ${waterUrl} -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"amount_ml":100}'`, { encoding: 'utf8' });
          
          try {
            const waterData = JSON.parse(waterResponse);
            if (waterData.success) {
              console.log(`✅ ${ip}:3000 - Water tracking working`);
              return { ip, status: 'FULLY_WORKING', health: true, auth: true, water: true };
            } else {
              console.log(`⚠️ ${ip}:3000 - Water tracking failed: ${waterData.message}`);
              return { ip, status: 'PARTIAL', health: true, auth: true, water: false };
            }
          } catch (waterError) {
            console.log(`❌ ${ip}:3000 - Water tracking error: ${waterError.message}`);
            return { ip, status: 'PARTIAL', health: true, auth: true, water: false };
          }
        } else {
          console.log(`⚠️ ${ip}:3000 - Mobile auth failed: ${authData.message}`);
          return { ip, status: 'PARTIAL', health: true, auth: false, water: false };
        }
      } catch (authError) {
        console.log(`❌ ${ip}:3000 - Mobile auth error: ${authError.message}`);
        return { ip, status: 'PARTIAL', health: true, auth: false, water: false };
      }
    } else {
      console.log(`❌ ${ip}:3000 - Health endpoint failed (${healthResponse.trim()})`);
      return { ip, status: 'FAILED', health: false, auth: false, water: false };
    }
  } catch (error) {
    console.log(`❌ ${ip}:3000 - Connection failed: ${error.message}`);
    return { ip, status: 'FAILED', health: false, auth: false, water: false };
  }
}

async function runTests() {
  const results = [];
  
  for (const ip of testIPs) {
    const result = await testIP(ip);
    results.push(result);
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('📊 IP Configuration Test Summary:');
  console.log('=====================================');
  
  const workingIPs = results.filter(r => r.status === 'FULLY_WORKING');
  const partialIPs = results.filter(r => r.status === 'PARTIAL');
  const failedIPs = results.filter(r => r.status === 'FAILED');
  
  console.log(`✅ Fully Working: ${workingIPs.length}`);
  workingIPs.forEach(r => console.log(`   - ${r.ip}:3000`));
  
  console.log(`⚠️ Partially Working: ${partialIPs.length}`);
  partialIPs.forEach(r => console.log(`   - ${r.ip}:3000 (health: ${r.health}, auth: ${r.auth}, water: ${r.water})`));
  
  console.log(`❌ Failed: ${failedIPs.length}`);
  failedIPs.forEach(r => console.log(`   - ${r.ip}:3000`));
  
  console.log('\n🎯 Recommendations:');
  if (workingIPs.length > 0) {
    console.log(`✅ Use ${workingIPs[0].ip}:3000 for mobile app configuration`);
  } else if (partialIPs.length > 0) {
    console.log(`⚠️ Use ${partialIPs[0].ip}:3000 but some features may not work`);
  } else {
    console.log('❌ No IP addresses are working. Check server status and network configuration.');
  }
  
  console.log('\n📱 For mobile app development:');
  console.log('- iOS Simulator: Use localhost:3000');
  console.log('- Android Emulator: Use 10.0.2.2:3000');
  console.log('- Physical Device: Use your machine IP (e.g., 10.242.90.103:3000)');
}

runTests().catch(console.error);
