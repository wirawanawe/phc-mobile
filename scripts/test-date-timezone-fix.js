// Test script to verify date timezone fix

// Simulate the date utility functions
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateToYYYYMMDD(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

console.log('🧪 Testing Date Timezone Fix...\n');

console.log('📊 Current System Information:');
console.log(`   - Current Timezone: ${getCurrentTimezone()}`);
console.log(`   - Local Date: ${new Date().toLocaleDateString('en-CA')}`);
console.log(`   - UTC Date: ${new Date().toISOString().split('T')[0]}`);

console.log('\n📊 Date Utility Functions:');
console.log(`   - getTodayDate(): ${getTodayDate()}`);
console.log(`   - formatDateToYYYYMMDD(new Date()): ${formatDateToYYYYMMDD(new Date())}`);

console.log('\n🔍 Comparison:');
console.log(`   - Old method (UTC): ${new Date().toISOString().split('T')[0]}`);
console.log(`   - New method (Local): ${getTodayDate()}`);
console.log(`   - Difference: ${new Date().toISOString().split('T')[0] === getTodayDate() ? 'None' : '1 day'}`);

console.log('\n✅ Expected Result:');
console.log('   - New method should return local timezone date');
console.log('   - Should match your local date (not UTC)');
console.log('   - Should fix the 1-day difference issue');

// Test with different dates
console.log('\n📊 Testing with different dates:');
const testDate = new Date('2025-08-19T15:30:00');
console.log(`   - Test Date: ${testDate.toISOString()}`);
console.log(`   - UTC Format: ${testDate.toISOString().split('T')[0]}`);
console.log(`   - Local Format: ${formatDateToYYYYMMDD(testDate)}`);
