import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomTheme } from '../theme/theme';
import ProgressRing from './ProgressRing';
import ActivityDetectionService from '../services/ActivityDetectionService';
import apiService from '../services/api';
import { handleAuthError } from '../utils/errorHandler';
import eventEmitter from '../utils/eventEmitter';
import dateChangeDetector from '../utils/dateChangeDetector';

const { width } = Dimensions.get('window');

interface TodaySummaryCardProps {
  onMoreDetailsPress?: () => void;
  date?: string; // tanggal format yyyy-mm-dd
}

interface TodayMetrics {
  calories: number;
  waterIntake: number;
  steps: number;
  exerciseMinutes: number;
  distance: number;
}

const TodaySummaryCard: React.FC<TodaySummaryCardProps> = ({ onMoreDetailsPress, date }) => {
  const theme = useTheme<CustomTheme>();
  const [metrics, setMetrics] = useState<TodayMetrics>({
    calories: 0,
    waterIntake: 0,
    steps: 0,
    exerciseMinutes: 0,
    distance: 0,
  });
  const [wellnessScore, setWellnessScore] = useState(0); // No data available instead of default 54
  const [loading, setLoading] = useState(true);
  const lastDateCheck = React.useRef(new Date().toDateString());

  // Deteksi apakah digunakan di WellnessApp (ada prop date) atau MainScreen
  const isWellnessApp = !!date;

  useEffect(() => {
    // Initialize date change detector
    dateChangeDetector.initialize();
    
    loadTodayData();
    
    // Listen for meal logged events to refresh data immediately
    const handleMealLogged = () => {
      loadTodayData();
    };
    
    // Listen for water logged events
    const handleWaterLogged = () => {
      loadTodayData();
    };
    
    // Listen for fitness logged events
    const handleFitnessLogged = () => {
      loadTodayData();
    };
    
    // Listen for sleep logged events
    const handleSleepLogged = () => {
      loadTodayData();
    };
    
    // Listen for mood logged events
    const handleMoodLogged = () => {
      loadTodayData();
    };

    // Listen for wellness activity events
    const handleWellnessActivityCompleted = () => {
      loadTodayData();
    };

    const handleWellnessActivityUpdated = () => {
      loadTodayData();
    };

    const handleWellnessActivityDeleted = () => {
      loadTodayData();
    };
    
    // Listen for general data refresh events
    const handleDataRefresh = () => {
      loadTodayData();
    };
    
    // Listen for daily reset events
    const handleDailyReset = () => {
      console.log('TodaySummaryCard - Daily reset detected, refreshing data...');
      setMetrics({
        calories: 0,
        waterIntake: 0,
        steps: 0,
        exerciseMinutes: 0,
        distance: 0,
      });
      setWellnessScore(0); // No data available instead of default 54
      loadTodayData();
    };
    
    // Add event listeners
    eventEmitter.on('mealLogged', handleMealLogged);
    eventEmitter.on('waterLogged', handleWaterLogged);
    eventEmitter.on('fitnessLogged', handleFitnessLogged);
    eventEmitter.on('sleepLogged', handleSleepLogged);
    eventEmitter.on('moodLogged', handleMoodLogged);
    eventEmitter.on('wellnessActivityCompleted', handleWellnessActivityCompleted);
    eventEmitter.on('wellnessActivityUpdated', handleWellnessActivityUpdated);
    eventEmitter.on('wellnessActivityDeleted', handleWellnessActivityDeleted);
    eventEmitter.on('dataRefresh', handleDataRefresh);
    eventEmitter.on('dailyReset', handleDailyReset);
    
    // Remove automatic intervals - manual refresh only
    return () => {
      // Remove event listeners
      eventEmitter.off('mealLogged', handleMealLogged);
      eventEmitter.off('waterLogged', handleWaterLogged);
      eventEmitter.off('fitnessLogged', handleFitnessLogged);
      eventEmitter.off('sleepLogged', handleSleepLogged);
      eventEmitter.off('moodLogged', handleMoodLogged);
      eventEmitter.off('wellnessActivityCompleted', handleWellnessActivityCompleted);
      eventEmitter.off('wellnessActivityUpdated', handleWellnessActivityUpdated);
      eventEmitter.off('wellnessActivityDeleted', handleWellnessActivityDeleted);
      eventEmitter.off('dataRefresh', handleDataRefresh);
      eventEmitter.off('dailyReset', handleDailyReset);
    };
  }, [date, isWellnessApp]);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      
      // Ambil summary sesuai tanggal
      let todaySummaryResponse;
      if (date) {
        todaySummaryResponse = await apiService.getSummaryByDate(date);
      } else {
        todaySummaryResponse = await apiService.getTodaySummary();
      }
      
      // Get activity data from local service (only for today)
      const activityData = !date ? ActivityDetectionService.getTodayActivityData() : null;
      console.log('TodaySummaryCard - Activity data:', activityData);
      
      console.log('TodaySummaryCard - Today summary response:', todaySummaryResponse);
      console.log('TodaySummaryCard - Summary data structure:', JSON.stringify(todaySummaryResponse.data, null, 2));
      
      // Get nutrition data from summary or individual API
      let calories = 0;
      console.log('TodaySummaryCard - Starting nutrition data extraction...');
      
      if (todaySummaryResponse.success && todaySummaryResponse.data) {
        // Check multiple possible structures for meal data
        const mealData = todaySummaryResponse.data.meal || todaySummaryResponse.data.nutrition || todaySummaryResponse.data;
        console.log('TodaySummaryCard - Meal data from summary:', mealData);
        
        if (mealData && (mealData.calories || mealData.total_calories)) {
          calories = parseFloat(mealData.calories) || parseFloat(mealData.total_calories) || 0;
          console.log('TodaySummaryCard - Calories from summary:', calories);
        } else {
          console.log('TodaySummaryCard - No meal data in summary, trying individual API');
          try {
            // Use date-specific nutrition API if date is provided
            let nutritionResponse;
            if (date) {
              // For historical data, we'll use the meal history with date filter
              nutritionResponse = await apiService.getMealHistory({ date });
              console.log('TodaySummaryCard - Nutrition history response:', nutritionResponse);
              if (nutritionResponse.success && nutritionResponse.data && nutritionResponse.data.length > 0) {
                // Sum up calories from all meals for the date
                calories = nutritionResponse.data.reduce((total: number, meal: any) => {
                  return total + (meal.calories || 0);
                }, 0);
              }
                      } else {
            nutritionResponse = await apiService.getTodayNutrition();
          }
            console.log('TodaySummaryCard - Nutrition API response:', nutritionResponse);
            if (nutritionResponse.success && nutritionResponse.data) {
              // Handle the confirmed API response structure
              if (nutritionResponse.data.totals && nutritionResponse.data.totals.calories) {
                calories = nutritionResponse.data.totals.calories;
                console.log('TodaySummaryCard - Calories from totals.calories:', calories);
              } else if (nutritionResponse.data.calories) {
                calories = nutritionResponse.data.calories;
                console.log('TodaySummaryCard - Calories from direct calories:', calories);
              } else if (nutritionResponse.data.total_calories) {
                calories = nutritionResponse.data.total_calories;
                console.log('TodaySummaryCard - Calories from total_calories:', calories);
              }
            }
          } catch (nutritionError) {
            console.error('TodaySummaryCard - Nutrition API error:', nutritionError);
          }
          console.log('TodaySummaryCard - Calories calculated:', calories);
        }
      } else {
        console.log('TodaySummaryCard - Summary failed, trying individual API');
        try {
          // Use date-specific nutrition API if date is provided
          let nutritionResponse;
          if (date) {
            // For historical data, we'll use the meal history with date filter
            nutritionResponse = await apiService.getMealHistory({ date });
            console.log('TodaySummaryCard - Nutrition history response:', nutritionResponse);
            if (nutritionResponse.success && nutritionResponse.data && nutritionResponse.data.length > 0) {
              // Sum up calories from all meals for the date
              calories = nutritionResponse.data.reduce((total: number, meal: any) => {
                return total + (meal.calories || 0);
              }, 0);
            }
          } else {
            nutritionResponse = await apiService.getTodayNutrition();
          }
          console.log('TodaySummaryCard - Nutrition API response:', nutritionResponse);
          if (nutritionResponse.success && nutritionResponse.data) {
            // Handle the confirmed API response structure
            if (nutritionResponse.data.totals && nutritionResponse.data.totals.calories) {
              calories = nutritionResponse.data.totals.calories;
              console.log('TodaySummaryCard - Calories from totals.calories:', calories);
            } else if (nutritionResponse.data.calories) {
              calories = nutritionResponse.data.calories;
              console.log('TodaySummaryCard - Calories from direct calories:', calories);
            } else if (nutritionResponse.data.total_calories) {
              calories = nutritionResponse.data.total_calories;
              console.log('TodaySummaryCard - Calories from total_calories:', calories);
            }
          }
        } catch (nutritionError) {
          console.error('TodaySummaryCard - Nutrition API error:', nutritionError);
        }
        console.log('TodaySummaryCard - Calories calculated:', calories);
      }
      
      // Get water intake data from summary or individual API
      let waterIntake = 0;
      if (todaySummaryResponse.success && todaySummaryResponse.data) {
        // Check multiple possible structures for water data
        const waterData = todaySummaryResponse.data.water || todaySummaryResponse.data.hydration || todaySummaryResponse.data;
        if (waterData && (waterData.total_ml || waterData.total_water_ml || waterData.total_intake)) {
          waterIntake = parseFloat(waterData.total_ml) || parseFloat(waterData.total_water_ml) || parseFloat(waterData.total_intake) || 0;
          console.log('TodaySummaryCard - Water intake from summary:', waterIntake);
        } else {
          console.log('TodaySummaryCard - No water data in summary, trying individual API');
          // Use date-specific water API if date is provided
          let waterResponse;
          if (date) {
            waterResponse = await apiService.getWaterHistory({ date });
            console.log('TodaySummaryCard - Water history response:', waterResponse);
            if (waterResponse.success && waterResponse.data && waterResponse.data.length > 0) {
              // Sum up water intake from all entries for the date
              waterIntake = waterResponse.data.reduce((total: number, entry: any) => {
                return total + (entry.amount_ml || 0);
              }, 0);
            }
          } else {
            waterResponse = await apiService.getTodayWaterIntake();
          }
          console.log('TodaySummaryCard - Water response:', waterResponse);
          if (waterResponse.success && waterResponse.data) {
            // Handle both old and new API response structures
            if (waterResponse.data.total_water_ml !== undefined) {
              waterIntake = waterResponse.data.total_water_ml || 0;
            } else if (waterResponse.data.totals) {
              waterIntake = waterResponse.data.totals.total_ml || 0;
            } else {
              waterIntake = waterResponse.data.total_intake || waterResponse.data.total_ml || 0;
            }
          }
          console.log('TodaySummaryCard - Water intake calculated:', waterIntake);
        }
      } else {
        console.log('TodaySummaryCard - Summary failed, trying individual API for water');
        // Use date-specific water API if date is provided
        let waterResponse;
        if (date) {
                      waterResponse = await apiService.getWaterHistory({ date });
          console.log('TodaySummaryCard - Water history response:', waterResponse);
          if (waterResponse.success && waterResponse.data && waterResponse.data.length > 0) {
            // Sum up water intake from all entries for the date
            waterIntake = waterResponse.data.reduce((total: number, entry: any) => {
              return total + (entry.amount_ml || 0);
            }, 0);
          }
                  } else {
            waterResponse = await apiService.getTodayWaterIntake();
          }
        console.log('TodaySummaryCard - Water response:', waterResponse);
        if (waterResponse.success && waterResponse.data) {
          // Handle both old and new API response structures
          if (waterResponse.data.total_water_ml !== undefined) {
            waterIntake = waterResponse.data.total_water_ml || 0;
          } else if (waterResponse.data.totals) {
            waterIntake = waterResponse.data.totals.total_ml || 0;
          } else {
            waterIntake = waterResponse.data.total_intake || waterResponse.data.total_ml || 0;
          }
        }
        console.log('TodaySummaryCard - Water intake calculated:', waterIntake);
      }
      
      // Get fitness data from summary or individual API
      let exerciseMinutes = 0;
      let distance = 0;
      console.log('TodaySummaryCard - Starting fitness data extraction...');
      
      if (todaySummaryResponse.success && todaySummaryResponse.data) {
        // Check multiple possible structures for fitness data
        const fitnessData = todaySummaryResponse.data.fitness || todaySummaryResponse.data.exercise || todaySummaryResponse.data;
        console.log('TodaySummaryCard - Fitness data from summary:', fitnessData);
        
        if (fitnessData && (fitnessData.exercise_minutes || fitnessData.duration_minutes || fitnessData.distance_km)) {
          exerciseMinutes = parseInt(fitnessData.exercise_minutes) || parseInt(fitnessData.duration_minutes) || 0;
          distance = parseFloat(fitnessData.distance_km) || 0;
          console.log('TodaySummaryCard - Fitness from summary:', { exerciseMinutes, distance });
        } else {
          console.log('TodaySummaryCard - No fitness data in summary, trying individual API');
          try {
            // Use date-specific fitness API if date is provided
            let fitnessResponse;
            if (date) {
              fitnessResponse = await apiService.getFitnessHistory({ date });
              console.log('TodaySummaryCard - Fitness history response:', fitnessResponse);
              if (fitnessResponse.success && fitnessResponse.data && fitnessResponse.data.length > 0) {
                // Sum up fitness data from all entries for the date
                exerciseMinutes = fitnessResponse.data.reduce((total: number, entry: any) => {
                  return total + (entry.duration_minutes || 0);
                }, 0);
                distance = fitnessResponse.data.reduce((total: number, entry: any) => {
                  return total + (entry.distance_km || 0);
                }, 0);
              }
            } else {
              fitnessResponse = await apiService.getTodayFitness();
            }
            console.log('TodaySummaryCard - Fitness API response:', fitnessResponse);
            if (fitnessResponse.success && fitnessResponse.data) {
              // Handle the confirmed API response structure
              if (fitnessResponse.data.totals) {
                exerciseMinutes = fitnessResponse.data.totals.duration_minutes || fitnessResponse.data.totals.exercise_minutes || 0;
                distance = fitnessResponse.data.totals.distance_km || 0;
                console.log('TodaySummaryCard - Fitness from totals:', { exerciseMinutes, distance });
              } else {
                exerciseMinutes = fitnessResponse.data.exercise_minutes || fitnessResponse.data.duration_minutes || 0;
                distance = fitnessResponse.data.distance_km || 0;
                console.log('TodaySummaryCard - Fitness from direct:', { exerciseMinutes, distance });
              }
            }
          } catch (fitnessError) {
            console.error('TodaySummaryCard - Fitness API error:', fitnessError);
          }
          console.log('TodaySummaryCard - Exercise minutes:', exerciseMinutes, 'Distance:', distance);
        }
      } else {
        console.log('TodaySummaryCard - Summary failed, trying individual API for fitness');
        try {
          // Use date-specific fitness API if date is provided
          let fitnessResponse;
          if (date) {
            fitnessResponse = await apiService.getFitnessHistory({ date });
            console.log('TodaySummaryCard - Fitness history response:', fitnessResponse);
            if (fitnessResponse.success && fitnessResponse.data && fitnessResponse.data.length > 0) {
              // Sum up fitness data from all entries for the date
              exerciseMinutes = fitnessResponse.data.reduce((total: number, entry: any) => {
                return total + (entry.duration_minutes || 0);
              }, 0);
              distance = fitnessResponse.data.reduce((total: number, entry: any) => {
                return total + (entry.distance_km || 0);
              }, 0);
            }
          } else {
            fitnessResponse = await apiService.getTodayFitness();
          }
          console.log('TodaySummaryCard - Fitness API response:', fitnessResponse);
          if (fitnessResponse.success && fitnessResponse.data) {
            // Handle the confirmed API response structure
            if (fitnessResponse.data.totals) {
              exerciseMinutes = fitnessResponse.data.totals.duration_minutes || fitnessResponse.data.totals.exercise_minutes || 0;
              distance = fitnessResponse.data.totals.distance_km || 0;
              console.log('TodaySummaryCard - Fitness from totals:', { exerciseMinutes, distance });
            } else {
              exerciseMinutes = fitnessResponse.data.exercise_minutes || fitnessResponse.data.duration_minutes || 0;
              distance = fitnessResponse.data.distance_km || 0;
              console.log('TodaySummaryCard - Fitness from direct:', { exerciseMinutes, distance });
            }
          }
        } catch (fitnessError) {
          console.error('TodaySummaryCard - Fitness API error:', fitnessError);
        }
        console.log('TodaySummaryCard - Exercise minutes:', exerciseMinutes, 'Distance:', distance);
      }
      
      // Get step data from today summary (backend data takes priority)
      let steps = 0;
      if (todaySummaryResponse.success && todaySummaryResponse.data) {
        // Check multiple possible structures for steps data
        const fitnessData = todaySummaryResponse.data.fitness || todaySummaryResponse.data.exercise || todaySummaryResponse.data;
        if (fitnessData && fitnessData.steps) {
          steps = parseInt(fitnessData.steps) || 0;
          console.log('TodaySummaryCard - Steps from backend:', steps);
        } else {
          // Fallback to local activity data (only for today)
          steps = activityData?.steps || 0;
          console.log('TodaySummaryCard - Steps from local data:', steps);
        }
      } else {
        // Fallback to local activity data (only for today)
        steps = activityData?.steps || 0;
        console.log('TodaySummaryCard - Steps from local data:', steps);
      }
      
      const finalMetrics = {
        calories: Number(calories) || 0,
        waterIntake: Number(waterIntake / 1000) || 0, // Convert ml to liters
        steps: Number(steps) || 0,
        exerciseMinutes: Number(exerciseMinutes) || 0,
        distance: Number(distance || activityData?.distance || 0), // Use fitness data first, fallback to activity data
      };
      console.log('TodaySummaryCard - Final metrics calculated:', finalMetrics);
      console.log('TodaySummaryCard - Raw values:', { calories, waterIntake, steps, exerciseMinutes, distance });
      
      setMetrics(finalMetrics);

      // Calculate wellness score based on metrics
      const score = calculateWellnessScore({
        calories,
        waterIntake: waterIntake / 1000,
        steps,
        exerciseMinutes,
        distance: distance || activityData?.distance || 0,
      });
      setWellnessScore(score);
      console.log('TodaySummaryCard - Wellness score calculated:', score);
      
    } catch (error) {
      console.error('Error loading today data:', error);
      
      // Handle different types of errors appropriately
      if (error.message && error.message.includes('timeout')) {
        console.warn('Connection timeout detected, using cached/default data');
        // Don't show alert for timeout errors in background loading
      } else if (error.message && (error.message.includes('Authentication failed') || error.message.includes('401'))) {
        // Handle authentication errors silently - don't show alert for background data loading
        handleAuthError(error);
      } else {
        // For other errors, just log them without showing alerts
        console.warn('Data loading error (non-critical):', error.message);
      }
      
      // Set default values on error to prevent undefined values
      setMetrics({
        calories: 0,
        waterIntake: 0,
        steps: 0,
        exerciseMinutes: 0,
        distance: 0,
      });
      setWellnessScore(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateWellnessScore = (data: TodayMetrics): number => {
    let score = 0;
    
    // Ensure all values are valid numbers
    const safeSteps = Number(data.steps) || 0;
    const safeExerciseMinutes = Number(data.exerciseMinutes) || 0;
    const safeWaterIntake = Number(data.waterIntake) || 0;
    const safeCalories = Number(data.calories) || 0;
    const safeDistance = Number(data.distance) || 0;
    
    // Steps score (max 25 points)
    const stepsGoal = 10000;
    const stepsScore = Math.min((safeSteps / stepsGoal) * 25, 25);
    score += stepsScore;
    
    // Exercise score (max 25 points)
    const exerciseGoal = 30; // 30 minutes
    const exerciseScore = Math.min((safeExerciseMinutes / exerciseGoal) * 25, 25);
    score += exerciseScore;
    
    // Water intake score (max 25 points)
    const waterGoal = 2.5; // 2.5 liters
    const waterScore = Math.min((safeWaterIntake / waterGoal) * 25, 25);
    score += waterScore;
    
    // Calories score (max 25 points)
    const calorieGoal = 2000; // Daily intake goal
    const calorieScore = safeCalories > 0 ? Math.min((safeCalories / calorieGoal) * 25, 25) : 0;
    score += calorieScore;
    
    // Distance score (max 25 points)
    const distanceGoal = 10000; // 10,000 meters (10 km)
    const distanceScore = Math.min((safeDistance / distanceGoal) * 25, 25);
    score += distanceScore;

    return Math.round(score);
  };

  const formatValue = (value: number | undefined, type: string): string => {
    if (loading) return '...';
    
    // Handle undefined, null, or NaN values
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    
    // Ensure value is a number
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return '0';
    }
    
    switch (type) {
      case 'calories':
        return Number.isFinite(numValue) ? numValue.toString() : '--';
      case 'water':
        return numValue.toFixed(1);
      case 'steps':
        return Number.isFinite(numValue) ? numValue.toString() : '--';
      case 'exercise':
        return Number.isFinite(numValue) ? numValue.toString() : '--';
      case 'distance':
        return numValue.toFixed(1);
      default:
        return Number.isFinite(numValue) ? numValue.toString() : '--';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Hari Ini';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const metricsData = [
    {
      id: 1,
      icon: 'heart',
      value: formatValue(metrics.calories, 'calories'),
      unit: 'kcal',
      color: '#FF6B8A',
      label: 'Kalori',
      emptyMessage: 'Belum ada data makanan hari ini',
    },
    {
      id: 2,
      icon: 'cup-water',
      value: formatValue(metrics.waterIntake, 'water'),
      unit: 'L',
      color: '#3182CE',
      label: 'Air Minum',
      emptyMessage: 'Belum ada data air minum hari ini',
    },
    {
      id: 3,
      icon: 'walk',
      value: formatValue(metrics.steps, 'steps'),
      unit: 'langkah',
      color: '#38A169',
      label: 'Langkah',
      emptyMessage: 'Belum ada data langkah hari ini',
    },
    {
      id: 4,
      icon: 'run',
      value: formatValue(metrics.exerciseMinutes, 'exercise'),
      unit: 'menit',
      color: '#ED8936',
      label: 'Olahraga',
      emptyMessage: 'Belum ada data olahraga hari ini',
    },
    {
      id: 5,
      icon: 'map-marker-distance',
      value: formatValue(metrics.distance, 'distance'),
      unit: 'km',
      color: '#A1887F',
      label: 'Jarak',
      emptyMessage: 'Belum ada data jarak hari ini',
    },
  ];

  // Render untuk WellnessApp (dengan date picker, tanpa wellness score)
  if (isWellnessApp) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#E53E3E', '#C53030', '#B91C1C']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header dengan Date Picker */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Today's Summary</Text>
              <Text style={styles.dateText}>{formatDate(date || '')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => {
                // Trigger date picker from parent component
                if (onMoreDetailsPress) {
                  onMoreDetailsPress();
                }
              }}
              activeOpacity={0.8}
            >
              <Icon name="calendar" size={16} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>

          {/* Content - hanya metrics grid */}
          <View style={styles.content}>
            <View style={styles.metricsContainer}>
              {metricsData.map((metric) => (
                <View key={metric.id} style={styles.metricItem}>
                  <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
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
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Render untuk MainScreen (dengan wellness score, tanpa date picker)
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E53E3E', '#C53030', '#B91C1C']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Today's Summary</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Metrics Grid */}
          <View style={styles.metricsContainer}>
            {metricsData.map((metric) => (
              <View key={metric.id} style={styles.metricItem}>
                                  <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
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
                size={120}
                strokeWidth={10}
                backgroundColor="transparent"
                animated={true}
                duration={2000}
                showInnerGlow={true}
                modernStyle={true}
                gradient={{
                  colors: ['#FF6B8A', '#FFB347', '#4ECDC4'],
                  id: 'wellnessGradient'
                }}
                strokeColor="#FFB347"
              >
                <Text style={styles.wellnessValue}>{wellnessScore}</Text>
                <Text style={styles.wellnessLabel}>Skor{'\n'}Wellness</Text>
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
    shadowColor: '#673AB7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  datePickerButton: {
    padding: 8,
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
    backgroundColor: 'transparent',
    borderRadius: 55,
    padding: 8,
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  wellnessValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  wellnessLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 11,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  moreDetailsButton: {
    marginTop: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 20,
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

export default TodaySummaryCard; 