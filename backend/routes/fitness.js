const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Mock data for workouts and challenges
const workoutTemplates = [
  {
    id: "1",
    name: "Beginner Cardio",
    type: "cardio",
    difficulty: "beginner",
    duration: 20,
    calories: 150,
    exercises: [
      {
        name: "Walking",
        duration: 10,
        description: "Brisk walking in place or around the room",
      },
      {
        name: "Jumping Jacks",
        duration: 5,
        description: "Basic jumping jacks with proper form",
      },
      {
        name: "Marching in Place",
        duration: 5,
        description: "High knees marching in place",
      },
    ],
    points: 25,
  },
  {
    id: "2",
    name: "Strength Training Basics",
    type: "strength",
    difficulty: "beginner",
    duration: 30,
    calories: 200,
    exercises: [
      {
        name: "Push-ups",
        sets: 3,
        reps: 10,
        description: "Modified push-ups on knees if needed",
      },
      {
        name: "Squats",
        sets: 3,
        reps: 15,
        description: "Bodyweight squats with proper form",
      },
      {
        name: "Plank",
        sets: 3,
        duration: 30,
        description: "Hold plank position for 30 seconds",
      },
    ],
    points: 35,
  },
  {
    id: "3",
    name: "Advanced HIIT",
    type: "hiit",
    difficulty: "advanced",
    duration: 45,
    calories: 400,
    exercises: [
      {
        name: "Burpees",
        sets: 4,
        reps: 15,
        description: "Full burpees with push-up and jump",
      },
      {
        name: "Mountain Climbers",
        sets: 4,
        duration: 45,
        description: "Fast mountain climbers",
      },
      {
        name: "High Knees",
        sets: 4,
        duration: 30,
        description: "Running in place with high knees",
      },
    ],
    points: 50,
  },
];

const challenges = [
  {
    id: "1",
    name: "30-Day Fitness Challenge",
    description: "Complete 30 days of consistent exercise",
    type: "streak",
    duration: 30,
    reward: {
      points: 500,
      badge: "Consistency King",
      title: "Fitness Warrior",
    },
    requirements: {
      dailyWorkouts: 1,
      minimumDuration: 15,
    },
  },
  {
    id: "2",
    name: "10K Steps Challenge",
    description: "Achieve 10,000 steps for 7 consecutive days",
    type: "steps",
    duration: 7,
    reward: {
      points: 200,
      badge: "Step Master",
      title: "Walker Extraordinaire",
    },
    requirements: {
      dailySteps: 10000,
    },
  },
  {
    id: "3",
    name: "Strength Builder",
    description: "Complete 20 strength training workouts",
    type: "workouts",
    duration: 60,
    reward: {
      points: 300,
      badge: "Strength Master",
      title: "Power Lifter",
    },
    requirements: {
      totalWorkouts: 20,
      workoutType: "strength",
    },
  },
];

// @route   GET /api/fitness/workouts
// @desc    Get workout templates
// @access  Private
router.get("/workouts", async (req, res) => {
  try {
    const difficulty = req.query.difficulty;
    const type = req.query.type;

    let filteredWorkouts = [...workoutTemplates];

    if (difficulty) {
      filteredWorkouts = filteredWorkouts.filter(
        (workout) => workout.difficulty === difficulty
      );
    }

    if (type) {
      filteredWorkouts = filteredWorkouts.filter(
        (workout) => workout.type === type
      );
    }

    // Add personalized recommendations
    const recommendations = getPersonalizedWorkouts(req.user, filteredWorkouts);

    res.json({
      success: true,
      data: {
        workouts: filteredWorkouts,
        recommendations,
        types: ["cardio", "strength", "hiit", "yoga", "flexibility"],
        difficulties: ["beginner", "intermediate", "advanced"],
      },
    });
  } catch (error) {
    console.error("Get workouts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/fitness/workouts/:id
// @desc    Get specific workout template
// @access  Private
router.get("/workouts/:id", async (req, res) => {
  try {
    const workout = workoutTemplates.find((w) => w.id === req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    res.json({
      success: true,
      data: { workout },
    });
  } catch (error) {
    console.error("Get workout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/fitness/workouts/complete
// @desc    Complete a workout
// @access  Private
router.post(
  "/workouts/complete",
  [
    body("workoutId").notEmpty().withMessage("Workout ID is required"),
    body("duration")
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive integer"),
    body("caloriesBurned")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Calories burned must be a positive integer"),
    body("exercises").isArray().withMessage("Exercises must be an array"),
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

      const { workoutId, duration, caloriesBurned, exercises } = req.body;

      // Find workout template
      const workoutTemplate = workoutTemplates.find((w) => w.id === workoutId);
      if (!workoutTemplate) {
        return res.status(404).json({
          success: false,
          message: "Workout template not found",
        });
      }

      // Calculate points based on completion
      let pointsEarned = workoutTemplate.points;

      // Bonus points for exceeding duration
      if (duration > workoutTemplate.duration) {
        pointsEarned +=
          Math.floor((duration - workoutTemplate.duration) / 5) * 5;
      }

      // Update user points and stats
      await req.user.updatePoints(pointsEarned);

      // In a real app, you'd save workout completion to database
      const workoutCompletion = {
        userId: req.user._id,
        workoutId,
        duration,
        caloriesBurned: caloriesBurned || workoutTemplate.calories,
        exercises,
        pointsEarned,
        completedAt: new Date(),
      };

      // Check for achievements
      const achievements = checkWorkoutAchievements(
        req.user,
        workoutCompletion
      );

      res.json({
        success: true,
        message: "Workout completed successfully",
        data: {
          workoutCompletion,
          pointsEarned,
          achievements,
        },
      });
    } catch (error) {
      console.error("Complete workout error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/fitness/challenges
// @desc    Get fitness challenges
// @access  Private
router.get("/challenges", async (req, res) => {
  try {
    const userChallenges = getUserChallenges(req.user._id);
    const availableChallenges = challenges.filter(
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
    console.error("Get challenges error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/fitness/challenges/:id/join
// @desc    Join a fitness challenge
// @access  Private
router.post("/challenges/:id/join", async (req, res) => {
  try {
    const challenge = challenges.find((c) => c.id === req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    // Check if user is already in this challenge
    const existingChallenge = getUserChallenges(req.user._id).find(
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
      message: "Challenge joined successfully",
      data: { userChallenge },
    });
  } catch (error) {
    console.error("Join challenge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/fitness/stats
// @desc    Get user fitness statistics
// @access  Private
router.get("/stats", async (req, res) => {
  try {
    const period = req.query.period || "7"; // days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // In a real app, you'd get this data from database
    const mockStats = {
      totalWorkouts: 15,
      totalDuration: 450, // minutes
      totalCalories: 3000,
      averageWorkoutDuration: 30,
      workoutStreak: 5,
      favoriteWorkoutType: "cardio",
      weeklyProgress: [
        { date: "2024-01-01", workouts: 3, duration: 90, calories: 600 },
        { date: "2024-01-02", workouts: 2, duration: 60, calories: 400 },
        { date: "2024-01-03", workouts: 4, duration: 120, calories: 800 },
        { date: "2024-01-04", workouts: 1, duration: 30, calories: 200 },
        { date: "2024-01-05", workouts: 3, duration: 90, calories: 600 },
        { date: "2024-01-06", workouts: 2, duration: 60, calories: 400 },
        { date: "2024-01-07", workouts: 0, duration: 0, calories: 0 },
      ],
    };

    res.json({
      success: true,
      data: mockStats,
    });
  } catch (error) {
    console.error("Get fitness stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/fitness/leaderboard
// @desc    Get fitness leaderboard
// @access  Private
router.get("/leaderboard", async (req, res) => {
  try {
    const period = req.query.period || "week"; // week, month, all-time
    const type = req.query.type || "workouts"; // workouts, steps, calories

    // In a real app, you'd get this from database
    const leaderboard = [
      {
        rank: 1,
        userId: "user1",
        name: "John Doe",
        avatar: "J",
        value: 15,
        unit: "workouts",
      },
      {
        rank: 2,
        userId: "user2",
        name: "Jane Smith",
        avatar: "J",
        value: 12,
        unit: "workouts",
      },
      {
        rank: 3,
        userId: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar || req.user.name.charAt(0),
        value: 10,
        unit: "workouts",
      },
    ];

    res.json({
      success: true,
      data: {
        leaderboard,
        period,
        type,
      },
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper functions
const getPersonalizedWorkouts = (user, workouts) => {
  let recommendations = [];

  // Based on activity level
  if (user.activityLevel === "sedentary") {
    recommendations.push(
      ...workouts.filter((w) => w.difficulty === "beginner")
    );
  } else if (
    user.activityLevel === "very_active" ||
    user.activityLevel === "extremely_active"
  ) {
    recommendations.push(
      ...workouts.filter((w) => w.difficulty === "advanced")
    );
  } else {
    recommendations.push(
      ...workouts.filter((w) => w.difficulty === "intermediate")
    );
  }

  // Based on health goals
  if (user.healthGoals && user.healthGoals.length > 0) {
    const goals = user.healthGoals.map((goal) => goal.goal.toLowerCase());

    if (goals.some((goal) => goal.includes("weight"))) {
      recommendations.push(
        ...workouts.filter((w) => w.type === "cardio" || w.type === "hiit")
      );
    }

    if (goals.some((goal) => goal.includes("strength"))) {
      recommendations.push(...workouts.filter((w) => w.type === "strength"));
    }
  }

  // Remove duplicates and limit to 5 recommendations
  const uniqueRecommendations = recommendations.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  return uniqueRecommendations.slice(0, 5);
};

const getUserChallenges = (userId) => {
  // In a real app, this would come from database
  return [
    {
      userId,
      challengeId: "1",
      status: "active",
      progress: 15,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
    },
  ];
};

const checkWorkoutAchievements = (user, workoutCompletion) => {
  const achievements = [];

  // First workout achievement
  if (user.points <= 50) {
    achievements.push({
      id: "first_workout",
      title: "First Steps",
      description: "Completed your first workout",
      points: 25,
    });
  }

  // Streak achievements
  if (user.streakDays >= 7) {
    achievements.push({
      id: "week_streak",
      title: "Week Warrior",
      description: "Maintained a 7-day workout streak",
      points: 100,
    });
  }

  return achievements;
};

module.exports = router;
