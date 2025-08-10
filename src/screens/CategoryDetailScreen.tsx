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

const CategoryDetailScreen = ({ navigation, route }: any) => {
  const { category } = route.params;

  // Mock articles for the category
  const categoryArticles = [
    {
      id: "1",
      title: "Understanding Macronutrients: Proteins, Carbs, and Fats",
      description:
        "Learn about the three main macronutrients and how they fuel your body for optimal health and performance.",
      readTime: "5 min read",
      image: "food-apple",
      color: "#10B981",
      date: "2 hours ago",
    },
    {
      id: "2",
      title: "The Complete Guide to Meal Planning",
      description:
        "Master the art of meal planning to save time, money, and ensure you're eating nutritious meals throughout the week.",
      readTime: "8 min read",
      image: "calendar-check",
      color: "#10B981",
      date: "1 day ago",
    },
    {
      id: "3",
      title: "Superfoods: What They Are and Why You Need Them",
      description:
        "Discover the most nutrient-dense foods on the planet and how to incorporate them into your daily diet.",
      readTime: "6 min read",
      image: "star",
      color: "#10B981",
      date: "3 days ago",
    },
    {
      id: "4",
      title: "Hydration: The Key to Optimal Health",
      description:
        "Learn why proper hydration is crucial for your health and how much water you should really be drinking.",
      readTime: "4 min read",
      image: "water",
      color: "#10B981",
      date: "1 week ago",
    },
    {
      id: "5",
      title: "Mindful Eating: Transform Your Relationship with Food",
      description:
        "Develop a healthier relationship with food through mindful eating practices and techniques.",
      readTime: "7 min read",
      image: "meditation",
      color: "#10B981",
      date: "1 week ago",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.title}</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share-variant-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View> */}

      {/* Category Banner */}
      <LinearGradient
        colors={[category.color + "20", category.color + "10"]}
        style={styles.categoryBanner}
      >
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: category.color + "30" },
          ]}
        >
          <Icon name={category.icon} size={32} color={category.color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryCount}>
            {categoryArticles.length} articles available
          </Text>
        </View>
      </LinearGradient>

      {/* Articles List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {categoryArticles.map((article) => (
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
                  <Icon name={article.image} size={24} color={article.color} />
                </View>
                <View style={styles.articleInfo}>
                  <Text style={styles.articleReadTime}>{article.readTime}</Text>
                  <Text style={styles.articleDate}>{article.date}</Text>
                </View>
              </View>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleDescription}>
                {article.description}
              </Text>
              <View style={styles.articleFooter}>
                <View style={styles.articleActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon name="bookmark-outline" size={20} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon
                      name="share-variant-outline"
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>Read More</Text>
                  <Icon name="chevron-right" size={16} color={category.color} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  shareButton: {
    padding: 5,
  },
  categoryBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  categoryCount: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  },
  articleContent: {
    flex: 1,
  },
  articleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  articleReadTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  articleDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  articleDescription: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 16,
  },
  articleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  articleActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginRight: 4,
  },
});

export default CategoryDetailScreen;
