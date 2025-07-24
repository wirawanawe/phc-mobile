const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Assessment = sequelize.define(
  "Assessment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM(
        "health_risk",
        "fitness",
        "nutrition",
        "mental_health",
        "sleep",
        "custom"
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    result: {
      type: DataTypes.ENUM(
        "low_risk",
        "moderate_risk",
        "high_risk",
        "excellent",
        "good",
        "fair",
        "poor"
      ),
      allowNull: true,
    },
    recommendations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    estimated_duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "1.0",
    },
  },
  {
    tableName: "assessments",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id", "type"],
      },
      {
        fields: ["type", "is_completed"],
      },
      {
        fields: ["completed_at"],
      },
    ],
  }
);

// Instance methods
Assessment.prototype.calculateScore = function () {
  if (!this.answers || this.answers.length === 0) return null;

  let totalScore = 0;
  let maxScore = 0;

  this.questions.forEach((question, index) => {
    const answer = this.answers[index];
    if (answer && question.options) {
      const selectedOption = question.options.find(
        (opt) => opt.value === answer
      );
      if (selectedOption) {
        totalScore += selectedOption.score || 0;
      }
      maxScore += Math.max(...question.options.map((opt) => opt.score || 0));
    }
  });

  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};

Assessment.prototype.getResult = function () {
  const score = this.score || this.calculateScore();
  if (score === null) return null;

  switch (this.type) {
    case "health_risk":
      if (score < 30) return "low_risk";
      if (score < 70) return "moderate_risk";
      return "high_risk";

    case "fitness":
    case "nutrition":
      if (score >= 80) return "excellent";
      if (score >= 60) return "good";
      if (score >= 40) return "fair";
      return "poor";

    case "mental_health":
      if (score < 30) return "low_risk";
      if (score < 70) return "moderate_risk";
      return "high_risk";

    default:
      if (score >= 80) return "excellent";
      if (score >= 60) return "good";
      if (score >= 40) return "fair";
      return "poor";
  }
};

Assessment.prototype.generateRecommendations = function () {
  const result = this.result || this.getResult();
  const recommendations = [];

  switch (this.type) {
    case "health_risk":
      if (result === "high_risk") {
        recommendations.push(
          "Schedule a consultation with your healthcare provider",
          "Monitor your vital signs regularly",
          "Consider lifestyle modifications"
        );
      } else if (result === "moderate_risk") {
        recommendations.push(
          "Regular health check-ups recommended",
          "Maintain healthy lifestyle habits",
          "Monitor for any changes in symptoms"
        );
      } else {
        recommendations.push(
          "Continue maintaining healthy habits",
          "Regular preventive care recommended",
          "Stay active and eat well"
        );
      }
      break;

    case "fitness":
      if (result === "poor" || result === "fair") {
        recommendations.push(
          "Start with low-impact exercises",
          "Gradually increase activity level",
          "Consider working with a fitness trainer"
        );
      } else {
        recommendations.push(
          "Maintain current fitness routine",
          "Try new activities to challenge yourself",
          "Focus on recovery and rest days"
        );
      }
      break;

    case "nutrition":
      if (result === "poor" || result === "fair") {
        recommendations.push(
          "Consult with a nutritionist",
          "Focus on balanced meals",
          "Track your food intake"
        );
      } else {
        recommendations.push(
          "Maintain healthy eating habits",
          "Continue variety in your diet",
          "Stay hydrated"
        );
      }
      break;
  }

  return recommendations;
};

Assessment.prototype.complete = async function () {
  this.score = this.calculateScore();
  this.result = this.getResult();
  this.recommendations = this.generateRecommendations();
  this.is_completed = true;
  this.completed_at = new Date();
  await this.save();
  return this;
};

module.exports = Assessment;
