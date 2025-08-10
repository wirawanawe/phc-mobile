import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomTheme } from '../theme/theme';
import ProgressRing from './ProgressRing';
import api from '../services/api';
import { handleAuthError } from '../utils/errorHandler';

const { width } = Dimensions.get('window');

interface WeeklySummaryCardProps {
  onMoreDetailsPress?: () => void;
}

interface WeeklyMetrics {
  calories: number;
  waterIntake: number;
  steps: number;
  exerciseMinutes: number;
  distance: number;
  sleepHours: number;
}

const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({ onMoreDetailsPress }) => {
  const theme = useTheme<CustomTheme>();
  const [metrics, setMetrics] = useState<WeeklyMetrics>({
    calories: 0,
    waterIntake: 0,
    steps: 0,
    exerciseMinutes: 0,
    distance: 0,
    sleepHours: 0,
  });
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState({ start_date: '', end_date: '', days: 0 });

  useEffect(() => {
    loadWeeklyData();
    
    // Update weekly data every 5 minutes (less frequent than daily)
    const interval = setInterval(loadWeeklyData, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      
      // This loads accumulated weekly data (7 days) - shows averages per day
      // For daily data that resets each day, see TodaySummaryCard component
      
      const weeklyResponse = await api.getWeeklySummary();
      console.log('WeeklySummaryCard - Weekly summary response:', weeklyResponse);
      
      if (weeklyResponse.success && weeklyResponse.data) {
        const data = weeklyResponse.data;
        
        // Set period information
        setPeriod(data.period);
        
        // Map weekly averages to metrics
        const weeklyMetrics = {
          calories: data.weekly_averages?.calories_per_day || 0,
          waterIntake: (data.weekly_averages?.water_ml_per_day || 0) / 1000, // Convert ml to liters
          steps: data.weekly_averages?.steps_per_day || 0,
          exerciseMinutes: data.weekly_averages?.exercise_minutes_per_day || 0,
          distance: data.weekly_averages?.distance_km_per_day || 0,
          sleepHours: data.weekly_averages?.sleep_hours_per_day || 0,
        };
        
        console.log('WeeklySummaryCard - Weekly metrics:', weeklyMetrics);
        setMetrics(weeklyMetrics);

        // Set wellness score from API
        const score = data.wellness_score || 0;
        setWellnessScore(score);
        console.log('WeeklySummaryCard - Wellness score:', score);
        
      } else {
        console.warn("Failed to load weekly summary:", weeklyResponse.message);
        // Set default values when API fails
        setMetrics({
          calories: 0,
          waterIntake: 0,
          steps: 0,
          exerciseMinutes: 0,
          distance: 0,
          sleepHours: 0,
        });
        setWellnessScore(0);
      }
      
    } catch (error) {
      console.error('Error loading weekly data:', error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number | undefined, type: string): string => {
    if (loading) return '...';
    
    // Handle undefined or null values
    if (value === undefined || value === null) {
      return '0';
    }
    
    switch (type) {
      case 'calories':
        return value.toString();
      case 'water':
        return value.toFixed(1);
      case 'steps':
        return value.toString();
      case 'exercise':
        return value.toString();
      case 'distance':
        return value.toFixed(1);
      case 'sleep':
        return value.toFixed(1);
      default:
        return value.toString();
    }
  };

  const formatPeriod = () => {
    if (!period.start_date || !period.end_date) return 'Minggu Ini';
    
    const start = new Date(period.start_date);
    const end = new Date(period.end_date);
    
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = start.toLocaleDateString('id-ID', { month: 'short' });
    
    return `${startDay}-${endDay} ${month}`;
  };

  const metricsData = [
    {
      id: 1,
      icon: 'heart',
      value: formatValue(metrics.calories, 'calories'),
      unit: 'kcal/hari',
      color: '#FF6B8A',
      label: 'Kalori Rata-rata',
      emptyMessage: 'Belum ada data makanan minggu ini',
    },
    {
      id: 2,
      icon: 'cup-water',
      value: formatValue(metrics.waterIntake, 'water'),
      unit: 'L/hari',
      color: '#3182CE',
      label: 'Air Minum Rata-rata',
      emptyMessage: 'Belum ada data air minum minggu ini',
    },
    {
      id: 3,
      icon: 'walk',
      value: formatValue(metrics.steps, 'steps'),
      unit: 'langkah/hari',
      color: '#38A169',
      label: 'Langkah Rata-rata',
      emptyMessage: 'Belum ada data langkah minggu ini',
    },
    {
      id: 4,
      icon: 'run',
      value: formatValue(metrics.exerciseMinutes, 'exercise'),
      unit: 'menit/hari',
      color: '#ED8936',
      label: 'Olahraga Rata-rata',
      emptyMessage: 'Belum ada data olahraga minggu ini',
    },
    {
      id: 5,
      icon: 'map-marker-distance',
      value: formatValue(metrics.distance, 'distance'),
      unit: 'km/hari',
      color: '#A1887F',
      label: 'Jarak Rata-rata',
      emptyMessage: 'Belum ada data jarak minggu ini',
    },
    {
      id: 6,
      icon: 'sleep',
      value: formatValue(metrics.sleepHours, 'sleep'),
      unit: 'jam/hari',
      color: '#9F7AEA',
      label: 'Tidur Rata-rata',
      emptyMessage: 'Belum ada data tidur minggu ini',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#EC4899']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Summary</Text>
          <Text style={styles.period}>{formatPeriod()}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Metrics Grid */}
          <View style={styles.metricsContainer}>
            {metricsData.map((metric) => (
              <View key={metric.id} style={styles.metricItem}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <Icon name={metric.icon} size={16} color="#FFFFFF" />
                </View>
                <View style={styles.metricContent}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricValue}>
                      {metric.value === '0' || metric.value === '0.0' ? '--' : metric.value}
                    </Text>
                    {metric.unit && <Text style={styles.metricUnit}>{metric.unit}</Text>}
                  </View>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Wellness Score */}
          <View style={styles.wellnessContainer}>
            <View style={styles.wellnessHoverWrapper}>
              <ProgressRing
                progress={wellnessScore}
                size={90}
                strokeWidth={10}
                strokeColor="#FCD34D"
                backgroundColor="rgba(255, 255, 255, 0.2)"
                animated={true}
                duration={2000}
                glowEffect={true}
                pulseEffect={wellnessScore > 80}
                showBackground={true}
                showInnerGlow={true}
                modernStyle={true}
                gradient={{
                  colors: ['#FCD34D', '#F59E0B', '#D97706'],
                  id: 'weeklyWellnessGradient'
                }}
              >
                <Text style={styles.wellnessValue}>{wellnessScore}</Text>
                <Text style={styles.wellnessLabel}>Skor{'\n'}Mingguan</Text>
              </ProgressRing>
            </View>
            
            {/* Lihat Detail Button */}
            <TouchableOpacity 
              style={styles.moreDetailsButton}
              onPress={() => {
                if (onMoreDetailsPress) {
                  onMoreDetailsPress();
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.moreDetailsButtonContent}>
                <Text style={styles.moreDetailsText}>Lihat Detail</Text>
                <Icon name="arrow-right" size={14} color="rgba(255, 255, 255, 0.9)" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  period: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginRight: 12,
  },
  metricItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    minHeight: 50,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  metricContent: {
    flex: 1,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  wellnessContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    paddingVertical: 4,
  },
  wellnessHoverWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 55,
    padding: 8,
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  wellnessValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  wellnessLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  moreDetailsButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  moreDetailsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginRight: 6,
    letterSpacing: 0.3,
  },
});

export default WeeklySummaryCard; 