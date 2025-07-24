const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "doctor"),
      allowNull: false,
      defaultValue: "user",
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 50,
        max: 300,
      },
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 20,
        max: 500,
      },
    },
    activity_level: {
      type: DataTypes.ENUM(
        "sedentary",
        "lightly_active",
        "moderately_active",
        "very_active",
        "extremely_active"
      ),
      allowNull: true,
      defaultValue: "moderately_active",
    },
    health_goals: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    medical_history: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        conditions: [],
        medications: [],
        allergies: [],
      },
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        notifications: true,
        privacy: "private",
        language: "en",
      },
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    streak_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    insurance_provider: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    insurance_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    has_insurance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ktp_number: {
      type: DataTypes.STRING(16),
      allowNull: true,
      validate: {
        len: [16, 16],
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    insurance_type: {
      type: DataTypes.ENUM("umum", "bpjs", "swasta"),
      allowNull: false,
      defaultValue: "umum",
    },
  },
  {
    tableName: "users",
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getAge = function () {
  if (!this.date_of_birth) return null;
  const today = new Date();
  const birthDate = new Date(this.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

User.prototype.updatePoints = async function (points) {
  this.points += points;
  await this.save();
  return this.points;
};

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.reset_password_token;
  delete values.reset_password_expires;
  return values;
};

module.exports = User;
