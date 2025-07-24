const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const HealthData = require("../models/HealthData");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("phone")
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid date"),
    body("gender")
      .optional()
      .isIn(["male", "female", "other"])
      .withMessage("Gender must be male, female, or other"),
    body("height")
      .optional()
      .isFloat({ min: 50, max: 300 })
      .withMessage("Height must be between 50 and 300 cm"),
    body("weight")
      .optional()
      .isFloat({ min: 20, max: 500 })
      .withMessage("Weight must be between 20 and 500 kg"),
    body("bloodType")
      .optional()
      .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .withMessage("Please provide a valid blood type"),
    body("activityLevel")
      .optional()
      .isIn([
        "sedentary",
        "lightly_active",
        "moderately_active",
        "very_active",
        "extremely_active",
      ])
      .withMessage("Please provide a valid activity level"),
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

      const updateFields = {};
      const allowedFields = [
        "name",
        "phone",
        "dateOfBirth",
        "gender",
        "height",
        "weight",
        "bloodType",
        "activityLevel",
        "smokingStatus",
        "alcoholConsumption",
        "dietaryRestrictions",
        "preferredActivities",
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateFields[field] = req.body[field];
        }
      });

      // Handle emergency contact
      if (req.body.emergencyContact) {
        updateFields.emergencyContact = req.body.emergencyContact;
      }

      const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   POST /api/users/health-data
// @desc    Add health data entry
// @access  Private
router.post(
  "/health-data",
  [
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid date"),
    body("vitals.bloodPressure.systolic")
      .optional()
      .isFloat({ min: 50, max: 300 })
      .withMessage("Systolic pressure must be between 50 and 300"),
    body("vitals.bloodPressure.diastolic")
      .optional()
      .isFloat({ min: 30, max: 200 })
      .withMessage("Diastolic pressure must be between 30 and 200"),
    body("vitals.heartRate.value")
      .optional()
      .isFloat({ min: 30, max: 250 })
      .withMessage("Heart rate must be between 30 and 250"),
    body("measurements.weight.value")
      .optional()
      .isFloat({ min: 20, max: 500 })
      .withMessage("Weight must be between 20 and 500 kg"),
    body("activity.steps")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Steps cannot be negative"),
    body("activity.sleepHours")
      .optional()
      .isFloat({ min: 0, max: 24 })
      .withMessage("Sleep hours must be between 0 and 24"),
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

      const healthData = new HealthData({
        userId: req.user._id,
        ...req.body,
      });

      await healthData.save();

      // Check for health alerts
      const alerts = healthData.checkAlerts();

      res.status(201).json({
        success: true,
        message: "Health data added successfully",
        data: { healthData, alerts },
      });
    } catch (error) {
      console.error("Add health data error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/users/health-data
// @desc    Get user health data with pagination and filtering
// @access  Private
router.get("/health-data", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const type = req.query.type; // vitals, measurements, activity, etc.

    const filter = { userId: req.user._id };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (page - 1) * limit;

    const healthData = await HealthData.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await HealthData.countDocuments(filter);

    res.json({
      success: true,
      data: {
        healthData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get health data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/users/health-goals
// @desc    Update health goals
// @access  Private
router.put(
  "/health-goals",
  [body("healthGoals").isArray().withMessage("Health goals must be an array")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { healthGoals: req.body.healthGoals },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Health goals updated successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Update health goals error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/users/notifications
// @desc    Update notification settings
// @access  Private
router.put("/notifications", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notifications: req.body.notifications },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Notification settings updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/users/privacy
// @desc    Update privacy settings
// @access  Private
router.put("/privacy", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { privacySettings: req.body.privacySettings },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Privacy settings updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update privacy error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get("/dashboard", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get recent health data
    const recentHealthData = await HealthData.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(7);

    // Calculate health score
    const healthScore = calculateHealthScore(user, recentHealthData);

    // Get achievements
    const achievements = user.achievements || [];

    // Get streak information
    const streakInfo = calculateStreak(user, recentHealthData);

    const dashboardData = {
      user: {
        name: user.name,
        level: user.level,
        points: user.points,
        memberSince: user.memberSince,
        profileCompletion: user.profileCompletion,
      },
      healthScore,
      recentActivity: recentHealthData,
      achievements,
      streakInfo,
      stats: {
        totalAssessments: 0, // TODO: Get from Assessment model
        totalHealthEntries: recentHealthData.length,
        daysActive: user.streakDays,
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper function to calculate health score
const calculateHealthScore = (user, healthData) => {
  let score = 0;
  let factors = 0;

  // BMI factor
  if (user.height && user.weight) {
    const bmi = user.calculateBMI();
    if (bmi >= 18.5 && bmi < 25) {
      score += 25;
    } else if (bmi >= 25 && bmi < 30) {
      score += 15;
    } else {
      score += 5;
    }
    factors++;
  }

  // Activity level factor
  if (user.activityLevel) {
    const activityScores = {
      sedentary: 5,
      lightly_active: 15,
      moderately_active: 25,
      very_active: 30,
      extremely_active: 35,
    };
    score += activityScores[user.activityLevel] || 0;
    factors++;
  }

  // Recent health data factor
  if (healthData.length > 0) {
    const recentData = healthData[0];
    if (recentData.vitals && recentData.vitals.bloodPressure) {
      const bp = recentData.vitals.bloodPressure;
      if (bp.systolic < 140 && bp.diastolic < 90) {
        score += 20;
      } else if (bp.systolic < 160 && bp.diastolic < 100) {
        score += 10;
      } else {
        score += 5;
      }
      factors++;
    }
  }

  return factors > 0 ? Math.round(score / factors) : 0;
};

// Helper function to calculate streak
const calculateStreak = (user, healthData) => {
  // This is a simplified calculation
  // In a real app, you'd want more sophisticated streak logic
  return {
    currentStreak: user.streakDays || 0,
    longestStreak: user.streakDays || 0,
    lastActive: user.lastActiveDate,
  };
};

module.exports = router;
