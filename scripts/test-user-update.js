async function testUserUpdate() {
  const userId = 23;
  const baseUrl = 'http://localhost:3000';
  
  console.log(`🧪 Testing user update for ID: ${userId}`);
  
  // Test case 1: Valid data
  const validData = {
    name: "Test User",
    email: "test@example.com",
    role: "STAFF",
    is_active: true,
    clinic_id: null
  };
  
  console.log("📤 Request data:", JSON.stringify(validData, null, 2));
  
  try {
    // Dynamic import for fetch
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validData)
    });
    
    console.log("📡 Response status:", response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Test successful!");
      console.log("📄 Response:", JSON.stringify(result, null, 2));
    } else {
      const error = await response.json();
      console.log("❌ Test failed!");
      console.log("📄 Error:", JSON.stringify(error, null, 2));
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
  
  // Test case 2: Missing name
  console.log("\n🧪 Testing with missing name...");
  const invalidData1 = {
    email: "test@example.com",
    role: "STAFF"
  };
  
  try {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData1)
    });
    
    console.log("📡 Response status:", response.status);
    const result = await response.json();
    console.log("📄 Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
  
  // Test case 3: Missing email
  console.log("\n🧪 Testing with missing email...");
  const invalidData2 = {
    name: "Test User",
    role: "STAFF"
  };
  
  try {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData2)
    });
    
    console.log("📡 Response status:", response.status);
    const result = await response.json();
    console.log("📄 Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
  
  // Test case 4: Empty strings
  console.log("\n🧪 Testing with empty strings...");
  const invalidData3 = {
    name: "",
    email: "",
    role: "STAFF"
  };
  
  try {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData3)
    });
    
    console.log("📡 Response status:", response.status);
    const result = await response.json();
    console.log("📄 Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

testUserUpdate().catch(console.error);
