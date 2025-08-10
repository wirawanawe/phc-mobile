const fetch = require('node-fetch');

async function testMobileAPI() {
  const urls = [
    'http://localhost:3000/api/mobile/help/contact',
    'http://10.242.90.103:3000/api/mobile/help/contact'
  ];

  for (const url of urls) {
    try {
      console.log(`🧪 Testing URL: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      
      if (data.success) {
        console.log('✅ Success!');
        console.log('📞 Contact Methods:', data.data.contactMethods.length);
        console.log('📞 First Contact:', data.data.contactMethods[0]);
      } else {
        console.log('❌ Failed:', data.message);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('---');
  }
}

testMobileAPI();
