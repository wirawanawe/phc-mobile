const BASE_URL = 'http://localhost:3000';

async function testUserCreation() {
  console.log('🧪 Testing User Creation API...\n');

  // Test 1: Valid user creation
  console.log('1. Testing valid user creation...');
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'staff'
      }),
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    
    if (response.ok) {
      console.log('   ✅ Valid user creation successful\n');
    } else {
      console.log('   ❌ Valid user creation failed\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  // Test 2: Missing required fields
  console.log('2. Testing missing required fields...');
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '',
        email: '',
        password: ''
      }),
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    
    if (response.status === 400) {
      console.log('   ✅ Missing fields validation working\n');
    } else {
      console.log('   ❌ Missing fields validation failed\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  // Test 3: Invalid email format
  console.log('3. Testing invalid email format...');
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        role: 'staff'
      }),
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    
    if (response.status === 400) {
      console.log('   ✅ Email validation working\n');
    } else {
      console.log('   ❌ Email validation failed\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  // Test 4: Password too short
  console.log('4. Testing password too short...');
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test2@example.com',
        password: '123',
        role: 'staff'
      }),
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    
    if (response.status === 400) {
      console.log('   ✅ Password validation working\n');
    } else {
      console.log('   ❌ Password validation failed\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  // Test 5: Duplicate user
  console.log('5. Testing duplicate user...');
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'staff'
      }),
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    
    if (response.status === 400) {
      console.log('   ✅ Duplicate user validation working\n');
    } else {
      console.log('   ❌ Duplicate user validation failed\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  console.log('🏁 Testing completed!');
}

// Run the test
testUserCreation().catch(console.error);
