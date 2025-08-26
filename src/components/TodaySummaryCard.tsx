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

const { width, height } = Dimensions.get('window');

interface TodaySummaryCardProps {
  onMoreDetailsPress?: () => void;
  date?: string; // tanggal format yyyy-mm-dd
  refreshTrigger?: number; // Trigger refresh when this value changes
}

interface TodayMetrics {
  calories: number;
  waterIntake: number;
  steps: number;
  exerciseMinutes: number;
  distance: number;
}

const TodaySummaryCard: React.FC<TodaySummaryCardProps> = ({ onMoreDetailsPress, date, refreshTrigger }) => {
  console.log('TodaySummaryCard - Component initialized with props:', { date, refreshTrigger, isWellnessApp: !!date });
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
  const [forceZeroCalories, setForceZeroCalories] = useState(false); // Force zero calories flag


  // Deteksi apakah digunakan di WellnessApp (ada prop date) atau MainScreen
  const isWellnessApp = !!date;

  useEffect(() => {
    // Initialize date change detector
    dateChangeDetector.initialize();
    
    // Load data immediately when component mounts

    loadTodayData();
    
    // Listen for meal logged events to refresh data immediately
    const handleMealLogged = () => {
  
      setForceZeroCalories(false); // Reset force zero calories when new meal is logged
      setTimeout(() => {
        loadTodayData();
      }, 100); // Small delay to ensure state is updated
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
      
      // Immediately reset all metrics to zero
      setMetrics({
        calories: 0,
        waterIntake: 0,
        steps: 0,
        exerciseMinutes: 0,
        distance: 0,
      });
      setWellnessScore(0);
      setForceZeroCalories(true); // Force zero calories on daily reset
      
      // Force reload data after a short delay to ensure fresh data
      setTimeout(() => {
        console.log('TodaySummaryCard - Forcing data reload after reset...');
        loadTodayData();
      }, 100);
    };

    // Listen for cache cleared events
    const handleCacheCleared = () => {
      console.log('TodaySummaryCard - Cache cleared event detected, refreshing data...');
      setForceZeroCalories(false); // Reset force zero calories when cache is cleared
      setTimeout(() => {
        loadTodayData();
      }, 200); // Slightly longer delay to ensure cache is fully cleared
    };

    // Listen for force refresh events
    const handleForceRefreshAllData = () => {
      console.log('TodaySummaryCard - Force refresh all data event detected...');
      setForceZeroCalories(false);
      setTimeout(() => {
        loadTodayData();
      }, 300); // Longer delay for comprehensive refresh
    };

    // Listen for cache refreshed events
    const handleCacheRefreshed = () => {
      console.log('TodaySummaryCard - Cache refreshed event detected...');
      setForceZeroCalories(false);
      setTimeout(() => {
        loadTodayData();
      }, 150);
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
    eventEmitter.on('cacheCleared', handleCacheCleared);
    eventEmitter.on('forceRefreshAllData', handleForceRefreshAllData);
    eventEmitter.on('cacheRefreshed', handleCacheRefreshed);
    
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
      eventEmitter.off('cacheCleared', handleCacheCleared);
      eventEmitter.off('forceRefreshAllData', handleForceRefreshAllData);
      eventEmitter.off('cacheRefreshed', handleCacheRefreshed);
    };
  }, [date, isWellnessApp]);

  // Separate useEffect to handle date changes and refresh triggers
  useEffect(() => {
    if (date) {
      console.log('TodaySummaryCard - Date changed, reloading data for:', date);
      loadTodayData();
    }
  }, [date, refreshTrigger]);

  const loadTodayData = async () => {
    try {
      setLoading(true);

      
      console.log('TodaySummaryCard - Loading data for date:', date || 'today');
      
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
      console.log('TodaySummaryCard - Current date context:', date || 'today');
      console.log('TodaySummaryCard - Force zero calories flag:', forceZeroCalories);
      
      // If force zero calories is set, skip all API calls and set calories to 0
      if (forceZeroCalories) {
        console.log('TodaySummaryCard - FORCING ZERO CALORIES - skipping API calls');
        calories = 0;
      } else if (todaySummaryResponse.success && todaySummaryResponse.data) {
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
              console.log('TodaySummaryCard - Loading meal history for date:', date);
              nutritionResponse = await apiService.getMealHistory({ date });
              console.log('TodaySummaryCard - Nutrition history response:', nutritionResponse);
              if (nutritionResponse.success && nutritionResponse.data) {
                // Handle both response formats: response.data (array) and response.data.entries (array)
                let mealData = null;
                if (Array.isArray(nutritionResponse.data)) {
                  // Direct array format
                  mealData = nutritionResponse.data;
                } else if (nutritionResponse.data.entries && Array.isArray(nutritionResponse.data.entries)) {
                  // Nested entries format
                  mealData = nutritionResponse.data.entries;
                }
                
                if (mealData && mealData.length > 0) {
                  // Sum up calories from all foods in all meals for the date
                  calories = mealData.reduce((total: number, meal: any) => {
                    if (meal.foods && Array.isArray(meal.foods)) {
                      const mealCalories = meal.foods.reduce((foodTotal: number, food: any) => {
                        return foodTotal + (parseFloat(food.calories) || 0);
                      }, 0);
                      return total + mealCalories;
                    }
                    return total + (parseFloat(meal.calories) || 0);
                  }, 0);
                  console.log('TodaySummaryCard - Calories calculated from meal history:', calories);
                } else {
                  console.log('TodaySummaryCard - No meal history data found for date:', date);
                }
              } else {
                console.log('TodaySummaryCard - No meal history data found for date:', date);
              }
            } else {
              console.log('TodaySummaryCard - Loading today nutrition data');
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
          console.log('TodaySummaryCard - Final calories calculated:', calories);
        }
      } else {
        console.log('TodaySummaryCard - Summary failed, trying individual API');
        try {
          // Use date-specific nutrition API if date is provided
          let nutritionResponse;
          if (date) {
            // For historical data, we'll use the meal history with date filter
            console.log('TodaySummaryCard - Loading meal history for date (fallback):', date);
            nutritionResponse = await apiService.getMealHistory({ date });
            console.log('TodaySummaryCard - Nutrition history response (fallback):', nutritionResponse);
            if (nutritionResponse.success && nutritionResponse.data) {
              // Handle both response formats: response.data (array) and response.data.entries (array)
              let mealData = null;
              if (Array.isArray(nutritionResponse.data)) {
                // Direct array format
                mealData = nutritionResponse.data;
              } else if (nutritionResponse.data.entries && Array.isArray(nutritionResponse.data.entries)) {
                // Nested entries format
                mealData = nutritionResponse.data.entries;
              }
              
              if (mealData && mealData.length > 0) {
                // Sum up calories from all foods in all meals for the date
                calories = mealData.reduce((total: number, meal: any) => {
                  if (meal.foods && Array.isArray(meal.foods)) {
                    const mealCalories = meal.foods.reduce((foodTotal: number, food: any) => {
                      return foodTotal + (parseFloat(food.calories) || 0);
                    }, 0);
                    return total + mealCalories;
                  }
                  return total + (parseFloat(meal.calories) || 0);
                }, 0);
                console.log('TodaySummaryCard - Calories calculated from meal history (fallback):', calories);
              } else {
                console.log('TodaySummaryCard - No meal history data found for date (fallback):', date);
              }
            } else {
              console.log('TodaySummaryCard - No meal history data found for date (fallback):', date);
            }
          } else {
            console.log('TodaySummaryCard - Loading today nutrition data (fallback)');
            nutritionResponse = await apiService.getTodayNutrition();
          }
          console.log('TodaySummaryCard - Nutrition API response (fallback):', nutritionResponse);
          if (nutritionResponse.success && nutritionResponse.data) {
            // Handle the confirmed API response structure
            if (nutritionResponse.data.totals && nutritionResponse.data.totals.calories) {
              calories = nutritionResponse.data.totals.calories;
              console.log('TodaySummaryCard - Calories from totals.calories (fallback):', calories);
            } else if (nutritionResponse.data.calories) {
              calories = nutritionResponse.data.calories;
              console.log('TodaySummaryCard - Calories from direct calories (fallback):', calories);
            } else if (nutritionResponse.data.total_calories) {
              calories = nutritionResponse.data.total_calories;
              console.log('TodaySummaryCard - Calories from total_calories (fallback):', calories);
            }
          }
        } catch (nutritionError) {
          console.error('TodaySummaryCard - Nutrition API error (fallback):', nutritionError);
        }
      }

      // Get water data from summary or individual API
      let waterIntake = 0;
      if (todaySummaryResponse.success && todaySummaryResponse.data && todaySummaryResponse.data.water) {
        // Convert from milliliters to liters
        waterIntake = parseFloat(todaySummaryResponse.data.water.total_ml || 0) / 1000;
        console.log('TodaySummaryCard - Water from summary (L):', waterIntake);
      } else {
        try {
          let waterResponse;
          if (date) {
            waterResponse = await apiService.getWaterHistory({ date });
          } else {
            waterResponse = await apiService.getTodayWaterIntake();
          }
          console.log('TodaySummaryCard - Water response:', waterResponse);
          if (waterResponse.success && waterResponse.data) {
            // Handle both today water API (total_water_ml) and history API (entries array)
            if (waterResponse.data.total_water_ml) {
              // Today water API structure
              waterIntake = parseFloat(waterResponse.data.total_water_ml || 0) / 1000;
            } else if (waterResponse.data.entries && waterResponse.data.entries.length > 0) {
              // History API structure - sum up all entries
              const totalMl = waterResponse.data.entries.reduce((sum: number, entry: any) => sum + (parseFloat(entry.amount_ml) || 0), 0);
              waterIntake = totalMl / 1000;
            } else {
              // Fallback to old structure
              waterIntake = parseFloat(waterResponse.data.total_ml || waterResponse.data.amount_ml || 0) / 1000;
            }
          }
        } catch (waterError) {
          console.error('TodaySummaryCard - Water API error:', waterError);
        }
      }

      // Get fitness data from summary or individual API
      let steps = 0;
      let exerciseMinutes = 0;
      let distance = 0;
      if (todaySummaryResponse.success && todaySummaryResponse.data && todaySummaryResponse.data.fitness) {
        const fitnessData = todaySummaryResponse.data.fitness;
        steps = parseInt(fitnessData.steps || 0);
        exerciseMinutes = parseInt(fitnessData.exercise_minutes || 0);
        distance = parseFloat(fitnessData.distance_km || 0);
        console.log('TodaySummaryCard - Fitness from summary:', { steps, exerciseMinutes, distance });
      } else {
        try {
          let fitnessResponse;
          if (date) {
            fitnessResponse = await apiService.getFitnessHistory({ date });
          } else {
            fitnessResponse = await apiService.getTodayFitness();
          }
          console.log('TodaySummaryCard - Fitness response:', fitnessResponse);
          if (fitnessResponse.success && fitnessResponse.data) {
            // Handle both today fitness API (totals structure) and history API (entries structure)
            if (fitnessResponse.data.totals) {
              // Today fitness API structure
              steps = parseInt(fitnessResponse.data.totals.steps || 0);
              exerciseMinutes = parseInt(fitnessResponse.data.totals.exercise_minutes || fitnessResponse.data.totals.duration_minutes || 0);
              distance = parseFloat(fitnessResponse.data.totals.distance_km || 0);
            } else if (fitnessResponse.data.entries && fitnessResponse.data.entries.length > 0) {
              // History API structure - sum up all entries
              steps = fitnessResponse.data.entries.reduce((sum: number, entry: any) => sum + (parseInt(entry.steps) || 0), 0);
              exerciseMinutes = fitnessResponse.data.entries.reduce((sum: number, entry: any) => sum + (parseInt(entry.duration_minutes) || 0), 0);
              distance = fitnessResponse.data.entries.reduce((sum: number, entry: any) => sum + (parseFloat(entry.distance_km) || 0), 0);
            } else {
              // Fallback to old structure
              steps = parseInt(fitnessResponse.data.total_steps || fitnessResponse.data.steps || 0);
              exerciseMinutes = parseInt(fitnessResponse.data.total_exercise_minutes || fitnessResponse.data.exercise_minutes || 0);
              distance = parseFloat(fitnessResponse.data.total_distance_km || fitnessResponse.data.distance_km || 0);
            }
          }
        } catch (fitnessError) {
          console.error('TodaySummaryCard - Fitness API error:', fitnessError);
        }
      }

      // Combine activity data with API data
      if (activityData && !date) {
        steps = Math.max(steps, activityData.steps || 0);
        distance = Math.max(distance, activityData.distance || 0);
      }

      // Update metrics with fresh data
      const freshMetrics = {
        calories: Math.round(calories),
        waterIntake: Math.round(waterIntake * 10) / 10, // Round to 1 decimal place for water
        steps: Math.round(steps),
        exerciseMinutes: Math.round(exerciseMinutes),
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      };

      console.log('TodaySummaryCard - Final metrics:', freshMetrics);
      setMetrics(freshMetrics);

      // Calculate wellness score based on completed activities
      const wellnessScore = calculateWellnessScore(freshMetrics);
      setWellnessScore(wellnessScore);
      


    } catch (error) {
      console.error('TodaySummaryCard - Error loading today data:', error);

      // Set default values on error
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

  // Use test data if in test mode
  const displayMetrics = metrics;

  const metricsData = [
    {
      id: 1,
      icon: 'heart',
      value: formatValue(displayMetrics.calories, 'calories'),
      unit: 'kcal',
      color: '#FF6B8A',
      label: 'Kalori',
      emptyMessage: 'Belum ada data makanan hari ini',
    },
    {
      id: 2,
      icon: 'cup-water',
      value: formatValue(displayMetrics.waterIntake, 'water'),
      unit: 'L',
      color: '#3182CE',
      label: 'Air Minum',
      emptyMessage: 'Belum ada data air minum hari ini',
    },
    {
      id: 3,
      icon: 'walk',
      value: formatValue(displayMetrics.steps, 'steps'),
      unit: 'langkah',
      color: '#38A169',
      label: 'Langkah',
      emptyMessage: 'Belum ada data langkah hari ini',
    },
    {
      id: 4,
      icon: 'run',
      value: formatValue(displayMetrics.exerciseMinutes, 'exercise'),
      unit: 'menit',
      color: '#ED8936',
      label: 'Olahraga',
      emptyMessage: 'Belum ada data olahraga hari ini',
    },
    {
      id: 5,
      icon: 'map-marker-distance',
      value: formatValue(displayMetrics.distance, 'distance'),
      unit: 'km',
      color: '#A1887F',
      label: 'Jarak',
      emptyMessage: 'Belum ada data jarak hari ini',
    },
  ];

  // Render untuk WellnessApp (dengan date picker, tanpa wellness score)
  console.log('TodaySummaryCard - Rendering decision:', { isWellnessApp, date });
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
              <Text style={styles.title}>Ringkasan Hari Ini</Text>
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
  console.log('TodaySummaryCard - Rendering MainScreen version with metrics:', metrics, 'isWellnessApp:', isWellnessApp);
  
  // Add a simple test to see if component is rendering
  console.log('TodaySummaryCard - About to render MainScreen version');
  
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
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Ringkasan Hari Ini</Text>
            
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
            
                loadTodayData();
              }}
              disabled={loading}
            >
              <Icon name={loading ? "loading" : "refresh"} size={16} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>
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
                      {loading ? '...' : (metric.value === '0' || metric.value === '0.0' ? '--' : metric.value)}
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
                size={width < 350 ? 80 : 100}
                strokeWidth={width < 350 ? 6 : 8}
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
    padding: 16, // Reduced from 20 to give more space
    shadowColor: '#673AB7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 200, // Ensure minimum height
    overflow: 'hidden', // Prevent content overflow
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reduced from 16
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
  refreshButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    padding: 6,
    marginRight: 4,
  },
  content: {
    flexDirection: width < 350 ? 'column' : 'row', // Stack vertically on very small screens
    alignItems: width < 350 ? 'center' : 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12, // Reduced from 16
    flex: 1, // Take available space
  },
  metricsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginRight: width < 350 ? 0 : 8, // No right margin on small screens
    alignContent: 'flex-start', // Align items to top
    marginBottom: width < 350 ? 12 : 0, // Add bottom margin on small screens
  },
  metricItem: {
    width: width < 350 ? '100%' : '48%', // Full width on very small screens
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10, // Reduced from 12
    minHeight: 45, // Reduced from 50
    paddingHorizontal: 2, // Add small horizontal padding
  },
  iconContainer: {
    width: 26, // Reduced from 28
    height: 26, // Reduced from 28
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6, // Reduced from 8
    marginTop: 2,
  },
  metricContent: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
    flexWrap: 'wrap', // Allow wrapping for long values
  },
  metricValue: {
    fontSize: width < 350 ? 12 : 13, // Smaller font on small screens
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
    flexShrink: 1, // Allow shrinking if needed
    maxWidth: width < 350 ? 60 : 80, // Limit width on small screens
  },
  metricUnit: {
    fontSize: width < 350 ? 8 : 9, // Smaller font on small screens
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    flexShrink: 1, // Allow shrinking if needed
    maxWidth: width < 350 ? 40 : 50, // Limit width on small screens
  },
  metricLabel: {
    fontSize: width < 350 ? 7 : 8, // Smaller font on small screens
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
    flexShrink: 1, // Allow shrinking if needed
    maxWidth: width < 350 ? 70 : 90, // Limit width on small screens
  },
  wellnessContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: width < 350 ? 4 : 8, // Smaller margin on small screens
    paddingVertical: 4,
    minWidth: width < 350 ? 80 : 100, // Smaller minimum width on small screens
  },
  wellnessHoverWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 50, // Reduced from 55
    padding: 6, // Reduced from 8
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  wellnessValue: {
    fontSize: width < 350 ? 20 : 24, // Smaller font on small screens
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  wellnessLabel: {
    fontSize: width < 350 ? 7 : 8, // Smaller font on small screens
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginTop: 2, // Reduced from 3
    lineHeight: width < 350 ? 9 : 10, // Smaller line height on small screens
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  moreDetailsButton: {
    marginTop: 4, // Reduced from 5
    paddingHorizontal: 14, // Reduced from 16
    paddingVertical: 6, // Reduced from 8
    backgroundColor: 'transparent',
    borderRadius: 18, // Reduced from 20
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
    fontSize: 11, // Reduced from 12
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginRight: 4, // Reduced from 6
    letterSpacing: 0.3,
  },
});

export default TodaySummaryCard; 