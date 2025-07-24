const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserMission = sequelize.define(
  "UserMission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID user yang mengambil misi",
    },
    mission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID misi yang diambil",
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "failed", "expired"),
      allowNull: false,
      defaultValue: "active",
      comment: "Status misi user",
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Progress saat ini (0 sampai target_value)",
    },
    current_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Nilai saat ini yang sudah dicapai",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Tanggal mulai misi",
    },
    completed_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Tanggal selesai misi",
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Tanggal deadline misi",
    },
    points_earned: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Poin yang didapat setelah selesai",
    },
    streak_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Jumlah streak berhasil",
    },
    last_completed_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Tanggal terakhir berhasil menyelesaikan",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Catatan tambahan",
    },
  },
  {
    tableName: "user_missions",
    timestamps: true,
    underscored: true,
  }
);

module.exports = UserMission;
