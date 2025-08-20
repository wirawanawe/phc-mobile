const fs = require('fs');
const path = require('path');

function setupEnvironment() {
  try {
    console.log('🔧 Setting up environment variables...\n');
    
    const envPath = path.join(__dirname, '../dash-app/.env.local');
    const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=pr1k1t1w
DB_NAME=phc_dashboard
DB_PORT=3306

# JWT Secret
JWT_SECRET=supersecretkey123456789supersecretkey123456789

# Application Configuration
NODE_ENV=development
PORT=3000

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
`;

    // Check if file exists
    if (fs.existsSync(envPath)) {
      console.log('✅ .env.local file already exists');
      
      // Read current content
      const currentContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if JWT_SECRET is set
      if (currentContent.includes('JWT_SECRET=')) {
        console.log('✅ JWT_SECRET is already configured');
      } else {
        console.log('⚠️ JWT_SECRET not found, updating file...');
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env.local file updated with JWT_SECRET');
      }
    } else {
      console.log('📝 Creating .env.local file...');
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env.local file created successfully');
    }

    // Also create .env file as backup
    const envBackupPath = path.join(__dirname, '../dash-app/.env');
    if (!fs.existsSync(envBackupPath)) {
      console.log('📝 Creating .env backup file...');
      fs.writeFileSync(envBackupPath, envContent);
      console.log('✅ .env backup file created');
    }

    console.log('\n🎉 Environment setup completed!');
    console.log('📋 Next steps:');
    console.log('   1. Restart the backend server');
    console.log('   2. Test the login endpoint');
    
  } catch (error) {
    console.error('❌ Error setting up environment:', error);
  }
}

// Run the setup
setupEnvironment();
