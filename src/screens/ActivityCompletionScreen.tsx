import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { safeGoBack } from "../utils/safeNavigation";

interface ActivityCompletionData {
  activity_id: number;
  activity_name: string;
  activity_type: string;
  activity_category: string;
  duration: number;
  notes?: string;
  mood_before?: string;
  mood_after?: string;
  stress_level_before?: string;
  stress_level_after?: string;
}

interface ActivityCompletionScreenProps {
  route: {
    params: {
      activity: {
        id: number;
        title: string;
        description: string;
        category: string;
        duration_minutes: number;
        difficulty: string;
        points: number;
        calories_burn?: number;
        instructions?: string;
      };
    };
  };
  navigation: any;
}

const ActivityCompletionScreen = ({ route, navigation }: ActivityCompletionScreenProps) => {
  const { activity } = route.params;
  const { isAuthenticated, user } = useAuth();
  const [completionData, setCompletionData] = useState<ActivityCompletionData>({
    activity_id: activity.id,
    activity_name: activity.title,
    activity_type: 'beginner',
    activity_category: activity.category,
    duration: activity.duration_minutes,
    notes: '',
    mood_before: '',
    mood_after: '',
    stress_level_before: '',
    stress_level_after: ''
  });
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Activity categories with base points
  const activityCategories = {
    fitness: { name: 'Fitness', basePoints: 15, icon: '🏃‍♂️' },
    nutrition: { name: 'Nutrition', basePoints: 10, icon: '🥗' },
    wellness: { name: 'Wellness', basePoints: 12, icon: '🧘‍♀️' },
    mindfulness: { name: 'Mindfulness', basePoints: 8, icon: '🧠' },
    health: { name: 'Health', basePoints: 10, icon: '❤️' },
    sports: { name: 'Sports', basePoints: 20, icon: '⚽' },
    meditation: { name: 'Meditation', basePoints: 6, icon: '🧘‍♂️' },
    yoga: { name: 'Yoga', basePoints: 12, icon: '🧘‍♀️' }
  };

  // Activity types with difficulty multipliers
  const activityTypes = {
    beginner: { name: 'Beginner', multiplier: 1.0 },
    intermediate: { name: 'Intermediate', multiplier: 1.2 },
    advanced: { name: 'Advanced', multiplier: 1.5 },
    expert: { name: 'Expert', multiplier: 2.0 }
  };

  // Calculate points when completion data changes
  useEffect(() => {
    if (completionData.activity_category && completionData.activity_type && completionData.duration) {
      const category = activityCategories[completionData.activity_category as keyof typeof activityCategories];
      const type = activityTypes[completionData.activity_type as keyof typeof activityTypes];
      
      if (category && type) {
        const basePoints = category.basePoints;
        const multiplier = type.multiplier;
        const durationMultiplier = Math.min(completionData.duration / 30, 2); // Max 2x for duration
        const calculated = Math.round(basePoints * multiplier * durationMultiplier);
        setCalculatedPoints(calculated);
      }
    } else {
      setCalculatedPoints(0);
    }
  }, [completionData.activity_category, completionData.activity_type, completionData.duration]);

  const handleCompleteActivity = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Error', 'Please login to complete activities');
      return;
    }

    if (!completionData.duration || completionData.duration <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    setIsSubmitting(true);

    try {
      const activityData = {
        user_id: user.id,
        activity_id: completionData.activity_id,
        activity_name: completionData.activity_name,
        activity_type: completionData.activity_type,
        activity_category: completionData.activity_category,
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
          'Success! 🎉',
          `Activity completed successfully!\n\nYou earned ${calculatedPoints} points.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to complete activity');
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      Alert.alert('Error', 'Failed to complete activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPointsCalculation = () => (
    <View style={styles.pointsCard}>
      <View style={styles.pointsHeader}>
        <Icon name="calculator" size={24} color="#F59E0B" />
        <Text style={styles.pointsTitle}>Points Calculation</Text>
      </View>
      <View style={styles.pointsInfo}>
        <View style={styles.pointsRow}>
          <Text style={styles.pointsLabel}>Base Points:</Text>
          <Text style={styles.pointsValue}>
            {activityCategories[completionData.activity_category as keyof typeof activityCategories]?.basePoints || 0}
          </Text>
        </View>
        <View style={styles.pointsRow}>
          <Text style={styles.pointsLabel}>Difficulty Multiplier:</Text>
          <Text style={styles.pointsValue}>
            x{activityTypes[completionData.activity_type as keyof typeof activityTypes]?.multiplier || 1}
          </Text>
        </View>
        <View style={styles.pointsRow}>
          <Text style={styles.pointsLabel}>Duration Multiplier:</Text>
          <Text style={styles.pointsValue}>
            x{Math.min(completionData.duration / 30, 2).toFixed(1)}
          </Text>
        </View>
        <View style={styles.pointsDivider} />
        <View style={styles.pointsRow}>
          <Text style={styles.pointsLabelTotal}>Total Points:</Text>
          <Text style={styles.pointsValueTotal}>{calculatedPoints}</Text>
        </View>
      </View>
    </View>
  );

  const renderFormSection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Activity Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Activity Type</Text>
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
        <Text style={styles.inputLabel}>Duration (minutes)</Text>
        <TextInput
          style={styles.textInput}
          value={completionData.duration.toString()}
          onChangeText={(text) => setCompletionData(prev => ({ 
            ...prev, 
            duration: parseInt(text) || 0 
          }))}
          keyboardType="numeric"
          placeholder="30"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Notes (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={completionData.notes}
          onChangeText={(text) => setCompletionData(prev => ({ ...prev, notes: text }))}
          placeholder="Add any notes about this activity..."
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderMoodSection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Mood & Stress Tracking</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mood Before</Text>
        <View style={styles.pickerContainer}>
          {[
            { key: 'very_happy', label: '😊 Very Happy' },
            { key: 'happy', label: '🙂 Happy' },
            { key: 'neutral', label: '😐 Neutral' },
            { key: 'sad', label: '😔 Sad' },
            { key: 'very_sad', label: '😢 Very Sad' }
          ].map((mood) => (
            <TouchableOpacity
              key={mood.key}
              style={[
                styles.pickerOption,
                completionData.mood_before === mood.key && styles.pickerOptionSelected
              ]}
              onPress={() => setCompletionData(prev => ({ ...prev, mood_before: mood.key }))}
            >
              <Text style={[
                styles.pickerOptionText,
                completionData.mood_before === mood.key && styles.pickerOptionTextSelected
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mood After</Text>
        <View style={styles.pickerContainer}>
          {[
            { key: 'very_happy', label: '😊 Very Happy' },
            { key: 'happy', label: '🙂 Happy' },
            { key: 'neutral', label: '😐 Neutral' },
            { key: 'sad', label: '😔 Sad' },
            { key: 'very_sad', label: '😢 Very Sad' }
          ].map((mood) => (
            <TouchableOpacity
              key={mood.key}
              style={[
                styles.pickerOption,
                completionData.mood_after === mood.key && styles.pickerOptionSelected
              ]}
              onPress={() => setCompletionData(prev => ({ ...prev, mood_after: mood.key }))}
            >
              <Text style={[
                styles.pickerOptionText,
                completionData.mood_after === mood.key && styles.pickerOptionTextSelected
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Stress Level Before</Text>
        <View style={styles.pickerContainer}>
          {[
            { key: 'low', label: '😌 Low' },
            { key: 'moderate', label: '😐 Moderate' },
            { key: 'high', label: '😰 High' },
            { key: 'very_high', label: '😱 Very High' }
          ].map((stress) => (
            <TouchableOpacity
              key={stress.key}
              style={[
                styles.pickerOption,
                completionData.stress_level_before === stress.key && styles.pickerOptionSelected
              ]}
              onPress={() => setCompletionData(prev => ({ ...prev, stress_level_before: stress.key }))}
            >
              <Text style={[
                styles.pickerOptionText,
                completionData.stress_level_before === stress.key && styles.pickerOptionTextSelected
              ]}>
                {stress.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Stress Level After</Text>
        <View style={styles.pickerContainer}>
          {[
            { key: 'low', label: '😌 Low' },
            { key: 'moderate', label: '😐 Moderate' },
            { key: 'high', label: '😰 High' },
            { key: 'very_high', label: '😱 Very High' }
          ].map((stress) => (
            <TouchableOpacity
              key={stress.key}
              style={[
                styles.pickerOption,
                completionData.stress_level_after === stress.key && styles.pickerOptionSelected
              ]}
              onPress={() => setCompletionData(prev => ({ ...prev, stress_level_after: stress.key }))}
            >
              <Text style={[
                styles.pickerOptionText,
                completionData.stress_level_after === stress.key && styles.pickerOptionTextSelected
              ]}>
                {stress.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#FAFBFC', '#F7FAFC']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Complete Activity</Text>
          <Text style={styles.headerSubtitle}>{activity.title}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Activity Info */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Icon name="heart-pulse" size={32} color="#10B981" />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
            </View>
          </View>
          <View style={styles.activityStats}>
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={16} color="#6B7280" />
              <Text style={styles.statText}>{activity.duration_minutes} min</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={16} color="#6B7280" />
              <Text style={styles.statText}>{activity.points} points</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="fire" size={16} color="#6B7280" />
              <Text style={styles.statText}>{activity.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Points Calculation */}
        {renderPointsCalculation()}

        {/* Form Sections */}
        {renderFormSection()}
        {renderMoodSection()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteActivity}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={isSubmitting ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
            style={styles.completeButtonGradient}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Completing...</Text>
              </View>
            ) : (
              <Text style={styles.completeButtonText}>
                Complete Activity ({calculatedPoints} points)
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
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
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  pointsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  pointsInfo: {
    gap: 8,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#92400E',
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  pointsLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  pointsValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
  },
  pointsDivider: {
    height: 1,
    backgroundColor: '#F59E0B',
    marginVertical: 8,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
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
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
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
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  completeButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completeButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ActivityCompletionScreen; 