import React, { useState, useEffect } from "react";
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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import RSSService, { RSSItem } from "../services/RSSService";
import { useLanguage } from "../contexts/LanguageContext";

const NewsPortalScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const [newsArticles, setNewsArticles] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    loadNewsArticles();
  }, []);

  const loadNewsArticles = async () => {
    try {
      setLoading(true);
      const articles = await RSSService.getHealthNews();
      setNewsArticles(articles);
    } catch (error) {
      console.error("Error loading news articles:", error);
      // Fallback data will be handled by RSSService
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = newsArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const featuredArticle = newsArticles.length > 0 ? newsArticles[0] : null;
  const regularArticles = newsArticles.slice(1);



  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder={t("language.language") === "en" ? "Search health news..." : "Cari berita kesehatan..."}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.primary}
          />
        </View>



        {/* Featured Article */}
        {featuredArticle && (
          <View style={styles.featuredContainer}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              {t("language.language") === "en" ? "Featured Article" : "Artikel Unggulan"}
            </Text>
            <Card
              style={[
                styles.featuredCard,
                { backgroundColor: theme.customColors.lightGreen },
              ]}
            >
              <Card.Content>
                <View style={styles.featuredHeader}>
                  <View
                    style={[
                      styles.featuredIcon,
                      { backgroundColor: featuredArticle.bgColor },
                    ]}
                  >
                    <Icon 
                      name={featuredArticle.image} 
                      size={24} 
                      color={featuredArticle.color} 
                    />
                  </View>
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
                      {featuredArticle.description}
                    </Text>
                    <View style={styles.featuredMeta}>
                      <Text
                        style={[
                          styles.featuredSource,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {featuredArticle.source}
                      </Text>
                      <Text
                        style={[
                          styles.featuredReadTime,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        {featuredArticle.readTime}
                      </Text>
                    </View>
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={() => {
                    navigation.navigate("ArticleDetail", { article: featuredArticle });
                  }}
                  style={[
                    styles.readMoreButton,
                    { backgroundColor: theme.customColors.darkGreen },
                  ]}
                  labelStyle={styles.readMoreButtonLabel}
                >
                  {t("language.language") === "en" ? "Read More" : "Baca Selengkapnya"}
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Latest News */}
        <View style={styles.articlesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            {t("language.language") === "en" ? "Latest News" : "Berita Terbaru"}
          </Text>
          {regularArticles.map((article) => (
            <Card key={article.id} style={styles.articleCard}>
              <Card.Content>
                <View style={styles.articleHeader}>
                  <View
                    style={[
                      styles.articleIcon,
                      { backgroundColor: article.bgColor },
                    ]}
                  >
                    <Icon 
                      name={article.image} 
                      size={20} 
                      color={article.color} 
                    />
                  </View>
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
                      {article.description}
                    </Text>
                    <View style={styles.articleMeta}>
                      <Text
                        style={[
                          styles.articleSource,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {article.source}
                      </Text>
                      <Text
                        style={[
                          styles.articleReadTime,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        {article.readTime}
                      </Text>
                    </View>
                  </View>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => {
                    navigation.navigate("ArticleDetail", { article });
                  }}
                  style={[
                    styles.readMoreButton,
                    { borderColor: theme.customColors.darkGreen },
                  ]}
                  labelStyle={[
                    styles.readMoreButtonLabel,
                    { color: theme.customColors.darkGreen },
                  ]}
                >
                  {t("language.language") === "en" ? "Read More" : "Baca Selengkapnya"}
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
                📧 {t("language.language") === "en" ? "Stay Updated" : "Tetap Terupdate"}
              </Text>
              <Text
                style={[
                  styles.newsletterDescription,
                  { color: theme.colors.onBackground },
                ]}
              >
                {t("language.language") === "en" 
                  ? "Subscribe to our health newsletter to get the latest health tips and information directly to your inbox."
                  : "Berlangganan newsletter kesehatan kami untuk mendapatkan tips dan informasi kesehatan terbaru langsung ke inbox Anda."
                }
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
                {t("language.language") === "en" ? "Subscribe Newsletter" : "Berlangganan Newsletter"}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
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
  featuredMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  featuredSource: {
    fontSize: 12,
    fontWeight: "bold",
  },
  featuredReadTime: {
    fontSize: 12,
  },
  readMoreButton: {
    borderRadius: 20,
    marginTop: 15,
  },
  readMoreButtonLabel: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  articleMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  articleSource: {
    fontSize: 12,
    fontWeight: "bold",
  },
  articleReadTime: {
    fontSize: 12,
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
