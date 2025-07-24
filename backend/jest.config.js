module.exports = {
  // Test environment
  testEnvironment: "node",

  // Test file patterns
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "routes/**/*.js",
    "models/**/*.js",
    "middleware/**/*.js",
    "utils/**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/scripts/**",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Module file extensions
  moduleFileExtensions: ["js", "json"],

  // Transform configuration
  transform: {},

  // Ignore patterns
  testPathIgnorePatterns: ["/node_modules/", "/coverage/", "/scripts/"],

  // Environment variables for tests
  setupFiles: ["<rootDir>/tests/env.js"],
};
