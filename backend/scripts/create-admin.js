require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");
const User = require("../models/User");

async function createAdminUser() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@phc.com" },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists. Updating password...");

      // Update password
      const hashedPassword = await bcrypt.hash("password", 10);
      await existingAdmin.update({
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Admin user password updated successfully.");
      console.log("📧 Email: admin@phc.com");
      console.log("🔑 Password: password");
      console.log("👤 Role: admin");
    } else {
      console.log("🔄 Creating new admin user...");

      // Create new admin user
      const hashedPassword = await bcrypt.hash("password", 10);
      const adminUser = await User.create({
        name: "Admin User",
        email: "admin@phc.com",
        password: hashedPassword,
        role: "admin",
        phone: "081234567890",
        date_of_birth: "1990-01-01",
        gender: "male",
        points: 0,
      });

      console.log("✅ Admin user created successfully!");
      console.log("📧 Email: admin@phc.com");
      console.log("🔑 Password: password");
      console.log("👤 Role: admin");
      console.log("🆔 User ID:", adminUser.id);
    }

    // Verify the user was created/updated
    const adminUser = await User.findOne({
      where: { email: "admin@phc.com" },
      attributes: ["id", "name", "email", "role", "created_at"],
    });

    console.log("\n📋 Admin User Details:");
    console.log(JSON.stringify(adminUser.toJSON(), null, 2));
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
createAdminUser();
