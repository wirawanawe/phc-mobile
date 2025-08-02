import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, useTheme, Modal, Portal, Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import apiService from "../services/api";

const { width, height } = Dimensions.get("window");

interface WaterSettings {
  daily_goal_ml: number;
  custom_goal_ml?: number;
  doctor_recommended_ml?: number;
  is_reminder_enabled: boolean;
  reminder_interval_minutes: number;
  start_time: string;
  end_time: string;
  weight_kg?: number;
  activity_level: "low" | "moderate" | "high";
  climate_factor: "normal" | "hot" | "very_hot";
  doctor_id?: number | null;
  notes?: string;
}

const WaterTrackingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [currentIntake, setCurrentIntake] = useState(0); // ml
  const [dailyGoal, setDailyGoal] = useState(2500); // ml
  const [isLoadingWaterData, setIsLoadingWaterData] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [waterSettings, setWaterSettings] = useState<WaterSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<WaterSettings | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);

  const waterIntakeOptions = [
    { amount: 200, label: "Small Glass", icon: "cup-water", color: "#3B82F6" },
    { amount: 300, label: "Medium Glass", icon: "cup", color: "#10B981" },
    { amount: 500, label: "Large Glass", icon: "bottle-soda", color: "#F59E0B" },
    { amount: 1000, label: "Bottle", icon: "bottle-soda-classic", color: "#8B5CF6" },
  ];

  const activityLevels = [
    { value: "low", label: "Low Activity", description: "Sedentary lifestyle", icon: "walk", color: "#6B7280" },
    { value: "moderate", label: "Moderate Activity", description: "Light exercise 1-3 days/week", icon: "run", color: "#3B82F6" },
    { value: "high", label: "High Activity", description: "Moderate exercise 3-5 days/week", icon: "bike", color: "#10B981" },
  ];

  const climateFactors = [
    { value: "normal", label: "Normal Climate", description: "Temperate weather", icon: "weather-partly-cloudy", color: "#6B7280" },
    { value: "hot", label: "Hot Climate", description: "Warm weather", icon: "weather-sunny", color: "#F59E0B" },
    { value: "very_hot", label: "Very Hot Climate", description: "Extreme heat", icon: "weather-sunny", color: "#EF4444" },
  ];

  const hydrationTips = [
    {
      id: "1",
      title: "Start Your Day Right",
      description: "Drink a glass of water first thing in the morning",
      icon: "weather-sunny",
      color: "#F59E0B",
    },
    {
      id: "2",
      title: "Set Reminders",
      description: "Use notifications to stay hydrated throughout the day",
      icon: "bell-ring",
      color: "#3B82F6",
    },
    {
      id: "3",
      title: "Eat Water-Rich Foods",
      description: "Include fruits and vegetables with high water content",
      icon: "food-apple",
      color: "#10B981",
    },
    {
      id: "4",
      title: "Monitor Your Urine",
      description: "Light yellow urine indicates good hydration",
      icon: "eye",
      color: "#8B5CF6",
    },
  ];

  // Default weekly progress (will be replaced with database data)
  const defaultWeeklyProgress = [
    { day: "Mon", intake: 0, goal: 2500 },
    { day: "Tue", intake: 0, goal: 2500 },
    { day: "Wed", intake: 0, goal: 2500 },
    { day: "Thu", intake: 0, goal: 2500 },
    { day: "Fri", intake: 0, goal: 2500 },
    { day: "Sat", intake: 0, goal: 2500 },
    { day: "Sun", intake: 0, goal: 2500 },
  ];

  // Load water settings and today's intake
  useEffect(() => {
    loadWaterSettings();
    loadTodayWaterIntake();
    loadWeeklyWaterIntake();
  }, []);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWaterSettings();
      loadTodayWaterIntake();
      loadWeeklyWaterIntake();
    });

    return unsubscribe;
  }, [navigation]);

  const loadWaterSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const userId = await apiService.getUserId();
      if (!userId) {
        console.error("No user ID found - user may not be logged in");
        // Use default settings if user is not logged in
        const defaultSettings = {
          daily_goal_ml: 2500,
          is_reminder_enabled: true,
          reminder_interval_minutes: 60,
          start_time: "08:00:00",
          end_time: "22:00:00",
          activity_level: "moderate" as const,
          climate_factor: "normal" as const,
          doctor_id: null,
        };
        setWaterSettings(defaultSettings);
        return;
      }

      const queryString = await apiService.createQueryStringWithUserId();
      const response = await apiService.request(`/water-settings?${queryString}`);
      if (response.success) {
        setWaterSettings(response.data);
        setDailyGoal(response.data.daily_goal_ml);
      }
    } catch (error) {
      console.error("Load water settings error:", error);
      // Use default settings if API fails
      const defaultSettings = {
        daily_goal_ml: 2500,
        is_reminder_enabled: true,
        reminder_interval_minutes: 60,
        start_time: "08:00:00",
        end_time: "22:00:00",
        activity_level: "moderate" as const,
        climate_factor: "normal" as const,
        doctor_id: null,
      };
      setWaterSettings(defaultSettings);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const loadTodayWaterIntake = async () => {
    setIsLoadingWaterData(true);
    try {
      const userId = await apiService.getUserId();
      if (!userId) {
        console.error("No user ID found - user may not be logged in");
        setCurrentIntake(0);
        return;
      }

      const response = await apiService.getTodayWaterIntake();
      if (response.success && response.data) {
        setCurrentIntake(response.data.total_water_ml || 0);
        if (response.data.daily_goal_ml) {
          setDailyGoal(response.data.daily_goal_ml);
        }
      }
    } catch (error) {
      console.error("Load today's water intake error:", error);
      setCurrentIntake(0);
    } finally {
      setIsLoadingWaterData(false);
    }
  };

  const loadWeeklyWaterIntake = async () => {
    setIsLoadingWeekly(true);
    try {
      const userId = await apiService.getUserId();
      if (!userId) {
        console.error("No user ID found - user may not be logged in");
        setWeeklyProgress(defaultWeeklyProgress);
        return;
      }

      const response = await apiService.getWeeklyWaterIntake();
      if (response.success && response.data && response.data.daily_breakdown) {
        // Create a complete 7-day dataset
        const today = new Date();
        const weekData = [];
        const targetDaily = response.data.weekly_stats?.target_daily || 2500;
        
        // Create array of last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          // Find matching data from API response
          const dayData = response.data.daily_breakdown.find((day: any) => day.date === dateStr);
          
          weekData.push({
            day: dayName,
            intake: dayData ? dayData.total_ml : 0,
            goal: targetDaily,
          });
        }
        
        setWeeklyProgress(weekData);
      } else {
        setWeeklyProgress(defaultWeeklyProgress);
      }
    } catch (error) {
      console.error("Load weekly water intake error:", error);
      setWeeklyProgress(defaultWeeklyProgress);
    } finally {
      setIsLoadingWeekly(false);
    }
  };

  // Save water settings
  const saveWaterSettings = async (settings: Partial<WaterSettings>) => {
    try {
      const userId = await apiService.getUserId();
      if (!userId) {
        Alert.alert("Error", "Please log in to save water settings.");
        return;
      }

      const settingsWithUserId = { ...settings, user_id: userId };
      
      const response = await apiService.request("/water-settings", {
        method: "PUT",
        body: JSON.stringify(settingsWithUserId),
      });
      
      if (response.success) {
        setWaterSettings(response.data);
        setDailyGoal(response.data.daily_goal_ml);
        setShowSettingsModal(false);
        Alert.alert("Success", "Water settings updated successfully!");
        // Refresh all data to ensure consistency
        await loadWaterSettings();
        await loadTodayWaterIntake();
        await loadWeeklyWaterIntake();
      }
    } catch (error) {
      console.error("Save water settings error:", error);
      Alert.alert("Error", "Failed to save water settings");
    }
  };

  // Calculate recommended water intake
  const calculateRecommendedIntake = async (weight: number, activity: string, climate: string) => {
    try {
      const response = await apiService.request("/water-settings", {
        method: "POST",
        body: JSON.stringify({
          weight_kg: weight,
          activity_level: activity,
          climate_factor: climate,
        }),
      });
      
      if (response.success) {
        return response.data.recommended_water_ml;
      }
    } catch (error) {
      console.error("Calculate water intake error:", error);
    }
    
    // Fallback calculation
    let baseIntake = weight * 33;
    if (activity === "low") baseIntake *= 0.9;
    if (activity === "high") baseIntake *= 1.2;
    if (climate === "hot") baseIntake *= 1.1;
    if (climate === "very_hot") baseIntake *= 1.2;
    
    return Math.round(baseIntake);
  };

  // Auto-calculate water goal when weight changes
  const handleWeightChange = async (weightText: string) => {
    const weight = parseFloat(weightText);
    if (tempSettings) {
      setTempSettings(prev => prev ? { ...prev, weight_kg: weight || undefined } : null);
      
      // Auto-calculate daily goal if all parameters are available
      if (weight && weight > 0 && tempSettings.activity_level && tempSettings.climate_factor) {
        const recommended = await calculateRecommendedIntake(
          weight,
          tempSettings.activity_level,
          tempSettings.climate_factor
        );
        setTempSettings(prev => prev ? { ...prev, daily_goal_ml: recommended } : null);
      }
    }
  };

  // Auto-calculate when activity level or climate changes
  const handleActivityLevelChange = async (activityLevel: "low" | "moderate" | "high") => {
    if (tempSettings) {
      setTempSettings(prev => prev ? { ...prev, activity_level: activityLevel } : null);
      
      // Auto-calculate daily goal if all parameters are available
      if (tempSettings.weight_kg && tempSettings.weight_kg > 0 && tempSettings.climate_factor) {
        const recommended = await calculateRecommendedIntake(
          tempSettings.weight_kg,
          activityLevel,
          tempSettings.climate_factor
        );
        setTempSettings(prev => prev ? { ...prev, daily_goal_ml: recommended } : null);
      }
    }
  };

  const handleClimateFactorChange = async (climateFactor: "normal" | "hot" | "very_hot") => {
    if (tempSettings) {
      setTempSettings(prev => prev ? { ...prev, climate_factor: climateFactor } : null);
      
      // Auto-calculate daily goal if all parameters are available
      if (tempSettings.weight_kg && tempSettings.weight_kg > 0 && tempSettings.activity_level) {
        const recommended = await calculateRecommendedIntake(
          tempSettings.weight_kg,
          tempSettings.activity_level,
          climateFactor
        );
        setTempSettings(prev => prev ? { ...prev, daily_goal_ml: recommended } : null);
      }
    }
  };

  const handleAddWater = async (amount: number) => {
    // Animate the scale first
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Save to database first
    try {
      const userId = await apiService.getUserId();
      if (!userId) {
        Alert.alert("Error", "Please log in to track water intake.");
        return;
      }

      const response = await apiService.createWaterEntry({
        amount_ml: amount,
        tracking_date: new Date().toISOString().split("T")[0],
      });
      
      if (response.success) {
        // Update local state with new total
        const newIntake = currentIntake + amount;
        setCurrentIntake(newIntake);
        
        // Also refresh from database to ensure consistency
        await loadTodayWaterIntake();
        await loadWeeklyWaterIntake();
      } else {
        console.error("Failed to save water entry:", response.message);
        Alert.alert("Error", "Failed to save water intake. Please try again.");
      }
    } catch (error) {
      console.error("Save water entry error:", error);
      Alert.alert("Error", "Failed to save water intake. Please check your connection.");
    }
  };

  const getProgressPercentage = () => {
    return Math.min((currentIntake / dailyGoal) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 80) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const openSettingsModal = () => {
    setTempSettings(waterSettings);
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setTempSettings(null);
    setShowSettingsModal(false);
  };

  const handleSaveSettings = () => {
    if (tempSettings) {
      saveWaterSettings(tempSettings);
    }
  };

  const calculateRecommended = async () => {
    if (tempSettings?.weight_kg && tempSettings?.activity_level && tempSettings?.climate_factor) {
      const recommended = await calculateRecommendedIntake(
        tempSettings.weight_kg,
        tempSettings.activity_level,
        tempSettings.climate_factor
      );
      setTempSettings(prev => prev ? { ...prev, daily_goal_ml: recommended } : null);
    } else {
      Alert.alert(
        "Incomplete Information", 
        "Please fill in your weight, activity level, and climate factor first to calculate recommended intake."
      );
    }
  };

  return (
    <LinearGradient colors={["#E22345", "#C41E3A"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E22345" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Water Tracking</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={openSettingsModal}
            >
              <Icon name="cog" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Main Water Progress */}
          <View style={styles.mainProgressContainer}>
            {isLoadingWaterData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading water data...</Text>
              </View>
            ) : (
              <View>
                <Animated.View
                  style={[
                    styles.waterBottleContainer,
                    { transform: [{ scale: scaleValue }] },
                  ]}
                >
                  <View style={styles.waterBottle}>
                    <View style={styles.waterBottleTop}>
                      <Icon name="bottle-soda" size={60} color="#FFFFFF" />
                    </View>
                    <View style={styles.waterBottleBody}>
                      <View
                        style={[
                          styles.waterFill,
                          {
                            height: `${getProgressPercentage()}%`,
                            backgroundColor: getProgressColor(),
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.waterBottleBottom}>
                      <Text style={styles.waterAmount}>{currentIntake}ml</Text>
                      <Text style={styles.waterGoal}>/ {dailyGoal}ml</Text>
                    </View>
                  </View>
                </Animated.View>
                <Text style={styles.progressText}>
                  {getProgressPercentage().toFixed(0)}% Complete
                </Text>
              </View>
            )}
          </View>

          {/* Quick Add Water */}
          <View style={styles.quickAddContainer}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <View style={styles.waterIntakeGrid}>
              {waterIntakeOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.waterIntakeOption}
                  onPress={() => handleAddWater(option.amount)}
                >
                  <View
                    style={[
                      styles.waterIntakeIcon,
                      { backgroundColor: option.color + "20" },
                    ]}
                  >
                    <Icon name={option.icon} size={24} color={option.color} />
                  </View>
                  <Text style={styles.waterIntakeAmount}>
                    {option.amount}ml
                  </Text>
                  <Text style={styles.waterIntakeLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weekly Progress */}
          <View style={styles.weeklyProgressContainer}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.weeklyChart}>
              {Array.isArray(weeklyProgress) && weeklyProgress.map((item, index) => (
                <View key={index} style={styles.weeklyBarContainer}>
                  <View style={styles.weeklyBarBackground}>
                    <View
                      style={[
                        styles.weeklyBarFill,
                        {
                          height: `${(item.intake / item.goal) * 100}%`,
                          backgroundColor: index === 6 ? "#3B82F6" : "#E5E7EB",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.weeklyBarLabel}>{item.day}</Text>
                  <Text style={styles.weeklyBarValue}>
                    {(item.intake / 1000).toFixed(1)}L
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Hydration Tips */}
          <View style={styles.hydrationTipsContainer}>
            <Text style={styles.sectionTitle}>Hydration Tips</Text>
            <View style={styles.hydrationTipsList}>
              {hydrationTips.map((tip) => (
                <View key={tip.id} style={styles.hydrationTipCard}>
                  <View
                    style={[
                      styles.hydrationTipIcon,
                      { backgroundColor: tip.color + "20" },
                    ]}
                  >
                    <Icon name={tip.icon} size={24} color={tip.color} />
                  </View>
                  <View style={styles.hydrationTipContent}>
                    <Text style={styles.hydrationTipTitle}>{tip.title}</Text>
                    <Text style={styles.hydrationTipDescription}>
                      {tip.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Settings Modal */}
        <Portal>
          <Modal
            visible={showSettingsModal}
            onDismiss={closeSettingsModal}
            contentContainerStyle={styles.modalContainer}
          >
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Water Settings</Text>
                <TouchableOpacity onPress={closeSettingsModal}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {/* Weight - Moved to first position */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.settingInput}
                  value={tempSettings?.weight_kg?.toString() || ""}
                  onChangeText={handleWeightChange}
                  keyboardType="numeric"
                  placeholder="Enter your weight"
                />
              </View>

              {/* Activity Level */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Activity Level</Text>
                {activityLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.optionCard,
                      tempSettings?.activity_level === level.value && styles.optionCardSelected,
                    ]}
                    onPress={() => handleActivityLevelChange(level.value as any)}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionHeader}>
                        <View style={[styles.optionIcon, { backgroundColor: level.color + "20" }]}>
                          <Icon name={level.icon} size={20} color={level.color} />
                        </View>
                        <Text style={[
                          styles.optionLabel,
                          tempSettings?.activity_level === level.value && styles.optionLabelSelected,
                        ]}>
                          {level.label}
                        </Text>
                      </View>
                      <Text style={styles.optionDescription}>{level.description}</Text>
                    </View>
                    {tempSettings?.activity_level === level.value && (
                      <Icon name="check-circle" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Climate Factor */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Climate Factor</Text>
                {climateFactors.map((climate) => (
                  <TouchableOpacity
                    key={climate.value}
                    style={[
                      styles.optionCard,
                      tempSettings?.climate_factor === climate.value && styles.optionCardSelected,
                    ]}
                    onPress={() => handleClimateFactorChange(climate.value as any)}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionHeader}>
                        <View style={[styles.optionIcon, { backgroundColor: climate.color + "20" }]}>
                          <Icon name={climate.icon} size={20} color={climate.color} />
                        </View>
                        <Text style={[
                          styles.optionLabel,
                          tempSettings?.climate_factor === climate.value && styles.optionLabelSelected,
                        ]}>
                          {climate.label}
                        </Text>
                      </View>
                      <Text style={styles.optionDescription}>{climate.description}</Text>
                    </View>
                    {tempSettings?.climate_factor === climate.value && (
                      <Icon name="check-circle" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Daily Goal - Moved after weight, activity, and climate */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Daily Water Goal (ml)</Text>
                <TextInput
                  style={[
                    styles.settingInput, 
                    tempSettings?.weight_kg && tempSettings?.activity_level && tempSettings?.climate_factor 
                      ? styles.calculatedInput 
                      : null
                  ]}
                  value={tempSettings?.daily_goal_ml?.toString() || "2500"}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 2500;
                    setTempSettings(prev => prev ? { ...prev, daily_goal_ml: value } : null);
                  }}
                  keyboardType="numeric"
                  placeholder="2500"
                  editable={true}
                />
                {tempSettings?.weight_kg && tempSettings?.activity_level && tempSettings?.climate_factor && (
                  <Text style={styles.formulaText}>
                    Calculated: {tempSettings.weight_kg}kg × 33ml 
                    {tempSettings.activity_level !== "moderate" && ` × ${tempSettings.activity_level === "high" ? "1.2" : "0.9"} (${tempSettings.activity_level})`} 
                    {tempSettings.climate_factor !== "normal" && ` × ${tempSettings.climate_factor === "hot" ? "1.1" : "1.2"} (${tempSettings.climate_factor})`}
                  </Text>
                )}
              </View>

              {/* Calculate Recommended Button */}
              {tempSettings?.weight_kg && tempSettings?.activity_level && tempSettings?.climate_factor ? (
                <View style={styles.infoCard}>
                  <Icon name="information" size={20} color="#3B82F6" />
                  <Text style={styles.infoCardText}>
                    Water intake is automatically calculated based on your weight and settings
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.calculateButton}
                  onPress={calculateRecommended}
                >
                  <Icon name="calculator" size={20} color="#FFFFFF" />
                  <Text style={styles.calculateButtonText}>Calculate Recommended Intake</Text>
                </TouchableOpacity>
              )}

              {/* Reminder Settings */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Reminder Settings</Text>
                <View style={styles.reminderRow}>
                  <Text style={styles.reminderLabel}>Enable Reminders</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      tempSettings?.is_reminder_enabled && styles.toggleButtonActive,
                    ]}
                    onPress={() => setTempSettings(prev => prev ? { ...prev, is_reminder_enabled: !prev.is_reminder_enabled } : null)}
                  >
                    <View style={[
                      styles.toggleCircle,
                      tempSettings?.is_reminder_enabled && styles.toggleCircleActive,
                    ]} />
                  </TouchableOpacity>
                </View>
                
                {tempSettings?.is_reminder_enabled && (
                  <>
                    <Text style={styles.settingSubLabel}>Reminder Interval (minutes)</Text>
                    <TextInput
                      style={styles.settingInput}
                      value={tempSettings?.reminder_interval_minutes?.toString() || "60"}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 60;
                        setTempSettings(prev => prev ? { ...prev, reminder_interval_minutes: value } : null);
                      }}
                      keyboardType="numeric"
                      placeholder="60"
                    />
                  </>
                )}
              </View>

              {/* Doctor Recommendation */}
              {tempSettings?.doctor_recommended_ml && (
                <View style={styles.settingSection}>
                  <Text style={styles.settingLabel}>Doctor Recommendation</Text>
                  <View style={styles.doctorRecommendation}>
                    <Icon name="stethoscope" size={20} color="#3B82F6" />
                    <Text style={styles.doctorRecommendationText}>
                      {tempSettings.doctor_recommended_ml}ml daily
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={closeSettingsModal}
                  style={styles.modalButton}
                  textColor="#6B7280"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveSettings}
                  style={[styles.modalButton, styles.saveButton]}
                  buttonColor="#E22345"
                  loading={isLoadingSettings}
                >
                  Save Settings
                </Button>
              </View>
              
              {/* Bottom spacing for safe area */}
              <View style={styles.modalBottomSpacing} />
            </ScrollView>
          </Modal>
        </Portal>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 24,
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },
  settingsButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  mainProgressContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  waterBottleContainer: {
    marginBottom: 20,
  },
  waterBottle: {
    width: 120,
    height: 200,
    alignItems: "center",
  },
  waterBottleTop: {
    width: 80,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  waterBottleBody: {
    width: 100,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 50,
    overflow: "hidden",
    marginTop: -20,
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  waterBottleBottom: {
    marginTop: 10,
    alignItems: "center",
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  waterGoal: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  progressText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  quickAddContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  waterIntakeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  waterIntakeOption: {
    width: (width - 52) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  waterIntakeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  waterIntakeAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  waterIntakeLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  weeklyProgressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  weeklyChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
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
    height: 140,
  },
  weeklyBarContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  weeklyBarBackground: {
    width: 20,
    height: 60,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  weeklyBarFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  weeklyBarLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  weeklyBarValue: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  hydrationTipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  hydrationTipsList: {
    gap: 12,
  },
  hydrationTipCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  hydrationTipIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  hydrationTipContent: {
    flex: 1,
  },
  hydrationTipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  hydrationTipDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  // Modal styles
  modalContainer: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 20,
    maxHeight: "90%",
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  settingSection: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  settingSubLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 8,
    marginTop: 12,
  },
  settingInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  optionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  optionLabelSelected: {
    color: "#3B82F6",
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  toggleButton: {
    width: 50,
    height: 28,
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: "#10B981",
  },
  toggleCircle: {
    width: 24,
    height: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
  doctorRecommendation: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  doctorRecommendationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  saveButton: {
    backgroundColor: "#E22345",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  calculateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  calculatedInput: {
    backgroundColor: "#F0F9FF",
    borderColor: "#3B82F6",
  },
  formulaText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  modalBottomSpacing: {
    height: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoCardText: {
    fontSize: 14,
    color: "#3B82F6",
    marginLeft: 12,
    flex: 1,
    fontWeight: "500",
  },
});

export default WaterTrackingScreen;
