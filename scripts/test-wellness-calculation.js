#!/usr/bin/env node

/**
 * Simple Test Script for Wellness Duration Calculation
 * 
 * This script tests the wellness duration calculation logic without database connection
 */

function testWellnessDurationCalculation() {
  console.log('🧪 Testing Wellness Duration Calculation Logic...');
  
  // Test cases
  const testCases = [
    {
      name: 'User joined 13 days ago',
      joinDate: new Date(Date.now() - (13 * 24 * 60 * 60 * 1000)), // 13 days ago
      programDuration: 30,
      expectedDaysSinceJoining: 13,
      expectedDaysRemaining: 17
    },
    {
      name: 'User joined 1 day ago',
      joinDate: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)), // 1 day ago
      programDuration: 30,
      expectedDaysSinceJoining: 1,
      expectedDaysRemaining: 29
    },
    {
      name: 'User joined 30 days ago',
      joinDate: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)), // 30 days ago
      programDuration: 30,
      expectedDaysSinceJoining: 30,
      expectedDaysRemaining: 0
    },
    {
      name: 'User joined 45 days ago (program should be completed)',
      joinDate: new Date(Date.now() - (45 * 24 * 60 * 60 * 1000)), // 45 days ago
      programDuration: 30,
      expectedDaysSinceJoining: 45,
      expectedDaysRemaining: 0
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test Case ${index + 1}: ${testCase.name}`);
    
    // Calculate days since joining
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - testCase.joinDate.getTime());
    const daysSinceJoining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate remaining days
    const daysRemaining = Math.max(0, testCase.programDuration - daysSinceJoining);
    
    console.log(`   📅 Join Date: ${testCase.joinDate.toISOString().split('T')[0]}`);
    console.log(`   🎯 Target Duration: ${testCase.programDuration} days`);
    console.log(`   📈 Calculated Days Since Joining: ${daysSinceJoining} days`);
    console.log(`   ⏰ Calculated Days Remaining: ${daysRemaining} days`);
    
    // Verify results
    const daysSinceJoiningCorrect = daysSinceJoining === testCase.expectedDaysSinceJoining;
    const daysRemainingCorrect = daysRemaining === testCase.expectedDaysRemaining;
    
    if (daysSinceJoiningCorrect && daysRemainingCorrect) {
      console.log(`   ✅ Test PASSED`);
    } else {
      console.log(`   ❌ Test FAILED`);
      if (!daysSinceJoiningCorrect) {
        console.log(`      Expected days since joining: ${testCase.expectedDaysSinceJoining}, got: ${daysSinceJoining}`);
      }
      if (!daysRemainingCorrect) {
        console.log(`      Expected days remaining: ${testCase.expectedDaysRemaining}, got: ${daysRemaining}`);
      }
    }
  });
  
  // Test the specific case mentioned by the user
  console.log('\n🎯 Testing User\'s Specific Case (13 days participation):');
  const userJoinDate = new Date(Date.now() - (13 * 24 * 60 * 60 * 1000));
  const userProgramDuration = 30;
  const userDiffTime = Math.abs(new Date().getTime() - userJoinDate.getTime());
  const userDaysSinceJoining = Math.ceil(userDiffTime / (1000 * 60 * 60 * 24));
  const userDaysRemaining = Math.max(0, userProgramDuration - userDaysSinceJoining);
  
  console.log(`   📅 User Join Date: ${userJoinDate.toISOString().split('T')[0]}`);
  console.log(`   🎯 Program Duration: ${userProgramDuration} days`);
  console.log(`   📈 Days Since Joining: ${userDaysSinceJoining} days`);
  console.log(`   ⏰ Days Remaining: ${userDaysRemaining} days`);
  console.log(`   📊 Display should show: "${userDaysSinceJoining} dari ${userProgramDuration} hari"`);
  
  if (userDaysSinceJoining === 13) {
    console.log('   ✅ User case calculation is correct!');
  } else {
    console.log(`   ❌ User case calculation is wrong! Expected 13, got ${userDaysSinceJoining}`);
  }
  
  console.log('\n🎉 Calculation logic test completed!');
}

// Run the test
testWellnessDurationCalculation();
