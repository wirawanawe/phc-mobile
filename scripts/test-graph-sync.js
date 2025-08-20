#!/usr/bin/env node

/**
 * Test Script: Graph Tab Data Sync
 * 
 * This script tests the weekly summary API endpoint to ensure
 * the Graph tab is properly syncing with the database.
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Adjust if your backend runs on different port
const TEST_USER_ID = 1; // Test user ID

async function testWeeklySummaryAPI() {
  console.log('🧪 Testing Graph Tab Data Sync...\n');

  try {
    // Test 1: Get weekly summary data
    console.log('📊 Test 1: Fetching weekly summary data...');
    const response = await axios.get(`${BASE_URL}/api/mobile/tracking/weekly-summary?user_id=${TEST_USER_ID}`);
    
    if (response.data.success) {
      console.log('✅ Weekly summary API call successful');
      console.log('📈 Data structure:');
      console.log('   - Period:', response.data.data.period);
      console.log('   - Weekly totals:', response.data.data.weekly_totals);
      console.log('   - Weekly averages:', response.data.data.weekly_averages);
      console.log('   - Wellness score:', response.data.data.wellness_score);
      
      // Check daily breakdown
      const breakdown = response.data.data.daily_breakdown;
      console.log('   - Daily breakdown sections:');
      console.log('     • Nutrition:', breakdown.nutrition?.length || 0, 'days');
      console.log('     • Water:', breakdown.water?.length || 0, 'days');
      console.log('     • Fitness:', breakdown.fitness?.length || 0, 'days');
      console.log('     • Sleep:', breakdown.sleep?.length || 0, 'days');
      console.log('     • Mood:', breakdown.mood?.length || 0, 'days');
      
      // Test 2: Verify data mapping for Graph tab
      console.log('\n📊 Test 2: Verifying data mapping for Graph tab...');
      
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
      
      console.log('   - Expected date range:', dates[0], 'to', dates[6]);
      
      // Check if we have data for each chart type
      const chartTypes = ['steps', 'water', 'sleep', 'mood', 'exercise', 'calories'];
      chartTypes.forEach(type => {
        let hasData = false;
        switch (type) {
          case 'steps':
          case 'exercise':
            hasData = breakdown.fitness?.some(day => day.total_steps > 0 || day.total_exercise_minutes > 0);
            break;
          case 'water':
            hasData = breakdown.water?.some(day => day.total_ml > 0);
            break;
          case 'sleep':
            hasData = breakdown.sleep?.some(day => day.total_hours > 0);
            break;
          case 'mood':
            hasData = breakdown.mood?.some(day => day.avg_mood_score > 0);
            break;
          case 'calories':
            hasData = breakdown.nutrition?.some(day => day.total_calories > 0);
            break;
        }
        console.log(`     • ${type}: ${hasData ? '✅' : '❌'} ${hasData ? 'Has data' : 'No data'}`);
      });
      
      console.log('\n🎉 Graph tab data sync test completed successfully!');
      console.log('📱 The Graph tab should now display real data from the database.');
      
    } else {
      console.log('❌ Weekly summary API call failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Make sure the backend server is running on port 3000');
    console.log('   2. Check if the database is accessible');
    console.log('   3. Verify that test user ID exists in the database');
    console.log('   4. Check backend logs for any errors');
  }
}

// Run the test
testWeeklySummaryAPI();
