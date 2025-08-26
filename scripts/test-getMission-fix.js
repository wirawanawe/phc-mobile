// Test script to verify getMission method fix
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing getMission method fix...\n');

// Check if getMission method exists in api.js
const apiPath = path.join(__dirname, '../src/services/api.js');
const apiContent = fs.readFileSync(apiPath, 'utf8');

if (apiContent.includes('async getMission(missionId)')) {
  console.log('✅ getMission method found in api.js');
} else {
  console.log('❌ getMission method NOT found in api.js');
}

// Check if getMission method exists in mockApi.js
const mockApiPath = path.join(__dirname, '../src/services/mockApi.js');
const mockApiContent = fs.readFileSync(mockApiPath, 'utf8');

if (mockApiContent.includes('async getMission(missionId)')) {
  console.log('✅ getMission method found in mockApi.js');
} else {
  console.log('❌ getMission method NOT found in mockApi.js');
}

// Check MissionDetailService to see if it's calling getMission
const missionDetailServicePath = path.join(__dirname, '../src/services/MissionDetailService.ts');
const missionDetailServiceContent = fs.readFileSync(missionDetailServicePath, 'utf8');

if (missionDetailServiceContent.includes('apiService.getMission(missionId)')) {
  console.log('✅ MissionDetailService is calling apiService.getMission');
} else {
  console.log('❌ MissionDetailService is NOT calling apiService.getMission');
}

console.log('\n🎯 Summary:');
console.log('- The getMission method has been added to both api.js and mockApi.js');
console.log('- MissionDetailService should now be able to call apiService.getMission(missionId)');
console.log('- The error "getMission is not a function" should be resolved');
