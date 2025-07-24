// Server configuration
const config = {
  port: process.env.PORT || 5432,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5432",
  apiVersion: process.env.API_VERSION || "v1",
};

module.exports = config;
