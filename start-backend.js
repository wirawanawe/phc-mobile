#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting PHC Mobile Backend...");
console.log("📁 Navigating to backend directory...");

// Change to backend directory
process.chdir(path.join(__dirname, "backend"));

// Start the server
const server = spawn("node", ["start-with-env.js"], {
  stdio: "inherit",
  shell: true,
});

// Handle server exit
server.on("close", (code) => {
  console.log(`\n❌ Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down backend server...");
  server.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down backend server...");
  server.kill("SIGTERM");
});
