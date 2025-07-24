const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");
const HealthData = require("../models/HealthData");
const User = require("../models/User");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route   POST /api/health/data
// @desc    Add health data entry
// @access  Private
router.post(
  "/data",
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

      // Update user points for logging health data
      if (alerts.length === 0) {
        await req.user.updatePoints(10); // Award points for healthy data
      }

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

// @route   GET /api/health/data
// @desc    Get health data with filtering and pagination
// @access  Private
router.get("/data", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const dataType = req.query.type; // vitals, measurements, activity, nutrition, mentalHealth

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

// @route   GET /api/health/analytics
// @desc    Get health analytics and trends
// @access  Private
router.get("/analytics", async (req, res) => {
  try {
    const period = req.query.period || "30"; // days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const healthData = await HealthData.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const analytics = {
      weight: calculateWeightTrend(healthData),
      bloodPressure: calculateBloodPressureTrend(healthData),
      heartRate: calculateHeartRateTrend(healthData),
      activity: calculateActivityTrend(healthData),
      sleep: calculateSleepTrend(healthData),
      nutrition: calculateNutritionTrend(healthData),
      mentalHealth: calculateMentalHealthTrend(healthData),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/health/summary
// @desc    Get health summary for dashboard
// @access  Private
router.get("/summary", async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get recent health data
    const recentData = await HealthData.find({
      userId: req.user._id,
      date: { $gte: weekAgo },
    }).sort({ date: -1 });

    // Get latest entry
    const latestEntry = recentData[0];

    // Calculate averages
    const averages = calculateAverages(recentData);

    // Get alerts
    const alerts = latestEntry ? latestEntry.checkAlerts() : [];

    // Calculate health score
    const healthScore = calculateHealthScore(req.user, recentData);

    const summary = {
      latestEntry,
      averages,
      alerts,
      healthScore,
      dataPoints: recentData.length,
      lastUpdated: latestEntry ? latestEntry.date : null,
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/health/data/:id
// @desc    Update health data entry
// @access  Private
router.put("/data/:id", async (req, res) => {
  try {
    const healthData = await HealthData.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!healthData) {
      return res.status(404).json({
        success: false,
        message: "Health data not found",
      });
    }

    // Check for alerts after update
    const alerts = healthData.checkAlerts();

    res.json({
      success: true,
      message: "Health data updated successfully",
      data: { healthData, alerts },
    });
  } catch (error) {
    console.error("Update health data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/health/data/:id
// @desc    Delete health data entry
// @access  Private
router.delete("/data/:id", async (req, res) => {
  try {
    const healthData = await HealthData.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!healthData) {
      return res.status(404).json({
        success: false,
        message: "Health data not found",
      });
    }

    res.json({
      success: true,
      message: "Health data deleted successfully",
    });
  } catch (error) {
    console.error("Delete health data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper functions for analytics
const calculateWeightTrend = (healthData) => {
  const weightData = healthData
    .filter((entry) => entry.measurements && entry.measurements.weight)
    .map((entry) => ({
      date: entry.date,
      weight: entry.measurements.weight.value,
    }));

  if (weightData.length < 2) return null;

  const firstWeight = weightData[0].weight;
  const lastWeight = weightData[weightData.length - 1].weight;
  const change = lastWeight - firstWeight;
  const changePercent = ((change / firstWeight) * 100).toFixed(1);

  return {
    data: weightData,
    change,
    changePercent,
    trend: change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
  };
};

const calculateBloodPressureTrend = (healthData) => {
  const bpData = healthData
    .filter((entry) => entry.vitals && entry.vitals.bloodPressure)
    .map((entry) => ({
      date: entry.date,
      systolic: entry.vitals.bloodPressure.systolic,
      diastolic: entry.vitals.bloodPressure.diastolic,
    }));

  if (bpData.length < 2) return null;

  return {
    data: bpData,
    averageSystolic: (
      bpData.reduce((sum, entry) => sum + entry.systolic, 0) / bpData.length
    ).toFixed(1),
    averageDiastolic: (
      bpData.reduce((sum, entry) => sum + entry.diastolic, 0) / bpData.length
    ).toFixed(1),
  };
};

const calculateHeartRateTrend = (healthData) => {
  const hrData = healthData
    .filter((entry) => entry.vitals && entry.vitals.heartRate)
    .map((entry) => ({
      date: entry.date,
      heartRate: entry.vitals.heartRate.value,
    }));

  if (hrData.length < 2) return null;

  return {
    data: hrData,
    average: (
      hrData.reduce((sum, entry) => sum + entry.heartRate, 0) / hrData.length
    ).toFixed(1),
  };
};

const calculateActivityTrend = (healthData) => {
  const activityData = healthData
    .filter((entry) => entry.activity && entry.activity.steps)
    .map((entry) => ({
      date: entry.date,
      steps: entry.activity.steps,
    }));

  if (activityData.length === 0) return null;

  const totalSteps = activityData.reduce((sum, entry) => sum + entry.steps, 0);
  const averageSteps = Math.round(totalSteps / activityData.length);

  return {
    data: activityData,
    totalSteps,
    averageSteps,
    daysWithData: activityData.length,
  };
};

const calculateSleepTrend = (healthData) => {
  const sleepData = healthData
    .filter((entry) => entry.activity && entry.activity.sleepHours)
    .map((entry) => ({
      date: entry.date,
      hours: entry.activity.sleepHours,
      quality: entry.activity.sleepQuality,
    }));

  if (sleepData.length === 0) return null;

  const averageHours = (
    sleepData.reduce((sum, entry) => sum + entry.hours, 0) / sleepData.length
  ).toFixed(1);
  const qualityDistribution = sleepData.reduce((acc, entry) => {
    acc[entry.quality] = (acc[entry.quality] || 0) + 1;
    return acc;
  }, {});

  return {
    data: sleepData,
    averageHours,
    qualityDistribution,
  };
};

const calculateNutritionTrend = (healthData) => {
  const nutritionData = healthData
    .filter((entry) => entry.nutrition && entry.nutrition.caloriesConsumed)
    .map((entry) => ({
      date: entry.date,
      calories: entry.nutrition.caloriesConsumed,
      protein: entry.nutrition.protein?.value || 0,
      carbs: entry.nutrition.carbohydrates?.value || 0,
      fat: entry.nutrition.fat?.value || 0,
    }));

  if (nutritionData.length === 0) return null;

  return {
    data: nutritionData,
    averageCalories: Math.round(
      nutritionData.reduce((sum, entry) => sum + entry.calories, 0) /
        nutritionData.length
    ),
    averageProtein: (
      nutritionData.reduce((sum, entry) => sum + entry.protein, 0) /
      nutritionData.length
    ).toFixed(1),
    averageCarbs: (
      nutritionData.reduce((sum, entry) => sum + entry.carbs, 0) /
      nutritionData.length
    ).toFixed(1),
    averageFat: (
      nutritionData.reduce((sum, entry) => sum + entry.fat, 0) /
      nutritionData.length
    ).toFixed(1),
  };
};

const calculateMentalHealthTrend = (healthData) => {
  const mentalHealthData = healthData
    .filter(
      (entry) =>
        entry.mentalHealth &&
        (entry.mentalHealth.mood || entry.mentalHealth.stressLevel)
    )
    .map((entry) => ({
      date: entry.date,
      mood: entry.mentalHealth.mood,
      stressLevel: entry.mentalHealth.stressLevel,
      anxietyLevel: entry.mentalHealth.anxietyLevel,
    }));

  if (mentalHealthData.length === 0) return null;

  return {
    data: mentalHealthData,
    moodDistribution: mentalHealthData.reduce((acc, entry) => {
      if (entry.mood) {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      }
      return acc;
    }, {}),
    stressDistribution: mentalHealthData.reduce((acc, entry) => {
      if (entry.stressLevel) {
        acc[entry.stressLevel] = (acc[entry.stressLevel] || 0) + 1;
      }
      return acc;
    }, {}),
  };
};

const calculateAverages = (healthData) => {
  const averages = {};

  // Weight average
  const weightEntries = healthData.filter(
    (entry) => entry.measurements?.weight?.value
  );
  if (weightEntries.length > 0) {
    averages.weight = (
      weightEntries.reduce(
        (sum, entry) => sum + entry.measurements.weight.value,
        0
      ) / weightEntries.length
    ).toFixed(1);
  }

  // Blood pressure average
  const bpEntries = healthData.filter((entry) => entry.vitals?.bloodPressure);
  if (bpEntries.length > 0) {
    averages.systolic = (
      bpEntries.reduce(
        (sum, entry) => sum + entry.vitals.bloodPressure.systolic,
        0
      ) / bpEntries.length
    ).toFixed(1);
    averages.diastolic = (
      bpEntries.reduce(
        (sum, entry) => sum + entry.vitals.bloodPressure.diastolic,
        0
      ) / bpEntries.length
    ).toFixed(1);
  }

  // Heart rate average
  const hrEntries = healthData.filter(
    (entry) => entry.vitals?.heartRate?.value
  );
  if (hrEntries.length > 0) {
    averages.heartRate = (
      hrEntries.reduce((sum, entry) => sum + entry.vitals.heartRate.value, 0) /
      hrEntries.length
    ).toFixed(1);
  }

  // Steps average
  const stepsEntries = healthData.filter((entry) => entry.activity?.steps);
  if (stepsEntries.length > 0) {
    averages.steps = Math.round(
      stepsEntries.reduce((sum, entry) => sum + entry.activity.steps, 0) /
        stepsEntries.length
    );
  }

  return averages;
};

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

  // Recent health data factor
  if (healthData.length > 0) {
    const recentData = healthData[0];
    if (recentData.vitals?.bloodPressure) {
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

module.exports = router;
