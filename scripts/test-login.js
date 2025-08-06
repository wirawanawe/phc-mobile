#!/usr/bin/env node

/**
 * Test Login Script
 * Tests login functionality and authentication
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://10.242.90.103:3000/api/mobile';

async function testLogin() {
  console.log('🔍 Testing login functionality...');
  
  const loginData = {
    email: 'john.doe@example.com',
    password: 'password123'
  };

  try {
    console.log('🔍 Attempting login...');
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    
    console.log('📊 Login response status:', response.status);
    console.log('📊 Login response data:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Login successful!');
      console.log('🔑 Token:', data.data?.accessToken ? 'Present' : 'Missing');
      console.log('👤 User ID:', data.data?.user?.id);
      
      // Test authenticated endpoint
      if (data.data?.accessToken) {
        await testAuthenticatedEndpoint(data.data.accessToken);
      }
    } else {
      console.log('❌ Login failed:', data.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
}

async function testAuthenticatedEndpoint(token) {
  console.log('\n🔍 Testing authenticated endpoint...');
  console.log('🔑 Using token:', token.substring(0, 50) + '...');
  
  // Test multiple endpoints
  const endpoints = [
    `${BASE_URL}/my-missions?user_id=8`,
    `${BASE_URL}/missions`,
    `${BASE_URL}/auth/me`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response data:', data);
      
      if (response.ok) {
        console.log('✅ Request successful!');
      } else {
        console.log('❌ Request failed:', data.message || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Request failed:', error.message);
    }
  }
}

async function testHealthEndpoint() {
  console.log('\n🔍 Testing health endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL.replace('/api/mobile', '')}/api/health`);
    const data = await response.json();
    
    console.log('📊 Health response status:', response.status);
    console.log('📊 Health response data:', data);
    
  } catch (error) {
    console.error('❌ Health test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testHealthEndpoint();
  await testLogin();
}

runTests().catch(console.error); 