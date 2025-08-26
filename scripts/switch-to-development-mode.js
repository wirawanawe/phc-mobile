import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration to switch to development mode
const developmentConfig = {
  // API URLs
  apiBaseUrl: 'http://localhost:3000/api/mobile',
  serverUrl: 'localhost',
  
  // Database configuration
  dbHost: 'localhost',
  dbPort: 3306,
  dbName: 'phc_dashboard',
  dbUser: 'root',
  dbPassword: ''
};

// Files to update
const filesToUpdate = [
  {
    path: '../src/services/api.js',
    changes: [
      {
        search: /const getServerURL = \(\) => \{[\s\S]*?return ".*?";[\s\S]*?\};/,
        replace: `const getServerURL = () => {
  // Development mode - localhost
  console.log('🔧 Development mode: Using localhost server');
  return "localhost";
};`
      },
      {
        search: /const getBestApiUrl = async \(\) => \{[\s\S]*?return '.*?';[\s\S]*?\};/,
        replace: `const getBestApiUrl = async () => {
  // Development mode - localhost
  console.log('🔧 Development mode: Using local development API');
  return 'http://localhost:3000/api/mobile';
};`
      }
    ]
  },
  {
    path: '../dash-app/lib/db.js',
    changes: [
      {
        search: /host: process\.env\.DB_HOST \|\| ".*?"/,
        replace: `host: process.env.DB_HOST || "localhost"`
      }
    ]
  }
];

async function updateFile(filePath, changes) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;
    
    for (const change of changes) {
      if (change.search.test(content)) {
        content = content.replace(change.search, change.replace);
        updated = true;
        console.log(`   ✅ Updated: ${filePath}`);
      } else {
        console.log(`   ⚠️  Pattern not found: ${filePath}`);
      }
    }
    
    if (updated) {
      fs.writeFileSync(fullPath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

async function switchToDevelopmentMode() {
  console.log('🔧 Switching to Development Mode...\n');
  
  let updatedFiles = 0;
  
  for (const file of filesToUpdate) {
    console.log(`📝 Updating ${file.path}...`);
    const success = await updateFile(file.path, file.changes);
    if (success) {
      updatedFiles++;
    }
  }
  
  console.log(`\n✅ Development mode switch completed!`);
  console.log(`📊 Files updated: ${updatedFiles}/${filesToUpdate.length}`);
  
  console.log('\n🔧 Development Configuration:');
  console.log(`   API Base URL: ${developmentConfig.apiBaseUrl}`);
  console.log(`   Server URL: ${developmentConfig.serverUrl}`);
  console.log(`   Database Host: ${developmentConfig.dbHost}`);
  console.log(`   Database Port: ${developmentConfig.dbPort}`);
  
  console.log('\n📱 Next Steps:');
  console.log('   1. Start local development server: npm run dev (in dash-app)');
  console.log('   2. Ensure local database is running');
  console.log('   3. Test mobile app connection');
  console.log('   4. Check if meal tables exist in local database');
  
  console.log('\n⚠️  Important Notes:');
  console.log('   - Make sure localhost:3000 is accessible');
  console.log('   - Ensure local database has required tables');
  console.log('   - Check firewall settings if connection fails');
}

// Run the script
switchToDevelopmentMode().catch(console.error);
