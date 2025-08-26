import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface RSSItem {
  id: string;
  title: string;
  description: string;
  readTime: string;
  image: string;
  color: string;
  bgColor: string;
  category: string;
  link?: string;
  pubDate?: string;
  source: string;
  imageUrl?: string; // Added imageUrl to the interface
}

interface FeaturedArticleCardProps {
  article: RSSItem;
  onPress: () => void;
}

const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({ article, onPress }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Today';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday'; 
      if (diffDays <= 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return 'Today';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'detikhealth': return 'newspaper-variant';
      case 'kompas': return 'newspaper';
      case 'cnn': return 'television-guide';
      default: return 'web';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FAFBFC']}
        style={styles.card}
      >
        {/* Header with Image and Source Badge */}
        <View style={styles.header}>
          <View style={[styles.imageContainer, { backgroundColor: article.bgColor }]}>
            {article.imageUrl ? (
              <Image
                source={{ uri: article.imageUrl }}
                style={styles.articleImage}
                resizeMode="cover"
              />
            ) : (
              <Icon name={article.image} size={32} color={article.color} />
            )}
          </View>
          <View style={[styles.sourceBadge, { backgroundColor: article.color }]}>
            <Icon name={getSourceIcon(article.source)} size={12} color="#FFFFFF" />
            <Text style={styles.sourceText}>{article.source}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={3}>
              {article.title}
            </Text>
            
            <Text style={styles.description} numberOfLines={3}>
              {article.description}
            </Text>
          </View>

          {/* Footer with Date and Read Time */}
          <View style={styles.footer}>
            <View style={styles.dateContainer}>
              <Icon name="calendar-clock" size={14} color="#64748B" />
              <Text style={styles.dateText}>{formatDate(article.pubDate)}</Text>
            </View>
            
            <View style={styles.readTimeContainer}>
              <Icon name="clock-outline" size={14} color="#64748B" />
              <Text style={styles.readTimeText}>{article.readTime}</Text>
            </View>
          </View>

          {/* Category Tag */}
          <View style={[styles.categoryTag, { backgroundColor: article.bgColor }]}>
            <Text style={[styles.categoryText, { color: article.color }]}>
              {article.category}
            </Text>
          </View>
        </View>

        {/* Gradient Overlay for Visual Enhancement */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.02)']}
          style={styles.gradientOverlay}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.75,
    height: 320, // Increased height to prevent content cutoff
    marginRight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    height: '100%', // Take full height of container
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    flex: 1, // Take remaining space
    justifyContent: 'space-between', // Distribute content evenly
  },
  textContent: {
    flex: 1, // Take available space for text
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTimeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export default FeaturedArticleCard; 