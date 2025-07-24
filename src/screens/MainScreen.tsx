import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import ProgressRing from "../components/ProgressRing";
import MissionPromptCard from "../components/MissionPromptCard";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

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

// Home Tab Component
const HomeTab = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user, isAuthenticated } = useAuth();
  const [missionStats, setMissionStats] = useState<MissionStats>({
    totalMissions: 0,
    completedMissions: 0,
    totalPoints: 0,
  });
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadMissionData();
    }
  }, [isAuthenticated]);

  const loadMissionData = async () => {
    try {
      setLoading(true);
      const [statsResponse, userMissionsResponse] = await Promise.all([
        api.getMissionStats(),
        api.getMyMissions(),
      ]);

      if (statsResponse.success) {
        setMissionStats(statsResponse.data);
      }

      if (userMissionsResponse.success) {
        setUserMissions(userMissionsResponse.data);
      }
    } catch (error) {
      console.error("Error loading mission data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get initials from full name
  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else {
      return (
        words[0].charAt(0) + words[words.length - 1].charAt(0)
      ).toUpperCase();
    }
  };

  const todayMetrics = [
    {
      id: "1",
      icon: "food-fork-drink",
      value: "523",
      unit: "kcal",
      color: "#E0E7FF",
    },
    {
      id: "2",
      icon: "basket",
      value: "2.0",
      unit: "serve",
      color: "#E0E7FF",
    },
    {
      id: "3",
      icon: "walk",
      value: "5990",
      unit: "step",
      color: "#E0E7FF",
    },
    {
      id: "4",
      icon: "run",
      value: "45",
      unit: "min",
      color: "#E0E7FF",
    },
  ];

  // Quick Actions Data
  const quickActions = [
    {
      id: "1",
      title: "Book Clinic",
      icon: "hospital-building",
      color: "#EF4444",
      action: () => navigation.navigate("ClinicBooking"),
    },
    {
      id: "2",
      title: "Log Meal",
      icon: "food-apple",
      color: "#10B981",
      action: () => navigation.navigate("MealLogging"),
    },
    {
      id: "3",
      title: "Track Water",
      icon: "water",
      color: "#3B82F6",
      action: () => navigation.navigate("WaterTracking"),
    },
    {
      id: "4",
      title: "Log Exercise",
      icon: "dumbbell",
      color: "#E22345",
      action: () => navigation.navigate("Fitness"),
    },
    {
      id: "5",
      title: "Mood Check",
      icon: "emoticon",
      color: "#F59E0B",
      action: () => navigation.navigate("MoodTracking"),
    },
    {
      id: "6",
      title: "Sleep Track",
      icon: "sleep",
      color: "#8B5CF6",
      action: () => navigation.navigate("SleepTracking"),
    },
  ];

  // Health Insights Data - Updated to show mission-related data
  const healthInsights = [
    {
      id: "1",
      title: "Mission Progress",
      value: `${missionStats.completedMissions}/${missionStats.totalMissions}`,
      trend:
        userMissions.length === 0
          ? "Start Now"
          : "+" + Math.floor(missionStats.totalPoints / 10),
      trendPositive: true,
      icon: "flag-checkered",
      color: "#8B5CF6",
    },
    {
      id: "2",
      title: "Points Earned",
      value: `${missionStats.totalPoints} pts`,
      trend:
        missionStats.totalPoints > 0
          ? "+" + Math.floor(missionStats.totalPoints / 5)
          : "0",
      trendPositive: true,
      icon: "star",
      color: "#EF4444",
    },
    {
      id: "3",
      title: "Active Missions",
      value: userMissions.filter((um) => um.status === "active").length,
      trend:
        userMissions.filter((um) => um.status === "active").length > 0
          ? "Active"
          : "None",
      trendPositive:
        userMissions.filter((um) => um.status === "active").length > 0,
      icon: "play-circle",
      color: "#10B981",
    },
  ];

  // Featured Articles Data
  const featuredArticles = [
    {
      id: "1",
      title: "Understanding Macronutrients",
      description: "Learn about proteins, carbs, and fats",
      readTime: "5 min read",
      image: "food-apple",
      color: "#10B981",
      category: "Nutrition",
    },
    {
      id: "2",
      title: "The Benefits of Regular Exercise",
      description: "How physical activity improves your health",
      readTime: "4 min read",
      image: "heart-pulse",
      color: "#3B82F6",
      category: "Fitness",
    },
    {
      id: "3",
      title: "Stress Management Techniques",
      description: "Effective ways to manage daily stress",
      readTime: "6 min read",
      image: "meditation",
      color: "#E22345",
      category: "Wellness",
    },
    {
      id: "4",
      title: "Sleep Quality and Health",
      description: "Improve your sleep for better health",
      readTime: "7 min read",
      image: "sleep",
      color: "#E22345",
      category: "Health",
    },
    {
      id: "5",
      title: "Mindful Eating Practices",
      description: "Transform your relationship with food",
      readTime: "5 min read",
      image: "food-variant",
      color: "#F59E0B",
      category: "Nutrition",
    },
    {
      id: "6",
      title: "Mental Health Awareness",
      description: "Understanding and supporting mental health",
      readTime: "8 min read",
      image: "brain",
      color: "#EC4899",
      category: "Wellness",
    },
  ];

  // Calculator Programs Data
  const calculatorPrograms = [
    {
      id: "1",
      title: "BMI Calculator",
      description: "Calculate your Body Mass Index",
      icon: "scale-bathroom",
      color: "#10B981",
    },
    {
      id: "2",
      title: "PHQ-9 Assessment",
      description: "Depression screening tool",
      icon: "brain",
      color: "#3B82F6",
    },
    {
      id: "3",
      title: "GAD-7 Assessment",
      description: "Anxiety screening tool",
      icon: "heart-pulse",
      color: "#E22345",
    },
    {
      id: "4",
      title: "Calorie Calculator",
      description: "Calculate daily calorie needs",
      icon: "calculator",
      color: "#F59E0B",
    },
    {
      id: "5",
      title: "Water Intake",
      description: "Calculate daily water needs",
      icon: "water",
      color: "#06B6D4",
    },
    {
      id: "6",
      title: "Sleep Tracker",
      description: "Track your sleep patterns",
      icon: "sleep",
      color: "#E22345",
    },
  ];

  const renderQuickAction = ({ item }: any) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={item.action}>
      <View
        style={[styles.quickActionIcon, { backgroundColor: item.color + "20" }]}
      >
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.quickActionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedArticle = ({ item }: any) => (
    <TouchableOpacity
      style={styles.featuredArticleCard}
      onPress={() => navigation.navigate("ArticleDetail", { article: item })}
    >
      <View
        style={[
          styles.featuredArticleIcon,
          { backgroundColor: item.color + "20" },
        ]}
      >
        <Icon name={item.image} size={24} color={item.color} />
      </View>
      <View style={styles.featuredArticleContent}>
        <Text style={styles.featuredArticleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.featuredArticleCategory}>{item.category}</Text>
        <Text style={styles.featuredArticleReadTime}>{item.readTime}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCalculatorProgram = ({ item }: any) => (
    <TouchableOpacity style={styles.calculatorCard}>
      <View
        style={[styles.calculatorIcon, { backgroundColor: item.color + "20" }]}
      >
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.calculatorTitle}>{item.title}</Text>
      <Text style={styles.calculatorDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {isAuthenticated ? (
              <TouchableOpacity
                style={styles.profileThumbnail}
                onPress={() => navigation.navigate("Profile")}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(user?.name || "")}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
            <View style={styles.headerText}>
              {isAuthenticated ? (
                <>
                  <Text style={styles.greetingText}>
                    Hi, {user?.name || "User"}
                  </Text>
                  <View style={styles.badgeContainer}>
                    <Icon name="star" size={12} color="#FFFFFF" />
                    <Text style={styles.badgeText}>
                      {user?.points ?? missionStats.totalPoints}
                    </Text>
                  </View>
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                    backgroundColor: "#E22345",
                    borderRadius: 16,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                  >
                    Masuk/Daftar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.navigate("Notification")}
            >
              <Icon name="bell-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Good Afternoon */}
        <View style={styles.afternoonContainer}>
          <Icon name="weather-sunny" size={20} color="#F59E0B" />
          <Text style={styles.afternoonText}>Good afternoon</Text>
        </View>

        {/* Mission Status Card - Show when user has no missions */}
        {isAuthenticated && userMissions.length === 0 && (
          <MissionPromptCard
            title="Start Your Mission Journey"
            subtitle="Complete missions to earn points and track your wellness progress"
            icon="flag-checkered"
            iconColor="#E22345"
            backgroundColor="#FFFFFF"
            onPress={() => navigation.navigate("DailyMission")}
          />
        )}

        {/* Wellness Program Card - Show when user has no active missions */}
        {isAuthenticated &&
          userMissions.filter((um) => um.status === "active").length === 0 &&
          userMissions.length > 0 && (
            <MissionPromptCard
              title="Join Wellness Programs"
              subtitle="Participate in structured wellness programs for better health outcomes"
              icon="yoga"
              iconColor="#F59E0B"
              backgroundColor="#FFFFFF"
              onPress={() => navigation.navigate("Wellness")}
            />
          )}

        {/* Clinic Booking Card - Show when user has no missions */}
        {isAuthenticated && userMissions.length === 0 && (
          <MissionPromptCard
            title="Book Clinic Consultation"
            subtitle="Regular health checkups help maintain your wellness goals"
            icon="hospital-building"
            iconColor="#3B82F6"
            backgroundColor="#FFFFFF"
            onPress={() => navigation.navigate("ClinicBooking")}
          />
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsListContainer}
            style={styles.quickActionsFlatList}
          />
        </View>

        {/* Today's Summary - Modern Card Design */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Showing for Today</Text>
          <View style={styles.summaryContent}>
            <View style={styles.metricsContainer}>
              {todayMetrics.map((metric) => (
                <View key={metric.id} style={styles.metricCard}>
                  <Icon name={metric.icon} size={20} color="#E22345" />
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricUnit}>{metric.unit}</Text>
                </View>
              ))}
            </View>
            <View style={styles.wellnessScoreContainer}>
              <ProgressRing
                progress={
                  userMissions.length === 0
                    ? 0
                    : Math.min(
                        (missionStats.completedMissions /
                          Math.max(missionStats.totalMissions, 1)) *
                          100,
                        100
                      )
                }
                size={120}
                strokeWidth={12}
                strokeColor="#F59E0B"
              >
                <Text style={styles.wellnessScoreValue}>
                  {userMissions.length === 0
                    ? "0"
                    : Math.round(
                        (missionStats.completedMissions /
                          Math.max(missionStats.totalMissions, 1)) *
                          100
                      )}
                </Text>
                <Text style={styles.wellnessScoreLabel}>
                  {userMissions.length === 0
                    ? "Start Missions"
                    : "Mission Progress"}
                </Text>
              </ProgressRing>
              <TouchableOpacity
                style={styles.moreDetailsContainer}
                onPress={() => navigation.navigate("DailyMission")}
              >
                <Text style={styles.moreDetailsText}>
                  {userMissions.length === 0 ? "Get Started" : "View Missions"}
                </Text>
                <Icon name="arrow-right" size={16} color="#E22345" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Health Insights */}
        <View style={styles.healthInsightsContainer}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          <View style={styles.healthInsightsGrid}>
            {healthInsights.map((insight) => (
              <View key={insight.id} style={styles.healthInsightCard}>
                <View style={styles.healthInsightHeader}>
                  <View
                    style={[
                      styles.healthInsightIcon,
                      { backgroundColor: insight.color + "20" },
                    ]}
                  >
                    <Icon name={insight.icon} size={20} color={insight.color} />
                  </View>
                  <Text style={styles.healthInsightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.healthInsightValue}>{insight.value}</Text>
                <View style={styles.healthInsightTrend}>
                  <Icon
                    name={
                      insight.trendPositive ? "trending-up" : "trending-down"
                    }
                    size={14}
                    color={insight.trendPositive ? "#10B981" : "#EF4444"}
                  />
                  <Text
                    style={[
                      styles.healthInsightTrendText,
                      { color: insight.trendPositive ? "#10B981" : "#EF4444" },
                    ]}
                  >
                    {insight.trend}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Calculator Programs */}
        <View style={styles.calculatorContainer}>
          <Text style={styles.sectionTitle}>Health Calculators</Text>
          <View style={styles.calculatorGrid}>
            {calculatorPrograms.slice(0, 3).map((program) => (
              <TouchableOpacity
                key={program.id}
                style={styles.calculatorCardSmall}
                onPress={() => navigation.navigate("Calculator", { program })}
              >
                <View
                  style={[
                    styles.calculatorIconSmall,
                    { backgroundColor: program.color + "20" },
                  ]}
                >
                  <Icon name={program.icon} size={20} color={program.color} />
                </View>
                <Text style={styles.calculatorTitleSmall}>{program.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.calculatorCardSmall}
              onPress={() => navigation.navigate("AllCalculators")}
            >
              <View style={styles.calculatorIconSmall}>
                <Icon name="apps" size={20} color="#6366F1" />
              </View>
              <Text style={styles.calculatorTitleSmall}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Articles */}
        <View style={styles.featuredContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Articles</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("PersonalizedContent")}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredArticles}
            renderItem={renderFeaturedArticle}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredListContainer}
            style={styles.featuredFlatList}
          />
        </View>

        {/* Personalized Content */}
        <View style={styles.personalizedContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personalized Content</Text>
            <View style={styles.hashtags}>
              <Text style={styles.hashtag}>#nutrition</Text>
              <Text style={styles.hashtag}>#wellbeing</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.contentCard}
            onPress={() => navigation.navigate("PersonalizedContent")}
          >
            <View style={styles.contentCardContent}>
              <View style={styles.contentImageContainer}>
                <View style={styles.contentImage}>
                  <Icon name="bone" size={40} color="#F59E0B" />
                  <View style={styles.vitaminBottle}>
                    <Text style={styles.vitaminText}>D</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.contentTitle}>
                Lifestyle Changes To Adopt For Strength
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// Mission Tab Component
const MissionTab = ({ navigation }: any) => {
  const { isAuthenticated } = useAuth();

  const handleMissionPress = () => {
    if (isAuthenticated) {
      navigation.navigate("DailyMission");
    } else {
      // Show login prompt
      navigation.navigate("Login");
    }
  };

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        {/* <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerText}>
              <Text style={styles.greetingText}>Daily Missions</Text>
              {!isAuthenticated && (
                <Text style={styles.subtitleText}>
                  Login untuk mengakses misi harian
                </Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            {!isAuthenticated && (
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  backgroundColor: "#E22345",
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                >
                  Masuk/Daftar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View> */}

        <TouchableOpacity
          style={styles.missionSectionContainer}
          onPress={handleMissionPress}
        >
          <Text style={styles.sectionTitle}>Daily Missions</Text>
          <View style={styles.missionButtonContainer}>
            <LinearGradient
              colors={["#E22345", "#E22345"]}
              style={styles.missionButton}
            >
              <Icon name="plus" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.moreText}>More</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

// Health Tab Component
const HealthTab = ({ navigation }: any) => {
  const macronutrients = [
    {
      id: "1",
      icon: "food-steak",
      label: "Protein",
      value: "10",
      color: "#E22345",
    },
    {
      id: "2",
      icon: "bread-slice",
      label: "Carb",
      value: "100",
      color: "#60A5FA",
    },
    {
      id: "3",
      icon: "oil",
      label: "Fat",
      value: "20",
      color: "#FB923C",
    },
    {
      id: "4",
      icon: "leaf",
      label: "PBWF",
      value: "3.0",
      color: "#34D399",
    },
  ];

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>W</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.greetingText}>Hi, Wellness WeCare</Text>
              <View style={styles.badgeContainer}>
                <Icon name="star" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>12</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Icon
              name="view-grid"
              size={24}
              color="#6B7280"
              style={styles.headerIcon}
            />
            <Icon
              name="menu"
              size={24}
              color="#6B7280"
              style={styles.headerIcon}
            />
          </View>
        </View> */}

        {/* <View style={styles.afternoonContainer}>
          <Icon name="weather-sunny" size={20} color="#F59E0B" />
          <Text style={styles.afternoonText}>Good afternoon</Text>
        </View> */}

        {/* Total Calories */}
        <TouchableOpacity
          style={styles.caloriesContainer}
          onPress={() => navigation.navigate("NutritionDetails")}
        >
          <Text style={styles.sectionTitle}>Total</Text>
          <View style={styles.caloriesContent}>
            <Text style={styles.caloriesText}>623 / 1617 kcal</Text>
            <View style={styles.caloriesActions}>
              <Icon
                name="pencil"
                size={20}
                color="#6B7280"
                style={styles.caloriesIcon}
              />
              <Icon
                name="plus"
                size={20}
                color="#6B7280"
                style={styles.caloriesIcon}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Macronutrients */}
        <View style={styles.macrosContainer}>
          {macronutrients.map((macro) => (
            <View
              key={macro.id}
              style={[styles.macroCard, { backgroundColor: macro.color }]}
            >
              <Icon name={macro.icon} size={20} color="#FFFFFF" />
              <Text style={styles.macroLabel}>{macro.label}</Text>
              <Text style={styles.macroValue}>{macro.value}</Text>
            </View>
          ))}
        </View>

        {/* Personalized Content */}
        <View style={styles.personalizedContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personalized Content</Text>
            <View style={styles.hashtags}>
              <Text style={styles.hashtag}>#nutrition</Text>
              <Text style={styles.hashtag}>#wellbeing</Text>
            </View>
          </View>
          <View style={styles.contentCard}>
            <View style={styles.contentCardContent}>
              <View style={styles.contentImageContainer}>
                <View style={styles.healthContentImage}>
                  <Icon
                    name="star"
                    size={20}
                    color="#F59E0B"
                    style={styles.starIcon}
                  />
                  <View style={styles.healthIcons}>
                    <Icon name="human" size={30} color="#E22345" />
                    <Icon name="emoticon" size={25} color="#F59E0B" />
                    <Icon name="food-apple" size={25} color="#10B981" />
                    <Icon name="leaf" size={25} color="#34D399" />
                  </View>
                </View>
              </View>
              <Text style={styles.contentTitle}>
                7 Easy Meals You Can Rustle Up At Home For A Healthy Gut
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// Chat Tab Component
const ChatTab = ({ navigation }: any) => {
  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>W</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.greetingText}>Hi, Wellness WeCare</Text>
              <View style={styles.badgeContainer}>
                <Icon name="star" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>12</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Icon
              name="view-grid"
              size={24}
              color="#6B7280"
              style={styles.headerIcon}
            />
            <Icon
              name="menu"
              size={24}
              color="#6B7280"
              style={styles.headerIcon}
            />
          </View>
        </View>

        <View style={styles.afternoonContainer}>
          <Icon name="weather-sunny" size={20} color="#F59E0B" />
          <Text style={styles.afternoonText}>Good afternoon</Text>
        </View> */}

        <TouchableOpacity
          style={styles.chatSectionContainer}
          onPress={() => navigation.navigate("ChatAssistant")}
        >
          <Text style={styles.sectionTitle}>AI Health Assistant</Text>
          <View style={styles.chatCard}>
            <View style={styles.chatCardContent}>
              <Icon name="robot" size={50} color="#E22345" />
              <Text style={styles.chatTitle}>
                Ask me anything about your health
              </Text>
              <Text style={styles.chatSubtitle}>
                I'm here to help you with nutrition, fitness, and wellness
                advice
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

// Daily Mission Tab Component (Empty component for the center button)
const DailyMissionTab = () => {
  return <View style={{ flex: 1 }} />;
};

// Main Screen with Tabs
const MainScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = "home";

            if (route.name === "HOME") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "MISSION") {
              iconName = focused ? "flag" : "flag-outline";
            } else if (route.name === "HEALTH") {
              iconName = focused ? "heart" : "heart-outline";
            } else if (route.name === "CHAT") {
              iconName = focused ? "chat" : "chat-outline";
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#E22345",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            paddingBottom: 10,
            paddingTop: 10,
            height: 80,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="HOME"
          component={HomeTab}
          options={{ tabBarLabel: "HOME" }}
        />
        <Tab.Screen
          name="MISSION"
          component={MissionTab}
          options={{ tabBarLabel: "MISSION" }}
        />
        <Tab.Screen
          name="DAILY_MISSION"
          component={DailyMissionTab}
          options={{
            tabBarLabel: "",
            tabBarButton: (props) => (
              <View style={styles.dailyMissionButton}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("DailyMission")}
                  style={styles.dailyMissionGradient}
                >
                  <Icon name="plus" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="HEALTH"
          component={HealthTab}
          options={{ tabBarLabel: "HEALTH" }}
        />
        <Tab.Screen
          name="CHAT"
          component={ChatTab}
          options={{ tabBarLabel: "CHAT" }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileThumbnail: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E22345",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#E22345",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerText: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 12,
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  badgeContainer: {
    backgroundColor: "#E22345",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#E22345",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 32,
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginLeft: 16,
  },
  afternoonContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  afternoonText: {
    fontSize: 15,
    color: "#64748B",
    marginLeft: 8,
    fontWeight: "500",
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    marginTop: 20,
    letterSpacing: -0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryContent: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  metricsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginRight: 20,
  },
  metricCard: {
    width: "48%",
    // borderWidth: 1,
    // borderColor: "#E2E8F0",
    // borderRadius: 16,
    padding: 16,
    // alignItems: "center",
    // marginBottom: 12,
    // backgroundColor: "#FFFFFF",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 6,
    elevation: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 6,
  },
  metricUnit: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
    fontWeight: "500",
  },
  wellnessScoreContainer: {
    width: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  wellnessScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
  },
  wellnessScoreInner: {
    alignItems: "center",
  },
  wellnessScoreValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#3B82F6",
    letterSpacing: -0.5,
  },
  wellnessScoreLabel: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 2,
  },
  moreDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 10,
  },
  moreDetailsText: {
    fontSize: 14,
    color: "#E22345",
    fontWeight: "600",
    marginRight: 4,
  },
  personalizedContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },

  hashtags: {
    flexDirection: "row",
  },
  hashtag: {
    fontSize: 13,
    color: "#E22345",
    marginLeft: 10,
    fontWeight: "600",
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  contentCardContent: {
    padding: 0,
  },
  contentImageContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  contentImage: {
    width: 120,
    height: 80,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  vitaminBottle: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 30,
    height: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  vitaminText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  healthContentImage: {
    width: 140,
    height: 90,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  starIcon: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  healthIcons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  contentTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  missionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  missionSectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  chatSectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  missionButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  missionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E22345",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  missionButtonLabel: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  moreText: {
    fontSize: 16,
    color: "#E22345",
    marginLeft: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  caloriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  caloriesContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caloriesText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  caloriesActions: {
    flexDirection: "row",
  },
  caloriesIcon: {
    marginLeft: 15,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 25,
    gap: 12,
  },
  macroCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  macroLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 6,
    fontWeight: "600",
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 3,
  },
  chatCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  chatCardContent: {
    alignItems: "center",
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  chatSubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  featuredContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    paddingBottom: 10,
  },
  featuredListContainer: {
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  featuredFlatList: {
    minHeight: 140,
  },
  featuredArticleCard: {
    width: width * 0.7,
    marginRight: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 120,
  },
  featuredArticleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  featuredArticleContent: {
    flex: 1,
  },
  featuredArticleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 5,
    lineHeight: 20,
  },
  featuredArticleCategory: {
    fontSize: 12,
    color: "#E22345",
    fontWeight: "600",
    marginBottom: 5,
  },
  featuredArticleReadTime: {
    fontSize: 11,
    color: "#64748B",
  },
  calculatorContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  calculatorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  calculatorCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  calculatorCardSmall: {
    width: "23%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  calculatorIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  calculatorIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F3F4F6",
  },
  calculatorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 5,
    lineHeight: 20,
  },
  calculatorTitleSmall: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 14,
  },
  calculatorDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
  seeAllText: {
    fontSize: 14,
    color: "#E22345",
    fontWeight: "600",
    marginLeft: 10,
  },
  dailyMissionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -25,
    shadowColor: "#E22345",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
  },
  dailyMissionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E22345",
  },
  missionPromptContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  missionPromptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  missionPromptContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  missionPromptIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  missionPromptText: {
    flex: 1,
  },
  missionPromptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  missionPromptSubtitle: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    fontWeight: "500",
  },
  quickActionsContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  quickActionsListContainer: {
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  quickActionsFlatList: {
    minHeight: 100,
  },
  quickActionCard: {
    width: 120,
    marginRight: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 18,
  },
  healthInsightsContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  healthInsightsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  healthInsightCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    minHeight: 120,
  },
  healthInsightHeader: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 12,
  },
  healthInsightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  healthInsightTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 16,
  },
  healthInsightValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  healthInsightTrend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  healthInsightTrendText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
  },
});

export default MainScreen;
