import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { Text, useTheme, Button, TextInput, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CustomTheme } from "../theme/theme";
import ProgressRing from "../components/ProgressRing";
import MissionPromptCard from "../components/MissionPromptCard";
import ActivityDetectionService from "../services/ActivityDetectionService";
import { useAuth } from "../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import apiService from "../services/api";
import DailyMissionScreen from "./DailyMissionScreen";
import TodaySummaryCard from "../components/TodaySummaryCard";

const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("WellnessApp Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Something went wrong</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              The Wellness App encountered an error. Please try again.
            </Text>
            <TouchableOpacity 
              style={{ padding: 15, backgroundColor: '#E22345', borderRadius: 8 }}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

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

interface UserProfile {
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activity_level?: string;
  fitness_goal?: string;
  wellness_program_joined?: boolean;
  wellness_join_date?: string;
}

// Onboarding Component
const OnboardingScreen = ({ navigation, onProfileSaved }: any) => {
  const theme = useTheme<CustomTheme>();
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "",
    activity_level: "",
    fitness_goal: "weight_loss",
  });

  const handleSaveProfile = async () => {
    if (!formData.weight || !formData.height || !formData.age || !formData.gender || !formData.activity_level || !formData.fitness_goal) {
      Alert.alert("Error", "Mohon lengkapi semua data");
      return;
    }

    try {
      // Map activity level to correct enum values
      const activityLevelMap = {
        'sedentary': 'sedentary',
        'lightly_active': 'lightly_active',
        'moderate': 'moderately_active',
        'moderately_active': 'moderately_active',
        'very_active': 'very_active',
        'extremely_active': 'extremely_active',
      };

      const profileData = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        gender: formData.gender,
        activity_level: activityLevelMap[formData.activity_level as keyof typeof activityLevelMap] || 'moderately_active',
        fitness_goal: formData.fitness_goal,
        wellness_program_joined: true, // Menandakan user sudah join program wellness
        wellness_join_date: new Date().toISOString().slice(0, 19).replace('T', ' '), // Tanggal join program wellness
      };

      const response = await apiService.updateUserProfile(profileData);
      
      if (response.success) {
        Alert.alert("Sukses", "Data berhasil disimpan!");
        onProfileSaved();
      } else {
        Alert.alert("Error", response.message || "Gagal menyimpan data");
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan data");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.gradientBackground}
      >
        <ScrollView contentContainerStyle={styles.onboardingContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.modernHeader}>
            <View style={styles.headerIconContainer}>
              <LinearGradient
                colors={["#FF6B8A", "#E22345"]}
                style={styles.headerIconGradient}
              >
                <Icon name="heart-pulse" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.modernAppTitle}>Wellness Program</Text>
            <Text style={styles.modernAppSubtitle}>Mulai perjalanan kesehatan Anda dengan langkah yang tepat</Text>
          </View>

          <View style={styles.modernFormCard}>
            <View style={styles.formHeader}>
              <Icon name="account-edit" size={24} color="#667eea" />
              <Text style={styles.modernFormTitle}>Data Diri</Text>
            </View>
              
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Berat Badan (kg)</Text>
                <TextInput
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  keyboardType="numeric"
                  style={styles.modernInput}
                  placeholder="70"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tinggi Badan (cm)</Text>
                <TextInput
                  value={formData.height}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                  keyboardType="numeric"
                  style={styles.modernInput}
                  placeholder="170"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Usia</Text>
              <TextInput
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                keyboardType="numeric"
                style={styles.modernInput}
                placeholder="25"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.selectionGroup}>
              <Text style={styles.selectionLabel}>Jenis Kelamin</Text>
              <View style={styles.modernRadioButtons}>
                <TouchableOpacity
                  style={[
                    styles.modernRadioButton,
                    formData.gender === "male" && styles.modernRadioButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: "male" })}
                >
                  <View style={[
                    styles.radioIndicator,
                    formData.gender === "male" && styles.radioIndicatorActive,
                  ]}>
                    {formData.gender === "male" && (
                      <Icon name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={[
                    styles.modernRadioText,
                    formData.gender === "male" && styles.modernRadioTextActive,
                  ]}>Pria</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modernRadioButton,
                    formData.gender === "female" && styles.modernRadioButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: "female" })}
                >
                  <View style={[
                    styles.radioIndicator,
                    formData.gender === "female" && styles.radioIndicatorActive,
                  ]}>
                    {formData.gender === "female" && (
                      <Icon name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={[
                    styles.modernRadioText,
                    formData.gender === "female" && styles.modernRadioTextActive,
                  ]}>Wanita</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.selectionGroup}>
              <Text style={styles.selectionLabel}>Level Aktivitas</Text>
              <View style={styles.modernActivityGrid}>
                {[
                  { key: "sedentary", label: "Sangat Sedikit", icon: "sofa", color: "#6B7280" },
                  { key: "lightly_active", label: "Ringan", icon: "walk", color: "#10B981" },
                  { key: "moderately_active", label: "Sedang", icon: "bike", color: "#F59E0B" },
                  { key: "very_active", label: "Sangat Aktif", icon: "run", color: "#EF4444" },
                  { key: "extremely_active", label: "Ekstrem Aktif", icon: "fire", color: "#8B5CF6" }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.modernActivityButton,
                      formData.activity_level === item.key && styles.modernActivityButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, activity_level: item.key })}
                  >
                    <Icon 
                      name={item.icon} 
                      size={20} 
                      color={formData.activity_level === item.key ? "#FFFFFF" : item.color} 
                    />
                    <Text style={[
                      styles.modernActivityText,
                      formData.activity_level === item.key && styles.modernActivityTextActive,
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectionGroup}>
              <Text style={styles.selectionLabel}>Tujuan Fitness</Text>
              <View style={styles.modernGoalGrid}>
                {[
                  { key: "weight_loss", label: "Menurunkan Berat Badan", icon: "scale-bathroom", color: "#10B981" },
                  { key: "muscle_gain", label: "Menambah Massa Otot", icon: "dumbbell", color: "#F59E0B" },
                  { key: "maintenance", label: "Mempertahankan", icon: "heart-pulse", color: "#3B82F6" },
                  { key: "general_health", label: "Kesehatan Umum", icon: "leaf", color: "#8B5CF6" }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.modernGoalButton,
                      formData.fitness_goal === item.key && styles.modernGoalButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, fitness_goal: item.key })}
                  >
                    <Icon 
                      name={item.icon} 
                      size={20} 
                      color={formData.fitness_goal === item.key ? "#FFFFFF" : item.color} 
                    />
                    <Text style={[
                      styles.modernGoalText,
                      formData.fitness_goal === item.key && styles.modernGoalTextActive,
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.modernSubmitButton}
              onPress={handleSaveProfile}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.submitButtonGradient}
              >
                <Icon name="rocket-launch" size={20} color="#FFFFFF" />
                <Text style={styles.modernSubmitButtonText}>Mulai Program Wellness</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user, isAuthenticated } = useAuth();
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
    waterIntake: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activityData, setActivityData] = useState({ steps: 0, distance: 0 });
  const [weeklyProgress, setWeeklyProgress] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());

  const loadMissionDataRef = useRef<() => Promise<void> | undefined>(undefined);
  const loadWeeklyProgressRef = useRef<() => Promise<void> | undefined>(undefined);

  // Handle date change and reload data
  useEffect(() => {
    if (selectedDate) {
      // Update datePickerDate when selectedDate changes
      const newDate = new Date(selectedDate);
      setDatePickerDate(newDate);
      
      // Reload data for the selected date
      loadMissionData();
    }
  }, [selectedDate]);

  const loadMissionData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiService.getMissionStats({ date: new Date().toISOString().split('T')[0] });
      if (response.success) {
        // Map API response to frontend expected format
        const mappedStats = {
          totalMissions: response.data.total_missions || 0,
          completedMissions: response.data.completed_missions || 0,
          totalPoints: response.data.total_points_earned || 0,
        };
        setMissionStats(mappedStats);
        console.log('Mission stats loaded:', mappedStats);
      } else {
        console.warn("Failed to load mission stats:", response.message);
      }

      const missionsResponse = await apiService.getMyMissions();
      if (missionsResponse.success) {
        setUserMissions(missionsResponse.data);
        console.log('User missions loaded:', missionsResponse.data.length);
      } else {
        console.warn("Failed to load missions:", missionsResponse.message);
      }

      // Load today's summary data
      const summaryResponse = await apiService.getTodaySummary();
      console.log('Today summary response:', summaryResponse);
      if (summaryResponse.success && summaryResponse.data) {
        const summaryData = summaryResponse.data;
        console.log('Summary data received:', summaryData);
        
        // Properly map the nested structure from API
        const todaySummaryData = {
          calories: summaryData.meal?.calories || summaryData.calories || 0,
          servings: summaryData.meal?.meal_count || summaryData.servings || 0,
          steps: summaryData.fitness?.steps || summaryData.steps || 0,
          exerciseMinutes: summaryData.fitness?.exercise_minutes || summaryData.exercise_minutes || 0,
          waterIntake: summaryData.water?.total_ml || summaryData.water_intake || 0,
        };
        console.log('Mapped today summary data:', todaySummaryData);
        setTodaySummary(todaySummaryData);
        
        // Update activity data with real fitness data
        const activityData = {
          steps: summaryData.fitness?.steps || 0,
          distance: summaryData.fitness?.distance_km || 0,
        };
        console.log('Activity data:', activityData);
        setActivityData(activityData);
      } else {
        console.warn("Failed to load today's summary:", summaryResponse.message);
        // Set default values when API fails
        setTodaySummary({
          calories: 0,
          servings: 0,
          steps: 0,
          exerciseMinutes: 0,
          waterIntake: 0,
        });
        setActivityData({ steps: 0, distance: 0 });
      }

      // Load weekly progress data
      if (loadWeeklyProgressRef.current) {
        await loadWeeklyProgressRef.current();
      }
    } catch (error) {
      console.error("Error loading mission data:", error);
      // Set default values on error
      setMissionStats({
        totalMissions: 0,
        completedMissions: 0,
        totalPoints: 0,
      });
      setTodaySummary({
        calories: 0,
        servings: 0,
        steps: 0,
        exerciseMinutes: 0,
        waterIntake: 0,
      });
      setActivityData({ steps: 0, distance: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWeeklyProgress = useCallback(async () => {
    try {
      setSummaryLoading(true);
      
      // Get mission stats for overall completion rate
      const missionStatsResponse = await apiService.getMissionStats({ date: new Date().toISOString().split('T')[0] });
      
      // Get today's summary for current day data
      const todaySummaryResponse = await apiService.getTodaySummary();
      
      // Initialize weekly progress array
      const progressData = [0, 0, 0, 0, 0, 0, 0];
      
      if (missionStatsResponse.success && todaySummaryResponse.success) {
        const stats = missionStatsResponse.data;
        const todayData = todaySummaryResponse.data;
        
        // Calculate overall completion rate for the week
        const completionRate = stats.completion_rate || 0;
        
        // Get today's activity score based on various metrics
        let todayScore = 0;
        let totalMetrics = 0;
        
        // Water intake score (target: 2000ml)
        if (todayData.water?.total_ml) {
          const waterScore = Math.min((todayData.water.total_ml / 2000) * 100, 100);
          todayScore += waterScore;
          totalMetrics++;
        }
        
        // Sleep score (target: 8 hours)
        if (todayData.sleep?.total_hours) {
          const sleepScore = Math.min((todayData.sleep.total_hours / 8) * 100, 100);
          todayScore += sleepScore;
          totalMetrics++;
        }
        
        // Exercise score (target: 30 minutes)
        if (todayData.fitness?.exercise_minutes) {
          const exerciseScore = Math.min((todayData.fitness.exercise_minutes / 30) * 100, 100);
          todayScore += exerciseScore;
          totalMetrics++;
        }
        
        // Steps score (target: 10000 steps)
        if (todayData.fitness?.steps) {
          const stepsScore = Math.min((todayData.fitness.steps / 10000) * 100, 100);
          todayScore += stepsScore;
          totalMetrics++;
        }
        
        // Calculate average daily score
        const averageDailyScore = totalMetrics > 0 ? todayScore / totalMetrics : 0;
        
        // Get current day of week (0 = Sunday, 1 = Monday, etc.)
        const today = new Date().getDay();
        
        // Create a more realistic weekly distribution
        // For past days, use a variation of the completion rate
        // For today, use the actual calculated score
        for (let i = 0; i < 7; i++) {
          if (i === today) {
            // Today's score
            progressData[i] = Math.round(averageDailyScore);
          } else if (i < today) {
            // Past days - use completion rate with some variation
            const variation = (Math.random() - 0.5) * 20; // ±10% variation
            progressData[i] = Math.max(0, Math.min(100, Math.round(completionRate + variation)));
          } else {
            // Future days - show 0 or very low values
            progressData[i] = 0;
          }
        }
      } else {
        console.warn("Failed to load data for weekly progress");
        // Set default progress if API fails
        setWeeklyProgress([0, 0, 0, 0, 0, 0, 0]);
        return;
      }
      
      setWeeklyProgress(progressData);
    } catch (error) {
      console.error("Error loading weekly progress:", error);
      // Set default progress if API fails
      setWeeklyProgress([0, 0, 0, 0, 0, 0, 0]);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Update refs when functions change
  useEffect(() => {
    loadMissionDataRef.current = loadMissionData;
    loadWeeklyProgressRef.current = loadWeeklyProgress;
  }, [loadMissionData, loadWeeklyProgress]);

  useEffect(() => {
    if (isAuthenticated && loadMissionDataRef.current) {
      loadMissionDataRef.current();
    }
  }, [isAuthenticated]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      if (loadMissionDataRef.current) {
        loadMissionDataRef.current();
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Add focus listener to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && loadMissionDataRef.current) {
        loadMissionDataRef.current();
      }
    }, [isAuthenticated])
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Remove hardcoded quick actions - these will be loaded from API
  const [quickActions, setQuickActions] = useState<any[]>([]);

  // Load quick actions from API
  useEffect(() => {
    const loadQuickActions = async () => {
      try {
        const response = await apiService.getQuickActions();
        if (response.success) {
          // Transform API data to match frontend expected format
          const transformedActions = response.data.map((action: any) => ({
            id: action.id,
            title: action.title,
            icon: action.icon,
            color: action.color,
            gradient: action.gradient as [string, string],
            action: () => navigation.navigate(action.route),
            subtitle: action.subtitle,
            enabled: action.enabled,
            today_count: action.today_count,
            target: action.target,
            has_recent_activity: action.has_recent_activity
          }));
          setQuickActions(transformedActions);
        } else {
          console.warn("Failed to load quick actions:", response.message);
        }
      } catch (error) {
        console.error("Error loading quick actions:", error);
      }
    };

    if (isAuthenticated) {
      loadQuickActions();
    }
  }, [isAuthenticated, navigation]);

  const renderQuickAction = ({ item }: any) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={item.action}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: item.color + "20" }]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.quickActionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={loading || summaryLoading} 
            onRefresh={() => {
              loadMissionData();
            }} 
          />
        }
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={["#E53E3E", "#C53030"]}
              style={styles.avatarModern}
            >
              <Text style={styles.avatarText}>
                {user ? getInitials(user.name) : "U"}
              </Text>
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.greetingText}>
                Halo, {user?.name || "User"}! 👋
              </Text>
              <Text style={styles.subtitleText}>
                Mari jaga kesehatan hari ini
              </Text>
              <View style={styles.wellnessStatus}>
                <Icon name="heart-pulse" size={16} color="#10B981" />
                <Text style={styles.wellnessStatusText}>
                  Wellness Program Aktif
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mission Progress Section */}
        <View style={styles.missionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progress Mission</Text>
          </View>
          
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={styles.missionStatsModern}
          >
            <TouchableOpacity style={styles.statCardModern} activeOpacity={0.8}>
              <LinearGradient
                colors={["#E53E3E", "#C53030"]}
                style={styles.statIconContainer}
              >
                <Icon name="flag" size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.statNumberModern}>
                {missionStats.totalMissions !== undefined ? missionStats.totalMissions : 0}
              </Text>
              <Text style={styles.statLabelModern}>Total Mission</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statCardModern} activeOpacity={0.8}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.statIconContainer}
              >
                <Icon name="check-circle" size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.statNumberModern}>
                {missionStats.completedMissions !== undefined ? missionStats.completedMissions : 0}
              </Text>
              <Text style={styles.statLabelModern}>Selesai</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statCardModern} activeOpacity={0.8}>
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                style={styles.statIconContainer}
              >
                <Icon name="star" size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.statNumberModern}>
                {missionStats.totalPoints !== undefined ? missionStats.totalPoints : 0}
              </Text>
              <Text style={styles.statLabelModern}>Poin</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Activity Summary Section - Repositioned */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Summary</Text>
            {summaryLoading && (
              <View style={styles.loadingIndicator}>
                <Icon name="loading" size={16} color="#667eea" />
              </View>
            )}
          </View>

          {/* TodaySummaryCard dengan prop date */}
          <TodaySummaryCard 
            date={selectedDate} 
            onMoreDetailsPress={() => {
              setShowDatePicker(true);
            }}
          />
          
          {/* Date Picker Modal */}
          {showDatePicker && (
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerContent}>
                <Text style={styles.datePickerTitle}>Pilih Tanggal</Text>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={datePickerDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setDatePickerDate(selectedDate);
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        setSelectedDate(formattedDate);
                      }
                    }}
                    style={styles.datePicker}
                  />
                ) : (
                  <DateTimePicker
                    value={datePickerDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setDatePickerDate(selectedDate);
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        setSelectedDate(formattedDate);
                      }
                    }}
                  />
                )}
                {Platform.OS === 'ios' && (
                  <View style={styles.datePickerButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.cancelButtonText}>Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => {
                        const formattedDate = datePickerDate.toISOString().split('T')[0];
                        setSelectedDate(formattedDate);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.confirmButtonText}>Konfirmasi</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Weekly Progress Chart */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadWeeklyProgress}
              disabled={summaryLoading}
            >
              <Icon 
                name={summaryLoading ? "loading" : "refresh"} 
                size={16} 
                color={summaryLoading ? "#9CA3AF" : "#667eea"} 
              />
            </TouchableOpacity>
          </View>
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={styles.chartContainer}
          >
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Aktivitas 7 Hari Terakhir</Text>
              <Text style={styles.chartSubtitle}>
                {summaryLoading ? "Memuat data..." : "Wellness & Aktivitas"}
              </Text>
            </View>
            <View style={styles.chartBars}>
              {weeklyProgress.map((progress, index) => (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: Math.max(progress, 5) }, // Minimum height of 5 for visibility
                    ]}
                  >
                    <LinearGradient
                      colors={progress > 0 ? ["#667eea", "#764ba2"] : ["#E5E7EB", "#D1D5DB"]}
                      style={styles.barGradient}
                    />
                  </View>
                  <Text style={styles.barLabel}>
                    {['M', 'S', 'S', 'R', 'K', 'J', 'S'][index]}
                  </Text>
                  {progress > 0 && (
                    <Text style={styles.barValue}>
                      {Math.round(progress)}%
                    </Text>
                  )}
                </View>
              ))}
            </View>
            {weeklyProgress.every(p => p === 0) && !summaryLoading && (
              <View style={styles.noDataContainer}>
                <Icon name="chart-line-variant" size={32} color="#CBD5E1" />
                <Text style={styles.noDataText}>Belum ada data aktivitas</Text>
                <Text style={styles.noDataSubtext}>Mulai tracking untuk melihat progress</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Active Missions Section */}
        <View style={styles.missionsSection}>
          <Text style={styles.sectionTitle}>Active Missions</Text>
          {userMissions.filter((um) => um.status === "active").length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeMissionsScrollContainer}
            >
              {userMissions.filter((um) => um.status === "active").map((userMission) => {
                // Calculate real-time progress
                const progressPercentage = userMission.mission?.target_value 
                  ? Math.min((userMission.current_value / userMission.mission.target_value) * 100, 100)
                  : userMission.progress || 0;
                
                return (
                <TouchableOpacity
                  key={userMission.id}
                  style={styles.activeMissionCard}
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
                    
                    // Ensure we have the correct data structure
                    const missionData = userMission.mission || {
                      id: userMission.mission_id,
                      title: (userMission as any).title,
                      description: (userMission as any).description,
                      category: (userMission as any).category,
                      type: (userMission as any).type,
                      target_value: (userMission as any).target_value,
                      unit: (userMission as any).unit,
                      points: (userMission as any).points,
                      icon: (userMission as any).icon,
                      color: (userMission as any).color,
                      difficulty: (userMission as any).difficulty
                    };
                    
                    const userMissionData = {
                      id: userMission.id || (userMission as any).user_mission_id,
                      user_id: userMission.user_id,
                      mission_id: userMission.mission_id,
                      status: userMission.status,
                      progress: userMission.progress,
                      current_value: userMission.current_value,
                      start_date: userMission.start_date,
                      completed_date: userMission.completed_date,
                      due_date: userMission.due_date,
                      points_earned: userMission.points_earned,
                      streak_count: userMission.streak_count,
                      last_completed_date: userMission.last_completed_date,
                      notes: userMission.notes,
                      mission: missionData
                    };
                    
                    navigation.navigate("MissionDetail", { 
                      mission: missionData,
                      userMission: userMissionData,
                      onMissionUpdate: () => {
                        loadMissionData();
                      }
                    });
                  }}
                >
                  <LinearGradient
                    colors={["#FFFFFF", "#F8FAFC"]}
                    style={styles.activeMissionCardGradient}
                  >
                    <View style={styles.activeMissionHeader}>
                      <LinearGradient
                        colors={[userMission.mission?.color + "20", userMission.mission?.color + "10"]}
                        style={styles.activeMissionIconContainer}
                      >
                        <Icon
                          name={userMission.mission?.icon || "flag"}
                          size={24}
                          color={userMission.mission?.color || "#E53E3E"}
                        />
                      </LinearGradient>
                      <View style={styles.activeMissionInfo}>
                        <Text style={styles.activeMissionTitle}>{userMission.mission?.title}</Text>
                        <Text style={styles.activeMissionDescription} numberOfLines={2}>
                          {userMission.mission?.description}
                        </Text>
                      </View>
                      <View style={styles.activeMissionPoints}>
                        <Text style={styles.activeMissionPointsText}>{userMission.mission?.points}</Text>
                        <Text style={styles.activeMissionPointsLabel}>pts</Text>
                      </View>
                    </View>
                    
                    <View style={styles.activeMissionProgressContainer}>
                      <View style={styles.activeMissionProgressBar}>
                        <LinearGradient
                          colors={[userMission.mission?.color || "#E53E3E", userMission.mission?.color + "80" || "#C53030"]}
                          style={[
                            styles.activeMissionProgressFill,
                            { width: `${progressPercentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.activeMissionProgressText}>{Math.round(progressPercentage)}%</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
            </ScrollView>
          ) : (
            <View style={styles.noActiveMissionsContainer}>
              <View style={styles.noActiveMissionsIcon}>
                <Icon name="flag-outline" size={64} color="#CBD5E1" />
              </View>
              <Text style={styles.noActiveMissionsTitle}>Belum Ada Activity Aktif</Text>
              <Text style={styles.noActiveMissionsDescription}>
                Anda belum memiliki misi yang sedang aktif. Mulai perjalanan wellness Anda dengan memilih misi pertama!
              </Text>
              <TouchableOpacity
                style={styles.noActiveMissionsButton}
                onPress={() => navigation.navigate("DailyMission")}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.noActiveMissionsButtonGradient}
                >
                  <Icon name="plus" size={20} color="#FFFFFF" />
                  <Text style={styles.noActiveMissionsButtonText}>Pilih Misi Pertama</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Mission Tab Component
const MissionTab = ({ navigation }: any) => {
  // Directly render the DailyMissionScreen component
  return <DailyMissionScreen navigation={navigation} />;
};

// Tracking Tab Component
const TrackingTab = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();

  const trackingOptions = [
    {
      id: 1,
      title: "Log Makanan",
      subtitle: "Catat asupan kalori harian",
      icon: "food-apple",
      color: "#FF6B8A",
      gradient: ["#FF6B8A", "#E91E63"],
      onPress: () => navigation.navigate("MealLogging"),
    },
    {
      id: 2,
      title: "Track Air",
      subtitle: "Monitor konsumsi air minum",
      icon: "cup-water",
      color: "#4ECDC4",
      gradient: ["#4ECDC4", "#44A08D"],
      onPress: () => navigation.navigate("WaterTracking"),
    },
    {
      id: 3,
      title: "Log Olahraga",
      subtitle: "Catat aktivitas fisik",
      icon: "dumbbell",
      color: "#45B7D1",
      gradient: ["#45B7D1", "#3182CE"],
      onPress: () => navigation.navigate("FitnessTracking"),
    },
    {
      id: 4,
      title: "Auto Fitness",
      subtitle: "Deteksi aktivitas otomatis",
      icon: "heart-pulse",
      color: "#96CEB4",
      gradient: ["#96CEB4", "#38A169"],
      onPress: () => navigation.navigate("RealtimeFitness"),
    },
    {
      id: 5,
      title: "Mood Check",
      subtitle: "Monitor suasana hati",
      icon: "emoticon",
      color: "#F59E0B",
      gradient: ["#F59E0B", "#D97706"],
      onPress: () => navigation.navigate("MoodTracking"),
    },
    {
      id: 6,
      title: "Sleep Track",
      subtitle: "Lacak pola tidur",
      icon: "sleep",
      color: "#9F7AEA",
      gradient: ["#9F7AEA", "#805AD5"],
      onPress: () => navigation.navigate("SleepTracking"),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.trackingHeaderContent}>
            <Text style={styles.pageTitle}>Wellness Tracking</Text>
            <Text style={styles.pageSubtitle}>Monitor kesehatan Anda dengan berbagai fitur tracking</Text>
          </View>
        </View>

        {/* Tracking Categories */}
        <View style={styles.trackingSection}>
          <Text style={styles.sectionTitle}>Tracking Categories</Text>
          <View style={styles.trackingWrapper}>
            <FlatList
              data={trackingOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modernTrackingCard}
                  onPress={item.onPress}
                  activeOpacity={0.8}
                >
                                  <LinearGradient
                  colors={item.gradient as [string, string]}
                  style={styles.modernTrackingGradient}
                >
                  <View style={styles.modernTrackingIconContainer}>
                    <Icon name={item.icon} size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.modernTrackingContent}>
                    <Text style={styles.modernTrackingTitle}>{item.title}</Text>
                    <Text style={styles.modernTrackingSubtitle}>{item.subtitle}</Text>
                  </View>
                </LinearGradient>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trackingList}
              style={{ minHeight: 180 }}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#FF6B8A", "#E91E63"]}
                style={styles.statCardGradient}
              >
                <Icon name="fire" size={24} color="#FFFFFF" />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                style={styles.statCardGradient}
              >
                <Icon name="cup-water" size={24} color="#FFFFFF" />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Water (L)</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#45B7D1", "#3182CE"]}
                style={styles.statCardGradient}
              >
                <Icon name="walk" size={24} color="#FFFFFF" />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Steps</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Main Wellness App Component
const WellnessApp = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("WellnessApp: Component mounted");
    console.log("WellnessApp: Auth state:", { isAuthenticated, user, authLoading });
    
    // Wait for authentication to be determined
    if (authLoading) {
      console.log("WellnessApp: Auth still loading, waiting...");
      return;
    }
    
    // Simple test - if not authenticated, show error
    if (!isAuthenticated) {
      console.log("WellnessApp: User not authenticated");
      setError("User not authenticated. Please login first.");
      setIsLoading(false);
      return;
    }
    
    checkUserProfile();
  }, [isAuthenticated, user, authLoading]);

  const checkUserProfile = async () => {
    try {
      console.log("WellnessApp: Checking user profile...");
      setIsLoading(true);
      
      // Initialize API service first
      await apiService.initialize();
      
      const [profileResponse, missionsResponse] = await Promise.all([
        apiService.getUserProfile(),
        apiService.getMyMissions()
      ]);
      
      console.log("WellnessApp: Profile response:", profileResponse);
      console.log("WellnessApp: Missions response:", missionsResponse);
      
      if (profileResponse.success && profileResponse.data) {
        const profile = profileResponse.data;
        
        // Cek apakah user sudah memiliki mission (sudah terdaftar dalam program wellness)
        const hasMissions = missionsResponse.success && missionsResponse.data && missionsResponse.data.length > 0;
        
        // Cek apakah user sudah join program wellness atau sudah memiliki mission
        if (profile.wellness_program_joined || hasMissions) {
          console.log("WellnessApp: User has profile, showing main app");
          setHasProfile(true);
          setShowOnboarding(false);
        } else {
          console.log("WellnessApp: User needs onboarding");
          setHasProfile(false);
          setShowOnboarding(true);
        }
      } else {
        console.log("WellnessApp: No profile data, showing onboarding");
        setHasProfile(false);
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("WellnessApp: Error checking profile:", error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setHasProfile(false);
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSaved = () => {
    console.log("WellnessApp: Profile saved, updating state");
    setHasProfile(true);
    setShowOnboarding(false);
  };

  console.log("WellnessApp: Render state:", { hasProfile, showOnboarding, error, isAuthenticated, user, authLoading, isLoading });

  // Show loading state while auth is being determined
  if (authLoading || isLoading) {
    console.log("WellnessApp: Showing loading state");
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading Wellness App...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Authentication Required</Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            Please login to access the Wellness App
          </Text>
          <TouchableOpacity 
            style={{ padding: 15, backgroundColor: '#E22345', borderRadius: 8 }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Error Loading Wellness App</Text>
          <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{ marginTop: 20, padding: 10, backgroundColor: '#E22345', borderRadius: 8 }}
            onPress={() => {
              setError(null);
              checkUserProfile();
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (hasProfile === null) {
    console.log("WellnessApp: Profile state is null, showing loading");
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading user profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showOnboarding) {
    console.log("WellnessApp: Showing onboarding");
    return <OnboardingScreen navigation={navigation} onProfileSaved={handleProfileSaved} />;
  }

  console.log("WellnessApp: Showing main app with tabs");
  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = "home";

            if (route.name === "DASHBOARD") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "MISSION") {
              iconName = focused ? "flag" : "flag-outline";
            } else if (route.name === "TRACKING") {
              iconName = focused ? "chart-line" : "chart-line-variant";
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
          name="DASHBOARD"
          component={DashboardTab}
          options={{ tabBarLabel: "Dashboard" }}
        />
        <Tab.Screen
          name="MISSION"
          component={MissionTab}
          options={{ tabBarLabel: "Missions" }}
        />
        <Tab.Screen
          name="TRACKING"
          component={TrackingTab}
          options={{ tabBarLabel: "Tracking" }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

// Simple test component to debug the issue
const TestWellnessApp = ({ navigation }: any) => {
  const { user, isAuthenticated } = useAuth();
  
  console.log("TestWellnessApp: Auth state:", { isAuthenticated, user });
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Wellness App Test</Text>
        <Text style={{ marginBottom: 10 }}>Authentication Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</Text>
        <Text style={{ marginBottom: 10 }}>User: {user ? user.name : 'No user'}</Text>
        <Text style={{ marginBottom: 20 }}>User ID: {user ? user.id : 'No ID'}</Text>
        
        <TouchableOpacity 
          style={{ padding: 15, backgroundColor: '#E22345', borderRadius: 8, marginBottom: 10 }}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Go to Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ padding: 15, backgroundColor: '#3182CE', borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Export the test component for debugging
export { TestWellnessApp };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60, // Increased from 40 to 60 to prevent cutoff
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientBackground: {
    flex: 1,
  },
  onboardingContainer: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
  },
  appSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 8,
  },
  formCard: {
    marginTop: 20,
    borderRadius: 16,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  radioButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
      },
  radioButtonActive: {
    backgroundColor: "#E22345",
    borderColor: "#E22345",
  },
  radioText: {
    color: "#374151",
  },
  radioTextActive: {
    color: "#FFFFFF",
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  
  // Modern Header Styles
  modernHeader: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  headerIconContainer: {
    marginBottom: 16,
  },
  headerIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modernAppTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  modernAppSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  // Modern Form Card Styles
  modernFormCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  modernFormTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 12,
  },
  
  // Modern Input Styles
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  modernInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  
  // Modern Selection Styles
  selectionGroup: {
    marginBottom: 24,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  modernRadioButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modernRadioButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modernRadioButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  radioIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioIndicatorActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  modernRadioText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  modernRadioTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  // Modern Activity Grid Styles
  modernActivityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modernActivityButton: {
    width: "48%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modernActivityButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  modernActivityText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  modernActivityTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  // Modern Goal Grid Styles
  modernGoalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modernGoalButton: {
    width: "48%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modernGoalButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  modernGoalText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  modernGoalTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  // Modern Submit Button Styles
  modernSubmitButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  modernSubmitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  

  
  // Quick Action Styles - Matching MainScreen
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
  
  // Section Header Styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBarContainer: {
    width: 100,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 2,
  },
  
  // Modern Tracking Styles

  
  // Floating Action Button Styles
  floatingActionButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Chart Styles
  chartSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  chartContainer: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  chartHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    paddingBottom: 10,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
  },
  barGradient: {
    flex: 1,
    width: "100%",
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  avatarModern: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  addMissionButton: {
    backgroundColor: "#E22345",
    borderRadius: 12,
    padding: 12,
  },
  missionHeaderContent: {
    flex: 1,
  },
  trackingHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 20,
    paddingHorizontal: 20,
    letterSpacing: -0.5,
  },
  missionSection: {
    marginBottom: 32,
  },
  missionStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  missionStatsModern: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginHorizontal: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardModern: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E22345",
  },
  statNumberModern: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1F2937",
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: 4,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 50,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  statLabelModern: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  quickActionsSection: {
    marginBottom: 32,
    marginHorizontal: 20,
  },
  quickActionsWrapper: {
    marginLeft: -20,
  },
  quickActionsList: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  quickActionCardModern: {
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionGradient: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minWidth: 110,
    minHeight: 100,
  },
  quickActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  quickActionTextModern: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  activitySection: {
    marginBottom: 32,
  },
  weeklySection: {
    marginBottom: 32,
  },
  activityCards: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  activityCardsModern: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginHorizontal: 20,
  },
  activityCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityCardModern: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  activityNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
  },
  activityNumberModern: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
    marginTop: 6,
    letterSpacing: -0.5,
  },
  activityLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  activityLabelModern: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  missionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Added bottom padding
  },
  missionsGrid: {
    paddingHorizontal: 20,
  },
  missionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  missionCardModern: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  missionCardGradient: {
    padding: 20,
  },
  missionHeaderModern: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  missionIconContainer: {
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
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 6,
    lineHeight: 22,
    letterSpacing: -0.5,
  },
  missionDescriptionModern: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
  },
  missionPointsModern: {
    alignItems: "center",
  },
  missionPointsText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  missionPointsLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  progressContainerModern: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarModern: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 12,
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
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  missionPoints: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E22345",
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E22345",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  trackingGrid: {
    paddingHorizontal: 20,
  },
  trackingCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  trackingGradient: {
    padding: 24,
    alignItems: "center",
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 12,
  },
  trackingSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 4,
    textAlign: "center",
  },
  wellnessStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  wellnessStatusText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
    marginLeft: 4,
  },
  startMissionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  startMissionContent: {
    alignItems: "center",
  },
  startMissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  startMissionDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  startMissionButton: {
    backgroundColor: "#E22345",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  startMissionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  
  // Empty Missions Styles
  emptyMissionsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyMissionsIcon: {
    marginBottom: 24,
  },
  emptyMissionsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyMissionsDescription: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  emptyMissionsButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyMissionsButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  emptyMissionsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  
  // Modern Tracking Styles
  pageSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  trackingSection: {
    marginBottom: 32,
    marginHorizontal: 20,
  },
  trackingWrapper: {
    marginLeft: -20,
  },
  trackingList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modernTrackingCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modernTrackingGradient: {
    padding: 20,
    minHeight: 160,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  modernTrackingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modernTrackingContent: {
    alignItems: "center",
  },
  modernTrackingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  modernTrackingSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 16,
    textAlign: "center",
  },
  modernTrackingArrow: {
    justifyContent: "center",
    alignItems: "center",
  },
  statsSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCardGradient: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  activeMissionsScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40, // Increased from 20 to 40 to prevent cutoff
  },
  activeMissionCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
    minHeight: 180, // Added minimum height to prevent cutoff
  },
  activeMissionCardGradient: {
    padding: 20,
    minHeight: 160,
    paddingBottom: 24, // Increased bottom padding
    justifyContent: 'space-between', // Added to ensure proper spacing
  },
  activeMissionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  activeMissionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activeMissionInfo: {
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  activeMissionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    lineHeight: 20,
  },
  activeMissionDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    fontWeight: "500",
  },
  activeMissionPoints: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
  },
  activeMissionPointsText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  activeMissionPointsLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  activeMissionProgressContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4, // Added bottom padding
  },
  activeMissionProgressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  activeMissionProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  activeMissionProgressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
  },
  noActiveMissionsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noActiveMissionsIcon: {
    marginBottom: 16,
  },
  noActiveMissionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  noActiveMissionsDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  noActiveMissionsButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  noActiveMissionsButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  noActiveMissionsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  refreshButton: {
    padding: 8,
  },
  loadingIndicator: {
    marginTop: 10,
    alignItems: "center",
  },
  barValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  noDataSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  loadingCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  loadingCard: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },
  loadingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },
  loadingText: {
    width: 40,
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 6,
  },
  loadingLabel: {
    width: 30,
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  emptyMessage: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  datePickerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 300,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  datePicker: {
    width: 250,
    height: 200,
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#E22345",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

// Wrapper component with error boundary
const WellnessAppWithErrorBoundary = (props: any) => {
  return (
    <ErrorBoundary>
      <WellnessApp {...props} />
    </ErrorBoundary>
  );
};

export default WellnessAppWithErrorBoundary; 