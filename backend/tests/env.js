// Set test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = 5001;
process.env.MONGODB_URI = "mongodb://localhost:27017/phc_mobile_test";
process.env.JWT_SECRET = "test_jwt_secret_key";
process.env.JWT_EXPIRE = "1h";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.API_VERSION = "v1";
