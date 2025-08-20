import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test the mood data processing logic from WellnessDetailsScreen
async function testWellnessMoodDisplay() {
  console.log('🧪 Testing WellnessDetailsScreen mood data processing...\n');

  try {
    // 1. Get mood data from the API
    console.log('1️⃣ Getting mood data from API...');
    const moodResponse = await fetch(`${BASE_URL}/api/mobile/wellness/mood-tracker?user_id=1&period=7`);
    const moodResult = await moodResponse.json();
    
    console.log('📥 Mood API Response:', JSON.stringify(moodResult, null, 2));
    
    if (!moodResult.success) {
      console.log('❌ Failed to get mood data from API');
      return;
    }

    const moodData = moodResult.data;
    
    // 2. Test the hasMoodData logic from WellnessDetailsScreen
    console.log('\n2️⃣ Testing hasMoodData logic...');
    
    const hasMoodData = moodData && 
                       moodData.most_common_mood && 
                       moodData.total_entries > 0 && 
                       moodData.most_common_mood !== null;
    
    console.log('📊 hasMoodData check:');
    console.log('   - moodData exists:', !!moodData);
    console.log('   - most_common_mood:', moodData?.most_common_mood);
    console.log('   - total_entries > 0:', moodData?.total_entries > 0);
    console.log('   - most_common_mood !== null:', moodData?.most_common_mood !== null);
    console.log('   - Final hasMoodData result:', hasMoodData);
    
    // 3. Test mood score calculation
    console.log('\n3️⃣ Testing mood score calculation...');
    
    const moodScore = hasMoodData ? Math.round((moodData.average_mood_score || 5) * 10) : 0;
    const averageMood = hasMoodData ? moodData.most_common_mood : null;
    
    console.log('📊 Mood score calculation:');
    console.log('   - average_mood_score from API:', moodData?.average_mood_score);
    console.log('   - Calculated moodScore:', moodScore);
    console.log('   - averageMood:', averageMood);
    
    // 4. Test mood formatting
    console.log('\n4️⃣ Testing mood formatting...');
    
    const formatMood = (mood) => {
      return mood.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const formattedMood = hasMoodData ? formatMood(averageMood) : 'No mood data';
    console.log('📊 Mood formatting:');
    console.log('   - Original mood:', averageMood);
    console.log('   - Formatted mood:', formattedMood);
    
    // 5. Test the final display details
    console.log('\n5️⃣ Testing final display details...');
    
    const moodDetails = hasMoodData 
      ? `Mood: ${formattedMood} (${moodData.total_entries} entries)`
      : "No mood data available. Start tracking your mood!";
    
    console.log('📊 Final display details:');
    console.log('   - Details text:', moodDetails);
    console.log('   - Score to display:', moodScore);
    
    // 6. Summary
    console.log('\n📋 SUMMARY:');
    console.log('   - API returned mood data:', !!moodData);
    console.log('   - Has valid mood data:', hasMoodData);
    console.log('   - Mood score for display:', moodScore);
    console.log('   - Mood details for display:', moodDetails);
    
    if (hasMoodData) {
      console.log('✅ Mood data should be displayed correctly in WellnessDetailsScreen');
    } else {
      console.log('❌ Mood data will show as "No mood data available"');
      console.log('🔍 Possible issues:');
      console.log('   - No mood entries in database');
      console.log('   - most_common_mood is null/undefined');
      console.log('   - total_entries is 0');
    }
    
  } catch (error) {
    console.error('❌ Error testing wellness mood display:', error.message);
  }
}

// Run the test
testWellnessMoodDisplay();
