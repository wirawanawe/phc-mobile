const fetch = require('node-fetch');

async function testMobileConnection() {
  const baseUrls = [
    'http://localhost:3000',
    'http://10.242.90.103:3000'
  ];

  for (const baseUrl of baseUrls) {
    console.log(`\n🧪 Testing connection to: ${baseUrl}`);
    
    try {
      // Test health endpoint
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      console.log(`📊 Health Status: ${healthResponse.status}`);
      
      // Test mobile help contact endpoint
      const contactResponse = await fetch(`${baseUrl}/api/mobile/help/contact`);
      const contactData = await contactResponse.json();
      
      console.log(`📊 Contact Status: ${contactResponse.status}`);
      
      if (contactData.success) {
        console.log('✅ Contact API working!');
        console.log('📞 Contact methods found:', contactData.data.contactMethods.length);
        
        // Show first contact method details
        const firstContact = contactData.data.contactMethods[0];
        console.log('📞 First contact method:');
        console.log(`   Title: ${firstContact.title}`);
        console.log(`   Value: ${firstContact.value}`);
        console.log(`   Action: ${firstContact.action}`);
        
        // Check if it's using database data or default
        if (firstContact.value === '+62-21-12345678') {
          console.log('✅ Using database data (Kantor Pusat PHC)');
        } else {
          console.log('❌ Not using expected database data');
        }
      } else {
        console.log('❌ Contact API failed:', contactData.message);
      }
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }
}

testMobileConnection();
