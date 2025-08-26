const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function addSleepToday() {
  console.log('🔧 Adding sleep entry for today...\n');

  const today = new Date().toISOString().split('T')[0];
  console.log('📅 Today\'s date:', today);

  try {
    const sleepData = {
      user_id: 1,
      sleep_date: today,
      bedtime: '22:00:00',
      wake_time: '06:30:00',
      sleep_hours: 8,
      sleep_minutes: 30,
      sleep_duration_minutes: 510, // 8 hours 30 minutes in minutes
      sleep_quality: 'excellent',
      sleep_latency_minutes: 15,
      wake_up_count: 1,
      notes: 'Great sleep quality today! Added via script for testing.'
    };

    console.log('📤 Sending data:', JSON.stringify(sleepData, null, 2));

    const response = await fetch(`${BASE_URL}/api/mobile/sleep_tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sleepData)
    });

    const result = await response.json();
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Sleep entry added successfully');
      console.log('📊 Inserted ID:', result.data?.id);
      console.log('📊 Sleep date:', result.data?.sleep_date);
    } else {
      console.log('❌ Failed to add sleep entry');
    }
  } catch (error) {
    console.error('❌ Error adding sleep entry:', error.message);
  }

  // Wait a moment
  console.log('\n2. Waiting for data to be processed...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test the API with today's date
  console.log('\n3. Testing API with today\'s date...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/sleep_tracking?user_id=1&date=${today}`);
    const result = await response.json();
    console.log('📥 API response for today:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data && result.data.entries && result.data.entries.length > 0) {
      console.log('✅ Found sleep data for today!');
      console.log('📊 Total entries:', result.data.total_entries);
      console.log('📊 First entry sleep hours:', result.data.entries[0].sleep_hours);
      console.log('📊 First entry quality:', result.data.entries[0].sleep_quality);
    } else {
      console.log('❌ No sleep data found for today');
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the script
addSleepToday();
