// Test script to verify no hardcoded data remains
console.log('🧪 Testing: No Hardcoded Data');
console.log('=============================');

// Check if the HelpSupportScreen.tsx file contains any hardcoded contact data
const fs = require('fs');
const path = require('path');

const helpSupportFile = path.join(__dirname, 'src/screens/HelpSupportScreen.tsx');
const fileContent = fs.readFileSync(helpSupportFile, 'utf8');

// Check for hardcoded phone numbers
const hardcodedPhones = [
  '+62-21-12345678',
  '+6281234567890',
  '6281234567890'
];

// Check for hardcoded emails
const hardcodedEmails = [
  'admin@phc.com',
  'support@wellnesswecare.com'
];

// Check for hardcoded office names
const hardcodedOffices = [
  'Kantor Pusat PHC',
  'PHC Support Center',
  'PHC Emergency Hotline'
];

console.log('\n🔍 Checking for hardcoded data...');

let foundHardcoded = false;

// Check phone numbers
hardcodedPhones.forEach(phone => {
  if (fileContent.includes(phone)) {
    console.log(`❌ Found hardcoded phone: ${phone}`);
    foundHardcoded = true;
  }
});

// Check emails
hardcodedEmails.forEach(email => {
  if (fileContent.includes(email)) {
    console.log(`❌ Found hardcoded email: ${email}`);
    foundHardcoded = true;
  }
});

// Check office names
hardcodedOffices.forEach(office => {
  if (fileContent.includes(office)) {
    console.log(`❌ Found hardcoded office: ${office}`);
    foundHardcoded = true;
  }
});

// Check for fallback data patterns (excluding comments)
const fallbackPatterns = [
  'getDefaultContactMethods',
  'DEFAULT',
  'hardcoded'
];

fallbackPatterns.forEach(pattern => {
  if (fileContent.includes(pattern)) {
    console.log(`❌ Found fallback pattern: ${pattern}`);
    foundHardcoded = true;
  }
});

if (!foundHardcoded) {
  console.log('✅ No hardcoded contact data found!');
  console.log('✅ All data will come from API');
} else {
  console.log('\n⚠️  Hardcoded data found. Please remove it.');
}

// Check for proper API usage
const apiPatterns = [
  'apiService.request',
  'contactData.contactMethods',
  'contactData.primaryContact',
  'contactData.supportHours'
];

console.log('\n🔍 Checking for proper API usage...');
let apiUsageCorrect = true;

apiPatterns.forEach(pattern => {
  if (fileContent.includes(pattern)) {
    console.log(`✅ Found API usage: ${pattern}`);
  } else {
    console.log(`❌ Missing API usage: ${pattern}`);
    apiUsageCorrect = false;
  }
});

// Check for error handling
const errorPatterns = [
  'setContactData(null)',
  'Alert.alert',
  'Koneksi Error',
  'Tidak dapat memuat data kontak'
];

console.log('\n🔍 Checking for error handling...');
let errorHandlingCorrect = true;

errorPatterns.forEach(pattern => {
  if (fileContent.includes(pattern)) {
    console.log(`✅ Found error handling: ${pattern}`);
  } else {
    console.log(`❌ Missing error handling: ${pattern}`);
    errorHandlingCorrect = false;
  }
});

// Check for conditional rendering
const conditionalPatterns = [
  'contactData ? (',
  'contactData && (',
  'loading ? (',
  'setContactData(null)'
];

console.log('\n🔍 Checking for conditional rendering...');
let conditionalRenderingCorrect = true;

conditionalPatterns.forEach(pattern => {
  if (fileContent.includes(pattern)) {
    console.log(`✅ Found conditional rendering: ${pattern}`);
  } else {
    console.log(`❌ Missing conditional rendering: ${pattern}`);
    conditionalRenderingCorrect = false;
  }
});

console.log('\n📊 Summary');
console.log('==========');
if (!foundHardcoded && apiUsageCorrect && errorHandlingCorrect && conditionalRenderingCorrect) {
  console.log('✅ SUCCESS: All hardcoded data removed');
  console.log('✅ SUCCESS: Proper API usage implemented');
  console.log('✅ SUCCESS: Error handling implemented');
  console.log('✅ SUCCESS: Conditional rendering implemented');
  console.log('\n📱 Mobile app will now:');
  console.log('  - Load all contact data from API');
  console.log('  - Show error state if API fails');
  console.log('  - Display "Coba Lagi" button for retry');
  console.log('  - Hide sections when data unavailable');
  console.log('  - Show loading state while fetching');
} else {
  console.log('❌ ISSUES FOUND: Please fix the problems above');
}
