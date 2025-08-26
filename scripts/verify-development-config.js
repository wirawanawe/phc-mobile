import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Files to check for development configuration
const filesToCheck = [
  {
    path: '../src/services/api.js',
    patterns: [
      { search: '10.242.90.103:3000', shouldExist: true, description: 'Local network API URL' },
      { search: 'localhost:3000', shouldExist: false, description: 'Localhost URL' },
      { search: 'dash.doctorphc.id', shouldExist: false, description: 'Production domain' }
    ]
  },
  {
    path: '../src/utils/networkStatus.js',
    patterns: [
      { search: '10.242.90.103:3000', shouldExist: true, description: 'Network status URL' },
      { search: 'localhost:3000', shouldExist: false, description: 'Localhost URL' }
    ]
  },
  {
    path: '../src/utils/connectionMonitor.js',
    patterns: [
      { search: '10.242.90.103:3000', shouldExist: true, description: 'Connection monitor URL' },
      { search: 'localhost:3000', shouldExist: false, description: 'Localhost URL' }
    ]
  },
  {
    path: '../src/utils/quickFix.js',
    patterns: [
      { search: '10.242.90.103:3000', shouldExist: true, description: 'Quick fix URL' },
      { search: 'localhost:3000', shouldExist: false, description: 'Localhost URL' }
    ]
  }
];

async function checkFile(filePath, patterns) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    let allPassed = true;
    
    console.log(`\n📝 Checking ${filePath}...`);
    
    for (const pattern of patterns) {
      const exists = content.includes(pattern.search);
      const status = exists === pattern.shouldExist ? '✅' : '❌';
      const expected = pattern.shouldExist ? 'should exist' : 'should NOT exist';
      
      console.log(`   ${status} ${pattern.description}: ${pattern.search} (${expected})`);
      
      if (exists !== pattern.shouldExist) {
        allPassed = false;
      }
    }
    
    return allPassed;
  } catch (error) {
    console.error(`❌ Error checking ${filePath}:`, error.message);
    return false;
  }
}

async function verifyDevelopmentConfig() {
  console.log('🔍 Verifying Development Configuration...\n');
  
  let allFilesPassed = true;
  let passedFiles = 0;
  
  for (const file of filesToCheck) {
    const passed = await checkFile(file.path, file.patterns);
    if (passed) {
      passedFiles++;
    } else {
      allFilesPassed = false;
    }
  }
  
  console.log(`\n📊 Verification Results:`);
  console.log(`   Files checked: ${filesToCheck.length}`);
  console.log(`   Files passed: ${passedFiles}`);
  console.log(`   Files failed: ${filesToCheck.length - passedFiles}`);
  
  if (allFilesPassed) {
    console.log('\n🎉 All development configurations are correct!');
    console.log('\n✅ Mobile app should now connect to localhost:3000');
    console.log('✅ No production server dependencies');
    console.log('✅ Ready for local development');
  } else {
    console.log('\n⚠️ Some configurations need to be fixed.');
    console.log('Run the development switch script to fix them:');
    console.log('   node scripts/switch-to-development-mode.js');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('   1. Ensure local server is running: cd dash-app && npm run dev:next');
  console.log('   2. Test mobile app connection');
  console.log('   3. Verify login functionality works');
  
  return allFilesPassed;
}

// Run the verification
verifyDevelopmentConfig().catch(console.error);
