import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Text, Button, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import { safeGoBack } from "../utils/safeNavigation";
import eventEmitter from "../utils/eventEmitter";

import MissionDetailService from "../services/MissionDetailService";


const MissionDetailScreenNew = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const { mission: initialMission, userMission: initialUserMission } = route.params;

  // State management
  const [missionData, setMissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [currentValue, setCurrentValue] = useState(0);
  const [notes, setNotes] = useState("");

  // Use initial data or loaded data
  const mission = initialMission || missionData?.mission;
  const userMission = initialUserMission || missionData?.userMission;

  // Helper function to get userMissionId from various sources
  const getUserMissionId = useCallback(() => {
    // Try multiple sources for userMissionId
    if (userMission?.id) return userMission.id;
    if (userMission?.user_mission_id) return userMission.user_mission_id;
    if (initialUserMission?.id) return initialUserMission.id;
    if (initialUserMission?.user_mission_id) return initialUserMission.user_mission_id;
    if (route.params?.userMissionId) return route.params.userMissionId;
    return null;
  }, [userMission, initialUserMission, route.params]);

  // Load mission detail data
  const loadMissionDetail = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Validate mission data first
      if (!mission?.id) {
        setError('Mission data tidak valid');
        return;
      }

      // Try to get userMissionId from multiple sources
      let userMissionId = getUserMissionId();

      const response = await MissionDetailService.getMissionDetail(
        mission.id,
        userMissionId
      );

      if (response.success && response.data) {
        setMissionData(response.data);
        
        // Set current value and notes from user mission data
        const userMissionData = response.data.userMission;
        if (userMissionData) {
          const newCurrentValue = userMissionData.current_value || 0;
          const newNotes = userMissionData.notes || "";
          
          setCurrentValue(newCurrentValue);
          setNotes(newNotes);
          // Update missionData to refresh userMission computed value
          setMissionData((prevData: any) => ({
            ...prevData,
            userMission: userMissionData
          }));
        } else {
          // If no user mission data, set defaults
          setCurrentValue(0);
          setNotes("");
          // Update missionData to clear userMission
          setMissionData((prevData: any) => ({
            ...prevData,
            userMission: null
          }));
        }
      } else {
        const errorMessage = response.message || 'Failed to load mission detail';
        setError(errorMessage);
        console.error('❌ MissionDetailScreenNew: Failed to load mission detail:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ MissionDetailScreenNew: Error loading mission detail:', error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, [mission?.id, userMission?.id, initialUserMission, route.params, getUserMissionId, route.params?.refresh]);

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated && mission?.id) {
      loadMissionDetail();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, mission?.id, loadMissionDetail, route.params?.refresh]);

  // Listen for mission events to refresh data
  useEffect(() => {
    const handleMissionAccepted = (data: any) => {
      if (data && data.mission_id === mission?.id) {
        // Navigate to DailyMission when mission is accepted from external event
        MissionDetailService.clearAllCache();
        navigation.navigate('DailyMission');
      }
    };

    const handleMissionReactivated = (data: any) => {
      if (data && data.mission_id === mission?.id) {
        // Navigate to DailyMission when mission is reactivated from external event
        MissionDetailService.clearAllCache();
        navigation.navigate('DailyMission');
      }
    };

    const handleMissionCompleted = (data: any) => {
      if (data && data.mission_id === mission?.id) {
        forceRefresh();
      }
    };

    // Add event listeners
    eventEmitter.on('missionAccepted', handleMissionAccepted);
    eventEmitter.on('missionReactivated', handleMissionReactivated);
    eventEmitter.on('missionCompleted', handleMissionCompleted);

    // Cleanup event listeners on unmount
    return () => {
      eventEmitter.off('missionAccepted', handleMissionAccepted);
      eventEmitter.off('missionReactivated', handleMissionReactivated);
      eventEmitter.off('missionCompleted', handleMissionCompleted);
    };
  }, [mission?.id, loadMissionDetail, mission]);

  // Removed tracking integration - no longer needed for manual progress updates

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadMissionDetail(false);
  }, [loadMissionDetail]);

  // Force aggressive refresh function
  const forceRefresh = useCallback(async () => {
    
    // Clear cache
    MissionDetailService.clearAllCache();
    
    // Clear all state
    setMissionData(null);
    setCurrentValue(0);
    setNotes("");
    setError(null);
    
    // Force loading state
    setLoading(true);
    
    // Load fresh data
    await loadMissionDetail(true);
    
    // Additional refresh
    setTimeout(async () => {
      await loadMissionDetail(false);
    }, 500);
    
    // Force navigation refresh
    setTimeout(() => {
      navigation.setParams({
        ...route.params,
        refresh: Date.now()
      });
    }, 100);
    
    // Force complete page refresh as final fallback
    setTimeout(() => {
      navigation.replace('MissionDetail', {
        ...route.params,
        mission: mission,
        userMission: null, // Clear userMission to force fresh load
        forceRefresh: Date.now()
      });
    }, 1500);
  }, [loadMissionDetail, navigation, route.params, mission]);

  // Handle accept mission
  const handleAcceptMission = async () => {
    try {
      setActionLoading(true);
      
      const response = await MissionDetailService.acceptMission(mission.id);
      
      if (response.success) {
        // Emit mission accepted event for real-time updates
        eventEmitter.emit('missionAccepted', response.data);
        
        // Show success message and refresh immediately after OK is clicked
        Alert.alert(
          "✅ Mission Accepted!",
          "Mission berhasil diterima! Anda sekarang dapat mengupdate progress misi ini.",
          [
            { 
              text: "OK", 
              onPress: async () => {
                // Clear cache and navigate to DailyMission
                MissionDetailService.clearAllCache();
                navigation.navigate('DailyMission');
              }
            }
          ]
        );
      } else {
        Alert.alert("⚠️ Unable to Accept Mission", response.message || "Please try again later.");
      }
    } catch (error) {
      console.error('❌ Error accepting mission:', error);
      Alert.alert("❌ Error", "Failed to accept mission. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reactivate mission
  const handleReactivateMission = async () => {
    // Get user mission ID using helper function
    const userMissionId = getUserMissionId();
    
    if (!userMissionId || typeof userMissionId !== 'number') {
      Alert.alert(
        "⚠️ Mission Data Issue",
        "ID mission tidak valid untuk reactivate. Silakan refresh data atau pilih mission lain.",
        [
          { 
            text: "Refresh Data", 
            onPress: async () => {
              await loadMissionDetail(false);
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }

    try {
      setActionLoading(true);
      
      const response = await MissionDetailService.reactivateMission(userMissionId);
      
      if (response.success) {
        // Emit mission reactivated event for real-time updates
        eventEmitter.emit('missionReactivated', response.data);
        
        // Show success message and refresh immediately after OK is clicked
        Alert.alert(
          "✅ Mission Reactivated!",
          "Mission berhasil diaktifkan kembali! Anda sekarang dapat mengupdate progress misi ini.",
          [
            { 
              text: "OK", 
              onPress: async () => {
                // Clear cache and navigate to DailyMission
                MissionDetailService.clearAllCache();
                navigation.navigate('DailyMission');
              }
            }
          ]
        );
      } else {
        Alert.alert("⚠️ Unable to Reactivate Mission", response.message || "Please try again later.");
      }
    } catch (error) {
      console.error('❌ Error reactivating mission:', error);
      Alert.alert("❌ Error", "Failed to reactivate mission. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update progress
  const handleUpdateProgress = async () => {
    // Enhanced validation with better error messages
    if (!userMission) {
      Alert.alert(
        "⚠️ Mission Data Issue",
        "Data mission tidak ditemukan. Silakan refresh data atau pilih mission lain.",
        [
          { 
            text: "Refresh Data", 
            onPress: async () => {
              await loadMissionDetail(false);
            }
          },
          { 
            text: "Go Back", 
            onPress: () => {
              safeGoBack(navigation, 'Main');
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }

    // Check if userMission has valid ID using helper function
    const userMissionId = getUserMissionId();
    if (!userMissionId || typeof userMissionId !== 'number') {
      console.log('❌ userMissionId is missing or invalid (New):', userMissionId);
      console.log('🔍 Full userMission object:', userMission);
      
      // Try to reload mission detail to get fresh data
      console.log('🔄 Attempting to reload mission detail to get fresh userMission data...');
      try {
        await loadMissionDetail(false);
        
        // Check if we now have valid userMission data
        const updatedUserMission = initialUserMission || missionData?.userMission;
        const updatedUserMissionId = getUserMissionId();
        if (updatedUserMissionId && typeof updatedUserMissionId === 'number') {
          console.log('✅ Successfully reloaded userMission data with valid ID:', updatedUserMissionId);
          // Continue with the updated data
        } else {
          console.log('❌ Still no valid userMission ID after reload');
          Alert.alert(
            "⚠️ Mission Data Issue",
            "ID mission tidak valid. Silakan refresh data atau pilih mission lain.",
            [
              { 
                text: "Refresh Data", 
                onPress: async () => {
                  await loadMissionDetail(false);
                }
              },
              { 
                text: "Go Back", 
                onPress: () => {
                  safeGoBack(navigation, 'Main');
                }
              },
              { text: "Cancel", style: "cancel" }
            ]
          );
          return;
        }
      } catch (error) {
        console.error('❌ Error reloading mission detail:', error);
        Alert.alert(
          "⚠️ Mission Data Issue",
          "ID mission tidak valid. Silakan refresh data atau pilih mission lain.",
          [
            { 
              text: "Refresh Data", 
              onPress: async () => {
                await loadMissionDetail(false);
              }
            },
            { 
              text: "Go Back", 
              onPress: () => {
                safeGoBack(navigation, 'Main');
              }
            },
            { text: "Cancel", style: "cancel" }
          ]
        );
        return;
      }
    }
    
    // Enhanced validation for current value
    if (typeof currentValue !== 'number' || currentValue < 0) {
      Alert.alert(
        "⚠️ Invalid Progress Value",
        "Nilai progress tidak valid. Silakan masukkan angka yang valid (minimal 0).",
        [{ text: "OK" }]
      );
      return;
    }

    // Check if current value is reasonable (not too high)
    if (currentValue > mission.target_value * 2) {
      Alert.alert(
        "⚠️ Unusual Progress Value",
        `Nilai progress (${currentValue}) jauh melebihi target (${mission.target_value}). Apakah Anda yakin dengan nilai ini?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes, Continue", onPress: () => handleUpdateProgress() }
        ]
      );
      return;
    }
    
    // Check if mission is already completed
    if (userMission.status === "completed") {
      Alert.alert(
        "✅ Mission Already Completed",
        "Mission ini sudah diselesaikan. Anda tidak dapat mengupdate progress lagi.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Check if mission is cancelled
    if (userMission.status === "cancelled") {
      Alert.alert(
        "❌ Mission Cancelled",
        "Mission ini sudah dibatalkan. Anda tidak dapat mengupdate progress.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Use the helper function to get userMissionId
    const finalUserMissionId = getUserMissionId();
    
    if (!finalUserMissionId || typeof finalUserMissionId !== 'number') {
      
      Alert.alert(
        "⚠️ Mission Data Issue",
        "ID mission tidak valid. Silakan refresh data atau pilih mission lain.",
        [
          { 
            text: "Refresh Data", 
            onPress: async () => {
              await loadMissionDetail(false);
            }
          },
          { 
            text: "Go Back", 
            onPress: () => {
              safeGoBack(navigation, 'Main');
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }

    console.log('🔍 Using userMissionId for update:', finalUserMissionId);
    console.log('🔍 Current value:', currentValue);
    console.log('🔍 Mission target value:', mission.target_value);
    
    // Show confirmation dialog for progress update
    const progressPercentage = Math.round((currentValue / mission.target_value) * 100);
    const willComplete = currentValue >= mission.target_value;
    
    Alert.alert(
      "📊 Update Progress",
      `Apakah Anda yakin ingin mengupdate progress mission ini?\n\n` +
      `📈 Nilai saat ini: ${currentValue} ${mission.unit}\n` +
      `🎯 Target: ${mission.target_value} ${mission.unit}\n` +
      `📊 Progress: ${progressPercentage}%\n\n` +
      `${willComplete ? '🎉 Mission akan diselesaikan!' : '🔄 Mission akan tetap aktif.'}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: willComplete ? "Complete Mission" : "Update Progress",
          onPress: async () => {
            try {
              setActionLoading(true);
              
              console.log('🔄 Sending update request to API...');
              console.log('🔍 userMissionId being sent:', finalUserMissionId);
              const response = await MissionDetailService.updateMissionProgress(finalUserMissionId, {
                current_value: currentValue,
                notes: notes,
              });
              
                              if (response.success) {
                  // Emit mission updated event for real-time updates
                  eventEmitter.emit('missionUpdated', response.data);
                  
                  if (response.message === "Mission completed!" || (response.data && typeof response.data === 'object' && 'status' in response.data && response.data.status === "completed")) {
                    // Emit mission completed event for real-time updates
                    eventEmitter.emit('missionCompleted', response.data);
                    
                    const pointsEarned = (response.data as any)?.points_earned || mission.points;
                    Alert.alert(
                      "🎉 Selamat!", 
                      `Mission berhasil diselesaikan!\n\n` +
                      `🏆 Anda mendapatkan ${pointsEarned} poin!\n` +
                      `📊 Progress: 100%\n` +
                      `✅ Status: Completed`,
                      [
                        { 
                          text: "Keren!", 
                          onPress: async () => {
                            // Clear cache and refresh data before navigating to DailyMission
                            MissionDetailService.clearAllCache();
                            await loadMissionDetail(false);
                            navigation.navigate('DailyMission');
                          }
                        }
                      ]
                    );
                } else {
                  const newProgress = Math.round((currentValue / mission.target_value) * 100);
                  Alert.alert(
                    "✅ Progress Diupdate", 
                    `Progress mission berhasil diupdate.\n\n` +
                    `📊 Progress baru: ${newProgress}%\n` +
                    `📈 Nilai: ${currentValue} / ${mission.target_value} ${mission.unit}\n` +
                    `🔄 Status: Active`,
                                          [
                        { 
                          text: "Lanjutkan", 
                          onPress: async () => {
                            // Clear cache and refresh data
                            MissionDetailService.clearAllCache();
                            await loadMissionDetail(false);
                          }
                        }
                      ]
                  );
                }
              } else {
                // Handle API error response
                const errorMessage = response.message || 'Gagal mengupdate progress mission';
                console.error('❌ API Error:', errorMessage);
                Alert.alert(
                  "❌ Update Failed",
                  errorMessage,
                  [
                    { 
                      text: "Retry", 
                      onPress: () => handleUpdateProgress()
                    },
                    { text: "Cancel", style: "cancel" }
                  ]
                );
              }
            } catch (error) {
              console.error('❌ Error updating mission progress:', error);
              Alert.alert(
                "❌ Error",
                "Terjadi kesalahan saat mengupdate progress. Silakan coba lagi.",
                [
                  { 
                    text: "Retry", 
                    onPress: () => handleUpdateProgress()
                  },
                  { text: "Cancel", style: "cancel" }
                ]
              );
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };



  // Handle abandon mission
  const handleAbandonMission = async () => {
    // Get user mission ID using helper function
    const userMissionId = getUserMissionId();
    
    if (!userMissionId || typeof userMissionId !== 'number') {
      console.log('❌ userMissionId is missing or invalid for abandon:', userMissionId);
      Alert.alert(
        "⚠️ Mission Data Issue",
        "ID mission tidak valid untuk abandon. Silakan refresh data atau pilih mission lain.",
        [
          { 
            text: "Refresh Data", 
            onPress: async () => {
              await loadMissionDetail(false);
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }

    Alert.alert(
      "⚠️ Abandon Mission",
      "Are you sure you want to abandon this mission? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Abandon",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              console.log('🔄 Abandoning mission with ID:', userMissionId);
              const response = await MissionDetailService.abandonMission(userMissionId);
              
              if (response.success) {
                // Emit mission abandoned event for real-time updates
                eventEmitter.emit('missionAbandoned', response.data);
                
                Alert.alert("✅ Mission Abandoned", "Mission has been successfully abandoned.", [
                  { text: "OK", onPress: () => navigation.navigate('DailyMission') }
                ]);
              } else {
                Alert.alert("⚠️ Unable to Abandon Mission", response.message || "Please try again later.");
              }
            } catch (error) {
              console.error('❌ Error abandoning mission:', error);
              Alert.alert("❌ Error", "Failed to abandon mission. Please try again.");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // Helper functions
  const getProgressPercentage = () => {
    if (!userMission || !mission?.target_value) return 0;
    return Math.min(Math.round((currentValue / mission.target_value) * 100), 100);
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("Login");
    }
  }, [isAuthenticated, navigation]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={mission?.color || "#64748B"} />
          <Text style={styles.loadingText}>Loading mission data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Mission</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button mode="contained" onPress={() => loadMissionDetail()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // No mission data
  if (!mission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="help-circle" size={48} color="#64748B" />
          <Text style={styles.errorTitle}>Mission Not Found</Text>
          <Text style={styles.errorMessage}>The requested mission could not be found.</Text>
          <Button mode="contained" onPress={() => safeGoBack(navigation, 'Main')} style={styles.retryButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = userMission?.status === "completed";
  const isActive = userMission?.status === "active";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[mission.color || "#64748B"]}
            tintColor={mission.color || "#64748B"}
          />
        }
      >
        {/* Mission Card */}
        <View style={styles.missionCardContainer}>
          <View style={styles.missionCard}>
            <View style={styles.missionCardContent}>
              <View style={styles.leftContent}>
                <View style={[styles.iconContainer, { backgroundColor: (mission.color || "#64748B") + "20" }]}>
                  <Icon name={mission.icon || "help-circle"} size={32} color={mission.color || "#64748B"} />
                  {userMission && (
                    <View style={[styles.statusBadgeIcon, { 
                      backgroundColor: userMission.status === "completed" ? "#10B981" : 
                                     userMission.status === "active" ? "#3B82F6" : "#F59E0B"
                    }]}>
                      <Text style={styles.statusBadgeIconText}>
                        {userMission.status === "completed" ? "✓" : 
                         userMission.status === "active" ? "▶" : "●"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.missionTitle}>{mission.title || "Untitled Mission"}</Text>
                  <Text style={styles.missionSubtitle}>{mission.description || "No description available"}</Text>
                </View>
              </View>
              <View style={styles.rightContent}>
                <View style={styles.pointsContainer}>
                  <Icon name="star" size={16} color="#F59E0B" />
                  <Text style={styles.pointsText}>{mission.points || 0}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Mission Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Icon name="target" size={20} color="#64748B" />
            <Text style={styles.detailLabel}>Target:</Text>
            <Text style={styles.detailValue}>{mission.target_value || 0} {mission.unit || ""}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="tag" size={20} color="#64748B" />
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>
              {mission.category ? mission.category.replace("_", " ").split(" ").map((word: string) => 
                word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Unknown"}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        {userMission ? (
          <View style={styles.progressContainer}>
            <View style={styles.statusHeader}>
              <Text style={styles.sectionTitle}>Your Progress</Text>
              <View style={[styles.statusBadge, { 
                backgroundColor: userMission.status === "completed" ? "#10B981" : 
                               userMission.status === "active" ? "#3B82F6" : "#F59E0B"
              }]}>
                <Text style={styles.statusText}>
                  {userMission.status === "completed" ? "✅ Completed" : 
                   userMission.status === "active" ? "🔄 Active" : "⏳ Pending"}
                </Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Current Progress</Text>
                <Text style={styles.progressPercentage}>{getProgressPercentage()}%</Text>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: mission.color || "#64748B",
                }]} />
              </View>

              <Text style={styles.progressText}>
                {currentValue} / {mission.target_value || 0} {mission.unit || ""}
              </Text>
            </View>



            {/* Update Section for Active Missions */}
            {isActive && (
              <View style={styles.updateSection}>
                <Text style={styles.sectionTitle}>Update Progress</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Current Value: <Text style={styles.requiredText}>*</Text>
                  </Text>
                  <TextInput
                    mode="outlined"
                    value={currentValue.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      setCurrentValue(value);
                    }}
                    keyboardType="numeric"
                    style={styles.input}
                    outlineColor="#E2E8F0"
                    activeOutlineColor={mission.color || "#64748B"}
                    placeholder={`Enter value (0-${mission.target_value})`}
                    maxLength={5}
                  />
                  <Text style={styles.inputHelper}>
                    Target: {mission.target_value} {mission.unit}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Notes (Optional):</Text>
                  <TextInput
                    mode="outlined"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    outlineColor="#E2E8F0"
                    activeOutlineColor={mission.color || "#64748B"}
                    placeholder="Add notes about your progress..."
                    maxLength={200}
                  />
                  <Text style={styles.inputHelper}>
                    {notes.length}/200 characters
                  </Text>
                </View>

                {/* Progress Preview */}
                <View style={styles.progressPreview}>
                  <Text style={styles.progressPreviewLabel}>Progress Preview:</Text>
                  <View style={styles.progressPreviewBar}>
                    <View 
                      style={[
                        styles.progressPreviewFill, 
                        { 
                          width: `${Math.min((currentValue / mission.target_value) * 100, 100)}%`,
                          backgroundColor: mission.color || "#64748B"
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressPreviewText}>
                    {currentValue} / {mission.target_value} {mission.unit} ({Math.round((currentValue / mission.target_value) * 100)}%)
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={handleUpdateProgress}
                  loading={actionLoading}
                  disabled={actionLoading || !userMission || userMission.status !== "active" || currentValue < 0}
                  style={[
                    styles.button, 
                    { 
                      backgroundColor: mission.color || "#64748B",
                      opacity: (!userMission || userMission.status !== "active" || currentValue < 0) ? 0.6 : 1
                    }
                  ]}
                  contentStyle={styles.buttonContent}
                >
                  {actionLoading 
                    ? '🔄 Updating Progress...' 
                    : !userMission 
                      ? '❌ Mission Not Available'
                      : userMission.status === "completed"
                        ? '✅ Mission Completed'
                        : userMission.status === "cancelled"
                          ? '❌ Mission Cancelled'
                          : currentValue < 0
                            ? '⚠️ Invalid Value'
                            : `📊 Update Progress (${Math.round((currentValue / mission.target_value) * 100)}%)`
                  }
                </Button>

                {/* Validation Messages */}
                {currentValue > mission.target_value && (
                  <View style={styles.validationMessage}>
                    <Text style={styles.validationText}>
                      ⚠️ Value exceeds target. Mission will be marked as completed.
                    </Text>
                  </View>
                )}
                
                {currentValue < 0 && (
                  <View style={styles.validationMessage}>
                    <Text style={styles.validationText}>
                      ❌ Please enter a valid positive number.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Completed Mission Message */}
            {isCompleted && (
              <View style={styles.completedMessageContainer}>
                <Text style={styles.completedMessageTitle}>Mission Completed!</Text>
                <Text style={styles.completedMessageText}>
                  This mission has been completed. You cannot update progress for completed missions.
                </Text>
                {userMission.points_earned && (
                  <Text style={styles.pointsEarnedText}>Points earned: {userMission.points_earned}</Text>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <Text style={styles.sectionTitle}>Mission Details</Text>
            <Text style={styles.detailValue}>No user mission data available for this mission.</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!userMission ? (
            <Button
              mode="contained"
              onPress={handleAcceptMission}
              loading={actionLoading}
              disabled={actionLoading}
              style={[styles.button, { backgroundColor: mission.color || "#64748B" }]}
              contentStyle={styles.buttonContent}
            >
              Accept Mission
            </Button>
          ) : isActive ? (
            <Button
              mode="outlined"
              onPress={handleAbandonMission}
              loading={actionLoading}
              disabled={actionLoading}
              style={[styles.button, styles.abandonButton]}
              contentStyle={styles.buttonContent}
              textColor="#EF4444"
            >
              Abandon Mission
            </Button>
          ) : isCompleted ? (
            <View style={styles.completedContainer}>
              <Text style={styles.completedTitle}>Mission Completed!</Text>
              <Text style={styles.completedSubtitle}>You earned {userMission.points_earned} points</Text>
            </View>
          ) : userMission.status === "cancelled" ? (
            <Button
              mode="contained"
              onPress={handleReactivateMission}
              loading={actionLoading}
              disabled={actionLoading}
              style={[styles.button, { backgroundColor: "#10B981" }]}
              contentStyle={styles.buttonContent}
            >
              Reactivate Mission
            </Button>
          ) : (
            <View style={styles.completedContainer}>
              <Text style={styles.completedTitle}>Mission Status Unknown</Text>
              <Text style={styles.completedSubtitle}>Status: {userMission.status}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 12,
    backgroundColor: "#3B82F6",
  },
  missionCardContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  missionCard: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  missionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightContent: {
    marginLeft: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  statusBadgeIcon: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeIconText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 24,
    color: "#1F2937",
  },
  missionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#64748B",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
    marginLeft: 4,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 12,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  progressCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },

  updateSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  button: {
    borderRadius: 12,
    marginBottom: 12,
  },

  buttonContent: {
    paddingVertical: 8,
  },
  abandonButton: {
    borderColor: "#EF4444",
  },
  completedContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 12,
    marginBottom: 4,
  },
  completedSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  completedMessageContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 16,
    alignItems: "center",
  },
  completedMessageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 8,
  },
  completedMessageText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 12,
  },
  pointsEarnedText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  // New styles for improved update progress UI
  requiredText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
  inputHelper: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontStyle: "italic",
  },
  progressPreview: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  progressPreviewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  progressPreviewBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressPreviewFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressPreviewText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },
  validationMessage: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  validationText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "500",
    textAlign: "center",
  },
});

export default MissionDetailScreenNew;
