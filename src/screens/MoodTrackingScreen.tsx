import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
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
import { networkStatusManager, NetworkStatus } from "../utils/networkStatus";
import { getTodayDate } from "../utils/dateUtils";

const { width } = Dimensions.get("window");

const MoodTrackingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [existingMood, setExistingMood] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [moodHistory, setMoodHistory] = useState<any>(null);
  const [moodScore, setMoodScore] = useState<number>(0);
  const [hasTodayEntry, setHasTodayEntry] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  });

  const moods = [
    { id: "very_happy", emoji: "😊", label: "Very Happy", color: "#10B981" },
    { id: "happy", emoji: "😌", label: "Happy", color: "#34D399" },
    { id: "neutral", emoji: "😐", label: "Neutral", color: "#6B7280" },
    { id: "sad", emoji: "😔", label: "Sad", color: "#8B5CF6" },
    { id: "very_sad", emoji: "😢", label: "Very Sad", color: "#EF4444" },
  ];

  const stressLevels = [
    { level: 1, label: "Very Low", color: "#10B981" },
    { level: 2, label: "Low", color: "#34D399" },
    { level: 3, label: "Moderate", color: "#F59E0B" },
    { level: 4, label: "High", color: "#F97316" },
    { level: 5, label: "Very High", color: "#EF4444" },
  ];

  const wellnessActivities = [
    {
      id: "1",
      title: "Meditation",
      description: "10 min guided session",
      icon: "meditation",
      color: "#8B5CF6",
      duration: "10 min",
    },
    {
      id: "2",
      title: "Deep Breathing",
      description: "Calm your mind",
      icon: "wind",
      color: "#3B82F6",
      duration: "5 min",
    },
    {
      id: "3",
      title: "Gratitude Journal",
      description: "Write 3 things you're grateful for",
      icon: "book-open-variant",
      color: "#10B981",
      duration: "5 min",
    },
    {
      id: "4",
      title: "Quick Walk",
      description: "Get some fresh air",
      icon: "walk",
      color: "#F59E0B",
      duration: "15 min",
    },
  ];

  useEffect(() => {
    // Initialize date change detector
    dateChangeDetector.initialize();
    
    // Listen for network status changes
    const handleNetworkChange = (status: NetworkStatus) => {
      setNetworkStatus(status);
      console.log('Network status changed:', status);
      
      // If network becomes available and we have an error, try to reload
      if (status.isConnected && error) {
        setError(null);
        if (isAuthenticated) {
          loadTodayMood();
        }
      }
    };
    
    if (networkStatusManager && typeof networkStatusManager.addListener === 'function') {
      if (networkStatusManager.isInitialized && networkStatusManager.isInitialized()) {
        networkStatusManager.addListener(handleNetworkChange);
      } else {
        console.warn('⚠️ MoodTrackingScreen: networkStatusManager not yet initialized');
      }
    } else {
      console.warn('⚠️ MoodTrackingScreen: networkStatusManager not available');
    }
    
    if (isAuthenticated) {
      loadTodayMood();
    }
    
    // Listen for mood logged events to refresh data immediately
    const handleMoodLogged = () => {
      console.log('MoodTrackingScreen - Mood logged event received, refreshing mood data...');
      if (isAuthenticated) {
        loadTodayMood();
      }
    };
    
    // Listen for daily reset events
    const handleDailyReset = () => {
      console.log('MoodTrackingScreen - Daily reset detected, refreshing mood data...');
      setExistingMood(null);
      setIsEditMode(false);
      if (isAuthenticated) {
        loadTodayMood();
      }
    };
    
    // Add event listeners
    eventEmitter.on('moodLogged', handleMoodLogged);
    eventEmitter.on('dailyReset', handleDailyReset);
    
    return () => {
      // Remove event listeners
      eventEmitter.off('moodLogged', handleMoodLogged);
      eventEmitter.off('dailyReset', handleDailyReset);
      if (networkStatusManager && typeof networkStatusManager.removeListener === 'function') {
        networkStatusManager.removeListener(handleNetworkChange);
      }
    };
  }, [isAuthenticated]);

  // Remove automatic focus refresh - manual refresh only
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     if (isAuthenticated) {
  //       loadTodayMood();
  //     }
  //   });

  //   return unsubscribe;
  // }, [navigation, isAuthenticated]);

  const loadTodayMood = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      
      // Try to load data with individual error handling
      let todayResponse = null;
      let historyResponse = null;
      
      try {
        todayResponse = await apiService.getTodayMood();
        console.log("Today mood response:", todayResponse);
      } catch (error) {
        console.warn("Failed to load today's mood:", error);
        todayResponse = { success: false, message: (error as Error).message || 'Unknown error' };
      }
      
      try {
        historyResponse = await apiService.getMoodTracker({ period: "7" });
        console.log("Mood history response:", historyResponse);
      } catch (error) {
        console.warn("Failed to load mood history:", error);
        historyResponse = { success: false, message: (error as Error).message || 'Unknown error' };
      }
      
      // Handle today's mood data
      if (todayResponse && todayResponse.success && todayResponse.data && todayResponse.data.hasEntry) {
        // The API only returns a flag, not actual mood data
        // We'll get the actual mood data from the history response
        setIsEditMode(true);
      } else {
        setIsEditMode(false);
      }

      // Handle mood history data
      if (historyResponse && historyResponse.success && historyResponse.data) {
        setMoodHistory(historyResponse.data);
        
        // Check if there's an entry for today
        const today = getTodayDate();
        const todayEntry = historyResponse.data.entries && 
          historyResponse.data.entries.find((entry: any) => entry.tracking_date === today);
        setHasTodayEntry(!!todayEntry);
        
        // If there's a today entry, use it as existingMood
        if (todayEntry) {
          setExistingMood(todayEntry);
          setIsEditMode(true);
        }
        
        // Calculate mood score based on API data (1-10 scale) converted to display scale (0-100)
        const mostCommonMood = historyResponse.data.most_common_mood;
        const averageMoodScore = historyResponse.data.average_mood_score;
        
        // Only set score if there's actual mood data
        if (mostCommonMood && historyResponse.data.total_entries > 0) {
          // Convert from API scale (1-10) to display scale (0-100)
          const score = Math.round(averageMoodScore * 10);
          setMoodScore(score);
        } else {
          setMoodScore(0); // No data available
        }
      } else {
        // Set default values if history fails
        setMoodHistory(null);
        setMoodScore(0); // No data available instead of default 60
        setHasTodayEntry(false);
        setError("Unable to load mood history. You can still log your mood today.");
      }
      
    } catch (error) {
      console.error("Error loading mood data:", error);
      setIsEditMode(false);
      setMoodHistory(null);
      setMoodScore(0); // No data available instead of default 60
      setHasTodayEntry(false);
      setError("Failed to load mood data. Please check your connection and try again.");
    } finally {
      setIsLoadingData(false);
    }
  };



  if (isLoadingData) {
    return (
      <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E22345" />
            <Text style={styles.loadingText}>Loading mood data...</Text>
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
         
          {/* Network Status */}
          {!networkStatus.isConnected && (
            <View style={styles.errorContainer}>
              <View style={[styles.errorCard, styles.offlineCard]}>
                <Icon name="wifi-off" size={20} color="#F59E0B" />
                <Text style={[styles.errorText, styles.offlineText]}>
                  Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia.
                </Text>
              </View>
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <View style={styles.errorCard}>
                <Icon name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadTodayMood}
                  disabled={!networkStatus.isConnected}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mood Score & History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Mood Overview</Text>
            
            {/* Mood Score Card - Only show when there's mood history */}
            {moodScore > 0 && moodHistory && moodHistory.total_entries > 0 && (
              <View style={styles.moodScoreCard}>
                <View style={styles.moodScoreHeader}>
                  <Icon name="brain" size={24} color="#8B5CF6" />
                  <Text style={styles.moodScoreTitle}>Mental Wellness Score</Text>
                </View>
                <View style={styles.moodScoreContent}>
                  <Text style={styles.moodScoreValue}>{moodScore}</Text>
                  <Text style={styles.moodScoreLabel}>out of 100</Text>
                </View>
                <Text style={styles.moodScoreDescription}>
                  Based on your mood tracking over the past 7 days
                </Text>
              </View>
            )}

            {/* Mood History */}
            {moodHistory && moodHistory.total_entries > 0 && (
              <View style={styles.moodHistoryCard}>
                <View style={styles.moodHistoryHeader}>
                  <Icon name="history" size={20} color="#6B7280" />
                  <Text style={styles.moodHistoryTitle}>Mood History</Text>
                  <Text style={styles.moodHistorySubtitle}>{moodHistory.total_entries} entries</Text>
                </View>
                
                {/* Recent Mood Entries - Simplified */}
                {moodHistory.entries && moodHistory.entries.length > 0 && (
                  <View style={styles.recentMoodContainer}>
                    {moodHistory.entries.slice(0, 5).map((entry: any, index: number) => (
                      <View key={index} style={styles.moodHistoryEntry}>
                        <Text style={styles.moodHistoryEmoji}>
                          {moods.find(m => m.id === entry.mood_level)?.emoji || '😐'}
                        </Text>
                        <Text style={styles.moodHistoryDate}>
                          {new Date(entry.tracking_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* No History Message */}
            {(!moodHistory || moodHistory.total_entries === 0) && (
              <View style={styles.noHistoryCard}>
                <Icon name="emoticon-outline" size={32} color="#9CA3AF" />
                <Text style={styles.noHistoryTitle}>No Mood History Yet</Text>
                <Text style={styles.noHistoryDescription}>
                  Start tracking your mood to see your mental wellness progress
                </Text>
              </View>
            )}
          </View>

          {/* Today's Mood Status */}
          {existingMood && existingMood.mood_level && (
            <View style={styles.statusContainer}>
              <View style={styles.statusCard}>
                <Icon name="calendar-check" size={20} color="#10B981" />
                <Text style={styles.statusText}>
                  {isEditMode ? "Today's mood recorded" : "Mood already logged today"}
                </Text>
              </View>
            </View>
          )}

          {/* Mood Input Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.moodInputButton,
                !networkStatus.isConnected && styles.moodInputButtonDisabled
              ]}
              onPress={() => {
                if (hasTodayEntry || (existingMood && existingMood.mood_level)) {
                  navigation.navigate('MoodInput', {
                    isEditMode: true,
                    existingMood: existingMood
                  });
                } else {
                  navigation.navigate('MoodInput', {
                    isEditMode: false
                  });
                }
              }}
              disabled={!networkStatus.isConnected}
            >
              <LinearGradient
                colors={(hasTodayEntry || (existingMood && existingMood.mood_level)) ? ["#8B5CF6", "#7C3AED"] : ["#E22345", "#B71C1C"]}
                style={styles.moodInputButtonGradient}
              >
                <Icon name={(hasTodayEntry || (existingMood && existingMood.mood_level)) ? "pencil" : "plus"} size={24} color="#FFFFFF" />
                <Text style={styles.moodInputButtonText}>
                  {(hasTodayEntry || (existingMood && existingMood.mood_level)) ? "Update Your Mood" : "Log Your Mood"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Wellness Activities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Wellness Activities</Text>
            <View style={styles.activitiesGrid}>
              {wellnessActivities.map((activity) => (
                <TouchableOpacity key={activity.id} style={styles.activityCard}>
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: activity.color + "20" },
                    ]}
                  >
                    <Icon
                      name={activity.icon}
                      size={24}
                      color={activity.color}
                    />
                  </View>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                  <View style={styles.activityDuration}>
                    <Icon name="clock-outline" size={14} color="#6B7280" />
                    <Text style={styles.activityDurationText}>
                      {activity.duration}
                    </Text>
                  </View>
                </TouchableOpacity>
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
  headerRight: {
    width: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  moodCard: {
    width: (width - 60) / 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodCardSelected: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  stressLevelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  stressLevelCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  stressLevelCardSelected: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  stressLevelIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  stressLevelLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  activityCard: {
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
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 18,
  },
  activityDuration: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityDurationText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#1F2937",
    fontSize: 16,
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
  },
  // Mood Score & History Styles
  moodScoreCard: {
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
    borderColor: "#E2E8F0",
  },
  moodScoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  moodScoreTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 12,
  },
  moodScoreContent: {
    alignItems: "center",
    marginBottom: 12,
  },
  moodScoreValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#8B5CF6",
    lineHeight: 56,
  },
  moodScoreLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  moodScoreDescription: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  moodHistoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  moodHistoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  moodHistoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  moodHistorySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  moodHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  moodHistoryLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  moodHistoryValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  moodHistoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodHistoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  moodHistoryValueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  // Simplified Mood History Styles
  recentMoodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  moodHistoryEntry: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    minWidth: 50,
  },
  moodHistoryDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 4,
  },
  moodDistributionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moodDistributionItem: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
    minWidth: 50,
  },
  moodDistributionEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  moodDistributionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  // Recent Entries Styles
  recentEntriesContainer: {
    marginTop: 8,
  },
  recentEntryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 6,
  },
  recentEntryDate: {
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  recentEntryDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  recentEntryMood: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recentEntryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  recentEntryMoodText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  recentEntryStress: {
    marginLeft: 8,
  },
  recentEntryStressText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  // Error Display Styles
  errorContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#991B1B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#EF4444",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  offlineCard: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
  },
  offlineText: {
    color: "#92400E",
  },
  noHistoryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  noHistoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 8,
  },
  noHistoryDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  // Mood Input Button Styles
  moodInputButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  moodInputButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  moodInputButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  moodInputButtonDisabled: {
    opacity: 0.5,
  },
});

export default MoodTrackingScreen;
