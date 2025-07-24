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

const HealthEducationScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "nutrition", label: "Nutrition" },
    { id: "fitness", label: "Fitness" },
    { id: "mental", label: "Mental Health" },
    { id: "prevention", label: "Prevention" },
    { id: "workplace", label: "Workplace Health" },
  ];

  const articles = [
    {
      id: "1",
      title: "The Complete Guide to Healthy Eating at Work",
      summary:
        "Learn how to maintain a balanced diet while working long hours and managing stress.",
      category: "nutrition",
      readTime: 5,
      tags: ["Nutrition", "Workplace", "Healthy Eating"],
      date: "2024-01-15",
    },
    {
      id: "2",
      title: "Stress Management Techniques for Busy Professionals",
      summary:
        "Effective strategies to reduce stress and improve mental well-being in the workplace.",
      category: "mental",
      readTime: 8,
      tags: ["Mental Health", "Stress", "Wellness"],
      date: "2024-01-14",
    },
    {
      id: "3",
      title: "Office Exercise: Stay Active During Work Hours",
      summary:
        "Simple exercises and stretches you can do at your desk to stay active throughout the day.",
      category: "fitness",
      readTime: 6,
      tags: ["Fitness", "Office Exercise", "Movement"],
      date: "2024-01-13",
    },
    {
      id: "4",
      title: "Preventing Common Workplace Health Issues",
      summary:
        "How to prevent eye strain, back pain, and other common office-related health problems.",
      category: "prevention",
      readTime: 7,
      tags: ["Prevention", "Ergonomics", "Health"],
      date: "2024-01-12",
    },
    {
      id: "5",
      title: "Building a Healthy Work Environment",
      summary:
        "Creating a workplace culture that promotes health and wellness for all employees.",
      category: "workplace",
      readTime: 10,
      tags: ["Workplace", "Culture", "Wellness"],
      date: "2024-01-11",
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search health articles..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.primary}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Categories
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

        {/* Articles */}
        <View style={styles.articlesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Health Articles
          </Text>
          {filteredArticles.map((article) => (
            <Card key={article.id} style={styles.articleCard}>
              <Card.Content>
                <View style={styles.articleHeader}>
                  <Text
                    style={[
                      styles.articleCategory,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {
                      categories.find((cat) => cat.id === article.category)
                        ?.label
                    }
                  </Text>
                  <Text
                    style={[
                      styles.articleReadTime,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    {article.readTime} min read
                  </Text>
                </View>

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

                  <Button
                    mode="contained"
                    onPress={() => {
                      /* Navigate to article detail */
                    }}
                    style={[
                      styles.readButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    labelStyle={styles.readButtonLabel}
                  >
                    Read More
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Featured Content */}
        <View style={styles.featuredContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Featured Content
          </Text>
          <Card
            style={[
              styles.featuredCard,
              { backgroundColor: theme.customColors.lightGreen },
            ]}
          >
            <Card.Content>
              <Text
                style={[
                  styles.featuredTitle,
                  { color: theme.customColors.darkGreen },
                ]}
              >
                🎯 Weekly Health Challenge
              </Text>
              <Text
                style={[
                  styles.featuredDescription,
                  { color: theme.colors.onBackground },
                ]}
              >
                Join our weekly health challenges and earn points while
                improving your wellness!
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("Fitness")}
                style={[
                  styles.featuredButton,
                  { backgroundColor: theme.customColors.darkGreen },
                ]}
              >
                Join Challenge
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
    justifyContent: "space-between",
    marginBottom: 10,
  },
  articleCategory: {
    fontSize: 12,
    fontWeight: "bold",
  },
  articleReadTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    lineHeight: 24,
  },
  articleSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  articleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flex: 1,
  },
  tagChip: {
    marginRight: 8,
  },
  tagText: {
    fontSize: 10,
  },
  readButton: {
    borderRadius: 20,
  },
  readButtonLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  featuredContainer: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    elevation: 2,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  featuredDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  featuredButton: {
    borderRadius: 20,
  },
});

export default HealthEducationScreen;
