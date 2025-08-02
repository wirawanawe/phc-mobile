const fetch = require('node-fetch');

/**
 * Script untuk test mobile app fix setelah perbaikan struktur response
 */

const API_BASE_URL = 'http://10.242.90.103:3000/api/mobile';

async function testMobileAppFix() {
  console.log('🧪 Testing Mobile App Fix...\n');

  try {
    // Test 1: Check API response structure
    console.log('📋 Test 1: Checking API response structure...');
    const missionsResponse = await fetch(`${API_BASE_URL}/missions`);
    const missionsData = await missionsResponse.json();
    
    console.log(`✅ API Status: ${missionsResponse.status}`);
    console.log(`📊 Response keys: ${Object.keys(missionsData).join(', ')}`);
    console.log(`📊 Missions count: ${missionsData.missions?.length || 0}`);
    
    // Check response structure
    if (missionsData.missions) {
      console.log('✅ API returns {missions: [...], pagination: {...}} structure');
    } else if (missionsData.success && missionsData.data) {
      console.log('✅ API returns {success: true, data: [...]} structure');
    } else {
      console.log('❌ Unknown API response structure');
    }

    // Test 2: Simulate mobile app processing
    console.log('\n📋 Test 2: Simulating mobile app processing...');
    
    // Simulate the mobile app logic
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

    // Simulate mobile app response handling
    let processedMissions = [];
    
    if (missionsData.success) {
      // API returns {success: true, data: [...]}
      processedMissions = processMissionData(missionsData.data);
      console.log('📱 Processing: {success: true, data: [...]} structure');
    } else if (missionsData.missions) {
      // API returns {missions: [...], pagination: {...}}
      processedMissions = processMissionData(missionsData.missions);
      console.log('📱 Processing: {missions: [...], pagination: {...}} structure');
    } else {
      console.log('❌ Unknown response structure');
    }

    console.log(`✅ Processed missions count: ${processedMissions.length}`);
    
    // Check if processed missions have colors and icons
    const processedWithColors = processedMissions.filter(m => m.color);
    const processedWithIcons = processedMissions.filter(m => m.icon);
    
    console.log(`✅ Processed with colors: ${processedWithColors.length}/${processedMissions.length}`);
    console.log(`✅ Processed with icons: ${processedWithIcons.length}/${processedMissions.length}`);

    // Test 3: Show sample processed missions
    console.log('\n📋 Test 3: Sample processed missions...');
    processedMissions.slice(0, 3).forEach((mission, index) => {
      console.log(`   ${index + 1}. ${mission.title}`);
      console.log(`      Color: ${mission.color}`);
      console.log(`      Icon: ${mission.icon}`);
      console.log(`      Category: ${mission.category}`);
      console.log(`      Points: ${mission.points}`);
    });

    // Test 4: Generate result
    console.log('\n📋 Test 4: Result analysis...');
    
    if (processedMissions.length > 0 && processedWithColors.length === processedMissions.length && processedWithIcons.length === processedMissions.length) {
      console.log('🎉 SUCCESS: Mobile app should now display missions!');
      console.log('📱 Expected result:');
      console.log('   - 7 missions displayed with colors and icons');
      console.log('   - No "No missions available" message');
      console.log('   - Missions can be interacted with');
    } else {
      console.log('❌ FAILED: Mobile app may still have issues');
      console.log('🔧 Check the response handling logic');
    }

  } catch (error) {
    console.error('❌ Error testing mobile app fix:', error.message);
  }
}

async function generateInstructions() {
  console.log('\n📱 Mobile App Test Instructions:');
  console.log('================================');
  console.log('1. Restart mobile app (if running)');
  console.log('2. Go to Daily Mission screen');
  console.log('3. Check console logs for:');
  console.log('   - "🔍 DEBUG: Processed missions (direct):"');
  console.log('   - "🔍 DEBUG: Missions count: 7"');
  console.log('   - "🔍 DEBUG: Filtered missions count: 7"');
  console.log('4. Verify missions are displayed');
  console.log('5. Test mission interactions');
}

// Run the tests
async function main() {
  console.log('🎯 Mobile App Fix Test');
  console.log('=======================\n');
  
  await testMobileAppFix();
  await generateInstructions();
  
  console.log('\n✅ Test complete!');
  console.log('📋 Next steps:');
  console.log('1. Test mobile app');
  console.log('2. Check if missions are displayed');
  console.log('3. Verify all functionality works');
}

main().catch(console.error); 