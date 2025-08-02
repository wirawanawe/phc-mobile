#!/usr/bin/env node

/**
 * Test script to verify the mission acceptance error handling fix
 * This script tests that 409 Conflict errors are properly handled without falling back to mock API
 */

const testMissionAcceptanceFix = async () => {
  console.log('🧪 Testing Mission Acceptance Error Handling Fix...\n');

  // Simulate the API service with the new error handling
  const mockApiService = {
    acceptMission: async (mission天下之) => {
      console.log('🔧 Mock API: Accepting mission', mission天下之);
      return {
        success: true,
        message: "Mission accepted successfully",
        data: { user_mission_id: Date.now() }
      };
    }
  };

  // Simulate the real API service with the new error handling
  const apiService = {
    async acceptMission(missionId) {
      try {
        console.log(`🎯 API: Accepting mission ${missionId}`);
        
        // Simulate a 409 Conflict error for completed mission
        if (missionId === 1) {
          throw new Error("Mission sudah diselesaikan. Tidak dapat diperbarui lagi.");
        }
        
        // Simulate successful acceptance for other missions
        return {
          success: true,
          message: "Mission accepted successfully",
          data: { user_mission_id: Date.now() }
        };
      } catch (error) {
        // Don't fall back to mock API for specific error cases that should be handled by the UI
        if (error.message.includes("Mission sudah diselesaikan") || 
            error.message.includes("Mission sudah diterima") ||
            error.message.includes("sudah dalam progress") ||
            error.message.includes("sudah dibatalkan") ||
            error.message.includes("tidak dapat ditinggalkan")) {
          console.log("⚠️ Mission status error - not falling back to mock API:", error.message);
          throw error; // Re-throw the error to be handled by the UI
        }
        
        // Only fall back to mock API for network/connection errors
        if (error.message.includes("Network") || 
            error.message.includes("connection") || 
            error.message.includes("fetch") || 
            error.message.includes("timeout") ||
            error.message.includes("Server error")) {
          console.log("🌐 Network error detected, trying mock API for acceptMission");
          return await mockApiService.acceptMission(missionId);
        }
        
        // For other errors, re-throw to be handled by the UI
        throw error;
      }
    }
  };

  // Test cases
  const testCases = [
    { missionId: 1, description: "Completed mission (should throw 409 error)" },
    { missionId: 2, description: "New mission (should succeed)" },
    { missionId: 3, description: "Another new mission (should succeed)" }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.description}`);
    console.log(`📋 Mission ID: ${testCase.missionId}`);
    
    try {
      const result = await apiService.acceptMission(testCase.missionId);
      console.log('✅ Success:', result);
    } catch (error) {
      console.log('❌ Error caught:', error.message);
      
      // Test if this is a mission status error that should be handled by UI
      if (error.message.includes("sudah diselesaikan") || 
          error.message.includes("sudah diterima") ||
          error.message.includes("sudah dalam progress")) {
        console.log('✅ Correctly identified as mission status error - should be handled by UI');
      } else {
        console.log('⚠️ Unexpected error type');
      }
    }
  }

  // Test the error handling logic from the UI
  console.log('\n🧪 Testing UI error handling logic...');
  
  const handleAcceptMissionError = (error) => {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes("mission sudah diterima") || errorMessage.includes("sudah dalam progress")) {
      return {
        type: "ALREADY_ACCEPTED",
        message: "Mission sudah diterima dan sedang dalam progress. Halaman akan diperbarui untuk menampilkan mode update progress.",
        shouldRefresh: true
      };
    } else if (errorMessage.includes("sudah diselesaikan")) {
      return {
        type: "ALREADY_COMPLETED", 
        message: "Mission sudah diselesaikan. Tidak dapat diperbarui lagi.",
        shouldRefresh: true
      };
    } else if (errorMessage.includes("sudah dibatalkan")) {
      return {
        type: "ALREADY_CANCELLED",
        message: "Mission sudah dibatalkan. Tidak dapat diperbarui lagi.",
        shouldRefresh: true
      };
    } else {
      return {
        type: "UNKNOWN",
        message: "An unexpected error occurred. Please try again later.",
        shouldRefresh: false
      };
    }
  };

  const testErrors = [
    "Mission sudah diselesaikan. Tidak dapat diperbarui lagi.",
    "Mission sudah diterima dan sedang dalam progress",
    "Mission sudah dibatalkan. Tidak dapat diperbarui lagi.",
    "Some other error"
  ];

  testErrors.forEach((errorMsg, index) => {
    const error = new Error(errorMsg);
    const result = handleAcceptMissionError(error);
    console.log(`${index + 1}. "${errorMsg}" -> Type: ${result.type}, Message: ${result.message}`);
  });

  console.log('\n✅ Mission acceptance error handling fix test completed!');
};

// Run the test
testMissionAcceptanceFix().catch(console.error); 