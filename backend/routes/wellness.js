const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Mock data for wellness activities
const wellnessActivities = [
  {
    id: "1",
    name: "Morning Meditation",
    type: "meditation",
    category: "mindfulness",
    duration: 10,
    difficulty: "beginner",
    description: "Start your day with a peaceful meditation session",
    instructions: [
      "Find a quiet, comfortable place to sit",
      "Close your eyes and take deep breaths",
      "Focus on your breath for 10 minutes",
      "Let thoughts come and go without judgment",
    ],
    benefits: ["Reduces stress", "Improves focus", "Better mood"],
    points: 20,
    image: "morning-meditation.jpg",
  },
  {
    id: "2",
    name: "Deep Breathing Exercise",
    type: "breathing",
    category: "stress-relief",
    duration: 5,
    difficulty: "beginner",
    description: "Simple breathing technique to reduce stress and anxiety",
    instructions: [
      "Sit or lie down in a comfortable position",
      "Place one hand on your chest and one on your stomach",
      "Breathe in slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Repeat for 5 minutes",
    ],
    benefits: ["Reduces anxiety", "Lowers blood pressure", "Improves sleep"],
    points: 15,
    image: "breathing-exercise.jpg",
  },
  {
    id: "3",
    name: "Progressive Muscle Relaxation",
    type: "relaxation",
    category: "stress-relief",
    duration: 15,
    difficulty: "intermediate",
    description:
      "Systematically tense and relax muscle groups to reduce tension",
    instructions: [
      "Find a quiet place to lie down",
      "Start with your toes, tense them for 5 seconds",
      "Release and feel the relaxation",
      "Move up to your calves, thighs, and so on",
      "Continue until you reach your head",
    ],
    benefits: ["Reduces muscle tension", "Improves sleep", "Reduces stress"],
    points: 25,
    image: "muscle-relaxation.jpg",
  },
  {
    id: "4",
    name: "Gratitude Journaling",
    type: "journaling",
    category: "mindfulness",
    duration: 10,
    difficulty: "beginner",
    description:
      "Write down things you are grateful for to improve mental well-being",
    instructions: [
      "Get a notebook or use a digital journal",
      "Write down 3 things you are grateful for today",
      "Be specific and detailed in your descriptions",
      "Reflect on why these things matter to you",
    ],
    benefits: ["Improves mood", "Reduces stress", "Better sleep"],
    points: 15,
    image: "gratitude-journal.jpg",
  },
  {
    id: "5",
    name: "Nature Walk",
    type: "outdoor",
    category: "physical-wellness",
    duration: 30,
    difficulty: "beginner",
    description:
      "Take a mindful walk in nature to connect with the environment",
    instructions: [
      "Find a nearby park or natural area",
      "Walk slowly and mindfully",
      "Notice the sights, sounds, and smells around you",
      "Take deep breaths of fresh air",
      "Appreciate the beauty of nature",
    ],
    benefits: ["Reduces stress", "Improves mood", "Physical exercise"],
    points: 30,
    image: "nature-walk.jpg",
  },
];

const wellnessChallenges = [
  {
    id: "1",
    name: "7-Day Mindfulness Challenge",
    description: "Practice mindfulness activities for 7 consecutive days",
    type: "streak",
    duration: 7,
    activities: ["meditation", "breathing", "journaling"],
    reward: {
      points: 200,
      badge: "Mindfulness Master",
      title: "Zen Warrior",
    },
  },
  {
    id: "2",
    name: "Stress-Free Week",
    description: "Complete stress-relief activities every day for a week",
    type: "category",
    duration: 7,
    activities: ["breathing", "relaxation", "nature"],
    reward: {
      points: 150,
      badge: "Stress Buster",
      title: "Calm Collector",
    },
  },
  {
    id: "3",
    name: "Gratitude Month",
    description: "Practice gratitude journaling for 30 days",
    type: "streak",
    duration: 30,
    activities: ["journaling"],
    reward: {
      points: 500,
      badge: "Gratitude Guru",
      title: "Thankful Heart",
    },
  },
];

// @route   GET /api/wellness/activities
// @desc    Get wellness activities
// @access  Private
router.get("/activities", async (req, res) => {
  try {
    const category = req.query.category;
    const type = req.query.type;
    const difficulty = req.query.difficulty;

    let filteredActivities = [...wellnessActivities];

    if (category) {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.category === category
      );
    }

    if (type) {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.type === type
      );
    }

    if (difficulty) {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.difficulty === difficulty
      );
    }

    // Add personalized recommendations
    const recommendations = getPersonalizedWellnessActivities(
      req.user,
      filteredActivities
    );

    res.json({
      success: true,
      data: {
        activities: filteredActivities,
        recommendations,
        categories: [
          "mindfulness",
          "stress-relief",
          "physical-wellness",
          "social-wellness",
        ],
        types: [
          "meditation",
          "breathing",
          "relaxation",
          "journaling",
          "outdoor",
        ],
        difficulties: ["beginner", "intermediate", "advanced"],
      },
    });
  } catch (error) {
    console.error("Get wellness activities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/wellness/activities/:id
// @desc    Get specific wellness activity
// @access  Private
router.get("/activities/:id", async (req, res) => {
  try {
    const activity = wellnessActivities.find((a) => a.id === req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.json({
      success: true,
      data: { activity },
    });
  } catch (error) {
    console.error("Get wellness activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/wellness/activities/complete
// @desc    Complete a wellness activity
// @access  Private
router.post(
  "/activities/complete",
  [
    body("activityId").notEmpty().withMessage("Activity ID is required"),
    body("duration")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive integer"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
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

      const { activityId, duration, notes } = req.body;

      // Find activity
      const activity = wellnessActivities.find((a) => a.id === activityId);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: "Activity not found",
        });
      }

      // Calculate points
      let pointsEarned = activity.points;

      // Bonus points for longer duration
      if (duration && duration > activity.duration) {
        pointsEarned += Math.floor((duration - activity.duration) / 5) * 5;
      }

      // Update user points
      await req.user.updatePoints(pointsEarned);

      // In a real app, you'd save this to database
      const activityCompletion = {
        userId: req.user._id,
        activityId,
        duration: duration || activity.duration,
        notes,
        pointsEarned,
        completedAt: new Date(),
      };

      // Check for achievements
      const achievements = checkWellnessAchievements(
        req.user,
        activityCompletion
      );

      res.json({
        success: true,
        message: "Wellness activity completed successfully",
        data: {
          activityCompletion,
          pointsEarned,
          achievements,
        },
      });
    } catch (error) {
      console.error("Complete wellness activity error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/wellness/challenges
// @desc    Get wellness challenges
// @access  Private
router.get("/challenges", async (req, res) => {
  try {
    const userChallenges = getUserWellnessChallenges(req.user._id);
    const availableChallenges = wellnessChallenges.filter(
      (challenge) =>
        !userChallenges.some(
          (uc) => uc.challengeId === challenge.id && uc.status === "active"
        )
    );

    res.json({
      success: true,
      data: {
        activeChallenges: userChallenges.filter((uc) => uc.status === "active"),
        completedChallenges: userChallenges.filter(
          (uc) => uc.status === "completed"
        ),
        availableChallenges,
      },
    });
  } catch (error) {
    console.error("Get wellness challenges error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/wellness/challenges/:id/join
// @desc    Join a wellness challenge
// @access  Private
router.post("/challenges/:id/join", async (req, res) => {
  try {
    const challenge = wellnessChallenges.find((c) => c.id === req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    // Check if user is already in this challenge
    const existingChallenge = getUserWellnessChallenges(req.user._id).find(
      (uc) => uc.challengeId === challenge.id && uc.status === "active"
    );

    if (existingChallenge) {
      return res.status(400).json({
        success: false,
        message: "Already participating in this challenge",
      });
    }

    // In a real app, you'd save this to database
    const userChallenge = {
      userId: req.user._id,
      challengeId: challenge.id,
      status: "active",
      progress: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + challenge.duration * 24 * 60 * 60 * 1000),
    };

    res.json({
      success: true,
      message: "Wellness challenge joined successfully",
      data: { userChallenge },
    });
  } catch (error) {
    console.error("Join wellness challenge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/wellness/mood-tracker
// @desc    Get mood tracking data
// @access  Private
router.get("/mood-tracker", async (req, res) => {
  try {
    const period = req.query.period || "7"; // days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // In a real app, you'd get this from database
    const moodData = [
      {
        date: "2024-01-01",
        mood: "happy",
        stressLevel: "low",
        notes: "Great day at work",
      },
      {
        date: "2024-01-02",
        mood: "neutral",
        stressLevel: "moderate",
        notes: "Regular day",
      },
      {
        date: "2024-01-03",
        mood: "sad",
        stressLevel: "high",
        notes: "Feeling overwhelmed",
      },
      {
        date: "2024-01-04",
        mood: "happy",
        stressLevel: "low",
        notes: "Good workout session",
      },
      {
        date: "2024-01-05",
        mood: "neutral",
        stressLevel: "moderate",
        notes: "Productive day",
      },
      {
        date: "2024-01-06",
        mood: "happy",
        stressLevel: "low",
        notes: "Weekend relaxation",
      },
      {
        date: "2024-01-07",
        mood: "happy",
        stressLevel: "low",
        notes: "Family time",
      },
    ];

    const moodStats = {
      averageMood: "happy",
      mostCommonMood: "happy",
      stressTrend: "decreasing",
      moodImprovement: 15, // percentage
    };

    res.json({
      success: true,
      data: {
        moodData,
        moodStats,
      },
    });
  } catch (error) {
    console.error("Get mood tracker error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/wellness/mood-tracker
// @desc    Log mood entry
// @access  Private
router.post(
  "/mood-tracker",
  [
    body("mood")
      .isIn(["very_happy", "happy", "neutral", "sad", "very_sad"])
      .withMessage("Invalid mood value"),
    body("stressLevel")
      .isIn(["low", "moderate", "high", "very_high"])
      .withMessage("Invalid stress level"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
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

      const { mood, stressLevel, notes } = req.body;

      // In a real app, you'd save this to database
      const moodEntry = {
        userId: req.user._id,
        mood,
        stressLevel,
        notes,
        timestamp: new Date(),
      };

      // Award points for mood tracking
      await req.user.updatePoints(5);

      res.json({
        success: true,
        message: "Mood logged successfully",
        data: { moodEntry },
      });
    } catch (error) {
      console.error("Log mood error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/wellness/stats
// @desc    Get wellness statistics
// @access  Private
router.get("/stats", async (req, res) => {
  try {
    const period = req.query.period || "7"; // days

    // In a real app, you'd get this from database
    const wellnessStats = {
      totalActivities: 25,
      totalDuration: 300, // minutes
      averageMood: "happy",
      stressReduction: 25, // percentage
      mindfulnessStreak: 7,
      favoriteActivity: "meditation",
      weeklyProgress: [
        { date: "2024-01-01", activities: 3, duration: 45, mood: "happy" },
        { date: "2024-01-02", activities: 2, duration: 30, mood: "neutral" },
        { date: "2024-01-03", activities: 4, duration: 60, mood: "happy" },
        { date: "2024-01-04", activities: 1, duration: 15, mood: "sad" },
        { date: "2024-01-05", activities: 3, duration: 45, mood: "happy" },
        { date: "2024-01-06", activities: 2, duration: 30, mood: "happy" },
        { date: "2024-01-07", activities: 3, duration: 45, mood: "happy" },
      ],
    };

    res.json({
      success: true,
      data: wellnessStats,
    });
  } catch (error) {
    console.error("Get wellness stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper functions
const getPersonalizedWellnessActivities = (user, activities) => {
  let recommendations = [];

  // Based on stress level (if available in user data)
  if (user.mentalHealth && user.mentalHealth.stressLevel === "high") {
    recommendations.push(
      ...activities.filter(
        (a) => a.category === "stress-relief" || a.type === "breathing"
      )
    );
  }

  // Based on activity level
  if (user.activityLevel === "sedentary") {
    recommendations.push(
      ...activities.filter(
        (a) => a.type === "outdoor" || a.category === "physical-wellness"
      )
    );
  }

  // Based on time availability (morning person vs evening person)
  // This would be determined from user preferences or behavior patterns
  const isMorningPerson = true; // In a real app, this would be user preference
  if (isMorningPerson) {
    recommendations.push(
      ...activities.filter((a) => a.name.toLowerCase().includes("morning"))
    );
  }

  // Remove duplicates and limit to 5 recommendations
  const uniqueRecommendations = recommendations.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  return uniqueRecommendations.slice(0, 5);
};

const getUserWellnessChallenges = (userId) => {
  // In a real app, this would come from database
  return [
    {
      userId,
      challengeId: "1",
      status: "active",
      progress: 5,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-08"),
    },
  ];
};

const checkWellnessAchievements = (user, activityCompletion) => {
  const achievements = [];

  // First wellness activity achievement
  if (user.points <= 100) {
    achievements.push({
      id: "first_wellness",
      title: "Wellness Beginner",
      description: "Completed your first wellness activity",
      points: 25,
    });
  }

  // Mindfulness streak achievement
  if (user.streakDays >= 7) {
    achievements.push({
      id: "mindfulness_streak",
      title: "Mindful Master",
      description: "Maintained a 7-day wellness streak",
      points: 100,
    });
  }

  return achievements;
};

module.exports = router;
