import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { CustomTheme } from '../theme/theme';
import apiService from '../services/api';
import eventEmitter from '../utils/eventEmitter';

interface WellnessActivityCardProps {
  onActivityPress?: () => void;
}

interface HabitStats {
  total_available_habits: number;
  total_habits_completed: number;
  total_points_earned: number;
}

const WellnessActivityCard: React.FC<WellnessActivityCardProps> = ({ 
  onActivityPress 
}) => {
  const theme = useTheme<CustomTheme>();
  const [habitStats, setHabitStats] = useState<HabitStats>({
    total_available_habits: 0,
    total_habits_completed: 0,
    total_points_earned: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial load only
    loadHabitStats();
    
    // Listen for habit activity events (manual refresh only)
    const handleHabitCompleted = () => {
      console.log('WellnessActivityCard: Habit completed, refreshing stats...');
      loadHabitStats();
    };

    const handleHabitUpdated = () => {
      console.log('WellnessActivityCard: Habit updated, refreshing stats...');
      loadHabitStats();
    };

    const handleHabitDeleted = () => {
      console.log('WellnessActivityCard: Habit deleted, refreshing stats...');
      loadHabitStats();
    };

    const handleHabitReset = () => {
      console.log('WellnessActivityCard: Habit reset, refreshing stats...');
      loadHabitStats();
    };
    
    const handleDataRefresh = () => {
      console.log('WellnessActivityCard: Data refresh event, refreshing stats...');
      loadHabitStats();
    };
    
    // Add event listeners for manual refresh events
    eventEmitter.on('habitCompleted', handleHabitCompleted);
    eventEmitter.on('habitUpdated', handleHabitUpdated);
    eventEmitter.on('habitDeleted', handleHabitDeleted);
    eventEmitter.on('habitReset', handleHabitReset);
    eventEmitter.on('dataRefresh', handleDataRefresh);
    
    return () => {
      // Cleanup event listeners only
      eventEmitter.off('habitCompleted', handleHabitCompleted);
      eventEmitter.off('habitUpdated', handleHabitUpdated);
      eventEmitter.off('habitDeleted', handleHabitDeleted);
      eventEmitter.off('habitReset', handleHabitReset);
      eventEmitter.off('dataRefresh', handleDataRefresh);
    };
  }, []);

  const loadHabitStats = async () => {
    try {
      console.log('🔄 Loading habit stats in background...');
      
      // Get habit stats from database
      const statsResponse = await apiService.getHabitStats();
      
      console.log('📊 Raw habit stats response:', statsResponse);
      
      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data.summary;
        console.log('📈 Habit stats loaded successfully:', stats);
        
        setHabitStats({
          total_available_habits: stats.total_available_habits || 0,
          total_habits_completed: stats.total_habits_completed || 0,
          total_points_earned: stats.total_points_earned || 0,
        });
        
        // Clear any previous errors
        setError(null);
      } else {
        console.warn('❌ Failed to load habit stats:', statsResponse.message);
        // Keep current state, don't overwrite with fallback
      }

    } catch (error: any) {
      console.warn('❌ Error loading habit data:', error?.message);
      
      // Handle errors silently in background, like other cards do
      // Don't set error state unless it's critical
      if (error?.message && (
        error.message.includes('No base URL configured') ||
        error.message.includes('Network request failed')
      )) {
        setError('Koneksi tidak tersedia');
      }
      // For other errors, just log them but don't show to user
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onActivityPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#10B981', '#059669', '#047857']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Habit Activities</Text>
            <Text style={styles.subtitle}>Aktivitas kebiasaan hari ini</Text>
          </View>
          <View style={styles.headerRight}>
            <Icon name="format-list-checks" size={24} color="rgba(255, 255, 255, 0.8)" />
          </View>
        </View>

        {/* Habit Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"]}
              style={styles.statIconContainer}
            >
              <Icon name="format-list-checks" size={18} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statNumber}>
              {habitStats.total_available_habits}
            </Text>
            <Text style={styles.statLabel}>Total Habits</Text>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(16, 185, 129, 0.3)", "rgba(16, 185, 129, 0.1)"]}
              style={styles.statIconContainer}
            >
              <Icon name="check-circle" size={18} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statNumber}>
              {habitStats.total_habits_completed}
            </Text>
            <Text style={styles.statLabel}>Selesai</Text>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(245, 158, 11, 0.3)", "rgba(245, 158, 11, 0.1)"]}
              style={styles.statIconContainer}
            >
              <Icon name="star" size={18} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statNumber}>
              {habitStats.total_points_earned}
            </Text>
            <Text style={styles.statLabel}>Poin</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default WellnessActivityCard;
