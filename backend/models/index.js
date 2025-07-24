const User = require("./User");
const HealthData = require("./HealthData");
const Assessment = require("./Assessment");
const Clinic = require("./Clinic");
const Service = require("./Service");
const Doctor = require("./Doctor");
const Booking = require("./Booking");
const MoodTracking = require("./MoodTracking");
const WaterTracking = require("./WaterTracking");
const SleepTracking = require("./SleepTracking");
const MealLogging = require("./MealLogging");
const Mission = require("./Mission");
const UserMission = require("./UserMission");

// Define associations
User.hasMany(HealthData, {
  foreignKey: "user_id",
  as: "healthData",
  onDelete: "CASCADE",
});

HealthData.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(Assessment, {
  foreignKey: "user_id",
  as: "assessments",
  onDelete: "CASCADE",
});

Assessment.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Clinic associations
Clinic.hasMany(Service, {
  foreignKey: "clinic_id",
  as: "services",
  onDelete: "CASCADE",
});

Service.belongsTo(Clinic, {
  foreignKey: "clinic_id",
  as: "clinic",
});

Clinic.hasMany(Doctor, {
  foreignKey: "clinic_id",
  as: "doctors",
  onDelete: "CASCADE",
});

Doctor.belongsTo(Clinic, {
  foreignKey: "clinic_id",
  as: "clinic",
});

Service.hasMany(Doctor, {
  foreignKey: "service_id",
  as: "doctors",
  onDelete: "CASCADE",
});

Doctor.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

// Booking associations
User.hasMany(Booking, {
  foreignKey: "user_id",
  as: "bookings",
  onDelete: "CASCADE",
});

Booking.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Clinic.hasMany(Booking, {
  foreignKey: "clinic_id",
  as: "bookings",
  onDelete: "CASCADE",
});

Booking.belongsTo(Clinic, {
  foreignKey: "clinic_id",
  as: "clinic",
});

Service.hasMany(Booking, {
  foreignKey: "service_id",
  as: "bookings",
  onDelete: "CASCADE",
});

Booking.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

Doctor.hasMany(Booking, {
  foreignKey: "doctor_id",
  as: "bookings",
  onDelete: "CASCADE",
});

Booking.belongsTo(Doctor, {
  foreignKey: "doctor_id",
  as: "doctor",
});

// Tracking associations
User.hasMany(MoodTracking, {
  foreignKey: "user_id",
  as: "moodTracking",
  onDelete: "CASCADE",
});

MoodTracking.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(WaterTracking, {
  foreignKey: "user_id",
  as: "waterTracking",
  onDelete: "CASCADE",
});

WaterTracking.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(SleepTracking, {
  foreignKey: "user_id",
  as: "sleepTracking",
  onDelete: "CASCADE",
});

SleepTracking.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(MealLogging, {
  foreignKey: "user_id",
  as: "mealLogging",
  onDelete: "CASCADE",
});

MealLogging.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Mission associations
User.hasMany(UserMission, {
  foreignKey: "user_id",
  as: "userMissions",
  onDelete: "CASCADE",
});

UserMission.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Mission.hasMany(UserMission, {
  foreignKey: "mission_id",
  as: "userMissions",
  onDelete: "CASCADE",
});

UserMission.belongsTo(Mission, {
  foreignKey: "mission_id",
  as: "mission",
});

module.exports = {
  User,
  HealthData,
  Assessment,
  Clinic,
  Service,
  Doctor,
  Booking,
  MoodTracking,
  WaterTracking,
  SleepTracking,
  MealLogging,
  Mission,
  UserMission,
};
