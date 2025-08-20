import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test mood event emission and data refresh
async function testMoodEventRefresh() {
  console.log('🧪 Testing mood event emission and data refresh...\n');

  try {
    // 1. Get initial mood data
    console.log('1️⃣ Getting initial mood data...');
    const initialResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const initialResult = await initialResponse.json();
    
    console.log('📥 Initial mood data:', JSON.stringify(initialResult.data, null, 2));
    const initialEntries = initialResult.data?.total_entries || 0;
    console.log('📊 Initial entries count:', initialEntries);
    
    // 2. Add new mood data (simulating mood logging)
    console.log('\n2️⃣ Adding new mood data...');
    const newMoodData = {
      user_id: 1,
      mood_level: 'very_happy',
      stress_level: 'low',
      energy_level: 'high',
      tracking_date: new Date().toISOString().split('T')[0],
      notes: 'Test mood event refresh'
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/mobile/mood_tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMoodData)
    });
    
    const createResult = await createResponse.json();
    console.log('📝 Create mood result:', JSON.stringify(createResult, null, 2));
    
    if (!createResult.success) {
      console.log('❌ Failed to create mood data');
      return;
    }
    
    // 3. Wait a moment for the data to be processed
    console.log('\n3️⃣ Waiting for data processing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Get updated mood data (simulating refresh after event)
    console.log('\n4️⃣ Getting updated mood data (after event)...');
    const updatedResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const updatedResult = await updatedResponse.json();
    
    console.log('📥 Updated mood data:', JSON.stringify(updatedResult.data, null, 2));
    const updatedEntries = updatedResult.data?.total_entries || 0;
    console.log('📊 Updated entries count:', updatedEntries);
    
    // 5. Compare results
    console.log('\n5️⃣ Comparing results...');
    console.log('📊 Comparison:');
    console.log('   - Initial entries:', initialEntries);
    console.log('   - Updated entries:', updatedEntries);
    console.log('   - Entries increased:', updatedEntries > initialEntries);
    console.log('   - Most common mood changed:', initialResult.data?.most_common_mood !== updatedResult.data?.most_common_mood);
    
    // 6. Test the frontend logic with updated data
    console.log('\n6️⃣ Testing frontend logic with updated data...');
    
    const moodData = updatedResult.data;
    const hasMoodData = moodData && 
                       moodData.most_common_mood && 
                       moodData.total_entries > 0 && 
                       moodData.most_common_mood !== null;
    
    const moodScore = hasMoodData ? Math.round((moodData.average_mood_score || 5) * 10) : 0;
    const averageMood = hasMoodData ? moodData.most_common_mood : null;
    
    const formatMood = (mood) => {
      return mood.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const formattedMood = hasMoodData ? formatMood(averageMood) : 'No mood data';
    const moodDetails = hasMoodData 
      ? `Mood: ${formattedMood} (${moodData.total_entries} entries)`
      : "No mood data available. Start tracking your mood!";
    
    console.log('📊 Frontend display data:');
    console.log('   - Has mood data:', hasMoodData);
    console.log('   - Mood score:', moodScore);
    console.log('   - Mood details:', moodDetails);
    console.log('   - Most common mood:', averageMood);
    console.log('   - Average mood score:', moodData?.average_mood_score);
    
    // 7. Summary
    console.log('\n📋 SUMMARY:');
    if (updatedEntries > initialEntries) {
      console.log('✅ New mood data was successfully added');
      console.log('✅ Data refresh would show updated information');
      console.log('✅ Frontend should display the new mood data');
    } else {
      console.log('❌ No new mood data was added');
      console.log('❌ Data refresh would not show changes');
    }
    
    if (hasMoodData) {
      console.log('✅ Frontend logic would display mood data correctly');
    } else {
      console.log('❌ Frontend logic would show "No mood data available"');
    }
    
  } catch (error) {
    console.error('❌ Error testing mood event refresh:', error.message);
  }
}

// Run the test
testMoodEventRefresh();
