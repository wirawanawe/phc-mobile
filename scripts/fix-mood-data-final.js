import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Final fix for mood data
async function fixMoodDataFinal() {
  console.log('🔧 Final fix for mood data...\n');

  const today = new Date().toISOString().split('T')[0];
  console.log('📅 Today\'s date:', today);

  // Test 1: Delete existing mood entries for today (if any)
  console.log('1. Cleaning up existing mood entries...');
  try {
    // We'll add a new entry instead of deleting
    console.log('   Skipping deletion for safety');
  } catch (error) {
    console.error('❌ Error cleaning up:', error.message);
  }

  // Test 2: Add a fresh mood entry for today
  console.log('\n2. Adding fresh mood entry for today...');
  try {
    const moodData = {
      user_id: 1,
      mood_level: 'happy',
      stress_level: 'low',
      energy_level: 'high',
      sleep_quality: 'good',
      tracking_date: today,
      notes: 'Fresh mood entry for today'
    };

    console.log('📤 Sending data:', JSON.stringify(moodData, null, 2));

    const response = await fetch(`${BASE_URL}/api/mobile/mood_tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moodData)
    });

    const result = await response.json();
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Fresh mood entry added successfully');
      console.log('📊 Inserted ID:', result.data.id);
      console.log('📊 Tracking date:', result.data.tracking_date);
    } else {
      console.log('❌ Failed to add fresh mood entry');
    }
  } catch (error) {
    console.error('❌ Error adding fresh mood entry:', error.message);
  }

  // Test 3: Wait a moment and check the data
  console.log('\n3. Waiting and checking data...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Check today's mood endpoint
  console.log('\n4. Checking today\'s mood endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker/today?user_id=1`);
    const result = await response.json();
    console.log('📥 Today mood response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log('✅ Today\'s mood data found!');
      console.log('📊 Mood level:', result.data.mood_level);
      console.log('📊 Tracking date:', result.data.tracking_date);
      console.log('📊 Notes:', result.data.notes);
    } else {
      console.log('❌ No mood data for today');
    }
  } catch (error) {
    console.error('❌ Error checking today\'s mood:', error.message);
  }

  // Test 5: Check mood tracker endpoint
  console.log('\n5. Checking mood tracker endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const result = await response.json();
    console.log('📥 Mood tracker response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log('✅ Mood tracker data retrieved');
      console.log('📊 Total entries:', result.data.total_entries);
      
      if (result.data.entries && result.data.entries.length > 0) {
        console.log('📊 Available entries:');
        result.data.entries.forEach((entry, index) => {
          console.log(`  ${index + 1}. ${entry.tracking_date} (${entry.mood_level})`);
        });
        
        // Check for today's entry
        const todayEntry = result.data.entries.find(entry => entry.tracking_date === today);
        if (todayEntry) {
          console.log('✅ Found today\'s entry in mood tracker!');
        } else {
          console.log('❌ No today\'s entry found in mood tracker');
          console.log('   Looking for:', today);
          console.log('   Available dates:', result.data.entries.map(e => e.tracking_date));
        }
      }
    } else {
      console.log('❌ Failed to get mood tracker data');
    }
  } catch (error) {
    console.error('❌ Error getting mood tracker data:', error.message);
  }

  // Test 6: Simulate mobile app behavior
  console.log('\n6. Simulating mobile app behavior...');
  try {
    // Get today's mood
    const todayResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker/today?user_id=1`);
    const todayResult = await todayResponse.json();
    
    // Get mood history
    const historyResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const historyResult = await historyResponse.json();
    
    console.log('📱 Mobile app simulation:');
    console.log('  Today mood response:', todayResult.success ? 'Success' : 'Failed');
    console.log('  History response:', historyResult.success ? 'Success' : 'Failed');
    
    if (todayResult.success && todayResult.data && todayResult.data.mood_level) {
      console.log('  ✅ Has existing mood for today');
      console.log('  📊 Mood level:', todayResult.data.mood_level);
    } else {
      console.log('  ❌ No existing mood for today');
    }
    
    if (historyResult.success && historyResult.data) {
      const todayEntry = historyResult.data.entries?.find(entry => entry.tracking_date === today);
      
      if (todayEntry) {
        console.log('  ✅ Found today\'s entry in history');
        console.log('  📊 History entry mood:', todayEntry.mood_level);
      } else {
        console.log('  ❌ No today\'s entry in history');
      }
    }
    
    // Simulate button logic
    const hasTodayEntry = todayResult.success && todayResult.data && todayResult.data.mood_level;
    const existingMood = todayResult.success && todayResult.data ? todayResult.data : null;
    
    console.log('\n🔘 Button state simulation:');
    console.log('  hasTodayEntry:', hasTodayEntry);
    console.log('  existingMood:', existingMood ? 'exists' : 'null');
    console.log('  Button text:', (hasTodayEntry || existingMood) ? 'Update Your Mood' : 'Log Your Mood');
    console.log('  Button color:', (hasTodayEntry || existingMood) ? 'purple' : 'red');
    
    if (hasTodayEntry || existingMood) {
      console.log('  ✅ Button should show "Update Your Mood"');
    } else {
      console.log('  ❌ Button should show "Log Your Mood"');
    }
    
  } catch (error) {
    console.error('❌ Error simulating mobile app:', error.message);
  }
}

// Run the test
fixMoodDataFinal();
