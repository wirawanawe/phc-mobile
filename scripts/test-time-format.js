// Test script to verify time format validation
const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const testCases = [
  { time: "09:00", expected: true, description: "Valid morning time" },
  { time: "17:00", expected: true, description: "Valid afternoon time" },
  { time: "23:59", expected: true, description: "Valid late night time" },
  { time: "00:00", expected: true, description: "Valid midnight time" },
  { time: "5", expected: false, description: "Invalid - just number" },
  { time: "17", expected: false, description: "Invalid - hour only" },
  { time: "17:5", expected: false, description: "Invalid - missing leading zero" },
  { time: "25:00", expected: false, description: "Invalid - hour > 23" },
  { time: "17:60", expected: false, description: "Invalid - minute > 59" },
  { time: "abc", expected: false, description: "Invalid - non-numeric" },
  { time: "", expected: false, description: "Invalid - empty string" },
];

console.log('🧪 Testing time format validation...\n');

testCases.forEach((testCase, index) => {
  const result = timeFormatRegex.test(testCase.time);
  const status = result === testCase.expected ? '✅' : '❌';
  
  console.log(`${status} Test ${index + 1}: ${testCase.description}`);
  console.log(`   Input: "${testCase.time}"`);
  console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
  console.log('');
});

console.log('📋 Summary:');
console.log('- The regex pattern is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/');
console.log('- This validates time format HH:MM where:');
console.log('  * Hours: 00-23 (with optional leading zero)');
console.log('  * Minutes: 00-59 (with required leading zero)');
console.log('  * Must include the colon separator');
console.log('');
console.log('🔧 This validation is used in:');
console.log('1. Backend consultation booking validation');
console.log('2. Frontend DetailDoctor screen time selection');
console.log('3. Frontend ConsultationBookingScreen time validation'); 