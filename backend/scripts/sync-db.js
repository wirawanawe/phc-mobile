require("dotenv").config();
const { sequelize } = require("../config/database");
const {
  User,
  Clinic,
  Service,
  Doctor,
  Booking,
  MoodTracking,
  WaterTracking,
  SleepTracking,
  MealLogging,
} = require("../models");

const syncDatabase = async () => {
  try {
    console.log("🗄️  Syncing database tables...");

    // Sync all models
    await sequelize.sync({ force: true });

    console.log("✅ Database tables synced successfully!");
    console.log("📋 Tables created:");
    console.log("  - users");
    console.log("  - clinics");
    console.log("  - services");
    console.log("  - doctors");
    console.log("  - bookings");
    console.log("  - mood_tracking");
    console.log("  - water_tracking");
    console.log("  - sleep_tracking");
    console.log("  - meal_logging");

    console.log("\n🎉 Database sync completed!");
    console.log("📋 Next steps:");
    console.log("1. Run: npm run seed:clinics (to populate with clinic data)");
    console.log("2. Run: npm run dev (to start the server)");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  } finally {
    await sequelize.close();
  }
};

syncDatabase();
