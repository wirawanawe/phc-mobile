import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import eventEmitter from "../utils/eventEmitter";

const { width } = Dimensions.get("window");

const SleepTrackingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [selectedSleepTime, setSelectedSleepTime] = useState("22:30");
  const [selectedWakeTime, setSelectedWakeTime] = useState("07:00");
  const [selectedSleepQuality, setSelectedSleepQuality] = useState<string>("good");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sleepQualityData, setSleepQualityData] = useState<Array<{
    day: string;
    hours: number;
    quality: number;
    date?: string;
    bedtime?: string;
    wake_time?: string;
    deep_sleep_hours?: number;
    rem_sleep_hours?: number;
    light_sleep_hours?: number;
    sleep_efficiency?: number;
  }>>([]);
  const [sleepMetrics, setSleepMetrics] = useState<Array<{
    id: string;
    title: string;
    value: string;
    unit: string;
    trend: string;
    trendPositive: boolean;
    icon: string;
    color: string;
  }>>([]);
  const [sleepStages, setSleepStages] = useState<Array<{
    stage: string;
    duration: string;
    percentage: number;
    color: string;
  }>>([]);
  const [totalSleepHours, setTotalSleepHours] = useState("0");

  const sleepTips = [
    {
      id: "1",
      title: "Consistent Schedule",
      description: "Go to bed and wake up at the same time every day",
      icon: "calendar-clock",
      color: "#8B5CF6",
    },
    {
      id: "2",
      title: "Dark Environment",
      description: "Keep your bedroom dark and cool for better sleep",
      icon: "moon-waning-crescent",
      color: "#3B82F6",
    },
    {
      id: "3",
      title: "Avoid Screens",
      description: "Stop using devices 1 hour before bedtime",
      icon: "cellphone-off",
      color: "#EF4444",
    },
    {
      id: "4",
      title: "Relaxation Routine",
      description: "Practice meditation or reading before sleep",
      icon: "meditation",
      color: "#10B981",
    },
  ];

  useEffect(() => {
    fetchSleepData();
  }, []);

  const fetchSleepData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const userId = await apiService.getUserId();
      if (!userId) {
        console.error("No user ID found - user may not be logged in");
        // Set default data if user is not logged in
        setSleepQualityData([
          { day: "Mon", hours: 0, quality: 0 },
          { day: "Tue", hours: 0, quality: 0 },
          { day: "Wed", hours: 0, quality: 0 },
          { day: "Thu", hours: 0, quality: 0 },
          { day: "Fri", hours: 0, quality: 0 },
          { day: "Sat", hours: 0, quality: 0 },
          { day: "Sun", hours: 0, quality: 0 },
        ]);
        return;
      }
      
      // Fetch weekly sleep data
      const weeklyResponse = await api.getWeeklySleepData();
      if (weeklyResponse.success && weeklyResponse.data && weeklyResponse.data.daily_breakdown) {
        // Transform the API response to match the expected format
        const transformedData = weeklyResponse.data.daily_breakdown.map((day: any) => ({
          day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          hours: day.total_hours || 0,
          quality: day.quality ? getQualityScore(day.quality) : 0,
          date: day.date,
          bedtime: day.bedtime,
          wake_time: day.wake_time,
        }));
        
        setSleepQualityData(transformedData);
        
        // Calculate total sleep hours for today (last entry with data)
        const todayData = transformedData.find((day: any) => day.hours > 0);
        if (todayData && todayData.hours) {
          setTotalSleepHours(todayData.hours.toFixed(1));
          setSelectedSleepTime(todayData.bedtime || "22:30");
          setSelectedWakeTime(todayData.wake_time || "07:00");
        }
      } else {
        // Set default data if API fails or no data
        setSleepQualityData([
          { day: "Mon", hours: 0, quality: 0 },
          { day: "Tue", hours: 0, quality: 0 },
          { day: "Wed", hours: 0, quality: 0 },
          { day: "Thu", hours: 0, quality: 0 },
          { day: "Fri", hours: 0, quality: 0 },
          { day: "Sat", hours: 0, quality: 0 },
          { day: "Sun", hours: 0, quality: 0 },
        ]);
      }

      // Fetch sleep analysis
      const analysisResponse = await api.getSleepAnalysis();
      if (analysisResponse.success && analysisResponse.data) {
        const analysis = analysisResponse.data;
        setSleepMetrics([
          {
            id: "1",
            title: "Sleep Duration",
            value: analysis.average_sleep_hours?.toFixed(1) || "0",
            unit: "hours",
            trend: "Stable",
            trendPositive: true,
            icon: "clock-outline",
            color: "#8B5CF6",
          },
          {
            id: "2",
            title: "Sleep Quality",
            value: analysis.average_sleep_quality?.toFixed(1) || "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "star",
            color: "#F59E0B",
          },
          {
            id: "3",
            title: "Sleep Consistency",
            value: analysis.sleep_consistency?.toFixed(1) || "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "moon-waning-crescent",
            color: "#3B82F6",
          },
          {
            id: "4",
            title: "Sleep Efficiency",
            value: analysis.average_sleep_efficiency?.toFixed(1) || "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "eye",
            color: "#10B981",
          },
        ]);
      } else {
        // Set default metrics if API fails
        setSleepMetrics([
          {
            id: "1",
            title: "Sleep Duration",
            value: "0",
            unit: "hours",
            trend: "Stable",
            trendPositive: true,
            icon: "clock-outline",
            color: "#8B5CF6",
          },
          {
            id: "2",
            title: "Sleep Quality",
            value: "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "star",
            color: "#F59E0B",
          },
          {
            id: "3",
            title: "Sleep Consistency",
            value: "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "moon-waning-crescent",
            color: "#3B82F6",
          },
          {
            id: "4",
            title: "Sleep Efficiency",
            value: "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "eye",
            color: "#10B981",
          },
        ]);
      }

      // Fetch sleep stages
      const stagesResponse = await api.getSleepStages();
      if (stagesResponse.success && stagesResponse.data && Array.isArray(stagesResponse.data)) {
        setSleepStages(stagesResponse.data);
      } else {
        // Set default sleep stages if API fails
        setSleepStages([
          {
            stage: "Deep Sleep",
            duration: "2h 30m",
            percentage: 25,
            color: "#3B82F6",
          },
          {
            stage: "REM Sleep",
            duration: "1h 45m",
            percentage: 18,
            color: "#10B981",
          },
          {
            stage: "Light Sleep",
            duration: "4h 15m",
            percentage: 42,
            color: "#F59E0B",
          },
          {
            stage: "Awake",
            duration: "30m",
            percentage: 5,
            color: "#EF4444",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching sleep data:", error);
      // Set default data if API fails
      setSleepQualityData([
        { day: "Mon", hours: 0, quality: 0 },
        { day: "Tue", hours: 0, quality: 0 },
        { day: "Wed", hours: 0, quality: 0 },
        { day: "Thu", hours: 0, quality: 0 },
        { day: "Fri", hours: 0, quality: 0 },
        { day: "Sat", hours: 0, quality: 0 },
        { day: "Sun", hours: 0, quality: 0 },
      ]);
      // Set default sleep stages if API fails
      setSleepStages([
        {
          stage: "Deep Sleep",
          duration: "2h 30m",
          percentage: 25,
          color: "#3B82F6",
        },
        {
          stage: "REM Sleep",
          duration: "1h 45m",
          percentage: 18,
          color: "#10B981",
        },
        {
          stage: "Light Sleep",
          duration: "4h 15m",
          percentage: 42,
          color: "#F59E0B",
        },
        {
          stage: "Awake",
          duration: "30m",
          percentage: 5,
          color: "#EF4444",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSleep = async () => {
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to save your sleep data");
      return;
    }

    setIsSaving(true);

    try {
      // Calculate sleep duration in hours and minutes
      const [sleepHour, sleepMinute] = selectedSleepTime.split(':').map(Number);
      const [wakeHour, wakeMinute] = selectedWakeTime.split(':').map(Number);
      
      let sleepDurationMinutes = (wakeHour * 60 + wakeMinute) - (sleepHour * 60 + sleepMinute);
      if (sleepDurationMinutes <= 0) {
        sleepDurationMinutes += 24 * 60; // Add 24 hours if wake time is next day
      }

      const sleepHours = Math.floor(sleepDurationMinutes / 60);
      const sleepMinutes = sleepDurationMinutes % 60;

      const sleepData = {
        sleep_date: new Date().toISOString().split('T')[0],
        sleep_hours: sleepHours,
        sleep_minutes: sleepMinutes,
        sleep_quality: selectedSleepQuality,
        bedtime: selectedSleepTime,
        wake_time: selectedWakeTime,
        notes: `Sleep duration: ${sleepHours}h ${sleepMinutes}m, Quality: ${selectedSleepQuality}`
      };

      const response = await apiService.createSleepEntry(sleepData);

      if (response.success) {
        Alert.alert(
          "Success",
          "Sleep data saved successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
        
        // Emit event to notify other components that sleep data has been updated
        eventEmitter.emitSleepLogged();
      } else {
        Alert.alert("Error", response.message || "Failed to save sleep data");
      }
    } catch (error: any) {
      console.error("Error saving sleep data:", error);
      Alert.alert("Error", "Failed to save sleep data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to convert quality string to numeric score
  const getQualityScore = (quality: string): number => {
    const qualityScores = {
      excellent: 4,
      good: 3,
      fair: 2,
      poor: 1,
    };
    return qualityScores[quality as keyof typeof qualityScores] || 0;
  };

  const renderSleepMetric = ({ item }: any) => (
    <View style={styles.sleepMetricCard}>
      <View style={styles.sleepMetricHeader}>
        <View
          style={[
            styles.sleepMetricIcon,
            { backgroundColor: item.color + "20" },
          ]}
        >
          <Icon name={item.icon} size={20} color={item.color} />
        </View>
        <Text style={styles.sleepMetricTitle}>{item.title}</Text>
      </View>
      <View style={styles.sleepMetricValue}>
        <Text style={styles.sleepMetricValueText}>
          {item.value}
          <Text style={styles.sleepMetricUnit}> {item.unit}</Text>
        </Text>
      </View>
      <View style={styles.sleepMetricTrend}>
        <Icon
          name={item.trendPositive ? "trending-up" : "trending-down"}
          size={14}
          color={item.trendPositive ? "#10B981" : "#EF4444"}
        />
        <Text
          style={[
            styles.sleepMetricTrendText,
            { color: item.trendPositive ? "#10B981" : "#EF4444" },
          ]}
        >
          {item.trend}
        </Text>
      </View>
    </View>
  );

  const renderSleepTip = ({ item }: any) => (
    <View style={styles.sleepTipCard}>
      <View
        style={[styles.sleepTipIcon, { backgroundColor: item.color + "20" }]}
      >
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.sleepTipContent}>
        <Text style={styles.sleepTipTitle}>{item.title}</Text>
        <Text style={styles.sleepTipDescription}>{item.description}</Text>
      </View>
    </View>
  );

  const renderSleepStage = ({ item }: any) => (
    <View style={styles.sleepStageCard}>
      <View style={styles.sleepStageHeader}>
        <View
          style={[styles.sleepStageIndicator, { backgroundColor: item.color }]}
        />
        <Text style={styles.sleepStageTitle}>{item.stage}</Text>
        <Text style={styles.sleepStageDuration}>{item.duration}</Text>
      </View>
      <View style={styles.sleepStageBar}>
        <View
          style={[
            styles.sleepStageFill,
            {
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            },
          ]}
        />
      </View>
      <Text style={styles.sleepStagePercentage}>{item.percentage}%</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading sleep data...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sleep Tracking</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={fetchSleepData}>
              <Icon name="refresh" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Sleep Schedule */}
          <View style={styles.sleepScheduleContainer}>
            <Text style={styles.sectionTitle}>Sleep Schedule</Text>
            <View style={styles.sleepScheduleCard}>
              <View style={styles.sleepTimeContainer}>
                <View style={styles.sleepTimeItem}>
                  <Icon name="moon-waning-crescent" size={24} color="#8B5CF6" />
                  <Text style={styles.sleepTimeLabel}>Bedtime</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{selectedSleepTime}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.sleepTimeDivider}>
                  <Icon name="arrow-right" size={20} color="#6B7280" />
                </View>
                <View style={styles.sleepTimeItem}>
                  <Icon name="weather-sunny" size={24} color="#F59E0B" />
                  <Text style={styles.sleepTimeLabel}>Wake Time</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{selectedWakeTime}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.sleepDurationContainer}>
                <Text style={styles.sleepDurationLabel}>Total Sleep</Text>
                <Text style={styles.sleepDurationValue}>{totalSleepHours} hours</Text>
              </View>
              
              {/* Sleep Quality Selector */}
              <View style={styles.sleepQualitySelector}>
                <Text style={styles.sleepQualityLabel}>Sleep Quality</Text>
                <View style={styles.sleepQualityOptions}>
                  {[
                    { value: "excellent", label: "Excellent", color: "#10B981" },
                    { value: "good", label: "Good", color: "#34D399" },
                    { value: "fair", label: "Fair", color: "#F59E0B" },
                    { value: "poor", label: "Poor", color: "#EF4444" },
                    { value: "very_poor", label: "Very Poor", color: "#DC2626" },
                  ].map((quality) => (
                    <TouchableOpacity
                      key={quality.value}
                      style={[
                        styles.sleepQualityOption,
                        selectedSleepQuality === quality.value && styles.sleepQualityOptionSelected,
                      ]}
                      onPress={() => setSelectedSleepQuality(quality.value)}
                    >
                      <View
                        style={[
                          styles.sleepQualityIndicator,
                          { backgroundColor: quality.color },
                        ]}
                      />
                      <Text style={styles.sleepQualityOptionText}>{quality.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Save Button */}
              <View style={styles.saveButtonContainer}>
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSaveSleep}
                  disabled={isSaving}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#7C3AED"]}
                    style={styles.saveButtonGradient}
                  >
                    {isSaving ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Saving...</Text>
                      </View>
                    ) : (
                      <Text style={styles.saveButtonText}>Save Sleep Data</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sleep Quality Chart */}
          <View style={styles.sleepQualityContainer}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.sleepQualityChart}>
              {sleepQualityData.map((item, index) => (
                <View key={index} style={styles.sleepQualityBar}>
                  <View style={styles.sleepQualityBarContainer}>
                    <View
                      style={[
                        styles.sleepQualityBarFill,
                        {
                          height: `${(item.hours / 10) * 80}%`,
                          backgroundColor: index === 6 ? "#8B5CF6" : "#E5E7EB",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.sleepQualityBarLabel}>{item.day}</Text>
                  <Text style={styles.sleepQualityBarValue}>{item.hours}h</Text>
                  <Text style={styles.sleepQualityBarQuality}>
                    {item.quality}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sleep Metrics */}
          <View style={styles.sleepMetricsContainer}>
            <Text style={styles.sectionTitle}>Sleep Analysis</Text>
            <View style={styles.sleepMetricsGrid}>
              {sleepMetrics.map((metric) => (
                <View key={metric.id} style={styles.sleepMetricCard}>
                  <View style={styles.sleepMetricHeader}>
                    <View
                      style={[
                        styles.sleepMetricIcon,
                        { backgroundColor: metric.color + "20" },
                      ]}
                    >
                      <Icon name={metric.icon} size={20} color={metric.color} />
                    </View>
                    <Text style={styles.sleepMetricTitle}>{metric.title}</Text>
                  </View>
                  <View style={styles.sleepMetricValue}>
                    <Text style={styles.sleepMetricValueText}>
                      {metric.value}
                      <Text style={styles.sleepMetricUnit}> {metric.unit}</Text>
                    </Text>
                  </View>
                  <View style={styles.sleepMetricTrend}>
                    <Icon
                      name={
                        metric.trendPositive ? "trending-up" : "trending-down"
                      }
                      size={14}
                      color={metric.trendPositive ? "#10B981" : "#EF4444"}
                    />
                    <Text
                      style={[
                        styles.sleepMetricTrendText,
                        { color: metric.trendPositive ? "#10B981" : "#EF4444" },
                      ]}
                    >
                      {metric.trend}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Sleep Stages */}
          <View style={styles.sleepStagesContainer}>
            <Text style={styles.sectionTitle}>Sleep Stages</Text>
            <View style={styles.sleepStagesCard}>
              {sleepStages?.map((stage, index) => (
                <View key={index} style={styles.sleepStageCard}>
                  <View style={styles.sleepStageHeader}>
                    <View
                      style={[
                        styles.sleepStageIndicator,
                        { backgroundColor: stage.color },
                      ]}
                    />
                    <Text style={styles.sleepStageTitle}>{stage.stage}</Text>
                    <Text style={styles.sleepStageDuration}>
                      {stage.duration}
                    </Text>
                  </View>
                  <View style={styles.sleepStageBar}>
                    <View
                      style={[
                        styles.sleepStageFill,
                        {
                          width: `${stage.percentage}%`,
                          backgroundColor: stage.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.sleepStagePercentage}>
                    {stage.percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sleep Tips */}
          <View style={styles.sleepTipsContainer}>
            <Text style={styles.sectionTitle}>Sleep Tips</Text>
            <View style={styles.sleepTipsList}>
              {sleepTips.map((tip) => (
                <View key={tip.id} style={styles.sleepTipCard}>
                  <View
                    style={[
                      styles.sleepTipIcon,
                      { backgroundColor: tip.color + "20" },
                    ]}
                  >
                    <Icon name={tip.icon} size={24} color={tip.color} />
                  </View>
                  <View style={styles.sleepTipContent}>
                    <Text style={styles.sleepTipTitle}>{tip.title}</Text>
                    <Text style={styles.sleepTipDescription}>
                      {tip.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  settingsButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  sleepScheduleContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sleepScheduleCard: {
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
  sleepTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sleepTimeItem: {
    alignItems: "center",
    flex: 1,
  },
  sleepTimeLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  sleepTimeDivider: {
    paddingHorizontal: 20,
  },
  sleepDurationContainer: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sleepDurationLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  sleepDurationValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8B5CF6",
  },
  sleepQualitySelector: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sleepQualityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  sleepQualityOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sleepQualityOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  sleepQualityOptionSelected: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F3F4F6",
  },
  sleepQualityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  sleepQualityOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  saveButtonContainer: {
    marginTop: 20,
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sleepQualityContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sleepQualityChart: {
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
    height: 160,
  },
  sleepQualityBar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sleepQualityBarContainer: {
    width: 20,
    height: 80,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  sleepQualityBarFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  sleepQualityBarLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  sleepQualityBarValue: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  sleepQualityBarQuality: {
    fontSize: 8,
    color: "#8B5CF6",
    fontWeight: "600",
    marginTop: 2,
  },
  sleepMetricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sleepMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  sleepMetricCard: {
    width: (width - 60) / 2,
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
  sleepMetricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sleepMetricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sleepMetricTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  sleepMetricValue: {
    marginBottom: 8,
  },
  sleepMetricValueText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  sleepMetricUnit: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  sleepMetricTrend: {
    flexDirection: "row",
    alignItems: "center",
  },
  sleepMetricTrendText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  sleepStagesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sleepStagesCard: {
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
  sleepStageCard: {
    marginBottom: 16,
  },
  sleepStageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sleepStageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  sleepStageTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  sleepStageDuration: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  sleepStageBar: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  sleepStageFill: {
    height: "100%",
    borderRadius: 4,
  },
  sleepStagePercentage: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },
  sleepTipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sleepTipsList: {
    gap: 12,
  },
  sleepTipCard: {
    flexDirection: "row",
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
  sleepTipIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sleepTipContent: {
    flex: 1,
  },
  sleepTipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  sleepTipDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});

export default SleepTrackingScreen;
