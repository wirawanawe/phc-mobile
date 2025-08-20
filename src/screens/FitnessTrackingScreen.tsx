import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { handleError, handleAuthError } from "../utils/errorHandler";
import eventEmitter from "../utils/eventEmitter";
import dateChangeDetector from "../utils/dateChangeDetector";
import { safeGoBack } from "../utils/safeNavigation";

const { width } = Dimensions.get("window");

// Type definitions for workout parameters
interface WorkoutParameters {
  weight_kg?: string;
  sets?: string;
  reps?: string;
  distance_km?: string;
  pace_min_km?: string;
  speed_kmh?: string;
  distance_m?: string;
  stroke_type?: string;
  intensity?: string;
  steps?: string;
}

// Workout types with their parameters and calorie calculation formulas
const WORKOUT_TYPES = {
  "Weight Lifting": {
    icon: "dumbbell",
    parameters: [
      { name: "weight_kg", label: "Weight (kg)", type: "number", unit: "kg" },
      { name: "sets", label: "Number of Sets", type: "number", unit: "sets" },
      { name: "reps", label: "Reps per Set", type: "number", unit: "reps" }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const weight = parseFloat(params.weight_kg || "0") || 0;
      const sets = parseInt(params.sets || "0") || 0;
      const reps = parseInt(params.reps || "0") || 0;
      const totalReps = sets * reps;
      return Math.round((weight * totalReps * 0.1) + (duration * 3));
    }
  },
  "Running": {
    icon: "run",
    parameters: [
      { name: "distance_km", label: "Distance (km)", type: "number", unit: "km" },
      { name: "pace_min_km", label: "Pace (min/km)", type: "number", unit: "min/km" }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const distance = parseFloat(params.distance_km || "0") || 0;
      const pace = parseFloat(params.pace_min_km || "6") || 6; // default 6 min/km
      const speed = 60 / pace; // km/h
      return Math.round(distance * 60 + (duration * 8));
    }
  },
  "Cycling": {
    icon: "bike",
    parameters: [
      { name: "distance_km", label: "Distance (km)", type: "number", unit: "km" },
      { name: "speed_kmh", label: "Average Speed (km/h)", type: "number", unit: "km/h" }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const distance = parseFloat(params.distance_km || "0") || 0;
      const speed = parseFloat(params.speed_kmh || "20") || 20; // default 20 km/h
      return Math.round(distance * 30 + (duration * 5));
    }
  },
  "Swimming": {
    icon: "swim",
    parameters: [
      { name: "distance_m", label: "Distance (m)", type: "number", unit: "m" },
      { name: "stroke_type", label: "Stroke Type", type: "select", options: ["Freestyle", "Breaststroke", "Butterfly", "Backstroke"] }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const distance = parseFloat(params.distance_m || "0") || 0;
      const strokeType = params.stroke_type || "Freestyle";
      const strokeMultiplier: { [key: string]: number } = {
        "Freestyle": 1,
        "Breaststroke": 1.2,
        "Butterfly": 1.5,
        "Backstroke": 1.1
      };
      return Math.round((distance * 0.5) * (strokeMultiplier[strokeType] || 1) + (duration * 6));
    }
  },
  "Yoga": {
    icon: "yoga",
    parameters: [
      { name: "intensity", label: "Intensity Level", type: "select", options: ["Light", "Moderate", "Intense"] }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const intensity = params.intensity || "Moderate";
      const intensityMultiplier: { [key: string]: number } = {
        "Light": 2,
        "Moderate": 3,
        "Intense": 4
      };
      return Math.round(duration * (intensityMultiplier[intensity] || 3));
    }
  },
  "Walking": {
    icon: "walk",
    parameters: [
      { name: "distance_km", label: "Distance (km)", type: "number", unit: "km" },
      { name: "steps", label: "Steps", type: "number", unit: "steps" }
    ],
    calorieFormula: (params: WorkoutParameters, duration: number) => {
      const distance = parseFloat(params.distance_km || "0") || 0;
      const steps = parseInt(params.steps || "0") || 0;
      return Math.round((distance * 50) + (steps * 0.04) + (duration * 2));
    }
  }
};

const FitnessTrackingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  
  // Legacy states for backward compatibility
  const [steps, setSteps] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [distance, setDistance] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [todayData, setTodayData] = useState(null);

  // New workout log states
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState("");
  const [workoutParameters, setWorkoutParameters] = useState<any>({});
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [savingWorkout, setSavingWorkout] = useState(false);

  useEffect(() => {
    // Initialize date change detector
    dateChangeDetector.initialize();
    
    if (isAuthenticated) {
      loadTodayData();
    }
    
    // Listen for daily reset events
    const handleDailyReset = () => {
      console.log('FitnessTrackingScreen - Daily reset detected, refreshing fitness data...');
      setSteps("");
      setExerciseMinutes("");
      setCaloriesBurned("");
      setDistance("");
      setWorkoutType("");
      setNotes("");
      setWorkoutParameters({});
      setCalculatedCalories(0);
      setTodayData(null);
      if (isAuthenticated) {
        loadTodayData();
      }
    };
    
    // Add event listeners
    eventEmitter.on('dailyReset', handleDailyReset);
    
    return () => {
      // Remove event listeners
      eventEmitter.off('dailyReset', handleDailyReset);
    };
  }, [isAuthenticated]);

  // Calculate calories when parameters change (for modal)
  useEffect(() => {
    if (selectedWorkoutType && workoutDuration) {
      const workout = WORKOUT_TYPES[selectedWorkoutType as keyof typeof WORKOUT_TYPES];
      if (workout) {
        const calories = workout.calorieFormula(workoutParameters, parseInt(workoutDuration) || 0);
        setCalculatedCalories(calories);
      }
    }
  }, [selectedWorkoutType, workoutParameters, workoutDuration]);

  // Calculate calories for manual entry form
  useEffect(() => {
    if (workoutType && exerciseMinutes) {
      const workout = WORKOUT_TYPES[workoutType as keyof typeof WORKOUT_TYPES];
      if (workout) {
        const calories = workout.calorieFormula(workoutParameters, parseInt(exerciseMinutes) || 0);
        setCalculatedCalories(calories);
      }
    }
  }, [workoutType, workoutParameters, exerciseMinutes]);

  const loadTodayData = async () => {
    try {
      const response = await api.getTodayFitness();
      if (response.success && response.data) {
        setTodayData(response.data);
        setSteps(response.data.steps?.toString() || "");
        setExerciseMinutes(response.data.exercise_minutes?.toString() || "");
        setCaloriesBurned(response.data.calories_burned?.toString() || "");
        setDistance(response.data.distance_km?.toString() || "");
        setWorkoutType(response.data.workout_type || "");
        setNotes(response.data.notes || "");
        
        // Set workout parameters if available
        if (response.data.distance_km) {
          setWorkoutParameters((prev: WorkoutParameters) => ({
            ...prev,
            distance_km: response.data.distance_km?.toString() || ""
          }));
        }
        if (response.data.steps) {
          setWorkoutParameters((prev: WorkoutParameters) => ({
            ...prev,
            steps: response.data.steps?.toString() || ""
          }));
        }
      }
    } catch (error) {
      console.error("Error loading today's fitness data:", error);
      // Handle authentication errors properly
      handleAuthError(error, () => {
        // Navigate to login screen on authentication failure
        navigation.navigate('Login');
      });
    }
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setWorkoutParameters((prev: WorkoutParameters) => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleSaveWorkout = async () => {
    if (!selectedWorkoutType || !workoutDuration) {
      Alert.alert("Error", "Please select a workout type and enter duration");
      return;
    }

    setSavingWorkout(true);
    try {
      // Prepare notes with workout parameters as JSON
      const notesData = {
        userNotes: workoutNotes,
        workoutParameters: workoutParameters
      };
      
      const workoutData = {
        workout_type: selectedWorkoutType,
        exercise_minutes: parseInt(workoutDuration),
        calories_burned: calculatedCalories,
        distance_km: workoutParameters.distance_km ? parseFloat(workoutParameters.distance_km) : null,
        steps: workoutParameters.steps ? parseInt(workoutParameters.steps) : null,
        notes: JSON.stringify(notesData),
        tracking_date: new Date().toISOString().split('T')[0]
      };

      const response = await api.createFitnessEntry(workoutData);
      
      if (response.success) {
        Alert.alert("Success", "Workout logged successfully!", [
          {
            text: "OK",
            onPress: () => {
              setShowWorkoutModal(false);
              resetWorkoutForm();
              loadTodayData(); // Refresh data
            }
          }
        ]);
        
        // Emit event to notify other components that fitness data has been updated
        eventEmitter.emitFitnessLogged();
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Error", "Failed to save workout. Please try again.");
    } finally {
      setSavingWorkout(false);
    }
  };

  const resetWorkoutForm = () => {
    setSelectedWorkoutType("");
    setWorkoutParameters({});
    setWorkoutDuration("");
    setCalculatedCalories(0);
    setWorkoutNotes("");
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Please login to track fitness data");
      return;
    }

    if (!workoutType || !exerciseMinutes.trim()) {
      Alert.alert("Error", "Please select a workout type and enter duration");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare notes with workout parameters as JSON
      const notesData = {
        userNotes: notes,
        workoutParameters: workoutParameters
      };
      
      const fitnessData = {
        workout_type: workoutType,
        exercise_minutes: parseInt(exerciseMinutes) || 0,
        calories_burned: calculatedCalories || 0,
        distance_km: workoutParameters.distance_km ? parseFloat(workoutParameters.distance_km) : null,
        steps: workoutParameters.steps ? parseInt(workoutParameters.steps) : null,
        notes: JSON.stringify(notesData),
        tracking_date: new Date().toISOString().split('T')[0]
      };

      const response = await api.createFitnessEntry(fitnessData);

      if (response.success) {
        Alert.alert(
          "Success",
          "Fitness data saved successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                safeGoBack(navigation);
              },
            },
          ]
        );
        
        // Emit event to notify other components that fitness data has been updated
        eventEmitter.emitFitnessLogged();
      }
    } catch (error) {
      console.error("Error saving fitness data:", error);
      // Handle authentication errors properly
      handleAuthError(error, () => {
        // Navigate to login screen on authentication failure
        navigation.navigate('Login');
      });
    } finally {
      setIsLoading(false);
    }
  };

  const workoutTypes = [
    "Walking",
    "Running",
    "Cycling",
    "Swimming",
    "Gym Workout",
    "Yoga",
    "Pilates",
    "Dancing",
    "Hiking",
    "Other",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* Enhanced Manual Entry Form */}
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Manual Entry</Text>
              
              {/* Step 1: Select Workout Type */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Select Workout Type</Text>
                <View style={styles.workoutTypeGrid}>
                  {Object.keys(WORKOUT_TYPES).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.workoutTypeCard,
                        workoutType === type && styles.workoutTypeCardSelected
                      ]}
                      onPress={() => setWorkoutType(type)}
                    >
                      <Icon 
                        name={WORKOUT_TYPES[type as keyof typeof WORKOUT_TYPES].icon} 
                        size={32} 
                        color={workoutType === type ? "#FFFFFF" : "#10B981"} 
                      />
                      <Text style={[
                        styles.workoutTypeText,
                        workoutType === type && styles.workoutTypeTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Step 2: Workout Parameters */}
              {workoutType && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>2. Workout Parameters</Text>
                  {WORKOUT_TYPES[workoutType as keyof typeof WORKOUT_TYPES]?.parameters?.map((param) => (
                    <View key={param.name} style={styles.parameterContainer}>
                      <Text style={styles.parameterLabel}>{param.label}</Text>
                      {param.type === "select" ? (
                        <View style={styles.selectContainer}>
                          {(param as any).options?.map((option: string) => (
                            <TouchableOpacity
                              key={option}
                              style={[
                                styles.selectOption,
                                workoutParameters[param.name] === option && styles.selectOptionSelected
                              ]}
                              onPress={() => handleParameterChange(param.name, option)}
                            >
                              <Text style={[
                                styles.selectOptionText,
                                workoutParameters[param.name] === option && styles.selectOptionTextSelected
                              ]}>
                                {option}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        <TextInput
                          style={styles.parameterInput}
                          placeholder={`Enter ${param.label.toLowerCase()}`}
                          placeholderTextColor="#9CA3AF"
                          value={workoutParameters[param.name] || ""}
                          onChangeText={(value) => handleParameterChange(param.name, value)}
                          keyboardType="numeric"
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Step 3: Duration */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Duration</Text>
                <View style={styles.durationContainer}>
                  <TextInput
                    style={styles.durationInput}
                    placeholder="Enter duration in minutes"
                    placeholderTextColor="#9CA3AF"
                    value={exerciseMinutes}
                    onChangeText={setExerciseMinutes}
                    keyboardType="numeric"
                  />
                  <Text style={styles.durationUnit}>minutes</Text>
                </View>
              </View>

              {/* Step 4: Calculated Calories */}
              {calculatedCalories > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>4. Calories Burned</Text>
                  <View style={styles.caloriesContainer}>
                    <Text style={styles.caloriesValue}>{calculatedCalories}</Text>
                    <Text style={styles.caloriesUnit}>calories</Text>
                  </View>
                  <Text style={styles.caloriesNote}>
                    *Calculated based on your workout parameters and duration
                  </Text>
                </View>
              )}

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add any notes about your workout..."
                  placeholderTextColor="#9CA3AF"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Real-time Tracking Button */}
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('RealtimeFitness')}
                style={styles.realtimeButton}
                labelStyle={styles.realtimeButtonText}
                buttonColor="#10B981"
                textColor="#ffffff"
                icon="fire"
              >
                Start Real-time Tracking
              </Button>

              {/* View History Button */}
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('ExerciseHistory')}
                style={styles.historyButton}
                labelStyle={styles.historyButtonText}
                buttonColor="#3B82F6"
                textColor="#ffffff"
                icon="history"
              >
                View Exercise History
              </Button>

              {/* Save Button */}
              <Button
                mode="contained"
                onPress={handleSave}
                loading={isLoading}
                disabled={isLoading}
                style={styles.saveButton}
                labelStyle={styles.saveButtonText}
                buttonColor="#E22345"
                textColor="#FFFFFF"
              >
                {isLoading ? "Saving..." : "Save Fitness Data"}
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Workout Log Modal */}
        <Modal
          visible={showWorkoutModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalSafeArea}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setShowWorkoutModal(false);
                    resetWorkoutForm();
                  }}
                >
                  <Icon name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Log Workout</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Step 1: Select Workout Type */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>1. Select Workout Type</Text>
                  <View style={styles.workoutTypeGrid}>
                    {Object.keys(WORKOUT_TYPES).map((workoutType) => (
                      <TouchableOpacity
                        key={workoutType}
                        style={[
                          styles.workoutTypeCard,
                          selectedWorkoutType === workoutType && styles.workoutTypeCardSelected
                        ]}
                        onPress={() => setSelectedWorkoutType(workoutType)}
                      >
                        <Icon 
                          name={WORKOUT_TYPES[workoutType as keyof typeof WORKOUT_TYPES].icon} 
                          size={32} 
                          color={selectedWorkoutType === workoutType ? "#FFFFFF" : "#10B981"} 
                        />
                        <Text style={[
                          styles.workoutTypeText,
                          selectedWorkoutType === workoutType && styles.workoutTypeTextSelected
                        ]}>
                          {workoutType}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Step 2: Workout Parameters */}
                {selectedWorkoutType && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>2. Workout Parameters</Text>
                    {WORKOUT_TYPES[selectedWorkoutType as keyof typeof WORKOUT_TYPES].parameters.map((param) => (
                      <View key={param.name} style={styles.parameterContainer}>
                        <Text style={styles.parameterLabel}>{param.label}</Text>
                        {param.type === "select" ? (
                          <View style={styles.selectContainer}>
                            {(param as any).options?.map((option: string) => (
                              <TouchableOpacity
                                key={option}
                                style={[
                                  styles.selectOption,
                                  workoutParameters[param.name] === option && styles.selectOptionSelected
                                ]}
                                onPress={() => handleParameterChange(param.name, option)}
                              >
                                <Text style={[
                                  styles.selectOptionText,
                                  workoutParameters[param.name] === option && styles.selectOptionTextSelected
                                ]}>
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ) : (
                          <TextInput
                            style={styles.parameterInput}
                            placeholder={`Enter ${param.label.toLowerCase()}`}
                            placeholderTextColor="#9CA3AF"
                            value={workoutParameters[param.name] || ""}
                            onChangeText={(value) => handleParameterChange(param.name, value)}
                            keyboardType="numeric"
                          />
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Step 3: Duration */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>3. Duration</Text>
                  <View style={styles.durationContainer}>
                    <TextInput
                      style={styles.durationInput}
                      placeholder="Enter duration in minutes"
                      placeholderTextColor="#9CA3AF"
                      value={workoutDuration}
                      onChangeText={setWorkoutDuration}
                      keyboardType="numeric"
                    />
                    <Text style={styles.durationUnit}>minutes</Text>
                  </View>
                </View>

                {/* Step 4: Calculated Calories */}
                {calculatedCalories > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>4. Calories Burned</Text>
                    <View style={styles.caloriesContainer}>
                      <Text style={styles.caloriesValue}>{calculatedCalories}</Text>
                      <Text style={styles.caloriesUnit}>calories</Text>
                    </View>
                    <Text style={styles.caloriesNote}>
                      *Calculated based on your workout parameters and duration
                    </Text>
                  </View>
                )}

                {/* Notes */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Notes (Optional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add any notes about your workout..."
                    placeholderTextColor="#9CA3AF"
                    value={workoutNotes}
                    onChangeText={setWorkoutNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Save Button */}
                <View style={styles.modalSection}>
                  <Button
                    mode="contained"
                    onPress={handleSaveWorkout}
                    loading={savingWorkout}
                    disabled={!selectedWorkoutType || !workoutDuration || savingWorkout}
                    style={styles.saveButton}
                    labelStyle={styles.saveButtonLabel}
                  >
                    {savingWorkout ? "Saving..." : "Save Workout"}
                  </Button>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  quickLogContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickLogButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  quickLogButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  quickLogDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  parameterContainer: {
    marginBottom: 16,
  },
  parameterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  parameterInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectOptionSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  selectOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  selectOptionTextSelected: {
    color: "#FFFFFF",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 14,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 12,
  },
  durationUnit: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  caloriesContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#10B981",
    letterSpacing: -1,
  },
  caloriesUnit: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 4,
  },
  caloriesNote: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  workoutTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  workoutTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  workoutTypeCard: {
    width: (width - 60) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  workoutTypeCardSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  workoutTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    textAlign: "center",
  },
  workoutTypeTextSelected: {
    color: "#FFFFFF",
  },
  workoutTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  workoutTypeButtonActive: {
    backgroundColor: "#E22345",
    borderColor: "#E22345",
  },

  realtimeButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 20,
    marginBottom: 12,
    borderColor: "#10B981",
    borderWidth: 2,
  },
  realtimeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
  historyButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 12,
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 12,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  modalHeaderSpacer: {
    width: 34,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    marginBottom: 30,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FitnessTrackingScreen; 