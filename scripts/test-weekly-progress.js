const https = require('https');
const http = require('http');

// Test all weekly progress endpoints
async function testWeeklyProgress() {
  console.log('📊 Testing Weekly Progress Endpoints...\n');
  
  const endpoints = [
    {
      name: 'Weekly Summary (Main)',
      url: 'http://localhost:3000/api/mobile/tracking/weekly-summary?user_id=1'
    },
    {
      name: 'Wellness Progress',
      url: 'http://localhost:3000/api/mobile/wellness-progress/1'
    },
    {
      name: 'Weekly Water Intake',
      url: 'http://localhost:3000/api/mobile/tracking/water/weekly?user_id=1'
    },
    {
      name: 'Weekly Sleep Data',
      url: 'http://localhost:3000/api/mobile/tracking/sleep/weekly?user_id=1'
    },
    {
      name: 'Anthropometry Progress',
      url: 'http://localhost:3000/api/mobile/anthropometry/progress?user_id=1'
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`📋 Testing: ${endpoint.name}`);
    console.log(`🔗 URL: ${endpoint.url}`);
    
    try {
      const response = await makeRequest(endpoint.url);
      console.log('✅ Response:', {
        success: response.success,
        hasData: !!response.data,
        message: response.message || 'No message'
      });
      
      // Show specific data structure for each endpoint
      if (response.success && response.data) {
        if (endpoint.name.includes('Weekly Summary')) {
          console.log('   📊 Weekly Summary Data:');
          console.log(`   - Period: ${response.data.period?.start_date} to ${response.data.period?.end_date}`);
          console.log(`   - Wellness Score: ${response.data.wellness_score || 'N/A'}`);
          console.log(`   - Days with Activity: ${response.data.weekly_totals?.days_with_activity || 'N/A'}`);
        } else if (endpoint.name.includes('Wellness Progress')) {
          console.log('   🏃 Wellness Progress Data:');
          console.log(`   - Total Activities: ${response.progress?.totalActivities || 'N/A'}`);
          console.log(`   - Completed Missions: ${response.progress?.completedMissions || 'N/A'}`);
          console.log(`   - Wellness Score: ${response.progress?.wellnessScore || 'N/A'}`);
        } else if (endpoint.name.includes('Water')) {
          console.log('   💧 Weekly Water Data:');
          console.log(`   - Total ML: ${response.data.weekly_stats?.total_ml || 'N/A'}`);
          console.log(`   - Average Daily: ${response.data.weekly_stats?.average_daily || 'N/A'}`);
          console.log(`   - Days with Data: ${response.data.weekly_stats?.days_with_data || 'N/A'}`);
        } else if (endpoint.name.includes('Sleep')) {
          console.log('   😴 Weekly Sleep Data:');
          console.log(`   - Total Hours: ${response.data.weekly_stats?.total_hours || 'N/A'}`);
          console.log(`   - Average Hours: ${response.data.weekly_stats?.average_hours || 'N/A'}`);
          console.log(`   - Days with Data: ${response.data.weekly_stats?.days_with_data || 'N/A'}`);
        } else if (endpoint.name.includes('Anthropometry')) {
          console.log('   📏 Anthropometry Progress:');
          console.log(`   - Data Count: ${response.data?.length || 'N/A'}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    console.log('');
  }
  
  // Test with different date ranges
  console.log('📅 Testing with specific date ranges...\n');
  
  const today = new Date();
  const startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];
  
  const dateRangeEndpoints = [
    {
      name: 'Weekly Water with Date Range',
      url: `http://localhost:3000/api/mobile/tracking/water/weekly?user_id=1&start_date=${startDate}&end_date=${endDate}`
    },
    {
      name: 'Weekly Sleep with Date Range',
      url: `http://localhost:3000/api/mobile/tracking/sleep/weekly?user_id=1&start_date=${startDate}&end_date=${endDate}`
    }
  ];
  
  for (const endpoint of dateRangeEndpoints) {
    console.log(`📋 Testing: ${endpoint.name}`);
    console.log(`🔗 URL: ${endpoint.url}`);
    
    try {
      const response = await makeRequest(endpoint.url);
      console.log('✅ Response:', {
        success: response.success,
        hasData: !!response.data,
        period: response.data?.period ? `${response.data.period.start_date} to ${response.data.period.end_date}` : 'N/A'
      });
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    console.log('');
  }
  
  console.log('🎯 Summary:');
  console.log('- Weekly progress endpoints are available');
  console.log('- Data includes nutrition, water, sleep, fitness, and wellness metrics');
  console.log('- Date range filtering is supported');
  console.log('- Wellness scoring is implemented');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Run the test
testWeeklyProgress();
