const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SleepTracking = sequelize.define(
  "SleepTracking",
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
    sleep_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    bedtime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    wake_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    total_sleep_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
    },
    sleep_quality: {
      type: DataTypes.ENUM("poor", "fair", "good", "excellent"),
      allowNull: true,
    },
    deep_sleep_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    rem_sleep_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    light_sleep_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    sleep_efficiency: {
      type: DataTypes.DECIMAL(5, 2), // percentage
      allowNull: true,
    },
    sleep_latency: {
      type: DataTypes.INTEGER, // minutes to fall asleep
      allowNull: true,
    },
    wake_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    factors: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        caffeine: false,
        exercise: false,
        stress: false,
        noise: false,
        light: false,
        temperature: false,
      },
    },
  },
  {
    tableName: "sleep_tracking",
    timestamps: true,
  }
);

module.exports = SleepTracking;
