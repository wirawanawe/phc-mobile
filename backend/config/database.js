const { Sequelize } = require("sequelize");

// Database configuration
const config = {
  development: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || "phc_mobile",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD, // always send password field
    dialect: process.env.DB_DIALECT || "mysql",
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME_TEST || "phc_mobile_test",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD, // always send password field
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    host: process.env.DB_HOST_PROD || process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT_PROD || process.env.DB_PORT || 3306,
    database: process.env.DB_NAME_PROD || process.env.DB_NAME || "phc_mobile",
    username: process.env.DB_USER_PROD || process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD, // always send password field
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  },
};

// Get current environment
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};

// Sync database (create tables if they don't exist)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("✅ Database synchronized successfully.");
  } catch (error) {
    console.error("❌ Error synchronizing database:", error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
};
