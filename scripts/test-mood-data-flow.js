// Test script to verify mood data flow
const testUrls = [
  'http://localhost:3000/api/mobile',
  'http://192.168.18.30:3000/api/mobile'
];

async function testMoodDataFlow(url) {
  console.log(`\n🧪 Testing mood data flow at: ${url}`);
  
  try {
    // Step 1: Test connection
    console.log('1️⃣ Testing connection...');
    const connectionResponse = await fetch(`${url}/test-connection`);
    const connectionData = await connectionResponse.json();
    console.log('✅ Connection:', connectionData.message);
    
    // Step 2: Test mood creation
    console.log('2️⃣ Testing mood creation...');
    const moodData = {
      user_id: 1,
      mood_level: 'happy',
      stress_level: 'low',
      energy_level: 'high',
      tracking_date: new Date().toISOString().split('T')[0],
      notes: 'Test mood data from script'
    };
    
    console.log('📝 Sending mood data:', moodData);
    
    const moodResponse = await fetch(`${url}/mood_tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moodData)
    });
    
    const moodResult = await moodResponse.json();
    console.log('✅ Mood creation result:', moodResult);
    
    if (!moodResult.success) {
      console.log('❌ FAILED: Mood data not saved');
      console.log('Error:', moodResult.message);
      return;
    }
    
    console.log('🎉 SUCCESS: Mood data saved successfully!');
    console.log(`📊 Saved with ID: ${moodResult.data.id}`);
    
    // Step 3: Test mood retrieval via wellness endpoint
    console.log('3️⃣ Testing mood retrieval via wellness endpoint...');
    const wellnessResponse = await fetch(`${url}/wellness/mood-tracker?user_id=1&period=7`);
    const wellnessData = await wellnessResponse.json();
    
    console.log('✅ Wellness mood data:', wellnessData);
    
    if (wellnessData.success) {
      console.log('📊 Mood data retrieved successfully!');
      console.log(`📈 Total entries: ${wellnessData.data.total_entries}`);
      console.log(`😊 Most common mood: ${wellnessData.data.most_common_mood}`);
      console.log(`📊 Average mood score: ${wellnessData.data.average_mood_score}`);
      console.log(`📋 Mood distribution:`, wellnessData.data.mood_distribution);
      
      if (wellnessData.data.total_entries > 0) {
        console.log('🎉 SUCCESS: Mood data is being retrieved correctly!');
      } else {
        console.log('⚠️ WARNING: No mood entries found, but API is working');
      }
    } else {
      console.log('❌ FAILED: Could not retrieve mood data');
      console.log('Error:', wellnessData.message || wellnessData.error);
    }
    
    // Step 4: Test direct mood tracking endpoint
    console.log('4️⃣ Testing direct mood tracking endpoint...');
    const directResponse = await fetch(`${url}/mood_tracking?user_id=1&limit=5`);
    const directData = await directResponse.json();
    
    console.log('✅ Direct mood data:', directData);
    
    if (directData.success && directData.moodData && directData.moodData.length > 0) {
      console.log('📊 Direct mood data retrieved successfully!');
      console.log(`📈 Found ${directData.moodData.length} mood entries`);
      console.log('📋 Latest entry:', directData.moodData[0]);
    } else {
      console.log('⚠️ WARNING: No direct mood entries found');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting mood data flow tests...');
  
  for (const url of testUrls) {
    await testMoodDataFlow(url);
  }
  
  console.log('\n✅ Mood data flow tests completed!');
}

runTests().catch(console.error);
