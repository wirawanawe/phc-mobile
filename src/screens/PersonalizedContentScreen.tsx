import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { safeGoBack } from "../utils/safeNavigation";

const { width } = Dimensions.get("window");

const PersonalizedContentScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();

  const contentCategories = [
    {
      id: "1",
      title: "Nutrition",
      icon: "food-apple",
      color: "#10B981",
      count: 12,
    },
    {
      id: "2",
      title: "Fitness",
      icon: "dumbbell",
      color: "#3B82F6",
      count: 8,
    },
    {
      id: "3",
      title: "Mental Health",
      icon: "brain",
      color: "#8B5CF6",
      count: 15,
    },
    {
      id: "4",
      title: "Wellness",
      icon: "heart-pulse",
      color: "#F59E0B",
      count: 10,
    },
  ];

  const featuredArticles = [
    {
      id: "1",
      title: "Lifestyle Changes To Adopt For Strength",
      category: "Fitness",
      readTime: "5 min read",
      image: "dumbbell",
      color: "#3B82F6",
      description:
        "Discover simple yet effective lifestyle changes that can significantly improve your physical strength and overall fitness.",
    },
    {
      id: "2",
      title: "7 Easy Meals You Can Rustle Up At Home For A Healthy Gut",
      category: "Nutrition",
      readTime: "8 min read",
      image: "food-apple",
      color: "#10B981",
      description:
        "Learn how to prepare nutritious meals that support your digestive health and boost your energy levels.",
    },
    {
      id: "3",
      title: "Mindfulness Techniques for Daily Stress Relief",
      category: "Mental Health",
      readTime: "6 min read",
      image: "meditation",
      color: "#8B5CF6",
      description:
        "Explore practical mindfulness techniques that can help you manage daily stress and improve mental clarity.",
    },
    {
      id: "4",
      title: "The Complete Guide to Better Sleep Habits",
      category: "Wellness",
      readTime: "7 min read",
      image: "sleep",
      color: "#F59E0B",
      description:
        "Master the art of quality sleep with these proven strategies for better rest and recovery.",
    },
  ];

  const recentArticles = [
    {
      id: "5",
      title: "Hydration: The Key to Optimal Performance",
      category: "Nutrition",
      readTime: "4 min read",
      image: "water",
      color: "#06B6D4",
    },
    {
      id: "6",
      title: "Building a Sustainable Exercise Routine",
      category: "Fitness",
      readTime: "6 min read",
      image: "run",
      color: "#3B82F6",
    },
    {
      id: "7",
      title: "Emotional Intelligence in Daily Life",
      category: "Mental Health",
      readTime: "5 min read",
      image: "emoticon",
      color: "#8B5CF6",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      {/* <View style={styles.header}>
        <Icon
          name="arrow-left"
          size={24}
          color="#1F2937"
          onPress={() => safeGoBack(navigation, 'Main')}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Personalized Content</Text>
        <Icon name="magnify" size={24} color="#1F2937" />
      </View> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {contentCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() =>
                  navigation.navigate("CategoryDetail", { category })
                }
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color + "20" },
                  ]}
                >
                  <Icon name={category.icon} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryCount}>
                  {category.count} articles
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Articles */}
        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Featured Articles</Text>
          {featuredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => navigation.navigate("ArticleDetail", { article })}
            >
              <View style={styles.articleContent}>
                <View style={styles.articleHeader}>
                  <View
                    style={[
                      styles.articleIcon,
                      { backgroundColor: article.color + "20" },
                    ]}
                  >
                    <Icon
                      name={article.image}
                      size={24}
                      color={article.color}
                    />
                  </View>
                  <View style={styles.articleInfo}>
                    <Text style={styles.articleCategory}>
                      {article.category}
                    </Text>
                    <Text style={styles.articleReadTime}>
                      {article.readTime}
                    </Text>
                  </View>
                </View>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleDescription}>
                  {article.description}
                </Text>
                <View style={styles.articleFooter}>
                  <Icon name="bookmark-outline" size={20} color="#64748B" />
                  <Icon
                    name="share-variant-outline"
                    size={20}
                    color="#64748B"
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Articles */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Articles</Text>
          {recentArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.recentArticleCard}
              onPress={() => navigation.navigate("ArticleDetail", { article })}
            >
              <View
                style={[
                  styles.recentArticleIcon,
                  { backgroundColor: article.color + "20" },
                ]}
              >
                <Icon name={article.image} size={20} color={article.color} />
              </View>
              <View style={styles.recentArticleContent}>
                <Text style={styles.recentArticleTitle}>{article.title}</Text>
                <View style={styles.recentArticleMeta}>
                  <Text style={styles.recentArticleCategory}>
                    {article.category}
                  </Text>
                  <Text style={styles.recentArticleReadTime}>
                    {article.readTime}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>
          ))}
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
              Get personalized health tips and articles delivered to your inbox
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
  contentContainer: {
    paddingBottom: 30,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "center",
  },
  categoryCount: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  featuredContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  articleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    minHeight: 140, // Ensure minimum height for content
  },
  articleContent: {
    flex: 1,
  },
  articleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  articleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleCategory: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
    marginBottom: 2,
  },
  articleReadTime: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
    letterSpacing: -0.3,
    flexShrink: 1, // Allow text to shrink if needed
  },
  articleDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: "500",
    flexShrink: 1, // Allow text to shrink if needed
  },
  articleFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recentArticleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    minHeight: 80, // Ensure minimum height for content
  },
  recentArticleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentArticleContent: {
    flex: 1,
  },
  recentArticleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 20,
    flexShrink: 1, // Allow text to shrink if needed
  },
  recentArticleMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentArticleCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366F1",
    marginRight: 8,
  },
  recentArticleReadTime: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  newsletterContainer: {
    paddingHorizontal: 20,
  },
  newsletterCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  newsletterTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  newsletterDescription: {
    fontSize: 14,
    color: "#E0E7FF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: "500",
  },
  newsletterButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  newsletterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
});

export default PersonalizedContentScreen;
