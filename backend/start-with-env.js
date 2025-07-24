// Set environment variables
process.env.PORT = 5432;
process.env.NODE_ENV = "development";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = 3306;
process.env.DB_NAME = "phc_mobile";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "pr1k1t1w";
process.env.DB_DIALECT = "mysql";
process.env.JWT_SECRET = "your-super-secret-jwt-key-here";
process.env.JWT_EXPIRE = "30d";

// Start the server
require("./server.js");
