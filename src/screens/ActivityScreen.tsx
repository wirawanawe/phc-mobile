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

  // Add missing state variables
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<WellnessActivity | null>(null);
  const [completionData, setCompletionData] = useState<{
    duration: number;
    notes: string;
    activity_type: string;
    mood_before: string;
    mood_after: string;
    stress_level_before: string;
    stress_level_after: string;
  }>({
    duration: 30,
    notes: '',
    activity_type: 'normal',
    mood_before: 'neutral',
    mood_after: 'neutral',
    stress_level_before: 'low',
    stress_level_after: 'low'
  });
  const [calculatedPoints, setCalculatedPoints] = useState(0);

  const activityTypes: Record<string, { name: string; multiplier: number }> = {
    normal: { name: "Normal", multiplier: 1 },
    intense: { name: "Intensif", multiplier: 1.5 },
    relaxed: { name: "Santai", multiplier: 0.8 }
  };

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

  const loadWellnessActivities = async () => {
    try {
      setIsLoadingWellness(true);
      const response = await api.getWellnessActivities();
      if (response.success) {
        setWellnessActivities(response.data || []);
      }
    } catch (error) {
      console.error('Error loading wellness activities:', error);
      handleError(error, {
        title: 'Error Loading Activities',
        showAlert: false
      });
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
      handleError(error, {
        title: 'Error Loading History',
        showAlert: false
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleWellnessActivitySelect = (activity: WellnessActivity) => {
    setSelectedActivity(activity);
    const activityDuration = activity.duration_minutes || 30;
    setCompletionData({
      duration: activityDuration,
      notes: '',
      activity_type: 'normal',
      mood_before: 'neutral',
      mood_after: 'neutral',
      stress_level_before: 'low',
      stress_level_after: 'low'
    });
    // Set initial points based on activity
    const basePoints = activity.points || 0;
    setCalculatedPoints(basePoints);
    setShowCompletionModal(true);
  };

  // Update calculated points when activity type or duration changes
  useEffect(() => {
    if (selectedActivity) {
      const activityType = activityTypes[completionData.activity_type];
      const basePoints = selectedActivity.points || 0;
      const activityDuration = selectedActivity.duration_minutes || 30;
      const userDuration = completionData.duration || activityDuration;
      
      // Calculate duration multiplier (max 2x)
      const durationMultiplier = Math.min(userDuration / activityDuration, 2);
      
      // Get type multiplier
      const typeMultiplier = activityType ? activityType.multiplier : 1;
      
      // Calculate final points
      const calculated = Math.round(basePoints * durationMultiplier * typeMultiplier);
      setCalculatedPoints(calculated);
    }
  }, [selectedActivity, completionData.activity_type, completionData.duration]);

  const handleCompleteActivity = async () => {
    if (!selectedActivity) return;

    try {
      const activityData = {
        activity_id: selectedActivity.id,
        activity_name: selectedActivity.title,
        activity_type: completionData.activity_type,
        activity_category: selectedActivity.category,
        duration: completionData.duration,
        points_earned: calculatedPoints,
        notes: completionData.notes,
        mood_before: completionData.mood_before,
        mood_after: completionData.mood_after,
        stress_level_before: completionData.stress_level_before,
        stress_level_after: completionData.stress_level_after
      };

      const response = await api.completeWellnessActivity(activityData);
      
      if (response.success) {
        Alert.alert(
          'Success!',
          `Activity completed successfully!\n\nYou earned ${calculatedPoints} points.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCompletionModal(false);
                setSelectedActivity(null);
                // Reload user activity history
                if (isAuthenticated) {
                  loadUserActivityHistory();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to complete activity');
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      handleError(error, {
        title: 'Error Completing Activity',
        showAlert: true
      });
    }
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
        <Text style={styles.wellnessActivityTitle}>{item.title || ''}</Text>
        <Text style={styles.wellnessActivityDescription}>{item.description || ''}</Text>
        <View style={styles.wellnessActivityStats}>
          <Text style={styles.wellnessActivityStat}>{item.duration_minutes || 0} min</Text>
          <Text style={styles.wellnessActivityStat}>•</Text>
          <Text style={styles.wellnessActivityStat}>{item.points || 0} points</Text>
          <Text style={styles.wellnessActivityStat}>•</Text>
          <Text style={styles.wellnessActivityStat}>{item.difficulty || ''}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderUserActivity = ({ item }: { item: UserWellnessActivity }) => (
    <View style={styles.userActivityCard}>
      {/* Header with Title, Date, and Points */}
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
          <Text style={styles.userActivityPointsText}>+{item.points_earned || 0}</Text>
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

  const renderCompletionModal = () => (
    <Modal
      visible={showCompletionModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCompletionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Icon name="heart-pulse" size={24} color="#10B981" />
              <Text style={styles.modalTitle}>Selesaikan Aktivitas</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowCompletionModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Activity Info Card */}
            <View style={styles.activityInfoCard}>
              <View style={styles.activityInfoHeader}>
                <Icon name="heart-pulse" size={32} color="#10B981" />
                <View style={styles.activityInfoText}>
                  <Text style={styles.activityName}>{selectedActivity?.title || ''}</Text>
                  <Text style={styles.activityDescription}>{selectedActivity?.description || ''}</Text>
                </View>
              </View>
              <View style={styles.activityInfoStats}>
                <View style={styles.activityInfoStat}>
                  <Icon name="clock-outline" size={16} color="#6B7280" />
                  <Text style={styles.activityInfoStatText}>{selectedActivity?.duration_minutes || 0} min</Text>
                </View>
                <View style={styles.activityInfoStat}>
                  <Icon name="star" size={16} color="#6B7280" />
                  <Text style={styles.activityInfoStatText}>{selectedActivity?.difficulty || ''}</Text>
                </View>
                <View style={styles.activityInfoStat}>
                  <Icon name="fire" size={16} color="#6B7280" />
                  <Text style={styles.activityInfoStatText}>{selectedActivity?.points || 0} points</Text>
                </View>
              </View>
            </View>

            {/* Points Calculation Card */}
            <View style={styles.pointsCalculationCard}>
              <View style={styles.pointsCalculationHeader}>
                <Icon name="calculator" size={20} color="#92400E" />
                <Text style={styles.pointsCalculationTitle}>Perhitungan Poin</Text>
              </View>
              <View style={styles.pointsCalculationContent}>
                <View style={styles.pointsCalculationRow}>
                  <Text style={styles.pointsCalculationLabel}>Durasi:</Text>
                  <Text style={styles.pointsCalculationValue}>{completionData.duration} menit</Text>
                </View>
                <View style={styles.pointsCalculationRow}>
                  <Text style={styles.pointsCalculationLabel}>Tipe Aktivitas:</Text>
                  <Text style={styles.pointsCalculationValue}>
                    {activityTypes[completionData.activity_type]?.name} (x{activityTypes[completionData.activity_type]?.multiplier})
                  </Text>
                </View>
                <View style={styles.pointsCalculationDivider} />
                <View style={styles.pointsCalculationRow}>
                  <Text style={styles.pointsCalculationTotalLabel}>Total Poin:</Text>
                  <Text style={styles.pointsCalculationTotalValue}>{calculatedPoints}</Text>
                </View>
              </View>
            </View>

            {/* Activity Details Form */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Icon name="clipboard-text" size={20} color="#374151" />
                <Text style={styles.modalSectionTitle}>Detail Aktivitas</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipe Aktivitas</Text>
                <View style={styles.pickerContainer}>
                  {Object.entries(activityTypes).map(([key, type]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.pickerOption,
                        completionData.activity_type === key && styles.pickerOptionSelected
                      ]}
                      onPress={() => setCompletionData(prev => ({ ...prev, activity_type: key }))}
                    >
                      <Icon 
                        name={key === 'intense' ? 'fire' : key === 'relaxed' ? 'leaf' : 'heart'} 
                        size={16} 
                        color={completionData.activity_type === key ? '#FFFFFF' : '#6B7280'} 
                      />
                      <Text style={[
                        styles.pickerOptionText,
                        completionData.activity_type === key && styles.pickerOptionTextSelected
                      ]}>
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Durasi (menit)</Text>
                <View style={styles.durationInputContainer}>
                  <Icon name="clock-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.durationInput}
                    value={String(completionData.duration)}
                    onChangeText={(text) => setCompletionData(prev => ({ 
                      ...prev, 
                      duration: parseInt(text) || 0 
                    }))}
                    keyboardType="numeric"
                    placeholder="30"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catatan</Text>
                <View style={styles.notesInputContainer}>
                  <Icon name="note-text" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.notesInput}
                    value={completionData.notes}
                    onChangeText={(text) => setCompletionData(prev => ({ ...prev, notes: text }))}
                    placeholder="Tambahkan catatan tentang aktivitas Anda..."
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </View>

            {/* Mood & Stress Tracking Form */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Icon name="emoticon" size={20} color="#374151" />
                <Text style={styles.modalSectionTitle}>Pelacakan Mood & Stres</Text>
              </View>
              
              <View style={styles.moodStressContainer}>
                <View style={styles.moodStressColumn}>
                  <Text style={styles.moodStressLabel}>Mood Sebelum</Text>
                  <View style={styles.moodStressOptions}>
                    {['very_happy', 'happy', 'neutral', 'sad', 'very_sad'].map((mood) => (
                      <TouchableOpacity
                        key={mood}
                        style={[
                          styles.moodStressOption,
                          completionData.mood_before === mood && styles.moodStressOptionSelected
                        ]}
                        onPress={() => setCompletionData(prev => ({ ...prev, mood_before: mood }))}
                      >
                        <Icon 
                          name={mood === 'very_happy' ? 'emoticon-excited' : 
                               mood === 'happy' ? 'emoticon-happy' : 
                               mood === 'neutral' ? 'emoticon-neutral' : 
                               mood === 'sad' ? 'emoticon-sad' : 'emoticon-cry'} 
                          size={16} 
                          color={completionData.mood_before === mood ? '#FFFFFF' : '#6B7280'} 
                        />
                        <Text style={[
                          styles.moodStressOptionText,
                          completionData.mood_before === mood && styles.moodStressOptionTextSelected
                        ]}>
                          {mood.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.moodStressColumn}>
                  <Text style={styles.moodStressLabel}>Mood Sesudah</Text>
                  <View style={styles.moodStressOptions}>
                    {['very_happy', 'happy', 'neutral', 'sad', 'very_sad'].map((mood) => (
                      <TouchableOpacity
                        key={mood}
                        style={[
                          styles.moodStressOption,
                          completionData.mood_after === mood && styles.moodStressOptionSelected
                        ]}
                        onPress={() => setCompletionData(prev => ({ ...prev, mood_after: mood }))}
                      >
                        <Icon 
                          name={mood === 'very_happy' ? 'emoticon-excited' : 
                               mood === 'happy' ? 'emoticon-happy' : 
                               mood === 'neutral' ? 'emoticon-neutral' : 
                               mood === 'sad' ? 'emoticon-sad' : 'emoticon-cry'} 
                          size={16} 
                          color={completionData.mood_after === mood ? '#FFFFFF' : '#6B7280'} 
                        />
                        <Text style={[
                          styles.moodStressOptionText,
                          completionData.mood_after === mood && styles.moodStressOptionTextSelected
                        ]}>
                          {mood.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.moodStressContainer}>
                <View style={styles.moodStressColumn}>
                  <Text style={styles.moodStressLabel}>Stres Sebelum</Text>
                  <View style={styles.moodStressOptions}>
                    {['very_low', 'low', 'medium', 'high', 'very_high'].map((stress) => (
                      <TouchableOpacity
                        key={stress}
                        style={[
                          styles.moodStressOption,
                          completionData.stress_level_before === stress && styles.moodStressOptionSelected
                        ]}
                        onPress={() => setCompletionData(prev => ({ ...prev, stress_level_before: stress }))}
                      >
                        <Icon 
                          name={stress === 'very_low' ? 'heart' : 
                               stress === 'low' ? 'heart-outline' : 
                               stress === 'medium' ? 'heart-half' : 
                               stress === 'high' ? 'heart-broken' : 'heart-broken-outline'} 
                          size={16} 
                          color={completionData.stress_level_before === stress ? '#FFFFFF' : '#6B7280'} 
                        />
                        <Text style={[
                          styles.moodStressOptionText,
                          completionData.stress_level_before === stress && styles.moodStressOptionTextSelected
                        ]}>
                          {stress.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.moodStressColumn}>
                  <Text style={styles.moodStressLabel}>Stres Sesudah</Text>
                  <View style={styles.moodStressOptions}>
                    {['very_low', 'low', 'medium', 'high', 'very_high'].map((stress) => (
                      <TouchableOpacity
                        key={stress}
                        style={[
                          styles.moodStressOption,
                          completionData.stress_level_after === stress && styles.moodStressOptionSelected
                        ]}
                        onPress={() => setCompletionData(prev => ({ ...prev, stress_level_after: stress }))}
                      >
                        <Icon 
                          name={stress === 'very_low' ? 'heart' : 
                               stress === 'low' ? 'heart-outline' : 
                               stress === 'medium' ? 'heart-half' : 
                               stress === 'high' ? 'heart-broken' : 'heart-broken-outline'} 
                          size={16} 
                          color={completionData.stress_level_after === stress ? '#FFFFFF' : '#6B7280'} 
                        />
                        <Text style={[
                          styles.moodStressOptionText,
                          completionData.stress_level_after === stress && styles.moodStressOptionTextSelected
                        ]}>
                          {stress.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCompletionModal(false)}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteActivity}
            >
              <Icon name="check" size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Selesaikan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
            
            {/* History Summary */}
            {userActivities.length > 0 && (
              <View style={styles.historySummaryContainer}>
                <View style={styles.historySummaryCard}>
                  <Icon name="star" size={24} color="#10B981" />
                  <View style={styles.historySummaryInfo}>
                    <Text style={styles.historySummaryTitle}>
                      {userActivities.reduce((total, activity) => total + activity.points_earned, 0)}
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

      {renderCompletionModal()}

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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  activityInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityInfoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  activityInfoText: {
    flex: 1,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  activityInfoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityInfoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityInfoStatText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  pointsCalculationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pointsCalculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  pointsCalculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  pointsCalculationContent: {
    gap: 8,
  },
  pointsCalculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsCalculationLabel: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  pointsCalculationValue: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  pointsCalculationDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    marginVertical: 4,
  },
  pointsCalculationTotalLabel: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  pointsCalculationTotalValue: {
    fontSize: 18,
    color: '#92400E',
    fontWeight: '700',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  durationInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  notesInputContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  notesInput: {
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  pickerOptionSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
  },
  moodStressContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  moodStressColumn: {
    flex: 1,
  },
  moodStressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  moodStressOptions: {
    gap: 6,
  },
  moodStressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  moodStressOptionSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  moodStressOptionText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  moodStressOptionTextSelected: {
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ActivityScreen; 