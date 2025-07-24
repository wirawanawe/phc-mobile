const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const WaterTracking = sequelize.define(
  "WaterTracking",
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
    amount_ml: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    daily_goal_ml: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2000,
    },
    tracking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reminder_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    reminder_interval: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false,
      defaultValue: 60,
    },
  },
  {
    tableName: "water_tracking",
    timestamps: true,
  }
);

module.exports = WaterTracking;
