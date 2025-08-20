import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text, Button, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";

const MissionDetailScreen = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const { mission, userMission: initialUserMission, onMissionUpdate } = route.params;

  // Validate mission object
  if (!mission) {
    return (
      <View style={styles.container}>
        <Text>Mission not found</Text>
      </View>
    );
  }

  // Use local state for userMission to allow real-time updates
  const [userMission, setUserMission] = useState(initialUserMission);
  const [currentValue, setCurrentValue] = useState(
    initialUserMission?.current_value || 0
  );
  const [notes, setNotes] = useState(initialUserMission?.notes || "");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);

  // Remove automatic focus refresh - manual refresh only
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     // Only refresh if we don't have userMission data
  //     if (!userMission) {
  //       refreshUserMissionData();
  //     }
  //   });

  //   return unsubscribe;
  // }, [navigation, userMission]);

  // Load user mission data on component mount
  useEffect(() => {
    // Only load if we don't have initial userMission data
    if (!initialUserMission) {
      refreshUserMissionData();
    } else {
      // Validate the initial user mission data
      const validatedUserMission = validateUserMissionId(initialUserMission);
      if (validatedUserMission) {
        setUserMission(validatedUserMission);
        setCurrentValue(validatedUserMission.current_value || 0);
        setNotes(validatedUserMission.notes || "");
      } else {
        refreshUserMissionData();
      }
    }
  }, []); // Empty dependency array to run only once

  // Timer for cooldown countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (userMission && userMission.status === "cancelled" && userMission.cancelled_at) {
      const timeInfo = calculateTimeRemaining(userMission.cancelled_at);
      
      if (!timeInfo.canReactivate) {
        // Update timer every minute
        interval = setInterval(() => {
          setCooldownTimer(prev => prev + 1);
        }, 60000); // Update every minute
      }
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [userMission]);

  // Function to calculate time remaining for reactivation
  const calculateTimeRemaining = (cancelledAt: string) => {
    const cancelledTime = new Date(cancelledAt).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - cancelledTime;
    const hoursRemaining = Math.max(0, 24 - Math.floor(timeDiff / (1000 * 60 * 60)));
    
    return {
      hoursRemaining,
      canReactivate: hoursRemaining === 0
    };
  };

  const handleReactivateMission = async () => {
    try {
      setReactivateLoading(true);
      const response = await apiService.reactivateMission(userMission.id);
      
      if (response.success) {
        // Update local state
        setUserMission({
          ...userMission,
          status: "active",
          cancelled_at: null
        });
        
        Alert.alert(
          "✅ Mission Reactivated!",
          "Mission berhasil diaktifkan kembali. Anda dapat melanjutkan progress misi ini.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "⚠️ Unable to Reactivate",
          response.message || "Please try again later.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "❌ Error",
        "Failed to reactivate mission. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setReactivateLoading(false);
    }
  };

  // Function to validate and fix user mission ID
  const validateUserMissionId = (userMissionData: any) => {
    if (!userMissionData) return null;
    
    // Check for possible ID fields
    const possibleIds = [
      userMissionData.id,
      userMissionData.user_mission_id,
      userMissionData.mission_id
    ];
    
    const validId = possibleIds.find(id => id != null && id !== undefined);
    
    if (validId) {
      return {
        ...userMissionData,
        id: validId
      };
    }
    
    return null;
  };

  // Function to refresh user mission data
  const refreshUserMissionData = async () => {
    try {
      setDataLoading(true);
      const response = await apiService.getMyMissions();
      if (response.success && response.data) {
        const updatedUserMission = response.data.find(
          (um: any) => um.mission_id === mission.id
        );
        if (updatedUserMission) {
          // Validate and fix the user mission ID
          const validUserMission = validateUserMissionId(updatedUserMission);
          if (validUserMission) {
            setUserMission(validUserMission);
            setCurrentValue(validUserMission.current_value || 0);
            setNotes(validUserMission.notes || "");
          } else {
            setUserMission(null);
          }
        } else {
          setUserMission(null);
        }
      }
    } catch (error) {
      console.error("Error refreshing user mission data:", error);
      setUserMission(null);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    // Mission detail screen requires authentication
    if (!isAuthenticated) {
      navigation.replace("Login");
    }
  }, [isAuthenticated, navigation]);

  const handleAcceptMission = async () => {
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
        // Handle API response that indicates failure
        Alert.alert(
          "⚠️ Unable to Accept Mission",
          response.message || "Please try again later.",
          [{ text: "OK", style: "default" }]
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
        } else if (errorMessage.includes("sudah diselesaikan") || errorMessage.includes("sudah dibatalkan")) {
          Alert.alert(
            "🔄 Mission Status Error",
            error.message,
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
        } else {
          Alert.alert(
            "❌ Error",
            error.message || "Failed to accept mission. Please try again.",
            [{ text: "OK", style: "default" }]
          );
        }
      } else {
        Alert.alert(
          "❌ Error",
          "Failed to accept mission. Please try again.",
          [{ text: "OK", style: "default" }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      setLoading(true);
      
      // Check if userMission has a valid ID
      if (!userMission || !userMission.id) {
        Alert.alert(
          "⚠️ Mission Not Found",
          "Mission data tidak valid. Silakan refresh halaman dan coba lagi.",
          [
            { 
              text: "Refresh Data", 
              onPress: async () => {
                await refreshUserMissionData();
              }
            },
            { text: "Cancel", style: "cancel" }
          ]
        );
        return;
      }
      
      const response = await apiService.updateMissionProgress(userMission.id, {
        current_value: currentValue,
        notes: notes,
      });
      
      if (response.success) {
        // Update local state immediately
        const updatedUserMission = {
          ...userMission,
          current_value: currentValue,
          notes: notes,
          progress: Math.round((currentValue / mission.target_value) * 100),
          updated_at: new Date().toISOString()
        };
        setUserMission(updatedUserMission);
        
        if (response.message === "Mission completed!") {
          // Update status to completed
          updatedUserMission.status = "completed";
          setUserMission(updatedUserMission);
          
          Alert.alert(
            "🎉 Congratulations!", 
            "Mission completed successfully! You've earned points!",
            [
              { 
                text: "Awesome!", 
                onPress: async () => {
                  // Refresh mission data
                  if (onMissionUpdate) {
                    await onMissionUpdate();
                  }
                  // Refresh local data
                  await refreshUserMissionData();
                  safeGoBack(navigation, 'Main');
                }
              }
            ]
          );
        } else {
          // Progress updated but not completed
          Alert.alert(
            "📊 Progress Updated", 
            "Your mission progress has been updated successfully.",
            [
              { 
                text: "Continue", 
                onPress: async () => {
                  // Refresh mission data
                  if (onMissionUpdate) {
                    await onMissionUpdate();
                  }
                  // Refresh local data
                  await refreshUserMissionData();
                }
              }
            ]
          );
        }
      } else {
        // Handle API response that indicates failure
        Alert.alert(
          "⚠️ Unable to Update Progress",
          response.message || "Please try again later.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      // Handle specific error cases with better user feedback
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes("server error") || errorMessage.includes("500")) {
          Alert.alert(
            "🌐 Server Temporarily Unavailable",
            "Our servers are experiencing high traffic. Please try again in a few minutes.",
            [
              { text: "Try Again", onPress: () => handleUpdateProgress() },
              { text: "Cancel", style: "cancel" }
            ]
          );
        } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
          Alert.alert(
            "📡 Connection Issue",
            "Please check your internet connection and try again.",
            [
              { text: "Retry", onPress: () => handleUpdateProgress() },
              { text: "Cancel", style: "cancel" }
            ]
          );
        } else if (errorMessage.includes("authentication") || errorMessage.includes("login")) {
          Alert.alert(
            "🔐 Authentication Required",
            "Please login again to access this feature.",
            [
              { text: "Login", onPress: () => navigation.navigate("Login") },
              { text: "Cancel", style: "cancel" }
            ]
          );
        } else if (errorMessage.includes("invalid") || errorMessage.includes("not found")) {
          Alert.alert(
            "❌ Mission Not Found",
            "This mission may have been removed or is no longer available.",
            [{ text: "OK", style: "default" }]
          );
        } else {
          // Generic error handling
          Alert.alert(
            "❌ Unable to Update Progress",
            "An unexpected error occurred. Please try again later.",
            [
              { text: "Try Again", onPress: () => handleUpdateProgress() },
              { text: "Cancel", style: "cancel" }
            ]
          );
        }
      } else {
        // Fallback for non-Error objects
        Alert.alert(
          "❌ Error",
          "An unexpected error occurred. Please try again later.",
          [{ text: "OK", style: "default" }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonMission = async () => {
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
              setLoading(true);
              const response = await apiService.abandonMission(userMission.id);
              
              if (response.success) {
                Alert.alert(
                  "✅ Mission Abandoned", 
                  "Mission has been successfully abandoned.",
                  [
                    { 
                      text: "OK", 
                      onPress: () => {
                        // Refresh mission data
                        if (onMissionUpdate) {
                          onMissionUpdate();
                        }
                        safeGoBack(navigation, 'Main');
                      }
                    }
                  ]
                );
              } else {
                // Handle API response that indicates failure
                Alert.alert(
                  "⚠️ Unable to Abandon Mission",
                  response.message || "Please try again later.",
                  [{ text: "OK", style: "default" }]
                );
              }
            } catch (error) {
              // Handle specific error cases with better user feedback
              if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                
                if (errorMessage.includes("server error") || errorMessage.includes("500")) {
                  Alert.alert(
                    "🌐 Server Temporarily Unavailable",
                    "Our servers are experiencing high traffic. Please try again in a few minutes.",
                    [
                      { text: "Try Again", onPress: () => handleAbandonMission() },
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
                  Alert.alert(
                    "📡 Connection Issue",
                    "Please check your internet connection and try again.",
                    [
                      { text: "Retry", onPress: () => handleAbandonMission() },
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                } else if (errorMessage.includes("authentication") || errorMessage.includes("login")) {
                  Alert.alert(
                    "🔐 Authentication Required",
                    "Please login again to access this feature.",
                    [
                      { text: "Login", onPress: () => navigation.navigate("Login") },
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                } else if (errorMessage.includes("invalid") || errorMessage.includes("not found")) {
                  Alert.alert(
                    "❌ Mission Not Found",
                    "This mission may have been removed or is no longer available.",
                    [{ text: "OK", style: "default" }]
                  );
                } else {
                  // Generic error handling
                  Alert.alert(
                    "❌ Unable to Abandon Mission",
                    "An unexpected error occurred. Please try again later.",
                    [
                      { text: "Try Again", onPress: () => handleAbandonMission() },
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                }
              } else {
                // Fallback for non-Error objects
                Alert.alert(
                  "❌ Error",
                  "An unexpected error occurred. Please try again later.",
                  [{ text: "OK", style: "default" }]
                );
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return "#64748B";
    
    switch (difficulty) {
      case "easy":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "hard":
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  const getProgressPercentage = () => {
    if (!userMission || !mission.target_value) return 0;
    
    // Use currentValue from state for real-time updates
    const progressValue = Math.min(
      Math.round((currentValue / mission.target_value) * 100),
      100
    );
    
    return progressValue;
  };

  const isCompleted = userMission?.status === "completed";
  const isActive = userMission?.status === "active";

  return (
    <SafeAreaView style={styles.container}>
      {dataLoading && !userMission ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={mission.color} />
          <Text style={styles.loadingText}>Loading mission data...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Mission Card - Available Style */}
        <View style={styles.missionCardContainer}>
          <View style={styles.missionCard}>
            <View style={styles.missionCardContent}>
              <View style={styles.leftContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { 
                      backgroundColor: (mission.color || "#64748B") + "20",
                    },
                  ]}
                >
                  <Icon 
                    name={mission.icon || "help-circle"} 
                    size={32} 
                    color={mission.color || "#64748B"} 
                  />
                  {userMission && (
                    <View style={[styles.statusBadgeIcon, { 
                      backgroundColor: userMission.status === "completed" ? "#10B981" : 
                                     userMission.status === "active" ? "#3B82F6" : 
                                     userMission.status === "cancelled" ? "#EF4444" : "#F59E0B"
                    }]}>
                      <Text style={styles.statusBadgeIconText}>
                        {userMission.status === "completed" ? "✓" : 
                         userMission.status === "active" ? "▶" : 
                         userMission.status === "cancelled" ? "✕" : "●"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.missionTitle}>
                    {mission.title || "Untitled Mission"}
                  </Text>
                  <Text style={styles.missionSubtitle}>
                    {mission.description || "No description available"}
                  </Text>
                </View>
              </View>
              <View style={styles.rightContent}>
                <View style={styles.missionMeta}>
                  <View
                    style={[
                      styles.difficultyBadge,
                      {
                        backgroundColor: getDifficultyColor(mission.difficulty || "medium"),
                      },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {mission.difficulty ? mission.difficulty.charAt(0).toUpperCase() +
                        mission.difficulty.slice(1) : "Unknown"}
                    </Text>
                  </View>
                  <View style={styles.pointsContainer}>
                    <Icon name="star" size={16} color="#F59E0B" />
                    <Text style={styles.pointsText}>{mission.points || 0}</Text>
                  </View>
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
            <Text style={styles.detailValue}>
              {mission.target_value || 0} {mission.unit || ""}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color="#64748B" />
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>
              {mission.type ? mission.type.charAt(0).toUpperCase() + mission.type.slice(1) : "Unknown"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="tag" size={20} color="#64748B" />
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>
              {mission.category
                ? mission.category
                    .replace("_", " ")
                    .split(" ")
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                : "Unknown"}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        {userMission ? (
          <View style={styles.progressContainer}>
            <View style={styles.statusHeader}>
              <Text style={styles.sectionTitle}>Your Progress</Text>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: userMission.status === "completed" ? "#10B981" : userMission.status === "active" ? "#3B82F6" : "#F59E0B"
                }
              ]}>
                <Text style={styles.statusText}>
                  {userMission.status === "completed" ? "✅ Completed" : userMission.status === "active" ? "🔄 Active" : "⏳ Pending"}
                </Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Current Progress</Text>
                <Text style={styles.progressPercentage}>
                  {getProgressPercentage()}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: mission.color || "#64748B",
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {currentValue} / {mission.target_value || 0}{" "}
                {mission.unit || ""}
              </Text>
            </View>

            {userMission && userMission.status === "active" && (
              <View style={styles.updateSection}>
                <Text style={styles.sectionTitle}>Update Progress</Text>
                
                {!userMission.id && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                      ⚠️ Mission ID tidak valid. Silakan refresh halaman.
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={refreshUserMissionData}
                      style={styles.refreshButton}
                      textColor="#991B1B"
                    >
                      Refresh Data
                    </Button>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Current Value:</Text>
                  <TextInput
                    mode="outlined"
                    value={currentValue.toString()}
                    onChangeText={(text) =>
                      setCurrentValue(parseInt(text) || 0)
                    }
                    keyboardType="numeric"
                    style={styles.input}
                    outlineColor="#E2E8F0"
                    activeOutlineColor={mission.color || "#64748B"}
                  />
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
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleUpdateProgress}
                  loading={loading}
                  disabled={loading || !userMission.id}
                  style={[styles.button, { backgroundColor: mission.color || "#64748B" }]}
                  contentStyle={styles.buttonContent}
                >
                  Update Progress
                </Button>
              </View>
            )}

            {/* Show message for completed missions */}
            {userMission && userMission.status === "completed" && (
              <View style={styles.completedMessageContainer}>
                <Text style={styles.completedMessageTitle}>Mission Completed!</Text>
                <Text style={styles.completedMessageText}>
                  This mission has been completed. You cannot update progress for completed missions.
                </Text>
                {userMission.points_earned && (
                  <Text style={styles.pointsEarnedText}>
                    Points earned: {userMission.points_earned}
                  </Text>
                )}
              </View>
            )}

            {/* Show message for cancelled missions */}
            {userMission && userMission.status === "cancelled" && (
              <View style={styles.cancelledMessageContainer}>
                <Text style={styles.cancelledMessageTitle}>Mission Cancelled</Text>
                <Text style={styles.cancelledMessageText}>
                  This mission has been cancelled. You cannot update progress for cancelled missions.
                </Text>
                
                {/* Check if mission can be reactivated */}
                {userMission.cancelled_at && (() => {
                  const timeInfo = calculateTimeRemaining(userMission.cancelled_at);
                  // Force re-render when timer updates
                  const forceUpdate = cooldownTimer;
                  return (
                    <View style={styles.reactivationContainer}>
                      {timeInfo.canReactivate ? (
                        <View style={styles.reactivationAvailable}>
                          <Icon name="refresh" size={20} color="#10B981" />
                          <Text style={styles.reactivationAvailableText}>
                            Mission dapat diaktifkan kembali!
                          </Text>
                          <Button
                            mode="contained"
                            onPress={handleReactivateMission}
                            loading={reactivateLoading}
                            disabled={reactivateLoading}
                            style={styles.reactivateButton}
                            contentStyle={styles.buttonContent}
                          >
                            Aktifkan Kembali
                          </Button>
                        </View>
                      ) : (
                        <View style={styles.reactivationCooldown}>
                          <Icon name="clock-outline" size={20} color="#F59E0B" />
                          <Text style={styles.reactivationCooldownText}>
                            Tunggu {timeInfo.hoursRemaining} jam lagi untuk mengaktifkan kembali
                          </Text>
                          <View style={styles.cooldownProgressContainer}>
                            <View style={styles.cooldownProgressBar}>
                              <View 
                                style={[
                                  styles.cooldownProgressFill,
                                  { 
                                    width: `${Math.max(0, Math.min(100, ((24 * 60 * 60 * 1000) - (new Date().getTime() - new Date(userMission.cancelled_at).getTime())) / (24 * 60 * 60 * 1000) * 100))}%` 
                                  }
                                ]} 
                              />
                            </View>
                            <Text style={styles.cooldownProgressText}>
                              {Math.round(((24 * 60 * 60 * 1000) - (new Date().getTime() - new Date(userMission.cancelled_at).getTime())) / (24 * 60 * 60 * 1000) * 100)}% selesai
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })()}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <Text style={styles.sectionTitle}>Mission Details</Text>
            <Text style={styles.detailValue}>
              No user mission data available for this mission.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!userMission ? (
            <>
              <Button
                mode="contained"
                onPress={handleAcceptMission}
                loading={loading}
                disabled={loading}
                style={[styles.button, { backgroundColor: mission.color || "#64748B" }]}
                contentStyle={styles.buttonContent}
              >
                Accept Mission
              </Button>
            </>
          ) : userMission.status === "active" ? (
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleAbandonMission}
                loading={loading}
                disabled={loading}
                style={[styles.button, styles.abandonButton]}
                contentStyle={styles.buttonContent}
                textColor="#EF4444"
              >
                Abandon Mission
              </Button>
            </View>
          ) : userMission.status === "completed" ? (
            <View style={styles.completedContainer}>
              <Text style={styles.completedTitle}>Mission Completed!</Text>
              <Text style={styles.completedSubtitle}>
                You earned {userMission.points_earned} points
              </Text>
            </View>
          ) : (
            <View style={styles.completedContainer}>
              <Text style={styles.completedTitle}>Mission Status Unknown</Text>
              <Text style={styles.completedSubtitle}>
                Status: {userMission.status}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 34,
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
  missionMeta: {
    alignItems: "flex-end",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  abandonButton: {
    borderColor: "#EF4444",
    flex: 1,
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
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  refreshButton: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#991B1B",
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
  cancelledMessageContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 16,
    alignItems: "center",
  },
  cancelledMessageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 8,
  },
  cancelledMessageText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  debugContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  debugText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
    marginBottom: 2,
  },
  reactivationContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reactivationAvailable: {
    alignItems: "center",
    paddingVertical: 12,
  },
  reactivationAvailableText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
  },
  reactivateButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    marginTop: 8,
  },
  reactivationCooldown: {
    alignItems: "center",
    paddingVertical: 12,
  },
  reactivationCooldownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
  },
  cooldownProgressContainer: {
    width: "100%",
    marginTop: 8,
  },
  cooldownProgressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  cooldownProgressFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 4,
  },
  cooldownProgressText: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default MissionDetailScreen;
