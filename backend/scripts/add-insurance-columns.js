const { Sequelize } = require("sequelize");

// Database configuration
const sequelize = new Sequelize("phc_mobile", "root", "pr1k1t1w", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: console.log,
});

async function addInsuranceColumns() {
  try {
    console.log("🔧 Testing database connection...");
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    console.log("🔧 Adding insurance columns to users table...");

    // Add insurance columns to users table
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN insurance_provider VARCHAR(100) NULL,
      ADD COLUMN insurance_number VARCHAR(50) NULL,
      ADD COLUMN has_insurance BOOLEAN NOT NULL DEFAULT FALSE
    `);

    console.log("✅ Insurance columns added successfully!");

    // Update some users to have insurance for testing
    await sequelize.query(`
      UPDATE users 
      SET has_insurance = TRUE, 
          insurance_provider = 'BPJS Kesehatan',
          insurance_number = CONCAT('BPJS-', LPAD(id, 8, '0'))
      WHERE id IN (1, 2, 3)
    `);

    console.log("✅ Sample insurance data added for testing!");
  } catch (error) {
    console.error("❌ Error adding insurance columns:", error);
  } finally {
    await sequelize.close();
  }
}

addInsuranceColumns();
