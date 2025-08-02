import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text, useTheme, Card, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomTheme } from '../theme/theme';
import ProgressRing from '../components/ProgressRing';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface DetailedMetrics {
  today: {
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      meals: number;
    };
    hydration: {
      waterIntake: number;
      waterGoal: number;
      progress: number;
    };
    fitness: {
      steps: number;
      exerciseMinutes: number;
      caloriesBurned: number;
      distance: number;
      stepGoal: number;
      exerciseGoal: number;
      stepProgress: number;
      exerciseProgress: number;
    };
    sleep: {
      hours: number;
      quality: string | null;
      deepSleep: number;
      remSleep: number;
      efficiency: number;
      sleepGoal: number;
      progress: number;
    };
    mood: {
      level: string | null;
      stressLevel: string | null;
      energyLevel: string | null;
      score: number;
    };
  };
  weekly: {
    nutrition: {
      avgCalories: number;
      avgProtein: number;
      avgCarbs: number;
      avgFat: number;
      totalMeals: number;
    };
    hydration: {
      avgWaterIntake: number;
      totalWaterIntake: number;
      daysTracked: number;
    };
    fitness: {
      avgSteps: number;
      avgExerciseMinutes: number;
      avgCaloriesBurned: number;
      totalDistance: number;
      daysActive: number;
    };
    sleep: {
      avgHours: number;
      avgQuality: number;
      avgDeepSleep: number;
      avgRemSleep: number;
      avgEfficiency: number;
      daysTracked: number;
    };
    mood: {
      avgMoodScore: number;
      mostCommonMood: string | null;
      avgStressLevel: number;
      daysTracked: number;
    };
  };
  wellnessScore: number;
  insights: Array<{
    type: string;
    category: string;
    message: string;
    icon: string;
  }>;
  period: number;
  lastUpdated: string;
}

const HealthInsightsScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DetailedMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDetailedMetrics();
  }, []);

  const fetchDetailedMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getDetailedMetrics({ period: '7' });
      
      if (response.success) {
        setMetrics(response.data);
      } else {
        setError('Failed to load health metrics');
      }
    } catch (err) {
      console.error('Error fetching detailed metrics:', err);
      setError('Failed to load health metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDetailedMetrics();
    setRefreshing(false);
  };

  const getInsightColor = (category: string) => {
    switch (category) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'very_happy': return '😄';
      case 'happy': return '🙂';
      case 'neutral': return '😐';
      case 'sad': return '😔';
      case 'very_sad': return '😢';
      default: return '😐';
    }
  };

  const getSleepQualityText = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your health insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !metrics) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Failed to load data'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Health Insights</Text>
          <Text style={styles.subtitle}>Your comprehensive health overview</Text>
        </View>

        {/* Wellness Score Card */}
        <Card style={styles.wellnessCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.wellnessGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.wellnessContent}>
              <View style={styles.wellnessLeft}>
                <Text style={styles.wellnessTitle}>Wellness Score</Text>
                <Text style={styles.wellnessSubtitle}>Overall health rating</Text>
              </View>
              <View style={styles.wellnessRight}>
                <ProgressRing
                  progress={metrics.wellnessScore}
                  size={80}
                  strokeWidth={8}
                  strokeColor="#FFFFFF"
                  backgroundColor="rgba(255, 255, 255, 0.3)"
                  animated={true}
                >
                  <Text style={styles.wellnessScore}>{metrics.wellnessScore}</Text>
                </ProgressRing>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Today's Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          
          {/* Nutrition */}
          <Card style={styles.metricCard}>
            <Card.Content>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: '#FF6B8A20' }]}>
                  <Icon name="food-apple" size={24} color="#FF6B8A" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricTitle}>Nutrition</Text>
                  <Text style={styles.metricValue}>{metrics.today.nutrition.calories} kcal</Text>
                </View>
                <Chip mode="outlined" style={styles.mealChip}>
                  {metrics.today.nutrition.meals} meals
                </Chip>
              </View>
              <View style={styles.nutritionDetails}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>{metrics.today.nutrition.protein}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                  <Text style={styles.nutritionValue}>{metrics.today.nutrition.carbs}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>{metrics.today.nutrition.fat}g</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Hydration */}
          <Card style={styles.metricCard}>
            <Card.Content>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: '#4ECDC420' }]}>
                  <Icon name="cup-water" size={24} color="#4ECDC4" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricTitle}>Hydration</Text>
                  <Text style={styles.metricValue}>
                    {Math.round(metrics.today.hydration.waterIntake / 1000 * 10) / 10}L / {Math.round(metrics.today.hydration.waterGoal / 1000 * 10) / 10}L
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${metrics.today.hydration.progress}%`,
                          backgroundColor: '#4ECDC4'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{metrics.today.hydration.progress}%</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Fitness */}
          <Card style={styles.metricCard}>
            <Card.Content>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: '#96CEB420' }]}>
                  <Icon name="walk" size={24} color="#96CEB4" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricTitle}>Fitness</Text>
                  <Text style={styles.metricValue}>{metrics.today.fitness.steps.toString()} steps</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${metrics.today.fitness.stepProgress}%`,
                          backgroundColor: '#96CEB4'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(metrics.today.fitness.stepProgress)}%</Text>
                </View>
              </View>
              <View style={styles.fitnessDetails}>
                <View style={styles.fitnessItem}>
                  <Icon name="run" size={16} color="#6B7280" />
                  <Text style={styles.fitnessText}>{metrics.today.fitness.exerciseMinutes} min exercise</Text>
                </View>
                <View style={styles.fitnessItem}>
                  <Icon name="fire" size={16} color="#6B7280" />
                  <Text style={styles.fitnessText}>{metrics.today.fitness.caloriesBurned} cal burned</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Sleep */}
          <Card style={styles.metricCard}>
            <Card.Content>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: '#FFB34720' }]}>
                  <Icon name="bed" size={24} color="#FFB347" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricTitle}>Sleep</Text>
                  <Text style={styles.metricValue}>{metrics.today.sleep.hours}h</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${metrics.today.sleep.progress}%`,
                          backgroundColor: '#FFB347'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(metrics.today.sleep.progress)}%</Text>
                </View>
              </View>
              {metrics.today.sleep.quality && (
                <View style={styles.sleepDetails}>
                  <Text style={styles.sleepQuality}>
                    Quality: {getSleepQualityText(metrics.today.sleep.quality)}
                  </Text>
                  <Text style={styles.sleepStages}>
                    Deep: {metrics.today.sleep.deepSleep}h | REM: {metrics.today.sleep.remSleep}h
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Mood */}
          <Card style={styles.metricCard}>
            <Card.Content>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: '#DDA0DD20' }]}>
                  <Icon name="emoticon" size={24} color="#DDA0DD" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricTitle}>Mood</Text>
                  <Text style={styles.metricValue}>
                    {metrics.today.mood.level ? getMoodEmoji(metrics.today.mood.level) : '😐'}
                  </Text>
                </View>
                <View style={styles.moodScore}>
                  <Text style={styles.moodScoreText}>{metrics.today.mood.score}/100</Text>
                </View>
              </View>
              {metrics.today.mood.stressLevel && (
                <Text style={styles.stressLevel}>
                  Stress: {metrics.today.mood.stressLevel.replace('_', ' ')}
                </Text>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Weekly Averages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Averages</Text>
          
          <Card style={styles.weeklyCard}>
            <Card.Content>
              <View style={styles.weeklyGrid}>
                <View style={styles.weeklyItem}>
                  <Icon name="food-apple" size={20} color="#FF6B8A" />
                  <Text style={styles.weeklyValue}>{Math.round(metrics.weekly.nutrition.avgCalories)}</Text>
                  <Text style={styles.weeklyLabel}>Avg Calories</Text>
                </View>
                <View style={styles.weeklyItem}>
                  <Icon name="cup-water" size={20} color="#4ECDC4" />
                  <Text style={styles.weeklyValue}>{Math.round(metrics.weekly.hydration.avgWaterIntake / 1000 * 10) / 10}L</Text>
                  <Text style={styles.weeklyLabel}>Avg Water</Text>
                </View>
                <View style={styles.weeklyItem}>
                  <Icon name="walk" size={20} color="#96CEB4" />
                  <Text style={styles.weeklyValue}>{Math.round(metrics.weekly.fitness.avgSteps).toString()}</Text>
                  <Text style={styles.weeklyLabel}>Avg Steps</Text>
                </View>
                <View style={styles.weeklyItem}>
                  <Icon name="bed" size={20} color="#FFB347" />
                  <Text style={styles.weeklyValue}>{Math.round(metrics.weekly.sleep.avgHours * 10) / 10}h</Text>
                  <Text style={styles.weeklyLabel}>Avg Sleep</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Insights */}
        {metrics.insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Insights</Text>
            
            {metrics.insights.map((insight, index) => (
              <Card key={index} style={styles.insightCard}>
                <Card.Content>
                  <View style={styles.insightHeader}>
                    <View style={[styles.insightIcon, { backgroundColor: `${getInsightColor(insight.category)}20` }]}>
                      <Icon name={insight.icon} size={20} color={getInsightColor(insight.category)} />
                    </View>
                    <View style={styles.insightContent}>
                      <Text style={styles.insightMessage}>{insight.message}</Text>
                      <Chip 
                        mode="outlined" 
                        style={[styles.insightChip, { borderColor: getInsightColor(insight.category) }]}
                        textStyle={{ color: getInsightColor(insight.category) }}
                      >
                        {insight.category}
                      </Chip>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Last Updated */}
        <View style={styles.footer}>
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  wellnessCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  wellnessGradient: {
    padding: 20,
  },
  wellnessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wellnessLeft: {
    flex: 1,
  },
  wellnessTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  wellnessSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  wellnessRight: {
    alignItems: 'center',
  },
  wellnessScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  mealChip: {
    height: 24,
  },
  nutritionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 60,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  fitnessDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  fitnessItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fitnessText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  sleepDetails: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sleepQuality: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  sleepStages: {
    fontSize: 12,
    color: '#6B7280',
  },
  moodScore: {
    alignItems: 'center',
  },
  moodScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  stressLevel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  weeklyCard: {
    borderRadius: 12,
    elevation: 2,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyItem: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
    marginBottom: 2,
  },
  weeklyLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  insightCard: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default HealthInsightsScreen;
