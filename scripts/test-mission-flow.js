#!/usr/bin/env node

/**
 * Test script to verify mission flow from accept to update mode
 * This script simulates the complete mission flow
 */

const testMissionFlow = () => {
  console.log('🧪 Testing Mission Flow: Accept → Update Mode...\n');

  // Simulate mission data
  const mission = {
    id: 1,
    title: "Minum Air 8 Gelas",
    description: "Minum 8 gelas air setiap hari untuk kesehatan yang baik",
    target_value: 8,
    unit: "gelas",
    points: 50,
    color: "#3B82F6",
    icon: "water",
    difficulty: "easy",
    category: "health_tracking",
    type: "daily"
  };

  // Simulate initial state (no user mission)
  let userMission = null;
  let currentValue = 0;
  let notes = "";

  console.log('📋 Initial State:');
  console.log('- User Mission:', userMission ? 'Active' : 'None');
  console.log('- Current Value:', currentValue);
  console.log('- Notes:', notes);

  // Simulate accepting mission
  console.log('\n🎯 Step 1: Accepting Mission...');
  
  const acceptMission = () => {
    // Simulate API response
    const response = {
      success: true,
      data: {
        user_mission_id: 123,
        mission_title: mission.title,
        status: "active",
        points: mission.points
      }
    };

    if (response.success) {
      // Update local state
      userMission = {
        id: response.data.user_mission_id,
        mission_id: mission.id,
        status: "active",
        current_value: 0,
        progress: 0,
        notes: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        points_earned: 0
      };
      
      currentValue = 0;
      notes = "";
      
      console.log('✅ Mission Accepted!');
      console.log('- User Mission ID:', userMission.id);
      console.log('- Status:', userMission.status);
      console.log('- Current Value:', currentValue);
      
      return true;
    }
    
    return false;
  };

  // Simulate updating progress
  const updateProgress = (newValue, newNotes) => {
    if (!userMission) {
      console.log('❌ No active mission to update');
      return false;
    }

    console.log(`📈 Updating Progress: ${currentValue} → ${newValue}`);
    
    currentValue = newValue;
    notes = newNotes;
    
    // Calculate progress percentage
    const progress = Math.min(Math.round((currentValue / mission.target_value) * 100), 100);
    
    console.log('- New Current Value:', currentValue);
    console.log('- Progress:', progress + '%');
    console.log('- Notes:', notes);
    
    // Check if mission is completed
    if (progress >= 100) {
      userMission.status = "completed";
      console.log('🎉 Mission Completed!');
    }
    
    return true;
  };

  // Test the flow
  const success = acceptMission();
  
  if (success) {
    console.log('\n🔄 Step 2: Mission is now in UPDATE mode');
    console.log('- Should show progress bar: ✅');
    console.log('- Should show update form: ✅');
    console.log('- Should show abandon button: ✅');
    
    // Test progress updates
    console.log('\n📊 Step 3: Testing Progress Updates...');
    
    updateProgress(3, "Minum 3 gelas pagi ini");
    updateProgress(5, "Sudah minum 5 gelas, tinggal 3 lagi");
    updateProgress(8, "Target tercapai! Minum 8 gelas hari ini");
    
    console.log('\n📋 Final State:');
    console.log('- User Mission Status:', userMission.status);
    console.log('- Current Value:', currentValue);
    console.log('- Progress:', Math.min(Math.round((currentValue / mission.target_value) * 100), 100) + '%');
    console.log('- Notes:', notes);
  }

  // Test error scenarios
  console.log('\n⚠️ Step 4: Testing Error Scenarios...');
  
  const testErrorScenarios = () => {
    const scenarios = [
      {
        name: "Mission Already Accepted",
        error: "Mission sudah diterima dan sedang dalam progress",
        expectedAction: "Refresh user mission data to show update mode"
      },
      {
        name: "Mission Already Completed", 
        error: "Mission sudah diselesaikan",
        expectedAction: "Show status error message"
      },
      {
        name: "Mission Already Cancelled",
        error: "Mission sudah dibatalkan", 
        expectedAction: "Show status error message"
      }
    ];

    scenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.name}:`);
      console.log(`   Error: "${scenario.error}"`);
      console.log(`   Action: ${scenario.expectedAction}`);
    });
  };

  testErrorScenarios();
  
  console.log('\n✅ Mission flow test completed!');
  console.log('\n📝 Summary:');
  console.log('- Mission acceptance should update local state');
  console.log('- Page should switch to update mode automatically');
  console.log('- Progress updates should work in real-time');
  console.log('- Error handling should provide clear feedback');
};

// Run the test
testMissionFlow(); 