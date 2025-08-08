const fetch = require('node-fetch');

async function testContactAPI() {
  try {
    console.log('🧪 Testing Contact API...');
    
    const response = await fetch('http://localhost:3000/api/mobile/help/contact');
    const data = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ API Test Successful!');
      console.log('📞 Contact Methods:', data.data.contactMethods.length);
      console.log('🏢 Primary Contact:', data.data.primaryContact ? 'Available' : 'Not Available');
    } else {
      console.log('❌ API Test Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testContactAPI();
