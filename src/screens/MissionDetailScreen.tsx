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
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";

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

  // Refresh user mission data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only refresh if we don't have userMission data
      if (!userMission) {
        refreshUserMissionData();
      }
    });

    return unsubscribe;
  }, [navigation, userMission]);

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
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeElapsed = currentTime - cancelledTime;
    const timeRemaining = twentyFourHours - timeElapsed;
    
    if (timeRemaining <= 0) {
      return { canReactivate: true, timeRemaining: 0 };
    }
    
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return { canReactivate: false, timeRemaining, hours, minutes };
  };

  // Function to reactivate cancelled mission
  const handleReactivateMission = async () => {
    try {
      setReactivateLoading(true);
      
      const response = await apiService.reactivateMission(userMission.id);
      
      if (response.success) {
        
        // Update local state with the reactivated mission data
        const reactivatedUserMission = {
          ...userMission,
          status: "active",
          current_value: 0,
          progress: 0,
          notes: "",
          updated_at: new Date().toISOString(),
          cancelled_at: null
        };
        
        setUserMission(reactivatedUserMission);
        setCurrentValue(0);
        setNotes("");
        
        Alert.alert(
          "✅ Mission Reactivated!", 
          "Mission berhasil diaktifkan kembali! Sekarang Anda dapat melanjutkan progress misi ini.",
          [
            { 
              text: "Lanjutkan Progress", 
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
        Alert.alert(
          "⚠️ Unable to Reactivate Mission",
          response.message || "Please try again later.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes("belum 24 jam") || errorMessage.includes("masih dalam cooldown")) {
          Alert.alert(
            "⏰ Cooldown Period",
            "Mission masih dalam masa cooldown. Silakan tunggu hingga 24 jam setelah pembatalan.",
            [{ text: "OK", style: "default" }]
          );
        } else if (errorMessage.includes("tidak ditemukan") || errorMessage.includes("not found")) {
          Alert.alert(
            "❌ Mission Not Found",
            "Mission tidak ditemukan atau sudah tidak tersedia.",
            [{ text: "OK", style: "default" }]
          );
        } else {
          Alert.alert(
            "❌ Error",
            "Terjadi kesalahan saat mengaktifkan kembali mission. Silakan coba lagi.",
            [{ text: "OK", style: "default" }]
          );
        }
      } else {
        Alert.alert(
          "❌ Error",
          "Terjadi kesalahan saat mengaktifkan kembali mission. Silakan coba lagi.",
          [{ text: "OK", style: "default" }]
        );
      }
    } finally {
      setReactivateLoading(false);
    }
  };

  // Function to validate and fix user mission ID
  const validateUserMissionId = (userMissionData: any) => {
    if (!userMissionData) return null;
    
    // Try multiple possible ID fields
    const possibleIds = [
      userMissionData.id,
      userMissionData.user_mission_id,
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
      // Handle error silently
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
        } else if (errorMessage.includes("server error") || errorMessage.includes("500")) {
          Alert.alert(
            "🌐 Server Temporarily Unavailable",
            "Our servers are experiencing high traffic. Please try again in a few minutes.",
            [
              { text: "Try Again", onPress: () => handleAcceptMission() },
              { text: "Cancel", style: "cancel" }
            ]
          );
        } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
          Alert.alert(
            "📡 Connection Issue",
            "Please check your internet connection and try again.",
            [
              { text: "Retry", onPress: () => handleAcceptMission() },
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
            "❌ Unable to Accept Mission",
            "An unexpected error occurred. Please try again later.",
            [
              { text: "Try Again", onPress: () => handleAcceptMission() },
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
                  navigation.goBack();
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
                        navigation.goBack();
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mission Detail</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Modern Mission Card */}
        <View style={styles.missionCardModern}>
          <LinearGradient
            colors={[(mission.color || "#64748B") + "20", (mission.color || "#64748B") + "10"]}
            style={styles.missionGradientModern}
          >
            <View style={styles.missionHeaderModern}>
              <LinearGradient
                colors={[(mission.color || "#64748B") + "30", (mission.color || "#64748B") + "20"]}
                style={styles.missionIconModern}
              >
                <Icon name={mission.icon || "help-circle"} size={32} color={mission.color || "#64748B"} />
              </LinearGradient>
              <View style={styles.missionInfoModern}>
                <Text style={styles.missionTitleModern}>{mission.title || "Untitled Mission"}</Text>
                <Text style={styles.missionDescriptionModern}>
                  {mission.description || "No description available"}
                </Text>
                <View style={styles.missionMetaModern}>
                  <View
                    style={[
                      styles.difficultyBadgeModern,
                      {
                        backgroundColor: getDifficultyColor(mission.difficulty || "medium"),
                      },
                    ]}
                  >
                                                <Text style={styles.difficultyTextModern}>
                              {mission.difficulty ? mission.difficulty.charAt(0).toUpperCase() +
                                mission.difficulty.slice(1) : "Unknown"}
                            </Text>
                  </View>
                  <View style={styles.pointsContainerModern}>
                    <Icon name="star" size={18} color="#F59E0B" />
                    <Text style={styles.pointsTextModern}>{mission.points || 0} pts</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
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
                            Tunggu {timeInfo.hours} jam {timeInfo.minutes} menit lagi untuk mengaktifkan kembali
                          </Text>
                          <View style={styles.cooldownProgressContainer}>
                            <View style={styles.cooldownProgressBar}>
                              <View 
                                style={[
                                  styles.cooldownProgressFill,
                                  { 
                                    width: `${Math.max(0, Math.min(100, ((24 * 60 * 60 * 1000) - timeInfo.timeRemaining) / (24 * 60 * 60 * 1000) * 100))}%` 
                                  }
                                ]} 
                              />
                            </View>
                            <Text style={styles.cooldownProgressText}>
                              {Math.round(((24 * 60 * 60 * 1000) - timeInfo.timeRemaining) / (24 * 60 * 60 * 1000) * 100)}% selesai
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
  missionCard: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  missionCardModern: {
    margin: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  missionGradientModern: {
    padding: 28,
  },
  missionHeaderModern: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  missionIconModern: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  missionInfoModern: {
    flex: 1,
  },
  missionTitleModern: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 10,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  missionDescriptionModern: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: "500",
  },
  missionMetaModern: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  difficultyBadgeModern: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyTextModern: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pointsContainerModern: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsTextModern: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F59E0B",
    marginLeft: 6,
  },
  missionGradient: {
    padding: 24,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  missionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
  },
  missionDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 12,
  },
  missionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
