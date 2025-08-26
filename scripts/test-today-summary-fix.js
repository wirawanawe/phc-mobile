// Simple test to check API endpoints without React Native dependencies
const https = require('https');
const http = require('http');

// Mock API service for testing
class MockApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3000'; // Adjust if needed
  }

  async request(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;
      const urlObj = new URL(url);
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 3000,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            resolve({ success: false, message: 'Invalid JSON response', data: data });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  async getTodaySummary() {
    return this.request('/api/mobile/tracking/today-summary');
  }

  async getTodayWaterIntake() {
    return this.request('/api/mobile/tracking/water/today');
  }

  async getTodayFitness() {
    return this.request('/api/mobile/tracking/fitness/today');
  }
}

async function testTodaySummary() {
  console.log('🧪 Testing Today Summary API Fix...\n');

  const apiService = new MockApiService();

  try {
    // Test today summary API
    console.log('1. Testing getTodaySummary()...');
    const summaryResponse = await apiService.getTodaySummary();
    console.log('Summary response success:', summaryResponse.success);
    
    if (summaryResponse.success && summaryResponse.data) {
      console.log('Summary data structure:');
      console.log('- Water:', summaryResponse.data.water);
      console.log('- Fitness:', summaryResponse.data.fitness);
      console.log('- Meal:', summaryResponse.data.meal);
      
      // Check specific fields
      const water = summaryResponse.data.water?.total_ml || 0;
      const steps = summaryResponse.data.fitness?.steps || 0;
      const exerciseMinutes = summaryResponse.data.fitness?.exercise_minutes || 0;
      const distance = summaryResponse.data.fitness?.distance_km || 0;
      const calories = summaryResponse.data.meal?.calories || 0;
      
      console.log('\nExtracted values:');
      console.log('- Water (ml):', water);
      console.log('- Steps:', steps);
      console.log('- Exercise Minutes:', exerciseMinutes);
      console.log('- Distance (km):', distance);
      console.log('- Calories:', calories);
      
      // Convert water to liters
      const waterLiters = water / 1000;
      console.log('- Water (L):', waterLiters);
      
      console.log('\n✅ Today Summary API is working correctly!');
    } else {
      console.log('❌ Today Summary API failed:', summaryResponse.message);
    }

    // Test individual APIs as fallback
    console.log('\n2. Testing individual APIs...');
    
    console.log('\n2a. Testing getTodayWaterIntake()...');
    const waterResponse = await apiService.getTodayWaterIntake();
    console.log('Water API success:', waterResponse.success);
    if (waterResponse.success && waterResponse.data) {
      console.log('Water data:', waterResponse.data);
    }
    
    console.log('\n2b. Testing getTodayFitness()...');
    const fitnessResponse = await apiService.getTodayFitness();
    console.log('Fitness API success:', fitnessResponse.success);
    if (fitnessResponse.success && fitnessResponse.data) {
      console.log('Fitness data:', fitnessResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTodaySummary();
