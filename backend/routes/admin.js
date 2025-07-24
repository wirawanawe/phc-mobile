const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const { Op } = require("sequelize"); // Added Op import

// Import models
const User = require("../models/User");
const Clinic = require("../models/Clinic");
const Doctor = require("../models/Doctor");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Assessment = require("../models/Assessment");
const HealthData = require("../models/HealthData");
const MealLogging = require("../models/MealLogging");
const SleepTracking = require("../models/SleepTracking");
const WaterTracking = require("../models/WaterTracking");
const MoodTracking = require("../models/MoodTracking");

// Admin middleware - check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-super-secret-jwt-key-here"
    );

    // Get user from database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

// Dashboard statistics
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const stats = {
      users: await User.count(),
      clinics: await Clinic.count(),
      doctors: await Doctor.count(),
      bookings: await Booking.count(),
      assessments: await Assessment.count(),
      healthData: await HealthData.count(),
      mealLogs: await MealLogging.count(),
      sleepLogs: await SleepTracking.count(),
      waterLogs: await WaterTracking.count(),
      moodLogs: await MoodTracking.count(),
    };

    // Recent activities
    const recentUsers = await User.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: ["id", "name", "email", "createdAt"],
    });

    const recentBookings = await Booking.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [
        { model: User, as: "user", attributes: ["name", "email"] },
        { model: Clinic, as: "clinic", attributes: ["name"] },
      ],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: {
        stats,
        recentUsers,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create admin user (for development only)
router.post("/create-admin", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@phc.com" },
    });

    if (existingAdmin) {
      // Update password
      const hashedPassword = await bcrypt.hash("password", 10);
      await existingAdmin.update({
        password: hashedPassword,
        role: "admin",
      });

      return res.json({
        success: true,
        message: "Admin user password updated successfully",
        data: {
          email: "admin@phc.com",
          password: "password",
          role: "admin",
        },
      });
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash("password", 10);
      const adminUser = await User.create({
        name: "Admin User",
        email: "admin@phc.com",
        password: hashedPassword,
        role: "admin",
        phone: "081234567890",
        date_of_birth: "1990-01-01",
        gender: "male",
        points: 0,
      });

      return res.json({
        success: true,
        message: "Admin user created successfully",
        data: {
          id: adminUser.id,
          email: "admin@phc.com",
          password: "password",
          role: "admin",
        },
      });
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== USERS CRUD ====================
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(users.count / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.set("Cache-Control", "no-store");
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put(
  "/users/:id",
  adminAuth,
  [
    body("name").optional().isLength({ min: 2 }),
    body("email").optional().isEmail(),
    body("role").optional().isIn(["user", "admin", "doctor"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      await user.update(req.body);
      res.set("Cache-Control", "no-store");
      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.destroy();
    res.set("Cache-Control", "no-store");
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== CLINICS CRUD ====================
router.get("/clinics", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { address: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const clinics = await Clinic.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [{ model: Doctor, as: "doctors", attributes: ["id", "name"] }],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: clinics.rows,
      pagination: {
        total: clinics.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(clinics.count / limit),
      },
    });
  } catch (error) {
    console.error("Get clinics error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/clinics/:id", adminAuth, async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id, {
      include: [{ model: Doctor, as: "doctors", attributes: ["id", "name"] }],
    });

    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });
    }

    res.set("Cache-Control", "no-store");
    res.json({ success: true, data: clinic });
  } catch (error) {
    console.error("Get clinic error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post(
  "/clinics",
  adminAuth,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const clinic = await Clinic.create(req.body);
      res.set("Cache-Control", "no-store");
      res.status(201).json({ success: true, data: clinic });
    } catch (error) {
      console.error("Create clinic error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

router.put(
  "/clinics/:id",
  adminAuth,
  [
    body("name").optional().notEmpty(),
    body("address").optional().notEmpty(),
    body("phone").optional().notEmpty(),
    body("email").optional().isEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const clinic = await Clinic.findByPk(req.params.id);
      if (!clinic) {
        return res
          .status(404)
          .json({ success: false, message: "Clinic not found" });
      }

      await clinic.update(req.body);
      res.set("Cache-Control", "no-store");
      res.json({ success: true, data: clinic });
    } catch (error) {
      console.error("Update clinic error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

router.delete("/clinics/:id", adminAuth, async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });
    }

    await clinic.destroy();
    res.set("Cache-Control", "no-store");
    res.json({ success: true, message: "Clinic deleted successfully" });
  } catch (error) {
    console.error("Delete clinic error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== DOCTORS CRUD ====================
router.get("/doctors", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { specialization: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const doctors = await Doctor.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [{ model: Clinic, as: "clinic", attributes: ["id", "name"] }],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: doctors.rows,
      pagination: {
        total: doctors.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(doctors.count / limit),
      },
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/doctors/:id", adminAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: Clinic, as: "clinic", attributes: ["id", "name"] }],
    });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.set("Cache-Control", "no-store");
    res.json({ success: true, data: doctor });
  } catch (error) {
    console.error("Get doctor error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post(
  "/doctors",
  adminAuth,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("specialization").notEmpty().withMessage("Specialization is required"),
    body("clinicId").isInt().withMessage("Valid clinic ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const doctor = await Doctor.create(req.body);
      res.set("Cache-Control", "no-store");
      res.status(201).json({ success: true, data: doctor });
    } catch (error) {
      console.error("Create doctor error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

router.put(
  "/doctors/:id",
  adminAuth,
  [
    body("name").optional().notEmpty(),
    body("specialization").optional().notEmpty(),
    body("clinicId").optional().isInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const doctor = await Doctor.findByPk(req.params.id);
      if (!doctor) {
        return res
          .status(404)
          .json({ success: false, message: "Doctor not found" });
      }

      await doctor.update(req.body);
      res.set("Cache-Control", "no-store");
      res.json({ success: true, data: doctor });
    } catch (error) {
      console.error("Update doctor error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

router.delete("/doctors/:id", adminAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    await doctor.destroy();
    res.set("Cache-Control", "no-store");
    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== BOOKINGS CRUD ====================
router.get("/bookings", adminAuth, async (req, res) => {
  try {
    const { status = "" } = req.query;
    const whereClause = status ? { status } : {};

    const bookings = await Booking.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Clinic, as: "clinic", attributes: ["id", "name"] },
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id", "name", "specialization"],
        },
      ],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put(
  "/bookings/:id",
  adminAuth,
  [
    body("status")
      .isIn(["pending", "confirmed", "cancelled", "completed"])
      .withMessage("Valid status is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const booking = await Booking.findByPk(req.params.id);
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }

      await booking.update(req.body);
      res.set("Cache-Control", "no-store");
      res.json({ success: true, data: booking });
    } catch (error) {
      console.error("Update booking error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ==================== ASSESSMENTS CRUD ====================
router.get("/assessments", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const assessments = await Assessment.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: assessments.rows,
      pagination: {
        total: assessments.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(assessments.count / limit),
      },
    });
  } catch (error) {
    console.error("Get assessments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== TRACKING DATA CRUD ====================
router.get("/tracking/meals", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = userId ? { userId } : {};

    const meals = await MealLogging.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: meals.rows,
      pagination: {
        total: meals.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(meals.count / limit),
      },
    });
  } catch (error) {
    console.error("Get meals error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/tracking/sleep", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = userId ? { userId } : {};

    const sleep = await SleepTracking.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: sleep.rows,
      pagination: {
        total: sleep.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(sleep.count / limit),
      },
    });
  } catch (error) {
    console.error("Get sleep error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/tracking/water", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = userId ? { userId } : {};

    const water = await WaterTracking.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: water.rows,
      pagination: {
        total: water.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(water.count / limit),
      },
    });
  } catch (error) {
    console.error("Get water error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/tracking/mood", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = userId ? { userId } : {};

    const mood = await MoodTracking.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    });

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: mood.rows,
      pagination: {
        total: mood.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(mood.count / limit),
      },
    });
  } catch (error) {
    console.error("Get mood error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
