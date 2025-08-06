const fs = require('fs');
const path = require('path');

// Function to improve error handling in DailyMissionScreen
function improveDailyMissionScreenErrorHandling() {
  const filePath = 'src/screens/DailyMissionScreen.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ DailyMissionScreen.tsx not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the handleAcceptMission function
  const functionStart = content.indexOf('const handleAcceptMission = async (missionId: number) => {');
  if (functionStart === -1) {
    console.log('❌ handleAcceptMission function not found');
    return;
  }
  
  // Find the end of the function
  let braceCount = 0;
  let functionEnd = functionStart;
  let inFunction = false;
  
  for (let i = functionStart; i < content.length; i++) {
    if (content[i] === '{') {
      if (!inFunction) {
        inFunction = true;
      }
      braceCount++;
    } else if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0 && inFunction) {
        functionEnd = i + 1;
        break;
      }
    }
  }
  
  // Extract the current function
  const currentFunction = content.substring(functionStart, functionEnd);
  
  // Check if the improved error handling is already there
  if (currentFunction.includes('MISSION_ALREADY_COMPLETED')) {
    console.log('✅ Error handling already improved in DailyMissionScreen');
    return;
  }
  
  // Create improved function
  const improvedFunction = `const handleAcceptMission = async (missionId: number) => {
    try {
      setAcceptingMission(missionId);
      
      const response = await api.acceptMission(missionId);
      
      if (response.success) {
        Alert.alert(
          "✅ Mission Accepted!", 
          "Mission has been successfully added to your active missions.",
          [
            { 
              text: "Great!", 
              onPress: async () => {
                // Refresh data to show updated state
                await loadData();
                // Force a re-render by updating state
                setRefreshKey(prev => prev + 1);
                // Add a small delay to ensure UI updates
                setTimeout(() => {
                }, 200);
              }
            }
          ]
        );
      } else {
        // Handle specific error messages with better user feedback
        let errorMessage = response.message || "Please try again later.";
        let alertTitle = "⚠️ Unable to Accept Mission";
        
        if (response.error_code === "MISSION_ALREADY_COMPLETED") {
          errorMessage = "Mission ini sudah diselesaikan. Anda tidak dapat menerimanya lagi.";
          alertTitle = "✅ Mission Already Completed";
        } else if (response.error_code === "MISSION_ALREADY_ACTIVE") {
          errorMessage = "Mission ini sudah diterima dan sedang dalam progress.";
          alertTitle = "🔄 Mission Already Active";
        } else if (response.message === "Mission sudah diselesaikan") {
          errorMessage = "Mission ini sudah diselesaikan. Anda tidak dapat menerimanya lagi.";
          alertTitle = "✅ Mission Already Completed";
        } else if (response.message === "Mission sudah diterima dan sedang dalam progress") {
          errorMessage = "Mission ini sudah diterima dan sedang dalam progress.";
          alertTitle = "🔄 Mission Already Active";
        }
        
        Alert.alert(
          alertTitle,
          errorMessage,
          [
            { 
              text: "OK", 
              style: "default",
              onPress: async () => {
                // Refresh data to show current state
                await loadData();
                setRefreshKey(prev => prev + 1);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error accepting mission:", error);
      
      // Handle specific error types with better user feedback
      let errorMessage = "An unexpected error occurred. Please try again later.";
      let alertTitle = "❌ Error accepting mission";
      
      if (error instanceof Error) {
        if (error.message && error.message.includes("Conflict")) {
          errorMessage = "Mission sudah diterima atau diselesaikan sebelumnya.";
          alertTitle = "⚠️ Mission Already Processed";
        } else if (error.message && error.message.includes("Mission sudah diselesaikan")) {
          errorMessage = "Mission ini sudah diselesaikan. Anda tidak dapat menerimanya lagi.";
          alertTitle = "✅ Mission Already Completed";
        } else if (error.message && error.message.includes("Mission sudah diterima")) {
          errorMessage = "Mission ini sudah diterima dan sedang dalam progress.";
          alertTitle = "🔄 Mission Already Active";
        } else if (error.message && error.message.includes("Network") || error.message.includes("connection")) {
          errorMessage = "Tidak dapat terhubung ke server. Silakan cek koneksi internet Anda.";
          alertTitle = "🌐 Connection Error";
        }
      }
      
      Alert.alert(
        alertTitle,
        errorMessage,
        [
          { 
            text: "OK", 
            style: "default",
            onPress: async () => {
              // Refresh data to show current state
              await loadData();
              setRefreshKey(prev => prev + 1);
            }
          }
        ]
      );
    } finally {
      setAcceptingMission(null);
    }
  }`;
  
  // Replace the function
  const newContent = content.substring(0, functionStart) + improvedFunction + content.substring(functionEnd);
  
  // Write back to file
  fs.writeFileSync(filePath, newContent);
  console.log('✅ Improved error handling in DailyMissionScreen.tsx');
}

// Function to improve error handling in MissionDetailScreen
function improveMissionDetailScreenErrorHandling() {
  const filePath = 'src/screens/MissionDetailScreen.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ MissionDetailScreen.tsx not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the handleAcceptMission function
  const functionStart = content.indexOf('const handleAcceptMission = async () => {');
  if (functionStart === -1) {
    console.log('❌ handleAcceptMission function not found in MissionDetailScreen');
    return;
  }
  
  // Find the end of the function
  let braceCount = 0;
  let functionEnd = functionStart;
  let inFunction = false;
  
  for (let i = functionStart; i < content.length; i++) {
    if (content[i] === '{') {
      if (!inFunction) {
        inFunction = true;
      }
      braceCount++;
    } else if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0 && inFunction) {
        functionEnd = i + 1;
        break;
      }
    }
  }
  
  // Extract the current function
  const currentFunction = content.substring(functionStart, functionEnd);
  
  // Check if the improved error handling is already there
  if (currentFunction.includes('MISSION_ALREADY_COMPLETED')) {
    console.log('✅ Error handling already improved in MissionDetailScreen');
    return;
  }
  
  // Create improved function
  const improvedFunction = `const handleAcceptMission = async () => {
    try {
      setLoading(true);
      const response = await apiService.acceptMission(mission.id);
      
      if (response.success) {
        
        // Create new user mission data
        const newUserMissionData = {
          ...response.data,
          mission_id: mission.id,
          status: "active",
          current_value: 0,
          progress: 0,
          notes: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          points_earned: 0
        };
        
        // Validate and fix the user mission ID
        const newUserMission = validateUserMissionId(newUserMissionData);
        
        if (newUserMission) {
          setUserMission(newUserMission);
          setCurrentValue(0);
          setNotes("");
        } else {
          Alert.alert(
            "⚠️ Error",
            "Failed to create mission. Please try again.",
            [{ text: "OK", style: "default" }]
          );
          return;
        }
        
        Alert.alert(
          "✅ Mission Accepted!", 
          "Mission berhasil diterima! Sekarang Anda dapat mengupdate progress misi ini.",
          [
            { 
              text: "Mulai Update Progress", 
              onPress: async () => {
                // Refresh mission data in background
                if (onMissionUpdate) {
                  await onMissionUpdate();
                }
                // Refresh user mission data to get the latest from server
                await refreshUserMissionData();
              }
            }
          ]
        );
      } else {
        // Handle API response that indicates failure with better error messages
        let errorMessage = response.message || "Please try again later.";
        let alertTitle = "⚠️ Unable to Accept Mission";
        
        if (response.error_code === "MISSION_ALREADY_COMPLETED") {
          errorMessage = "Mission ini sudah diselesaikan. Anda tidak dapat menerimanya lagi.";
          alertTitle = "✅ Mission Already Completed";
        } else if (response.error_code === "MISSION_ALREADY_ACTIVE") {
          errorMessage = "Mission ini sudah diterima dan sedang dalam progress.";
          alertTitle = "🔄 Mission Already Active";
        }
        
        Alert.alert(
          alertTitle,
          errorMessage,
          [
            { 
              text: "OK", 
              style: "default",
              onPress: async () => {
                // Refresh user mission data to get current status
                await refreshUserMissionData();
              }
            }
          ]
        );
      }
    } catch (error) {
      // Handle specific error cases with better user feedback
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes("mission sudah diterima") || errorMessage.includes("sudah dalam progress")) {
          // If mission is already accepted, refresh the user mission data to show update mode
          Alert.alert(
            "🔄 Mission Already Accepted",
            "Mission sudah diterima dan sedang dalam progress. Halaman akan diperbarui untuk menampilkan mode update progress.",
            [
              { 
                text: "OK", 
                onPress: async () => {
                  // Refresh user mission data to get the current status
                  await refreshUserMissionData();
                }
              }
            ]
          );
        } else if (errorMessage.includes("already have this mission active")) {
          Alert.alert(
            "🔄 Mission Already Active",
            "Mission sudah aktif. Halaman akan diperbarui untuk menampilkan progress.",
            [
              { 
                text: "OK", 
                onPress: async () => {
                  // Refresh user mission data to get the current status
                  await refreshUserMissionData();
                }
              }
            ]
          );
        } else if (errorMessage.includes("mission sudah diselesaikan")) {
          Alert.alert(
            "✅ Mission Already Completed",
            "Mission ini sudah diselesaikan. Anda tidak dapat menerimanya lagi.",
            [
              { 
                text: "OK", 
                onPress: async () => {
                  // Refresh user mission data to get the current status
                  await refreshUserMissionData();
                }
              }
            ]
          );
        } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
          Alert.alert(
            "🌐 Connection Error",
            "Tidak dapat terhubung ke server. Silakan cek koneksi internet Anda.",
            [
              { 
                text: "OK", 
                style: "default" 
              }
            ]
          );
        } else {
          Alert.alert(
            "❌ Error",
            "Terjadi kesalahan saat menerima mission. Silakan coba lagi.",
            [
              { 
                text: "Try Again", 
                onPress: () => handleAcceptMission() 
              },
              { 
                text: "Cancel", 
                style: "cancel" 
              }
            ]
          );
        }
      } else {
        Alert.alert(
          "❌ Error",
          "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.",
          [
            { 
              text: "Try Again", 
              onPress: () => handleAcceptMission() 
            },
            { 
              text: "Cancel", 
              style: "cancel" 
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  }`;
  
  // Replace the function
  const newContent = content.substring(0, functionStart) + improvedFunction + content.substring(functionEnd);
  
  // Write back to file
  fs.writeFileSync(filePath, newContent);
  console.log('✅ Improved error handling in MissionDetailScreen.tsx');
}

// Main function
function main() {
  console.log('🔧 Improving Mission Acceptance Error Handling...\n');
  
  improveDailyMissionScreenErrorHandling();
  improveMissionDetailScreenErrorHandling();
  
  console.log('\n✅ Error handling improvements completed!');
  console.log('\n📋 Summary of improvements:');
  console.log('1. Better error messages for different scenarios');
  console.log('2. Automatic data refresh after error handling');
  console.log('3. More user-friendly alert titles and messages');
  console.log('4. Proper handling of network errors');
  console.log('5. Retry options for certain error types');
}

main(); 