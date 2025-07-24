const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User } = require("../models");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { name, email, password, phone, dateOfBirth, gender } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        phone,
        date_of_birth: dateOfBirth,
        gender,
      });

      // Generate token
      const token = generateToken(user.id);

      // Create user response object without password
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during registration",
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Update last login date
      user.last_login = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user.id);

      // Create user response object without password
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    // User data is already available from middleware
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create user response object without password
    const userResponse = req.user.toJSON();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile information
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const {
      name,
      phone,
      date_of_birth,
      gender,
      height,
      weight,
      ktp_number,
      address,
      insurance_type,
      insurance_provider,
      insurance_number,
    } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user information
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
    if (gender !== undefined) updateData.gender = gender;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (ktp_number !== undefined) updateData.ktp_number = ktp_number;
    if (address !== undefined) updateData.address = address;
    if (insurance_type !== undefined)
      updateData.insurance_type = insurance_type;

    // Handle insurance information based on type
    if (insurance_type === "umum") {
      updateData.has_insurance = false;
      updateData.insurance_provider = null;
      updateData.insurance_number = null;
    } else if (insurance_type === "bpjs" || insurance_type === "swasta") {
      updateData.has_insurance = true;
      if (insurance_provider !== undefined)
        updateData.insurance_provider = insurance_provider;
      if (insurance_number !== undefined)
        updateData.insurance_number = insurance_number;
    }

    await user.update(updateData);

    // Create user response object without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/auth/insurance
// @desc    Update user insurance information
// @access  Private
router.put("/insurance", async (req, res) => {
  try {
    const { has_insurance, insurance_provider, insurance_number } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update insurance information
    await user.update({
      has_insurance: has_insurance || false,
      insurance_provider: insurance_provider || null,
      insurance_number: insurance_number || null,
    });

    // Create user response object without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Insurance information updated successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Update insurance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
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

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Save reset token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
      await user.save();

      // TODO: Send email with reset link
      // For now, just return the token (in production, send via email)
      res.json({
        success: true,
        message: "Password reset email sent",
        data: {
          resetToken:
            process.env.NODE_ENV === "development" ? resetToken : undefined,
        },
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
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

      const { token, password } = req.body;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findOne({
        _id: decoded.userId,
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      // Update password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.name === "JsonWebTokenError") {
        return res.status(400).json({
          success: false,
          message: "Invalid reset token",
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    // For now, just return success
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
