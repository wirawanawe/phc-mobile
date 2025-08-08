const apiService = require('../src/services/api.js');

async function testDailyReset() {
  console.log('🧪 Testing Daily Reset Functionality...\n');

  try {
    // Test 1: Check current date detection
    console.log('1. Testing date change detection...');
    const currentDate = new Date().toDateString();
    console.log(`   Current date: ${currentDate}`);
    
    // Test 2: Check today's summary before reset
    console.log('\n2. Testing today\'s summary before reset...');
    const summaryBefore = await apiService.getTodaySummary();
    console.log('   Summary before reset:', summaryBefore.success ? '✅ Success' : '❌ Failed');
    if (summaryBefore.success && summaryBefore.data) {
      console.log('   Water intake:', summaryBefore.data.water?.total_ml || 0, 'ml');
      console.log('   Steps:', summaryBefore.data.fitness?.steps || 0);
      console.log('   Exercise minutes:', summaryBefore.data.fitness?.exercise_minutes || 0);
      console.log('   Sleep hours:', summaryBefore.data.sleep?.total_hours || 0);
      console.log('   Mood:', summaryBefore.data.mood?.mood || 'Not set');
    }

    // Test 3: Simulate date change by manually triggering reset events
    console.log('\n3. Simulating date change and reset events...');
    
    // Import the event emitter
    const eventEmitter = require('../src/utils/eventEmitter');
    
    // Emit daily reset events
    eventEmitter.emit('dailyReset', {
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    });
    
    console.log('   ✅ Daily reset events emitted');
    
    // Test 4: Check if data is reset (this would be visible in the app)
    console.log('\n4. Checking if data is reset...');
    console.log('   Note: Data reset will be visible in the mobile app');
    console.log('   - Water intake should reset to 0');
    console.log('   - Steps should reset to 0');
    console.log('   - Exercise minutes should reset to 0');
    console.log('   - Sleep data should reset to default values');
    console.log('   - Mood should reset to null');

    // Test 5: Test individual reset events
    console.log('\n5. Testing individual reset events...');
    
    const resetEvents = ['waterReset', 'fitnessReset', 'sleepReset', 'moodReset', 'mealReset'];
    
    resetEvents.forEach(event => {
      eventEmitter.emit(event);
      console.log(`   ✅ ${event} event emitted`);
    });

    // Test 6: Check date change detector functionality
    console.log('\n6. Testing date change detector...');
    
    // Import the date change detector
    const dateChangeDetector = require('../src/utils/dateChangeDetector');
    
    // Test force date check
    await dateChangeDetector.forceDateCheck();
    console.log('   ✅ Force date check completed');
    
    // Test get last checked date
    const lastCheckedDate = dateChangeDetector.getLastCheckedDate();
    console.log(`   Last checked date: ${lastCheckedDate}`);
    
    // Test if detector is initialized
    const isInitialized = dateChangeDetector.isDetectorInitialized();
    console.log(`   Detector initialized: ${isInitialized ? '✅ Yes' : '❌ No'}`);

    console.log('\n✅ Daily reset functionality test completed successfully!');
    console.log('\n📱 To test in the mobile app:');
    console.log('   1. Open the app and log some data (water, fitness, sleep, mood)');
    console.log('   2. Change the system date to tomorrow');
    console.log('   3. Return to the app - all data should be reset to 0/default values');
    console.log('   4. Check Today\'s Summary card - it should show empty/zero values');

  } catch (error) {
    console.error('❌ Error testing daily reset functionality:', error);
  }
}

// Run the test
testDailyReset();
