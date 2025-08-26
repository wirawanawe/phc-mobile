#!/usr/bin/env node

/**
 * Verify Production Configuration Script
 * Checks all configuration files to ensure they're set to production mode
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILES = [
  { path: 'src/services/api.js', name: 'API Service' },
  { path: 'src/utils/quickFix.js', name: 'Quick Fix' },
  { path: 'src/utils/networkHelper.js', name: 'Network Helper' },
  { path: 'src/utils/networkStatus.js', name: 'Network Status' },
  { path: 'src/utils/networkTest.js', name: 'Network Test' },
  { path: 'src/utils/connectionMonitor.js', name: 'Connection Monitor' },
  { path: 'src/utils/connectionTester.js', name: 'Connection Tester' },
  { path: 'src/utils/testConnection.js', name: 'Test Connection' },
  { path: 'src/utils/networkDiagnostics.js', name: 'Network Diagnostics' },
  { path: 'src/utils/loginDiagnostic.js', name: 'Login Diagnostic' },
  { path: 'src/utils/networkDiagnostic.js', name: 'Network Diagnostic' }
];

function checkFile(fileInfo) {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', fileInfo.path), 'utf8');
    
    const hasProduction = content.includes('https://dash.doctorphc.id');
    const hasLocalhost = content.includes('localhost:3000');
    const hasLocalIP = content.includes('192.168.193.150:3000') || content.includes('10.0.2.2:3000');
    const hasDevCheck = content.includes('__DEV__');
    
    return {
      file: fileInfo.name,
      hasProduction,
      hasLocalhost,
      hasLocalIP,
      hasDevCheck,
      status: hasProduction && !hasLocalhost && !hasLocalIP ? '✅ Production' : '❌ Mixed/Development'
    };
  } catch (error) {
    return {
      file: fileInfo.name,
      error: error.message,
      status: '❌ Error reading file'
    };
  }
}

function main() {
  console.log('🔍 Verifying Production Configuration...\n');
  
  const results = CONFIG_FILES.map(checkFile);
  
  console.log('📋 Configuration Status:\n');
  
  let allCorrect = true;
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.file}: ${result.error}`);
      allCorrect = false;
    } else {
      console.log(`${result.status === '✅ Production' ? '✅' : '❌'} ${result.file}: ${result.status}`);
      
      if (result.status !== '✅ Production') {
        allCorrect = false;
        if (result.hasLocalhost) console.log(`   ⚠️  Contains localhost:3000`);
        if (result.hasLocalIP) console.log(`   ⚠️  Contains local IP`);
        if (result.hasDevCheck) console.log(`   ⚠️  Contains __DEV__ checks`);
      }
    }
  });
  
  console.log('\n📊 Summary:');
  
  const correctCount = results.filter(r => r.status === '✅ Production').length;
  const totalCount = results.length;
  
  console.log(`✅ Correctly configured: ${correctCount}/${totalCount}`);
  console.log(`❌ Needs attention: ${totalCount - correctCount}/${totalCount}`);
  
  if (allCorrect) {
    console.log('\n🎉 All configuration files are properly set to production mode!');
    console.log('🌐 Production server: https://dash.doctorphc.id');
    console.log('📱 API endpoint: https://dash.doctorphc.id/api/mobile');
  } else {
    console.log('\n⚠️  Some files still need to be updated to production mode.');
    console.log('💡 Run the following commands to fix:');
    console.log('   node scripts/switch-to-production.js');
  }
  
  console.log('\n💡 Available commands:');
  console.log('   node scripts/check-current-config.js - Check current configuration');
  console.log('   node scripts/test-production-connection.js - Test production connection');
  console.log('   node scripts/switch-to-production.js - Switch to production mode');
  console.log('   node scripts/switch-to-development.js - Switch to development mode');
}

main();
