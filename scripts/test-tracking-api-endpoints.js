const axios = require('axios');

// Test API endpoints directly
async function testTrackingAPIEndpoints() {
  try {
    console.log('🧪 Testing tracking API endpoints...\n');
    
    const baseURL = 'http://localhost:3000/api';
    const today = new Date().toISOString().split('T')[0];
    const userId = 27; // Using the same user ID from our database
    
    console.log('📅 Testing for date:', today);
    console.log('👤 Using user ID:', userId);
    console.log('🌐 Base URL:', baseURL);

    // Test Mood Tracking API
    console.log('\n😊 Testing Mood Tracking API...');
    try {
      const moodResponse = await axios.get(`${baseURL}/mobile/mood_tracking`, {
        params: { user_id: userId, date: today }
      });
      console.log('✅ Mood API Response:', {
        success: moodResponse.data.success,
        entries: moodResponse.data.data?.entries?.length || 0,
        data: moodResponse.data.data
      });
    } catch (error) {
      console.log('❌ Mood API Error:', error.response?.data || error.message);
    }

    // Test Water Tracking API
    console.log('\n💧 Testing Water Tracking API...');
    try {
      const waterResponse = await axios.get(`${baseURL}/mobile/tracking/water`, {
        params: { user_id: userId, date: today }
      });
      console.log('✅ Water API Response:', {
        success: waterResponse.data.success,
        entries: waterResponse.data.data?.entries?.length || 0,
        data: waterResponse.data.data
      });
    } catch (error) {
      console.log('❌ Water API Error:', error.response?.data || error.message);
    }

    // Test Fitness Tracking API
    console.log('\n🏃‍♂️ Testing Fitness Tracking API...');
    try {
      const fitnessResponse = await axios.get(`${baseURL}/mobile/tracking/fitness`, {
        params: { user_id: userId, date: today }
      });
      console.log('✅ Fitness API Response:', {
        success: fitnessResponse.data.success,
        entries: fitnessResponse.data.data?.entries?.length || 0,
        data: fitnessResponse.data.data
      });
    } catch (error) {
      console.log('❌ Fitness API Error:', error.response?.data || error.message);
    }

    // Test Sleep Tracking API
    console.log('\n😴 Testing Sleep Tracking API...');
    try {
      const sleepResponse = await axios.get(`${baseURL}/mobile/sleep_tracking`, {
        params: { user_id: userId, sleep_date: today }
      });
      console.log('✅ Sleep API Response:', {
        success: sleepResponse.data.success,
        sleepData: sleepResponse.data.data?.sleepData?.length || 0,
        data: sleepResponse.data.data
      });
    } catch (error) {
      console.log('❌ Sleep API Error:', error.response?.data || error.message);
    }

    // Test Meal Tracking API
    console.log('\n🍽️ Testing Meal Tracking API...');
    try {
      const mealResponse = await axios.get(`${baseURL}/mobile/tracking/meal`, {
        params: { user_id: userId, date: today }
      });
      console.log('✅ Meal API Response:', {
        success: mealResponse.data.success,
        entries: mealResponse.data.data?.entries?.length || 0,
        data: mealResponse.data.data
      });
    } catch (error) {
      console.log('❌ Meal API Error:', error.response?.data || error.message);
    }

    // Test without date parameter (should return recent data)
    console.log('\n📊 Testing APIs without date parameter...');
    
    console.log('\n😊 Mood API (no date):');
    try {
      const moodRecentResponse = await axios.get(`${baseURL}/mobile/mood_tracking`, {
        params: { user_id: userId }
      });
      console.log('✅ Mood Recent Response:', {
        success: moodRecentResponse.data.success,
        entries: moodRecentResponse.data.data?.entries?.length || 0
      });
    } catch (error) {
      console.log('❌ Mood Recent API Error:', error.response?.data || error.message);
    }

    console.log('\n💧 Water API (no date):');
    try {
      const waterRecentResponse = await axios.get(`${baseURL}/mobile/tracking/water`, {
        params: { user_id: userId }
      });
      console.log('✅ Water Recent Response:', {
        success: waterRecentResponse.data.success,
        entries: waterRecentResponse.data.data?.entries?.length || 0
      });
    } catch (error) {
      console.log('❌ Water Recent API Error:', error.response?.data || error.message);
    }

    console.log('\n✅ API endpoint testing completed!');

  } catch (error) {
    console.error('❌ Error testing API endpoints:', error.message);
  }
}

// Run the test
testTrackingAPIEndpoints();
