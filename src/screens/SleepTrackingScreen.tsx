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
  Platform,
} from "react-native";
import CustomAlert from "../components/CustomAlert";

import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";

import eventEmitter from "../utils/eventEmitter";
import dateChangeDetector from "../utils/dateChangeDetector";
import { safeGoBack } from "../utils/safeNavigation";
import { getTodayDate } from "../utils/dateUtils";

const { width } = Dimensions.get("window");

const SleepTrackingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [selectedSleepTime, setSelectedSleepTime] = useState("22:30");
  const [selectedWakeTime, setSelectedWakeTime] = useState("07:00");
  const [selectedSleepQuality, setSelectedSleepQuality] = useState<string>("good");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSleepTimePicker, setShowSleepTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
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
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onPress: () => {}
  });

  const sleepTips = [
    {
      id: "1",
      title: "Jadwal Tidur yang Konsisten",
      description: "Tidur dan bangun pada waktu yang sama setiap hari",
      icon: "calendar-clock",
      color: "#8B5CF6",
    },
    {
      id: "2",
      title: "Lingkungan Gelap",
      description: "Jaga ruangan tidur Anda tetap gelap dan dingin untuk mendukung tidur yang lebih baik",
      icon: "moon-waning-crescent",
      color: "#3B82F6",
    },
    {
      id: "3",
      title: "Hindari Layar",
      description: "Hindari penggunaan perangkat 1 jam sebelum tidur",
      icon: "cellphone-off",
      color: "#EF4444",
    },
    {
      id: "4",
      title: "Ritual Relaksasi",
      description: "Lakukan meditasi atau membaca sebelum tidur",
      icon: "meditation",
      color: "#10B981",
    },
  ];

  useEffect(() => {
    // Initialize date change detector
    dateChangeDetector.initialize();
    
    fetchSleepData();
    
    // Listen for daily reset events
    const handleDailyReset = () => {
      console.log('SleepTrackingScreen - Daily reset detected, refreshing sleep data...');
      setSelectedSleepTime("22:30");
      setSelectedWakeTime("07:00");
      setSelectedSleepQuality("good");
      setTotalSleepHours("0");
      fetchSleepData();
    };

    // Listen for cache cleared events
    const handleCacheCleared = () => {
      console.log('SleepTrackingScreen - Cache cleared event detected, refreshing sleep data...');
      setTimeout(() => {
        fetchSleepData();
      }, 200);
    };

    // Listen for force refresh events
    const handleForceRefreshAllData = () => {
      console.log('SleepTrackingScreen - Force refresh all data event detected...');
      setTimeout(() => {
        fetchSleepData();
      }, 300);
    };

    // Listen for cache refreshed events
    const handleCacheRefreshed = () => {
      console.log('SleepTrackingScreen - Cache refreshed event detected...');
      setTimeout(() => {
        fetchSleepData();
      }, 150);
    };
    
    // Add event listeners
    eventEmitter.on('dailyReset', handleDailyReset);
    eventEmitter.on('cacheCleared', handleCacheCleared);
    eventEmitter.on('forceRefreshAllData', handleForceRefreshAllData);
    eventEmitter.on('cacheRefreshed', handleCacheRefreshed);
    
    return () => {
      // Remove event listeners
      eventEmitter.off('dailyReset', handleDailyReset);
      eventEmitter.off('cacheCleared', handleCacheCleared);
      eventEmitter.off('forceRefreshAllData', handleForceRefreshAllData);
      eventEmitter.off('cacheRefreshed', handleCacheRefreshed);
    };
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
          { day: "Sen", hours: 0, quality: 0 },
          { day: "Sel", hours: 0, quality: 0 },
          { day: "Rab", hours: 0, quality: 0 },
          { day: "Kam", hours: 0, quality: 0 },
          { day: "Jum", hours: 0, quality: 0 },
          { day: "Sab", hours: 0, quality: 0 },
          { day: "Min", hours: 0, quality: 0 },
        ]);
        return;
      }
      
      // Fetch weekly sleep data
      const weeklyResponse = await apiService.getWeeklySleepData();
      console.log('SleepTrackingScreen - Weekly response:', weeklyResponse);
      
      if (weeklyResponse.success && weeklyResponse.data && weeklyResponse.data.daily_breakdown) {
        // Transform the API response to match the expected format
        const transformedData = weeklyResponse.data.daily_breakdown.map((day: any) => {
          // Handle multiple possible field names for hours
          let hours = 0;
          if (day.total_hours !== undefined && day.total_hours !== null) {
            hours = parseFloat(day.total_hours) || 0;
          } else if (day.sleep_hours !== undefined && day.sleep_hours !== null) {
            hours = parseFloat(day.sleep_hours) || 0;
          } else if (day.duration_minutes !== undefined && day.duration_minutes !== null) {
            hours = (parseFloat(day.duration_minutes) || 0) / 60;
          }
          
          return {
            day: day.date ? new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' }) : 'Unknown',
            hours: hours,
            quality: day.quality && typeof day.quality === 'string' ? getQualityScore(day.quality) : 0,
            date: day.date,
            bedtime: day.bedtime,
            wake_time: day.wake_time,
          };
        });
        
        console.log('SleepTrackingScreen - Transformed data:', transformedData);
        setSleepQualityData(transformedData);
        
        // Calculate total sleep hours for today (last entry with data)
        const todayData = transformedData.find((day: any) => day.hours > 0);
        console.log('SleepTrackingScreen - Today data found:', todayData);
        
        if (todayData && todayData.hours !== undefined && todayData.hours !== null) {
          console.log('SleepTrackingScreen - Setting total sleep hours:', todayData.hours);
          setTotalSleepHours(todayData.hours.toFixed(1));
          setSelectedSleepTime(todayData.bedtime || "22:30");
          setSelectedWakeTime(todayData.wake_time || "07:00");
        } else {
          console.log('SleepTrackingScreen - No valid today data found, using defaults');
          setTotalSleepHours("0");
          setSelectedSleepTime("22:30");
          setSelectedWakeTime("07:00");
        }
      } else {
        console.log('SleepTrackingScreen - No weekly data available, setting defaults');
        // Set default data if API fails or no data
        setSleepQualityData([
          { day: "Sen", hours: 0, quality: 0 },
          { day: "Sel", hours: 0, quality: 0 },
          { day: "Rab", hours: 0, quality: 0 },
          { day: "Kam", hours: 0, quality: 0 },
          { day: "Jum", hours: 0, quality: 0 },
          { day: "Sab", hours: 0, quality: 0 },
          { day: "Min", hours: 0, quality: 0 },
        ]);
        // Set default values for today
        setTotalSleepHours("0");
        setSelectedSleepTime("22:30");
        setSelectedWakeTime("07:00");
      }

      // Fetch sleep analysis
      const analysisResponse = await apiService.getSleepAnalysis();
      if (analysisResponse.success && analysisResponse.data) {
        const analysis = analysisResponse.data;
        setSleepMetrics([
          {
            id: "1",
            title: "Durasi Tidur",
            value: analysis.average_sleep_hours?.toFixed(1) || "0",
            unit: "hours",
            trend: "Stable",
            trendPositive: true,
            icon: "clock-outline",
            color: "#8B5CF6",
          },
          {
            id: "2",
            title: "Kualitas Tidur",
            value: analysis.average_sleep_quality?.toFixed(1) || "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "star",
            color: "#F59E0B",
          },
          {
            id: "3",
            title: "Konsistensi Tidur",
            value: analysis.sleep_consistency?.toFixed(1) || "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "moon-waning-crescent",
            color: "#3B82F6",
          },
          {
            id: "4",
            title: "Efisiensi Tidur",
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
            title: "Durasi Tidur",
            value: "0",
            unit: "hours",
            trend: "Stable",
            trendPositive: true,
            icon: "clock-outline",
            color: "#8B5CF6",
          },
          {
            id: "2",
            title: "Kualitas Tidur",
            value: "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "star",
            color: "#F59E0B",
          },
          {
            id: "3",
            title: "Konsistensi Tidur",
            value: "0",
            unit: "%",
            trend: "Stable",
            trendPositive: true,
            icon: "moon-waning-crescent",
            color: "#3B82F6",
          },
          {
            id: "4",
            title: "Efisiensi Tidur",
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
      const stagesResponse = await apiService.getSleepStages();
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
        { day: "Sen", hours: 0, quality: 0 },
        { day: "Sel", hours: 0, quality: 0 },
        { day: "Rab", hours: 0, quality: 0 },
        { day: "Kam", hours: 0, quality: 0 },
        { day: "Jum", hours: 0, quality: 0 },
        { day: "Sab", hours: 0, quality: 0 },
        { day: "Min", hours: 0, quality: 0 },
      ]);
      // Set default values for today
      setTotalSleepHours("0");
      setSelectedSleepTime("22:30");
      setSelectedWakeTime("07:00");
      // Set default sleep stages if API fails
      setSleepStages([
        {
          stage: "Tidur Dalam",
          duration: "2h 30m",
          percentage: 25,
          color: "#3B82F6",
        },
        {
          stage: "Tidur REM",
          duration: "1h 45m",
          percentage: 18,
          color: "#10B981",
        },
        {
          stage: "Tidur Ringan",
          duration: "4h 15m",
          percentage: 42,
          color: "#F59E0B",
        },
        {
          stage: "Bangun",
          duration: "30m",
          percentage: 5,
          color: "#EF4444",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    const currentPlatform = Platform.OS;
    
    if (currentPlatform === 'android') {
      setShowSleepTimePicker(false);
      setShowWakeTimePicker(false);
    }
    
    if (selectedDate) {
      setTempTime(selectedDate);
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      if (showSleepTimePicker) {
        setSelectedSleepTime(timeString);
        if (currentPlatform === 'ios') {
          setShowSleepTimePicker(false);
        }
      } else if (showWakeTimePicker) {
        setSelectedWakeTime(timeString);
        if (currentPlatform === 'ios') {
          setShowWakeTimePicker(false);
        }
      }
    } else {
      // User cancelled the picker
      setShowSleepTimePicker(false);
      setShowWakeTimePicker(false);
    }
  };

  const showTimePicker = (type: 'sleep' | 'wake') => {
    const currentTime = type === 'sleep' ? selectedSleepTime : selectedWakeTime;
    const [hours, minutes] = currentTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    setTempTime(date);
    
    if (type === 'sleep') {
      setShowSleepTimePicker(true);
    } else {
      setShowWakeTimePicker(true);
    }
  };

  const handleSaveSleep = async () => {
    if (!isAuthenticated) {
      showAlert("Authentication Required", "Please log in to save your sleep data", "warning");
      return;
    }

    setIsSaving(true);

    try {
      // Check if sleep data already exists for today
      const today = getTodayDate();
      const existingData = await apiService.getSleepDataByDate(today);
      
      if (existingData.sleepData && existingData.sleepData.length > 0) {
        const existingEntry = existingData.sleepData[0];
        

        Alert.alert(
          "Data Tidur Sudah Ada",
          "Anda sudah mencatat data tidur hari ini. Apakah Anda ingin memperbarui data yang sudah ada?",
          [
            {
              text: "Batal",
              style: "cancel",
            },
            {
              text: "Perbarui",
              onPress: async () => {
                try {
                  setIsSaving(true);
                  
                  // Calculate sleep duration in hours and minutes
                  const [sleepHour, sleepMinute] = selectedSleepTime.split(':').map(Number);
                  const [wakeHour, wakeMinute] = selectedWakeTime.split(':').map(Number);
                  
                  let sleepDurationMinutes = (wakeHour * 60 + wakeMinute) - (sleepHour * 60 + sleepMinute);
                  if (sleepDurationMinutes <= 0) {
                    sleepDurationMinutes += 24 * 60; // Add 24 hours if wake time is next day
                  }

                  const sleepHours = Math.floor(sleepDurationMinutes / 60);
                  const sleepMinutes = sleepDurationMinutes % 60;

                  const updatedSleepData = {
                    sleep_date: today,
                    sleep_hours: sleepHours,
                    sleep_minutes: sleepMinutes,
                    sleep_quality: selectedSleepQuality,
                    bedtime: selectedSleepTime,
                    wake_time: selectedWakeTime,
                    notes: `Durasi Tidur: ${sleepHours}h ${sleepMinutes}m, Kualitas: ${selectedSleepQuality}`
                  };

                  // Validate sleep data before sending
                  const validation = validateSleepData(updatedSleepData);
                  if (!validation.isValid) {
                    console.log("❌ SleepTrackingScreen: Validation failed for update:", validation.errors);
                    showAlert("Validation Error", validation.errors.join('\n'), "error");
                    return;
                  }

                  console.log("✅ SleepTrackingScreen: Update data validated successfully:", updatedSleepData);
                  const updateResponse = await apiService.updateSleepEntry(existingEntry.id, updatedSleepData);
                  console.log("🔍 SleepTrackingScreen: API Response for update:", updateResponse);
                  


                  // Check if response is successful
                  if (updateResponse && updateResponse.success) {
                    console.log("✅ SleepTrackingScreen: Showing success alert for update");
                    showAlert(
                      "Update Success",
                      "Sleep data updated successfully!",
                      "success",
                      () => {
                        safeGoBack(navigation);
                        eventEmitter.emitSleepLogged();
                      }
                    );
                  } else {
                    const errorMessage = updateResponse?.message || "Failed to update sleep data";
                    console.log("❌ SleepTrackingScreen: Showing error alert for update -", errorMessage);
                    showAlert("Update Error", errorMessage, "error");
                  }
                } catch (updateError: any) {
                  console.error("Error updating sleep data:", updateError);
                  const errorMessage = updateError?.message || "Failed to update sleep data. Please try again.";
                  console.log("❌ SleepTrackingScreen: Showing catch error alert for update -", errorMessage);
                  showAlert("Update Error", errorMessage, "error");
                } finally {
                  setIsSaving(false);
                }
              },
            },
          ]
        );
        return;
      }

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
        sleep_date: today,
        sleep_hours: sleepHours,
        sleep_minutes: sleepMinutes,
        sleep_quality: selectedSleepQuality,
        bedtime: selectedSleepTime,
        wake_time: selectedWakeTime,
        notes: `Sleep duration: ${sleepHours}h ${sleepMinutes}m, Quality: ${selectedSleepQuality}`
      };



      console.log("✅ SleepTrackingScreen: Sleep data validated successfully:", sleepData);
      
      // Create sleep tracking entry
      const sleepResponse = await apiService.createSleepEntry(sleepData);
      console.log("🔍 SleepTrackingScreen: Sleep tracking result:", sleepResponse);
      


      // Check if response is successful
      if (sleepResponse && sleepResponse.success) {
        console.log("✅ SleepTrackingScreen: Showing success alert for create");
        showAlert(
          "Save Success",
          "Sleep data saved successfully!",
          "success",
          () => {
            safeGoBack(navigation);
            eventEmitter.emitSleepLogged();
          }
        );
      } else {
        const errorMessage = sleepResponse?.message || "Failed to save sleep data";
        console.log("❌ SleepTrackingScreen: Showing error alert for create -", errorMessage);
        showAlert("Save Error", errorMessage, "error");
      }
    } catch (error: any) {
      console.error("Error saving sleep data:", error);
      const errorMessage = error?.message || "Failed to save sleep data. Please try again.";
      console.log("❌ SleepTrackingScreen: Showing catch error alert for create -", errorMessage);
      showAlert("Save Error", errorMessage, "error");
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

  // Helper function to show custom alert
  const showAlert = (title: string, message: string, type: "success" | "error" | "warning" | "info", onPress?: () => void) => {
    console.log(`🔍 CustomAlert: Showing ${type} alert - "${title}"`);
    setAlertConfig({
      title,
      message,
      type,
      onPress: () => {
        console.log(`🔍 CustomAlert: Alert closed - "${title}"`);
        setShowCustomAlert(false);
        if (onPress) onPress();
      }
    });
    setShowCustomAlert(true);
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
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate('SleepHistory')}
            >
              <Icon name="history" size={24} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          {/* Sleep Schedule */}
          <View style={styles.sleepScheduleContainer}>
            <Text style={styles.sectionTitle}>Jadwal Tidur</Text>
            <View style={styles.sleepScheduleCard}>
              <View style={styles.sleepTimeContainer}>
                <View style={styles.sleepTimeItem}>
                  <Icon name="moon-waning-crescent" size={24} color="#8B5CF6" />
                  <Text style={styles.sleepTimeLabel}>Waktu Tidur</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => showTimePicker('sleep')}
                  >
                    <Text style={styles.timeText}>{selectedSleepTime}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.sleepTimeDivider}>
                  <Icon name="arrow-right" size={20} color="#6B7280" />
                </View>
                <View style={styles.sleepTimeItem}>
                  <Icon name="weather-sunny" size={24} color="#F59E0B" />
                  <Text style={styles.sleepTimeLabel}>Waktu Bangun</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => showTimePicker('wake')}
                  >
                    <Text style={styles.timeText}>{selectedWakeTime}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.sleepDurationContainer}>
                <Text style={styles.sleepDurationLabel}>Total Tidur</Text>
                <Text style={styles.sleepDurationValue}>{totalSleepHours} hours</Text>
              </View>
              
              {/* Sleep Quality Selector */}
              <View style={styles.sleepQualitySelector}>
                <Text style={styles.sleepQualityLabel}>Kualitas Tidur</Text>
                <View style={styles.sleepQualityOptions}>
                  {[
                    { value: "excellent", label: "Sangat Baik", color: "#10B981" },
                    { value: "good", label: "Baik", color: "#34D399" },
                    { value: "fair", label: "Cukup", color: "#F59E0B" },
                    { value: "poor", label: "Buruk", color: "#EF4444" },
                    { value: "very_poor", label: "Sangat Buruk", color: "#DC2626" },
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
                        <Text style={styles.saveButtonText}>Menyimpan...</Text>
                      </View>
                    ) : (
                      <Text style={styles.saveButtonText}>Simpan Data Tidur</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>


          {/* Sleep Tips */}
          <View style={styles.sleepTipsContainer}>
            <Text style={styles.sectionTitle}>Tips Tidur</Text>
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
        
        {/* DateTimePicker Components */}
        {showSleepTimePicker && (
          <>
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
            {Platform.OS === 'ios' && (
              <View style={styles.pickerButtonContainer}>
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => setShowSleepTimePicker(false)}
                >
                  <Text style={styles.pickerDoneButtonText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        
        {showWakeTimePicker && (
          <>
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
            {Platform.OS === 'ios' && (
              <View style={styles.pickerButtonContainer}>
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => setShowWakeTimePicker(false)}
                >
                  <Text style={styles.pickerDoneButtonText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        
        {/* Custom Alert Modal */}
        <CustomAlert
          visible={showCustomAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onPress={alertConfig.onPress}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  historyButton: {
    padding: 8,
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
  pickerButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pickerDoneButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pickerDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SleepTrackingScreen;
