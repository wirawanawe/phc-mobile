const express = require("express");
const router = express.Router();
const {
  MoodTracking,
  WaterTracking,
  SleepTracking,
  MealLogging,
} = require("../models");
const { protect } = require("../middleware/auth");
const { Op } = require("sequelize");

// ===== MOOD TRACKING =====

// Create mood tracking entry
router.post("/mood", protect, async (req, res) => {
  try {
    const {
      mood_level,
      stress_level,
      energy_level,
      sleep_quality,
      notes,
      activities,
      weather,
      location,
      tracking_date,
    } = req.body;

    const moodEntry = await MoodTracking.create({
      user_id: req.user.id,
      mood_level,
      stress_level,
      energy_level,
      sleep_quality,
      notes,
      activities,
      weather,
      location,
      tracking_date: tracking_date || new Date().toISOString().split("T")[0],
    });

    res.status(201).json({
      success: true,
      data: moodEntry,
    });
  } catch (error) {
    console.error("Error creating mood entry:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's mood tracking history
router.get("/mood", protect, async (req, res) => {
  try {
    const { start_date, end_date, limit = 30 } = req.query;

    const whereClause = { user_id: req.user.id };
    if (start_date && end_date) {
      whereClause.tracking_date = {
        [Op.between]: [start_date, end_date],
      };
    }

    const moodEntries = await MoodTracking.findAll({
      where: whereClause,
      order: [["tracking_date", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: moodEntries,
    });
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ===== WATER TRACKING =====

// Create water tracking entry
router.post("/water", protect, async (req, res) => {
  try {
    const { amount_ml, daily_goal_ml, notes, tracking_date } = req.body;

    const waterEntry = await WaterTracking.create({
      user_id: req.user.id,
      amount_ml,
      daily_goal_ml: daily_goal_ml || 2000,
      notes,
      tracking_date: tracking_date || new Date().toISOString().split("T")[0],
    });

    res.status(201).json({
      success: true,
      data: waterEntry,
    });
  } catch (error) {
    console.error("Error creating water entry:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's water tracking history
router.get("/water", protect, async (req, res) => {
  try {
    const { start_date, end_date, limit = 30 } = req.query;

    const whereClause = { user_id: req.user.id };
    if (start_date && end_date) {
      whereClause.tracking_date = {
        [Op.between]: [start_date, end_date],
      };
    }

    const waterEntries = await WaterTracking.findAll({
      where: whereClause,
      order: [["tracking_date", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: waterEntries,
    });
  } catch (error) {
    console.error("Error fetching water entries:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get today's water intake
router.get("/water/today", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const waterEntry = await WaterTracking.findOne({
      where: {
        user_id: req.user.id,
        tracking_date: today,
      },
    });

    res.json({
      success: true,
      data: waterEntry || { amount_ml: 0, daily_goal_ml: 2000 },
    });
  } catch (error) {
    console.error("Error fetching today's water intake:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ===== SLEEP TRACKING =====

// Create sleep tracking entry
router.post("/sleep", protect, async (req, res) => {
  try {
    const {
      sleep_date,
      bedtime,
      wake_time,
      total_sleep_hours,
      sleep_quality,
      deep_sleep_hours,
      rem_sleep_hours,
      light_sleep_hours,
      sleep_efficiency,
      sleep_latency,
      wake_count,
      notes,
      factors,
    } = req.body;

    const sleepEntry = await SleepTracking.create({
      user_id: req.user.id,
      sleep_date: sleep_date || new Date().toISOString().split("T")[0],
      bedtime,
      wake_time,
      total_sleep_hours,
      sleep_quality,
      deep_sleep_hours,
      rem_sleep_hours,
      light_sleep_hours,
      sleep_efficiency,
      sleep_latency,
      wake_count,
      notes,
      factors,
    });

    res.status(201).json({
      success: true,
      data: sleepEntry,
    });
  } catch (error) {
    console.error("Error creating sleep entry:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's sleep tracking history
router.get("/sleep", protect, async (req, res) => {
  try {
    const { start_date, end_date, limit = 30 } = req.query;

    const whereClause = { user_id: req.user.id };
    if (start_date && end_date) {
      whereClause.sleep_date = {
        [Op.between]: [start_date, end_date],
      };
    }

    const sleepEntries = await SleepTracking.findAll({
      where: whereClause,
      order: [["sleep_date", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: sleepEntries,
    });
  } catch (error) {
    console.error("Error fetching sleep entries:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ===== MEAL LOGGING =====

// Create meal logging entry
router.post("/meal", protect, async (req, res) => {
  try {
    const {
      meal_type,
      meal_name,
      food_items,
      total_calories,
      total_protein,
      total_carbs,
      total_fat,
      total_fiber,
      total_sugar,
      total_sodium,
      meal_date,
      meal_time,
      notes,
      image_url,
      barcode,
    } = req.body;

    const mealEntry = await MealLogging.create({
      user_id: req.user.id,
      meal_type,
      meal_name,
      food_items,
      total_calories,
      total_protein,
      total_carbs,
      total_fat,
      total_fiber,
      total_sugar,
      total_sodium,
      meal_date: meal_date || new Date().toISOString().split("T")[0],
      meal_time: meal_time || new Date().toTimeString().split(" ")[0],
      notes,
      image_url,
      barcode,
    });

    res.status(201).json({
      success: true,
      data: mealEntry,
    });
  } catch (error) {
    console.error("Error creating meal entry:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's meal logging history
router.get("/meal", protect, async (req, res) => {
  try {
    const { start_date, end_date, meal_type, limit = 30 } = req.query;

    const whereClause = { user_id: req.user.id };
    if (start_date && end_date) {
      whereClause.meal_date = {
        [Op.between]: [start_date, end_date],
      };
    }
    if (meal_type) {
      whereClause.meal_type = meal_type;
    }

    const mealEntries = await MealLogging.findAll({
      where: whereClause,
      order: [
        ["meal_date", "DESC"],
        ["meal_time", "DESC"],
      ],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: mealEntries,
    });
  } catch (error) {
    console.error("Error fetching meal entries:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get today's nutrition summary
router.get("/meal/today", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const todayMeals = await MealLogging.findAll({
      where: {
        user_id: req.user.id,
        meal_date: today,
      },
      order: [["meal_time", "ASC"]],
    });

    // Calculate totals
    const totals = todayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.total_calories,
        protein: acc.protein + parseFloat(meal.total_protein),
        carbs: acc.carbs + parseFloat(meal.total_carbs),
        fat: acc.fat + parseFloat(meal.total_fat),
        fiber: acc.fiber + parseFloat(meal.total_fiber),
        sugar: acc.sugar + parseFloat(meal.total_sugar),
        sodium: acc.sodium + parseFloat(meal.total_sodium),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );

    res.json({
      success: true,
      data: {
        meals: todayMeals,
        totals,
      },
    });
  } catch (error) {
    console.error("Error fetching today's meals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
