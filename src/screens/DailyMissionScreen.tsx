import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { handleError } from "../utils/errorHandler";
import { Mission, UserMission } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { safeGoBack } from "../utils/safeNavigation";

const { width } = Dimensions.get("window");

const DailyMissionScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingMission, setAcceptingMission] = useState<number | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState<number | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [stats, setStats] = useState({
    totalMissions: 0,
    completedMissions: 0,
    totalPoints: 0,
    activeMissions: 0,
    completionRate: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0); // New state for forcing re-render
  const [cooldownTimer, setCooldownTimer] = useState(0); // Timer for cooldown updates

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, navigation]);

  // Add effect to refresh data when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0 && isAuthenticated) {
      loadData();
    }
  }, [refreshKey, isAuthenticated]);

  // Remove automatic focus refresh - manual refresh only
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (isAuthenticated) {
  //       console.log('🔄 DailyMissionScreen: Refreshing mission data on focus');
  //       loadData();
  //     }
  //   }, [isAuthenticated])
  // );

  // Timer for cooldown countdown in mission cards
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Check if there are any cancelled missions
    const hasCancelledMissions = userMissions.some(um => um.status === "cancelled" && (um as any).cancelled_at);
    
    if (hasCancelledMissions) {
      // Update timer every minute
      interval = setInterval(() => {
        setCooldownTimer(prev => prev + 1);
      }, 60000); // Update every minute
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [userMissions]);

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

  // Process mission data to handle missing fields
  const processMissionData = (missions: any[]) => {
    return missions.map((mission: any) => {
      // Default colors and icons based on category
      const categoryDefaults: { [key: string]: { color: string; icon: string } } = {
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
        is_active: mission.is_active !== false // Treat null/undefined as active
      };
    });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setUsingMockData(false);
      
      console.log('🔍 DailyMissionScreen: Starting to load mission data...');
      
      const [missionsResponse, userMissionsResponse, statsResponse] =
        await Promise.all([
          api.getMissions(),
          api.getMyMissions(),
          api.getMissionStats({ date: new Date().toISOString().split('T')[0] }),
        ]);

      console.log('📊 DailyMissionScreen: API Responses:');
      console.log('- Missions:', missionsResponse.success ? 'SUCCESS' : 'FAILED', missionsResponse.missions?.length || 0, 'missions');
      console.log('- User Missions:', userMissionsResponse.success ? 'SUCCESS' : 'FAILED', userMissionsResponse.data?.length || 0, 'user missions');
      console.log('- Stats:', statsResponse.success ? 'SUCCESS' : 'FAILED');

      // Check if we're using mock data (mock API responses have specific patterns)
      const isUsingMock = missionsResponse.data && missionsResponse.data.length > 0 && 
                         missionsResponse.data[0].title === "Daily Water Intake";
      
      if (isUsingMock) {
        setUsingMockData(true);
        
        // Show notification only once per session
        const hasShownMockNotification = await AsyncStorage.getItem('mockNotificationShown');
        if (!hasShownMockNotification) {
          Alert.alert(
            "🌐 Demo Mode",
            "You're currently using demo data. Connect to the server for real data.",
            [{ text: "OK" }]
          );
          await AsyncStorage.setItem('mockNotificationShown', 'true');
        }
      }

      // Process and set data
      if (missionsResponse.success && missionsResponse.missions) {
        const processedMissions = processMissionData(missionsResponse.missions);
        setMissions(processedMissions);
        console.log('✅ DailyMissionScreen: Set', processedMissions.length, 'missions');
      } else {
        setMissions([]);
        console.log('❌ DailyMissionScreen: No missions data available');
      }

      if (userMissionsResponse.success && userMissionsResponse.data) {
        setUserMissions(userMissionsResponse.data);
        console.log('✅ DailyMissionScreen: Set', userMissionsResponse.data.length, 'user missions');
      } else {
        setUserMissions([]);
        console.log('❌ DailyMissionScreen: No user missions data available');
      }

      if (statsResponse.success && statsResponse.data) {
        // Map the API response to the expected format
        const mappedStats = {
          totalMissions: statsResponse.data.total_missions || 0,
          completedMissions: statsResponse.data.completed_missions || 0,
          totalPoints: statsResponse.data.total_points_earned || 0,
          activeMissions: statsResponse.data.active_missions || 0,
          completionRate: statsResponse.data.completion_rate || 0,
        };
        setStats(mappedStats);
        console.log('✅ DailyMissionScreen: Set stats:', mappedStats);
      } else {
        setStats({
          totalMissions: 0,
          completedMissions: 0,
          totalPoints: 0,
          activeMissions: 0,
          completionRate: 0,
        });
        console.log('❌ DailyMissionScreen: No stats data available');
      }

    } catch (error) {
      console.error('❌ DailyMissionScreen: Error loading mission data:', error);
      Alert.alert(
        "❌ Error",
        "Failed to load mission data. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
      console.log('🏁 DailyMissionScreen: Finished loading data');
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAcceptMission = async (missionId: number, missionDate?: string) => {
    try {
      setAcceptingMission(missionId);
      
      const response = await api.acceptMission(missionId, missionDate || null);
      
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
        // Handle API response that indicates failure
        Alert.alert(
          "⚠️ Unable to Accept Mission",
          response.message || "Please try again later.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "❌ Error accepting mission:",
        "An unexpected error occurred. Please try again later.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setAcceptingMission(null);
    }
  };

  const handleUpdateProgress = async (userMissionId: number, currentValue: number) => {
    try {
      setUpdatingProgress(userMissionId);
      
      const response = await api.updateMissionProgress(userMissionId, {
        current_value: currentValue,
      });
      
      if (response.success) {
        if (response.message === "Mission completed!") {
          Alert.alert(
            "🎉 Congratulations!", 
            "Mission completed successfully! You've earned points!",
            [
              { 
                text: "Awesome!", 
                onPress: async () => {
                  await loadData(); // Reload data to show updated state
                  setRefreshKey(prev => prev + 1); // Force re-render
                  // Add a small delay to ensure UI updates
                  setTimeout(() => {
                  }, 200);
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
                  await loadData(); // Reload data to show updated state
                  setRefreshKey(prev => prev + 1); // Force re-render
                  // Add a small delay to ensure UI updates
                  setTimeout(() => {
                  }, 200);
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
      Alert.alert(
        "❌ Error updating progress:",
        "An unexpected error occurred. Please try again later.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setUpdatingProgress(null);
    }
  };

  // Quick Action Handlers
  const handleAddCustomMission = () => {
    Alert.alert(
      "Add Custom Mission",
      "This feature will allow you to create your own custom missions. Coming soon!",
      [
        { text: "OK", style: "default" }
      ]
    );
  };

  const handleViewHistory = () => {
    Alert.alert(
      "Mission History",
      "View your completed missions and progress history. Coming soon!",
      [
        { text: "OK", style: "default" }
      ]
    );
  };

  const handleViewAchievements = () => {
    Alert.alert(
      "Achievements",
      "View your earned achievements and badges. Coming soon!",
      [
        { text: "OK", style: "default" }
      ]
    );
  };

  const handleViewProgressStats = () => {
    Alert.alert(
      "Progress Statistics",
      "View detailed statistics about your mission progress. Coming soon!",
      [
        { text: "OK", style: "default" }
      ]
    );
  };

  const categories = [
    { id: "all", title: "All", icon: "view-grid" },
    { id: "health_tracking", title: "Health Tracking", icon: "heart-pulse" },
    { id: "nutrition", title: "Nutrition", icon: "food-apple" },
    { id: "fitness", title: "Fitness", icon: "dumbbell" },
    { id: "mental_health", title: "Mental Health", icon: "brain" },
    { id: "education", title: "Education", icon: "book-open" },
    { id: "consultation", title: "Consultation", icon: "doctor" },
    { id: "daily_habit", title: "Daily Habits", icon: "check-circle" },
  ];

  const filteredMissions =
    selectedCategory === "all"
      ? missions
      : missions.filter((mission) => mission.category === selectedCategory);

  const completedMissions = userMissions.filter(
    (userMission) => userMission.status === "completed"
  );
  const totalRewards = completedMissions.reduce(
    (sum, userMission) => sum + (userMission.points_earned || 0),
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /> */}

      {/* Header */}
      {/* <View style={styles.header}>
        <Icon
          name="arrow-left"
          size={24}
          color="#1F2937"
          onPress={() => safeGoBack(navigation, 'Main')}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Daily Missions</Text>
        <Icon name="trophy" size={24} color="#F59E0B" />
      </View> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading missions...</Text>
          </View>
        ) : !isAuthenticated ? (
          <View style={styles.loadingContainer}>
            <Icon name="login" size={64} color="#E22345" />
            <Text style={styles.loadingText}>Login Required</Text>
            <Text style={styles.loadingSubtext}>
              Please login to access daily missions and track your progress
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginButtonText}>Login Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Progress Stats */}
            <View style={styles.progressContainer}>
              <LinearGradient
                colors={["#E53E3E", "#C53030"]}
                style={styles.progressCardModern}
              >
                <View style={styles.progressHeaderModern}>
                  <View style={styles.progressIconContainer}>
                    <Icon name="flag-checkered" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.progressInfoModern}>
                    <Text style={styles.progressTitleModern}>Mission Progress</Text>
                    <Text style={styles.progressSubtitleModern}>
                      {usingMockData ? "Demo Mode - Using Sample Data" : "Track your wellness journey"}
                    </Text>
                  </View>
                </View>
                
                {usingMockData && (
                  <View style={styles.mockDataIndicator}>
                    <Icon name="wifi-off" size={16} color="#F59E0B" />
                    <Text style={styles.mockDataText}>Demo Mode</Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={loadData}
                    >
                      <Icon name="refresh" size={14} color="#F59E0B" />
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.progressStatsModern}>
                  <View style={styles.statItemModern}>
                    <Text style={styles.statValueModern}>{stats.totalMissions}</Text>
                    <Text style={styles.statLabelModern}>Total Missions</Text>
                  </View>
                  <View style={styles.statDividerModern} />
                  <View style={styles.statItemModern}>
                    <Text style={styles.statValueModern}>{stats.completedMissions}</Text>
                    <Text style={styles.statLabelModern}>Completed</Text>
                  </View>
                  <View style={styles.statDividerModern} />
                  <View style={styles.statItemModern}>
                    <Text style={styles.statValueModern}>{stats.totalPoints}</Text>
                    <Text style={styles.statLabelModern}>Points Earned</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id &&
                        styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Icon
                      name={category.icon}
                      size={20}
                      color={
                        selectedCategory === category.id ? "#FFFFFF" : "#64748B"
                      }
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === category.id &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Missions */}
            <View style={styles.missionsContainer}>
              <Text style={styles.sectionTitle}>Available Missions</Text>
              {filteredMissions.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>No missions available</Text>
                  <Text style={styles.emptyStateSubtext}>Check back later for new missions</Text>
                </View>
              ) : (
                <>
                  {filteredMissions.map((mission) => {
                    // Skip if mission is invalid
                    if (!mission || !mission.id) {
                      return null;
                    }
                    
                    const userMission = userMissions.find(
                      (um) => um.mission_id === mission.id
                    );

                return (
                  <TouchableOpacity
                    key={mission.id}
                    style={styles.missionCardModern}
                    onPress={() => {
                      
                      // Prevent navigation for completed missions
                      if (userMission && userMission.status === "completed") {
                        Alert.alert(
                          "Mission Completed",
                          "This mission has been completed. You cannot update completed missions.",
                          [{ text: "OK" }]
                        );
                        return;
                      }
                      
                      navigation.navigate("MissionDetail", {
                        mission,
                        userMission: userMission || null, // Ensure it's null instead of undefined
                        onMissionUpdate: loadData,
                      });
                    }}
                  >
                    <LinearGradient
                      colors={["#FFFFFF", "#F8FAFC"]}
                      style={styles.missionCardGradient}
                    >
                      <View style={styles.missionHeaderModern}>
                        <LinearGradient
                          colors={[(mission.color || "#64748B") + "20", (mission.color || "#64748B") + "10"]}
                          style={styles.missionIconModern}
                        >
                          <Icon
                            name={mission.icon || "help-circle"}
                            size={24}
                            color={mission.color || "#64748B"}
                          />
                        </LinearGradient>
                        <View style={styles.missionInfoModern}>
                          <Text style={styles.missionTitleModern}>{mission.title || "Untitled Mission"}</Text>
                          <View style={styles.missionDescriptionRow}>
                            <Text style={styles.missionDescriptionModern}>
                              {mission.description || "No description available"}
                            </Text>
                            <View style={styles.missionRewardModern}>
                              {userMission && userMission.status === "completed" ? (
                                <View style={styles.completedRewardContainerModern}>
                                  <Text style={styles.completedRewardTextModern}>
                                    +{userMission.points_earned}
                                  </Text>
                                                                <Icon
                                name="check-circle"
                                size={14}
                                color="#10B981"
                              />
                                </View>
                              ) : (
                                <View style={styles.rewardContainerModern}>
                                  <Text style={styles.rewardValueModern}>
                                    {mission.points || 0}
                                  </Text>
                                  <Text style={styles.rewardLabelModern}>pts</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>

                      <View style={styles.missionFooterModern}>
                        <View style={styles.difficultyContainerModern}>
                          <View
                            style={[
                              styles.difficultyBadgeModern,
                              {
                                backgroundColor:
                                  mission.difficulty === "easy"
                                    ? "#10B981"
                                    : mission.difficulty === "medium"
                                    ? "#F59E0B"
                                    : mission.difficulty === "hard"
                                    ? "#EF4444"
                                    : "#64748B",
                              },
                            ]}
                          >
                            <Text style={styles.difficultyTextModern}>
                              {mission.difficulty ? mission.difficulty.charAt(0).toUpperCase() +
                                mission.difficulty.slice(1) : "Unknown"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.missionProgressContainerModern}>
                          <View style={styles.progressBarModern}>
                            <LinearGradient
                              colors={[(mission.color || "#E53E3E"), (mission.color || "#E53E3E") + "80"]}
                              style={[
                                styles.progressFillModern,
                                {
                                  width: `${
                                    userMission && mission.target_value
                                      ? Math.min(
                                          Math.round(
                                            (userMission.current_value /
                                              mission.target_value) *
                                              100
                                          ),
                                          100
                                        )
                                      : 0
                                  }%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressTextModern}>
                            {userMission && mission.target_value
                              ? Math.min(
                                  Math.round(
                                    (userMission.current_value /
                                      mission.target_value) *
                                      100
                                  ),
                                  100
                                )
                              : 0}
                            %
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    {userMission && userMission.status === "completed" && (
                      <View style={styles.completedBadgeModern}>
                        <Text style={styles.completedTextModern}>Completed</Text>
                      </View>
                    )}
                    {userMission && userMission.status === "active" && (
                      <View style={styles.activeBadgeModern}>
                        <Icon name="play-circle" size={18} color="#3B82F6" />
                        <Text style={styles.activeTextModern}>Active</Text>
                      </View>
                    )}
                    {userMission && userMission.status === "cancelled" && (
                      <View style={styles.cancelledBadgeModern}>
                        <Icon name="close-circle" size={18} color="#EF4444" />
                        <Text style={styles.cancelledTextModern}>Cancelled</Text>
                      </View>
                    )}
                    {userMission && userMission.status === "cancelled" && (userMission as any).cancelled_at && (() => {
                      const timeInfo = calculateTimeRemaining((userMission as any).cancelled_at);
                      const forceUpdate = cooldownTimer; // Force re-render
                      return (
                        <View style={styles.cooldownInfoContainer}>
                          {timeInfo.canReactivate ? (
                            <View style={styles.reactivateAvailableContainer}>
                              <Icon name="refresh" size={16} color="#10B981" />
                              <Text style={styles.reactivateAvailableText}>Dapat diaktifkan kembali</Text>
                            </View>
                          ) : (
                            <View style={styles.cooldownInfoContainer}>
                              <Icon name="clock-outline" size={16} color="#F59E0B" />
                              <Text style={styles.cooldownInfoText}>
                                {timeInfo.hours}j {timeInfo.minutes}m lagi
                              </Text>
                            </View>
                          )}
                        </View>
                      );
                    })()}
                  </TouchableOpacity>
                );
              })}
                </>
              )}
            </View>

            
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 30,
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  progressCardModern: {
    borderRadius: 24,
    padding: 28,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  progressHeaderModern: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  progressIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  progressInfoModern: {
    flex: 1,
  },
  progressTitleModern: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  progressSubtitleModern: {
    fontSize: 15,
    color: "#FED7D7",
    fontWeight: "600",
    lineHeight: 20,
  },
  progressStatsModern: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItemModern: {
    flex: 1,
    alignItems: "center",
  },
  statValueModern: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  statLabelModern: {
    fontSize: 13,
    color: "#FED7D7",
    fontWeight: "600",
    marginTop: 4,
  },
  statDividerModern: {
    width: 1,
    height: 48,
    backgroundColor: "#FED7D7",
    opacity: 0.6,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressInfo: {
    marginLeft: 16,
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  progressSubtitle: {
    fontSize: 14,
    color: "#E0E7FF",
    fontWeight: "500",
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: "#E0E7FF",
    fontWeight: "500",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E7FF",
    opacity: 0.5,
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryButtonActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 8,
  },
  categoryButtonTextActive: {
    color: "#FFFFFF",
  },
  missionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  missionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    position: "relative",
  },
  missionCardModern: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
  },
  missionCardGradient: {
    padding: 20,
  },
  missionHeaderModern: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  missionIconModern: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  missionInfoModern: {
    flex: 1,
    marginRight: 12,
  },
  missionTitleModern: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  missionDescriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  missionDescriptionModern: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
    flex: 1,
    marginRight: 12,
  },
  missionRewardModern: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  completedRewardContainerModern: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  completedRewardTextModern: {
    fontSize: 14,
    fontWeight: "900",
    color: "#10B981",
    marginRight: 4,
    letterSpacing: -0.5,
  },
  rewardContainerModern: {
    alignItems: "center",
  },
  rewardValueModern: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  rewardLabelModern: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 1,
  },
  missionFooterModern: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyContainerModern: {
    flex: 1,
  },
  difficultyBadgeModern: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyTextModern: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  missionProgressContainerModern: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 16,
  },
  progressBarModern: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 8,
  },
  progressFillModern: {
    height: "100%",
    borderRadius: 4,
  },
  progressTextModern: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    minWidth: 35,
  },
  completedBadgeModern: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  completedTextModern: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 4,
  },
  activeBadgeModern: {
    position: "absolute",
    top: 10,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  activeTextModern: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3B82F6",
    marginLeft: 4,
  },
  cancelledBadgeModern: {
    position: "absolute",
    top: 10,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelledTextModern: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EF4444",
    marginLeft: 4,
  },
  cooldownInfoContainer: {
    position: "absolute",
    bottom: 12,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  reactivateAvailableContainer: {
    position: "absolute",
    bottom: 12,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  reactivateAvailableText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  cooldownInfoText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#F59E0B",
    marginLeft: 4,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 20,
  },
  missionDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
  },
  missionReward: {
    alignItems: "center",
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  rewardLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  missionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyContainer: {
    flex: 1,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  missionProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    minWidth: 35,
  },
  completedBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  completedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  activeBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  activeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 4,
  },
  completedRewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  completedRewardText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#10B981",
    marginLeft: 4,
    letterSpacing: -0.5,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: "#E22345",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  quickActionCardModern: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  quickActionGradient: {
    width: "100%",
    minHeight: 120,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  quickActionTextModern: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
    textAlign: "center",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickActionSubtext: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.2,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
  },

  sectionHeaderModern: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleModern: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  mockDataIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  mockDataText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F59E0B",
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  retryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F59E0B",
    marginLeft: 4,
    letterSpacing: -0.2,
  },
});

export default DailyMissionScreen;
