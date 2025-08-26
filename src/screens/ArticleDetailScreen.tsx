import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
  Share,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { CustomTheme } from '../theme/theme';
import { safeGoBack } from "../utils/safeNavigation";

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
}

interface ArticleDetailScreenProps {
  navigation: any;
  route: {
    params: {
      article: RSSItem;
    };
  };
}

const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({ navigation, route }) => {
  const theme = useTheme<CustomTheme>();
  const { article } = route.params;
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Today';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Today';
    }
  };

  const handleReadFullArticle = async () => {
    if (article.link) {
      try {
        const supported = await Linking.canOpenURL(article.link);
        if (supported) {
          await Linking.openURL(article.link);
        } else {
          Alert.alert('Error', 'Cannot open this link');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open article link');
      }
    } else {
      Alert.alert('Info', 'Full article link not available');
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${article.title}\n\n${article.description}\n\nRead more: ${article.link || 'PHC Health App'}`,
        title: article.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share article');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality with AsyncStorage or API
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => safeGoBack(navigation, 'Main')}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBookmark}
          >
            <Icon 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isBookmarked ? "#E53E3E" : "#64748B"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Icon name="share-variant" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Article Header */}
        <View style={styles.articleHeader}>
          {/* Source Badge */}
          <View style={[styles.sourceBadge, { backgroundColor: article.color }]}>
            <Icon name={getSourceIcon(article.source)} size={16} color="#FFFFFF" />
            <Text style={styles.sourceBadgeText}>{article.source}</Text>
          </View>

          {/* Category Tag */}
          <View style={[styles.categoryTag, { backgroundColor: article.bgColor }]}>
            <Text style={[styles.categoryText, { color: article.color }]}>
              {article.category}
            </Text>
          </View>
        </View>

        {/* Article Image/Icon */}
        <View style={styles.imageSection}>
          {article.imageUrl ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: article.imageUrl }}
                style={styles.articleDetailImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <LinearGradient
              colors={[article.bgColor, article.color + '20']}
              style={styles.imageContainer}
            >
              <Icon name={article.image} size={80} color={article.color} />
            </LinearGradient>
          )}
        </View>

        {/* Article Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Meta Information */}
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Icon name="calendar-clock" size={16} color="#64748B" />
              <Text style={styles.metaText}>{formatDate(article.pubDate)}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Icon name="clock-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{article.readTime}</Text>
            </View>
          </View>

          {/* Article Description/Summary */}
          <Text style={styles.description}>{article.description}</Text>

          {/* Health Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Health Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Konsultasikan dengan dokter sebelum mengubah pola hidup</Text>
              <Text style={styles.tipItem}>• Terapkan tips kesehatan secara bertahap</Text>
              <Text style={styles.tipItem}>• Pantau perkembangan kesehatan Anda secara rutin</Text>
            </View>
          </View>

          {/* Read Full Article Button */}
          <TouchableOpacity
            style={[styles.readFullButton, { backgroundColor: article.color }]}
            onPress={handleReadFullArticle}
          >
            <LinearGradient
              colors={[article.color, article.color + 'CC']}
              style={styles.readFullGradient}
            >
              <Icon name="open-in-new" size={20} color="#FFFFFF" />
              <Text style={styles.readFullText}>Baca Artikel Lengkap</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Related Actions */}
          <View style={styles.relatedActions}>
            <TouchableOpacity style={styles.relatedActionButton}>
              <View style={[styles.relatedActionIcon, { backgroundColor: '#FEF2F2' }]}>
                <Icon name="heart-pulse" size={20} color="#E53E3E" />
              </View>
              <Text style={styles.relatedActionText}>Health Tracking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.relatedActionButton}>
              <View style={[styles.relatedActionIcon, { backgroundColor: '#EBF8FF' }]}>
                <Icon name="calculator" size={20} color="#3182CE" />
              </View>
              <Text style={styles.relatedActionText}>Health Calculator</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.relatedActionButton}>
              <View style={[styles.relatedActionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Icon name="hospital-building" size={20} color="#38A169" />
              </View>
              <Text style={styles.relatedActionText}>Book Clinic</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sourceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  articleDetailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 30,
    fontWeight: '500',
  },
  tipsSection: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '500',
  },
  readFullButton: {
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  readFullGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  readFullText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  relatedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  relatedActionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  relatedActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  relatedActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});

export default ArticleDetailScreen;
