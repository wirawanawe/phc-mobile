import React, { useState, useEffect } from "react";
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
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const { width } = Dimensions.get("window");

const DailyMissionScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [missions, setMissions] = useState([]);
  const [userMissions, setUserMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalMissions: 0,
    completedMissions: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("Login");
    } else {
      loadData();
    }
  }, [isAuthenticated, navigation]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [missionsResponse, userMissionsResponse, statsResponse] =
        await Promise.all([
          api.getMissions(),
          api.getMyMissions(),
          api.getMissionStats(),
        ]);

      if (missionsResponse.success) {
        setMissions(missionsResponse.data);
      }

      if (userMissionsResponse.success) {
        setUserMissions(userMissionsResponse.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Error loading missions:", error);
      Alert.alert("Error", "Failed to load missions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAcceptMission = async (missionId) => {
    try {
      const response = await api.acceptMission(missionId);
      if (response.success) {
        Alert.alert("Success", "Mission accepted successfully!");
        loadData(); // Reload data
      }
    } catch (error) {
      console.error("Error accepting mission:", error);

      // Handle specific error cases
      if (error.message.includes("already have this mission active")) {
        Alert.alert(
          "Mission Already Active",
          "You already have this mission in progress. Check your active missions!"
        );
      } else {
        Alert.alert("Error", "Failed to accept mission. Please try again.");
      }
    }
  };

  const handleUpdateProgress = async (userMissionId, currentValue) => {
    try {
      const response = await api.updateMissionProgress(userMissionId, {
        current_value: currentValue,
      });
      if (response.success) {
        if (response.message === "Mission completed!") {
          Alert.alert("Congratulations!", "Mission completed successfully!");
        }
        loadData(); // Reload data
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      Alert.alert("Error", "Failed to update progress. Please try again.");
    }
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
          onPress={() => navigation.goBack()}
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
        ) : (
          <>
            {/* Progress Summary */}
            <View style={styles.progressContainer}>
              <LinearGradient
                colors={["#8B5CF6", "#A78BFA"]}
                style={styles.progressCard}
              >
                <View style={styles.progressHeader}>
                  <Icon name="star" size={32} color="#FFFFFF" />
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressTitle}>Today's Progress</Text>
                    <Text style={styles.progressSubtitle}>
                      {completedMissions.length} of {userMissions.length}{" "}
                      missions completed
                    </Text>
                  </View>
                </View>
                <View style={styles.progressStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{totalRewards}</Text>
                    <Text style={styles.statLabel}>Points Earned</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.round(
                        (completedMissions.length / missions.length) * 100
                      )}
                      %
                    </Text>
                    <Text style={styles.statLabel}>Completion</Text>
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
              {filteredMissions.map((mission) => {
                const userMission = userMissions.find(
                  (um) => um.mission_id === mission.id
                );

                return (
                  <TouchableOpacity
                    key={mission.id}
                    style={styles.missionCard}
                    onPress={() => {
                      navigation.navigate("MissionDetail", {
                        mission,
                        userMission,
                      });
                    }}
                  >
                    <View style={styles.missionHeader}>
                      <View
                        style={[
                          styles.missionIcon,
                          { backgroundColor: mission.color + "20" },
                        ]}
                      >
                        <Icon
                          name={mission.icon}
                          size={24}
                          color={mission.color}
                        />
                      </View>
                      <View style={styles.missionInfo}>
                        <Text style={styles.missionTitle}>{mission.title}</Text>
                        <Text style={styles.missionDescription}>
                          {mission.description}
                        </Text>
                      </View>
                      <View style={styles.missionReward}>
                        {userMission && userMission.status === "completed" ? (
                          <>
                            <View style={styles.completedRewardContainer}>
                              <Text style={styles.completedRewardText}>
                                +{userMission.points_earned}
                              </Text>
                            </View>
                            <View style={styles.completedRewardContainer}>
                              <Icon
                                name="check-circle"
                                size={14}
                                color="#10B981"
                              />
                            </View>
                          </>
                        ) : (
                          <>
                            <Text style={styles.rewardValue}>
                              {mission.points}
                            </Text>
                            <Text style={styles.rewardLabel}>pts</Text>
                          </>
                        )}
                      </View>
                    </View>

                    <View style={styles.missionFooter}>
                      <View style={styles.difficultyContainer}>
                        <View
                          style={[
                            styles.difficultyBadge,
                            {
                              backgroundColor:
                                mission.difficulty === "easy"
                                  ? "#10B981"
                                  : mission.difficulty === "medium"
                                  ? "#F59E0B"
                                  : "#EF4444",
                            },
                          ]}
                        >
                          <Text style={styles.difficultyText}>
                            {mission.difficulty.charAt(0).toUpperCase() +
                              mission.difficulty.slice(1)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.missionProgressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${
                                  userMission
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
                                backgroundColor: mission.color,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {userMission
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

                    {userMission && userMission.status === "completed" && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    )}
                    {userMission && userMission.status === "active" && (
                      <View style={styles.activeBadge}>
                        <Icon name="play-circle" size={20} color="#3B82F6" />
                        <Text style={styles.activeText}>Active</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.quickActionCard}>
                  <Icon name="plus" size={24} color="#6366F1" />
                  <Text style={styles.quickActionText}>Add Custom Mission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard}>
                  <Icon name="calendar" size={24} color="#F59E0B" />
                  <Text style={styles.quickActionText}>View History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard}>
                  <Icon name="trophy" size={24} color="#8B5CF6" />
                  <Text style={styles.quickActionText}>Achievements</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionCard}>
                  <Icon name="chart-line" size={24} color="#10B981" />
                  <Text style={styles.quickActionText}>Progress Stats</Text>
                </TouchableOpacity>
              </View>
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
    paddingVertical: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
});

export default DailyMissionScreen;
