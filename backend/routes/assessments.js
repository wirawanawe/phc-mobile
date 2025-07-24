const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");
const Assessment = require("../models/Assessment");
const User = require("../models/User");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route   POST /api/assessments
// @desc    Create a new assessment
// @access  Private
router.post(
  "/",
  [
    body("type")
      .isIn([
        "health_risk",
        "nutrition",
        "fitness",
        "mental_health",
        "lifestyle",
        "custom",
      ])
      .withMessage("Invalid assessment type"),
    body("title")
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be between 3 and 200 characters"),
    body("questions")
      .isArray({ min: 1 })
      .withMessage("At least one question is required"),
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

      const assessment = new Assessment({
        userId: req.user._id,
        ...req.body,
      });

      await assessment.save();

      res.status(201).json({
        success: true,
        message: "Assessment created successfully",
        data: { assessment },
      });
    } catch (error) {
      console.error("Create assessment error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/assessments
// @desc    Get user assessments with filtering
// @access  Private
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const status = req.query.status;

    const filter = { userId: req.user._id };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const assessments = await Assessment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Assessment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        assessments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get assessments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/assessments/:id
// @desc    Get specific assessment
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    res.json({
      success: true,
      data: { assessment },
    });
  } catch (error) {
    console.error("Get assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/assessments/:id
// @desc    Update assessment answers
// @access  Private
router.put(
  "/:id",
  [body("questions").isArray().withMessage("Questions must be an array")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const assessment = await Assessment.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: "Assessment not found",
        });
      }

      // Update questions with answers
      assessment.questions = req.body.questions;

      // Mark as completed if all questions are answered
      const answeredQuestions = assessment.questions.filter(
        (q) => q.answer !== undefined && q.answer !== null
      );
      if (answeredQuestions.length === assessment.questions.length) {
        assessment.status = "completed";
        assessment.completedAt = new Date();
      }

      await assessment.save();

      // Calculate results
      const results = assessment.calculateResults();
      const insights = assessment.getInsights();

      // Award points for completing assessment
      if (assessment.status === "completed") {
        await req.user.updatePoints(50);
      }

      res.json({
        success: true,
        message: "Assessment updated successfully",
        data: {
          assessment,
          results,
          insights,
        },
      });
    } catch (error) {
      console.error("Update assessment error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   DELETE /api/assessments/:id
// @desc    Delete assessment
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    res.json({
      success: true,
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assessment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/assessments/:id/results
// @desc    Get assessment results and insights
// @access  Private
router.get("/:id/results", async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    const results = assessment.calculateResults();
    const insights = assessment.getInsights();

    res.json({
      success: true,
      data: {
        assessment,
        results,
        insights,
      },
    });
  } catch (error) {
    console.error("Get assessment results error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/assessments/templates
// @desc    Get assessment templates
// @access  Private
router.get("/templates", async (req, res) => {
  try {
    const templates = [
      {
        id: "health_risk_1",
        type: "health_risk",
        title: "General Health Risk Assessment",
        description:
          "Comprehensive health risk assessment covering various health factors",
        estimatedDuration: 15,
        questions: [
          {
            questionId: "age",
            question: "What is your age?",
            type: "number",
            required: true,
          },
          {
            questionId: "gender",
            question: "What is your gender?",
            type: "single_choice",
            required: true,
            options: [
              { value: "male", label: "Male", points: 0 },
              { value: "female", label: "Female", points: 0 },
              { value: "other", label: "Other", points: 0 },
            ],
          },
          {
            questionId: "smoking",
            question: "Do you smoke?",
            type: "single_choice",
            required: true,
            options: [
              { value: "never", label: "Never smoked", points: 10 },
              { value: "former", label: "Former smoker", points: 5 },
              { value: "current", label: "Current smoker", points: 0 },
            ],
          },
          {
            questionId: "exercise",
            question: "How often do you exercise?",
            type: "single_choice",
            required: true,
            options: [
              { value: "never", label: "Never", points: 0 },
              { value: "rarely", label: "Rarely (1-2 times/month)", points: 2 },
              {
                value: "sometimes",
                label: "Sometimes (1-2 times/week)",
                points: 5,
              },
              {
                value: "regular",
                label: "Regularly (3-5 times/week)",
                points: 8,
              },
              { value: "daily", label: "Daily", points: 10 },
            ],
          },
          {
            questionId: "diet",
            question: "How would you rate your diet?",
            type: "single_choice",
            required: true,
            options: [
              {
                value: "poor",
                label: "Poor (mostly processed foods)",
                points: 0,
              },
              { value: "fair", label: "Fair (some healthy foods)", points: 3 },
              {
                value: "good",
                label: "Good (mostly healthy foods)",
                points: 7,
              },
              {
                value: "excellent",
                label: "Excellent (balanced and nutritious)",
                points: 10,
              },
            ],
          },
          {
            questionId: "stress",
            question: "How would you rate your stress level?",
            type: "single_choice",
            required: true,
            options: [
              { value: "low", label: "Low stress", points: 10 },
              { value: "moderate", label: "Moderate stress", points: 5 },
              { value: "high", label: "High stress", points: 2 },
              { value: "very_high", label: "Very high stress", points: 0 },
            ],
          },
          {
            questionId: "sleep",
            question: "How many hours do you sleep on average?",
            type: "single_choice",
            required: true,
            options: [
              { value: "less_than_6", label: "Less than 6 hours", points: 0 },
              { value: "6_to_7", label: "6-7 hours", points: 5 },
              { value: "7_to_8", label: "7-8 hours", points: 10 },
              { value: "more_than_8", label: "More than 8 hours", points: 7 },
            ],
          },
        ],
      },
      {
        id: "nutrition_1",
        type: "nutrition",
        title: "Nutrition Assessment",
        description:
          "Assess your current eating habits and nutritional knowledge",
        estimatedDuration: 10,
        questions: [
          {
            questionId: "meals_per_day",
            question: "How many meals do you eat per day?",
            type: "single_choice",
            required: true,
            options: [
              { value: "1", label: "1 meal", points: 0 },
              { value: "2", label: "2 meals", points: 3 },
              { value: "3", label: "3 meals", points: 7 },
              { value: "4_plus", label: "4+ meals", points: 5 },
            ],
          },
          {
            questionId: "vegetables",
            question: "How many servings of vegetables do you eat daily?",
            type: "single_choice",
            required: true,
            options: [
              { value: "0", label: "0 servings", points: 0 },
              { value: "1", label: "1 serving", points: 2 },
              { value: "2_3", label: "2-3 servings", points: 5 },
              { value: "4_plus", label: "4+ servings", points: 10 },
            ],
          },
          {
            questionId: "water",
            question: "How much water do you drink daily?",
            type: "single_choice",
            required: true,
            options: [
              { value: "less_than_4", label: "Less than 4 glasses", points: 0 },
              { value: "4_to_6", label: "4-6 glasses", points: 5 },
              { value: "6_to_8", label: "6-8 glasses", points: 8 },
              {
                value: "more_than_8",
                label: "More than 8 glasses",
                points: 10,
              },
            ],
          },
        ],
      },
    ];

    res.json({
      success: true,
      data: { templates },
    });
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/assessments/from-template
// @desc    Create assessment from template
// @access  Private
router.post(
  "/from-template",
  [body("templateId").notEmpty().withMessage("Template ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { templateId } = req.body;

      // Find template (in a real app, this would come from a database)
      const templates = [
        {
          id: "health_risk_1",
          type: "health_risk",
          title: "General Health Risk Assessment",
          description:
            "Comprehensive health risk assessment covering various health factors",
          estimatedDuration: 15,
          questions: [
            // ... template questions would be here
          ],
        },
      ];

      const template = templates.find((t) => t.id === templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      const assessment = new Assessment({
        userId: req.user._id,
        type: template.type,
        title: template.title,
        description: template.description,
        questions: template.questions,
        estimatedDuration: template.estimatedDuration,
      });

      await assessment.save();

      res.status(201).json({
        success: true,
        message: "Assessment created from template successfully",
        data: { assessment },
      });
    } catch (error) {
      console.error("Create from template error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;
