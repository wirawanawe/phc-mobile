#!/usr/bin/env node

/**
 * Production Configuration Verification Script
 * Verifies that all settings are properly configured for production
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Production Configuration...\n');

// Check API configuration
console.log('📡 Checking API Configuration...');
const apiFile = path.join(__dirname, '../src/services/api.js');
const apiContent = fs.readFileSync(apiFile, 'utf8');

// Check if production URLs are forced
const hasProductionURLs = apiContent.includes('https://dash.doctorphc.id/api/mobile') &&
                         !apiContent.includes('localhost') &&
                         !apiContent.includes('10.0.2.2') &&
                         !apiContent.includes('127.0.0.1');

if (hasProductionURLs) {
    console.log('✅ API configuration: Production URLs are forced');
} else {
    console.log('❌ API configuration: Still contains development URLs');
}

// Check app.json configuration
console.log('\n📱 Checking App Configuration...');
const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const hasProductionBuild = appJson.expo.build && appJson.expo.build.production;
if (hasProductionBuild) {
    console.log('✅ App configuration: Production build profile exists');
} else {
    console.log('❌ App configuration: Missing production build profile');
}

// Check EAS configuration
console.log('\n🏗️ Checking EAS Configuration...');
const easJsonPath = path.join(__dirname, '../eas.json');
const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

const hasEASProduction = easJson.build && easJson.build.production;
if (hasEASProduction) {
    console.log('✅ EAS configuration: Production profile exists');
} else {
    console.log('❌ EAS configuration: Missing production profile');
}

// Check for development-specific configurations
console.log('\n🔧 Checking for Development Configurations...');
const devPatterns = [
  /127\.0\.0\.1/,
  /10\.0\.2\.2/,
  /__DEV__/,
  /development/
];

let devConfigFound = false;
const filesToCheck = [
    '../src/services/api.js',
    '../src/utils/networkHelper.js',
    '../src/utils/connectionTest.js'
];

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        devPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                console.log(`⚠️  Found development pattern in ${file}: ${pattern.source}`);
                devConfigFound = true;
            }
        });
    }
});

if (!devConfigFound) {
    console.log('✅ No development configurations found');
}

// Summary
console.log('\n📋 Production Configuration Summary:');
console.log('=====================================');

const checks = [
    { name: 'API URLs forced to production', status: hasProductionURLs },
    { name: 'App.json production profile', status: hasProductionBuild },
    { name: 'EAS production profile', status: hasEASProduction },
    { name: 'No development configs', status: !devConfigFound }
];

let allPassed = true;
checks.forEach(check => {
    const status = check.status ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (!check.status) allPassed = false;
});

console.log('\n' + '='.repeat(50));
if (allPassed) {
    console.log('🎉 All production configurations are properly set!');
    console.log('🚀 Ready to build for production');
} else {
    console.log('⚠️  Some configurations need attention before production build');
}

console.log('\n💡 To build for production, run:');
console.log('   ./scripts/build-production.sh');
console.log('   or');
console.log('   eas build --platform android --profile production');
