const api = require('../src/services/api.js');

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
    
    // Create fitness entry
    const createResponse = await api.createFitnessEntry(testData);
    console.log('✅ Create response:', createResponse);
    
    if (createResponse.success) {
      // Get fitness history to verify
      const historyResponse = await api.getFitnessHistory();
      console.log('📋 History response:', JSON.stringify(historyResponse, null, 2));
      
      if (historyResponse.success && historyResponse.data) {
        const runningEntries = historyResponse.data.filter(entry => 
          entry.workout_type === 'Running' || entry.activity_type === 'Running'
        );
        
        console.log('🏃 Running entries found:', runningEntries.length);
        
        if (runningEntries.length > 0) {
          const latestEntry = runningEntries[0];
          console.log('📊 Latest running entry:', JSON.stringify(latestEntry, null, 2));
          
          // Check if notes contain workout parameters
          if (latestEntry.notes) {
            try {
              const notesData = JSON.parse(latestEntry.notes);
              console.log('📝 Parsed notes:', notesData);
              
              if (notesData.workoutParameters) {
                console.log('✅ Workout parameters found:', notesData.workoutParameters);
                console.log('📏 Distance:', notesData.workoutParameters.distance_km);
                console.log('⏱️ Pace:', notesData.workoutParameters.pace_min_km);
              } else {
                console.log('❌ No workout parameters in notes');
              }
            } catch (error) {
              console.log('❌ Failed to parse notes as JSON:', error.message);
            }
          } else {
            console.log('❌ No notes field');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRunningExercise();
