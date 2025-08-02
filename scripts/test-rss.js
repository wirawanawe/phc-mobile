const fetch = require('node-fetch');

async function testRSSFeeds() {
  const rssUrls = [
    'https://health.detik.com/rss',
    'https://health.detik.com/rss/health',
    'https://health.detik.com/rss/lifestyle'
  ];

  console.log('Testing RSS feeds...\n');

  for (const url of rssUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PHC-Mobile-App/1.0',
          'Accept': 'text/xml, application/xml, */*',
        },
        timeout: 10000,
      });

      if (response.ok) {
        const text = await response.text();
        console.log(`✅ Success: ${response.status} - Length: ${text.length} characters`);
        
        // Check if it's valid XML
        if (text.includes('<rss') || text.includes('<feed')) {
          console.log('✅ Valid RSS/XML format detected');
        } else {
          console.log('⚠️  Warning: May not be valid RSS/XML format');
        }
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

testRSSFeeds().catch(console.error); 