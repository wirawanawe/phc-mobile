const { SignJWT } = require('jose');

async function generateTestToken() {
  try {
    const secret = new TextEncoder().encode('supersecretkey123456789supersecretkey');
    
    const token = await new SignJWT({
      userId: 1, // Using the first user from the database
      name: 'Super Admin',
      email: 'superadmin@phc.com',
      role: 'SUPERADMIN'
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
    
    console.log('🔑 Generated test JWT token:');
    console.log(token);
    console.log('\n📋 You can use this token to test the wellness activities complete endpoint:');
    console.log(`curl -X POST http://localhost:3000/api/mobile/wellness/activities/complete \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -d '{"activity_id": 15, "duration": 30, "notes": "Test completion"}'`);
    
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
  }
}

generateTestToken(); 