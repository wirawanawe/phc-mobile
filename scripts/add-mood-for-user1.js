import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test adding mood data for user ID = 1
async function addMoodForUser1() {
  console.log('🧪 Adding mood data for user ID = 1...\n');

  // Test 1: Add mood entry for today
  console.log('1. Adding mood entry for today...');
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Today\'s date:', today);

    const moodData = {
      user_id: 1,
      mood_level: 'happy',
      stress_level: 'low',
      energy_level: 'high',
      sleep_quality: 'good',
      tracking_date: today, // Use today's date
      notes: 'Test mood entry for debugging - today'
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
    console.log('Status:', response.status);
    
    if (result.success) {
      console.log('✅ Mood entry added successfully');
    } else {
      console.log('❌ Failed to add mood entry');
    }
  } catch (error) {
    console.error('❌ Error adding mood entry:', error.message);
  }

  // Test 2: Get mood data for user ID = 1
  console.log('\n2. Getting mood data for user ID = 1...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/mood_tracking?user_id=1&limit=5`);
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('Status:', response.status);
    
    if (result.success && result.moodData && result.moodData.length > 0) {
      console.log('✅ Found mood data for user ID = 1');
      console.log('📊 Number of entries:', result.moodData.length);
      
      // Check for today's entry
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = result.moodData.find(entry => 
        entry.tracking_date && entry.tracking_date.startsWith(today)
      );
      
      if (todayEntry) {
        console.log('✅ Found entry for today:', todayEntry.tracking_date);
      } else {
        console.log('❌ No entry found for today');
        console.log('Available dates:', result.moodData.map(e => e.tracking_date));
      }
    } else {
      console.log('❌ No mood data found for user ID = 1');
    }
  } catch (error) {
    console.error('❌ Error getting mood data:', error.message);
  }

  // Test 3: Test wellness mood tracker endpoint (without auth for testing)
  console.log('\n3. Testing wellness mood tracker endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('Status:', response.status);
    
    if (result.success && result.data) {
      console.log('✅ Wellness mood tracker data retrieved');
      console.log('📊 Total entries:', result.data.total_entries);
      console.log('📊 Entries:', result.data.entries?.length || 0);
      
      // Check for today's entry
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = result.data.entries?.find(entry => 
        entry.tracking_date === today
      );
      
      if (todayEntry) {
        console.log('✅ Found today\'s entry in wellness tracker:', todayEntry);
      } else {
        console.log('❌ No today\'s entry found in wellness tracker');
        console.log('Available dates:', result.data.entries?.map(e => e.tracking_date) || []);
      }
    } else {
      console.log('❌ Failed to get wellness mood tracker data');
    }
  } catch (error) {
    console.error('❌ Error getting wellness mood tracker data:', error.message);
  }

  // Test 4: Test today's mood endpoint (without auth for testing)
  console.log('\n4. Testing today\'s mood endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker/today?user_id=1`);
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('Status:', response.status);
    
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
}

// Run the tests
addMoodForUser1();
