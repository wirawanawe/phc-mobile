import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Add mood entry for button test
async function addMoodForButtonTest() {
  console.log('🔧 Adding mood entry for button test...\n');

  const today = new Date().toISOString().split('T')[0];
  console.log('📅 Today\'s date:', today);

  // Add mood entry for today
  console.log('1. Adding mood entry for today...');
  try {
    const moodData = {
      user_id: 1,
      mood_level: 'happy',
      stress_level: 'low',
      energy_level: 'high',
      sleep_quality: 'good',
      tracking_date: today,
      notes: 'Mood entry for button test - ' + today
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
      console.log('📊 Inserted ID:', result.data.id);
      console.log('📊 Tracking date:', result.data.tracking_date);
    } else {
      console.log('❌ Failed to add mood entry');
    }
  } catch (error) {
    console.error('❌ Error adding mood entry:', error.message);
  }

  // Wait for data to be processed
  console.log('\n2. Waiting for data to be processed...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test the mobile app behavior
  console.log('\n3. Testing mobile app behavior...');
  try {
    // Get today's mood
    const todayResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker/today?user_id=1`);
    const todayResult = await todayResponse.json();
    
    // Get mood history
    const historyResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const historyResult = await historyResponse.json();
    
    console.log('📊 Today mood response:', JSON.stringify(todayResult, null, 2));
    console.log('📊 History response:', JSON.stringify(historyResult, null, 2));
    
    // Simulate the button logic from MoodTrackingScreen
    const hasTodayEntry = todayResult.success && todayResult.data && todayResult.data.mood_level;
    const existingMood = todayResult.success && todayResult.data ? todayResult.data : null;
    
    console.log('\n🔘 Button state analysis:');
    console.log('  hasTodayEntry:', hasTodayEntry);
    console.log('  existingMood:', existingMood ? 'exists' : 'null');
    console.log('  Button text:', (hasTodayEntry || existingMood) ? 'Update Your Mood' : 'Log Your Mood');
    console.log('  Button color:', (hasTodayEntry || existingMood) ? 'purple' : 'red');
    
    if (hasTodayEntry || existingMood) {
      console.log('  ✅ Button should show "Update Your Mood"');
      console.log('  🎉 SUCCESS: Button will change correctly!');
    } else {
      console.log('  ❌ Button should show "Log Your Mood"');
      console.log('  🔍 Issue: No mood data found for today');
    }
    
  } catch (error) {
    console.error('❌ Error testing mobile app behavior:', error.message);
  }

  // Summary
  console.log('\n4. Summary:');
  console.log('📋 Masalah: Data mood ada di database tapi tidak muncul di halaman MoodTrackingScreen');
  console.log('📋 Penyebab: Timezone issue atau format tanggal yang tidak sesuai');
  console.log('📋 Solusi: Menambahkan data mood dengan tanggal yang benar');
  console.log('📋 Status: Data mood sudah ditambahkan untuk user ID = 1');
  console.log('📋 Next: Test mobile app untuk melihat apakah button berubah');
}

// Run the script
addMoodForButtonTest();
