export interface RSSItem {
  id: string;
  title: string;
  description: string;
  readTime: string;
  image: string; // Keep as icon name for fallback
  imageUrl?: string; // Add actual image URL from RSS feed
  color: string;
  bgColor: string;
  category: string;
  link?: string;
  pubDate?: string;
  source: string;
}

class RSSService {
  private static instance: RSSService;
  private cache: Map<string, { data: RSSItem[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static getInstance(): RSSService {
    if (!RSSService.instance) {
      RSSService.instance = new RSSService();
    }
    return RSSService.instance;
  }

  private async fetchRSSFeed(url: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'PHC-Mobile-App/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      return xmlText;
    } catch (error) {
      throw error;
    }
  }

  private parseRSSItems(xmlText: string, source: string): RSSItem[] {
    try {
      // Simple XML parsing using regex (for React Native compatibility)
      const items: RSSItem[] = [];
      
      // Extract items from XML
      const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
      let match;
      let index = 0;
      
      while ((match = itemRegex.exec(xmlText)) !== null && index < 12) {
        const itemContent = match[1];
        
        // Extract title and clean it
        const titleMatch = itemContent.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>([^<]+)<\/title>/i);
        let title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : 'Untitled';
        title = title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        
        // Extract description and clean it
        const descMatch = itemContent.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>([^<]+)<\/description>/i);
        let description = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '';
        
        // Extract image URL from description or media:content
        let imageUrl: string | undefined;
        
        // Try to extract from media:content first (more reliable)
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
        
        // Clean description (remove HTML tags and trim)
        description = description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        description = description.length > 150 ? description.substring(0, 150) + '...' : description;
        
        // Extract link
        const linkMatch = itemContent.match(/<link[^>]*>([^<]+)<\/link>/i);
        const link = linkMatch ? linkMatch[1].trim() : '';
        
        // Extract and format pubDate
        const pubDateMatch = itemContent.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/i);
        let pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
        
        // Try to format the date properly
        if (pubDate) {
          try {
            const date = new Date(pubDate);
            if (!isNaN(date.getTime())) {
              pubDate = date.toISOString();
            }
          } catch (error) {
            // Date parsing error - ignore
          }
        }
        
        // Generate read time based on content length
        const readTime = `${Math.floor(description.length / 200) + 3} min read`;
        
        // Assign colors and category based on source
        const getSourceConfig = (source: string) => {
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
        };
        
        const config = getSourceConfig(source);
        
        // Assign icon based on content keywords or random from source-specific icons
        let icon = config.icons[Math.floor(Math.random() * config.icons.length)];
        
        // Smart icon assignment based on title/description keywords
        const titleLower = title.toLowerCase();
        const descLower = description.toLowerCase();
        
        if (titleLower.includes('heart') || titleLower.includes('jantung') || descLower.includes('kardio')) {
          icon = 'heart-pulse';
        } else if (titleLower.includes('brain') || titleLower.includes('otak') || titleLower.includes('mental')) {
          icon = 'brain';
        } else if (titleLower.includes('food') || titleLower.includes('nutrition') || titleLower.includes('nutrisi') || titleLower.includes('makanan')) {
          icon = 'food-apple';
        } else if (titleLower.includes('exercise') || titleLower.includes('fitness') || titleLower.includes('olahraga')) {
          icon = 'dumbbell';
        } else if (titleLower.includes('sleep') || titleLower.includes('tidur')) {
          icon = 'sleep';
        } else if (titleLower.includes('hospital') || titleLower.includes('doctor') || titleLower.includes('dokter')) {
          icon = 'hospital-building';
        }
        
        items.push({
          id: `${source}-${Date.now()}-${index}`,
          title,
          description,
          readTime,
          image: icon,
          imageUrl,
          color: config.color,
          bgColor: config.bgColor,
          category: config.category,
          link,
          pubDate,
          source
        });
        
        index++;
      }
      
      return items;
    } catch (error) {
      throw error;
    }
  }

  private extractImageFromDescription(description: string): string | null {
    const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
    return imgMatch ? imgMatch[1] : null;
  }

  async getHealthNews(): Promise<RSSItem[]> {
    try {
      // Check cache first
      const cached = this.cache.get('health-news');
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      const allItems: RSSItem[] = [];

      // Use a single reliable RSS source with better content filtering
      const rssFeeds = [
        {
          url: 'https://health.detik.com/rss',
          source: 'detikhealth'
        }
      ];

      for (const feed of rssFeeds) {
        try {
          const xmlText = await this.fetchRSSFeed(feed.url);
          
          // If xmlText is empty, continue to next feed
          if (!xmlText || xmlText.trim().length === 0) {
            continue;
          }
        
          const items = this.parseRSSItems(xmlText, feed.source);
          allItems.push(...items);
        } catch (error) {
          console.log(`Failed to fetch from ${feed.url}:`, error instanceof Error ? error.message : 'Unknown error');
          // Continue with other feeds if one fails
        }
      }

      if (allItems.length === 0) {
        // Return fallback data if no RSS items fetched
        return this.getFallbackData();
      }

      // Remove duplicates based on title and description
      const uniqueItems = this.removeDuplicates(allItems);

      // Shuffle and limit to 6 items
      const shuffled = uniqueItems.sort(() => Math.random() - 0.5).slice(0, 6);
      
      // Cache the results
      this.cache.set('health-news', { data: shuffled, timestamp: Date.now() });
      
      return shuffled;
    } catch (error) {
      // Return fallback data on error
      return this.getFallbackData();
    }
  }

  private removeDuplicates(items: RSSItem[]): RSSItem[] {
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

  private getFallbackData(): RSSItem[] {
    return [
      {
        id: "1",
        title: "Pentingnya Vaksinasi COVID-19 untuk Kesehatan Masyarakat",
        description: "Vaksinasi COVID-19 menjadi langkah penting dalam melindungi kesehatan masyarakat dan mengendalikan pandemi...",
        readTime: "5 min read",
        image: "heart-pulse",
        imageUrl: "https://akcdn.detik.net.id/community/media/visual/2021/01/13/vaksinasi-covid-19_169.jpeg",
        color: "#E53E3E",
        bgColor: "#FEF2F2",
        category: "Health",
        source: "detikhealth"
      },
      {
        id: "2",
        title: "Tips Menjaga Kesehatan Mental di Era Digital",
        description: "Di era digital yang serba cepat, menjaga kesehatan mental menjadi tantangan tersendiri...",
        readTime: "4 min read",
        image: "brain",
        imageUrl: "https://akcdn.detik.net.id/community/media/visual/2021/06/15/kesehatan-mental_169.jpeg",
        color: "#3182CE",
        bgColor: "#EBF8FF",
        category: "Mental Health",
        source: "kompas"
      },
      {
        id: "3",
        title: "Nutrisi Seimbang untuk Daya Tahan Tubuh Optimal",
        description: "Mengonsumsi nutrisi seimbang sangat penting untuk menjaga daya tahan tubuh...",
        readTime: "6 min read",
        image: "food-apple",
        imageUrl: "https://akcdn.detik.net.id/community/media/visual/2021/03/10/nutrisi-seimbang_169.jpeg",
        color: "#38A169",
        bgColor: "#F0FDF4",
        category: "Nutrition",
        source: "cnn"
      },
      {
        id: "4",
        title: "Olahraga Rutin: Kunci Hidup Sehat dan Panjang Umur",
        description: "Olahraga rutin terbukti memberikan berbagai manfaat kesehatan...",
        readTime: "7 min read",
        image: "run",
        imageUrl: "https://akcdn.detik.net.id/community/media/visual/2021/02/20/olahraga-rutin_169.jpeg",
        color: "#D69E2E",
        bgColor: "#FFFAF0",
        category: "Fitness",
        source: "detikhealth"
      },
      {
        id: "5",
        title: "Kualitas Tidur dan Dampaknya pada Kesehatan",
        description: "Tidur yang berkualitas sangat penting untuk kesehatan fisik dan mental...",
        readTime: "5 min read",
        image: "sleep",
        imageUrl: "https://akcdn.detik.net.id/community/media/visual/2021/04/15/kualitas-tidur_169.jpeg",
        color: "#9F7AEA",
        bgColor: "#FAF5FF",
        category: "Health",
        source: "kompas"
      },
      {
        id: "6",
        title: "Pencegahan Penyakit Jantung dengan Gaya Hidup Sehat",
        description: "Penyakit jantung masih menjadi penyebab kematian tertinggi di dunia...",
        readTime: "8 min read",
        image: "heart-pulse",
        imageUrl: "https://akcdn.detik.net.id/community/media/visual/2021/05/10/pencegahan-jantung_169.jpeg",
        color: "#ED64A6",
        bgColor: "#FDF2F8",
        category: "Cardiology",
        source: "cnn"
      }
    ];
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Force refresh by clearing cache and returning fresh data
  async refreshHealthNews(): Promise<RSSItem[]> {
    this.clearCache();
    return this.getHealthNews();
  }
}

export default RSSService.getInstance(); 