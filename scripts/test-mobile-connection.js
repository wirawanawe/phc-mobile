#!/usr/bin/env node

/**
 * Test Mobile App Connection
 * Tests mobile app connection with proper credentials
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://10.242.90.103:3000/api/mobile';

async function testMobileConnection() {
  console.log('🔍 Testing mobile app connection...');
  
  // Test credentials
  const loginData = {
    email: 'john.doe@example.com',
    password: 'password123'
  };

  try {
    // Step 1: Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL.replace('/api/mobile', '')}/api/health`);
    console.log('✅ Health endpoint:', healthResponse.status);

    // Step 2: Test login
    console.log('\n2️⃣ Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    
    if (loginResponse.ok && loginResult.success) {
      console.log('✅ Login successful!');
      console.log('👤 User ID:', loginResult.data.user.id);
      
      const token = loginResult.data.accessToken;
      
      // Step 3: Test authenticated endpoints
      console.log('\n3️⃣ Testing authenticated endpoints...');
      
      const endpoints = [
        { name: 'Missions', url: `${BASE_URL}/missions` },
        { name: 'User Profile', url: `${BASE_URL}/auth/me` },
        { name: 'My Missions', url: `${BASE_URL}/my-missions?user_id=${loginResult.data.user.id}` },
        { name: 'Clinics', url: `${BASE_URL}/clinics` }
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`\n🔍 Testing ${endpoint.name}...`);
          
          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await response.json();
          
          if (response.ok) {
            console.log(`✅ ${endpoint.name}: SUCCESS`);
            if (data.success && data.data) {
              console.log(`   📊 Data count: ${Array.isArray(data.data) ? data.data.length : 'Object'}`);
            }
          } else {
            console.log(`❌ ${endpoint.name}: ${response.status} - ${data.message || 'Unknown error'}`);
          }
          
        } catch (error) {
          console.log(`❌ ${endpoint.name}: ${error.message}`);
        }
      }
      
      console.log('\n🎉 Mobile app connection test completed!');
      
    } else {
      console.log('❌ Login failed:', loginData.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Mobile connection test failed:', error.message);
  }
}

// Run the test
testMobileConnection().catch(console.error); 