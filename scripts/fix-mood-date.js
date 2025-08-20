import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test adding mood data with correct date
async function fixMoodDate() {
  console.log('🔧 Fixing mood date issue...\n');

  const today = new Date().toISOString().split('T')[0];
  console.log('📅 Today\'s date:', today);

  // Test 1: Add mood entry with explicit date
  console.log('1. Adding mood entry with explicit date...');
  try {
    const moodData = {
      user_id: 1,
      mood_level: 'happy',
      stress_level: 'low',
      energy_level: 'high',
      sleep_quality: 'good',
      tracking_date: today, // Explicitly set today's date
      notes: 'Fixed date mood entry'
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
    console.log('Status:', response.status);
    
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

  // Test 2: Check if the entry was added correctly
  console.log('\n2. Checking if entry was added correctly...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/mood_tracking?user_id=1&limit=10`);
    const result = await response.json();
    
    if (result.success && result.moodData && result.moodData.length > 0) {
      console.log('✅ Found mood data for user ID = 1');
      console.log('📊 Number of entries:', result.moodData.length);
      
      // Look for today's entry
      const todayEntry = result.moodData.find(entry => {
        const entryDate = entry.tracking_date;
        if (typeof entryDate === 'string') {
          return entryDate.startsWith(today) || entryDate === today;
        }
        return false;
      });
      
      if (todayEntry) {
        console.log('✅ Found entry for today!');
        console.log('📊 Entry details:', {
          id: todayEntry.id,
          mood_level: todayEntry.mood_level,
          tracking_date: todayEntry.tracking_date,
          notes: todayEntry.notes
        });
      } else {
        console.log('❌ No entry found for today');
        console.log('Available dates:');
        result.moodData.forEach((entry, index) => {
          console.log(`  ${index + 1}. ${entry.tracking_date} (${entry.mood_level})`);
        });
      }
    } else {
      console.log('❌ No mood data found for user ID = 1');
    }
  } catch (error) {
    console.error('❌ Error checking mood data:', error.message);
  }

  // Test 3: Test the wellness mood tracker endpoint
  console.log('\n3. Testing wellness mood tracker endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ Wellness mood tracker data retrieved');
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
          console.log('✅ Found today\'s entry in wellness tracker!');
        } else {
          console.log('❌ No today\'s entry found in wellness tracker');
        }
      }
    } else {
      console.log('❌ Failed to get wellness mood tracker data');
    }
  } catch (error) {
    console.error('❌ Error getting wellness mood tracker data:', error.message);
  }
}

// Run the test
fixMoodDate();
