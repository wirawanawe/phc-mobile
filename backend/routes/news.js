const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Mock data for health news
const healthNews = [
  {
    id: "1",
    title: "New Study Shows Benefits of Mediterranean Diet for Heart Health",
    summary:
      "Recent research indicates that following a Mediterranean diet can significantly reduce the risk of cardiovascular diseases.",
    content:
      "A comprehensive study published in the Journal of Nutrition found that individuals who followed a Mediterranean diet had a 30% lower risk of heart disease compared to those on a standard Western diet. The study followed over 10,000 participants for five years and found significant improvements in cholesterol levels, blood pressure, and overall cardiovascular health...",
    category: "nutrition",
    tags: ["mediterranean diet", "heart health", "nutrition", "research"],
    author: "Dr. Sarah Johnson",
    publishedAt: "2024-01-15T10:00:00Z",
    image: "mediterranean-diet.jpg",
    readTime: 5,
    views: 1250,
    likes: 89,
    isFeatured: true,
    isBreaking: false,
  },
  {
    id: "2",
    title: "Exercise Guidelines Updated for Adults",
    summary:
      "The World Health Organization has released new exercise recommendations for adults of all ages.",
    content:
      "The WHO has updated its physical activity guidelines, now recommending that adults engage in at least 150-300 minutes of moderate-intensity aerobic physical activity per week, or 75-150 minutes of vigorous-intensity activity. The guidelines also emphasize the importance of muscle-strengthening activities at least twice per week...",
    category: "fitness",
    tags: ["exercise", "WHO", "physical activity", "guidelines"],
    author: "Dr. Michael Chen",
    publishedAt: "2024-01-14T14:30:00Z",
    image: "exercise-guidelines.jpg",
    readTime: 4,
    views: 890,
    likes: 67,
    isFeatured: false,
    isBreaking: true,
  },
  {
    id: "3",
    title: "Mental Health Awareness: The Impact of Social Media",
    summary:
      "New research explores the relationship between social media use and mental health outcomes.",
    content:
      "A recent study published in the Journal of Psychology examined the effects of social media usage on mental health among young adults. The research found that excessive social media use was associated with increased levels of anxiety, depression, and poor sleep quality. However, the study also identified positive aspects of social media when used mindfully...",
    category: "mental-health",
    tags: ["mental health", "social media", "anxiety", "depression"],
    author: "Dr. Lisa Rodriguez",
    publishedAt: "2024-01-13T09:15:00Z",
    image: "social-media-mental-health.jpg",
    readTime: 6,
    views: 2100,
    likes: 156,
    isFeatured: true,
    isBreaking: false,
  },
  {
    id: "4",
    title: "Breakthrough in Diabetes Management",
    summary:
      "New technology offers hope for better diabetes management and monitoring.",
    content:
      "Scientists have developed a new continuous glucose monitoring system that provides real-time blood sugar readings without the need for frequent finger pricks. The device, which is worn as a small patch, can alert users to dangerous blood sugar levels and help them make better dietary and medication decisions...",
    category: "medical",
    tags: ["diabetes", "glucose monitoring", "technology", "healthcare"],
    author: "Dr. Robert Kim",
    publishedAt: "2024-01-12T16:45:00Z",
    image: "diabetes-technology.jpg",
    readTime: 7,
    views: 1800,
    likes: 134,
    isFeatured: false,
    isBreaking: true,
  },
  {
    id: "5",
    title: "Sleep Quality and Weight Management",
    summary:
      "Research shows that poor sleep quality may contribute to weight gain and obesity.",
    content:
      "A comprehensive review of studies published in the Journal of Sleep Research found a strong correlation between sleep quality and weight management. The research indicates that individuals who get less than 7 hours of sleep per night are more likely to experience weight gain and have difficulty losing weight...",
    category: "lifestyle",
    tags: ["sleep", "weight management", "obesity", "health"],
    author: "Dr. Emily Watson",
    publishedAt: "2024-01-11T11:20:00Z",
    image: "sleep-weight.jpg",
    readTime: 5,
    views: 950,
    likes: 78,
    isFeatured: false,
    isBreaking: false,
  },
];

// @route   GET /api/news
// @desc    Get health news with filtering
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const featured = req.query.featured === "true";
    const breaking = req.query.breaking === "true";

    let filteredNews = [...healthNews];

    // Apply filters
    if (category) {
      filteredNews = filteredNews.filter(
        (article) => article.category === category
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredNews = filteredNews.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.summary.toLowerCase().includes(searchLower) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (featured) {
      filteredNews = filteredNews.filter((article) => article.isFeatured);
    }

    if (breaking) {
      filteredNews = filteredNews.filter((article) => article.isBreaking);
    }

    // Sort by published date (newest first)
    filteredNews.sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNews = filteredNews.slice(startIndex, endIndex);

    // Add personalized recommendations if user is authenticated
    let recommendations = [];
    if (req.user) {
      recommendations = getPersonalizedNews(req.user, filteredNews);
    }

    res.json({
      success: true,
      data: {
        news: paginatedNews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredNews.length / limit),
          totalItems: filteredNews.length,
          itemsPerPage: limit,
        },
        recommendations,
        categories: [
          "nutrition",
          "fitness",
          "mental-health",
          "medical",
          "lifestyle",
        ],
        featured: healthNews.filter((article) => article.isFeatured),
        breaking: healthNews.filter((article) => article.isBreaking),
      },
    });
  } catch (error) {
    console.error("Get news error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/news/:id
// @desc    Get specific news article
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const article = healthNews.find((a) => a.id === req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Track view if user is authenticated
    if (req.user) {
      // In a real app, you'd save this to database
      article.views += 1;
    }

    // Get related articles
    const relatedArticles = getRelatedArticles(article, healthNews);

    res.json({
      success: true,
      data: {
        article,
        relatedArticles,
      },
    });
  } catch (error) {
    console.error("Get news article error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/news/:id/like
// @desc    Like/unlike a news article
// @access  Private
router.post("/:id/like", protect, async (req, res) => {
  try {
    const article = healthNews.find((a) => a.id === req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // In a real app, you'd save this to database
    const likeData = {
      userId: req.user._id,
      articleId: req.params.id,
      timestamp: new Date(),
    };

    // Toggle like status (in a real app, you'd check if user already liked)
    const isLiked = true; // This would be determined from database
    if (isLiked) {
      article.likes -= 1;
    } else {
      article.likes += 1;
    }

    res.json({
      success: true,
      message: isLiked ? "Article unliked" : "Article liked",
      data: {
        likeData,
        likes: article.likes,
        isLiked: !isLiked,
      },
    });
  } catch (error) {
    console.error("Like article error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/news/:id/share
// @desc    Share a news article
// @access  Private
router.post(
  "/:id/share",
  protect,
  [
    body("platform")
      .isIn(["facebook", "twitter", "linkedin", "email", "whatsapp"])
      .withMessage("Invalid sharing platform"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { platform } = req.body;
      const article = healthNews.find((a) => a.id === req.params.id);

      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      // In a real app, you'd save this to database
      const shareData = {
        userId: req.user._id,
        articleId: req.params.id,
        platform,
        timestamp: new Date(),
      };

      res.json({
        success: true,
        message: "Article shared successfully",
        data: { shareData },
      });
    } catch (error) {
      console.error("Share article error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/news/categories
// @desc    Get news categories
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      {
        id: "nutrition",
        name: "Nutrition",
        description: "Latest news about diet, nutrition, and healthy eating",
        icon: "food-apple",
        color: "#10B981",
        articleCount: healthNews.filter(
          (article) => article.category === "nutrition"
        ).length,
      },
      {
        id: "fitness",
        name: "Fitness",
        description: "Exercise, workout trends, and physical health news",
        icon: "dumbbell",
        color: "#3B82F6",
        articleCount: healthNews.filter(
          (article) => article.category === "fitness"
        ).length,
      },
      {
        id: "mental-health",
        name: "Mental Health",
        description: "Psychology, mental wellness, and emotional health",
        icon: "brain",
        color: "#8B5CF6",
        articleCount: healthNews.filter(
          (article) => article.category === "mental-health"
        ).length,
      },
      {
        id: "medical",
        name: "Medical",
        description: "Medical breakthroughs, treatments, and healthcare news",
        icon: "medical-bag",
        color: "#EF4444",
        articleCount: healthNews.filter(
          (article) => article.category === "medical"
        ).length,
      },
      {
        id: "lifestyle",
        name: "Lifestyle",
        description: "General wellness, sleep, and healthy living tips",
        icon: "leaf",
        color: "#F59E0B",
        articleCount: healthNews.filter(
          (article) => article.category === "lifestyle"
        ).length,
      },
    ];

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/news/recommended
// @desc    Get personalized news recommendations
// @access  Private
router.get("/recommended", protect, async (req, res) => {
  try {
    const recommendations = getPersonalizedNews(req.user, healthNews);

    res.json({
      success: true,
      data: { recommendations },
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/news/trending
// @desc    Get trending news articles
// @access  Public
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Sort by views and likes to determine trending articles
    const trendingArticles = [...healthNews]
      .sort((a, b) => b.views + b.likes - (a.views + a.likes))
      .slice(0, limit);

    res.json({
      success: true,
      data: { trendingArticles },
    });
  } catch (error) {
    console.error("Get trending news error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper functions
const getPersonalizedNews = (user, news) => {
  let recommendations = [];

  // Based on health goals
  if (user.healthGoals && user.healthGoals.length > 0) {
    const goals = user.healthGoals.map((goal) => goal.goal.toLowerCase());

    if (goals.some((goal) => goal.includes("weight"))) {
      recommendations.push(
        ...news.filter(
          (article) =>
            article.category === "nutrition" ||
            article.tags.some((tag) => tag.includes("weight"))
        )
      );
    }

    if (goals.some((goal) => goal.includes("heart"))) {
      recommendations.push(
        ...news.filter(
          (article) =>
            article.category === "medical" ||
            article.tags.some((tag) => tag.includes("heart"))
        )
      );
    }
  }

  // Based on activity level
  if (user.activityLevel === "sedentary") {
    recommendations.push(
      ...news.filter(
        (article) =>
          article.category === "fitness" ||
          article.tags.some((tag) => tag.includes("exercise"))
      )
    );
  }

  // Based on age
  const age = user.getAge();
  if (age && age > 50) {
    recommendations.push(
      ...news.filter(
        (article) =>
          article.category === "medical" ||
          article.tags.some(
            (tag) => tag.includes("aging") || tag.includes("senior")
          )
      )
    );
  }

  // Remove duplicates and limit to 5 recommendations
  const uniqueRecommendations = recommendations.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  return uniqueRecommendations.slice(0, 5);
};

const getRelatedArticles = (currentArticle, allArticles) => {
  // Find articles with similar tags or category
  const related = allArticles.filter(
    (article) =>
      article.id !== currentArticle.id &&
      (article.category === currentArticle.category ||
        article.tags.some((tag) => currentArticle.tags.includes(tag)))
  );

  return related.slice(0, 3);
};

module.exports = router;
