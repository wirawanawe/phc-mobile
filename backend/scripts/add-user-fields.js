const { Sequelize } = require("sequelize");

// Database configuration
const sequelize = new Sequelize("phc_mobile", "root", "pr1k1t1w", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: console.log,
});

async function addUserFields() {
  try {
    console.log("🔧 Testing database connection...");
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    console.log("🔧 Adding new user fields to users table...");

    // Add new user fields to users table
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN ktp_number VARCHAR(16) NULL,
      ADD COLUMN address TEXT NULL,
      ADD COLUMN insurance_type ENUM('umum', 'bpjs', 'swasta') DEFAULT 'umum'
    `);

    console.log("✅ New user fields added successfully!");

    // Update existing users to have default values
    await sequelize.query(`
      UPDATE users 
      SET insurance_type = 'umum'
      WHERE insurance_type IS NULL
    `);

    console.log("✅ Default values set for existing users!");
  } catch (error) {
    console.error("❌ Error adding user fields:", error);
  } finally {
    await sequelize.close();
  }
}

addUserFields();
