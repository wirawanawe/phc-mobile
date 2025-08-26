#!/usr/bin/env node

/**
 * Switch to Production Mode Script
 * Switches the app back to use production server
 * Usage: node scripts/switch-to-production.js
 */

const fs = require('fs');
const path = require('path');

const API_FILE_PATH = path.join(__dirname, '..', 'src', 'services', 'api.js');
const QUICK_FIX_PATH = path.join(__dirname, '..', 'src', 'utils', 'quickFix.js');
const NETWORK_HELPER_PATH = path.join(__dirname, '..', 'src', 'utils', 'networkHelper.js');
const NETWORK_STATUS_PATH = path.join(__dirname, '..', 'src', 'utils', 'networkStatus.js');
const NETWORK_TEST_PATH = path.join(__dirname, '..', 'src', 'utils', 'networkTest.js');

function updateApiFile() {
  try {
    let content = fs.readFileSync(API_FILE_PATH, 'utf8');
    
    // Update getServerURL function
    content = content.replace(
      /const getServerURL = \(\) => \{[\s\S]*?\};/,
      `const getServerURL = () => {
  // Force production server for all environments
  return "dash.doctorphc.id";
};`
    );
    
    // Update getApiBaseUrl function
    content = content.replace(
      /const getApiBaseUrl = \(\) => \{[\s\S]*?\};/,
      `const getApiBaseUrl = () => {
  // Force production server for all environments
  console.log('🚀 Production mode: Using production API');
  return "https://dash.doctorphc.id/api/mobile";
};`
    );
    
    // Update getBestApiUrl function
    content = content.replace(
      /const getBestApiUrl = async \(\) => \{[\s\S]*?\};/,
      `const getBestApiUrl = async () => {
  // Force production server for all environments
  console.log('🚀 Production mode: Using production API');
  return 'https://dash.doctorphc.id/api/mobile';
};`
    );
    
    fs.writeFileSync(API_FILE_PATH, content);
    console.log('✅ Updated src/services/api.js');
  } catch (error) {
    console.error('❌ Error updating api.js:', error.message);
  }
}

function updateQuickFixFile() {
  try {
    let content = fs.readFileSync(QUICK_FIX_PATH, 'utf8');
    
    content = content.replace(
      /export const getQuickApiUrl = \(\) => \{[\s\S]*?\};/,
      `export const getQuickApiUrl = () => {
  // Force production server for all environments
  console.log('🚀 Production mode: Using production API');
  return 'https://dash.doctorphc.id/api/mobile';
};`
    );
    
    fs.writeFileSync(QUICK_FIX_PATH, content);
    console.log('✅ Updated src/utils/quickFix.js');
  } catch (error) {
    console.error('❌ Error updating quickFix.js:', error.message);
  }
}

function updateNetworkHelperFile() {
  try {
    let content = fs.readFileSync(NETWORK_HELPER_PATH, 'utf8');
    
    // Update findBestServer function
    content = content.replace(
      /static async findBestServer\(\) \{[\s\S]*?const servers = \[[\s\S]*?\];/,
      `static async findBestServer() {
    const servers = [
      'https://dash.doctorphc.id' // Production server (primary)
    ];`
    );
    
    // Update getDefaultURL function
    content = content.replace(
      /static getDefaultURL\(\) \{[\s\S]*?\}/,
      `static getDefaultURL() {
    // Use production server for all environments
    return 'https://dash.doctorphc.id/api/mobile';
  }`
    );
    
    fs.writeFileSync(NETWORK_HELPER_PATH, content);
    console.log('✅ Updated src/utils/networkHelper.js');
  } catch (error) {
    console.error('❌ Error updating networkHelper.js:', error.message);
  }
}

function updateNetworkStatusFile() {
  try {
    let content = fs.readFileSync(NETWORK_STATUS_PATH, 'utf8');
    
    content = content.replace(
      /export const getRecommendedApiUrl = async \(\) => \{[\s\S]*?\};/,
      `export const getRecommendedApiUrl = async () => {
  // Force production server for all environments
  return 'https://dash.doctorphc.id/api/mobile';
};`
    );
    
    fs.writeFileSync(NETWORK_STATUS_PATH, content);
    console.log('✅ Updated src/utils/networkStatus.js');
  } catch (error) {
    console.error('❌ Error updating networkStatus.js:', error.message);
  }
}

function updateNetworkTestFile() {
  try {
    let content = fs.readFileSync(NETWORK_TEST_PATH, 'utf8');
    
    content = content.replace(
      /export const getBestEndpoint = async \(\) => \{[\s\S]*?\};/,
      `export const getBestEndpoint = async () => {
  // Force production server for all environments
  return 'https://dash.doctorphc.id/api/mobile';
};`
    );
    
    fs.writeFileSync(NETWORK_TEST_PATH, content);
    console.log('✅ Updated src/utils/networkTest.js');
  } catch (error) {
    console.error('❌ Error updating networkTest.js:', error.message);
  }
}

function main() {
  console.log('🚀 Switching to Production Mode...\n');
  console.log('⚠️ Note: Make sure production server is working before switching\n');
  
  updateApiFile();
  updateQuickFixFile();
  updateNetworkHelperFile();
  updateNetworkStatusFile();
  updateNetworkTestFile();
  
  console.log('\n✅ Successfully switched to Production Mode!');
  console.log('🌐 Production server: https://dash.doctorphc.id/api/mobile');
  console.log('🔄 Please restart your mobile app to apply changes');
  console.log('\n💡 To test production connection:');
  console.log('   node scripts/test-production-connection.js');
  console.log('\n💡 To switch back to development if needed:');
  console.log('   node scripts/switch-to-development.js');
}

main();
