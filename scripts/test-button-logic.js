// Test the button logic logic
function testButtonLogic() {
  console.log('🧪 Testing Button Logic...\n');

  // Test cases
  const testCases = [
    {
      name: 'No mood data',
      hasTodayEntry: false,
      existingMood: null,
      expectedText: 'Log Your Mood',
      expectedColor: 'red'
    },
    {
      name: 'Has today entry',
      hasTodayEntry: true,
      existingMood: null,
      expectedText: 'Update Your Mood',
      expectedColor: 'purple'
    },
    {
      name: 'Has existing mood',
      hasTodayEntry: false,
      existingMood: { mood_level: 'happy' },
      expectedText: 'Update Your Mood',
      expectedColor: 'purple'
    },
    {
      name: 'Has both today entry and existing mood',
      hasTodayEntry: true,
      existingMood: { mood_level: 'happy' },
      expectedText: 'Update Your Mood',
      expectedColor: 'purple'
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    
    // Simulate the button logic
    const hasMoodData = testCase.hasTodayEntry || testCase.existingMood;
    const buttonText = hasMoodData ? "Update Your Mood" : "Log Your Mood";
    const buttonColor = hasMoodData ? "purple" : "red";
    const buttonIcon = hasMoodData ? "pencil" : "plus";
    
    console.log(`  hasTodayEntry: ${testCase.hasTodayEntry}`);
    console.log(`  existingMood: ${testCase.existingMood ? 'exists' : 'null'}`);
    console.log(`  hasMoodData: ${hasMoodData}`);
    console.log(`  Button Text: "${buttonText}" (expected: "${testCase.expectedText}")`);
    console.log(`  Button Color: ${buttonColor} (expected: ${testCase.expectedColor})`);
    console.log(`  Button Icon: ${buttonIcon}`);
    
    const textCorrect = buttonText === testCase.expectedText;
    const colorCorrect = buttonColor === testCase.expectedColor;
    
    if (textCorrect && colorCorrect) {
      console.log(`  ✅ PASS\n`);
    } else {
      console.log(`  ❌ FAIL\n`);
    }
  });

  // Test date comparison logic
  console.log('📅 Testing Date Comparison Logic...\n');
  
  const today = new Date().toISOString().split('T')[0];
  console.log(`Today's date: ${today}`);
  
  const sampleEntries = [
    { tracking_date: '2025-01-15' },
    { tracking_date: '2025-08-18' }, // Today's date
    { tracking_date: '2025-08-17' }
  ];
  
  console.log('Sample entries:');
  sampleEntries.forEach(entry => {
    const isToday = entry.tracking_date === today;
    console.log(`  ${entry.tracking_date}: ${isToday ? '✅ Today' : '❌ Not today'}`);
  });
}

// Run the test
testButtonLogic();
