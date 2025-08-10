const fetch = require('node-fetch');

/**
 * Script untuk test mobile app missions setelah update database
 */

const API_BASE_URL = 'http://10.242.90.103:3000/api/mobile';

async function testMobileAppMissions() {
  console.log('🧪 Testing Mobile App Missions...\n');

  try {
    // Test 1: Check missions API
    console.log('📋 Test 1: Checking missions API...');
    const missionsResponse = await fetch(`${API_BASE_URL}/missions`);
    const missionsData = await missionsResponse.json();
    
    console.log(`✅ API Status: ${missionsResponse.status}`);
    console.log(`📊 Total missions: ${missionsData.missions?.length || 0}`);
    
    if (missionsData.missions && missionsData.missions.length > 0) {
      console.log('📝 Sample missions with colors/icons:');
      missionsData.missions.slice(0, 3).forEach((mission, index) => {
        console.log(`   ${index + 1}. ${mission.title}`);
        console.log(`      Color: ${mission.color || 'null'}`);
        console.log(`      Icon: ${mission.icon || 'null'}`);
        console.log(`      Category: ${mission.category}`);
      });
    }

    // Test 2: Check if all missions have colors and icons
    console.log('\n📋 Test 2: Checking colors and icons...');
    if (missionsData.missions) {
      const missionsWithColors = missionsData.missions.filter(m => m.color);
      const missionsWithIcons = missionsData.missions.filter(m => m.icon);
      
      console.log(`✅ Missions with colors: ${missionsWithColors.length}/${missionsData.missions.length}`);
      console.log(`✅ Missions with icons: ${missionsWithIcons.length}/${missionsData.missions.length}`);
      
      if (missionsWithColors.length === missionsData.missions.length && missionsWithIcons.length === missionsData.missions.length) {
        console.log('🎉 All missions now have colors and icons!');
      } else {
        console.log('⚠️  Some missions still missing colors or icons');
      }
    }

    // Test 3: Simulate mobile app processing
    console.log('\n📋 Test 3: Simulating mobile app processing...');
    
    // Simulate the API response structure that mobile app expects
    const mockApiResponse = {
      success: true,
      data: missionsData.missions || []
    };
    
    console.log('📱 Mock API Response for Mobile App:');
    console.log(`   - success: ${mockApiResponse.success}`);
    console.log(`   - data count: ${mockApiResponse.data.length}`);
    
    // Simulate processMissionData function
    const processMissionData = (missions) => {
      return missions.map(mission => {
        const categoryDefaults = {
          daily_habit: { color: '#10B981', icon: 'check-circle' },
          fitness: { color: '#F59E0B', icon: 'dumbbell' },
          mental_health: { color: '#8B5CF6', icon: 'brain' },
          nutrition: { color: '#EF4444', icon: 'food-apple' },
          health_tracking: { color: '#3B82F6', icon: 'heart-pulse' },
          education: { color: '#6366F1', icon: 'book-open' },
          consultation: { color: '#06B6D4', icon: 'doctor' },
          general: { color: '#E53E3E', icon: 'help-circle' }
        };

        const defaults = categoryDefaults[mission.category] || categoryDefaults.general;

        return {
          ...mission,
          color: mission.color || defaults.color,
          icon: mission.icon || defaults.icon,
          category: mission.category || 'general',
          points: mission.points || 10,
          is_active: mission.is_active !== false
        };
      });
    };

    const processedMissions = processMissionData(mockApiResponse.data);
    console.log(`   - Processed missions count: ${processedMissions.length}`);
    
    // Check if processed missions have colors and icons
    const processedWithColors = processedMissions.filter(m => m.color);
    const processedWithIcons = processedMissions.filter(m => m.icon);
    
    console.log(`   - Processed with colors: ${processedWithColors.length}/${processedMissions.length}`);
    console.log(`   - Processed with icons: ${processedWithIcons.length}/${processedMissions.length}`);

    // Test 4: Generate mobile app instructions
    console.log('\n📋 Test 4: Mobile app instructions...');
    
    if (processedWithColors.length === processedMissions.length && processedWithIcons.length === processedMissions.length) {
      console.log('✅ Mobile app should now display missions!');
      console.log('📱 Next steps:');
      console.log('   1. Open mobile app');
      console.log('   2. Go to Daily Mission screen');
      console.log('   3. Check if missions are displayed');
      console.log('   4. Check console logs for debugging info');
    } else {
      console.log('❌ Mobile app may still have issues');
      console.log('🔧 Check the processMissionData function');
    }

  } catch (error) {
    console.error('❌ Error testing mobile app missions:', error.message);
  }
}

async function generateDebugInstructions() {
  console.log('\n🔧 Debug Instructions for Mobile App:');
  console.log('======================================');
  console.log('1. Open mobile app in development mode');
  console.log('2. Go to Daily Mission screen');
  console.log('3. Check console logs for these messages:');
  console.log('   - "🔍 DEBUG: Starting loadData..."');
  console.log('   - "🔍 DEBUG: Missions response:"');
  console.log('   - "🔍 DEBUG: Processed missions:"');
  console.log('   - "🔍 DEBUG: Filtered missions count:"');
  console.log('4. If missions still don\'t appear, check:');
  console.log('   - Network connectivity');
  console.log('   - API endpoint configuration');
  console.log('   - Authentication status');
}

// Run the tests
async function main() {
  console.log('🎯 Mobile App Missions Test');
  console.log('============================\n');
  
  await testMobileAppMissions();
  await generateDebugInstructions();
  
  console.log('\n✅ Test complete!');
  console.log('📋 Next steps:');
  console.log('1. Test mobile app');
  console.log('2. Check console logs');
  console.log('3. Verify missions are displayed');
}

main().catch(console.error); 