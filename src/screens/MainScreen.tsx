import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";

import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import ProgressRing from "../components/ProgressRing";
import MissionPromptCard from "../components/MissionPromptCard";
import TodaySummaryCard from "../components/TodaySummaryCard";

import GradientButton from "../components/GradientButton";
import ModernIconButton from "../components/ModernIconButton";
import ActivityDetectionService from "../services/ActivityDetectionService";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import { withRetry } from "../utils/errorHandler";
import RSSService, { RSSItem } from "../services/RSSService";
import apiService from "../services/api";
import ConsultationHistoryScreen from "./ConsultationHistoryScreen";
import ActivityScreen from "./ActivityScreen";
import FeaturedArticleCard from "../components/FeaturedArticleCard";
import eventEmitter from "../utils/eventEmitter";
import { getTimeBasedGreeting } from "../utils/greetingUtils";
import dateChangeDetector from "../utils/dateChangeDetector";

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
  const { t } = useLanguage();
  const [missionStats, setMissionStats] = useState<MissionStats>({
    totalMissions: 0,
    completedMissions: 0,
    totalPoints: 0,
  });
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(false);
  const [todaySummary, setTodaySummary] = useState({
    calories: 0,
    servings: 0,
    steps: 0,
    exerciseMinutes: 0,
    distance: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activityData, setActivityData] = useState({ steps: 0, distance: 0 });
  const [featuredArticles, setFeaturedArticles] = useState<RSSItem[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [hasJoinedWellnessProgram, setHasJoinedWellnessProgram] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState(getTimeBasedGreeting());

  useEffect(() => {
    // Initialize date change detector
    dateChangeDetector.initialize();
    
    if (isAuthenticated) {
      loadMissionData();
      checkWellnessProgramStatus();
    }
    
    // Load activity data
    const loadActivityData = () => {
      const data = ActivityDetectionService.getTodayActivityData();
      setActivityData(data);
    };
    
    loadActivityData();
    
    // Load RSS articles with a small delay to ensure proper initialization
    const loadArticlesWithDelay = () => {
      setTimeout(() => {
        loadRSSArticles();
      }, 1000);
    };
    
    loadArticlesWithDelay();
    
    // Update activity data every 30 seconds
    const activityInterval = setInterval(loadActivityData, 30000);
    
    // Update greeting every minute to ensure it stays current
    const greetingInterval = setInterval(() => {
      setCurrentGreeting(getTimeBasedGreeting());
    }, 60000);
    
    // Listen for data refresh events
    const handleDataRefresh = () => {
      console.log('MainScreen - Data refresh event received, refreshing mission data...');
      if (isAuthenticated) {
        loadMissionData();
        checkWellnessProgramStatus();
      }
    };
    
    const handleMealLogged = () => {
      console.log('MainScreen - Meal logged event received, refreshing mission data...');
      if (isAuthenticated) {
        loadMissionData();
        checkWellnessProgramStatus();
      }
    };
    
    const handleWaterLogged = () => {
      console.log('MainScreen - Water logged event received, refreshing mission data...');
      if (isAuthenticated) {
        loadMissionData();
        checkWellnessProgramStatus();
      }
    };
    
    const handleFitnessLogged = () => {
      console.log('MainScreen - Fitness logged event received, refreshing mission data...');
      if (isAuthenticated) {
        loadMissionData();
        checkWellnessProgramStatus();
      }
    };
    
    const handleSleepLogged = () => {
      console.log('MainScreen - Sleep logged event received, refreshing mission data...');
      if (isAuthenticated) {
        loadMissionData();
        checkWellnessProgramStatus();
      }
    };
    
    const handleMoodLogged = () => {
      console.log('MainScreen - Mood logged event received, refreshing mission data...');
      if (isAuthenticated) {
        loadMissionData();
        checkWellnessProgramStatus();
      }
    };
    
    // Listen for daily reset events
    const handleDailyReset = () => {
      console.log('MainScreen - Daily reset detected, refreshing all data...');
      setTodaySummary({
        calories: 0,
        servings: 0,
        steps: 0,
        exerciseMinutes: 0,
        distance: 0,
      });
      setActivityData({ steps: 0, distance: 0 });
      if (isAuthenticated) {
        loadMissionData();
        checkWellnessProgramStatus();
      }
    };
    
    // Add event listeners
    eventEmitter.on('dataRefresh', handleDataRefresh);
    eventEmitter.on('mealLogged', handleMealLogged);
    eventEmitter.on('waterLogged', handleWaterLogged);
    eventEmitter.on('fitnessLogged', handleFitnessLogged);
    eventEmitter.on('sleepLogged', handleSleepLogged);
    eventEmitter.on('moodLogged', handleMoodLogged);
    eventEmitter.on('dailyReset', handleDailyReset);
    
    return () => {
      clearInterval(activityInterval);
      clearInterval(greetingInterval);
      // Remove event listeners
      eventEmitter.off('dataRefresh', handleDataRefresh);
      eventEmitter.off('mealLogged', handleMealLogged);
      eventEmitter.off('waterLogged', handleWaterLogged);
      eventEmitter.off('fitnessLogged', handleFitnessLogged);
      eventEmitter.off('sleepLogged', handleSleepLogged);
      eventEmitter.off('moodLogged', handleMoodLogged);
      eventEmitter.off('dailyReset', handleDailyReset);
    };
  }, [isAuthenticated]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadMissionData();
        checkWellnessProgramStatus();
      }
    }, [isAuthenticated])
  );

  const loadMissionData = async () => {
    // Only load data if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setSummaryLoading(true);
      
      // Use withRetry for better error handling
      const [statsResponse, userMissionsResponse, todaySummaryResponse] = await Promise.all([
        withRetry(() => api.getMissionStats({ date: new Date().toISOString().split('T')[0] }), 3, 2000),
        withRetry(() => api.getMyMissions(), 3, 2000),
        withRetry(() => api.getTodaySummary(), 3, 2000),
      ]);

      if (statsResponse.success) {
        setMissionStats(statsResponse.data);
      }

      if (userMissionsResponse.success) {
        setUserMissions(userMissionsResponse.data);
      }

      if (todaySummaryResponse.success && todaySummaryResponse.data) {
        const summaryData = todaySummaryResponse.data;
        console.log('MainScreen - Today summary data received:', summaryData);
        setTodaySummary({
          calories: parseFloat(summaryData.meal?.calories) || parseFloat(summaryData.calories) || 0,
          servings: parseInt(summaryData.meal?.meal_count) || parseInt(summaryData.servings) || 0,
          steps: parseInt(summaryData.fitness?.steps) || parseInt(summaryData.steps) || 0,
          exerciseMinutes: parseInt(summaryData.fitness?.exercise_minutes) || parseInt(summaryData.exercise_minutes) || 0,
          distance: parseFloat(summaryData.fitness?.distance_km) || 0,
        });
        console.log('MainScreen - Mapped today summary:', {
          calories: parseFloat(summaryData.meal?.calories) || parseFloat(summaryData.calories) || 0,
          servings: parseInt(summaryData.meal?.meal_count) || parseInt(summaryData.servings) || 0,
          steps: parseInt(summaryData.fitness?.steps) || parseInt(summaryData.steps) || 0,
          exerciseMinutes: parseInt(summaryData.fitness?.exercise_minutes) || parseInt(summaryData.exercise_minutes) || 0,
          distance: parseFloat(summaryData.fitness?.distance_km) || 0,
        });
      } else {
        console.warn('MainScreen - Failed to load today summary:', todaySummaryResponse);
      }
    } catch (error) {
      console.error("Error loading mission data:", error);
      // Set default values instead of showing errors for background data loading
      setMissionStats({
        totalMissions: 0,
        completedMissions: 0,
        totalPoints: 0,
      });
      setUserMissions([]);
      setTodaySummary({
        calories: 0,
        servings: 0,
        steps: 0,
        exerciseMinutes: 0,
        distance: 0,
      });
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  };

  const checkWellnessProgramStatus = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const wellnessResponse = await apiService.getWellnessProgramStatus();
      
      if (wellnessResponse.success && wellnessResponse.data) {
        const wellnessData = wellnessResponse.data;
        setHasJoinedWellnessProgram(wellnessData.has_joined);
      } else {
        setHasJoinedWellnessProgram(false);
      }
    } catch (error) {
      console.error("Error checking wellness program status:", error);
      // Don't show alert for background status checks
      setHasJoinedWellnessProgram(false);
    }
  };

  const loadRSSArticles = async () => {
    try {
      setArticlesLoading(true);
      const articles = await RSSService.getHealthNews();
      setFeaturedArticles(articles);
    } catch (error) {
      console.error("Error loading RSS articles:", error);
      const fallbackArticles = [
        {
          id: 'fallback_1',
          title: 'Tips Menjaga Kesehatan Mental di Era Digital',
          description: 'Panduan lengkap untuk menjaga kesehatan mental di tengah kemajuan teknologi.',
          readTime: '5 min read',
          image: 'brain',
          color: '#9F7AEA',
          bgColor: '#FAF5FF',
          category: 'Mental Health',
          source: 'Health Tips'
        },
        {
          id: 'fallback_2',
          title: 'Pentingnya Olahraga Rutin untuk Kesehatan',
          description: 'Manfaat olahraga rutin dan tips memulai kebiasaan sehat.',
          readTime: '4 min read',
          image: 'dumbbell',
          color: '#F59E0B',
          bgColor: '#FFFBEB',
          category: 'Fitness',
          source: 'Fitness Guide'
        }
      ];
      setFeaturedArticles(fallbackArticles);
    } finally {
      setArticlesLoading(false);
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
      value: (todaySummary.calories || 0) > 0 ? (todaySummary.calories || 0).toString() : '--',
      unit: "kcal",
      color: "#FF6B8A",
      bgColor: "#FEF2F2",
      label: "Kalori",
      emptyMessage: "Belum ada data makanan",
    },
    {
      id: "2",
      icon: "basket",
      value: (todaySummary?.servings || 0) > 0 ? (todaySummary?.servings || 0).toFixed(1) : '--',
      unit: "serve",
      color: "#38A169",
      bgColor: "#F0FDF4",
      label: "Porsi",
      emptyMessage: "Belum ada data porsi",
    },
    {
      id: "3",
      icon: "walk",
      value: (activityData?.steps || 0) > 0 ? (activityData?.steps || 0).toString() : '--',
      unit: "step",
      color: "#3182CE",
      bgColor: "#EBF8FF",
      label: "Langkah",
      emptyMessage: "Belum ada data langkah",
    },
    {
      id: "4",
      icon: "run",
      value: (todaySummary?.exerciseMinutes || 0) > 0 ? (todaySummary?.exerciseMinutes || 0).toString() : '--',
      unit: "min",
      color: "#ED8936",
      bgColor: "#FFFAF0",
      label: "Olahraga",
      emptyMessage: "Belum ada data olahraga",
    },
    {
      id: "5",
      icon: "map-marker-distance",
      unit: "km",
      color: "#A1887F",
      bgColor: "#F5F5F5",
      label: "Jarak",
      emptyMessage: "Belum ada data jarak",
    },
  ];

  // Quick Actions Data - Updated for non-authenticated users
  const quickActions = [
    {
      id: "1",
      title: "Auto Fitness",
      icon: "radar",
      color: "#38A169",
      gradient: ["#38A169", "#2F855A"] as const,
      action: () => {
        try {
          navigation.navigate("RealtimeFitness");
        } catch (error) {
          console.warn("RealtimeFitness screen not found, navigating to Fitness instead");
          navigation.navigate("Fitness");
        }
      },
    },
    {
      id: "3",
      title: "Log Meal",
      icon: "food-apple",
      color: "#38A169",
      gradient: ["#38A169", "#2F855A"] as const,
      action: () => {
        if (isAuthenticated) {
          try {
            navigation.navigate("MealLogging");
          } catch (error) {
            console.warn("MealLogging screen not found, navigating to WellnessApp instead");
            navigation.navigate("WellnessApp");
          }
        } else {
          navigation.navigate("Login");
        }
      },
    },
    {
      id: "4",
      title: "Track Water",
      icon: "water",
      color: "#3182CE",
      gradient: ["#3182CE", "#2B6CB0"] as const,
      action: () => {
        if (isAuthenticated) {
          try {
            navigation.navigate("WaterTracking");
          } catch (error) {
            console.warn("WaterTracking screen not found, navigating to WellnessApp instead");
            navigation.navigate("WellnessApp");
          }
        } else {
          navigation.navigate("Login");
        }
      },
    },
    {
      id: "5",
      title: "Log Exercise",
      icon: "dumbbell",
      color: "#E53E3E",
      gradient: ["#E53E3E", "#C53030"] as const,
      action: () => {
        if (isAuthenticated) {
          try {
            navigation.navigate("FitnessTracking");
          } catch (error) {
            console.warn("FitnessTracking screen not found, navigating to Fitness instead");
            navigation.navigate("Fitness");
          }
        } else {
          navigation.navigate("Login");
        }
      },
    },
    {
      id: "6",
      title: "Mood Check",
      icon: "emoticon",
      color: "#D69E2E",
      gradient: ["#D69E2E", "#B7791F"] as const,
      action: () => {
        if (isAuthenticated) {
          try {
            navigation.navigate("MoodTracking");
          } catch (error) {
            console.warn("MoodTracking screen not found, navigating to WellnessApp instead");
            navigation.navigate("WellnessApp");
          }
        } else {
          navigation.navigate("Login");
        }
      },
    },
    {
      id: "7",
      title: "Sleep Track",
      icon: "sleep",
      color: "#9F7AEA",
      gradient: ["#9F7AEA", "#805AD5"] as const,
      action: () => {
        if (isAuthenticated) {
          try {
            navigation.navigate("SleepTracking");
          } catch (error) {
            console.warn("SleepTracking screen not found, navigating to WellnessApp instead");
            navigation.navigate("WellnessApp");
          }
        } else {
          navigation.navigate("Login");
        }
      },
    },
  ];


  // Calculator Programs Data
  const calculatorPrograms = [
    {
      id: "1",
      title: "BMI Calculator",
      description: "Calculate your Body Mass Index",
      icon: "scale-bathroom",
      color: "#38A169",
      bgColor: "#F0FDF4",
    },
    {
      id: "2",
      title: "PHQ-9 Assessment",
      description: "Depression screening tool",
      icon: "brain",
      color: "#3182CE",
      bgColor: "#EBF8FF",
    },
    {
      id: "3",
      title: "GAD-7 Assessment",
      description: "Anxiety screening tool",
      icon: "heart-pulse",
      color: "#E53E3E",
      bgColor: "#FEF2F2",
    },
    {
      id: "4",
      title: "Calorie Calculator",
      description: "Calculate daily calorie needs",
      icon: "calculator",
      color: "#D69E2E",
      bgColor: "#FFFAF0",
    },
    {
      id: "5",
      title: "Water Intake",
      description: "Calculate daily water needs",
      icon: "water",
      color: "#06B6D4",
      bgColor: "#ECFEFF",
    },
    {
      id: "6",
      title: "Sleep Tracker",
      description: "Track your sleep patterns",
      icon: "sleep",
      color: "#9F7AEA",
      bgColor: "#FAF5FF",
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

  const renderFeaturedArticle = ({ item }: { item: RSSItem }) => (
    <FeaturedArticleCard
      article={item}
      onPress={() => {
        try {
          navigation.navigate("ArticleDetail", { article: item });
        } catch (error) {
          console.warn("ArticleDetail screen not found, navigating to NewsPortal instead");
          navigation.navigate("NewsPortal");
        }
      }}
    />
  );

  const renderCalculatorProgram = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.calculatorCard}
      onPress={() => {
        try {
          navigation.navigate("Calculator", { program: item });
        } catch (error) {
          console.warn("Calculator screen not found, navigating to WellnessApp instead");
          navigation.navigate("WellnessApp");
        }
      }}
    >
      <View
        style={[styles.calculatorIcon, { backgroundColor: item.bgColor }]}
      >
        <Icon name={item.icon} size={20} color={item.color} />
      </View>
      <Text style={styles.calculatorTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#FAFBFC", "#F7FAFC"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadMissionData}
            colors={["#E53E3E"]}
            tintColor="#E53E3E"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {isAuthenticated ? (
              <TouchableOpacity
                style={styles.profileThumbnail}
                onPress={() => navigation.navigate("Profile")}
              >
                <LinearGradient
                  colors={["#E53E3E", "#C53030"]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(user?.name || "")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.logoContainer}>
                <Icon name="heart-pulse" size={32} color="#E53E3E" />
              </View>
            )}
            <View style={styles.headerText}>
              {isAuthenticated ? (
                <>
                  <Text style={styles.greetingText}>
                    Hi, {user?.name || "User"}
                  </Text>
                  <LinearGradient
                    colors={["#E53E3E", "#C53030"]}
                    style={styles.badgeContainer}
                  >
                    <Icon name="star" size={12} color="#FFFFFF" />
                    <Text style={styles.badgeText}>
                      {user?.points ?? missionStats.totalPoints}
                    </Text>
                  </LinearGradient>
                </>
              ) : (
                <>
                  <Text style={styles.greetingText}>
                    Selamat Datang di PHC
                  </Text>
                  <Text style={styles.subtitleText}>
                    Platform Kesehatan Terpercaya
                  </Text>
                </>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notification")}
              style={styles.bellButton}
            >
              <Icon name="bell-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time-based Greeting */}
        <View style={styles.afternoonContainer}>
          <Icon name={currentGreeting.icon} size={20} color={currentGreeting.color} />
          <Text style={styles.afternoonText}>{currentGreeting.text}</Text>
        </View>

        {/* Welcome Card for Non-Authenticated Users */}
        {!isAuthenticated && (
          <TouchableOpacity 
            style={styles.welcomeCard}
            onPress={() => navigation.navigate("Login")}
          >
            <LinearGradient
              colors={["#E53E3E", "#C53030"]}
              style={styles.welcomeCardGradient}
            >
              <View style={styles.welcomeCardContent}>
                <View style={styles.welcomeCardLeft}>
                  <View style={styles.welcomeIconContainer}>
                    <Icon name="account-plus" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.welcomeTextContainer}>
                    <Text style={styles.welcomeCardTitle}>
                      {t("language.language") === "en" ? "Start Your Health Journey" : "Mulai Perjalanan Kesehatan Anda"}
                    </Text>
                    <Text style={styles.welcomeCardSubtitle}>
                      {t("language.language") === "en" 
                        ? "Login or register to access complete wellness program features"
                        : "Login atau daftar untuk akses fitur lengkap wellness program"
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.welcomeCardRight}>
                  <Icon name="arrow-right" size={24} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Wellness Program Card - Only for authenticated users */}
        {isAuthenticated && (
          <TouchableOpacity 
            style={styles.wellnessCard}
            onPress={() => {
              try {
                navigation.navigate("WellnessApp");
              } catch (error) {
                console.warn("WellnessApp screen not found, navigating to Login instead");
                navigation.navigate("Login");
              }
            }}
          >
            {/* <LinearGradient
              colors={["#E53E3E", "#C53030"]}
              style={styles.wellnessCardGradient}
            >
              <View style={styles.wellnessCardContent}>
                <View style={styles.wellnessCardLeft}>
                  <View style={styles.wellnessIconContainer}>
                    <Icon name="heart-pulse" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.wellnessTextContainer}>
                    <Text style={styles.wellnessCardTitle}>Wellness Program</Text>
                    <Text style={styles.wellnessCardSubtitle}>
                      Mission, Auto Fitness, Log meal, Track Water, Log Exercise
                    </Text>
                  </View>
                </View>
                <View style={styles.wellnessCardRight}>
                  <Text style={styles.wellnessCardSubtitle}>{user?.wellness_program_joined ? "Joined" : "Not Joined"}</Text>
                  <Icon name="arrow-right" size={24} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient> */}
          </TouchableOpacity>
        )}

        {/* Clinics Booking Card - Only for authenticated users */}
        {isAuthenticated && (
          <TouchableOpacity 
            style={styles.clinicsCard}
            onPress={() => {
              try {
                navigation.navigate("ClinicsApp");
              } catch (error) {
                console.warn("ClinicsApp screen not found, navigating to Login instead");
                navigation.navigate("Login");
              }
            }}
          >
            <LinearGradient
              colors={["#3182CE", "#2B6CB0"]}
              style={styles.clinicsCardGradient}
            >
              <View style={styles.clinicsCardContent}>
                <View style={styles.clinicsCardLeft}>
                  <View style={styles.clinicsIconContainer}>
                    <Icon name="hospital-building" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.clinicsTextContainer}>
                    <Text style={styles.clinicsCardTitle}>
                      {t("language.language") === "en" ? "Clinics Booking" : "Booking Klinik"}
                    </Text>
                    <Text style={styles.clinicsCardSubtitle}>
                      {t("language.language") === "en"
                        ? "Book consultations with doctors and health services"
                        : "Booking konsultasi dengan dokter dan layanan kesehatan"
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.clinicsCardRight}>
                  <Icon name="arrow-right" size={24} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Today Summary Card - Only for authenticated users */}
        {isAuthenticated && (
          <TodaySummaryCard 
            onMoreDetailsPress={() => {
              try {
                navigation.navigate("WellnessDetails");
              } catch (error) {
                console.warn("WellnessDetails screen not found, navigating to WellnessApp instead");
                navigation.navigate("WellnessApp");
              }
            }} 
          />
        )}

        {/* Quick Actions - Only show if user has joined wellness program */}
        {isAuthenticated && hasJoinedWellnessProgram && (
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
        )}

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
                    { backgroundColor: program.bgColor },
                  ]}
                >
                  <Icon name={program.icon} size={20} color={program.color} />
                </View>
                <Text style={styles.calculatorTitleSmall}>{program.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.calculatorCardSmall}
              onPress={() => {
                try {
                  navigation.navigate("AllCalculators");
                } catch (error) {
                  console.warn("AllCalculators screen not found, navigating to Calculator instead");
                  navigation.navigate("Calculator", { program: { id: "all", title: "All Calculators" } });
                }
              }}
            >
              <View style={styles.calculatorIconSmall}>
                <Icon name="apps" size={20} color="#6366F1" />
              </View>
              <Text style={styles.calculatorTitleSmall}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Health Articles */}
        <View style={styles.featuredContainer}>
          <View style={styles.featuredSectionHeader}>
            <View style={styles.featuredHeaderLeft}>
              <Text style={styles.featuredSectionTitle}>📰 Featured Health Articles</Text>
              <Text style={styles.featuredSectionSubtitle}>
                Latest from DetikHealth - Health & Lifestyle
              </Text>
            </View>
            <View style={styles.featuredHeaderRight}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadRSSArticles}
                disabled={articlesLoading}
              >
                <Icon 
                  name={articlesLoading ? "loading" : "refresh"} 
                  size={16} 
                  color="#E53E3E" 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => {
                  try {
                    navigation.navigate("NewsPortal");
                  } catch (error) {
                    console.warn("NewsPortal screen not found");
                  }
                }}
              >
                <Text style={styles.seeAllText}>See all</Text>
                <Icon name="arrow-right" size={16} color="#E53E3E" />
              </TouchableOpacity>
            </View>
          </View>
          
          {articlesLoading ? (
            <View style={styles.articlesLoadingContainer}>
              <Icon name="loading" size={24} color="#E53E3E" />
              <Text style={styles.loadingText}>Loading health articles...</Text>
            </View>
          ) : featuredArticles.length > 0 ? (
            <FlatList
              data={featuredArticles}
              renderItem={renderFeaturedArticle}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredListContainer}
              style={styles.featuredFlatList}
            />
          ) : (
            <View style={styles.articlesErrorContainer}>
              <Icon name="newspaper-variant" size={32} color="#E53E3E" />
              <Text style={styles.errorText}>Unable to load articles</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={loadRSSArticles}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>        
      </ScrollView>
    </LinearGradient>
  );
};

// Wellness Tab Component - Show wellness content or login prompt
const ActivityTab = ({ navigation }: any) => {
  return <ActivityScreen navigation={navigation} />;
};

// Health Tab Component
const DoctorTab = ({ navigation }: any) => {
  const { isAuthenticated } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors data from API
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get consultation doctors (doctors available for online consultation)
      const response = await api.getConsultationDoctors();
      
      if (response.success && response.data) {
        // Transform the data to match the UI format
        const transformedDoctors = response.data.map((doctor: any, index: number) => {
          // Generate avatar emoji based on doctor name or use default
          const avatar = doctor.name?.includes('Sarah') || doctor.name?.includes('Lisa') || doctor.name?.includes('Maya') ? "👩‍⚕️" : "👨‍⚕️";
          
          // Generate status based on consultation schedule or random
          const now = new Date();
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayOfWeek = dayNames[now.getDay()];
          const schedule = doctor.consultation_schedule?.[dayOfWeek];
          let status = "offline";
          
          if (schedule?.available) {
            const currentHour = now.getHours();
            const availableHours = schedule.hours || [];
            const isAvailableNow = availableHours.some((hour: string) => {
              const hourNum = parseInt(hour.split(':')[0]);
              return Math.abs(currentHour - hourNum) <= 1; // Available if within 1 hour
            });
            status = isAvailableNow ? "online" : "busy";
          }
          
          // Generate color based on specialization
          const colors = ["#E22345", "#38A169", "#3182CE", "#9F7AEA", "#ED8936", "#06B6D4"];
          const color = colors[index % colors.length];
          const bgColor = color + "20";
          
          return {
            id: (doctor.id || 0).toString(),
            name: doctor.name,
            specialty: doctor.specialization,
            experience: `${doctor.experience_years || 5} tahun`,
            rating: parseFloat(doctor.rating) || 4.5,
            reviews: doctor.total_reviews || 0,
            avatar: avatar,
            status: status,
            hospital: "RS PHC", // Default hospital name
            price: `Rp ${(doctor.price_per_consultation || 150000).toLocaleString()}`,
            color: color,
            bgColor: bgColor,
            // Add original data for detail screen
            originalData: doctor
          };
        });
        
        setDoctors(transformedDoctors);
      } else {
        setError("Failed to fetch doctors data");
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load doctors data on component mount
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const renderDoctor = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.doctorCard}
             onPress={() => {
         if (isAuthenticated) {
           navigation.navigate("DetailDoctor", { doctor: item });
         } else {
           navigation.navigate("Login");
         }
       }}
    >
      <View style={styles.doctorCardHeader}>
        <View style={styles.doctorAvatarContainer}>
          <View style={[styles.doctorAvatar, { backgroundColor: item.bgColor }]}>
            <Text style={styles.doctorAvatarText}>{item.avatar}</Text>
          </View>
          <View style={[styles.doctorStatus, { 
            backgroundColor: item.status === 'online' ? '#10B981' : 
                           item.status === 'busy' ? '#F59E0B' : '#6B7280' 
          }]} />
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
          <Text style={styles.doctorHospital}>{item.hospital}</Text>
          <View style={styles.doctorRating}>
            <Icon name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews} ulasan)</Text>
          </View>
        </View>
        <View style={styles.doctorPrice}>
          <Text style={styles.priceText}>{item.price}</Text>
          <Text style={styles.experienceText}>{item.experience}</Text>
        </View>
      </View>
      <View style={styles.doctorCardFooter}>
        <View style={styles.consultationInfo}>
          <Icon name="video" size={16} color="#3182CE" />
          <Text style={styles.consultationText}>Video Call</Text>
        </View>
        <View style={styles.consultationInfo}>
          <Icon name="message-text" size={16} color="#38A169" />
          <Text style={styles.consultationText}>Chat</Text>
        </View>
        <View style={styles.wellnessDataShare}>
          <Icon name="share-variant" size={16} color="#E53E3E" />
          <Text style={styles.shareText}>Share Data Wellness</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#FAFBFC", "#F7FAFC"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Icon name="doctor" size={28} color="#E53E3E" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.greetingText}>Konsultasi Dokter</Text>
              <Text style={styles.subtitleText}>
                {isAuthenticated ? "Konsultasi wellness program Anda" : "Login untuk konsultasi dokter"}
              </Text>
            </View>
          </View>
        </View>

        {/* Login Prompt for Non-Authenticated Users */}
        {!isAuthenticated && (
          <TouchableOpacity 
            style={styles.welcomeCard}
            onPress={() => navigation.navigate("Login")}
          >
            <LinearGradient
              colors={["#3182CE", "#2B6CB0"]}
              style={styles.welcomeCardGradient}
            >
              <View style={styles.welcomeCardContent}>
                <View style={styles.welcomeCardLeft}>
                  <View style={styles.welcomeIconContainer}>
                    <Icon name="stethoscope" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.welcomeTextContainer}>
                    <Text style={styles.welcomeCardTitle}>Konsultasi dengan Dokter</Text>
                    <Text style={styles.welcomeCardSubtitle}>
                      Login untuk berkonsultasi dan berbagi data wellness program
                    </Text>
                  </View>
                </View>
                <View style={styles.welcomeCardRight}>
                  <Icon name="arrow-right" size={24} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Wellness Data Share Info - Only for authenticated users */}
        {isAuthenticated && (
          <View style={styles.wellnessShareInfo}>
            <View style={styles.shareInfoCard}>
              <Icon name="share-variant" size={24} color="#E53E3E" />
              <View style={styles.shareInfoText}>
                <Text style={styles.shareInfoTitle}>Bagikan Data Wellness</Text>
                <Text style={styles.shareInfoSubtitle}>
                  Data mission, progress, dan kesehatan Anda dapat dibagikan ke dokter untuk analisis yang lebih baik
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Doctors List */}
        <View style={styles.doctorsContainer}>
          <Text style={styles.sectionTitle}>Dokter Tersedia</Text>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Memuat data dokter...</Text>
            </View>
          )}
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!loading && !error && doctors.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada dokter tersedia saat ini</Text>
            </View>
          )}
          
          {!loading && !error && doctors.length > 0 && doctors.map((doctor) => (
            <View key={doctor.id}>
              {renderDoctor({ item: doctor })}
            </View>
          ))}
        </View>

        {/* Specialties for Non-Authenticated Users */}
        {!isAuthenticated && (
          <View style={styles.missionSectionContainer}>
            <Text style={styles.wellnessSectionTitle}>Spesialisasi Dokter</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Icon name="heart-pulse" size={20} color="#E53E3E" />
                <Text style={styles.benefitText}>Dokter Spesialis Kedokteran Olahraga</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="food-apple" size={20} color="#38A169" />
                <Text style={styles.benefitText}>Dokter Spesialis Gizi Klinik</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="brain" size={20} color="#3182CE" />
                <Text style={styles.benefitText}>Dokter Spesialis Kesehatan Jiwa</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="hospital" size={20} color="#9F7AEA" />
                <Text style={styles.benefitText}>Dokter Spesialis Penyakit Dalam</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

// Daily Mission Tab Component (Empty component for the center button)
const DailyMissionTab = ({ navigation }: any) => {
  useEffect(() => {
    navigation.navigate("WellnessApp");
  }, [navigation]);
  
  return <View style={{ flex: 1 }} />;
};

// Consultation Tab Component
const ConsultationTab = ({ navigation }: any) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <LinearGradient colors={["#FAFBFC", "#F7FAFC"]} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
        <View style={styles.authPrompt}>
          <Icon name="calendar-account" size={64} color="#E22345" />
          <Text style={styles.authPromptTitle}>Konsultasi dengan Dokter</Text>
          <Text style={styles.authPromptSubtitle}>
            Login untuk melihat riwayat konsultasi dan booking konsultasi baru dengan dokter
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return <ConsultationHistoryScreen navigation={navigation} />;
};



// Main Screen with Tabs
const MainScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = "home";

            if (route.name === "HOME") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "ACTIVITY") {
              iconName = focused ? "run" : "run";
            } else if (route.name === "HEALTH") {
              iconName = focused ? "doctor" : "stethoscope";
            } else if (route.name === "CONSULTATION") {
              iconName = focused ? "calendar-account" : "calendar-account-outline";
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#E22345",
          tabBarInactiveTintColor: "#6B7280",
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
            elevation: 0,
            shadowOpacity: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="HOME"
          component={HomeTab}
          options={{ tabBarLabel: t("nav.home") }}
        />
        <Tab.Screen
          name="ACTIVITY"
          component={ActivityTab}
          options={{ tabBarLabel: t("nav.wellness") }}
        />
        <Tab.Screen
          name="DAILY_MISSION"
          component={DailyMissionTab}
          options={{
            tabBarLabel: "",
            tabBarButton: (props) => {
              const { isAuthenticated } = useAuth();
              return (
                <View style={styles.dailyMissionButton}>
                  <TouchableOpacity
                    onPress={() => {
                      if (isAuthenticated) {
                        try {
                          navigation.navigate("WellnessApp");
                        } catch (error) {
                          console.warn("WellnessApp screen not found, navigating to Login instead");
                          navigation.navigate("Login");
                        }
                      } else {
                        navigation.navigate("Login");
                      }
                    }}
                    style={styles.dailyMissionGradient}
                  >
                    <Icon name="heart-pulse" size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              );
            },
          }}
        />
        <Tab.Screen
          name="HEALTH"
          component={DoctorTab}
          options={{ tabBarLabel: t("nav.clinics") }}
        />
        <Tab.Screen
          name="CONSULTATION"
          component={ConsultationTab}
          options={{ tabBarLabel: t("nav.news") }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 90,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  // Removed summaryCard styling to avoid conflicts with TodaySummaryCard
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
  // Removed metrics styling to avoid conflicts with TodaySummaryCard
  // Removed wellness score styling to avoid conflicts with TodaySummaryCard
  // Removed unused styling to avoid conflicts with TodaySummaryCard
  metricCardCompact: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  metricValueCompact: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  metricUnitCompact: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  progressSection: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  wellnessScoreValueCompact: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3B82F6",
    letterSpacing: -0.5,
  },
  wellnessScoreLabelCompact: {
    fontSize: 9,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 2,
  },
  moreDetailsContainerCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  moreDetailsTextCompact: {
    fontSize: 12,
    color: "#E22345",
    fontWeight: "600",
    marginRight: 4,
  },
  // Wellness Card Styles
  wellnessCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  wellnessCardGradient: {
    padding: 20,
  },
  wellnessCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wellnessCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  wellnessIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  wellnessTextContainer: {
    flex: 1,
  },
  wellnessCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  wellnessCardSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  wellnessCardRight: {
    alignItems: "center",
  },
  wellnessBadge: {
    backgroundColor: "#38A169",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  wellnessBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Clinics Card Styles
  clinicsCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#3182CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  clinicsCardGradient: {
    padding: 20,
  },
  clinicsCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clinicsCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  clinicsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  clinicsTextContainer: {
    flex: 1,
  },
  clinicsCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  clinicsCardSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  clinicsCardRight: {
    alignItems: "center",
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
    height: 300, // Fixed height to match card height + padding
  },
  featuredSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  featuredHeaderLeft: {
    flex: 1,
  },
  featuredHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  featuredSectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  featuredSectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    lineHeight: 18,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  articlesLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  articlesErrorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
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
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -35,
    shadowColor: "#E22345",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 999,
  },
  dailyMissionGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Wellness Tab Styles
  wellnessGradient: {
    padding: 24,
  },
  wellnessContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  wellnessLeft: {
    flex: 1,
    marginRight: 20,
  },
  wellnessTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    lineHeight: 28,
  },
  wellnessDescription: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 16,
  },
  wellnessButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  wellnessButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  wellnessRight: {
    justifyContent: "center",
    alignItems: "center",
  },
  wellnessSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  featureItem: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 8,
    textAlign: "center",
  },
  // Additional styles
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  // Modern metric styles
  metricCardModern: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricIconContainerModern: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metricValueModern: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  metricUnitModern: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  progressSectionModern: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  progressRingContainer: {
    marginRight: 20,
  },
  progressContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  wellnessScoreValueModern: {
    fontSize: 28,
    fontWeight: "900",
    color: "#E53E3E",
    letterSpacing: -1,
  },
  wellnessScoreLabelModern: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    marginTop: 2,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  progressSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 12,
    lineHeight: 20,
  },
  progressActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  progressActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E53E3E",
    marginRight: 6,
  },
  welcomeCard: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeCardGradient: {
    padding: 20,
  },
  welcomeCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  welcomeCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  welcomeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  welcomeCardSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  welcomeCardRight: {
    alignItems: "center",
  },
  // Welcome message styles
  welcomeMessageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  welcomeMessageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeMessageText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  // Benefits list styles
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  benefitText: {
    fontSize: 14,
    color: "#1F2937",
    marginLeft: 12,
    fontWeight: "500",
  },
  bellButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  doctorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  doctorAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  doctorAvatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  doctorStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 4,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  doctorHospital: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  doctorRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
  doctorPrice: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E53E3E",
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  doctorCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  consultationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  consultationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3182CE",
    marginLeft: 4,
  },
  wellnessDataShare: {
    flexDirection: "row",
    alignItems: "center",
  },
  shareText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E53E3E",
    marginLeft: 4,
  },
  wellnessShareInfo: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  shareInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  shareInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  shareInfoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  shareInfoSubtitle: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  doctorsContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  authPromptSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#E22345',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#E22345',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default MainScreen;
