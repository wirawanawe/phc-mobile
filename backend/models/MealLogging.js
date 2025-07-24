const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MealLogging = sequelize.define(
  "MealLogging",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    meal_type: {
      type: DataTypes.ENUM("breakfast", "lunch", "dinner", "snack"),
      allowNull: false,
    },
    meal_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    food_items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    total_calories: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_protein: {
      type: DataTypes.DECIMAL(6, 2), // grams
      allowNull: false,
      defaultValue: 0,
    },
    total_carbs: {
      type: DataTypes.DECIMAL(6, 2), // grams
      allowNull: false,
      defaultValue: 0,
    },
    total_fat: {
      type: DataTypes.DECIMAL(6, 2), // grams
      allowNull: false,
      defaultValue: 0,
    },
    total_fiber: {
      type: DataTypes.DECIMAL(6, 2), // grams
      allowNull: false,
      defaultValue: 0,
    },
    total_sugar: {
      type: DataTypes.DECIMAL(6, 2), // grams
      allowNull: false,
      defaultValue: 0,
    },
    total_sodium: {
      type: DataTypes.DECIMAL(8, 2), // mg
      allowNull: false,
      defaultValue: 0,
    },
    meal_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    meal_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "meal_logging",
    timestamps: true,
  }
);

module.exports = MealLogging;
