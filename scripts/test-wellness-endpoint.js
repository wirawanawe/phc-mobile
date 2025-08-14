const https = require('https');
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testWellnessEndpoint() {
  try {
    console.log('🧪 Testing wellness activities endpoint...');
    
    const result = await makeRequest('http://localhost:3000/api/mobile/wellness/activities/public');
    
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200) {
      console.log('✅ Endpoint is working correctly!');
    } else {
      console.log('❌ Endpoint returned an error');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
}

testWellnessEndpoint();
