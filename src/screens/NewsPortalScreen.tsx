import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  Searchbar,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomTheme } from "../theme/theme";

const NewsPortalScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All News" },
    { id: "research", label: "Research" },
    { id: "nutrition", label: "Nutrition" },
    { id: "fitness", label: "Fitness" },
    { id: "mental", label: "Mental Health" },
    { id: "workplace", label: "Workplace Health" },
    { id: "prevention", label: "Prevention" },
  ];

  const newsArticles = [
    {
      id: "1",
      title:
        "New Study Shows 25% Improvement in Employee Productivity with Wellness Programs",
      summary:
        "Recent research from Harvard Business Review reveals that companies with comprehensive wellness programs see significant improvements in employee productivity, engagement, and overall health outcomes.",
      content:
        "A groundbreaking study published in the Harvard Business Review has found that organizations implementing comprehensive wellness programs experience a 25% improvement in employee productivity. The research, conducted over a two-year period across 500 companies, also showed reduced absenteeism and improved employee satisfaction scores.",
      category: "research",
      source: "Harvard Business Review",
      date: "2024-01-15",
      readTime: 8,
      imageUrl: "📊",
      tags: ["Research", "Productivity", "Wellness Programs"],
      featured: true,
    },
    {
      id: "2",
      title:
        "The Impact of Nutrition on Workplace Performance: A Complete Guide",
      summary:
        "Learn how proper nutrition can significantly enhance your work performance, energy levels, and cognitive function throughout the day.",
      content:
        "Proper nutrition plays a crucial role in workplace performance. Studies have shown that employees who maintain healthy eating habits experience better concentration, increased energy levels, and improved decision-making abilities. This comprehensive guide explores the connection between diet and work performance.",
      category: "nutrition",
      source: "Health & Wellness Journal",
      date: "2024-01-14",
      readTime: 12,
      imageUrl: "🥗",
      tags: ["Nutrition", "Performance", "Energy"],
      featured: false,
    },
    {
      id: "3",
      title: "Mental Health Awareness: Breaking the Stigma in the Workplace",
      summary:
        "Understanding the importance of mental health support in professional environments and how organizations can create supportive cultures.",
      content:
        "Mental health awareness in the workplace is more important than ever. With increasing stress levels and work-related pressures, organizations must prioritize mental health support and create environments where employees feel safe to discuss their mental health concerns.",
      category: "mental",
      source: "Psychology Today",
      date: "2024-01-13",
      readTime: 10,
      imageUrl: "🧠",
      tags: ["Mental Health", "Awareness", "Workplace"],
      featured: false,
    },
    {
      id: "4",
      title: "Office Ergonomics: Preventing Common Workplace Injuries",
      summary:
        "Essential tips for setting up an ergonomic workspace to prevent back pain, eye strain, and other common office-related health issues.",
      content:
        "Proper office ergonomics can prevent many common workplace injuries and health issues. From correct chair positioning to monitor placement, small adjustments can make a significant difference in preventing long-term health problems.",
      category: "prevention",
      source: "Occupational Health & Safety",
      date: "2024-01-12",
      readTime: 6,
      imageUrl: "🪑",
      tags: ["Ergonomics", "Prevention", "Workplace Safety"],
      featured: false,
    },
    {
      id: "5",
      title:
        "The Rise of Remote Work: Maintaining Health and Wellness from Home",
      summary:
        "How to stay healthy and maintain work-life balance while working remotely, including exercise routines and mental health strategies.",
      content:
        "Remote work has become the new normal for many professionals, but it comes with unique health challenges. This article provides practical strategies for maintaining physical and mental health while working from home.",
      category: "workplace",
      source: "Remote Work Magazine",
      date: "2024-01-11",
      readTime: 15,
      imageUrl: "🏠",
      tags: ["Remote Work", "Wellness", "Work-Life Balance"],
      featured: false,
    },
    {
      id: "6",
      title:
        "High-Intensity Interval Training: The Perfect Workout for Busy Professionals",
      summary:
        "Discover how HIIT workouts can fit into your busy schedule and provide maximum health benefits in minimal time.",
      content:
        "High-Intensity Interval Training (HIIT) offers busy professionals an efficient way to stay fit. These short, intense workouts can be completed in as little as 20 minutes and provide cardiovascular and strength benefits.",
      category: "fitness",
      source: "Fitness & Health Magazine",
      date: "2024-01-10",
      readTime: 7,
      imageUrl: "💪",
      tags: ["HIIT", "Fitness", "Time Management"],
      featured: false,
    },
  ];

  const filteredArticles = newsArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = newsArticles.find((article) => article.featured);
  const regularArticles = filteredArticles.filter(
    (article) => !article.featured
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "research":
        return theme.customColors.lightGreen;
      case "nutrition":
        return theme.customColors.lightRed;
      case "fitness":
        return theme.customColors.lightGreen;
      case "mental":
        return theme.customColors.lightRed;
      case "workplace":
        return theme.customColors.lightGreen;
      case "prevention":
        return theme.customColors.lightRed;
      default:
        return theme.customColors.lightGreen;
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category) {
      case "research":
        return theme.customColors.darkGreen;
      case "nutrition":
        return theme.customColors.darkRed;
      case "fitness":
        return theme.customColors.darkGreen;
      case "mental":
        return theme.customColors.darkRed;
      case "workplace":
        return theme.customColors.darkGreen;
      case "prevention":
        return theme.customColors.darkRed;
      default:
        return theme.customColors.darkGreen;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search health news..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.primary}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            News Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  selected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedCategory === category.id
                          ? theme.colors.primary
                          : theme.customColors.lightGreen,
                    },
                  ]}
                  textStyle={[
                    styles.chipText,
                    {
                      color:
                        selectedCategory === category.id
                          ? theme.colors.onPrimary
                          : theme.customColors.darkGreen,
                    },
                  ]}
                >
                  {category.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Article */}
        {featuredArticle && (
          <View style={styles.featuredContainer}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              Featured Article
            </Text>
            <Card
              style={[
                styles.featuredCard,
                { backgroundColor: theme.customColors.lightGreen },
              ]}
            >
              <Card.Content>
                <View style={styles.featuredHeader}>
                  <Text style={styles.featuredIcon}>
                    {featuredArticle.imageUrl}
                  </Text>
                  <View style={styles.featuredInfo}>
                    <Text
                      style={[
                        styles.featuredTitle,
                        { color: theme.customColors.darkGreen },
                      ]}
                    >
                      {featuredArticle.title}
                    </Text>
                    <Text
                      style={[
                        styles.featuredSummary,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {featuredArticle.summary}
                    </Text>
                  </View>
                </View>

                <View style={styles.articleMeta}>
                  <View style={styles.metaRow}>
                    <Text
                      style={[
                        styles.metaLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      📰 Source:
                    </Text>
                    <Text
                      style={[
                        styles.metaValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {featuredArticle.source}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text
                      style={[
                        styles.metaLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      📅 Date:
                    </Text>
                    <Text
                      style={[
                        styles.metaValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {featuredArticle.date}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text
                      style={[
                        styles.metaLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      ⏱️ Read Time:
                    </Text>
                    <Text
                      style={[
                        styles.metaValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {featuredArticle.readTime} min
                    </Text>
                  </View>
                </View>

                <View style={styles.tagsContainer}>
                  {featuredArticle.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      compact
                      style={[
                        styles.tagChip,
                        { backgroundColor: theme.customColors.lightRed },
                      ]}
                      textStyle={[
                        styles.tagText,
                        { color: theme.customColors.darkRed },
                      ]}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>

                <Button
                  mode="contained"
                  onPress={() => {
                    /* Read full article */
                  }}
                  style={[
                    styles.readButton,
                    { backgroundColor: theme.customColors.darkGreen },
                  ]}
                  labelStyle={styles.readButtonLabel}
                >
                  Read Full Article
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Regular Articles */}
        <View style={styles.articlesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Latest News
          </Text>
          {regularArticles.map((article) => (
            <Card key={article.id} style={styles.articleCard}>
              <Card.Content>
                <View style={styles.articleHeader}>
                  <Text style={styles.articleIcon}>{article.imageUrl}</Text>
                  <View style={styles.articleInfo}>
                    <Text
                      style={[
                        styles.articleTitle,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {article.title}
                    </Text>
                    <Text
                      style={[
                        styles.articleSummary,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {article.summary}
                    </Text>
                  </View>
                </View>

                <View style={styles.articleMeta}>
                  <View style={styles.metaRow}>
                    <Text
                      style={[
                        styles.metaLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      📰 Source:
                    </Text>
                    <Text
                      style={[
                        styles.metaValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {article.source}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text
                      style={[
                        styles.metaLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      📅 Date:
                    </Text>
                    <Text
                      style={[
                        styles.metaValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {article.date}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text
                      style={[
                        styles.metaLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      ⏱️ Read Time:
                    </Text>
                    <Text
                      style={[
                        styles.metaValue,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {article.readTime} min
                    </Text>
                  </View>
                </View>

                <View style={styles.articleFooter}>
                  <View style={styles.tagsContainer}>
                    {article.tags.slice(0, 2).map((tag, index) => (
                      <Chip
                        key={index}
                        compact
                        style={[
                          styles.tagChip,
                          { backgroundColor: theme.customColors.lightRed },
                        ]}
                        textStyle={[
                          styles.tagText,
                          { color: theme.customColors.darkRed },
                        ]}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </View>

                  <Chip
                    compact
                    style={[
                      styles.categoryChip,
                      { backgroundColor: getCategoryColor(article.category) },
                    ]}
                    textStyle={[
                      styles.categoryText,
                      { color: getCategoryTextColor(article.category) },
                    ]}
                  >
                    {
                      categories.find((cat) => cat.id === article.category)
                        ?.label
                    }
                  </Chip>
                </View>

                <Button
                  mode="contained"
                  onPress={() => {
                    /* Read article */
                  }}
                  style={[
                    styles.readButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  labelStyle={styles.readButtonLabel}
                >
                  Read More
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Newsletter Signup */}
        <View style={styles.newsletterContainer}>
          <Card
            style={[
              styles.newsletterCard,
              { backgroundColor: theme.customColors.lightGreen },
            ]}
          >
            <Card.Content>
              <Text
                style={[
                  styles.newsletterTitle,
                  { color: theme.customColors.darkGreen },
                ]}
              >
                📧 Stay Updated
              </Text>
              <Text
                style={[
                  styles.newsletterDescription,
                  { color: theme.colors.onBackground },
                ]}
              >
                Subscribe to our health newsletter for the latest wellness
                insights and tips delivered to your inbox.
              </Text>
              <Button
                mode="contained"
                onPress={() => {
                  /* Subscribe */
                }}
                style={[
                  styles.subscribeButton,
                  { backgroundColor: theme.customColors.darkGreen },
                ]}
                labelStyle={styles.subscribeButtonLabel}
              >
                Subscribe to Newsletter
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    elevation: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: "row",
    paddingRight: 20,
  },
  chip: {
    marginRight: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  featuredContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  featuredCard: {
    elevation: 2,
  },
  featuredHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  featuredIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 24,
  },
  featuredSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  articleMeta: {
    marginBottom: 15,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "bold",
    width: 80,
  },
  metaValue: {
    fontSize: 12,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 10,
  },
  readButton: {
    borderRadius: 20,
  },
  readButtonLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  articlesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  articleCard: {
    marginBottom: 15,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  articleIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 22,
  },
  articleSummary: {
    fontSize: 14,
    lineHeight: 18,
  },
  articleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  categoryChip: {
    height: 24,
  },
  categoryText: {
    fontSize: 10,
  },
  newsletterContainer: {
    paddingHorizontal: 20,
  },
  newsletterCard: {
    elevation: 2,
  },
  newsletterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  newsletterDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  subscribeButton: {
    borderRadius: 20,
  },
  subscribeButtonLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default NewsPortalScreen;
