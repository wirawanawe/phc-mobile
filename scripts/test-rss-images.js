const fetch = require('node-fetch');

async function testRSSImageExtraction() {
  const rssUrls = [
    'https://health.detik.com/rss',
    'https://health.detik.com/rss/health',
    'https://health.detik.com/rss/lifestyle'
  ];

  console.log('Testing RSS image extraction...\n');

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
        
        // Test image extraction
        const items = parseRSSItems(text, 'test');
        console.log(`📰 Found ${items.length} items`);
        
        items.forEach((item, index) => {
          console.log(`  Item ${index + 1}:`);
          console.log(`    Title: ${item.title.substring(0, 50)}...`);
          console.log(`    Image URL: ${item.imageUrl || 'No image found'}`);
          console.log(`    Fallback Icon: ${item.image}`);
        });
        
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

function parseRSSItems(xmlText, source) {
  try {
    const items = [];
    
    // Extract items from XML
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    let index = 0;
    
    while ((match = itemRegex.exec(xmlText)) !== null && index < 3) {
      const itemContent = match[1];
      
      // Extract title
      const titleMatch = itemContent.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>([^<]+)<\/title>/i);
      let title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : 'Untitled';
      
      // Extract description
      const descMatch = itemContent.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>([^<]+)<\/description>/i);
      let description = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '';
      
      // Extract image URL
      let imageUrl;
      
      // Try to extract from media:content first
      const mediaMatch = itemContent.match(/<media:content[^>]+url="([^"]+)"/i);
      if (mediaMatch) {
        imageUrl = mediaMatch[1];
      } else {
        // Try to extract from description HTML
        const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }
      
      // Clean description
      description = description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      
      items.push({
        id: `${source}-${Date.now()}-${index}`,
        title,
        description: description.substring(0, 100) + '...',
        imageUrl,
        image: 'heart-pulse', // fallback icon
        color: '#E53E3E',
        bgColor: '#FEF2F2',
        category: 'Health',
        source,
        readTime: '5 min read'
      });
      
      index++;
    }
    
    return items;
  } catch (error) {
    console.error('Error parsing RSS:', error);
    return [];
  }
}

testRSSImageExtraction().catch(console.error);
