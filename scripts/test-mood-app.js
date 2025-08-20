import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test the mood app functionality
async function testMoodApp() {
  console.log('🧪 Testing Mood App...\n');

  const today = new Date().toISOString().split('T')[0];
  console.log('📅 Today\'s date:', today);

  // Test 1: Add a mood entry for today
  console.log('1. Adding mood entry for today...');
  try {
    const moodData = {
      user_id: 1,
      mood_level: 'happy',
      stress_level: 'low',
      energy_level: 'high',
      sleep_quality: 'good',
      tracking_date: today,
      notes: 'Test mood for app debugging'
    };

    const response = await fetch(`${BASE_URL}/api/mobile/mood_tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moodData)
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Mood entry added successfully');
    } else {
      console.log('❌ Failed to add mood entry');
    }
  } catch (error) {
    console.error('❌ Error adding mood entry:', error.message);
  }

  // Test 2: Get today's mood data
  console.log('\n2. Getting today\'s mood data...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker/today?user_id=1`);
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log('✅ Today\'s mood data retrieved');
      console.log('📊 Mood level:', result.data.mood_level);
      console.log('📊 Tracking date:', result.data.tracking_date);
    } else {
      console.log('❌ No mood data for today');
    }
  } catch (error) {
    console.error('❌ Error getting today\'s mood data:', error.message);
  }

  // Test 3: Get mood tracker data
  console.log('\n3. Getting mood tracker data...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log('✅ Mood tracker data retrieved');
      console.log('📊 Total entries:', result.data.total_entries);
      console.log('📊 Entries:', result.data.entries?.length || 0);
      
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
        }
      }
    } else {
      console.log('❌ Failed to get mood tracker data');
    }
  } catch (error) {
    console.error('❌ Error getting mood tracker data:', error.message);
  }

  // Test 4: Simulate what the mobile app would see
  console.log('\n4. Simulating mobile app behavior...');
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
      const today = new Date().toISOString().split('T')[0];
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
    
  } catch (error) {
    console.error('❌ Error simulating mobile app:', error.message);
  }
}

// Run the test
testMoodApp();
