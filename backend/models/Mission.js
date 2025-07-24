const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Mission = sequelize.define(
  "Mission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Judul misi",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Deskripsi detail misi",
    },
    category: {
      type: DataTypes.ENUM(
        "health_tracking",
        "nutrition",
        "fitness",
        "mental_health",
        "education",
        "consultation",
        "daily_habit"
      ),
      allowNull: false,
      comment: "Kategori misi",
    },
    type: {
      type: DataTypes.ENUM("daily", "weekly", "monthly", "one_time"),
      allowNull: false,
      comment: "Tipe misi (harian, mingguan, bulanan, atau sekali)",
    },
    target_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Target nilai yang harus dicapai",
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Satuan target (misal: gelas, jam, kali, dll)",
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: "Poin yang didapat jika misi selesai",
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Icon untuk misi",
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      comment: "Warna misi dalam format hex",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Status aktif misi",
    },
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"),
      allowNull: false,
      defaultValue: "easy",
      comment: "Tingkat kesulitan misi",
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Persyaratan khusus untuk misi (opsional)",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Tanggal mulai misi tersedia",
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Tanggal berakhir misi",
    },
  },
  {
    tableName: "missions",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Mission;
