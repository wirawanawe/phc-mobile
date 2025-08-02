import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Chip, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomTheme } from '../theme/theme';
import ActivityDetectionService, { ActivityData } from '../services/ActivityDetectionService';
import api from '../services/api';
import { handleAuthError } from '../utils/errorHandler';

interface ActivityStatusCardProps {
  onPress?: () => void;
}

const ActivityStatusCard: React.FC<ActivityStatusCardProps> = ({ onPress }) => {
  const theme = useTheme<CustomTheme>();
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const [todayData, setTodayData] = useState({ 
    steps: 0, 
    distance: 0,
    calories: 0,
    exerciseMinutes: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for activity events
    ActivityDetectionService.on('activity_started', handleActivityStarted);
    ActivityDetectionService.on('activity_updated', handleActivityUpdated);
    ActivityDetectionService.on('activity_stopped', handleActivityStopped);

    // Check initial status
    const activity = ActivityDetectionService.getCurrentActivity();
    const detecting = ActivityDetectionService.isDetectingActivity();
    const todayActivityData = ActivityDetectionService.getTodayActivityData();
    
    setCurrentActivity(activity);
    setIsDetecting(detecting);
    setTodayData(prev => ({ ...prev, ...todayActivityData }));

    // Load database data
    loadTodayData();

    // Update today's data every 30 seconds
    const updateInterval = setInterval(() => {
      const updatedData = ActivityDetectionService.getTodayActivityData();
      setTodayData(prev => ({ ...prev, ...updatedData }));
    }, 30000);

    return () => {
      ActivityDetectionService.off('activity_started', handleActivityStarted);
      ActivityDetectionService.off('activity_updated', handleActivityUpdated);
      ActivityDetectionService.off('activity_stopped', handleActivityStopped);
      clearInterval(updateInterval);
    };
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      
      // Get fitness data from database
      const fitnessResponse = await api.getTodayFitness();
      if (fitnessResponse.success) {
        const fitnessData = fitnessResponse.data;
        setTodayData(prev => ({
          ...prev,
          steps: fitnessData.steps || prev.steps,
          exerciseMinutes: fitnessData.exercise_minutes || 0,
          calories: fitnessData.calories_burned || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading today data:', error);
      // Handle authentication errors silently - don't show alert for background data loading
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityStarted = (activity: ActivityData) => {
    setCurrentActivity(activity);
    setIsDetecting(true);
  };

  const handleActivityUpdated = (activity: ActivityData) => {
    setCurrentActivity(activity);
  };

  const handleActivityStopped = (activity: ActivityData) => {
    setCurrentActivity(null);
    setIsDetecting(false);
  };

  const handleToggleDetection = async () => {
    if (!detectionEnabled) {
      try {
        const success = await ActivityDetectionService.startDetection();
        if (success) {
          setDetectionEnabled(true);
          Alert.alert('Auto Detection Enabled', 'Activity detection is now active. The app will automatically detect and track your fitness activities.');
        } else {
          Alert.alert('Error', 'Failed to start activity detection. Please check location permissions.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to start activity detection.');
      }
    } else {
      ActivityDetectionService.stopDetection();
      setDetectionEnabled(false);
      Alert.alert('Auto Detection Disabled', 'Activity detection has been turned off.');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'walking':
        return 'walk';
      case 'running':
        return 'run';
      case 'cycling':
        return 'bike';
      default:
        return 'help-circle';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'walking':
        return '#10B981';
      case 'running':
        return '#EF4444';
      case 'cycling':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const getStepGoal = () => 10000;
  const getExerciseGoal = () => 30; // 30 minutes
  const getCalorieGoal = () => 500; // 500 calories

  const getStepProgress = () => Math.min((todayData.steps / getStepGoal()) * 100, 100);
  const getExerciseProgress = () => Math.min((todayData.exerciseMinutes / getExerciseGoal()) * 100, 100);
  const getCalorieProgress = () => Math.min((todayData.calories / getCalorieGoal()) * 100, 100);

  // Jika detection tidak aktif, tampilkan card untuk mengaktifkan
  if (!detectionEnabled) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <LinearGradient
            colors={['#F3F4F6', '#E5E7EB']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <View style={styles.iconContainer}>
                  <Icon name="radar" size={24} color="#6B7280" />
                </View>
                <View style={styles.titleWrapper}>
                  <Text style={styles.title}>Auto Activity Detection</Text>
                  <Text style={styles.subtitle}>Track your fitness automatically</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleToggleDetection} style={styles.enableButton}>
                <Chip mode="outlined" textStyle={{ color: '#10B981', fontWeight: '600' }} style={{ borderColor: '#10B981' }}>
                  Enable
                </Chip>
              </TouchableOpacity>
            </View>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Icon name="walk" size={16} color="#6B7280" />
                <Text style={styles.featureText}>Step counting</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="map-marker-distance" size={16} color="#6B7280" />
                <Text style={styles.featureText}>Distance tracking</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="fire" size={16} color="#6B7280" />
                <Text style={styles.featureText}>Calorie burn</Text>
              </View>
            </View>
          </LinearGradient>
        </Card.Content>
      </Card>
    );
  }

  // Jika detection aktif, tampilkan data lengkap
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B981' }]}>
                <Icon name="walk" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.titleWrapper}>
                <Text style={styles.title}>Today's Activity</Text>
                <Text style={styles.subtitle}>Real-time tracking active</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleToggleDetection} style={styles.disableButton}>
              <Chip mode="outlined" textStyle={{ color: '#EF4444', fontWeight: '600' }} style={{ borderColor: '#EF4444' }}>
                Disable
              </Chip>
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#10B98120' }]}>
                <Icon name="walk" size={20} color="#10B981" />
              </View>
              <Text style={styles.metricValue}>
                {loading ? '...' : todayData.steps.toString()}
              </Text>
              <Text style={styles.metricLabel}>Steps</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getStepProgress()}%`, backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(getStepProgress())}% of goal</Text>
            </View>
            
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#3B82F620' }]}>
                <Icon name="map-marker-distance" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.metricValue}>
                {loading ? '...' : formatDistance(todayData.distance)}
              </Text>
              <Text style={styles.metricLabel}>Distance</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#F59E0B20' }]}>
                <Icon name="run" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.metricValue}>
                {loading ? '...' : todayData.exerciseMinutes}
              </Text>
              <Text style={styles.metricLabel}>Exercise (min)</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getExerciseProgress()}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(getExerciseProgress())}% of goal</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#EF444420' }]}>
                <Icon name="fire" size={20} color="#EF4444" />
              </View>
              <Text style={styles.metricValue}>
                {loading ? '...' : todayData.calories}
              </Text>
              <Text style={styles.metricLabel}>Calories</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getCalorieProgress()}%`, backgroundColor: '#EF4444' }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(getCalorieProgress())}% of goal</Text>
            </View>
          </View>

          <View style={styles.statusIndicator}>
            <Icon name="radar" size={16} color="#10B981" />
            <Text style={styles.statusText}>Auto-detection active in background</Text>
          </View>
        </LinearGradient>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    padding: 0,
    overflow: 'hidden',
  },
  gradientBackground: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  enableButton: {
    marginLeft: 8,
  },
  disableButton: {
    marginLeft: 8,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default ActivityStatusCard; 