const https = require('https');
const http = require('http');

// Simple API test without React Native dependencies
async function testRunningExercise() {
  console.log('🧪 Testing Running Exercise with Distance and Pace...');
  
  try {
    // Test data for running exercise
    const testData = {
      workout_type: 'Running',
      exercise_minutes: 30,
      calories_burned: 300,
      distance_km: 5.0,
      steps: 6000,
      notes: JSON.stringify({
        userNotes: 'Test running session',
        workoutParameters: {
          distance_km: '5.0',
          pace_min_km: '6.0'
        }
      }),
      tracking_date: new Date().toISOString().split('T')[0]
    };
    
    console.log('📝 Test data:', testData);
    
    // For now, just log the expected behavior
    console.log('✅ Expected behavior:');
    console.log('   - Distance should be saved as: 5.0 km');
    console.log('   - Pace should be saved as: 6.0 min/km');
    console.log('   - Notes should contain JSON with workoutParameters');
    console.log('   - ExerciseHistoryScreen should display both distance and pace');
    
    console.log('\n📋 To test this:');
    console.log('   1. Open the mobile app');
    console.log('   2. Go to Fitness Tracking');
    console.log('   3. Select "Running" as workout type');
    console.log('   4. Enter distance: 5.0 km');
    console.log('   5. Enter pace: 6.0 min/km');
    console.log('   6. Save the workout');
    console.log('   7. Go to Exercise History');
    console.log('   8. Check if distance and pace are displayed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRunningExercise();
