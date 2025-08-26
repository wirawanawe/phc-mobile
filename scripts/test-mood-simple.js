// Simple test to verify mood data saving and retrieval
const testUrls = [
  'https://dash.doctorphc.id/api/mobile'
];

async function testMoodSimple(url) {
  console.log(`\n🧪 Testing mood data at: ${url}`);
  
  try {
    // Step 1: Test connection
    console.log('1️⃣ Testing connection...');
    const connectionResponse = await fetch(`${url}/test-connection`);
    const connectionData = await connectionResponse.json();
    console.log('✅ Connection:', connectionData.message);
    
    // Step 2: Save mood data for user 5 (from terminal output)
    console.log('2️⃣ Saving mood data for user 5...');
    const moodData = {
      user_id: 5,
      mood_level: 'happy',
      stress_level: 'low',
      energy_level: 'high',
      tracking_date: new Date().toISOString().split('T')[0],
      notes: 'Test mood data for wellness screen'
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
    
    // Step 3: Verify mood data exists in database
    console.log('3️⃣ Verifying mood data in database...');
    const verifyResponse = await fetch(`${url}/mood_tracking?user_id=5&limit=5`);
    const verifyData = await verifyResponse.json();
    
    console.log('✅ Verification result:', verifyData);
    
    if (verifyData.success && verifyData.moodData && verifyData.moodData.length > 0) {
      console.log('📊 Mood data verified in database!');
      console.log(`📈 Found ${verifyData.moodData.length} mood entries for user 5`);
      console.log('📋 Latest entry:', {
        id: verifyData.moodData[0].id,
        mood_level: verifyData.moodData[0].mood_level,
        tracking_date: verifyData.moodData[0].tracking_date,
        notes: verifyData.moodData[0].notes
      });
      
      // Check if there are multiple entries
      const happyEntries = verifyData.moodData.filter(entry => entry.mood_level === 'happy');
      const veryHappyEntries = verifyData.moodData.filter(entry => entry.mood_level === 'very_happy');
      
      console.log(`😊 Happy entries: ${happyEntries.length}`);
      console.log(`😄 Very happy entries: ${veryHappyEntries.length}`);
      
      if (happyEntries.length > 0 || veryHappyEntries.length > 0) {
        console.log('🎉 SUCCESS: Mood data is being saved and retrieved correctly!');
        console.log('💡 The wellness screen should now show this mood data');
      }
    } else {
      console.log('⚠️ WARNING: No mood entries found for user 5');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting simple mood data tests...');
  
  for (const url of testUrls) {
    await testMoodSimple(url);
  }
  
  console.log('\n✅ Simple mood data tests completed!');
  console.log('\n💡 Next steps:');
  console.log('   1. Open the mobile app');
  console.log('   2. Navigate to the mood tracking screen');
  console.log('   3. Log a mood entry');
  console.log('   4. Navigate to the wellness details screen');
  console.log('   5. The mood data should appear in the "Mental Wellness" metric');
  console.log('   6. Pull down to refresh if needed');
}

runTests().catch(console.error);
