#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Network Configuration Update Script
 * Automatically updates IP addresses in the mobile app based on current network interfaces
 */

function getCurrentIPs() {
  try {
    // Get all network interfaces
    const output = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    
    const ips = lines.map(line => {
      const match = line.match(/inet\s+([0-9.]+)/);
      return match ? match[1] : null;
    }).filter(ip => ip !== null);
    
    console.log('🔍 Found IP addresses:', ips);
    return ips;
  } catch (error) {
    console.error('❌ Error getting IP addresses:', error.message);
    return [];
  }
}

function updateFile(filePath, oldIPs, newIPs) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Update each old IP with new IPs
    oldIPs.forEach((oldIP, index) => {
      if (newIPs[index]) {
        const oldPattern = new RegExp(`http://${oldIP}:3000`, 'g');
        const newReplacement = `http://${newIPs[index]}:3000`;
        
        if (content.includes(oldIP)) {
          content = content.replace(oldPattern, newReplacement);
          updated = true;
          console.log(`✅ Updated ${oldIP} to ${newIPs[index]} in ${filePath}`);
        }
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function testConnectivity(ip) {
  try {
    const result = execSync(`curl -s --connect-timeout 5 http://${ip}:3000/api/mobile/auth/me`, { encoding: 'utf8' });
    return result.includes('Authorization header required');
  } catch (error) {
    return false;
  }
}

function main() {
  console.log('🌐 Network Configuration Update Script');
  console.log('=====================================');
  
  // Get current IP addresses
  const currentIPs = getCurrentIPs();
  
  if (currentIPs.length === 0) {
    console.log('❌ No IP addresses found. Please check your network connection.');
    return;
  }
  
  // Test connectivity for each IP
  console.log('\n🔍 Testing connectivity...');
  const workingIPs = [];
  
  currentIPs.forEach(ip => {
    const isWorking = testConnectivity(ip);
    console.log(`${isWorking ? '✅' : '❌'} ${ip}:3000 - ${isWorking ? 'WORKING' : 'FAILED'}`);
    if (isWorking) {
      workingIPs.push(ip);
    }
  });
  
  if (workingIPs.length === 0) {
    console.log('\n❌ No working IP addresses found. Please check if the server is running.');
    console.log('💡 Start the server with: cd dash-app && npm run dev');
    return;
  }
  
  console.log(`\n✅ Found ${workingIPs.length} working IP address(es):`, workingIPs);
  
  // Files to update
  const filesToUpdate = [
    'src/utils/networkHelper.js',
    'src/services/api.js'
  ];
  
  // Current IPs in the files (from the configuration)
  const currentConfigIPs = [
    '10.242.90.103'
  ];
  
  console.log('\n📝 Updating configuration files...');
  
  let totalUpdates = 0;
  
  filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const updated = updateFile(filePath, currentConfigIPs, workingIPs);
      if (updated) {
        totalUpdates++;
      }
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  });
  
  if (totalUpdates > 0) {
    console.log(`\n✅ Updated ${totalUpdates} file(s) with working IP addresses.`);
    console.log('\n🔄 Please restart your mobile app to apply the changes.');
  } else {
    console.log('\nℹ️ No files needed updating.');
  }
  
  // Generate a summary
  console.log('\n📊 Summary:');
  console.log(`   Working IPs: ${workingIPs.join(', ')}`);
  console.log(`   Files updated: ${totalUpdates}`);
  console.log(`   Server status: ${workingIPs.length > 0 ? 'RUNNING' : 'NOT RUNNING'}`);
  
  if (workingIPs.length > 0) {
    console.log('\n💡 Recommended configuration:');
    console.log(`   Use: http://${workingIPs[0]}:3000/api/mobile`);
    console.log(`   Backup: ${workingIPs.slice(1).map(ip => `http://${ip}:3000/api/mobile`).join(', ')}`);
  }
}

// Run the script
main(); 