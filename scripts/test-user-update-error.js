async function testUserUpdateError() {
  const userId = 23;
  const baseUrl = 'http://localhost:3000';
  
  console.log(`🧪 Testing user update error scenarios for ID: ${userId}`);
  
  // Test case 1: Empty name and email (simulating form submission with empty fields)
  console.log("\n🧪 Test 1: Empty name and email...");
  const emptyData = {
    name: "",
    email: "",
    role: "STAFF",
    is_active: true,
    clinic_id: null
  };
  
  try {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emptyData)
    });
    
    console.log("📡 Response status:", response.status);
    const result = await response.json();
    console.log("📄 Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
  
  // Test case 2: Undefined name and email
  console.log("\n🧪 Test 2: Undefined name and email...");
  const undefinedData = {
    role: "STAFF",
    is_active: true,
    clinic_id: null
  };
  
  try {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(undefinedData)
    });
    
    console.log("📡 Response status:", response.status);
    const result = await response.json();
    console.log("📄 Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
  
  // Test case 3: Whitespace-only name and email
  console.log("\n🧪 Test 3: Whitespace-only name and email...");
  const whitespaceData = {
    name: "   ",
    email: "   ",
    role: "STAFF",
    is_active: true,
    clinic_id: null
  };
  
  try {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whitespaceData)
    });
    
    console.log("📡 Response status:", response.status);
    const result = await response.json();
    console.log("📄 Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
  
  // Test case 4: Null name and email
  console.log("\n🧪 Test 4: Null name and email...");
  const nullData = {
    name: null,
    email: null,
    role: "STAFF",
    is_active: true,
    clinic_id: null
  };
  
  try {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nullData)
    });
    
    console.log("📡 Response status:", response.status);
    const result = await response.json();
    console.log("📄 Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

testUserUpdateError().catch(console.error);
