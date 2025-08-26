const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function addMoodToday() {
  console.log('🔧 Adding mood entry for today...\n');

  const today = new Date().toISOString().split('T')[0];
  console.log('📅 Today\'s date:', today);

  try {
    const moodData = {
      user_id: 1,
      mood_level: 'very_happy',
      mood_score: 10,
      stress_level: 'low',
      energy_level: 'high',
      sleep_quality: 'excellent',
      tracking_date: today,
      notes: 'Feeling great today! Added via script for testing.'
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
      console.log('✅ Mood entry added successfully');
      console.log('📊 Inserted ID:', result.data?.id);
      console.log('📊 Tracking date:', result.data?.tracking_date);
    } else {
      console.log('❌ Failed to add mood entry');
    }
  } catch (error) {
    console.error('❌ Error adding mood entry:', error.message);
  }

  // Wait a moment
  console.log('\n2. Waiting for data to be processed...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test the API with today's date
  console.log('\n3. Testing API with today\'s date...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/mood_tracking?user_id=1&date=${today}`);
    const result = await response.json();
    console.log('📥 API response for today:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data && result.data.entries && result.data.entries.length > 0) {
      console.log('✅ Found mood data for today!');
      console.log('📊 Total entries:', result.data.total_entries);
      console.log('📊 First entry mood:', result.data.entries[0].mood_level);
    } else {
      console.log('❌ No mood data found for today');
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the script
addMoodToday();
