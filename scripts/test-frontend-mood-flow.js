import fetch from 'node-fetch';

const BASE_URL = 'https://dash.doctorphc.id';

// Simulate the frontend mood data flow
async function testFrontendMoodFlow() {
  console.log('🧪 Testing Frontend Mood Data Flow...\n');

  try {
    // 1. Simulate MoodInputScreen - Create mood entry
    console.log('1️⃣ Simulating MoodInputScreen - Creating mood entry...');
    
    const moodData = {
      user_id: 1,
      mood_level: 'very_happy', // Use valid mood level from database enum
      stress_level: 'low',
      energy_level: 'high',
      tracking_date: new Date().toISOString().split('T')[0],
      notes: 'Test frontend mood flow'
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/mobile/mood_tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moodData)
    });
    
    const createResult = await createResponse.json();
    console.log('📝 Mood creation result:', JSON.stringify(createResult, null, 2));
    
    if (!createResult.success) {
      console.log('❌ Failed to create mood data');
      return;
    }
    
    // 2. Simulate event emission (this would happen in MoodInputScreen)
    console.log('\n2️⃣ Simulating event emission (moodLogged event)...');
    console.log('✅ Event would be emitted: eventEmitter.emitMoodLogged()');
    
    // 3. Simulate WellnessDetailsScreen - Fetch updated data
    console.log('\n3️⃣ Simulating WellnessDetailsScreen - Fetching updated data...');
    
    // Wait a moment for data to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch mood data (like WellnessDetailsScreen does)
    const moodResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const moodResult = await moodResponse.json();
    
    console.log('📥 Mood data response:', JSON.stringify(moodResult, null, 2));
    
    if (!moodResult.success) {
      console.log('❌ Failed to fetch mood data');
      return;
    }
    
    // 4. Simulate the frontend processing logic
    console.log('\n4️⃣ Simulating frontend processing logic...');
    
    const moodDataFromAPI = moodResult.data;
    
    // Test the hasMoodData logic from WellnessDetailsScreen
    const hasMoodData = moodDataFromAPI && 
                       moodDataFromAPI.most_common_mood && 
                       moodDataFromAPI.total_entries > 0 && 
                       moodDataFromAPI.most_common_mood !== null;
    
    const moodScore = hasMoodData ? Math.round((moodDataFromAPI.average_mood_score || 5) * 10) : 0;
    const averageMood = hasMoodData ? moodDataFromAPI.most_common_mood : null;
    
    const formatMood = (mood) => {
      return mood.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const formattedMood = hasMoodData ? formatMood(averageMood) : 'No mood data';
    const moodDetails = hasMoodData 
      ? `Mood: ${formattedMood} (${moodDataFromAPI.total_entries} entries)`
      : "No mood data available. Start tracking your mood!";
    
    console.log('📊 Frontend processing results:');
    console.log('   - Has mood data:', hasMoodData);
    console.log('   - Mood score:', moodScore);
    console.log('   - Mood details:', moodDetails);
    console.log('   - Most common mood:', averageMood);
    console.log('   - Average mood score:', moodDataFromAPI?.average_mood_score);
    console.log('   - Total entries:', moodDataFromAPI?.total_entries);
    
    // 5. Check if the new mood data is included
    console.log('\n5️⃣ Checking if new mood data is included...');
    
    const newMoodIncluded = moodDataFromAPI.entries?.some(entry => 
      entry.notes === 'Test frontend mood flow'
    );
    
    console.log('📊 New mood data check:');
    console.log('   - New mood entry found:', newMoodIncluded);
    console.log('   - Total entries in response:', moodDataFromAPI.entries?.length || 0);
    
    if (newMoodIncluded) {
      console.log('✅ New mood data is included in the response');
    } else {
      console.log('❌ New mood data is NOT included in the response');
      console.log('🔍 Available entries:');
      moodDataFromAPI.entries?.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.tracking_date} - ${entry.mood_level} - ${entry.notes}`);
      });
    }
    
    // 6. Summary
    console.log('\n📋 SUMMARY:');
    if (hasMoodData) {
      console.log('✅ Frontend would display mood data correctly');
      console.log('✅ Mental Wellness metric would show updated information');
    } else {
      console.log('❌ Frontend would show "No mood data available"');
    }
    
    if (newMoodIncluded) {
      console.log('✅ Data refresh is working correctly');
      console.log('✅ New mood entries are being included');
    } else {
      console.log('❌ Data refresh is NOT working correctly');
      console.log('❌ New mood entries are NOT being included');
    }
    
  } catch (error) {
    console.error('❌ Error testing frontend mood flow:', error.message);
  }
}

// Run the test
testFrontendMoodFlow();
