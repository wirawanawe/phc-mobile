const fetch = require('node-fetch');

async function testFitnessAPI() {
  try {
    console.log('🧪 Testing Fitness API directly...');
    
    // Test the backend API directly
    const baseUrl = 'http://localhost:3000/api/mobile';
    
    console.log('\n1. Testing fitness history endpoint...');
    const historyUrl = `${baseUrl}/tracking/fitness`;
    
    const historyResponse = await fetch(historyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add a test user_id as query parameter
      }
    });
    
    console.log('📋 History Response Status:', historyResponse.status);
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('📋 History Response Data:', JSON.stringify(historyData, null, 2));
      
      if (historyData.success && historyData.data) {
        console.log('✅ History API call successful');
        console.log('📊 Data type:', typeof historyData.data);
        console.log('📊 Is Array:', Array.isArray(historyData.data));
        console.log('📊 Data length:', historyData.data ? historyData.data.length : 'undefined');
        
        if (Array.isArray(historyData.data) && historyData.data.length > 0) {
          console.log('📋 First entry:', JSON.stringify(historyData.data[0], null, 2));
        }
      } else {
        console.log('❌ History API call failed or no data');
        console.log('📋 Response structure:', {
          success: historyData.success,
          hasData: !!historyData.data,
          dataType: typeof historyData.data,
          message: historyData.message
        });
      }
    } else {
      console.log('❌ History API call failed with status:', historyResponse.status);
      const errorText = await historyResponse.text();
      console.log('📋 Error response:', errorText);
    }
    
    // Test with user_id parameter
    console.log('\n2. Testing fitness history with user_id...');
    const historyWithUserIdUrl = `${baseUrl}/tracking/fitness?user_id=1`;
    
    const historyWithUserIdResponse = await fetch(historyWithUserIdUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📋 History with user_id Response Status:', historyWithUserIdResponse.status);
    
    if (historyWithUserIdResponse.ok) {
      const historyWithUserIdData = await historyWithUserIdResponse.json();
      console.log('📋 History with user_id Response Data:', JSON.stringify(historyWithUserIdData, null, 2));
    } else {
      console.log('❌ History with user_id API call failed with status:', historyWithUserIdResponse.status);
      const errorText = await historyWithUserIdResponse.text();
      console.log('📋 Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing fitness API:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testFitnessAPI();
