import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  Card,
  ProgressBar,
  useTheme,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const { width } = Dimensions.get("window");

interface MissionStats {
  totalMissions: number;
  completedMissions: number;
  totalPoints: number;
}

interface UserMission {
  id: number;
  user_id: number;
  mission_id: number;
  status: string;
  progress: number;
  current_value: number;
  start_date: string;
  completed_date?: string;
  due_date?: string;
  points_earned?: number;
  streak_count: number;
  last_completed_date?: string;
  notes?: string;
  mission?: {
    id: number;
    title: string;
    description: string;
    category: string;
    type: string;
    target_value: number;
    unit?: string;
    points: number;
    icon?: string;
    color?: string;
    difficulty: string;
  };
}

interface Activity {
  id: string;
  title: string;
  time: string;
  type: string;
  color: string;
  points?: number;
}

const DashboardScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [missionStats, setMissionStats] = useState<MissionStats>({
    totalMissions: 0,
    completedMissions: 0,
    totalPoints: 0,
  });
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [availableMissions, setAvailableMissions] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMissionData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        loadMissionData();
      }
    }, [isAuthenticated])
  );

  const loadMissionData = async () => {
    try {
      setLoading(true);
      const [statsResponse, userMissionsResponse, availableMissionsResponse] =
        await Promise.all([
          api.getMissionStats({ date: new Date().toISOString().split('T')[0] }),
          api.getMyMissions(),
          api.getMissions(),
        ]);

      if (statsResponse.success) {
        setMissionStats(statsResponse.data);
      }

      if (userMissionsResponse.success) {
        setUserMissions(userMissionsResponse.data);
      }

      if (availableMissionsResponse.success) {
        setAvailableMissions(availableMissionsResponse.data);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const healthMetrics = [
    {
      id: "1",
      title: "Mission Progress",
      value: missionStats.completedMissions,
      maxValue: Math.max(missionStats.totalMissions, 1),
      color: theme.customColors.successGreen,
      icon: "flag-checkered",
      trend: `+${missionStats.totalPoints}`,
      trendPositive: true,
    },
    {
      id: "2",
      title: "Points Earned",
      value: Math.min(missionStats.totalPoints, 100),
      maxValue: 100,
      color: theme.customColors.infoBlue,
      icon: "star",
      trend: "+" + Math.floor(missionStats.totalPoints / 10),
      trendPositive: true,
    },
    {
      id: "3",
      title: "Active Missions",
      value: userMissions.filter((um) => um.status === "active").length,
      maxValue: Math.max(availableMissions.length, 1),
      color: theme.customColors.softPink,
      icon: "play-circle",
      trend: "Active",
      trendPositive: true,
    },
    {
      id: "4",
      title: "Completion Rate",
      value:
        missionStats.totalMissions > 0
          ? Math.round(
              (missionStats.completedMissions / missionStats.totalMissions) *
                100
            )
          : 0,
      maxValue: 100,
      color: theme.customColors.warmOrange,
      icon: "trophy",
      trend: "%",
      trendPositive: true,
    },
  ];

  const recentActivities: Activity[] = userMissions
    .filter((um) => um.status === "completed")
    .slice(0, 4)
    .map((userMission, index) => ({
      id: userMission.id.toString(),
      title: `Completed: ${userMission.mission?.title || "Mission"}`,
      time: new Date(userMission.completed_date || "").toLocaleDateString(),
      type: userMission.mission?.category || "mission",
      color: userMission.mission?.color || theme.customColors.successGreen,
      points: userMission.points_earned,
    }));

  // If no completed missions, show default activities
  const defaultActivities: Activity[] = [
    {
      id: "1",
      title: "Start Your First Mission",
      time: "Get started today",
      type: "mission",
      color: theme.customColors.successGreen,
    },
    {
      id: "2",
      title: "Complete Health Assessment",
      time: "Recommended",
      type: "assessment",
      color: theme.customColors.infoBlue,
    },
    {
      id: "3",
      title: "Book Clinic Consultation",
      time: "Stay healthy",
      type: "consultation",
      color: theme.customColors.warmOrange,
    },
  ];

  const displayActivities =
    recentActivities.length > 0 ? recentActivities : defaultActivities;

  const recommendations = [];

  // Add mission-based recommendations
  if (userMissions.length === 0) {
    recommendations.push({
      id: "1",
      title: "Start Your Mission Journey",
      description:
        "Complete your first mission to earn points and track your progress",
      priority: "high",
      color: theme.customColors.successGreen,
      action: () => navigation.navigate("DailyMission"),
    });
  }

  if (
    userMissions.filter((um) => um.status === "active").length === 0 &&
    userMissions.length > 0
  ) {
    recommendations.push({
      id: "2",
      title: "Take on New Challenges",
      description: "Accept new missions to continue your wellness journey",
      priority: "medium",
      color: theme.customColors.infoBlue,
      action: () => navigation.navigate("DailyMission"),
    });
  }

  // Add wellness program recommendations
  recommendations.push({
    id: "3",
    title: "Join Wellness Programs",
    description:
      "Participate in structured wellness programs for better health outcomes",
    priority: "medium",
    color: theme.customColors.warmOrange,
            action: () => navigation.navigate("Activity"),
  });

  // Clinic booking recommendation - temporarily commented out
  // recommendations.push({
  //   id: "4",
  //   title: "Schedule Health Checkup",
  //   description: "Regular health checkups help maintain your wellness goals",
  //   priority: "low",
  //   color: theme.customColors.softPink,
  //   action: () => navigation.navigate("ClinicBooking"),
  // });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "assessment":
        return "clipboard-check";
      case "education":
        return "book-open";
      case "fitness":
        return "dumbbell";
      case "wellness":
        return "yoga";
      case "consultation":
        return "doctor";
      case "mission":
        return "flag-checkered";
      default:
        return "circle";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return theme.colors.error;
      case "medium":
        return theme.customColors.warningYellow;
      case "low":
        return theme.customColors.successGreen;
      default:
        return theme.customColors.infoBlue;
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.customColors.primaryGradient[0]}
          />
          <Text
            style={[styles.loadingText, { color: theme.colors.onBackground }]}
          >
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text
              style={[styles.welcomeText, { color: theme.colors.onBackground }]}
            >
              Your Health Dashboard 📊
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.onBackground }]}
            >
              {isAuthenticated
                ? `Welcome back, ${user?.name || "User"}!`
                : "Track your wellness journey progress"}
            </Text>
          </View>
          <View
            style={[
              styles.profileCircle,
              { backgroundColor: theme.customColors.primaryGradient[0] },
            ]}
          >
            <Text style={styles.profileInitial}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
        </View>

        {/* Mission Status Card */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Mission Status
            </Text>
            <Card
              style={[
                styles.missionStatusCard,
                { backgroundColor: "rgba(255,255,255,0.95)" },
              ]}
              onPress={() => navigation.navigate("DailyMission")}
            >
              <Card.Content style={styles.missionStatusContent}>
                <View style={styles.missionStatusHeader}>
                  <View
                    style={[
                      styles.missionStatusIcon,
                      { backgroundColor: theme.customColors.successGreen },
                    ]}
                  >
                    <Icon name="flag-checkered" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.missionStatusInfo}>
                    <Text
                      style={[
                        styles.missionStatusTitle,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {userMissions.length === 0
                        ? "Start Your Mission Journey"
                        : "Your Mission Progress"}
                    </Text>
                    <Text
                      style={[
                        styles.missionStatusSubtitle,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {userMissions.length === 0
                        ? "Complete missions to earn points and track your progress"
                        : `${missionStats.completedMissions} completed • ${missionStats.totalPoints} points earned`}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={24}
                    color={theme.colors.onBackground}
                  />
                </View>
                {userMissions.length > 0 && (
                  <View style={styles.missionProgressContainer}>
                    <ProgressBar
                      progress={
                        missionStats.totalMissions > 0
                          ? missionStats.completedMissions /
                            missionStats.totalMissions
                          : 0
                      }
                      color={theme.customColors.successGreen}
                      style={styles.missionProgressBar}
                    />
                    <Text
                      style={[
                        styles.missionProgressText,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {Math.round(
                        (missionStats.completedMissions /
                          Math.max(missionStats.totalMissions, 1)) *
                          100
                      )}
                      % Complete
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Health Metrics */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Health Metrics
          </Text>
          <View style={styles.metricsGrid}>
            {healthMetrics.map((metric) => (
              <Card
                key={metric.id}
                style={[
                  styles.metricCard,
                  { backgroundColor: "rgba(255,255,255,0.95)" },
                ]}
              >
                <Card.Content style={styles.metricContent}>
                  <View style={styles.metricHeader}>
                    <View
                      style={[
                        styles.metricIcon,
                        { backgroundColor: metric.color },
                      ]}
                    >
                      <Icon name={metric.icon} size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.trendContainer}>
                      <Icon
                        name={
                          metric.trendPositive ? "trending-up" : "trending-down"
                        }
                        size={16}
                        color={
                          metric.trendPositive
                            ? theme.customColors.successGreen
                            : theme.colors.error
                        }
                      />
                      <Text
                        style={[
                          styles.trendText,
                          {
                            color: metric.trendPositive
                              ? theme.customColors.successGreen
                              : theme.colors.error,
                          },
                        ]}
                      >
                        {metric.trend}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.metricTitle,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    {metric.title}
                  </Text>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    {metric.value}/{metric.maxValue}
                  </Text>
                  <ProgressBar
                    progress={metric.value / metric.maxValue}
                    color={metric.color}
                    style={styles.progressBar}
                  />
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Recent Activities
          </Text>
          <Card
            style={[
              styles.activitiesCard,
              { backgroundColor: "rgba(255,255,255,0.95)" },
            ]}
          >
            <Card.Content>
              {displayActivities.map((activity, index) => (
                <View
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    index < displayActivities.length - 1 &&
                      styles.activityBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: activity.color },
                    ]}
                  >
                    <Icon
                      name={getActivityIcon(activity.type)}
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text
                      style={[
                        styles.activityTitle,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.title}
                    </Text>
                    <Text
                      style={[
                        styles.activityTime,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {activity.time}
                      {activity.points && ` • +${activity.points} pts`}
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        </View>

        {/* Active Missions */}
        {userMissions.filter((um) => um.status === "active").length > 0 && (
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
              Active Missions
            </Text>
            <Card
              style={[
                styles.activitiesCard,
                { backgroundColor: "rgba(255,255,255,0.95)" },
              ]}
            >
              <Card.Content>
                                {userMissions
                  .filter((um) => um.status === "active")
                  .map((userMission, index) => {
                    const mission = userMission.mission;
                    const progressPercentage = mission?.target_value 
                      ? Math.min((userMission.current_value / mission.target_value) * 100, 100)
                      : 0;
                    
                    return (
                      <TouchableOpacity
                        key={userMission.id}
                        onPress={() => {
                          // Prevent navigation for completed missions
                          if (userMission.status === "completed") {
                            Alert.alert(
                              "Mission Completed",
                              "This mission has been completed. You cannot update completed missions.",
                              [{ text: "OK" }]
                            );
                            return;
                          }
                          navigation.navigate("MissionDetail", {
                            mission: mission,
                            userMission: userMission,
                            onMissionUpdate: loadMissionData
                          });
                        }}
                      >
                        <View
                          style={[
                            styles.activityItem,
                            index < userMissions.filter((um) => um.status === "active").length - 1 &&
                              styles.activityBorder,
                          ]}
                        >
                          <View
                            style={[
                              styles.activityIcon,
                              { backgroundColor: mission?.color || theme.customColors.successGreen },
                            ]}
                          >
                            <Icon
                              name={mission?.icon || "flag-checkered"}
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                          <View style={styles.activityContent}>
                            <Text
                              style={[
                                styles.activityTitle,
                                { color: theme.colors.onBackground },
                              ]}
                            >
                              {mission?.title || "Mission"}
                            </Text>
                            <View style={styles.missionProgressContainer}>
                              <ProgressBar
                                progress={progressPercentage / 100}
                                color={mission?.color || theme.customColors.successGreen}
                                style={styles.missionProgressBar}
                              />
                              <Text
                                style={[
                                  styles.missionProgressText,
                                  { color: theme.colors.onBackground },
                                ]}
                              >
                                {userMission.current_value} / {mission?.target_value} {mission?.unit}
                                {` (${Math.round(progressPercentage)}%)`}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Health Recommendations */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Personalized Recommendations
          </Text>
          {recommendations.map((recommendation) => (
            <TouchableOpacity
              key={recommendation.id}
              onPress={recommendation.action}
            >
              <Card
                style={[
                  styles.recommendationCard,
                  { backgroundColor: "rgba(255,255,255,0.95)" },
                ]}
              >
                <Card.Content>
                  <View style={styles.recommendationHeader}>
                    <Text
                      style={[
                        styles.recommendationTitle,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {recommendation.title}
                    </Text>
                    <Chip
                      mode="outlined"
                      textStyle={{
                        color: getPriorityColor(recommendation.priority),
                      }}
                      style={[
                        styles.priorityChip,
                        {
                          borderColor: getPriorityColor(
                            recommendation.priority
                          ),
                        },
                      ]}
                    >
                      {recommendation.priority}
                    </Chip>
                  </View>
                  <Text
                    style={[
                      styles.recommendationDescription,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    {recommendation.description}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <Card
              style={[
                styles.actionCard,
                { backgroundColor: "rgba(255,255,255,0.95)" },
              ]}
              onPress={() => navigation.navigate("DailyMission")}
            >
              <Card.Content style={styles.actionContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.customColors.successGreen },
                  ]}
                >
                  <Icon name="flag-checkered" size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.actionTitle,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Daily Missions
                </Text>
              </Card.Content>
            </Card>
            <Card
              style={[
                styles.actionCard,
                { backgroundColor: "rgba(255,255,255,0.95)" },
              ]}
              onPress={() => navigation.navigate("Assessment")}
            >
              <Card.Content style={styles.actionContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.customColors.infoBlue },
                  ]}
                >
                  <Icon name="clipboard-check" size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.actionTitle,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  New Assessment
                </Text>
              </Card.Content>
            </Card>
            <Card
              style={[
                styles.actionCard,
                { backgroundColor: "rgba(255,255,255,0.95)" },
              ]}
                              onPress={() => navigation.navigate("Activity")}
            >
              <Card.Content style={styles.actionContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.customColors.warmOrange },
                  ]}
                >
                  <Icon name="yoga" size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.actionTitle,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Wellness Programs
                </Text>
              </Card.Content>
            </Card>
            {/* Book Clinic Card - temporarily commented out */}
            {/* <Card
              style={[
                styles.actionCard,
                { backgroundColor: "rgba(255,255,255,0.95)" },
              ]}
              onPress={() => navigation.navigate("ClinicBooking")}
            >
              <Card.Content style={styles.actionContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.customColors.softPink },
                  ]}
                >
                  <Icon name="hospital-building" size={24} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.actionTitle,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Book Clinic
                </Text>
              </Card.Content>
            </Card> */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  missionStatusCard: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  missionStatusContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  missionStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  missionStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  missionStatusInfo: {
    flex: 1,
  },
  missionStatusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  missionStatusSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  missionProgressContainer: {
    marginTop: 8,
  },
  missionProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  missionProgressText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    marginBottom: 15,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricContent: {
    paddingVertical: 15,
    paddingHorizontal: 12,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  metricIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 2,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 16,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  activitiesCard: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  recommendationCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  priorityChip: {
    height: 24,
  },
  recommendationDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    marginBottom: 15,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionContent: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default DashboardScreen;
