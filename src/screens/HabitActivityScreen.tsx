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
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';

import api from '../services/api';
import { handleAuthError, handleError } from '../utils/errorHandler';
import eventEmitter from '../utils/eventEmitter';
import SimpleDatePicker from '../components/SimpleDatePicker';

interface HabitActivity {
  id: number;
  title: string;
  description: string;
  category: string;
  habit_type: string;
  target_frequency: number;
  unit: string;
  duration_minutes: number;
  difficulty: string;
  points: number;
  is_active: boolean;
  status?: 'completed' | 'available';
  current_frequency?: number;
  user_target_frequency?: number;
}

interface UserHabitActivity {
  id: number;
  user_id: number;
  activity_id: number;
  activity_date: string;
  habit_type: string;
  target_frequency: number;
  current_frequency: number;
  unit: string;
  points_earned: number;
  notes: string;
  completed_at: string;
  created_at: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  base_points: number;
  status: 'completed' | 'in_progress';
}

const HabitActivityScreen = ({ navigation }: any) => {
  const { isAuthenticated, user } = useAuth();

  const [habitActivities, setHabitActivities] = useState<HabitActivity[]>([]);
  const [userActivities, setUserActivities] = useState<UserHabitActivity[]>([]);
  const [isLoadingHabits, setIsLoadingHabits] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'habits' | 'history'>('habits');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Date filter state for activity history
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal state for habit completion
  const [selectedHabit, setSelectedHabit] = useState<HabitActivity | null>(null);
  const [frequency, setFrequency] = useState('1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const categories = [
    { id: '', name: 'Semua', icon: 'view-grid', color: '#6B7280' },
    { id: 'dietary', name: 'Dietary', icon: 'food-apple', color: '#10B981' },
    { id: 'spiritual', name: 'Spiritual', icon: 'heart', color: '#8B5CF6' },
    { id: 'physical', name: 'Physical', icon: 'dumbbell', color: '#EF4444' },
    { id: 'mental', name: 'Mental', icon: 'brain', color: '#F59E0B' },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'home', color: '#3B82F6' },
  ];

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return '#6B7280';
    
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // Load habit activities
  const loadHabitActivities = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingHabits(true);
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await api.getHabitActivities(params);
      if (response.success) {
        setHabitActivities(response.data || []);
      }
    } catch (error) {
      handleError(error, { title: 'Failed to load habit activities' });
    } finally {
      setIsLoadingHabits(false);
    }
  };

  // Load user activity history
  const loadUserActivityHistory = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingHistory(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await api.getHabitHistory(dateStr, selectedCategory);
      if (response.success) {
        setUserActivities(response.data || []);
      }
    } catch (error) {
      handleError(error, { title: 'Failed to load activity history' });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Complete a habit
  const completeHabit = async () => {
    if (!selectedHabit || !isAuthenticated) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.completeHabitActivity({
        activity_id: selectedHabit.id,
        frequency: parseInt(frequency),
        notes: notes.trim(),
      });
      
      if (response.success) {
        Alert.alert('Success', 'Habit completed successfully!');
        setShowCompletionModal(false);
        setSelectedHabit(null);
        setFrequency('1');
        setNotes('');
        
        // Refresh data
        await loadHabitActivities();
        if (activeTab === 'history') {
          await loadUserActivityHistory();
        }
        
        // Emit event for real-time updates
        eventEmitter.emit('habitCompleted', response.data);
      }
    } catch (error) {
      handleError(error, { title: 'Failed to complete habit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle habit selection
  const handleHabitPress = (habit: HabitActivity) => {
    setSelectedHabit(habit);
    setFrequency(habit.current_frequency?.toString() || '1');
    setNotes('');
    setShowCompletionModal(true);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Handle tab change
  const handleTabChange = (tab: 'habits' | 'history') => {
    setActiveTab(tab);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'habits') {
      await loadHabitActivities();
    } else {
      await loadUserActivityHistory();
    }
    setRefreshing(false);
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'habits') {
        loadHabitActivities();
      } else {
        loadUserActivityHistory();
      }
    }
  }, [isAuthenticated, activeTab, selectedCategory, selectedDate]);

  // Render habit item
  const renderHabitItem = ({ item }: { item: HabitActivity }) => {
    const isCompleted = item.status === 'completed';
    const progress = item.current_frequency || 0;
    const target = item.target_frequency;
    const progressPercentage = Math.min((progress / target) * 100, 100);
    
    const categoryInfo = categories.find(cat => cat.id === item.category);
    
    return (
      <TouchableOpacity
        style={[
          styles.habitActivityCard,
          isCompleted && styles.habitActivityCardDisabled
        ]}
        onPress={() => !isCompleted && handleHabitPress(item)}
        disabled={isCompleted}
      >
        <View style={styles.habitActivityIcon}>
          <Icon 
            name={isCompleted ? "check-circle" : categoryInfo?.icon || "heart-pulse"} 
            size={24} 
            color={isCompleted ? "#9CA3AF" : categoryInfo?.color || "#10B981"} 
          />
        </View>
        <View style={styles.habitActivityInfo}>
          <Text style={[
            styles.habitActivityTitle,
            isCompleted && styles.habitActivityTitleDisabled
          ]}>
            {item.title}
          </Text>
          <Text style={[
            styles.habitActivityDescription,
            isCompleted && styles.habitActivityDescriptionDisabled
          ]}>
            {item.description}
          </Text>
          <View style={styles.habitActivityStats}>
            <Text style={[
              styles.habitActivityStat,
              isCompleted && styles.habitActivityStatDisabled
            ]}>
              {progress}/{target} {item.unit}
            </Text>
            <Text style={[
              styles.habitActivityStat,
              isCompleted && styles.habitActivityStatDisabled
            ]}>•</Text>
            <Text style={[
              styles.habitActivityStat,
              isCompleted && styles.habitActivityStatDisabled
            ]}>
              {item.points} points
            </Text>
            <Text style={[
              styles.habitActivityStat,
              isCompleted && styles.habitActivityStatDisabled
            ]}>•</Text>
            <Text style={[
              styles.habitActivityStat,
              isCompleted && styles.habitActivityStatDisabled
            ]}>
              {item.difficulty}
            </Text>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>Selesai Hari Ini</Text>
            </View>
          )}
        </View>
        <Icon 
          name={isCompleted ? "check" : "chevron-right"} 
          size={20} 
          color={isCompleted ? "#9CA3AF" : "#9CA3AF"} 
        />
      </TouchableOpacity>
    );
  };

  // Render history item
  const renderUserActivity = ({ item }: { item: UserHabitActivity }) => {
    const categoryInfo = categories.find(cat => cat.id === item.category);
    
    return (
      <View style={styles.userActivityCard}>
        {/* Header with Title, Date, Points, and Delete Button */}
        <View style={styles.userActivityHeader}>
          <View style={styles.userActivityIconContainer}>
            <Icon name="check-circle" size={20} color="#10B981" />
          </View>
          <View style={styles.userActivityInfo}>
            <Text style={styles.userActivityTitle}>{item.title}</Text>
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
          <Text style={styles.userActivityDescription}>{item.description}</Text>
          <View style={styles.userActivityStats}>
            <View style={styles.userActivityStatItem}>
              <Icon name="target" size={14} color="#6B7280" />
              <Text style={styles.userActivityStat}>
                {item.current_frequency}/{item.target_frequency} {item.unit}
              </Text>
            </View>
            <View style={styles.userActivityStatItem}>
              <Icon name="fire" size={14} color="#6B7280" />
              <Text style={styles.userActivityStat}>{item.base_points || 0} base points</Text>
            </View>
          </View>
          {item.notes && (
            <View style={styles.userActivityNotesContainer}>
              <Icon name="note-text" size={14} color="#6B7280" />
              <Text style={styles.userActivityNotes}>{item.notes}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FAFBFC', '#F7FAFC']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Icon name="format-list-checks" size={28} color="#10B981" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greetingText}>Aktivitas Habit</Text>
            <Text style={styles.subtitleText}>
              {isAuthenticated ? "Lacak habit harian Anda dan raih poin!" : "Masuk untuk melacak habit harian Anda"}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      {isAuthenticated && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'habits' && styles.activeTabButton]}
            onPress={() => handleTabChange('habits')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'habits' && styles.activeTabButtonText]}>
              Habit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
            onPress={() => handleTabChange('history')}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'habits' ? (
          <>
            {/* Category Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter Kategori</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
                contentContainerStyle={styles.categoryContent}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.selectedCategory
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <Icon 
                      name={category.icon} 
                      size={16} 
                      color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
                    />
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Habit Activities List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pilih Habit Harian</Text>
              {isLoadingHabits ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingIconContainer}>
                    <Icon name="loading" size={32} color="#10B981" />
                  </View>
                  <Text style={styles.loadingText}>Memuat habit activities...</Text>
                </View>
              ) : (
                <FlatList
                  data={habitActivities}
                  renderItem={renderHabitItem}
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
                  <Text style={styles.loginButtonText}>Masuk untuk Memulai</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        ) : (
          /* History Tab */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Habit</Text>
            
            {/* Date Picker for Activity History */}
            <View style={styles.dateFilterContainer}>
              <Text style={styles.dateFilterLabel}>Filter berdasarkan Tanggal Aktivitas:</Text>
              <SimpleDatePicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                title="Pilih Tanggal Aktivitas"
                variant="light"
              />
            </View>
            
            {/* Category Filter for History */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter Kategori</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
                contentContainerStyle={styles.categoryContent}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.selectedCategory
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <Icon 
                      name={category.icon} 
                      size={16} 
                      color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
                    />
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
                    <Text style={styles.historySummarySubtitle}>Habit</Text>
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
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyHistoryContainer}>
                <View style={styles.emptyHistoryIconContainer}>
                  <Icon name="history" size={48} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyHistoryText}>Belum ada riwayat habit</Text>
                <Text style={styles.emptyHistorySubtext}>Mulai lakukan habit harian untuk melihat riwayat Anda</Text>
                <TouchableOpacity
                  style={styles.emptyHistoryButton}
                  onPress={() => setActiveTab('habits')}
                >
                  <Text style={styles.emptyHistoryButtonText}>Mulai Habit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Habit</Text>
              <TouchableOpacity
                onPress={() => setShowCompletionModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedHabit && (
              <>
                <Text style={styles.modalHabitTitle}>{selectedHabit.title}</Text>
                <Text style={styles.modalHabitDescription}>{selectedHabit.description}</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Frequency</Text>
                  <TextInput
                    style={styles.input}
                    value={frequency}
                    onChangeText={setFrequency}
                    keyboardType="numeric"
                    placeholder="Enter frequency"
                  />
                  <Text style={styles.inputUnit}>/ {selectedHabit.target_frequency} {selectedHabit.unit}</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Notes (optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add notes about your completion..."
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowCompletionModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.completeButton, isSubmitting && styles.disabledButton]}
                    onPress={completeHabit}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.completeButtonText}>
                      {isSubmitting ? 'Completing...' : 'Complete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  categoryContainer: {
    marginBottom: 15,
  },
  categoryContent: {
    paddingHorizontal: 0,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCategory: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
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
  // Habit Activity Styles
  habitActivityCard: {
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
  habitActivityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#E0F2F7",
  },
  habitActivityInfo: {
    flex: 1,
  },
  habitActivityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  habitActivityDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  habitActivityStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  habitActivityStat: {
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
  habitActivityCardDisabled: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  habitActivityTitleDisabled: {
    color: "#9CA3AF",
  },
  habitActivityDescriptionDisabled: {
    color: "#D1D5DB",
  },
  habitActivityStatDisabled: {
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalHabitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalHabitDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  completeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});

export default HabitActivityScreen;
