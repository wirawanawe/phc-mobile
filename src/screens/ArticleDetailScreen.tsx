import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ArticleDetailScreen = ({ navigation, route }: any) => {
  const { article } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="bookmark-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share-variant-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <View
            style={[
              styles.articleIcon,
              { backgroundColor: article.color + "20" },
            ]}
          >
            <Icon name={article.image} size={32} color={article.color} />
          </View>
          <Text style={styles.articleCategory}>{article.category}</Text>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <View style={styles.articleMeta}>
            <View style={styles.metaItem}>
              <Icon name="clock-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{article.readTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="calendar-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>Published today</Text>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          <Text style={styles.contentParagraph}>{article.description}</Text>

          <Text style={styles.contentParagraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </Text>

          <Text style={styles.contentParagraph}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </Text>

          <Text style={styles.sectionTitle}>Key Takeaways</Text>
          <View style={styles.takeawaysList}>
            <View style={styles.takeawayItem}>
              <Icon name="check-circle" size={20} color="#10B981" />
              <Text style={styles.takeawayText}>
                Understanding the basics of nutrition is crucial for overall
                health
              </Text>
            </View>
            <View style={styles.takeawayItem}>
              <Icon name="check-circle" size={20} color="#10B981" />
              <Text style={styles.takeawayText}>
                Balanced meals provide sustained energy throughout the day
              </Text>
            </View>
            <View style={styles.takeawayItem}>
              <Icon name="check-circle" size={20} color="#10B981" />
              <Text style={styles.takeawayText}>
                Mindful eating practices can improve your relationship with food
              </Text>
            </View>
          </View>

          <Text style={styles.contentParagraph}>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </Text>
        </View>

        {/* Related Articles */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Articles</Text>
          <View style={styles.relatedArticles}>
            <TouchableOpacity style={styles.relatedArticle}>
              <View
                style={[
                  styles.relatedIcon,
                  { backgroundColor: "#3B82F6" + "20" },
                ]}
              >
                <Icon name="heart-pulse" size={20} color="#3B82F6" />
              </View>
              <View style={styles.relatedContent}>
                <Text style={styles.relatedTitle}>
                  The Benefits of Regular Exercise
                </Text>
                <Text style={styles.relatedReadTime}>4 min read</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.relatedArticle}>
              <View
                style={[
                  styles.relatedIcon,
                  { backgroundColor: "#8B5CF6" + "20" },
                ]}
              >
                <Icon name="meditation" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.relatedContent}>
                <Text style={styles.relatedTitle}>
                  Stress Management Techniques
                </Text>
                <Text style={styles.relatedReadTime}>6 min read</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Newsletter Signup */}
        <View style={styles.newsletterContainer}>
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            style={styles.newsletterCard}
          >
            <Icon name="email-outline" size={32} color="#FFFFFF" />
            <Text style={styles.newsletterTitle}>Stay Updated</Text>
            <Text style={styles.newsletterDescription}>
              Get more health tips and articles like this delivered to your
              inbox
            </Text>
            <TouchableOpacity style={styles.newsletterButton}>
              <Text style={styles.newsletterButtonText}>Subscribe</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: 5,
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  articleHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  articleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  articleCategory: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  articleMeta: {
    flexDirection: "row",
    justifyContent: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  metaText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  articleContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contentParagraph: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 26,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  takeawaysList: {
    marginBottom: 20,
  },
  takeawayItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  takeawayText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginLeft: 12,
    flex: 1,
  },
  relatedSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  relatedArticles: {
    gap: 12,
  },
  relatedArticle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  relatedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  relatedContent: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  relatedReadTime: {
    fontSize: 13,
    color: "#64748B",
  },
  newsletterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  newsletterCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  newsletterTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 8,
  },
  newsletterDescription: {
    fontSize: 15,
    color: "#E0E7FF",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  newsletterButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  newsletterButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366F1",
  },
});

export default ArticleDetailScreen;
