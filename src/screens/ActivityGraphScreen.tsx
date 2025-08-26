import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import apiService from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";
import { formatDateToLocalYYYYMMDD } from "../utils/dateUtils";
import eventEmitter from "../utils/eventEmitter";

const { width } = Dimensions.get("window");
const CHART_HEIGHT = 220;
const CHART_BOTTOM_PADDING = 45;
const GRID_FACTOR = (CHART_HEIGHT - CHART_BOTTOM_PADDING) / CHART_HEIGHT; // align labels with grid area

interface WeeklyData {
  date: string;
  steps: number;
  waterIntake: number;
  sleepHours: number;
  moodScore: number;
  exerciseMinutes: number;
  calories: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: string;
    gradient: [string, string];
  }[];
}

const ActivityGraphScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user, isAuthenticated } = useAuth();
  
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [selectedChart, setSelectedChart] = useState<'steps' | 'water' | 'sleep' | 'mood' | 'exercise' | 'calories'>('steps');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Generate sample data for demonstration
  const generateSampleData = (): WeeklyData[] => {
    const data: WeeklyData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: formatDateToLocalYYYYMMDD(date),
        steps: Math.floor(Math.random() * 9000) + 1000, // 1000-10000 steps
        waterIntake: Math.floor(Math.random() * 4000) + 1000, // 1000-5000 ml
        sleepHours: Math.random() * 11 + 1, // 1-12 hours
        moodScore: Math.floor(Math.random() * 10) + 1, // 1-10 score
        exerciseMinutes: Math.floor(Math.random() * 120) + 15, // 15-135 minutes
        calories: Math.floor(Math.random() * 1500) + 800, // 800-2300 calories
      });
    }
    
    return data;
  };

  const loadWeeklyData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Prepare 7-day window
      const end = new Date();
      const start = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
          const endDateStr = formatDateToLocalYYYYMMDD(end);
    const startDateStr = formatDateToLocalYYYYMMDD(start);

      // Fetch weekly summary (includes fitness, water, sleep, nutrition, and mood)
      const weeklySummaryRes = await apiService.getWeeklySummary();
      console.log('📈 Weekly summary response:', weeklySummaryRes);

      // Build index maps per date
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        dates.push(formatDateToLocalYYYYMMDD(d));
      }

      const fitnessByDate: Record<string, { steps: number; exercise_minutes: number; calories?: number }> = {};
      const waterByDate: Record<string, number> = {};
      const sleepByDate: Record<string, number> = {};
      const caloriesByDate: Record<string, number> = {};
      const moodByDate: Record<string, number> = {};

      if (weeklySummaryRes && weeklySummaryRes.success && weeklySummaryRes.data && weeklySummaryRes.data.daily_breakdown) {
        const breakdown = weeklySummaryRes.data.daily_breakdown || {};
        const fitness = breakdown.fitness || [];
        const water = breakdown.water || [];
        const sleep = breakdown.sleep || [];
        const nutrition = breakdown.nutrition || [];
        console.log('🍽️ Nutrition breakdown:', nutrition);
        const mood = breakdown.mood || [];

        fitness.forEach((row: any) => {
          const dateKey = formatDateToLocalYYYYMMDD(new Date(row.date));
          fitnessByDate[dateKey] = {
            steps: Number(row.total_steps || 0),
            exercise_minutes: Number(row.total_exercise_minutes || 0),
          };
        });

        water.forEach((row: any) => {
          const dateKey = formatDateToLocalYYYYMMDD(new Date(row.date));
          waterByDate[dateKey] = Number(row.total_ml || 0);
        });

        sleep.forEach((row: any) => {
          const dateKey = formatDateToLocalYYYYMMDD(new Date(row.date));
          sleepByDate[dateKey] = Number(row.total_hours || 0);
        });

        nutrition.forEach((row: any) => {
          const dateKey = formatDateToLocalYYYYMMDD(new Date(row.date));
          const calories = Number(row.total_calories || 0);
          caloriesByDate[dateKey] = calories;
          console.log(`🍽️ Calories for ${dateKey}: ${calories}`);
        });
        
        // Mood: average mood score per day from weekly summary
        mood.forEach((row: any) => {
          const dateKey = formatDateToLocalYYYYMMDD(new Date(row.date));
          moodByDate[dateKey] = Number(row.avg_mood_score || 0);
        });
      }

      // No separate detailed metrics call needed; mood is from weekly summary

      const realData: WeeklyData[] = dates.map((date) => {
        const fitness = fitnessByDate[date] || { steps: 0, exercise_minutes: 0 };
        const calories = caloriesByDate[date] ?? 0;
        console.log(`📊 Final data for ${date}: calories = ${calories}`);
        return {
          date,
          steps: fitness.steps,
          waterIntake: waterByDate[date] ?? 0,
          sleepHours: sleepByDate[date] ?? 0,
          moodScore: moodByDate[date] ?? 0,
          exerciseMinutes: fitness.exercise_minutes,
          calories: calories,
        };
      });

      // Always show DB-backed data (even if zeros). Only fallback on request errors.
      setWeeklyData(realData);
      setLastSyncTime(new Date());
      
      // Show sync success message for refresh operations
      if (isRefresh) {
        setShowSyncSuccess(true);
        setTimeout(() => setShowSyncSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error loading weekly data:", error);
      // Do not use random sample data; show zeros to avoid misleading users
      const end = new Date();
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        dates.push(formatDateToLocalYYYYMMDD(d));
      }
      setWeeklyData(
        dates.map((date) => ({
          date,
          steps: 0,
          waterIntake: 0,
          sleepHours: 0,
          moodScore: 0,
          exerciseMinutes: 0,
          calories: 0,
        }))
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadWeeklyData();
    }
  }, [isAuthenticated, loadWeeklyData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        console.log('🔄 ActivityGraphScreen: Refreshing graph data on focus');
        loadWeeklyData();
      }
    }, [isAuthenticated, loadWeeklyData])
  );

  // Listen for data refresh events
  useEffect(() => {
    // Only set up event listeners if eventEmitter is available and has required methods
    if (!eventEmitter || typeof eventEmitter.on !== 'function') {
      console.warn('ActivityGraphScreen - eventEmitter not available or invalid, skipping event listeners');
      return;
    }

    const handleDataRefresh = () => {
      console.log('ActivityGraphScreen - Data refresh event received, refreshing graph data...');
      if (isAuthenticated) {
        loadWeeklyData(true);
      }
    };

    const handleMealLogged = () => {
      console.log('ActivityGraphScreen - Meal logged event received, refreshing graph data...');
      if (isAuthenticated) {
        loadWeeklyData(true);
      }
    };

    const handleWaterLogged = () => {
      console.log('ActivityGraphScreen - Water logged event received, refreshing graph data...');
      if (isAuthenticated) {
        loadWeeklyData(true);
      }
    };

    const handleFitnessLogged = () => {
      console.log('ActivityGraphScreen - Fitness logged event received, refreshing graph data...');
      if (isAuthenticated) {
        loadWeeklyData(true);
      }
    };

    const handleSleepLogged = () => {
      console.log('ActivityGraphScreen - Sleep logged event received, refreshing graph data...');
      if (isAuthenticated) {
        loadWeeklyData(true);
      }
    };

    const handleMoodLogged = () => {
      console.log('ActivityGraphScreen - Mood logged event received, refreshing graph data...');
      if (isAuthenticated) {
        loadWeeklyData(true);
      }
    };

    const handleWellnessActivityCompleted = () => {
      console.log('ActivityGraphScreen - Wellness activity completed, refreshing graph data...');
      if (isAuthenticated) {
        loadWeeklyData(true);
      }
    };

    const handleWellnessActivityUpdated = () => {
      console.log('ActivityGraphScreen - Wellness activity updated, refreshing graph data...');
      if (isAuthenticated) {
        loadWeeklyData(true);
      }
    };

    const handleWellnessActivityDeleted = () => {
      console.log('ActivityGraphScreen - Wellness activity deleted, refreshing graph data...');
      if (isAuthenticated) {
        loadWeeklyData(true);
      }
    };

    try {
      // Add event listeners
      eventEmitter.on('dataRefresh', handleDataRefresh);
      eventEmitter.on('mealLogged', handleMealLogged);
      eventEmitter.on('waterLogged', handleWaterLogged);
      eventEmitter.on('fitnessLogged', handleFitnessLogged);
      eventEmitter.on('sleepLogged', handleSleepLogged);
      eventEmitter.on('moodLogged', handleMoodLogged);
      eventEmitter.on('wellnessActivityCompleted', handleWellnessActivityCompleted);
      eventEmitter.on('wellnessActivityUpdated', handleWellnessActivityUpdated);
      eventEmitter.on('wellnessActivityDeleted', handleWellnessActivityDeleted);
    } catch (error) {
      console.error('ActivityGraphScreen - Error setting up event listeners:', error);
    }

    return () => {
      try {
              // Remove event listeners
      eventEmitter.off('dataRefresh', handleDataRefresh);
      eventEmitter.off('mealLogged', handleMealLogged);
      eventEmitter.off('waterLogged', handleWaterLogged);
      eventEmitter.off('fitnessLogged', handleFitnessLogged);
      eventEmitter.off('sleepLogged', handleSleepLogged);
      eventEmitter.off('moodLogged', handleMoodLogged);
      eventEmitter.off('wellnessActivityCompleted', handleWellnessActivityCompleted);
      eventEmitter.off('wellnessActivityUpdated', handleWellnessActivityUpdated);
      eventEmitter.off('wellnessActivityDeleted', handleWellnessActivityDeleted);
      } catch (error) {
        console.error('ActivityGraphScreen - Error removing event listeners:', error);
      }
    };
  }, [isAuthenticated, loadWeeklyData]);

  const getChartData = (): ChartData => {
    const labels = weeklyData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('id-ID', { weekday: 'short' });
    });

    const datasets = [{
      data: weeklyData.map(item => {
        switch (selectedChart) {
          case 'steps':
            return item.steps;
          case 'water':
            return item.waterIntake;
          case 'sleep':
            return item.sleepHours;
          case 'mood':
            return item.moodScore;
          case 'exercise':
            return item.exerciseMinutes;
          case 'calories':
            return item.calories;
          default:
            return item.steps;
        }
      }),
      color: getChartColor(selectedChart),
      gradient: getChartGradient(selectedChart),
    }];

    return { labels, datasets };
  };

  const getChartColor = (chartType: string): string => {
    switch (chartType) {
      case 'steps': return '#F59E0B';
      case 'water': return '#3B82F6';
      case 'sleep': return '#8B5CF6';
      case 'mood': return '#F59E0B';
      case 'exercise': return '#EF4444';
      case 'calories': return '#FF6B8A';
      default: return '#10B981';
    }
  };

  const getChartGradient = (chartType: string): [string, string] => {
    switch (chartType) {
      case 'steps': return ['#FDBA74', '#F59E0B'];
      case 'water': return ['#3B82F6', '#2563EB'];
      case 'sleep': return ['#8B5CF6', '#7C3AED'];
      case 'mood': return ['#F59E0B', '#D97706'];
      case 'exercise': return ['#EF4444', '#DC2626'];
      case 'calories': return ['#FF6B8A', '#E22345'];
      default: return ['#10B981', '#059669'];
    }
  };

  const getChartTitle = (chartType: string): string => {
    switch (chartType) {
      case 'steps': return 'Langkah Harian';
      case 'water': return 'Konsumsi Air';
      case 'sleep': return 'Jam Tidur';
      case 'mood': return 'Skor Mood';
      case 'exercise': return 'Olahraga';
      case 'calories': return 'Kalori';
      default: return 'Langkah Harian';
    }
  };

  const getChartUnit = (chartType: string): string => {
    switch (chartType) {
      case 'steps': return 'steps';
      case 'water': return 'ml';
      case 'sleep': return 'jam';
      case 'mood': return '/10';
      case 'exercise': return 'menit';
      case 'calories': return 'kcal';
      default: return '';
    }
  };

  // Helper to produce a pleasant Y-axis maximum for steps like 2500, 3000, ...
  const getNiceMaxForSteps = (values: number[]): number => {
    if (values.length === 0) return 0;
    const rawMax = Math.max(...values);
    const padded = rawMax + 100; // give a little headroom so tallest bar does not touch the top
    return Math.ceil(padded / 500) * 500; // round up to the nearest 500
  };

  const roundToNearest = (value: number, step: number): number => {
    if (step <= 0) return value;
    return Math.round(value / step) * step;
  };

  const getRoundingStepFor = (chartType: string): number => {
    switch (chartType) {
      case 'steps':
        return 100;
      case 'water':
        return 100; // ml
      case 'sleep':
        return 1; // hours
      case 'mood':
        return 1; // score
      case 'exercise':
        return 5; // minutes
      case 'calories':
        return 50; // kcal
      default:
        return 1;
    }
  };

  const getAverageValue = (): number => {
    if (weeklyData.length === 0) return 0;
    
    const values = weeklyData.map(item => {
      switch (selectedChart) {
        case 'steps': return item.steps;
        case 'water': return item.waterIntake;
        case 'sleep': return item.sleepHours;
        case 'mood': return item.moodScore;
        case 'exercise': return item.exerciseMinutes;
        case 'calories': return item.calories;
        default: return item.steps;
      }
    });
    
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  };

  const getMaxValue = (): number => {
    if (weeklyData.length === 0) return 0;
    
    const values = weeklyData.map(item => {
      switch (selectedChart) {
        case 'steps': return item.steps;
        case 'water': return item.waterIntake;
        case 'sleep': return item.sleepHours;
        case 'mood': return item.moodScore;
        case 'exercise': return item.exerciseMinutes;
        case 'calories': return item.calories;
        default: return item.steps;
      }
    });
    
    const maxValue = Math.max(...values);
    
    // Set appropriate max values based on chart type
    switch (selectedChart) {
      case 'steps': return getNiceMaxForSteps(values);
      case 'water': return Math.max(maxValue, 5000);
      case 'sleep': return Math.max(maxValue, 12);
      case 'mood': return Math.max(maxValue, 10);
      case 'exercise': return Math.max(maxValue, 120);
      case 'calories': return Math.max(maxValue, 2500);
      default: return maxValue;
    }
  };

  // Highest value actually achieved (no baseline floor). If no data, return 0.
  const getHighestValueAchieved = (): number => {
    if (weeklyData.length === 0) return 0;
    const values = weeklyData.map(item => {
      switch (selectedChart) {
        case 'steps': return item.steps;
        case 'water': return item.waterIntake;
        case 'sleep': return item.sleepHours;
        case 'mood': return item.moodScore;
        case 'exercise': return item.exerciseMinutes;
        case 'calories': return item.calories;
        default: return item.steps;
      }
    });
    return Math.max(...values, 0);
  };

  const getYAxisLabels = (): number[] => {
    const maxValue = getMaxValue();
    const step = getRoundingStepFor(selectedChart);
    return [
      roundToNearest(maxValue, step),
      roundToNearest(maxValue * 0.75, step),
      roundToNearest(maxValue * 0.5, step),
      roundToNearest(maxValue * 0.25, step),
      0,
    ];
  };

  const renderBarChart = () => {
    const chartData = getChartData();
    const maxValue = getMaxValue();
    
    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          {(() => {
            const ticks = getYAxisLabels();
            const usableHeight = CHART_HEIGHT - CHART_BOTTOM_PADDING;
            return ticks.map((value, index) => {
              const pos = (index / (ticks.length - 1)) * usableHeight;
              return (
                <View
                  key={index}
                  style={[styles.yAxisLabel, { top: pos - 10 }]}
                >
                  <Text style={styles.yAxisText}>{value.toLocaleString()}</Text>
                </View>
              );
            });
          })()}
        </View>
        
        {/* Y-axis title */}
        <View style={styles.yAxisTitleContainer}>
          <Text style={styles.yAxisTitleText}>{getChartUnit(selectedChart)}</Text>
        </View>
        
        {/* Chart bars */}
        <View style={styles.chartBars}>
          {/* Horizontal grid lines */}
          {(() => {
            const ticks = getYAxisLabels();
            const usableHeight = CHART_HEIGHT - CHART_BOTTOM_PADDING;
            return ticks.map((value, index) => {
              const pos = (index / (ticks.length - 1)) * usableHeight;
              // draw baseline slightly thicker
              const isBaseline = index === ticks.length - 1; // last tick is 0
              return (
                <View key={`grid-${value}`} style={[styles.gridLine, { top: pos, height: isBaseline ? 2 : 1 }]} />
              );
            });
          })()}
          
          {weeklyData.map((item, index) => {
            const dateObj = new Date(item.date);
            const labelDow = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
            const labelDate = dateObj.getDate().toString().padStart(2, '0');
            const value = chartData.datasets[0].data[index];
            const maxValueForChart = getMaxValue();
            const percentage = maxValueForChart > 0 ? (value / maxValueForChart) * 100 : 0;
            
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <LinearGradient
                    colors={chartData.datasets[0].gradient}
                    style={[
                      styles.chartBar,
                      { height: Math.max((percentage / 100) * (CHART_HEIGHT - CHART_BOTTOM_PADDING), 20) }
                    ]}
                  />
                </View>
                <View style={styles.barLabelGroup}>
                  <Text style={styles.barLabelDow}>{labelDow}</Text>
                  <Text style={styles.barLabelDate}>{labelDate}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Line chart removed; bar chart is the only chart type

  const renderChartSelector = () => {
    const chartTypes = [
      { key: 'steps', icon: 'walk', label: 'Langkah' },
      { key: 'water', icon: 'cup-water', label: 'Air' },
      { key: 'sleep', icon: 'sleep', label: 'Tidur' },
      { key: 'mood', icon: 'emoticon', label: 'Mood' },
      { key: 'exercise', icon: 'dumbbell', label: 'Olahraga' },
      { key: 'calories', icon: 'food-apple', label: 'Kalori' },
    ];

    return (
      <View style={styles.chartSelectorContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartSelectorScroll}
        >
          {chartTypes.map((chart) => (
            <TouchableOpacity
              key={chart.key}
              style={[
                styles.chartSelectorButton,
                selectedChart === chart.key && styles.chartSelectorButtonActive
              ]}
              onPress={() => setSelectedChart(chart.key as any)}
            >
              <LinearGradient
                colors={selectedChart === chart.key ? getChartGradient(chart.key) : ['#F3F4F6', '#E5E7EB']}
                style={styles.chartSelectorGradient}
              >
                <Icon 
                  name={chart.icon} 
                  size={20} 
                  color={selectedChart === chart.key ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.chartSelectorText,
                  selectedChart === chart.key && styles.chartSelectorTextActive
                ]}>
                  {chart.label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderStats = () => {
    const average = getAverageValue();
    const max = getHighestValueAchieved();
    const today = weeklyData[weeklyData.length - 1];
    const todayValue = today ? (() => {
      switch (selectedChart) {
        case 'steps': return today.steps;
        case 'water': return today.waterIntake;
        case 'sleep': return today.sleepHours;
        case 'mood': return today.moodScore;
        case 'exercise': return today.exerciseMinutes;
        case 'calories': return today.calories;
        default: return today.steps;
      }
    })() : 0;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Hari Ini</Text>
          <Text style={styles.statValue}>{todayValue.toLocaleString()}</Text>
          <Text style={styles.statUnit}>{getChartUnit(selectedChart)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Rata-rata</Text>
          <Text style={styles.statValue}>{average.toLocaleString()}</Text>
          <Text style={styles.statUnit}>{getChartUnit(selectedChart)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tertinggi</Text>
          <Text style={styles.statValue}>{max.toLocaleString()}</Text>
          <Text style={styles.statUnit}>{getChartUnit(selectedChart)}</Text>
        </View>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.authPrompt}>
          <Icon name="chart-line" size={64} color="#E22345" />
          <Text style={styles.authPromptTitle}>Activity Graphs</Text>
          <Text style={styles.authPromptSubtitle}>
            Login untuk melihat grafik aktivitas Anda
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => safeGoBack(navigation, 'WellnessApp')}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Activity Graphs</Text>
          <Text style={styles.headerSubtitle}>
            Monitor aktivitas mingguan Anda
            {lastSyncTime && (
              <Text style={styles.syncTime}>
                {' • Terakhir sync: ' + lastSyncTime.toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            )}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadWeeklyData(true)}
          disabled={loading || refreshing}
        >
          <Icon 
            name={loading || refreshing ? "loading" : "refresh"} 
            size={20} 
            color={loading || refreshing ? "#9CA3AF" : "#667eea"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadWeeklyData(true)}
            colors={["#E22345"]}
            tintColor="#E22345"
          />
        }
      >
        {/* Chart Type Selector */}
        {renderChartSelector()}

        {/* Chart Title and Stats */}
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Text style={styles.chartTitle}>{getChartTitle(selectedChart)}</Text>
            <Text style={styles.chartSubtitle}>
              7 hari terakhir
              {refreshing && (
                <Text style={styles.syncIndicator}> • Sinkronisasi...</Text>
              )}
            </Text>
          </View>
          
          {/* Toggle Controls */}
          <View style={styles.toggleControls}>
            <View style={styles.toggleGroup}>
              <Text style={styles.toggleLabel}>Periode:</Text>
              <View style={styles.chartTypeToggle}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    timeRange === 'week' && styles.toggleButtonActive
                  ]}
                  onPress={() => setTimeRange('week')}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    timeRange === 'week' && styles.toggleButtonTextActive
                  ]}>Minggu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    timeRange === 'month' && styles.toggleButtonActive
                  ]}
                  onPress={() => setTimeRange('month')}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    timeRange === 'month' && styles.toggleButtonTextActive
                  ]}>Bulan</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* chart type toggle removed */}
          </View>
        </View>

        {/* Stats Cards */}
        {renderStats()}

        {/* Sync Success Message */}
        {showSyncSuccess && (
          <View style={styles.syncSuccessContainer}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.syncSuccessCard}
            >
              <Icon name="check-circle" size={20} color="#FFFFFF" />
              <Text style={styles.syncSuccessText}>Data berhasil disinkronkan</Text>
            </LinearGradient>
          </View>
        )}

        {/* Chart Container */}
        <View style={styles.chartWrapper}>
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={styles.chartCard}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={getChartColor(selectedChart)} />
                <Text style={styles.loadingText}>Memuat data grafik...</Text>
              </View>
            ) : weeklyData.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Icon name="chart-line-variant" size={48} color="#CBD5E1" />
                <Text style={styles.noDataText}>Belum ada data aktivitas</Text>
                <Text style={styles.noDataSubtext}>Mulai tracking untuk melihat grafik</Text>
              </View>
            ) : (
              <>
                {/* Render bar chart only */}
                {renderBarChart()}
              </>
            )}
          </LinearGradient>
        </View>

        {/* Additional Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <Icon name="lightbulb" size={20} color="#F59E0B" />
            <Text style={styles.insightText}>
              {selectedChart === 'steps' && 'Target harian: 10,000 langkah (Range: 1,000-10,000)'}
              {selectedChart === 'water' && 'Target harian: 2,000 ml air (Range: 1,000-5,000 ml)'}
              {selectedChart === 'sleep' && 'Target harian: 7-9 jam tidur (Range: 1-12 jam)'}
              {selectedChart === 'mood' && 'Target harian: Skor mood 8+ (Range: 1-10)'}
              {selectedChart === 'exercise' && 'Target harian: 30 menit olahraga (Range: 15-135 menit)'}
              {selectedChart === 'calories' && 'Target harian: Sesuai kebutuhan tubuh (Range: 800-2,500 kcal)'}
            </Text>
          </View>
          
          <View style={[styles.insightCard, { backgroundColor: "#EFF6FF", borderLeftColor: "#3B82F6" }]}>
            <Icon name="information" size={20} color="#3B82F6" />
            <Text style={[styles.insightText, { color: "#1E40AF" }]}>
              Menampilkan grafik bar untuk {getChartTitle(selectedChart).toLowerCase()}
            </Text>
          </View>

          <View style={[styles.insightCard, { backgroundColor: "#F0FDF4", borderLeftColor: "#10B981" }]}>
            <Icon name="database" size={20} color="#10B981" />
            <Text style={[styles.insightText, { color: "#166534" }]}>
              Data sinkronisasi langsung dari database • Auto-refresh saat ada aktivitas baru
              {(!eventEmitter || typeof eventEmitter.on !== 'function') && (
                <Text style={[styles.insightText, { color: "#DC2626", fontSize: 12 }]}>
                  {'\n'}⚠️ Real-time updates tidak tersedia
                </Text>
              )}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  syncTime: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  syncIndicator: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },
  syncSuccessContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  syncSuccessCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncSuccessText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  refreshButton: {
    padding: 8,
  },
  chartSelectorContainer: {
    marginVertical: 20,
  },
  chartSelectorScroll: {
    paddingHorizontal: 20,
  },
  chartSelectorButton: {
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  chartSelectorButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartSelectorGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chartSelectorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 8,
  },
  chartSelectorTextActive: {
    color: "#FFFFFF",
  },
  chartHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  toggleControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  toggleGroup: {
    alignItems: "center",
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  chartTitleContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  chartTypeToggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    padding: 2,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleButtonTextActive: {
    color: "#1F2937",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  chartWrapper: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  chartContainer: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "flex-end",
    position: "relative",
    paddingTop: 30,
  },
  yAxisContainer: {
    width: 50,
    height: CHART_HEIGHT,
    marginRight: 12,
    alignItems: "flex-end",
    position: "relative",
  },
  yAxisTitleContainer: {
    position: "absolute",
    top: -25,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
  },
  yAxisTitleText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  yAxisLabel: {
    alignItems: "flex-end",
    justifyContent: "center",
    height: 20,
    position: "absolute",
    marginTop: 0,
  },
  yAxisText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "right",
  },
  chartBars: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: CHART_HEIGHT,
    paddingBottom: 45,
    paddingHorizontal: 10,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E7EB",
    opacity: 0.5,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },

  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    width: 20,
    marginBottom: 0,
  },
  chartBar: {
    width: "100%",
    borderRadius: 12,
    minHeight: 20,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    position: "absolute",
    bottom: -25,
  },
  barLabelGroup: {
    alignItems: "center",
    position: "absolute",
    bottom: -30,
  },
  barLabelDow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    lineHeight: 14,
  },
  barLabelDate: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    lineHeight: 12,
  },
  // Line chart styles removed
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 12,
    fontWeight: "500",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 12,
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  insightsContainer: {
    paddingHorizontal: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: "#92400E",
    marginLeft: 12,
    flex: 1,
    fontWeight: "500",
  },
  authPrompt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  authPromptSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: "#E22345",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ActivityGraphScreen;
