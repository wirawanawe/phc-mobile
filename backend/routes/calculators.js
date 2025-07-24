const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Mock data for health calculators
const calculators = [
  {
    id: "bmi",
    name: "BMI Calculator",
    description: "Calculate your Body Mass Index to assess weight status",
    category: "body-composition",
    icon: "scale-bathroom",
    color: "#10B981",
    inputs: [
      {
        name: "weight",
        label: "Weight",
        type: "number",
        unit: "kg",
        required: true,
        min: 20,
        max: 500,
      },
      {
        name: "height",
        label: "Height",
        type: "number",
        unit: "cm",
        required: true,
        min: 50,
        max: 300,
      },
    ],
    formula: "weight / (height/100)²",
    results: [
      {
        name: "bmi",
        label: "BMI",
        unit: "",
        description: "Your Body Mass Index",
      },
      {
        name: "category",
        label: "Category",
        unit: "",
        description: "Weight status category",
      },
    ],
  },
  {
    id: "bmr",
    name: "BMR Calculator",
    description:
      "Calculate your Basal Metabolic Rate (daily calorie needs at rest)",
    category: "nutrition",
    icon: "fire",
    color: "#F59E0B",
    inputs: [
      {
        name: "age",
        label: "Age",
        type: "number",
        unit: "years",
        required: true,
        min: 10,
        max: 100,
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["male", "female"],
        required: true,
      },
      {
        name: "weight",
        label: "Weight",
        type: "number",
        unit: "kg",
        required: true,
        min: 20,
        max: 500,
      },
      {
        name: "height",
        label: "Height",
        type: "number",
        unit: "cm",
        required: true,
        min: 50,
        max: 300,
      },
    ],
    formula: "Mifflin-St Jeor Equation",
    results: [
      {
        name: "bmr",
        label: "BMR",
        unit: "calories/day",
        description: "Your Basal Metabolic Rate",
      },
      {
        name: "tdee",
        label: "TDEE",
        unit: "calories/day",
        description: "Total Daily Energy Expenditure",
      },
    ],
  },
  {
    id: "body-fat",
    name: "Body Fat Calculator",
    description:
      "Estimate your body fat percentage using skinfold measurements",
    category: "body-composition",
    icon: "human-male",
    color: "#3B82F6",
    inputs: [
      {
        name: "age",
        label: "Age",
        type: "number",
        unit: "years",
        required: true,
        min: 18,
        max: 80,
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["male", "female"],
        required: true,
      },
      {
        name: "chest",
        label: "Chest Skinfold",
        type: "number",
        unit: "mm",
        required: true,
        min: 1,
        max: 50,
      },
      {
        name: "abdomen",
        label: "Abdomen Skinfold",
        type: "number",
        unit: "mm",
        required: true,
        min: 1,
        max: 50,
      },
      {
        name: "thigh",
        label: "Thigh Skinfold",
        type: "number",
        unit: "mm",
        required: true,
        min: 1,
        max: 50,
      },
    ],
    formula: "Jackson-Pollock 3-Site Method",
    results: [
      {
        name: "bodyFat",
        label: "Body Fat %",
        unit: "%",
        description: "Estimated body fat percentage",
      },
      {
        name: "category",
        label: "Category",
        unit: "",
        description: "Body fat category",
      },
    ],
  },
  {
    id: "heart-rate",
    name: "Target Heart Rate Calculator",
    description: "Calculate your target heart rate zones for exercise",
    category: "fitness",
    icon: "heart-pulse",
    color: "#EF4444",
    inputs: [
      {
        name: "age",
        label: "Age",
        type: "number",
        unit: "years",
        required: true,
        min: 10,
        max: 100,
      },
      {
        name: "restingHeartRate",
        label: "Resting Heart Rate",
        type: "number",
        unit: "bpm",
        required: true,
        min: 40,
        max: 120,
      },
    ],
    formula: "Karvonen Formula",
    results: [
      {
        name: "maxHeartRate",
        label: "Max Heart Rate",
        unit: "bpm",
        description: "Maximum heart rate",
      },
      {
        name: "fatBurning",
        label: "Fat Burning Zone",
        unit: "bpm",
        description: "60-70% of max heart rate",
      },
      {
        name: "cardio",
        label: "Cardio Zone",
        unit: "bpm",
        description: "70-85% of max heart rate",
      },
    ],
  },
  {
    id: "water-intake",
    name: "Daily Water Intake Calculator",
    description: "Calculate your recommended daily water intake",
    category: "nutrition",
    icon: "cup-water",
    color: "#06B6D4",
    inputs: [
      {
        name: "weight",
        label: "Weight",
        type: "number",
        unit: "kg",
        required: true,
        min: 20,
        max: 500,
      },
      {
        name: "activityLevel",
        label: "Activity Level",
        type: "select",
        options: [
          "sedentary",
          "lightly_active",
          "moderately_active",
          "very_active",
          "extremely_active",
        ],
        required: true,
      },
      {
        name: "climate",
        label: "Climate",
        type: "select",
        options: ["temperate", "hot", "humid"],
        required: true,
      },
    ],
    formula: "Weight-based calculation with activity and climate factors",
    results: [
      {
        name: "waterIntake",
        label: "Daily Water Intake",
        unit: "L",
        description: "Recommended daily water intake",
      },
      {
        name: "glasses",
        label: "Glasses (250ml)",
        unit: "",
        description: "Number of 250ml glasses per day",
      },
    ],
  },
];

// @route   GET /api/calculators
// @desc    Get health calculators
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const category = req.query.category;

    let filteredCalculators = [...calculators];

    if (category) {
      filteredCalculators = filteredCalculators.filter(
        (calc) => calc.category === category
      );
    }

    // Add personalized recommendations if user is authenticated
    let recommendations = [];
    if (req.user) {
      recommendations = getPersonalizedCalculators(
        req.user,
        filteredCalculators
      );
    }

    res.json({
      success: true,
      data: {
        calculators: filteredCalculators,
        recommendations,
        categories: ["body-composition", "nutrition", "fitness", "health-risk"],
      },
    });
  } catch (error) {
    console.error("Get calculators error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/calculators/:id
// @desc    Get specific calculator
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const calculator = calculators.find((c) => c.id === req.params.id);

    if (!calculator) {
      return res.status(404).json({
        success: false,
        message: "Calculator not found",
      });
    }

    res.json({
      success: true,
      data: { calculator },
    });
  } catch (error) {
    console.error("Get calculator error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/calculators/:id/calculate
// @desc    Calculate health metrics
// @access  Public
router.post("/:id/calculate", async (req, res) => {
  try {
    const calculator = calculators.find((c) => c.id === req.params.id);

    if (!calculator) {
      return res.status(404).json({
        success: false,
        message: "Calculator not found",
      });
    }

    // Validate inputs based on calculator requirements
    const validationErrors = validateCalculatorInputs(calculator, req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    // Perform calculation
    const results = performCalculation(calculator.id, req.body);

    // Save calculation history if user is authenticated
    if (req.user) {
      // In a real app, you'd save this to database
      const calculationHistory = {
        userId: req.user._id,
        calculatorId: calculator.id,
        inputs: req.body,
        results,
        timestamp: new Date(),
      };
    }

    res.json({
      success: true,
      data: {
        calculator,
        inputs: req.body,
        results,
      },
    });
  } catch (error) {
    console.error("Calculate error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/calculators/history
// @desc    Get user's calculation history
// @access  Private
router.get("/history", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // In a real app, you'd get this from database
    const mockHistory = [
      {
        id: "1",
        calculatorId: "bmi",
        calculatorName: "BMI Calculator",
        inputs: { weight: 70, height: 170 },
        results: { bmi: 24.2, category: "Normal" },
        timestamp: new Date("2024-01-15"),
      },
      {
        id: "2",
        calculatorId: "bmr",
        calculatorName: "BMR Calculator",
        inputs: { age: 30, gender: "male", weight: 70, height: 170 },
        results: { bmr: 1650, tdee: 1980 },
        timestamp: new Date("2024-01-14"),
      },
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = mockHistory.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(mockHistory.length / limit),
          totalItems: mockHistory.length,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get calculation history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Helper functions
const validateCalculatorInputs = (calculator, inputs) => {
  const errors = [];

  calculator.inputs.forEach((input) => {
    if (input.required && !inputs[input.name]) {
      errors.push(`${input.label} is required`);
    }

    if (inputs[input.name]) {
      if (input.type === "number") {
        const value = parseFloat(inputs[input.name]);
        if (isNaN(value)) {
          errors.push(`${input.label} must be a valid number`);
        } else if (input.min && value < input.min) {
          errors.push(`${input.label} must be at least ${input.min}`);
        } else if (input.max && value > input.max) {
          errors.push(`${input.label} must be at most ${input.max}`);
        }
      } else if (
        input.type === "select" &&
        !input.options.includes(inputs[input.name])
      ) {
        errors.push(
          `${input.label} must be one of: ${input.options.join(", ")}`
        );
      }
    }
  });

  return errors;
};

const performCalculation = (calculatorId, inputs) => {
  switch (calculatorId) {
    case "bmi":
      return calculateBMI(inputs);
    case "bmr":
      return calculateBMR(inputs);
    case "body-fat":
      return calculateBodyFat(inputs);
    case "heart-rate":
      return calculateHeartRate(inputs);
    case "water-intake":
      return calculateWaterIntake(inputs);
    default:
      throw new Error("Unknown calculator");
  }
};

const calculateBMI = (inputs) => {
  const { weight, height } = inputs;
  const bmi = weight / Math.pow(height / 100, 2);

  let category;
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
  };
};

const calculateBMR = (inputs) => {
  const { age, gender, weight, height } = inputs;

  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Calculate TDEE (assuming moderate activity)
  const tdee = bmr * 1.55;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
};

const calculateBodyFat = (inputs) => {
  const { age, gender, chest, abdomen, thigh } = inputs;

  // Jackson-Pollock 3-Site Method
  const sum = chest + abdomen + thigh;
  let bodyFat;

  if (gender === "male") {
    bodyFat =
      495 /
        (1.10938 -
          0.0008267 * sum +
          0.0000016 * Math.pow(sum, 2) -
          0.0002574 * age) -
      450;
  } else {
    bodyFat =
      495 /
        (1.089733 -
          0.0009245 * sum +
          0.0000025 * Math.pow(sum, 2) -
          0.0000979 * age) -
      450;
  }

  let category;
  if (gender === "male") {
    if (bodyFat < 6) category = "Essential Fat";
    else if (bodyFat < 14) category = "Athletes";
    else if (bodyFat < 18) category = "Fitness";
    else if (bodyFat < 25) category = "Average";
    else category = "Obese";
  } else {
    if (bodyFat < 14) category = "Essential Fat";
    else if (bodyFat < 21) category = "Athletes";
    else if (bodyFat < 25) category = "Fitness";
    else if (bodyFat < 32) category = "Average";
    else category = "Obese";
  }

  return {
    bodyFat: Math.round(bodyFat * 10) / 10,
    category,
  };
};

const calculateHeartRate = (inputs) => {
  const { age, restingHeartRate } = inputs;

  const maxHeartRate = 220 - age;
  const heartRateReserve = maxHeartRate - restingHeartRate;

  const fatBurningMin = Math.round(restingHeartRate + heartRateReserve * 0.6);
  const fatBurningMax = Math.round(restingHeartRate + heartRateReserve * 0.7);
  const cardioMin = Math.round(restingHeartRate + heartRateReserve * 0.7);
  const cardioMax = Math.round(restingHeartRate + heartRateReserve * 0.85);

  return {
    maxHeartRate,
    fatBurning: `${fatBurningMin}-${fatBurningMax}`,
    cardio: `${cardioMin}-${cardioMax}`,
  };
};

const calculateWaterIntake = (inputs) => {
  const { weight, activityLevel, climate } = inputs;

  // Base calculation: 30ml per kg of body weight
  let baseIntake = weight * 0.03;

  // Activity level multiplier
  const activityMultipliers = {
    sedentary: 1.0,
    lightly_active: 1.1,
    moderately_active: 1.2,
    very_active: 1.3,
    extremely_active: 1.4,
  };

  baseIntake *= activityMultipliers[activityLevel];

  // Climate multiplier
  const climateMultipliers = {
    temperate: 1.0,
    hot: 1.2,
    humid: 1.1,
  };

  baseIntake *= climateMultipliers[climate];

  const glasses = Math.round(baseIntake * 4); // 250ml per glass

  return {
    waterIntake: Math.round(baseIntake * 10) / 10,
    glasses,
  };
};

const getPersonalizedCalculators = (user, calculators) => {
  let recommendations = [];

  // Based on health goals
  if (user.healthGoals && user.healthGoals.length > 0) {
    const goals = user.healthGoals.map((goal) => goal.goal.toLowerCase());

    if (goals.some((goal) => goal.includes("weight"))) {
      recommendations.push(
        ...calculators.filter((calc) => calc.id === "bmi" || calc.id === "bmr")
      );
    }

    if (goals.some((goal) => goal.includes("fitness"))) {
      recommendations.push(
        ...calculators.filter(
          (calc) => calc.id === "heart-rate" || calc.id === "body-fat"
        )
      );
    }
  }

  // Based on activity level
  if (user.activityLevel === "sedentary") {
    recommendations.push(calculators.find((calc) => calc.id === "bmr"));
  } else if (
    user.activityLevel === "very_active" ||
    user.activityLevel === "extremely_active"
  ) {
    recommendations.push(calculators.find((calc) => calc.id === "heart-rate"));
  }

  // Remove duplicates and limit to 3 recommendations
  const uniqueRecommendations = recommendations.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  return uniqueRecommendations.slice(0, 3);
};

module.exports = router;
