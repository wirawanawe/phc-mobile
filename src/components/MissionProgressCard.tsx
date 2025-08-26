import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { CustomTheme } from '../theme/theme';
import apiService from '../services/api';
import eventEmitter from '../utils/eventEmitter';

interface MissionProgressCardProps {
  onActivityPress?: () => void;
}



interface MissionStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  totalPoints: number;
}

const MissionProgressCard: React.FC<MissionProgressCardProps> = ({ 
  onActivityPress 
}) => {
  const theme = useTheme<CustomTheme>();
  const [missionStats, setMissionStats] = useState<MissionStats>({
    totalMissions: 0,
    activeMissions: 0,
    completedMissions: 0,
    totalPoints: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial load only
    loadMissionData();
    
    // Listen for mission events (manual refresh only)
    const handleMissionAccepted = () => {
      console.log('MissionProgressCard: Mission accepted, refreshing stats...');
      loadMissionData();
    };

    const handleMissionCompleted = () => {
      console.log('MissionProgressCard: Mission completed, refreshing stats...');
      loadMissionData();
    };

    const handleMissionAbandoned = () => {
      console.log('MissionProgressCard: Mission abandoned, refreshing stats...');
      loadMissionData();
    };

    const handleMissionReactivated = () => {
      console.log('MissionProgressCard: Mission reactivated, refreshing stats...');
      loadMissionData();
    };
    
    const handleDataRefresh = () => {
      console.log('MissionProgressCard: Data refresh event, refreshing stats...');
      loadMissionData();
    };
    
    const handleMissionUpdated = () => {
      console.log('MissionProgressCard: Mission updated, refreshing stats...');
      loadMissionData();
    };

    const handleCacheCleared = () => {
      console.log('MissionProgressCard: Cache cleared event, refreshing stats...');
      setTimeout(() => {
        loadMissionData();
      }, 200);
    };

    const handleForceRefreshAllData = () => {
      console.log('MissionProgressCard: Force refresh all data event, refreshing stats...');
      setTimeout(() => {
        loadMissionData();
      }, 300);
    };

    const handleCacheRefreshed = () => {
      console.log('MissionProgressCard: Cache refreshed event, refreshing stats...');
      setTimeout(() => {
        loadMissionData();
      }, 150);
    };
    
    // Add event listeners for manual refresh events
    eventEmitter.on('missionAccepted', handleMissionAccepted);
    eventEmitter.on('missionCompleted', handleMissionCompleted);
    eventEmitter.on('missionAbandoned', handleMissionAbandoned);
    eventEmitter.on('missionReactivated', handleMissionReactivated);
    eventEmitter.on('missionUpdated', handleMissionUpdated);
    eventEmitter.on('dataRefresh', handleDataRefresh);
    eventEmitter.on('cacheCleared', handleCacheCleared);
    eventEmitter.on('forceRefreshAllData', handleForceRefreshAllData);
    eventEmitter.on('cacheRefreshed', handleCacheRefreshed);
    
    // Remove automatic interval - no more auto-refresh
    
    return () => {
      // Cleanup event listeners only
      eventEmitter.off('missionAccepted', handleMissionAccepted);
      eventEmitter.off('missionCompleted', handleMissionCompleted);
      eventEmitter.off('missionAbandoned', handleMissionAbandoned);
      eventEmitter.off('missionReactivated', handleMissionReactivated);
      eventEmitter.off('missionUpdated', handleMissionUpdated);
      eventEmitter.off('dataRefresh', handleDataRefresh);
      eventEmitter.off('cacheCleared', handleCacheCleared);
      eventEmitter.off('forceRefreshAllData', handleForceRefreshAllData);
      eventEmitter.off('cacheRefreshed', handleCacheRefreshed);
    };
  }, []);

  // No more fallback data - we'll show real data from the server

  const loadMissionData = async () => {
    try {
      setLoading(true);

      console.log('🔄 Loading mission stats...');
      
      // Use the dedicated mission stats API
      try {
        const statsResponse = await apiService.getMissionStats({ date: new Date().toISOString().split('T')[0] });
        if (statsResponse.success && statsResponse.data) {
          const stats = statsResponse.data;
          console.log('📊 Mission stats loaded:', stats);
          
          // Map API response to frontend expected format
          const mappedStats = {
            totalMissions: stats.total_missions || 0,
            activeMissions: stats.active_missions || 0,
            completedMissions: stats.completed_missions || 0,
            totalPoints: stats.total_points_earned || 0,
          };
          setMissionStats(mappedStats);
          setError(null); // Clear any previous errors
          console.log('Mission stats mapped:', mappedStats);
        } else {
          console.warn("Failed to load mission stats:", statsResponse.message);
          // Set default stats for offline mode
          setMissionStats({ totalMissions: 0, activeMissions: 0, completedMissions: 0, totalPoints: 0 });
        }
      } catch (statsError: any) {
        console.warn("Mission stats API failed, using offline mode:", statsError.message);
        setMissionStats({ totalMissions: 0, activeMissions: 0, completedMissions: 0, totalPoints: 0 });
        setError("Gagal memuat data misi");
      }

    } catch (error: any) {
      console.error("Error loading mission data:", error);
      // Handle error silently
      // Set default values on error
      setMissionStats({
        totalMissions: 0,
        activeMissions: 0,
        completedMissions: 0,
        totalPoints: 0,
      });
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };









  return (
        <TouchableOpacity 
      style={styles.missionCardContainer}
      onPress={onActivityPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#E53E3E', '#C53030', '#DC2626']}
        style={styles.missionCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.missionCardHeader}>
          <View style={styles.missionCardHeaderLeft}>
            <Text style={styles.missionCardTitle}>Progress Mission</Text>
            <Text style={styles.missionCardSubtitle}>Misi kesehatan hari ini</Text>
          </View>
          <View style={styles.missionCardHeaderRight}>
            <Icon name="flag" size={24} color="rgba(255, 255, 255, 0.8)" />
          </View>
        </View>

        {/* Mission Stats Section */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                loadMissionData();
              }}
            >
              <Icon name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.retryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.missionStatsSection}>
            <View style={styles.missionStatCard}>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"]}
                style={styles.missionStatIconContainer}
              >
                <Icon name="flag" size={18} color="#FFFFFF" />
              </LinearGradient>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIndicator} />
              ) : (
                <Text style={styles.missionStatNumber}>
                  {missionStats.activeMissions !== undefined ? missionStats.activeMissions : 0}
                </Text>
              )}
              <Text style={styles.missionStatLabel}>Active Mission</Text>
            </View>
            
            <View style={styles.missionStatCard}>
              <LinearGradient
                colors={["rgba(16, 185, 129, 0.3)", "rgba(16, 185, 129, 0.1)"]}
                style={styles.missionStatIconContainer}
              >
                <Icon name="check-circle" size={18} color="#FFFFFF" />
              </LinearGradient>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIndicator} />
              ) : (
                <Text style={styles.missionStatNumber}>
                  {missionStats.completedMissions !== undefined ? missionStats.completedMissions : 0}
                </Text>
              )}
              <Text style={styles.missionStatLabel}>Selesai</Text>
            </View>
            
            <View style={styles.missionStatCard}>
              <LinearGradient
                colors={["rgba(245, 158, 11, 0.3)", "rgba(245, 158, 11, 0.1)"]}
                style={styles.missionStatIconContainer}
              >
                <Icon name="star" size={18} color="#FFFFFF" />
              </LinearGradient>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIndicator} />
              ) : (
                <Text style={styles.missionStatNumber}>
                  {missionStats.totalPoints !== undefined ? missionStats.totalPoints : 0}
                </Text>
              )}
              <Text style={styles.missionStatLabel}>Poin</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  missionCardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  missionCard: {
    padding: 20,
  },
  missionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  missionCardHeaderLeft: {
    flex: 1,
  },
  missionCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  missionCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  missionCardHeaderRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionStatsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  missionStatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  missionStatIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  missionStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  missionStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingIndicator: {
    marginBottom: 2,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },



});

export default MissionProgressCard;
