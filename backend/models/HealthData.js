const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const HealthData = sequelize.define(
  "HealthData",
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // Vital Signs
    blood_pressure_systolic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 50,
        max: 300,
      },
    },
    blood_pressure_diastolic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 30,
        max: 200,
      },
    },
    heart_rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 30,
        max: 250,
      },
    },
    temperature: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      validate: {
        min: 30.0,
        max: 45.0,
      },
    },
    oxygen_saturation: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 70,
        max: 100,
      },
    },
    // Body Measurements
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 20,
        max: 500,
      },
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 50,
        max: 300,
      },
    },
    bmi: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      validate: {
        min: 10,
        max: 100,
      },
    },
    body_fat: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      validate: {
        min: 2,
        max: 50,
      },
    },
    // Sleep Data
    sleep_duration: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 0,
        max: 24,
      },
    },
    sleep_quality: {
      type: DataTypes.ENUM("poor", "fair", "good", "excellent"),
      allowNull: true,
    },
    deep_sleep: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 0,
        max: 8,
      },
    },
    rem_sleep: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 0,
        max: 4,
      },
    },
    // Activity Data
    steps: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100000,
      },
    },
    calories_burned: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 10000,
      },
    },
    active_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 1440,
      },
    },
    exercise_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 1440,
      },
    },
    // Custom Metrics (stored as JSON)
    custom_metrics: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    // Notes
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "health_data",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id", "date"],
      },
      {
        fields: ["date"],
      },
    ],
  }
);

// Instance methods
HealthData.prototype.calculateBMI = function () {
  if (!this.height || !this.weight) return null;
  const heightInMeters = this.height / 100;
  return parseFloat(
    (this.weight / (heightInMeters * heightInMeters)).toFixed(2)
  );
};

HealthData.prototype.getBMICategory = function () {
  const bmi = this.bmi || this.calculateBMI();
  if (!bmi) return null;

  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
};

HealthData.prototype.getBloodPressureCategory = function () {
  if (!this.blood_pressure_systolic || !this.blood_pressure_diastolic)
    return null;

  const systolic = this.blood_pressure_systolic;
  const diastolic = this.blood_pressure_diastolic;

  if (systolic < 90 || diastolic < 60) return "low";
  if (systolic < 120 && diastolic < 80) return "normal";
  if (systolic < 130 && diastolic < 80) return "elevated";
  if (systolic < 140 || diastolic < 90) return "high_stage1";
  return "high_stage2";
};

module.exports = HealthData;
