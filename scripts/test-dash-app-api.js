#!/usr/bin/env node

const fetch = require('node-fetch');

console.log("🧪 Testing Dash-App API Connection...");
console.log("=====================================");

const API_BASE_URL = "http://10.242.90.103:3000/api/mobile";

async function testAPI() {
  try {
    // Test users endpoint
    console.log("📱 Testing /api/mobile/users...");
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log("✅ Users API - SUCCESS");
      console.log(`   Found ${usersData.users?.length || 0} users`);
    } else {
      console.log(`❌ Users API - FAILED (${usersResponse.status})`);
    }

    // Test auth endpoint
    console.log("\n🔐 Testing /api/mobile/auth...");
    const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'password123'
      })
    });
    
    if (authResponse.ok) {
      console.log("✅ Auth API - SUCCESS");
    } else {
      console.log(`❌ Auth API - FAILED (${authResponse.status})`);
    }

    // Test health endpoint
    console.log("\n🏥 Testing /api/mobile/health...");
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    
    if (healthResponse.ok) {
      console.log("✅ Health API - SUCCESS");
    } else {
      console.log(`❌ Health API - FAILED (${healthResponse.status})`);
    }

    console.log("\n🎯 API Connection Test Complete!");
    console.log("📱 Mobile app should now be able to connect to dash-app API");

  } catch (error) {
    console.error("❌ API Test Failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure dash-app is running: cd ../dash-app && npm run dev");
    console.log("2. Check if port 3000 is available");
    console.log("3. Verify API endpoints exist in dash-app/app/api/mobile/");
  }
}

testAPI(); 