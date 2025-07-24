const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MoodTracking = sequelize.define(
  "MoodTracking",
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
    mood_level: {
      type: DataTypes.ENUM("very_happy", "happy", "neutral", "sad", "very_sad"),
      allowNull: false,
    },
    stress_level: {
      type: DataTypes.ENUM("very_low", "low", "moderate", "high", "very_high"),
      allowNull: true,
    },
    energy_level: {
      type: DataTypes.ENUM("very_low", "low", "moderate", "high", "very_high"),
      allowNull: true,
    },
    sleep_quality: {
      type: DataTypes.ENUM("poor", "fair", "good", "excellent"),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    activities: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    weather: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tracking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "mood_tracking",
    timestamps: true,
  }
);

module.exports = MoodTracking;
