const fetch = require('node-fetch');

/**
 * Script untuk mendiagnosis masalah "available missions kosong"
 */

const API_BASE_URL = 'http://10.242.90.103:3000/api/mobile';

async function testMissionsAPI() {
  console.log('🔍 Diagnosing Missions API...\n');

  try {
    // Test 1: Check missions endpoint
    console.log('📋 Test 1: Checking missions endpoint...');
    const missionsResponse = await fetch(`${API_BASE_URL}/missions`);
    const missionsData = await missionsResponse.json();
    
    console.log(`✅ Missions API Status: ${missionsResponse.status}`);
    console.log(`📊 Total missions available: ${missionsData.missions?.length || 0}`);
    
    if (missionsData.missions && missionsData.missions.length > 0) {
      console.log('📝 Sample missions:');
      missionsData.missions.slice(0, 3).forEach((mission, index) => {
        console.log(`   ${index + 1}. ${mission.title} (${mission.category})`);
      });
    } else {
      console.log('❌ No missions found in API response');
    }

    // Test 2: Check if missions are active
    console.log('\n📋 Test 2: Checking mission status...');
    if (missionsData.missions) {
      const activeMissions = missionsData.missions.filter(m => m.is_active);
      const inactiveMissions = missionsData.missions.filter(m => !m.is_active);
      
      console.log(`✅ Active missions: ${activeMissions.length}`);
      console.log(`❌ Inactive missions: ${inactiveMissions.length}`);
      
      if (inactiveMissions.length > 0) {
        console.log('⚠️  Found inactive missions:');
        inactiveMissions.forEach(mission => {
          console.log(`   - ${mission.title} (ID: ${mission.id})`);
        });
      }
    }

    // Test 3: Check database directly
    console.log('\n📋 Test 3: Checking database connection...');
    const dbResponse = await fetch(`${API_BASE_URL}/missions?limit=1`);
    const dbData = await dbResponse.json();
    
    if (dbData.pagination) {
      console.log(`📊 Database total missions: ${dbData.pagination.total}`);
      console.log(`📄 Pagination info: ${dbData.pagination.totalPages} pages`);
    }

    // Test 4: Check mobile app API endpoint
    console.log('\n📋 Test 4: Testing mobile app endpoint...');
    const mobileResponse = await fetch(`${API_BASE_URL}/missions`);
    const mobileData = await mobileResponse.json();
    
    console.log(`📱 Mobile API response structure:`);
    console.log(`   - Has missions array: ${Array.isArray(mobileData.missions)}`);
    console.log(`   - Missions count: ${mobileData.missions?.length || 0}`);
    console.log(`   - Response keys: ${Object.keys(mobileData).join(', ')}`);

    // Test 5: Check for potential issues
    console.log('\n📋 Test 5: Potential issues analysis...');
    
    if (missionsData.missions && missionsData.missions.length === 0) {
      console.log('❌ ISSUE FOUND: No missions in database');
      console.log('💡 Solution: Add missions to database');
    } else if (missionsData.missions && missionsData.missions.filter(m => m.is_active).length === 0) {
      console.log('❌ ISSUE FOUND: All missions are inactive');
      console.log('💡 Solution: Activate missions in database');
    } else if (missionsData.missions && missionsData.missions.length > 0) {
      console.log('✅ API is working correctly');
      console.log('💡 Issue might be in mobile app code');
    }

    // Test 6: Check mobile app data structure
    console.log('\n📋 Test 6: Mobile app data structure check...');
    const sampleMission = missionsData.missions?.[0];
    if (sampleMission) {
      console.log('📝 Sample mission structure:');
      console.log(`   - id: ${sampleMission.id}`);
      console.log(`   - title: ${sampleMission.title}`);
      console.log(`   - category: ${sampleMission.category}`);
      console.log(`   - is_active: ${sampleMission.is_active}`);
      console.log(`   - points: ${sampleMission.points}`);
      console.log(`   - color: ${sampleMission.color}`);
      console.log(`   - icon: ${sampleMission.icon}`);
    }

  } catch (error) {
    console.error('❌ Error testing missions API:', error.message);
  }
}

async function checkMobileAppIssues() {
  console.log('\n🔍 Checking potential mobile app issues...\n');

  // Check if mobile app is filtering missions incorrectly
  console.log('📱 Potential mobile app issues:');
  console.log('1. Check if missions are being filtered by category');
  console.log('2. Check if missions are being filtered by status');
  console.log('3. Check if missions data is being processed correctly');
  console.log('4. Check if missions are being displayed in UI');
  
  console.log('\n💡 Debugging steps:');
  console.log('1. Add console.log in loadData() function');
  console.log('2. Check missions state after API call');
  console.log('3. Check filteredMissions logic');
  console.log('4. Check UI rendering conditions');
}

async function generateFixScript() {
  console.log('\n🔧 Generating fix script...\n');
  
  const fixScript = `
// Add this to DailyMissionScreen.tsx for debugging
const loadData = async () => {
  try {
    setLoading(true);
    const [missionsResponse, userMissionsResponse, statsResponse] =
      await Promise.all([
        api.getMissions(),
        api.getMyMissions(),
        api.getMissionStats(),
      ]);

    console.log('🔍 DEBUG: Missions response:', missionsResponse);
    console.log('🔍 DEBUG: User missions response:', userMissionsResponse);
    console.log('🔍 DEBUG: Stats response:', statsResponse);

    if (missionsResponse.success) {
      console.log('🔍 DEBUG: Setting missions:', missionsResponse.data);
      setMissions(missionsResponse.data);
    } else {
      console.log('❌ DEBUG: Missions API failed:', missionsResponse);
    }

    if (userMissionsResponse.success) {
      console.log('🔍 DEBUG: Setting user missions:', userMissionsResponse.data);
      setUserMissions(userMissionsResponse.data);
    }

    if (statsResponse.success) {
      console.log('🔍 DEBUG: Setting stats:', statsResponse.data);
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

  console.log('📝 Debug code to add:');
  console.log(fixScript);
}

// Run the diagnosis
async function main() {
  console.log('🎯 Missions API Diagnosis Tool');
  console.log('================================\n');
  
  await testMissionsAPI();
  await checkMobileAppIssues();
  await generateFixScript();
  
  console.log('\n✅ Diagnosis complete!');
  console.log('📋 Next steps:');
  console.log('1. Check the console output above');
  console.log('2. Add debug code to mobile app');
  console.log('3. Test the app and check console logs');
  console.log('4. Fix any issues found');
}

main().catch(console.error); 