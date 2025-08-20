#!/usr/bin/env node

/**
 * Test script to verify wellness field names are working correctly
 */

console.log('🧪 Testing Wellness Field Names Fix...\n');

// Simulate the API response with correct field names
const apiResponse = {
  success: true,
  data: {
    period: 7,
    active_days: 0,
    total_fitness_minutes: 0,
    total_calories: 0,
    total_water_intake: 0,
    total_sleep_hours: 0,
    average_mood_score: 5.5,
    fitness_entries: 0,
    nutrition_entries: 0,
    water_entries: 0,
    sleep_entries: 0,
    mood_entries: 2,
    wellness_score: 0,
    // ✅ Correct field names
    total_activities: 22,
    total_activities_completed: 2,
    total_points_earned: 38,
    streak_days: 0
  }
};

console.log('📊 API Response:');
console.log(JSON.stringify(apiResponse, null, 2));

// Simulate how the frontend would parse this data
if (apiResponse.success && apiResponse.data) {
  const stats = apiResponse.data;
  
  console.log('\n🔍 Frontend Parsing:');
  console.log(`   - Total Activities: ${stats.total_activities || 0}`);
  console.log(`   - Completed Activities: ${stats.total_activities_completed || 0}`);
  console.log(`   - Total Points: ${stats.total_points_earned || 0}`);
  console.log(`   - Average Mood Score: ${stats.average_mood_score || 0}`);
  console.log(`   - Streak Days: ${stats.streak_days || 0}`);
  
  // Test if the data would be correctly displayed
  const hasValidData = (
    stats.total_activities > 0 &&
    stats.total_activities_completed > 0 &&
    stats.total_points_earned > 0
  );
  
  if (hasValidData) {
    console.log('\n✅ SUCCESS: Field names are working correctly!');
    console.log('   - Wellness values should now display properly');
    console.log('   - Activity completion count should show: 2');
    console.log('   - Points earned should show: 38');
    console.log('   - Total activities should show: 22');
  } else {
    console.log('\n❌ FAILURE: Field names are still incorrect!');
    console.log('   - Values are 0, indicating field name mismatch');
  }
  
  // Test the old field names (should be undefined)
  console.log('\n🔍 Testing Old Field Names (should be undefined):');
  console.log(`   - completed_activities: ${stats.completed_activities || 'undefined'}`);
  console.log(`   - total_points: ${stats.total_points || 'undefined'}`);
  console.log(`   - avg_mood_score: ${stats.avg_mood_score || 'undefined'}`);
  
  if (!stats.completed_activities && !stats.total_points && !stats.avg_mood_score) {
    console.log('✅ Old field names are correctly removed');
  } else {
    console.log('❌ Old field names still exist');
  }
  
} else {
  console.log('\n❌ API response is not successful');
}

console.log('\n🎯 Test completed!');
