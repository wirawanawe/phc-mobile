const fetch = require('node-fetch');

async function testRSSDeduplication() {
  const rssFeeds = [
    {
      url: 'https://health.detik.com/rss',
      source: 'detikhealth'
    }
  ];

  console.log('Testing RSS deduplication...\n');

  const allItems = [];

  for (const feed of rssFeeds) {
    try {
      console.log(`Testing: ${feed.url}`);
      const response = await fetch(feed.url, {
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
        const items = parseRSSItems(text, feed.source);
        console.log(`📰 Found ${items.length} items from ${feed.source}`);
        
        items.forEach((item, index) => {
          console.log(`  Item ${index + 1}:`);
          console.log(`    Title: ${item.title.substring(0, 50)}...`);
          console.log(`    Source: ${item.source}`);
          console.log(`    Image URL: ${item.imageUrl ? 'Available' : 'No image'}`);
        });
        
        allItems.push(...items);
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('=== DEDUPLICATION TEST ===');
  console.log(`Total items before deduplication: ${allItems.length}`);
  
  const uniqueItems = removeDuplicates(allItems);
  console.log(`Total items after deduplication: ${uniqueItems.length}`);
  
  if (allItems.length !== uniqueItems.length) {
    console.log(`✅ Removed ${allItems.length - uniqueItems.length} duplicate items`);
  } else {
    console.log('ℹ️  No duplicates found');
  }

  console.log('\n=== FINAL UNIQUE ITEMS ===');
  uniqueItems.forEach((item, index) => {
    console.log(`${index + 1}. [${item.source}] ${item.title.substring(0, 60)}...`);
  });
}

function parseRSSItems(xmlText, source) {
  try {
    const items = [];
    
    // Extract items from XML
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    let index = 0;
    
    while ((match = itemRegex.exec(xmlText)) !== null && index < 12) {
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
      
      // Get source config
      const config = getSourceConfig(source);
      
      items.push({
        id: `${source}-${Date.now()}-${index}`,
        title,
        description: description.substring(0, 100) + '...',
        imageUrl,
        image: config.icons[0],
        color: config.color,
        bgColor: config.bgColor,
        category: config.category,
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

function getSourceConfig(source) {
  switch (source.toLowerCase()) {
    case 'detikhealth':
      return {
        color: '#E53E3E',
        bgColor: '#FEF2F2',
        category: 'Health',
        icons: ['heart-pulse', 'hospital-building', 'medical-bag', 'pill']
      };
    case 'antaranews':
      return {
        color: '#3182CE',
        bgColor: '#EBF8FF',
        category: 'News',
        icons: ['newspaper', 'heart-pulse', 'brain', 'account-heart']
      };
    case 'tempo':
      return {
        color: '#38A169',
        bgColor: '#F0FDF4',
        category: 'Health',
        icons: ['clock', 'heart-pulse', 'hospital-building', 'medical-bag']
      };
    default:
      return {
        color: '#9F7AEA',
        bgColor: '#FAF5FF',
        category: 'Health',
        icons: ['heart-pulse', 'brain', 'account-heart', 'dumbbell']
      };
  }
}

function removeDuplicates(items) {
  const seen = new Set();
  return items.filter(item => {
    // Create a unique key based on title (more reliable than description)
    const titleKey = item.title.toLowerCase().trim();
    if (seen.has(titleKey)) {
      return false;
    }
    seen.add(titleKey);
    return true;
  });
}

testRSSDeduplication().catch(console.error);
