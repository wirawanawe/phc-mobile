const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("../models/User");
const HealthData = require("../models/HealthData");
const Assessment = require("../models/Assessment");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/phc_mobile",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Reset database function
const resetDatabase = async () => {
  try {
    console.log("🗑️  Starting database reset...");

    // Connect to database
    await connectDB();

    // Clear all collections
    console.log("\n🧹 Clearing collections...");

    const userCount = await User.countDocuments();
    const healthDataCount = await HealthData.countDocuments();
    const assessmentCount = await Assessment.countDocuments();

    await User.deleteMany({});
    await HealthData.deleteMany({});
    await Assessment.deleteMany({});

    console.log(`👥 Deleted ${userCount} users`);
    console.log(`📊 Deleted ${healthDataCount} health data entries`);
    console.log(`📋 Deleted ${assessmentCount} assessments`);

    console.log("\n✅ Database reset completed successfully!");
    console.log('💡 Run "npm run db:seed" to populate with sample data');
  } catch (error) {
    console.error("❌ Database reset failed:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run reset if this file is executed directly
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };
