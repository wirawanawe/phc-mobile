const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Mock data for education content (in a real app, this would come from a database)
const educationContent = [
  {
    id: "1",
    title: "Understanding Blood Pressure",
    category: "cardiovascular",
    difficulty: "beginner",
    duration: 5,
    content: {
      sections: [
        {
          title: "What is Blood Pressure?",
          content:
            "Blood pressure is the force of blood pushing against the walls of your arteries...",
          image: "blood-pressure-diagram.jpg",
        },
        {
          title: "Normal vs High Blood Pressure",
          content: "Normal blood pressure is typically below 120/80 mmHg...",
          image: "bp-chart.jpg",
        },
      ],
    },
    tags: ["blood pressure", "heart health", "cardiovascular"],
    author: "Dr. Sarah Johnson",
    publishedAt: "2024-01-15",
    views: 1250,
    rating: 4.5,
  },
  {
    id: "2",
    title: "Nutrition Basics for Heart Health",
    category: "nutrition",
    difficulty: "beginner",
    duration: 8,
    content: {
      sections: [
        {
          title: "Heart-Healthy Foods",
          content:
            "A heart-healthy diet includes plenty of fruits, vegetables, whole grains...",
          image: "heart-healthy-foods.jpg",
        },
        {
          title: "Foods to Limit",
          content:
            "Limit foods high in saturated fats, trans fats, and sodium...",
          image: "foods-to-avoid.jpg",
        },
      ],
    },
    tags: ["nutrition", "heart health", "diet"],
    author: "Dr. Michael Chen",
    publishedAt: "2024-01-10",
    views: 890,
    rating: 4.3,
  },
  {
    id: "3",
    title: "Exercise for Beginners",
    category: "fitness",
    difficulty: "beginner",
    duration: 6,
    content: {
      sections: [
        {
          title: "Getting Started",
          content:
            "Starting an exercise routine can be overwhelming, but it doesn't have to be...",
          image: "exercise-basics.jpg",
        },
        {
          title: "Simple Exercises to Try",
          content:
            "Walking, swimming, and cycling are excellent low-impact exercises...",
          image: "simple-exercises.jpg",
        },
      ],
    },
    tags: ["exercise", "fitness", "beginner"],
    author: "Coach Lisa Rodriguez",
    publishedAt: "2024-01-08",
    views: 2100,
    rating: 4.7,
  },
];

// @route   GET /api/education
// @desc    Get education content with filtering
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const difficulty = req.query.difficulty;
    const search = req.query.search;

    let filteredContent = [...educationContent];

    // Apply filters
    if (category) {
      filteredContent = filteredContent.filter(
        (item) => item.category === category
      );
    }

    if (difficulty) {
      filteredContent = filteredContent.filter(
        (item) => item.difficulty === difficulty
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredContent = filteredContent.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContent = filteredContent.slice(startIndex, endIndex);

    // Add personalized recommendations if user is authenticated
    let recommendations = [];
    if (req.user) {
      recommendations = getPersonalizedRecommendations(
        req.user,
        filteredContent
      );
    }

    res.json({
      success: true,
      data: {
        content: paginatedContent,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredContent.length / limit),
          totalItems: filteredContent.length,
          itemsPerPage: limit,
        },
        recommendations,
        categories: [
          "cardiovascular",
          "nutrition",
          "fitness",
          "mental-health",
          "lifestyle",
        ],
        difficulties: ["beginner", "intermediate", "advanced"],
      },
    });
  } catch (error) {
    console.error("Get education content error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/education/:id
// @desc    Get specific education content
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const content = educationContent.find((item) => item.id === req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Track view if user is authenticated
    if (req.user) {
      // In a real app, you'd save this to a database
      content.views += 1;
    }

    // Get related content
    const relatedContent = getRelatedContent(content, educationContent);

    res.json({
      success: true,
      data: {
        content,
        relatedContent,
      },
    });
  } catch (error) {
    console.error("Get education content error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/education/:id/progress
// @desc    Track user progress on education content
// @access  Private
router.post(
  "/:id/progress",
  protect,
  [
    body("progress")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Progress must be between 0 and 100"),
    body("completed").isBoolean().withMessage("Completed must be a boolean"),
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

      const { progress, completed } = req.body;
      const contentId = req.params.id;

      // In a real app, you'd save this to a database
      // For now, we'll just return success
      const progressData = {
        userId: req.user._id,
        contentId,
        progress,
        completed,
        timestamp: new Date(),
      };

      // Award points if completed
      if (completed) {
        await req.user.updatePoints(25);
      }

      res.json({
        success: true,
        message: "Progress tracked successfully",
        data: { progressData },
      });
    } catch (error) {
      console.error("Track progress error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   POST /api/education/:id/rate
// @desc    Rate education content
// @access  Private
router.post(
  "/:id/rate",
  protect,
  [
    body("rating")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Comment cannot exceed 500 characters"),
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

      const { rating, comment } = req.body;
      const contentId = req.params.id;

      // In a real app, you'd save this to a database
      const ratingData = {
        userId: req.user._id,
        contentId,
        rating,
        comment,
        timestamp: new Date(),
      };

      res.json({
        success: true,
        message: "Rating submitted successfully",
        data: { ratingData },
      });
    } catch (error) {
      console.error("Submit rating error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/education/categories
// @desc    Get education categories
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      {
        id: "cardiovascular",
        name: "Cardiovascular Health",
        description:
          "Learn about heart health, blood pressure, and cardiovascular diseases",
        icon: "heart",
        color: "#EF4444",
      },
      {
        id: "nutrition",
        name: "Nutrition",
        description:
          "Healthy eating habits, diet plans, and nutritional information",
        icon: "food-apple",
        color: "#10B981",
      },
      {
        id: "fitness",
        name: "Fitness & Exercise",
        description:
          "Workout routines, exercise tips, and physical activity guidance",
        icon: "dumbbell",
        color: "#3B82F6",
      },
      {
        id: "mental-health",
        name: "Mental Health",
        description: "Stress management, mindfulness, and mental wellness",
        icon: "brain",
        color: "#8B5CF6",
      },
      {
        id: "lifestyle",
        name: "Lifestyle",
        description: "General wellness, sleep, and healthy living tips",
        icon: "leaf",
        color: "#F59E0B",
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

// @route   GET /api/education/recommended
// @desc    Get personalized recommendations
// @access  Private
router.get("/recommended", protect, async (req, res) => {
  try {
    const recommendations = getPersonalizedRecommendations(
      req.user,
      educationContent
    );

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

// Helper functions
const getPersonalizedRecommendations = (user, content) => {
  // Simple recommendation algorithm based on user profile
  let recommendations = [];

  // Based on age
  const age = user.getAge();
  if (age && age > 50) {
    recommendations.push(
      ...content.filter(
        (item) =>
          item.category === "cardiovascular" || item.category === "lifestyle"
      )
    );
  }

  // Based on activity level
  if (user.activityLevel === "sedentary") {
    recommendations.push(
      ...content.filter(
        (item) => item.category === "fitness" && item.difficulty === "beginner"
      )
    );
  }

  // Based on health goals
  if (user.healthGoals && user.healthGoals.length > 0) {
    const goals = user.healthGoals.map((goal) => goal.goal.toLowerCase());

    if (goals.some((goal) => goal.includes("weight"))) {
      recommendations.push(
        ...content.filter(
          (item) => item.category === "nutrition" || item.category === "fitness"
        )
      );
    }

    if (goals.some((goal) => goal.includes("heart"))) {
      recommendations.push(
        ...content.filter((item) => item.category === "cardiovascular")
      );
    }
  }

  // Remove duplicates and limit to 5 recommendations
  const uniqueRecommendations = recommendations.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  return uniqueRecommendations.slice(0, 5);
};

const getRelatedContent = (currentContent, allContent) => {
  // Find content with similar tags or category
  const related = allContent.filter(
    (item) =>
      item.id !== currentContent.id &&
      (item.category === currentContent.category ||
        item.tags.some((tag) => currentContent.tags.includes(tag)))
  );

  return related.slice(0, 3);
};

module.exports = router;
