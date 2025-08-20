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
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '../theme/theme';

import api from '../services/api';
import { handleAuthError, handleError } from '../utils/errorHandler';
import { safeGoBack } from '../utils/safeNavigation';
import eventEmitter from '../utils/eventEmitter';

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

interface WellnessActivityCompletionScreenProps {
  route: {
    params: {
      activity: WellnessActivity;
    };
  };
  navigation: any;
}

const WellnessActivityCompletionScreen = ({ route, navigation }: WellnessActivityCompletionScreenProps) => {
  const { activity } = route.params;
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();

  const [completionData, setCompletionData] = useState<{
    duration: number;
    notes: string;
    activity_type: string;
  }>({
    duration: activity.duration_minutes || 30,
    notes: '',
    activity_type: 'normal'
  });
  const [calculatedPoints, setCalculatedPoints] = useState(activity.points || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityTypes: Record<string, { name: string; multiplier: number }> = {
    normal: { name: "Normal", multiplier: 1 },
    intense: { name: "Intensif", multiplier: 1.5 },
    relaxed: { name: "Santai", multiplier: 0.8 }
  };

  // Update calculated points when activity type or duration changes
  useEffect(() => {
    const basePoints = activity.points || 0;
    const durationMultiplier = completionData.duration / (activity.duration_minutes || 30);
    const activityTypeMultiplier = activityTypes[completionData.activity_type]?.multiplier || 1;
    const totalPoints = Math.round(basePoints * durationMultiplier * activityTypeMultiplier);
    setCalculatedPoints(totalPoints);
  }, [completionData.duration, completionData.activity_type, activity]);

  const handleCompleteActivity = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Silakan login untuk menyelesaikan aktivitas wellness');
      return;
    }

    if (!completionData.duration || completionData.duration <= 0) {
      Alert.alert('Error', 'Silakan masukkan durasi yang valid');
      return;
    }

    try {
      setIsSubmitting(true);

      const wellnessData = {
        user_id: await api.getUserId(),
        activity_id: activity.id,
        duration_minutes: completionData.duration,
        notes: completionData.notes,
        activity_type: completionData.activity_type,
        completed_at: new Date().toISOString(),
      };

      const response = await api.completeWellnessActivity(wellnessData);

      if (response.success) {
        // Emit event to refresh wellness stats
        eventEmitter.emitWellnessActivityCompleted();
        
        // Also emit general data refresh for comprehensive update
        eventEmitter.emitDataRefresh();
        
        Alert.alert(
          'Berhasil!',
          `Aktivitas wellness berhasil diselesaikan!\nPoin yang didapat: ${calculatedPoints} poin`,
          [
            {
              text: 'OK',
              onPress: () => {
                safeGoBack(navigation, 'Activity');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Gagal menyelesaikan aktivitas wellness');
      }
    } catch (error) {
      console.error('Error completing wellness activity:', error);
      handleAuthError(error);
      Alert.alert('Error', 'Gagal menyelesaikan aktivitas wellness');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return '#6B7280';
    
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

  return (
    <LinearGradient colors={['#FAFBFC', '#F7FAFC']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => safeGoBack(navigation, 'Activity')}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Selesaikan Aktivitas</Text>
            <Text style={styles.headerSubtitle}>Lengkapi detail aktivitas wellness Anda</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Activity Info Card */}
        <View style={styles.activityInfoCard}>
          <View style={styles.activityInfoHeader}>
            <Icon name="heart-pulse" size={32} color="#10B981" />
            <View style={styles.activityInfoText}>
              <Text style={styles.activityName}>{activity.title || ''}</Text>
              <Text style={styles.activityDescription}>{activity.description || ''}</Text>
            </View>
          </View>
          <View style={styles.activityInfoStats}>
            <View style={styles.activityInfoStat}>
              <Icon name="clock-outline" size={16} color="#6B7280" />
              <Text style={styles.activityInfoStatText}>{activity.duration_minutes || 0} min</Text>
            </View>
            <View style={styles.activityInfoStat}>
              <Icon name="star" size={16} color="#6B7280" />
              <Text style={styles.activityInfoStatText}>{activity.difficulty || ''}</Text>
            </View>
            <View style={styles.activityInfoStat}>
              <Icon name="fire" size={16} color="#6B7280" />
              <Text style={styles.activityInfoStatText}>{activity.points || 0} points</Text>
            </View>
          </View>
        </View>

        {/* Points Calculation Card */}
        <View style={styles.pointsCalculationCard}>
          <View style={styles.pointsCalculationHeader}>
            <Icon name="calculator" size={20} color="#92400E" />
            <Text style={styles.pointsCalculationTitle}>Perhitungan Poin</Text>
          </View>
          <View style={styles.pointsCalculationContent}>
            <View style={styles.pointsCalculationRow}>
              <Text style={styles.pointsCalculationLabel}>Durasi:</Text>
              <Text style={styles.pointsCalculationValue}>{completionData.duration} menit</Text>
            </View>
            <View style={styles.pointsCalculationRow}>
              <Text style={styles.pointsCalculationLabel}>Tipe Aktivitas:</Text>
              <Text style={styles.pointsCalculationValue}>
                {activityTypes[completionData.activity_type]?.name} (x{activityTypes[completionData.activity_type]?.multiplier})
              </Text>
            </View>
            <View style={styles.pointsCalculationDivider} />
            <View style={styles.pointsCalculationRow}>
              <Text style={styles.pointsCalculationTotalLabel}>Total Poin:</Text>
              <Text style={styles.pointsCalculationTotalValue}>{calculatedPoints}</Text>
            </View>
          </View>
        </View>

        {/* Activity Details Form */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Icon name="clipboard-text" size={20} color="#374151" />
            <Text style={styles.sectionTitle}>Detail Aktivitas</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tipe Aktivitas</Text>
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
                  <Icon 
                    name={key === 'intense' ? 'fire' : key === 'relaxed' ? 'leaf' : 'heart'} 
                    size={16} 
                    color={completionData.activity_type === key ? '#FFFFFF' : '#6B7280'} 
                  />
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
            <Text style={styles.inputLabel}>Durasi (menit)</Text>
            <View style={styles.durationInputContainer}>
              <Icon name="clock-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.durationInput}
                value={String(completionData.duration)}
                onChangeText={(text) => setCompletionData(prev => ({ 
                  ...prev, 
                  duration: parseInt(text) || 0 
                }))}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Catatan</Text>
            <View style={styles.notesInputContainer}>
              <Icon name="note-text" size={20} color="#6B7280" />
              <TextInput
                style={styles.notesInput}
                value={completionData.notes}
                onChangeText={(text) => setCompletionData(prev => ({ ...prev, notes: text }))}
                placeholder="Tambahkan catatan tentang aktivitas Anda..."
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>


      </ScrollView>

      {/* Footer with Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => safeGoBack(navigation, 'Activity')}
        >
          <Text style={styles.cancelButtonText}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.completeButton, isSubmitting && styles.completeButtonDisabled]}
          onPress={handleCompleteActivity}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Icon name="loading" size={20} color="#FFFFFF" />
          ) : (
            <Icon name="check" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.completeButtonText}>
            {isSubmitting ? 'Menyimpan...' : 'Selesaikan'}
          </Text>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  activityInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityInfoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  activityInfoText: {
    flex: 1,
  },
  activityName: {
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
  activityInfoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityInfoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityInfoStatText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  pointsCalculationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pointsCalculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  pointsCalculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  pointsCalculationContent: {
    gap: 8,
  },
  pointsCalculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsCalculationLabel: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  pointsCalculationValue: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  pointsCalculationDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    marginVertical: 4,
  },
  pointsCalculationTotalLabel: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  pointsCalculationTotalValue: {
    fontSize: 18,
    color: '#92400E',
    fontWeight: '700',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
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
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  durationInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  notesInputContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  notesInput: {
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    gap: 6,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    gap: 8,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default WellnessActivityCompletionScreen;
