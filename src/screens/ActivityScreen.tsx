import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { handleAuthError } from '../utils/errorHandler';

interface WellnessActivity {
  id: number;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  difficulty: string;
  points: number;
  calories_burn?: number;
  instructions?: string;
  is_active: boolean;
}

interface UserWellnessActivity {
  id: number;
  user_id: number;
  activity_id: number;
  duration_minutes: number;
  notes?: string;
  points_earned: number;
  completed_at: string;
  activity_title: string;
  activity_description: string;
  activity_category: string;
  activity_difficulty: string;
  activity_points: number;
  activity_calories_burn?: number;
}

const ActivityScreen = ({ navigation }: any) => {
  const { isAuthenticated } = useAuth();
  const [wellnessActivities, setWellnessActivities] = useState<WellnessActivity[]>([]);
  const [userActivities, setUserActivities] = useState<UserWellnessActivity[]>([]);
  const [isLoadingWellness, setIsLoadingWellness] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'activities' | 'history'>('activities');

  // Load wellness activities
  useEffect(() => {
    loadWellnessActivities();
    if (isAuthenticated) {
      loadUserActivityHistory();
    }
  }, [isAuthenticated]);

  const loadWellnessActivities = async () => {
    try {
      setIsLoadingWellness(true);
      const response = await api.getWellnessActivities();
      if (response.success) {
        setWellnessActivities(response.data || []);
      }
    } catch (error) {
      console.error('Error loading wellness activities:', error);
    } finally {
      setIsLoadingWellness(false);
    }
  };

  const loadUserActivityHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await api.getWellnessActivityHistory({ period: 30 });
      if (response.success) {
        setUserActivities(response.data || []);
      }
    } catch (error) {
      console.error('Error loading user activity history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleWellnessActivitySelect = (activity: WellnessActivity) => {
    // Navigate to detail screen
    navigation.navigate('WellnessActivityDetail', { activity });
  };

  const renderWellnessActivity = ({ item }: { item: WellnessActivity }) => (
    <TouchableOpacity
      style={styles.wellnessActivityCard}
      onPress={() => handleWellnessActivitySelect(item)}
    >
      <View style={styles.wellnessActivityIcon}>
        <Icon name="heart-pulse" size={24} color="#10B981" />
      </View>
      <View style={styles.wellnessActivityInfo}>
        <Text style={styles.wellnessActivityTitle}>{item.title}</Text>
        <Text style={styles.wellnessActivityDescription}>{item.description}</Text>
        <View style={styles.wellnessActivityStats}>
          <Text style={styles.wellnessActivityStat}>{item.duration_minutes} min</Text>
          <Text style={styles.wellnessActivityStat}>•</Text>
          <Text style={styles.wellnessActivityStat}>{item.points} points</Text>
          <Text style={styles.wellnessActivityStat}>•</Text>
          <Text style={styles.wellnessActivityStat}>{item.difficulty}</Text>
          {item.calories_burn && (
            <>
              <Text style={styles.wellnessActivityStat}>•</Text>
              <Text style={styles.wellnessActivityStat}>{item.calories_burn} cal</Text>
            </>
          )}
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderUserActivity = ({ item }: { item: UserWellnessActivity }) => (
    <View style={styles.userActivityCard}>
      <View style={styles.userActivityHeader}>
        <Icon name="check-circle" size={20} color="#10B981" />
        <Text style={styles.userActivityTitle}>{item.activity_title}</Text>
        <Text style={styles.userActivityDate}>
          {new Date(item.completed_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.userActivityDetails}>
        <Text style={styles.userActivityDescription}>{item.activity_description}</Text>
        <View style={styles.userActivityStats}>
          <Text style={styles.userActivityStat}>{item.duration_minutes} min</Text>
          <Text style={styles.userActivityStat}>•</Text>
          <Text style={styles.userActivityStat}>{item.points_earned} points earned</Text>
          <Text style={styles.userActivityStat}>•</Text>
          <Text style={styles.userActivityStat}>{item.activity_difficulty}</Text>
        </View>
        {item.notes && (
          <Text style={styles.userActivityNotes}>Notes: {item.notes}</Text>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#FAFBFC', '#F7FAFC']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Icon name="heart-pulse" size={28} color="#10B981" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greetingText}>Wellness Activity</Text>
            <Text style={styles.subtitleText}>
              {isAuthenticated ? "Pilih dan selesaikan aktivitas wellness Anda" : "Login untuk memulai"}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      {isAuthenticated && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'activities' && styles.activeTabButton]}
            onPress={() => setActiveTab('activities')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'activities' && styles.activeTabButtonText]}>
              Activities
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'history' && styles.activeTabButtonText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'activities' ? (
          <>
            {/* Wellness Activities List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pilih Aktivitas Wellness</Text>
              {isLoadingWellness ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading wellness activities...</Text>
                </View>
              ) : (
                <FlatList
                  data={wellnessActivities}
                  renderItem={renderWellnessActivity}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>

            {/* Login Button for Non-Authenticated Users */}
            {!isAuthenticated && (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate("Login")}
              >
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  style={styles.loginGradient}
                >
                  <Text style={styles.loginButtonText}>Login untuk Memulai</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        ) : (
          /* History Tab */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Aktivitas Wellness</Text>
            {isLoadingHistory ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading activity history...</Text>
              </View>
            ) : userActivities.length > 0 ? (
              <FlatList
                data={userActivities}
                renderItem={renderUserActivity}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyHistoryContainer}>
                <Icon name="history" size={48} color="#9CA3AF" />
                <Text style={styles.emptyHistoryText}>Belum ada aktivitas wellness yang diselesaikan</Text>
                <Text style={styles.emptyHistorySubtext}>Mulai aktivitas wellness pertama Anda!</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#E0F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabButtonText: {
    color: "#FFFFFF",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  loginButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Wellness Activity Styles
  wellnessActivityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wellnessActivityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#E0F2F7",
  },
  wellnessActivityInfo: {
    flex: 1,
  },
  wellnessActivityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  wellnessActivityDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  wellnessActivityStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  wellnessActivityStat: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 8,
  },
  // User Activity Styles
  userActivityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userActivityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userActivityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  userActivityDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  userActivityDetails: {
    marginTop: 8,
  },
  userActivityDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  userActivityStats: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  userActivityStat: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 8,
  },
  userActivityNotes: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyHistoryContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
});

export default ActivityScreen; 