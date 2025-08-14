#!/usr/bin/env node

/**
 * Clear Rate Limits Script
 * 
 * Usage: node scripts/clear-rate-limits.js [server-url]
 * 
 * Examples:
 *   node scripts/clear-rate-limits.js
 *   node scripts/clear-rate-limits.js http://localhost:3000
 *   node scripts/clear-rate-limits.js https://dash.doctorphc.id
 */

const https = require('https');
const http = require('http');

async function clearRateLimits(serverUrl = 'http://localhost:3000') {
  const url = `${serverUrl}/api/clear-rate-limit`;
  
  console.log(`🧹 Clearing rate limits for: ${serverUrl}`);
  
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ Rate limits cleared successfully!');
            console.log(`📅 Timestamp: ${result.timestamp}`);
            resolve(result);
          } else {
            console.log(`❌ Failed to clear rate limits: ${res.statusCode}`);
            console.log(`📝 Response: ${result.message || data}`);
            reject(new Error(`HTTP ${res.statusCode}: ${result.message || data}`));
          }
        } catch (error) {
          console.log(`❌ Invalid JSON response: ${data}`);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request failed: ${error.message}`);
      reject(error);
    });
    
    req.end();
  });
}

// Main execution
async function main() {
  const serverUrl = process.argv[2] || 'http://localhost:3000';
  
  try {
    await clearRateLimits(serverUrl);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { clearRateLimits };
