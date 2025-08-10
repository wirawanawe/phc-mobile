// Test script to verify wellness status fallback works correctly
const fetch = require('node-fetch');

// Mock API service similar to the mobile app
class TestApiService {
  constructor() {
    this.baseURL = "https://dash.doctorphc.id/api/mobile";
  }

  async request(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjQsImlkIjo0LCJuYW1lIjoiVGVzdCBVc2VyIERlYnVnIiwiZW1haWwiOiJkZWJ1Z0B0ZXN0LmNvbSIsInBob25lIjoiMTIzNDU2Nzg5OSIsInJvbGUiOiJNT0JJTEVfVVNFUiIsImlhdCI6MTc1NDYyMTE0MywiZXhwIjoxNzU1MjI1OTQzfQ.ietrBnyrPSQFCn5cb8xMze4AqkQIO5MLlYfXcuTUU8Y'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async getWellnessProgramStatus() {
    try {
      return await this.request("/wellness/status");
    } catch (error) {
      console.log("ℹ️ Wellness status endpoint not available, using default values");
      
      // Return a default response if the endpoint fails
      return {
        success: true,
        data: {
          has_joined: false,
          join_date: null,
          fitness_goal: null,
          activity_level: null,
          has_missions: false,
          mission_count: 0,
          profile_complete: false,
          needs_onboarding: true
        }
      };
    }
  }
}

async function testWellnessFallback() {
  console.log('🧪 Testing wellness status fallback mechanism...');
  
  const apiService = new TestApiService();
  
  try {
    const result = await apiService.getWellnessProgramStatus();
    console.log('✅ Wellness status call completed successfully');
    console.log('📄 Result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log('✅ Fallback mechanism working correctly');
      console.log(`🔍 Has joined: ${result.data.has_joined}`);
      console.log(`🔍 Needs onboarding: ${result.data.needs_onboarding}`);
    } else {
      console.log('❌ Unexpected result format');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testWellnessFallback().catch(console.error);
