import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Text, useTheme, Button, Card, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomTheme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import FitnessIntegrationService, { FitnessData, DeviceConnection } from '../services/FitnessIntegrationService';
import ActivityStatusCard from '../components/ActivityStatusCard';
import { safeGoBack } from "../utils/safeNavigation";

const { width } = Dimensions.get('window');

const RealtimeFitnessScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<FitnessData | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<'walking' | 'running' | 'cycling'>('walking');
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      startSessionTimer();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTracking) {
        setSessionDuration(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking]);



  const startSessionTimer = () => {
    const interval = setInterval(() => {
      const status = FitnessIntegrationService.getSessionStatus();
      setIsTracking(status.isTracking);
      setCurrentSession(status.currentSession);
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleStartSession = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please login to start fitness tracking');
      return;
    }



    try {
      const success = await FitnessIntegrationService.startFitnessSession(selectedActivity);
      if (success) {
        setIsTracking(true);
        setSessionDuration(0);
        Alert.alert('Session Started', `Started tracking ${selectedActivity} activity`);
      } else {
        Alert.alert('Error', 'Failed to start fitness session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start fitness session');
    }
  };

  const handleStopSession = async () => {
    try {
      const finalData = await FitnessIntegrationService.stopFitnessSession();
      if (finalData) {
        setIsTracking(false);
        setCurrentSession(null);
        setSessionDuration(0);
        Alert.alert(
          'Session Completed',
          `Session saved successfully!\nDistance: ${(finalData.distance / 1000).toFixed(2)} km\nDuration: ${Math.round(finalData.duration / 60)} minutes\nCalories: ${finalData.calories} kcal`
        );
      }
    } catch (error) {
      console.error('Error stopping session:', error);
      Alert.alert('Error', 'Failed to stop fitness session');
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activityTypes = [
    { type: 'walking', label: 'Walking', icon: 'walk', color: '#10B981' },
    { type: 'running', label: 'Running', icon: 'run', color: '#EF4444' },
    { type: 'cycling', label: 'Cycling', icon: 'bike', color: '#3B82F6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F8FAFF', '#E8EAFF']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          {/* <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => safeGoBack(navigation, 'Main')}
            >
              <Icon name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Real-time Fitness</Text>
            <View style={styles.placeholder} />
          </View> */}

          {/* Auto Activity Detection */}
          <ActivityStatusCard />

          {/* Activity Selection */}
          <Card style={styles.activityCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Select Activity Type</Text>
              <View style={styles.activityContainer}>
                {activityTypes.map((activity) => (
                  <TouchableOpacity
                    key={activity.type}
                    style={[
                      styles.activityButton,
                      selectedActivity === activity.type && styles.activityButtonActive,
                      { borderColor: activity.color }
                    ]}
                    onPress={() => setSelectedActivity(activity.type as any)}
                  >
                    <Icon 
                      name={activity.icon} 
                      size={24} 
                      color={selectedActivity === activity.type ? '#FFFFFF' : activity.color} 
                    />
                    <Text style={[
                      styles.activityLabel,
                      selectedActivity === activity.type && styles.activityLabelActive
                    ]}>
                      {activity.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Session Status */}
          {isTracking && currentSession && (
            <Card style={styles.sessionCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Current Session</Text>
                
                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <Icon name="clock-outline" size={24} color="#6B7280" />
                    <Text style={styles.metricValue}>{formatDuration(sessionDuration)}</Text>
                    <Text style={styles.metricLabel}>Duration</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <Icon name="map-marker-distance" size={24} color="#6B7280" />
                    <Text style={styles.metricValue}>{(currentSession.distance / 1000).toFixed(2)}</Text>
                    <Text style={styles.metricLabel}>Distance (km)</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <Icon name="walk" size={24} color="#6B7280" />
                    <Text style={styles.metricValue}>{currentSession.steps.toString()}</Text>
                    <Text style={styles.metricLabel}>Steps</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <Icon name="fire" size={24} color="#6B7280" />
                    <Text style={styles.metricValue}>{currentSession.calories}</Text>
                    <Text style={styles.metricLabel}>Calories</Text>
                  </View>
                </View>

                {currentSession.coordinates && currentSession.coordinates.length > 0 && (
                  <View style={styles.gpsInfo}>
                    <Icon name="gps-fixed" size={16} color="#10B981" />
                    <Text style={styles.gpsText}>
                      {currentSession.coordinates.length} GPS points tracked
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Control Buttons */}
          <View style={styles.controlContainer}>
            {!isTracking ? (
              <Button
                mode="contained"
                onPress={handleStartSession}
                style={[styles.controlButton, styles.startButton]}
                labelStyle={styles.controlButtonText}
                buttonColor="#10B981"
                textColor="#FFFFFF"
                icon="play"
              >
                Start {selectedActivity.charAt(0).toUpperCase() + selectedActivity.slice(1)} Session
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleStopSession}
                style={[styles.controlButton, styles.stopButton]}
                labelStyle={styles.controlButtonText}
                buttonColor="#EF4444"
                textColor="#FFFFFF"
                icon="stop"
              >
                Stop Session
              </Button>
            )}
          </View>

          {/* Instructions */}
          <Card style={styles.instructionCard}>
            <Card.Content>
              <Text style={styles.instructionTitle}>How it works:</Text>
              <View style={styles.instructionList}>
                <View style={styles.instructionItem}>
                  <Icon name="check-circle" size={16} color="#10B981" />
                  <Text style={styles.instructionText}>
                    Enable location services for GPS tracking
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Icon name="check-circle" size={16} color="#10B981" />
                  <Text style={styles.instructionText}>
                    Connect smartwatch for heart rate and steps
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Icon name="check-circle" size={16} color="#10B981" />
                  <Text style={styles.instructionText}>
                    Data syncs automatically every 10 seconds
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Icon name="check-circle" size={16} color="#10B981" />
                  <Text style={styles.instructionText}>
                    Session data is saved when you stop tracking
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },

  activityCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  activityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  activityButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginTop: 4,
  },
  activityLabelActive: {
    color: '#FFFFFF',
  },
  sessionCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  gpsText: {
    fontSize: 12,
    color: '#166534',
    marginLeft: 4,
  },
  controlContainer: {
    marginBottom: 20,
  },
  controlButton: {
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
  },
  instructionCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  instructionList: {
    gap: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
});

export default RealtimeFitnessScreen; 