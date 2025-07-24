const mongoose = require("mongoose");

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
