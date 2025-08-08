import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Text, useTheme, Button, SegmentedButtons } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import ProgressRing from "../components/ProgressRing";
import api from "../services/api";

const { width } = Dimensions.get("window");

// Type definitions for workout parameters
interface WorkoutParameters {
  weight_kg?: string;
  sets?: string;
  reps?: string;
  distance_km?: string;
  pace_min_km?: string;
  speed_kmh?: string;
  distance_m?: string;
  stroke_type?: string;
  intensity?: string;
  steps?: string;
}

// Workout types with their parameters and calorie calculation formulas
const WORKOUT_TYPES = {
  "Weight Lifting": {
    icon: "dumbbell",
    parameters: [
      { name: "weight_kg", label: "Weight (kg)", type: "number", unit: "kg" },
      { name: "sets", label: "Number of Sets", type: "number", unit: "sets" },
      { name: "reps", label: "Reps per Set", type: "number", unit: "reps" }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const weight = parseFloat(params.weight_kg || "0") || 0;
      const sets = parseInt(params.sets || "0") || 0;
      const reps = parseInt(params.reps || "0") || 0;
      const totalReps = sets * reps;
      return Math.round((weight * totalReps * 0.1) + (duration * 3));
    }
  },
  "Running": {
    icon: "run",
    parameters: [
      { name: "distance_km", label: "Distance (km)", type: "number", unit: "km" },
      { name: "pace_min_km", label: "Pace (min/km)", type: "number", unit: "min/km" }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const distance = parseFloat(params.distance_km || "0") || 0;
      const pace = parseFloat(params.pace_min_km || "6") || 6; // default 6 min/km
      const speed = 60 / pace; // km/h
      return Math.round(distance * 60 + (duration * 8));
    }
  },
  "Cycling": {
    icon: "bike",
    parameters: [
      { name: "distance_km", label: "Distance (km)", type: "number", unit: "km" },
      { name: "speed_kmh", label: "Average Speed (km/h)", type: "number", unit: "km/h" }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const distance = parseFloat(params.distance_km || "0") || 0;
      const speed = parseFloat(params.speed_kmh || "20") || 20; // default 20 km/h
      return Math.round(distance * 30 + (duration * 5));
    }
  },
  "Swimming": {
    icon: "swim",
    parameters: [
      { name: "distance_m", label: "Distance (m)", type: "number", unit: "m" },
      { name: "stroke_type", label: "Stroke Type", type: "select", options: ["Freestyle", "Breaststroke", "Butterfly", "Backstroke"] }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const distance = parseFloat(params.distance_m || "0") || 0;
      const strokeType = params.stroke_type || "Freestyle";
      const strokeMultiplier: { [key: string]: number } = {
        "Freestyle": 1,
        "Breaststroke": 1.2,
        "Butterfly": 1.5,
        "Backstroke": 1.1
      };
      return Math.round((distance * 0.5) * (strokeMultiplier[strokeType] || 1) + (duration * 6));
    }
  },
  "Yoga": {
    icon: "yoga",
    parameters: [
      { name: "intensity", label: "Intensity Level", type: "select", options: ["Light", "Moderate", "Intense"] }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const intensity = params.intensity || "Moderate";
      const intensityMultiplier: { [key: string]: number } = {
        "Light": 2,
        "Moderate": 3,
        "Intense": 4
      };
      return Math.round(duration * (intensityMultiplier[intensity] || 3));
    }
  },
  "Walking": {
    icon: "walk",
    parameters: [
      { name: "distance_km", label: "Distance (km)", type: "number", unit: "km" },
      { name: "steps", label: "Steps", type: "number", unit: "steps" }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const distance = parseFloat(params.distance_km || "0") || 0;
      const steps = parseInt(params.steps || "0") || 0;
      return Math.round((distance * 50) + (steps * 0.04) + (duration * 2));
    }
  }
};

const WellnessDetailsScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [loading, setLoading] = useState(true);
  const [wellnessStats, setWellnessStats] = useState<any>(null);
  const [moodData, setMoodData] = useState<any>(null);
  const [missionStats, setMissionStats] = useState<any>(null);
  const [userMissions, setUserMissions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Workout log states
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState("");
  const [workoutParameters, setWorkoutParameters] = useState<any>({});
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [savingWorkout, setSavingWorkout] = useState(false);

  useEffect(() => {
    fetchWellnessData();
  }, []);

  // Calculate calories when parameters change
  useEffect(() => {
    if (selectedWorkoutType && workoutDuration) {
      const workout = WORKOUT_TYPES[selectedWorkoutType as keyof typeof WORKOUT_TYPES];
      if (workout) {
        const calories = workout.calorieFormula(workoutParameters, parseInt(workoutDuration) || 0);
        setCalculatedCalories(calories);
      }
    }
  }, [selectedWorkoutType, workoutParameters, workoutDuration]);

  const handleParameterChange = (paramName: string, value: string) => {
    setWorkoutParameters((prev: WorkoutParameters) => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleSaveWorkout = async () => {
    if (!selectedWorkoutType || !workoutDuration) {
      Alert.alert("Error", "Please select a workout type and enter duration");
      return;
    }

    setSavingWorkout(true);
    try {
      const workoutData = {
        activity_type: selectedWorkoutType,
        activity_name: selectedWorkoutType,
        duration_minutes: parseInt(workoutDuration),
        calories_burned: calculatedCalories,
        distance_km: workoutParameters.distance_km ? parseFloat(workoutParameters.distance_km) : null,
        steps: workoutParameters.steps ? parseInt(workoutParameters.steps) : null,
        intensity: workoutParameters.intensity ? workoutParameters.intensity.toLowerCase() : 'moderate',
        notes: workoutNotes,
        tracking_date: new Date().toISOString().split('T')[0],
        tracking_time: new Date().toTimeString().split(' ')[0]
      };

      const response = await api.createFitnessEntry(workoutData);
      
      if (response.success) {
        Alert.alert("Success", "Workout logged successfully!", [
          {
            text: "OK",
            onPress: () => {
              setShowWorkoutModal(false);
              resetWorkoutForm();
              fetchWellnessData(); // Refresh data
            }
          }
        ]);
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Error", "Failed to save workout. Please try again.");
    } finally {
      setSavingWorkout(false);
    }
  };

  const resetWorkoutForm = () => {
    setSelectedWorkoutType("");
    setWorkoutParameters({});
    setWorkoutDuration("");
    setCalculatedCalories(0);
    setWorkoutNotes("");
  };

  const fetchWellnessData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch wellness stats, mood data, and mission data in parallel
      const [statsResponse, moodResponse, missionStatsResponse, userMissionsResponse] = await Promise.all([
        api.getWellnessStats({ period: "week" }),
        api.getMoodTracker({ period: "week" }),
        api.getMissionStats({ date: new Date().toISOString().split('T')[0] }),
        api.getMyMissions(),
      ]);

  
      console.log("Wellness Stats Response:", statsResponse);
      console.log("Mood Response:", moodResponse);
      console.log("Mission Stats Response:", missionStatsResponse);
      console.log("User Missions Response:", userMissionsResponse);

      if (statsResponse.success) {
        setWellnessStats(statsResponse.data);
        console.log("Wellness Stats Data:", statsResponse.data);
      } else {
        console.warn("Failed to fetch wellness stats:", statsResponse.message);
      }

      if (moodResponse.success) {
        setMoodData(moodResponse.data);
        console.log("Mood Data:", moodResponse.data);
        console.log("Mood Data Keys:", Object.keys(moodResponse.data || {}));
        console.log("Most Common Mood:", moodResponse.data?.most_common_mood);
        console.log("Total Entries:", moodResponse.data?.total_entries);
      } else {
        console.warn("Failed to fetch mood data:", moodResponse.message);
      }

      if (missionStatsResponse.success) {
        setMissionStats(missionStatsResponse.data);
        console.log("Mission Stats Data:", missionStatsResponse.data);
      } else {
        console.warn("Failed to fetch mission stats:", missionStatsResponse.message);
      }

      if (userMissionsResponse.success) {
        setUserMissions(userMissionsResponse.data);
        console.log("User Missions Data:", userMissionsResponse.data);
      } else {
        console.warn("Failed to fetch user missions:", userMissionsResponse.message);
      }

      // If all requests failed, show error
      if (!statsResponse.success && !moodResponse.success && !missionStatsResponse.success) {
        setError("Failed to load wellness data. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching wellness data:", err);
      setError("Failed to load wellness data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallScore = () => {
    if (!wellnessStats && !missionStats) return 54; // Default fallback

    // Get data from both wellness activities and missions
    const wellnessActivities = wellnessStats?.total_activities_completed || 0;
    const wellnessPoints = wellnessStats?.total_points_earned || 0;
    const wellnessStreak = wellnessStats?.streak_days || 0;
    
    // Get data from missions
    const missionActivities = missionStats?.completed_missions || 0;
    const missionPoints = missionStats?.total_points_earned || 0;
    const missionStreak = calculateMissionStreak();
    
    // Combine data
    const totalActivities = wellnessActivities + missionActivities;
    const totalPoints = wellnessPoints + missionPoints;
    const totalStreak = Math.max(wellnessStreak, missionStreak);
    
    // Check if mood data actually exists
    const hasMoodData = moodData && 
                       moodData.most_common_mood && 
                       moodData.total_entries > 0 && 
                       moodData.most_common_mood !== null;
    const averageMood = hasMoodData ? moodData.most_common_mood : "neutral";

    // Convert mood to numeric value
    const moodScores = {
      very_happy: 100,
      happy: 80,
      neutral: 60,
      sad: 40,
      very_sad: 20,
    };

    const moodScore = hasMoodData ? moodScores[averageMood as keyof typeof moodScores] || 60 : 60;

    // Calculate weighted average
    const activityScore = Math.min(totalActivities * 10, 100); // Max 100 for activities
    const pointsScore = Math.min(totalPoints * 2, 100); // Max 100 for points
    const streakScore = Math.min(totalStreak * 15, 100); // Max 100 for streak

    // If no activities, give a lower base score
    if (totalActivities === 0) {
      return Math.round((moodScore * 0.6 + pointsScore * 0.2 + streakScore * 0.2));
    }

    const overallScore = Math.round(
      (activityScore * 0.3 + moodScore * 0.3 + pointsScore * 0.2 + streakScore * 0.2)
    );

    return Math.max(0, Math.min(100, overallScore));
  };

  const calculateMissionStreak = () => {
    if (!userMissions || userMissions.length === 0) return 0;
    
    // Calculate streak based on completed missions
    const completedMissions = userMissions.filter((mission: any) => mission.status === 'completed');
    if (completedMissions.length === 0) return 0;
    
    // Sort by completion date and calculate consecutive days
    const sortedMissions = completedMissions.sort((a: any, b: any) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
    
    let streak = 1;
    let currentDate = new Date(sortedMissions[0].completed_at);
    
    for (let i = 1; i < sortedMissions.length; i++) {
      const missionDate = new Date(sortedMissions[i].completed_at);
      const daysDiff = Math.floor((currentDate.getTime() - missionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        streak++;
        currentDate = missionDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWellnessMetrics = () => {
    if (!wellnessStats && !missionStats) {
      return [
        {
          id: "1",
          title: "Physical Health",
          score: 78,
          color: "#10B981",
          icon: "heart-pulse",
          details: "Based on your activity, sleep, and vital signs",
        },
        {
          id: "2",
          title: "Mental Wellness",
          score: 65,
          color: "#8B5CF6",
          icon: "brain",
          details: "Based on stress levels and mood tracking",
        },
        {
          id: "3",
          title: "Nutrition",
          score: 82,
          color: "#F59E0B",
          icon: "food-apple",
          details: "Based on your daily food intake and hydration",
        },
        {
          id: "4",
          title: "Social Connection",
          score: 71,
          color: "#3B82F6",
          icon: "account-group",
          details: "Based on social interactions and support network",
        },
      ];
    }

    const moodScores = {
      very_happy: 100,
      happy: 80,
      neutral: 60,
      sad: 40,
      very_sad: 20,
    };

    // Check if mood data actually exists
    const hasMoodData = moodData && 
                       moodData.most_common_mood && 
                       moodData.total_entries > 0 && 
                       moodData.most_common_mood !== null;
    const averageMood = hasMoodData ? moodData.most_common_mood : null;
    const moodScore = hasMoodData ? moodScores[averageMood as keyof typeof moodScores] || 60 : 0;

    // Format mood for display
    const formatMood = (mood: string) => {
      return mood.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Combine wellness activities and mission activities
    const wellnessActivities = wellnessStats?.total_activities_completed || 0;
    const missionActivities = missionStats?.completed_missions || 0;
    const totalActivities = wellnessActivities + missionActivities;

    // Combine points from both sources
    const wellnessPoints = wellnessStats?.total_points_earned || 0;
    const missionPoints = missionStats?.total_points_earned || 0;
    const totalPoints = wellnessPoints + missionPoints;

    // Calculate streak from both sources
    const wellnessStreak = wellnessStats?.streak_days || 0;
    const missionStreak = calculateMissionStreak();
    const totalStreak = Math.max(wellnessStreak, missionStreak);


    console.log("Wellness Stats:", wellnessStats);
    console.log("Mission Stats:", missionStats);
    console.log("User Missions:", userMissions);
    console.log("Mood Data:", moodData);
    console.log("Has Mood Data:", hasMoodData);
    console.log("Average Mood:", averageMood);
    console.log("Mood Score:", moodScore);
    console.log("Wellness Activities:", wellnessActivities);
    console.log("Mission Activities:", missionActivities);
    console.log("Total Activities:", totalActivities);
    console.log("Wellness Points:", wellnessPoints);
    console.log("Mission Points:", missionPoints);
    console.log("Total Points:", totalPoints);
    console.log("Wellness Streak:", wellnessStreak);
    console.log("Mission Streak:", missionStreak);
    console.log("Total Streak:", totalStreak);

    return [
      {
        id: "1",
        title: "Activity Completion",
        score: Math.min(totalActivities * 10, 100),
        color: "#10B981",
        icon: "run",
        details: `${totalActivities} activities completed (${wellnessActivities} wellness + ${missionActivities} missions)`,
      },
      {
        id: "2",
        title: "Mental Wellness",
        score: moodScore,
        color: "#8B5CF6",
        icon: "brain",
        details: hasMoodData 
          ? `Mood: ${formatMood(averageMood)} (${moodData.total_entries} entries)`
          : "No mood data available. Start tracking your mood!",
      },
      {
        id: "3",
        title: "Points Earned",
        score: Math.min(totalPoints * 2, 100),
        color: "#F59E0B",
        icon: "star",
        details: `${totalPoints} points earned (${wellnessPoints} wellness + ${missionPoints} missions)`,
      },
      {
        id: "4",
        title: "Streak Days",
        score: Math.min(totalStreak * 15, 100),
        color: "#3B82F6",
        icon: "fire",
        details: `${totalStreak} day streak`,
      },
    ];
  };

  const getWeeklyProgress = () => {
    if (!wellnessStats?.category_breakdown && !userMissions) {
      return [
        { day: "Mon", score: 45 },
        { day: "Tue", score: 52 },
        { day: "Wed", score: 48 },
        { day: "Thu", score: 61 },
        { day: "Fri", score: 58 },
        { day: "Sat", score: 67 },
        { day: "Sun", score: 54 },
      ];
    }

    // Create weekly progress based on both wellness activities and missions
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const totalActivities = (wellnessStats?.total_activities_completed || 0) + (missionStats?.completed_missions || 0);
    
    // Group missions by completion date
    const missionsByDate = userMissions.reduce((acc: any, mission: any) => {
      if (mission.status === 'completed' && mission.completed_at) {
        const date = new Date(mission.completed_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});
    
    return dayNames.map((day, index) => {
      let score = 20; // Base score
      
      if (totalActivities > 0) {
        // Calculate score based on activity distribution
        const dailyActivities = Math.floor(totalActivities / 7) + (index < totalActivities % 7 ? 1 : 0);
        
        // Add bonus for missions completed on this day of the week
        const today = new Date();
        const dayOfWeek = today.getDay();
        const targetDay = (dayOfWeek + index) % 7;
        const targetDate = new Date(today.getTime() + (index - dayOfWeek) * 24 * 60 * 60 * 1000);
        const dateString = targetDate.toISOString().split('T')[0];
        const missionsOnDay = missionsByDate[dateString] || 0;
        
        score = Math.min(dailyActivities * 15 + missionsOnDay * 10, 100);
      }
      
      return {
        day,
        score: Math.max(score, 20), // Minimum 20 for visual appeal
      };
    });
  };

  const getRecommendations = () => {
    const recommendations = [];

    // Combine data from both sources
    const totalActivities = (wellnessStats?.total_activities_completed || 0) + (missionStats?.completed_missions || 0);
    const totalPoints = (wellnessStats?.total_points_earned || 0) + (missionStats?.total_points_earned || 0);
    const totalStreak = Math.max(wellnessStats?.streak_days || 0, calculateMissionStreak());

    if (totalActivities < 3) {
      recommendations.push({
        icon: "run",
        text: "Try to complete at least 3 activities or missions this week to improve your score.",
      });
    }

    if (totalStreak < 3) {
      recommendations.push({
        icon: "fire",
        text: "Build a consistent routine by maintaining a 3-day streak with activities or missions.",
      });
    }

    if (totalPoints < 50) {
      recommendations.push({
        icon: "star",
        text: "Complete more activities and missions to earn points and track your progress.",
      });
    }

    // Check mood data
    if (moodData?.most_common_mood === "sad" || moodData?.most_common_mood === "very_sad") {
      recommendations.push({
        icon: "heart",
        text: "Consider trying mood-lifting activities like meditation or exercise.",
      });
    }

    // Check if user has no activities at all
    if (totalActivities === 0) {
      recommendations.push({
        icon: "plus-circle",
        text: "Start your wellness journey by completing your first activity or mission today.",
      });
    }

    // Default recommendations if no data or insufficient recommendations
    if (recommendations.length < 2) {
      recommendations.push(
        {
          icon: "run",
          text: "Try to increase your daily step count to improve your physical health score.",
        },
        {
          icon: "meditation",
          text: "Practice mindfulness exercises to boost your mental wellness.",
        }
      );
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading wellness data...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color="#FFFFFF" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchWellnessData}>
              <Text style={styles.retryButtonText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const overallScore = calculateOverallScore();
  const wellnessMetrics = getWellnessMetrics();
  const weeklyProgress = getWeeklyProgress();
  const recommendations = getRecommendations();

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wellness Dashboard</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Overall Wellness Score */}
          <View style={styles.overallScoreContainer}>
            <Text style={styles.sectionTitle}>Overall Wellness Score</Text>
            <View style={styles.scoreCircleContainer}>
              <ProgressRing
                progress={overallScore}
                size={150}
                strokeWidth={15}
                strokeColor="#FFFFFF"
              >
                <Text style={styles.overallScoreValue}>{overallScore}</Text>
                <Text style={styles.overallScoreLabel}>
                  {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : overallScore >= 40 ? "Fair" : "Poor"}
                </Text>
              </ProgressRing>
            </View>
            <Text style={styles.scoreDescription}>
              Your wellness score is based on multiple factors including activity completion,
              mood tracking, points earned, and consistency streaks.
            </Text>
          </View>

          {/* Detailed Metrics */}
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Detailed Metrics</Text>
            {wellnessMetrics.map((metric) => (
              <View key={metric.id} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={styles.metricIconContainer}>
                    <Icon name={metric.icon} size={24} color={metric.color} />
                  </View>
                  <View style={styles.metricInfo}>
                    <Text style={styles.metricTitle}>{metric.title}</Text>
                    <Text style={styles.metricDetails}>{metric.details}</Text>
                  </View>
                  <View style={styles.metricScore}>
                    <Text
                      style={[styles.metricScoreValue, { color: metric.color }]}
                    >
                      {metric.score}
                    </Text>
                    <Text style={styles.metricScoreLabel}>/100</Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${metric.score}%`,
                          backgroundColor: metric.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Weekly Progress */}
          <View style={styles.weeklyContainer}>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <View style={styles.weeklyChart}>
              {weeklyProgress.map((item: any, index: number) => (
                <View key={index} style={styles.weeklyBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(item.score / 100) * 120}%`,
                          backgroundColor:
                            item.score >= 60 ? "#10B981" : "#F59E0B",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Workout Log Section */}
          <View style={styles.workoutLogContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workout Log</Text>
              <TouchableOpacity
                style={styles.addWorkoutButton}
                onPress={() => setShowWorkoutModal(true)}
              >
                <Icon name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addWorkoutButtonText}>Log Workout</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.workoutDescription}>
              Track your workouts and automatically calculate calories burned based on your activity type and parameters.
            </Text>
          </View>

          {/* Recommendations */}
          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {recommendations.map((recommendation: any, index: number) => (
              <View key={index} style={styles.recommendationCard}>
                <Icon name={recommendation.icon} size={24} color="#F59E0B" />
                <Text style={styles.recommendationText}>
                  {recommendation.text}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Workout Log Modal */}
        <Modal
          visible={showWorkoutModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalSafeArea}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setShowWorkoutModal(false);
                    resetWorkoutForm();
                  }}
                >
                  <Icon name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Log Workout</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Step 1: Select Workout Type */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>1. Select Workout Type</Text>
                  <View style={styles.workoutTypeGrid}>
                    {Object.keys(WORKOUT_TYPES).map((workoutType) => (
                      <TouchableOpacity
                        key={workoutType}
                        style={[
                          styles.workoutTypeCard,
                          selectedWorkoutType === workoutType && styles.workoutTypeCardSelected
                        ]}
                        onPress={() => setSelectedWorkoutType(workoutType)}
                      >
                        <Icon 
                          name={WORKOUT_TYPES[workoutType as keyof typeof WORKOUT_TYPES].icon} 
                          size={32} 
                          color={selectedWorkoutType === workoutType ? "#FFFFFF" : "#10B981"} 
                        />
                        <Text style={[
                          styles.workoutTypeText,
                          selectedWorkoutType === workoutType && styles.workoutTypeTextSelected
                        ]}>
                          {workoutType}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Step 2: Workout Parameters */}
                {selectedWorkoutType && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>2. Workout Parameters</Text>
                    {WORKOUT_TYPES[selectedWorkoutType as keyof typeof WORKOUT_TYPES].parameters.map((param) => (
                      <View key={param.name} style={styles.parameterContainer}>
                        <Text style={styles.parameterLabel}>{param.label}</Text>
                        {param.type === "select" ? (
                          <View style={styles.selectContainer}>
                            {(param as any).options?.map((option: string) => (
                              <TouchableOpacity
                                key={option}
                                style={[
                                  styles.selectOption,
                                  workoutParameters[param.name] === option && styles.selectOptionSelected
                                ]}
                                onPress={() => handleParameterChange(param.name, option)}
                              >
                                <Text style={[
                                  styles.selectOptionText,
                                  workoutParameters[param.name] === option && styles.selectOptionTextSelected
                                ]}>
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ) : (
                          <TextInput
                            style={styles.parameterInput}
                            placeholder={`Enter ${param.label.toLowerCase()}`}
                            placeholderTextColor="#9CA3AF"
                            value={workoutParameters[param.name] || ""}
                            onChangeText={(value) => handleParameterChange(param.name, value)}
                            keyboardType="numeric"
                          />
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Step 3: Duration */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>3. Duration</Text>
                  <View style={styles.durationContainer}>
                    <TextInput
                      style={styles.durationInput}
                      placeholder="Enter duration in minutes"
                      placeholderTextColor="#9CA3AF"
                      value={workoutDuration}
                      onChangeText={setWorkoutDuration}
                      keyboardType="numeric"
                    />
                    <Text style={styles.durationUnit}>minutes</Text>
                  </View>
                </View>

                {/* Step 4: Calculated Calories */}
                {calculatedCalories > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>4. Calories Burned</Text>
                    <View style={styles.caloriesContainer}>
                      <Text style={styles.caloriesValue}>{calculatedCalories}</Text>
                      <Text style={styles.caloriesUnit}>calories</Text>
                    </View>
                    <Text style={styles.caloriesNote}>
                      *Calculated based on your workout parameters and duration
                    </Text>
                  </View>
                )}

                {/* Notes */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Notes (Optional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add any notes about your workout..."
                    placeholderTextColor="#9CA3AF"
                    value={workoutNotes}
                    onChangeText={setWorkoutNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Save Button */}
                <View style={styles.modalSection}>
                  <Button
                    mode="contained"
                    onPress={handleSaveWorkout}
                    loading={savingWorkout}
                    disabled={!selectedWorkoutType || !workoutDuration || savingWorkout}
                    style={styles.saveButton}
                    labelStyle={styles.saveButtonLabel}
                  >
                    {savingWorkout ? "Saving..." : "Save Workout"}
                  </Button>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  overallScoreContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: -0.4,
  },
  scoreCircleContainer: {
    marginVertical: 20,
  },
  overallScoreValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  overallScoreLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: 4,
    opacity: 0.9,
  },
  scoreDescription: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: "500",
    opacity: 0.9,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  metricCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  metricDetails: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  metricScore: {
    alignItems: "flex-end",
  },
  metricScoreValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  metricScoreLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  progressBarContainer: {
    marginTop: 10,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  weeklyContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  weeklyChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingTop: 20,
  },
  weeklyBar: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  barContainer: {
    width: 24,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  bar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderRadius: 12,
  },
  barLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginLeft: 12,
    fontWeight: "500",
  },
  // Workout Log Styles
  workoutLogContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addWorkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addWorkoutButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  workoutDescription: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  modalHeaderSpacer: {
    width: 34,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    marginBottom: 30,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  workoutTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  workoutTypeCard: {
    width: (width - 60) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  workoutTypeCardSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  workoutTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    textAlign: "center",
  },
  workoutTypeTextSelected: {
    color: "#FFFFFF",
  },
  parameterContainer: {
    marginBottom: 16,
  },
  parameterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  parameterInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectOptionSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  selectOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  selectOptionTextSelected: {
    color: "#FFFFFF",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 12,
  },
  durationUnit: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  caloriesContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#10B981",
    letterSpacing: -1,
  },
  caloriesUnit: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 4,
  },
  caloriesNote: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
    fontStyle: "italic",
  },
  notesInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WellnessDetailsScreen;
