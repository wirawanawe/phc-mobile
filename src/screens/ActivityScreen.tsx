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
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';

import api from '../services/api';
import { handleAuthError, handleError } from '../utils/errorHandler';
import eventEmitter from '../utils/eventEmitter';
import SimpleDatePicker from '../components/SimpleDatePicker';

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
  activity_date?: string;
  // API returns these field names
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  activity_duration: number;
  is_active: boolean;
}

const ActivityScreen = ({ navigation }: any) => {
  const { isAuthenticated, user } = useAuth();

  const [wellnessActivities, setWellnessActivities] = useState<WellnessActivity[]>([]);
  const [userActivities, setUserActivities] = useState<UserWellnessActivity[]>([]);
  const [isLoadingWellness, setIsLoadingWellness] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'activities' | 'history'>('activities');
  
  // Date filter state for activity history
  const [selectedDate, setSelectedDate] = useState(new Date());


  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return '#6B7280';
    
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // Load wellness activities
  useEffect(() => {
    loadWellnessActivities();
    if (isAuthenticated) {
      loadUserActivityHistory();
    }
  }, [isAuthenticated]);

  // Load history when selected date changes
  useEffect(() => {
    if (isAuthenticated && activeTab === 'history') {
      loadUserActivityHistory();
    }
  }, [selectedDate, isAuthenticated, activeTab]);

  // Listen for wellness activity events
  useEffect(() => {
    const handleWellnessActivityCompleted = () => {
      console.log('ActivityScreen - Wellness activity completed, refreshing data...');
      loadWellnessActivities();
      if (isAuthenticated) {
        loadUserActivityHistory();
      }
    };

    const handleWellnessActivityUpdated = () => {
      console.log('ActivityScreen - Wellness activity updated, refreshing data...');
      loadWellnessActivities();
      if (isAuthenticated) {
        loadUserActivityHistory();
      }
    };

    const handleWellnessActivityDeleted = () => {
      console.log('ActivityScreen - Wellness activity deleted, refreshing data...');
      loadWellnessActivities();
      if (isAuthenticated) {
        loadUserActivityHistory();
      }
    };

    const handleWellnessActivityReset = () => {
      console.log('ActivityScreen - Wellness activity reset detected, refreshing data...');
      loadWellnessActivities();
      if (isAuthenticated) {
        loadUserActivityHistory();
      }
    };

    const handleDataRefresh = () => {
      console.log('ActivityScreen - Data refresh event, refreshing data...');
      loadWellnessActivities();
      if (isAuthenticated) {
        loadUserActivityHistory();
      }
    };

    // Add event listeners
    eventEmitter.on('wellnessActivityCompleted', handleWellnessActivityCompleted);
    eventEmitter.on('wellnessActivityUpdated', handleWellnessActivityUpdated);
    eventEmitter.on('wellnessActivityDeleted', handleWellnessActivityDeleted);
    eventEmitter.on('wellnessActivityReset', handleWellnessActivityReset);
    eventEmitter.on('dataRefresh', handleDataRefresh);

    return () => {
      // Remove event listeners
      eventEmitter.off('wellnessActivityCompleted', handleWellnessActivityCompleted);
      eventEmitter.off('wellnessActivityUpdated', handleWellnessActivityUpdated);
      eventEmitter.off('wellnessActivityDeleted', handleWellnessActivityDeleted);
      eventEmitter.off('wellnessActivityReset', handleWellnessActivityReset);
      eventEmitter.off('dataRefresh', handleDataRefresh);
    };
  }, [isAuthenticated]);

  // Remove automatic focus refresh - manual refresh only
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     if (isAuthenticated) {
  //       loadUserActivityHistory();
  //     }
  //   });

  //   return unsubscribe;
  // }, [navigation, isAuthenticated]);

  const loadWellnessActivities = async () => {
    try {
      setIsLoadingWellness(true);
      console.log('🔄 Loading wellness activities...');
      const response = await api.getWellnessActivities();
      console.log('📊 Wellness activities response:', response);
      
      if (response.success) {
        console.log('✅ Wellness activities loaded successfully:', response.data?.length || 0, 'activities');
        setWellnessActivities(response.data || []);
      } else {
        console.warn('❌ Wellness activities response not successful:', response.message);
        setWellnessActivities([]);
      }
    } catch (error) {
      console.error('❌ Error loading wellness activities:', error);
      handleError(error, {
        title: 'Error Loading Activities',
        showAlert: false
      });
      setWellnessActivities([]);
    } finally {
      setIsLoadingWellness(false);
    }
  };

  const handleDateChange = (date: Date) => {

    setSelectedDate(date);
  };

  const loadUserActivityHistory = async () => {
    try {
      setIsLoadingHistory(true);
      // Format the selected date to YYYY-MM-DD
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await api.getWellnessActivityHistory({ 
        period: 30,
        date: dateString 
      });
      if (response.success) {
        setUserActivities(response.data || []);
      }
    } catch (error) {
      console.error('Error loading user activity history:', error);
      handleError(error, {
        title: 'Error Loading History',
        showAlert: false
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleWellnessActivitySelect = (activity: WellnessActivity) => {
    navigation.navigate('WellnessActivityCompletion', { activity });
  };

  const handleDeleteActivity = async (activityId: number) => {
    Alert.alert(
      'Hapus Aktivitas',
      'Apakah Anda yakin ingin menghapus aktivitas ini dari riwayat?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.resetWellnessActivities(activityId as any);
              if (response.success) {
                // Emit event to refresh all related data
                eventEmitter.emitWellnessActivityDeleted();
                eventEmitter.emitDataRefresh();
                
                // Reload history after deletion
                loadUserActivityHistory();
                Alert.alert('Berhasil', 'Aktivitas berhasil dihapus dari riwayat');
              } else {
                Alert.alert('Error', response.message || 'Gagal menghapus aktivitas');
              }
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Gagal menghapus aktivitas');
            }
          },
        },
      ]
    );
  };




  const renderWellnessActivity = ({ item }: { item: WellnessActivity }) => {
    // Check if this activity is already completed today
    const isCompletedToday = userActivities.some(
      userActivity => userActivity.activity_id === item.id && 
      new Date(userActivity.activity_date || userActivity.completed_at).toDateString() === new Date().toDateString()
    );

    return (
      <TouchableOpacity
        style={[
          styles.wellnessActivityCard,
          isCompletedToday && styles.wellnessActivityCardDisabled
        ]}
        onPress={() => !isCompletedToday && handleWellnessActivitySelect(item)}
        disabled={isCompletedToday}
      >
        <View style={styles.wellnessActivityIcon}>
          <Icon 
            name={isCompletedToday ? "check-circle" : "heart-pulse"} 
            size={24} 
            color={isCompletedToday ? "#9CA3AF" : "#10B981"} 
          />
        </View>
        <View style={styles.wellnessActivityInfo}>
          <Text style={[
            styles.wellnessActivityTitle,
            isCompletedToday && styles.wellnessActivityTitleDisabled
          ]}>
            {item.title || ''}
          </Text>
          <Text style={[
            styles.wellnessActivityDescription,
            isCompletedToday && styles.wellnessActivityDescriptionDisabled
          ]}>
            {item.description || ''}
          </Text>
          <View style={styles.wellnessActivityStats}>
            <Text style={[
              styles.wellnessActivityStat,
              isCompletedToday && styles.wellnessActivityStatDisabled
            ]}>
              {item.duration_minutes || 0} min
            </Text>
            <Text style={[
              styles.wellnessActivityStat,
              isCompletedToday && styles.wellnessActivityStatDisabled
            ]}>•</Text>
            <Text style={[
              styles.wellnessActivityStat,
              isCompletedToday && styles.wellnessActivityStatDisabled
            ]}>
              {item.points || 0} points
            </Text>
            <Text style={[
              styles.wellnessActivityStat,
              isCompletedToday && styles.wellnessActivityStatDisabled
            ]}>•</Text>
            <Text style={[
              styles.wellnessActivityStat,
              isCompletedToday && styles.wellnessActivityStatDisabled
            ]}>
              {item.difficulty || ''}
            </Text>
          </View>
          {isCompletedToday && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>Selesai Hari Ini</Text>
            </View>
          )}
        </View>
        <Icon 
          name={isCompletedToday ? "check" : "chevron-right"} 
          size={20} 
          color={isCompletedToday ? "#9CA3AF" : "#9CA3AF"} 
        />
      </TouchableOpacity>
    );
  };

  const renderUserActivity = ({ item }: { item: UserWellnessActivity }) => (
    <View style={styles.userActivityCard}>
      {/* Header with Title, Date, Points, and Delete Button */}
      <View style={styles.userActivityHeader}>
        <View style={styles.userActivityIconContainer}>
          <Icon name="check-circle" size={20} color="#10B981" />
        </View>
        <View style={styles.userActivityInfo}>
          <Text style={styles.userActivityTitle}>{item.title || ''}</Text>
          <Text style={styles.userActivityDate}>
            {new Date(item.completed_at).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={styles.userActivityPoints}>
          <Icon name="star" size={16} color="#FFFFFF" />
          <Text style={styles.userActivityPointsText}>+{parseInt(String(item.points_earned)) || 0}</Text>
          <Text style={styles.userActivityPointsLabel}>points</Text>
        </View>
        <View style={styles.userActivityActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteActivity(item.id)}
          >
            <Icon name="delete" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Activity Level Badge */}
      {item.difficulty && (
        <View style={styles.userActivityLevelContainer}>
          <View style={[
            styles.userActivityLevelBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) }
          ]}>
            <Icon name="star" size={12} color="#FFFFFF" />
            <Text style={styles.userActivityLevelText}>
              Level {item.difficulty}
            </Text>
          </View>
        </View>
      )}

      {/* Activity Details */}
      <View style={styles.userActivityDetails}>
        <Text style={styles.userActivityDescription}>{item.description || ''}</Text>
        <View style={styles.userActivityStats}>
          {item.activity_duration && (
            <View style={styles.userActivityStatItem}>
              <Icon name="clock-outline" size={14} color="#6B7280" />
              <Text style={styles.userActivityStat}>{item.activity_duration || 0} min</Text>
            </View>
          )}
          {item.points && (
            <View style={styles.userActivityStatItem}>
              <Icon name="fire" size={14} color="#6B7280" />
              <Text style={styles.userActivityStat}>{item.points || 0} base points</Text>
            </View>
          )}
        </View>
        {item.notes && (
          <View style={styles.userActivityNotesContainer}>
            <Icon name="note-text" size={14} color="#6B7280" />
            <Text style={styles.userActivityNotes}>{item.notes || ''}</Text>
          </View>
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
            <Text style={styles.greetingText}>Aktivitas Wellness</Text>
            <Text style={styles.subtitleText}>
              {isAuthenticated ? "Lacak aktivitas wellness Anda dan raih poin!" : "Masuk untuk melacak aktivitas wellness Anda"}
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
              Aktivitas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'history' && styles.activeTabButtonText]}>
              Riwayat
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
                <View style={styles.loadingIconContainer}>
                  <Icon name="loading" size={32} color="#10B981" />
                </View>
                <Text style={styles.loadingText}>Memuat aktivitas wellness...</Text>
              </View>
              ) : (
                <FlatList
                  data={wellnessActivities}
                  renderItem={renderWellnessActivity}
                  keyExtractor={(item, index) => `wellness-${item?.id || index}`}
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
                  <Text style={styles.loginButtonText}>Masuk untuk Memulai</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        ) : (
          /* History Tab */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Aktivitas</Text>
            
            {/* Date Picker for Activity History */}
            <View style={styles.dateFilterContainer}>
              <Text style={styles.dateFilterLabel}>Filter berdasarkan Tanggal Aktivitas:</Text>
              <SimpleDatePicker
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                title="Pilih Tanggal Aktivitas"
                variant="light"
              />
            </View>
            
            {/* History Summary */}
            {userActivities.length > 0 && (
              <View style={styles.historySummaryContainer}>
                <View style={styles.historySummaryCard}>
                  <Icon name="star" size={24} color="#10B981" />
                  <View style={styles.historySummaryInfo}>
                    <Text style={styles.historySummaryTitle}>
                      {userActivities.reduce((total, activity) => total + (parseInt(String(activity.points_earned)) || 0), 0)}
                    </Text>
                    <Text style={styles.historySummarySubtitle}>Total Poin</Text>
                  </View>
                </View>
                <View style={styles.historySummaryCard}>
                  <Icon name="calendar-check" size={24} color="#F59E0B" />
                  <View style={styles.historySummaryInfo}>
                    <Text style={styles.historySummaryTitle}>{userActivities.length}</Text>
                    <Text style={styles.historySummarySubtitle}>Aktivitas</Text>
                  </View>
                </View>
              </View>
            )}
            {isLoadingHistory ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingIconContainer}>
                  <Icon name="loading" size={32} color="#10B981" />
                </View>
                <Text style={styles.loadingText}>Memuat riwayat...</Text>
              </View>
            ) : userActivities.length > 0 ? (
              <FlatList
                data={userActivities}
                renderItem={renderUserActivity}
                keyExtractor={(item, index) => `user-activity-${item?.id || item?.activity_id || index}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyHistoryContainer}>
                <View style={styles.emptyHistoryIconContainer}>
                  <Icon name="history" size={48} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyHistoryText}>Belum ada riwayat aktivitas</Text>
                <Text style={styles.emptyHistorySubtext}>Mulai lakukan aktivitas wellness untuk melihat riwayat Anda</Text>
                <TouchableOpacity
                  style={styles.emptyHistoryButton}
                  onPress={() => setActiveTab('activities')}
                >
                  <Text style={styles.emptyHistoryButtonText}>Mulai Aktivitas</Text>
                </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  historySummaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  historySummaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  historySummaryInfo: {
    flex: 1,
  },
  historySummaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  historySummarySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userActivityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  userActivityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userActivityInfo: {
    flex: 1,
  },
  userActivityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  userActivityDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  userActivityPoints: {
    flexDirection: 'row',
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    marginLeft: 'auto',
  },
  userActivityPointsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userActivityPointsLabel: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  userActivityDetails: {
    marginTop: 8,
  },
  userActivityDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  userActivityStats: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  userActivityStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userActivityStat: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  userActivityNotesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    gap: 8,
  },
  userActivityNotes: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    flex: 1,
    lineHeight: 18,
  },
  userActivityLevelContainer: {
    marginBottom: 12,
  },
  userActivityLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  userActivityLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  emptyHistoryContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyHistoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyHistoryText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyHistoryButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyHistoryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  // Disabled activity styles
  wellnessActivityCardDisabled: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  wellnessActivityTitleDisabled: {
    color: "#9CA3AF",
  },
  wellnessActivityDescriptionDisabled: {
    color: "#D1D5DB",
  },
  wellnessActivityStatDisabled: {
    color: "#D1D5DB",
  },
  completedBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Delete button styles
  userActivityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  // Date filter styles
  dateFilterContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateFilterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },


});

export default ActivityScreen; 