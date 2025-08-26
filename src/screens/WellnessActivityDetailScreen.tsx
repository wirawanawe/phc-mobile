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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { handleAuthError } from '../utils/errorHandler';
import { safeGoBack } from "../utils/safeNavigation";
import { WellnessActivityDetailScreenProps } from "../types/navigation";

interface WellnessActivity {
  id: number;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  difficulty: string;
  points: number;
  calories_burn?: number;
  instructions?: string;
  is_active: boolean;
}

const { width } = Dimensions.get('window');

const WellnessActivityDetailScreen = ({ route, navigation }: WellnessActivityDetailScreenProps) => {
  const { activity } = route.params;
  const { isAuthenticated } = useAuth();
  
  const [duration, setDuration] = useState(activity.duration_minutes.toString());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCompleteActivity = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please login to complete wellness activity');
      return;
    }

    if (!duration) {
      Alert.alert('Error', 'Please enter the duration');
      return;
    }

    const durationValue = parseFloat(duration);
    if (isNaN(durationValue) || durationValue <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    try {
      setIsSubmitting(true);

      const wellnessData = {
        user_id: await api.getUserId(),
        activity_id: activity.id,
        duration_minutes: durationValue,
        notes: notes,
        completed_at: new Date().toISOString(),
      };

      const response = await api.completeWellnessActivity(wellnessData);

      if (response.success) {
        Alert.alert(
          'Success',
          `Wellness activity completed successfully!\nPoints earned: ${response.data?.points_earned || 0} points`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to complete wellness activity');
      }
    } catch (error) {
      console.error('Error completing wellness activity:', error);
      handleAuthError(error);
      Alert.alert('Error', 'Failed to complete wellness activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'meditation':
        return 'meditation';
      case 'yoga':
        return 'yoga';
      case 'walking':
        return 'walk';
      case 'breathing':
        return 'breath';
      case 'stretching':
        return 'stretch';
      case 'mindfulness':
        return 'brain';
      case 'cardio':
        return 'heart-pulse';
      case 'strength':
        return 'dumbbell';
      case 'flexibility':
        return 'flex';
      case 'relaxation':
        return 'bed';
      default:
        return 'heart-pulse';
    }
  };

  return (
    <LinearGradient colors={['#FAFBFC', '#F7FAFC']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Detail</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Activity Card */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityIcon}>
              <Icon name={getCategoryIcon(activity.category)} size={32} color="#10B981" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityCategory}>{activity.category}</Text>
              <View style={styles.difficultyContainer}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(activity.difficulty) }]}>
                  <Text style={styles.difficultyText}>{activity.difficulty}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <Text style={styles.activityDescription}>{activity.description}</Text>
          
          <View style={styles.activityStats}>
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={20} color="#6B7280" />
              <Text style={styles.statText}>{activity.duration_minutes} min</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color="#F59E0B" />
              <Text style={styles.statText}>{activity.points} points</Text>
            </View>
            {activity.calories_burn && (
              <View style={styles.statItem}>
                <Icon name="fire" size={20} color="#EF4444" />
                <Text style={styles.statText}>{activity.calories_burn} cal</Text>
              </View>
            )}
          </View>
        </View>

        {/* Instructions */}
        {activity.instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{activity.instructions}</Text>
            </View>
          </View>
        )}

        {/* Completion Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complete Activity</Text>
          
          {/* Duration Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="Enter duration"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.unitText}>min</Text>
            </View>
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about your activity..."
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Submit Button */}
          {isAuthenticated ? (
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleCompleteActivity}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.submitGradient}
              >
                <Icon name="check-circle" size={20} color="#FFFFFF" style={styles.submitIcon} />
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Completing...' : 'Complete Activity'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Login")}
            >
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.loginGradient}
              >
                <Text style={styles.loginButtonText}>Login to Complete Activity</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityCategory: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  activityDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  unitText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginButton: {
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default WellnessActivityDetailScreen; 