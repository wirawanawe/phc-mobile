const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import database configuration
const { testConnection, syncDatabase } = require("./config/database");
// Import models and associations
require("./models/index");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const healthRoutes = require("./routes/health");
const assessmentRoutes = require("./routes/assessments");
const educationRoutes = require("./routes/education");
const fitnessRoutes = require("./routes/fitness");
const wellnessRoutes = require("./routes/wellness");
const consultationRoutes = require("./routes/consultations");
const newsRoutes = require("./routes/news");
const calculatorRoutes = require("./routes/calculators");
const clinicRoutes = require("./routes/clinics");
const bookingRoutes = require("./routes/bookings");
const trackingRoutes = require("./routes/tracking");
const missionRoutes = require("./routes/missions");
const adminRoutes = require("./routes/admin");

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for development
  })
);
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:3000",
      "http://localhost:8081", // React Native Metro bundler
      "http://localhost:19006", // Expo development server
      "exp://localhost:19000", // Expo Go
      "http://192.168.1.100:8081", // Common local IP for mobile testing
      "http://10.0.2.2:8081", // Android emulator
      "http://10.0.3.2:8081", // Genymotion
      "http://localhost:5432", // Backend port
      "http://10.0.2.2:5432", // Android emulator to backend
      "http://192.168.1.100:5432", // Physical device to backend
      "http://10.242.250.62:5432", // Your computer's IP
      "*", // Allow all origins for development
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static files
app.use("/uploads", express.static("uploads"));
app.use("/admin", express.static("public"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "PHC Mobile API is running",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "v1",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/fitness", fitnessRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/calculators", calculatorRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database (create tables if they don't exist)
    await syncDatabase();

    // Start server
    const PORT = process.env.PORT || 5432;
    const server = app.listen(PORT, () => {
      console.log(`🚀 PHC Mobile Backend running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🗄️  Database: MySQL connected successfully`);
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} is already in use. Please try a different port.`
        );
        console.log(`💡 Try: PORT=${PORT + 1} npm run dev`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
