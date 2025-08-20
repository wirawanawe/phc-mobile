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
import { handleAuthError } from '../utils/errorHandler';

interface ExerciseType {
  id: string;
  name: string;
  nameId: string;
  icon: string;
  color: string;
  parameters: ExerciseParameter[];
  calorieFormula: (params: any, duration: number) => number;
}

interface ExerciseParameter {
  id: string;
  name: string;
  nameId: string;
  unit: string;
  type: 'number' | 'select';
  options?: string[];
  required: boolean;
}

const ExerciseLogScreen = ({ navigation }: any) => {
  const { isAuthenticated } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [exerciseParams, setExerciseParams] = useState<{[key: string]: any}>({});
  const [duration, setDuration] = useState('');
  const [durationType, setDurationType] = useState<'minutes' | 'sets'>('minutes');
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exercise types with their parameters and calorie formulas
  const exerciseTypes: ExerciseType[] = [
    {
      id: 'weightlifting',
      name: 'Weightlifting',
      nameId: 'Angkat Berat',
      icon: 'dumbbell',
      color: '#E53E3E',
      parameters: [
        {
          id: 'weight',
          name: 'Weight',
          nameId: 'Berat',
          unit: 'kg',
          type: 'number',
          required: true,
        },
        {
          id: 'reps',
          name: 'Repetitions',
          nameId: 'Repetisi',
          unit: 'reps',
          type: 'number',
          required: true,
        },
        {
          id: 'sets',
          name: 'Sets',
          nameId: 'Set',
          unit: 'sets',
          type: 'number',
          required: true,
        },
      ],
      calorieFormula: (params, duration) => {
        const weight = params.weight || 0;
        const reps = params.reps || 0;
        const sets = params.sets || 0;
        const totalReps = reps * sets;
        return Math.round(weight * totalReps * 0.1);
      },
    },
    {
      id: 'running',
      name: 'Running',
      nameId: 'Lari',
      icon: 'run',
      color: '#38A169',
      parameters: [
        {
          id: 'speed',
          name: 'Speed',
          nameId: 'Kecepatan',
          unit: 'km/h',
          type: 'number',
          required: true,
        },
        {
          id: 'distance',
          name: 'Distance',
          nameId: 'Jarak',
          unit: 'km',
          type: 'number',
          required: false,
        },
      ],
      calorieFormula: (params, duration) => {
        const speed = params.speed || 0;
        const distance = params.distance || 0;
        const calculatedDistance = distance || (speed * duration / 60);
        return Math.round(calculatedDistance * 60);
      },
    },
    {
      id: 'cycling',
      name: 'Cycling',
      nameId: 'Bersepeda',
      icon: 'bike',
      color: '#3182CE',
      parameters: [
        {
          id: 'speed',
          name: 'Speed',
          nameId: 'Kecepatan',
          unit: 'km/h',
          type: 'number',
          required: true,
        },
        {
          id: 'distance',
          name: 'Distance',
          nameId: 'Jarak',
          unit: 'km',
          type: 'number',
          required: false,
        },
      ],
      calorieFormula: (params, duration) => {
        const speed = params.speed || 0;
        const distance = params.distance || 0;
        const calculatedDistance = distance || (speed * duration / 60);
        return Math.round(calculatedDistance * 30);
      },
    },
    {
      id: 'walking',
      name: 'Walking',
      nameId: 'Jalan Kaki',
      icon: 'walk',
      color: '#38B2AC',
      parameters: [
        {
          id: 'speed',
          name: 'Speed',
          nameId: 'Kecepatan',
          unit: 'km/h',
          type: 'number',
          required: true,
        },
        {
          id: 'distance',
          name: 'Distance',
          nameId: 'Jarak',
          unit: 'km',
          type: 'number',
          required: false,
        },
      ],
      calorieFormula: (params, duration) => {
        const speed = params.speed || 0;
        const distance = params.distance || 0;
        const calculatedDistance = distance || (speed * duration / 60);
        return Math.round(calculatedDistance * 50);
      },
    },
  ];

  useEffect(() => {
    calculateCalories();
  }, [selectedExercise, exerciseParams, duration]);

  const calculateCalories = () => {
    if (!selectedExercise || !duration) {
      setCalculatedCalories(0);
      return;
    }

    const durationValue = parseFloat(duration);
    if (isNaN(durationValue)) {
      setCalculatedCalories(0);
      return;
    }

    const calories = selectedExercise.calorieFormula(exerciseParams, durationValue);
    setCalculatedCalories(calories);
  };

  const handleExerciseSelect = (exercise: ExerciseType) => {
    setSelectedExercise(exercise);
    setExerciseParams({});
    setDuration('');
    setCalculatedCalories(0);
    setShowExerciseModal(false);
  };

  const handleParamChange = (paramId: string, value: any) => {
    setExerciseParams(prev => ({
      ...prev,
      [paramId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please login to log your activity');
      return;
    }

    if (!selectedExercise) {
      Alert.alert('Error', 'Please select an exercise type');
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

    // Check required parameters
    const missingParams = selectedExercise.parameters
      .filter(param => param.required && !exerciseParams[param.id])
      .map(param => param.nameId);

    if (missingParams.length > 0) {
      Alert.alert('Error', `Please fill in: ${missingParams.join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare notes with workout parameters as JSON
      const notesData = {
        userNotes: `Duration: ${duration} ${durationType}`,
        workoutParameters: exerciseParams
      };
      
      const activityData = {
        workout_type: selectedExercise.name,
        exercise_minutes: durationType === 'minutes' ? durationValue : durationValue * 5,
        calories_burned: calculatedCalories,
        distance_km: exerciseParams.distance || 0,
        steps: 0,
        notes: JSON.stringify(notesData),
        tracking_date: new Date().toISOString().split('T')[0],
      };

      const response = await api.createFitnessEntry(activityData);

      if (response.success) {
        Alert.alert(
          'Success',
          `Activity logged successfully!\nCalories burned: ${calculatedCalories} cal`,
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedExercise(null);
                setExerciseParams({});
                setDuration('');
                setCalculatedCalories(0);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to log activity');
      }
    } catch (error) {
      console.error('Error logging activity:', error);
      handleAuthError(error);
      Alert.alert('Error', 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderParameterInput = (param: ExerciseParameter) => {
    const value = exerciseParams[param.id] || '';

    return (
      <View key={param.id} style={styles.paramContainer}>
        <Text style={styles.paramLabel}>
          {param.nameId} {param.required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={value.toString()}
            onChangeText={(text) => handleParamChange(param.id, text)}
            placeholder={`Enter ${param.nameId.toLowerCase()}`}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.unitText}>{param.unit}</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FAFBFC', '#F7FAFC']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Icon name="dumbbell" size={28} color="#E53E3E" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.greetingText}>Log Olahraga</Text>
              <Text style={styles.subtitleText}>
                {isAuthenticated ? "Catat aktivitas olahraga Anda" : "Login untuk memulai"}
              </Text>
            </View>
          </View>
        </View>

        {/* Exercise Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Pilih Jenis Olahraga</Text>
          <TouchableOpacity
            style={styles.exerciseSelector}
            onPress={() => setShowExerciseModal(true)}
          >
            {selectedExercise ? (
              <View style={styles.selectedExercise}>
                <View style={[styles.exerciseIcon, { backgroundColor: selectedExercise.color + '20' }]}>
                  <Icon name={selectedExercise.icon} size={24} color={selectedExercise.color} />
                </View>
                <Text style={styles.selectedExerciseText}>{selectedExercise.nameId}</Text>
              </View>
            ) : (
              <View style={styles.placeholderExercise}>
                <Icon name="plus-circle" size={24} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Pilih jenis olahraga</Text>
              </View>
            )}
            <Icon name="chevron-down" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Exercise Parameters */}
        {selectedExercise && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Parameter Olahraga</Text>
            <View style={styles.parametersContainer}>
              {selectedExercise.parameters.map(renderParameterInput)}
            </View>
          </View>
        )}

        {/* Duration Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Durasi Olahraga</Text>
          <View style={styles.durationContainer}>
            <View style={styles.durationTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.durationTypeButton,
                  durationType === 'minutes' && styles.durationTypeButtonActive,
                ]}
                onPress={() => setDurationType('minutes')}
              >
                <Text
                  style={[
                    styles.durationTypeText,
                    durationType === 'minutes' && styles.durationTypeTextActive,
                  ]}
                >
                  Waktu (Menit)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.durationTypeButton,
                  durationType === 'sets' && styles.durationTypeButtonActive,
                ]}
                onPress={() => setDurationType('sets')}
              >
                <Text
                  style={[
                    styles.durationTypeText,
                    durationType === 'sets' && styles.durationTypeTextActive,
                  ]}
                >
                  Set
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder={`Masukkan ${durationType === 'minutes' ? 'menit' : 'jumlah set'}`}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.unitText}>{durationType === 'minutes' ? 'menit' : 'set'}</Text>
            </View>
          </View>
        </View>

        {/* Calorie Calculation */}
        {calculatedCalories > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Kalori yang Terbakar</Text>
            <View style={styles.calorieCard}>
              <Icon name="fire" size={32} color="#E53E3E" />
              <Text style={styles.calorieValue}>{calculatedCalories}</Text>
              <Text style={styles.calorieUnit}>kalori</Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        {isAuthenticated && selectedExercise && duration && calculatedCalories > 0 && (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={["#E53E3E", "#FF6B8A"]}
              style={styles.submitGradient}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Aktivitas'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Login Button for Non-Authenticated Users */}
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <LinearGradient
              colors={["#E53E3E", "#FF6B8A"]}
              style={styles.loginGradient}
            >
              <Text style={styles.loginButtonText}>Login untuk Memulai</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Jenis Olahraga</Text>
              <TouchableOpacity
                onPress={() => setShowExerciseModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.exerciseList}>
              {exerciseTypes.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseOption}
                  onPress={() => handleExerciseSelect(exercise)}
                >
                  <View style={[styles.exerciseOptionIcon, { backgroundColor: exercise.color + '20' }]}>
                    <Icon name={exercise.icon} size={24} color={exercise.color} />
                  </View>
                  <View style={styles.exerciseOptionText}>
                    <Text style={styles.exerciseOptionName}>{exercise.nameId}</Text>
                    <Text style={styles.exerciseOptionSubtitle}>{exercise.name}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 90,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  exerciseSelector: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedExercise: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedExerciseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  placeholderExercise: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 12,
  },
  parametersContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paramContainer: {
    marginBottom: 16,
  },
  paramLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#E53E3E",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  unitText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginLeft: 8,
  },
  durationContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  durationTypeSelector: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  durationTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  durationTypeButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  durationTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  durationTypeTextActive: {
    color: "#1F2937",
    fontWeight: "600",
  },
  calorieCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#E53E3E",
    marginTop: 8,
  },
  calorieUnit: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  submitButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loginButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  exerciseList: {
    padding: 20,
  },
  exerciseOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  exerciseOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseOptionText: {
    flex: 1,
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  exerciseOptionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
});

export default ExerciseLogScreen; 