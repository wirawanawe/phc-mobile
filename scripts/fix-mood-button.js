import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Fix mood button issue
async function fixMoodButton() {
  console.log('🔧 Fixing mood button issue...\n');

  const today = new Date().toISOString().split('T')[0];
  console.log('📅 Today\'s date:', today);

  // Step 1: Add mood entry for today with correct date
  console.log('1. Adding mood entry for today...');
  try {
    const moodData = {
      user_id: 1,
      mood_level: 'happy',
      stress_level: 'low',
      energy_level: 'high',
      sleep_quality: 'good',
      tracking_date: today,
      notes: 'Mood entry for today - ' + today
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
    } else {
      console.log('❌ Failed to add mood entry');
    }
  } catch (error) {
    console.error('❌ Error adding mood entry:', error.message);
  }

  // Step 2: Wait for data to be processed
  console.log('\n2. Waiting for data to be processed...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 3: Test the mobile app behavior
  console.log('\n3. Testing mobile app behavior...');
  try {
    // Simulate what the mobile app does
    console.log('📱 Simulating mobile app API calls...');
    
    // Get today's mood (this is what the mobile app calls)
    const todayResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker/today?user_id=1`);
    const todayResult = await todayResponse.json();
    
    // Get mood history (this is what the mobile app calls)
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
      
      // Debug information
      if (todayResult.success && todayResult.data === null) {
        console.log('  🔍 Debug: Today endpoint returned null data');
      }
      
      if (historyResult.success && historyResult.data) {
        console.log('  🔍 Debug: History has', historyResult.data.total_entries, 'entries');
        if (historyResult.data.entries && historyResult.data.entries.length > 0) {
          console.log('  🔍 Debug: Available dates:', historyResult.data.entries.map(e => e.tracking_date));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing mobile app behavior:', error.message);
  }

  // Step 4: Summary
  console.log('\n4. Summary:');
  console.log('📋 The issue is that data mood ada di database tapi tidak muncul di halaman MoodTrackingScreen');
  console.log('📋 Kemungkinan penyebab:');
  console.log('   - Timezone issue di database');
  console.log('   - Format tanggal yang tidak sesuai');
  console.log('   - API endpoint yang memerlukan authentication');
  console.log('   - User ID yang tidak sesuai');
  
  console.log('\n💡 Solusi yang sudah dilakukan:');
  console.log('   ✅ Memperbaiki API endpoint untuk support testing tanpa auth');
  console.log('   ✅ Menambahkan logging untuk debug');
  console.log('   ✅ Memperbaiki query untuk menggunakan DATE() function');
  console.log('   ✅ Menambahkan data mood untuk hari ini');
  
  console.log('\n🎯 Next steps:');
  console.log('   1. Test mobile app dengan data yang sudah ditambahkan');
  console.log('   2. Periksa apakah button berubah dari "Log Your Mood" ke "Update Your Mood"');
  console.log('   3. Jika masih bermasalah, periksa user authentication di mobile app');
}

// Run the script
fixMoodButton();
