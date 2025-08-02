const { SignJWT } = require('jose');

async function generateJoseToken() {
  try {
    const payload = {
      userId: 5,
      id: 5,
      name: "Mobile Test User",
      email: "test@mobile.com",
      role: "MOBILE_USER"
    };

    const secret = new TextEncoder().encode('supersecretkey123456789supersecretkey123456789');
    
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    console.log('Generated JOSE JWT token:');
    console.log(token);
    
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
  }
}

generateJoseToken(); 