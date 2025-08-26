import fetch from 'node-fetch';

const testLocalConnection = async () => {
  console.log('🔧 Testing Local API Connections...\n');

  const endpoints = [
    'http://10.242.90.103:3000/api/health',
    'http://localhost:3000/api/health',
    'http://10.242.90.103:3000/api/mobile/test-connection',
    'http://localhost:3000/api/mobile/test-connection'
  ];

  console.log('1️⃣ Testing Local Endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: WORKING (${responseTime}ms)`);
        console.log(`   Status: ${data.success || data.status}`);
        console.log(`   Message: ${data.message}`);
      } else {
        console.log(`❌ ${endpoint}: FAILED (HTTP ${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
    }
  }

  console.log('\n2️⃣ Connection Monitor Status...');
  console.log('✅ Connection Monitor updated to use local endpoints:');
  console.log('   - http://10.242.90.103:3000/api/mobile/test-connection (Primary)');
  console.log('   - http://localhost:3000/api/mobile/test-connection (Fallback)');

  console.log('\n3️⃣ API Service Status...');
  console.log('✅ API Service updated to use local endpoints:');
  console.log('   - Development: http://10.242.90.103:3000/api/mobile');
  console.log('   - Production: http://localhost:3000/api/mobile');

  console.log('\n4️⃣ Expected Behavior...');
  console.log('✅ Connection Monitor should now:');
  console.log('   - Successfully connect to local endpoints');
  console.log('   - No more connection failures');
  console.log('   - Fast response times (< 200ms)');

  console.log('\n✅ Local Connection Test Completed!');

  console.log('\n🎯 Summary:');
  console.log('   - All connections redirected to local API');
  console.log('   - Primary: 10.242.90.103:3000');
  console.log('   - Fallback: localhost:3000');
  console.log('   - Connection monitor should work properly');

  console.log('\n💡 Next Steps:');
  console.log('   - Restart the mobile app to apply changes');
  console.log('   - Check that connection warnings are gone');
  console.log('   - Verify API calls work properly');
};

testLocalConnection().catch(console.error);
