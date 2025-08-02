const fetch = require('node-fetch');

/**
 * Script untuk menguji missions dengan debugging
 */

const API_BASE_URL = 'http://10.242.90.103:3000/api/mobile';

async function testMissionsWithDebug() {
  console.log('🔍 Testing Missions with Debug...\n');

  try {
    // Test 1: Check missions endpoint response structure
    console.log('📋 Test 1: Checking missions API response structure...');
    const missionsResponse = await fetch(`${API_BASE_URL}/missions`);
    const missionsData = await missionsResponse.json();
    
    console.log('📊 API Response Structure:');
    console.log(`   - Status: ${missionsResponse.status}`);
    console.log(`   - Has missions property: ${missionsData.hasOwnProperty('missions')}`);
    console.log(`   - Missions is array: ${Array.isArray(missionsData.missions)}`);
    console.log(`   - Missions count: ${missionsData.missions?.length || 0}`);
    console.log(`   - Response keys: ${Object.keys(missionsData).join(', ')}`);

    // Test 2: Check missions data structure
    if (missionsData.missions && missionsData.missions.length > 0) {
      console.log('\n📋 Test 2: Checking mission data structure...');
      const sampleMission = missionsData.missions[0];
      
      console.log('📝 Sample Mission Structure:');
      console.log(`   - id: ${sampleMission.id} (type: ${typeof sampleMission.id})`);
      console.log(`   - title: ${sampleMission.title} (type: ${typeof sampleMission.title})`);
      console.log(`   - category: ${sampleMission.category} (type: ${typeof sampleMission.category})`);
      console.log(`   - is_active: ${sampleMission.is_active} (type: ${typeof sampleMission.is_active})`);
      console.log(`   - points: ${sampleMission.points} (type: ${typeof sampleMission.points})`);
      console.log(`   - color: ${sampleMission.color} (type: ${typeof sampleMission.color})`);
      console.log(`   - icon: ${sampleMission.icon} (type: ${typeof sampleMission.icon})`);
      
      // Check if all required fields are present
      const requiredFields = ['id', 'title', 'description', 'category', 'points', 'is_active'];
      const missingFields = requiredFields.filter(field => !sampleMission.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ All required fields present');
      }
    }

    // Test 3: Simulate mobile app data processing
    console.log('\n📋 Test 3: Simulating mobile app data processing...');
    
    // Simulate the API response structure that mobile app expects
    const mockApiResponse = {
      success: true,
      data: missionsData.missions || []
    };
    
    console.log('📱 Mock API Response for Mobile App:');
    console.log(`   - success: ${mockApiResponse.success}`);
    console.log(`   - data is array: ${Array.isArray(mockApiResponse.data)}`);
    console.log(`   - data count: ${mockApiResponse.data.length}`);
    
    // Simulate setting missions state
    const missions = mockApiResponse.data;
    console.log(`   - missions state count: ${missions.length}`);
    
    // Simulate filtering
    const selectedCategory = 'all';
    const filteredMissions = selectedCategory === 'all' 
      ? missions 
      : missions.filter(mission => mission.category === selectedCategory);
    
    console.log(`   - filtered missions count: ${filteredMissions.length}`);
    console.log(`   - selected category: ${selectedCategory}`);

    // Test 4: Check for potential issues
    console.log('\n📋 Test 4: Checking for potential issues...');
    
    if (missionsData.missions) {
      const activeMissions = missionsData.missions.filter(m => m.is_active === true);
      const inactiveMissions = missionsData.missions.filter(m => m.is_active === false);
      const nullActiveMissions = missionsData.missions.filter(m => m.is_active === null);
      
      console.log(`   - Active missions: ${activeMissions.length}`);
      console.log(`   - Inactive missions: ${inactiveMissions.length}`);
      console.log(`   - Null active missions: ${nullActiveMissions.length}`);
      
      if (nullActiveMissions.length > 0) {
        console.log('⚠️  Found missions with null is_active field:');
        nullActiveMissions.forEach(mission => {
          console.log(`     - ${mission.title} (ID: ${mission.id})`);
        });
      }
    }

    // Test 5: Check mobile app API endpoint
    console.log('\n📋 Test 5: Testing mobile app specific endpoint...');
    
    // Test with different parameters
    const testParams = [
      '',
      '?limit=5',
      '?page=1',
      '?category=daily_habit'
    ];
    
    for (const param of testParams) {
      try {
        const response = await fetch(`${API_BASE_URL}/missions${param}`);
        const data = await response.json();
        console.log(`   - ${param || 'no params'}: ${data.missions?.length || 0} missions`);
      } catch (error) {
        console.log(`   - ${param || 'no params'}: Error - ${error.message}`);
      }
    }

    // Test 6: Generate debugging recommendations
    console.log('\n📋 Test 6: Debugging recommendations...');
    
    if (missionsData.missions && missionsData.missions.length > 0) {
      console.log('✅ API is working correctly');
      console.log('💡 Potential mobile app issues:');
      console.log('   1. Check if missions data is being processed correctly');
      console.log('   2. Check if missions state is being set properly');
      console.log('   3. Check if filteredMissions logic is working');
      console.log('   4. Check if UI rendering conditions are met');
      console.log('   5. Check if missions have required fields (color, icon)');
      
      // Check for missing color/icon fields
      const missionsWithoutColor = missionsData.missions.filter(m => !m.color);
      const missionsWithoutIcon = missionsData.missions.filter(m => !m.icon);
      
      if (missionsWithoutColor.length > 0) {
        console.log(`⚠️  ${missionsWithoutColor.length} missions without color field`);
      }
      if (missionsWithoutIcon.length > 0) {
        console.log(`⚠️  ${missionsWithoutIcon.length} missions without icon field`);
      }
    } else {
      console.log('❌ No missions found in API response');
      console.log('💡 Solutions:');
      console.log('   1. Check if missions table has data');
      console.log('   2. Check if missions are active');
      console.log('   3. Check if API endpoint is correct');
    }

  } catch (error) {
    console.error('❌ Error testing missions:', error.message);
  }
}

async function generateMobileAppFix() {
  console.log('\n🔧 Generating mobile app fix...\n');
  
  const fixCode = `
// Add this to DailyMissionScreen.tsx to handle missing fields
const processMissionData = (missions) => {
  return missions.map(mission => ({
    ...mission,
    color: mission.color || '#E53E3E', // Default color if missing
    icon: mission.icon || 'help-circle', // Default icon if missing
    category: mission.category || 'general',
    points: mission.points || 10,
    is_active: mission.is_active !== false // Treat null/undefined as active
  }));
};

// Update loadData function
const loadData = async () => {
  try {
    setLoading(true);
    const [missionsResponse, userMissionsResponse, statsResponse] =
      await Promise.all([
        api.getMissions(),
        api.getMyMissions(),
        api.getMissionStats(),
      ]);

    if (missionsResponse.success) {
      const processedMissions = processMissionData(missionsResponse.data);
      console.log('🔍 DEBUG: Processed missions:', processedMissions);
      setMissions(processedMissions);
    }

    if (userMissionsResponse.success) {
      setUserMissions(userMissionsResponse.data);
    }

    if (statsResponse.success) {
      setStats(statsResponse.data);
    }
  } catch (error) {
    console.error("Error loading missions:", error);
    handleError(error, {
      title: 'Load Missions Error'
    });
  } finally {
    setLoading(false);
  }
};
`;

  console.log('📝 Fix code to add:');
  console.log(fixCode);
}

// Run the tests
async function main() {
  console.log('🎯 Missions Debug Test Tool');
  console.log('============================\n');
  
  await testMissionsWithDebug();
  await generateMobileAppFix();
  
  console.log('\n✅ Debug test complete!');
  console.log('📋 Next steps:');
  console.log('1. Check the console output above');
  console.log('2. Add the fix code to mobile app');
  console.log('3. Test the app again');
  console.log('4. Check if missions are now displayed');
}

main().catch(console.error); 