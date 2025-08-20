import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Text, useTheme, Card, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { handleError, handleAuthError } from "../utils/errorHandler";
import { safeGoBack } from "../utils/safeNavigation";

const { width } = Dimensions.get("window");

interface ExerciseEntry {
  id: number;
  steps: number;
  exercise_minutes: number;
  calories_burned: number;
  distance_km: number;
  workout_type: string;
  notes: string;
  created_at: string;
  updated_at: string;
  intensity?: string;
}

// Workout types with their parameters
const WORKOUT_TYPES = {
  "Weight Lifting": {
    icon: "dumbbell",
    parameters: [
      { name: "weight_kg", label: "Weight (kg)", unit: "kg" },
      { name: "sets", label: "Sets", unit: "sets" },
      { name: "reps", label: "Reps", unit: "reps" }
    ]
  },
  "Running": {
    icon: "run",
    parameters: [
      { name: "distance_km", label: "Distance", unit: "km" },
      { name: "pace_min_km", label: "Pace", unit: "min/km" }
    ]
  },
  "Cycling": {
    icon: "bike",
    parameters: [
      { name: "distance_km", label: "Distance", unit: "km" },
      { name: "speed_kmh", label: "Speed", unit: "km/h" }
    ]
  },
  "Swimming": {
    icon: "swim",
    parameters: [
      { name: "distance_m", label: "Distance", unit: "m" },
      { name: "stroke_type", label: "Stroke Type", unit: "" }
    ]
  },
  "Yoga": {
    icon: "yoga",
    parameters: [
      { name: "intensity", label: "Intensity", unit: "" }
    ]
  },
  "Walking": {
    icon: "walk",
    parameters: [
      { name: "distance_km", label: "Distance", unit: "km" },
      { name: "steps", label: "Steps", unit: "steps" }
    ]
  }
};

const ExerciseHistoryScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ExerciseEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadExerciseHistory();
    } else {
      console.log('⚠️ ExerciseHistoryScreen - User not authenticated, not loading data');
      setExerciseHistory([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadExerciseHistory = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated before making API call
      if (!isAuthenticated) {
        console.log('⚠️ ExerciseHistoryScreen - User not authenticated, redirecting to login');
        navigation.navigate('Login');
        return;
      }
      
      const response = await api.getFitnessHistory();
      
      console.log('🔍 ExerciseHistoryScreen - API Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data && Array.isArray(response.data)) {
        // Map the data to ensure correct field names
        const mappedData = response.data.map((entry: any) => {
          return {
            id: entry.id,
            steps: entry.steps || 0,
            exercise_minutes: entry.exercise_minutes || entry.duration_minutes || 0,
            calories_burned: entry.calories_burned || 0,
            distance_km: entry.distance_km || 0,
            workout_type: entry.workout_type || entry.activity_type || 'Exercise',
            notes: entry.notes || '',
            intensity: entry.intensity || '',
            created_at: entry.created_at,
            updated_at: entry.updated_at
          };
        });
        
        console.log('🔍 ExerciseHistoryScreen - Mapped data:', mappedData);
        setExerciseHistory(mappedData);
      } else {
        console.warn('⚠️ ExerciseHistoryScreen - Invalid response structure:', response);
        
        // Check if it's an authentication error
        if (response.message && response.message.includes('Authentication required')) {
          console.log('🔐 ExerciseHistoryScreen - Authentication required, redirecting to login');
          navigation.navigate('Login');
          return;
        }
        
        setExerciseHistory([]);
      }
    } catch (error) {
      console.error("Error loading exercise history:", error);
      
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('Authentication failed') || 
        error.message.includes('Authentication required') ||
        error.message.includes('401')
      )) {
        console.log('🔐 ExerciseHistoryScreen - Authentication error detected, redirecting to login');
        navigation.navigate('Login');
        return;
      }
      
      handleAuthError(error, () => {
        navigation.navigate('Login');
      });
      setExerciseHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExercise = (entry: ExerciseEntry) => {
    Alert.alert(
      "Delete Exercise Entry",
      `Are you sure you want to delete this ${entry.workout_type || 'exercise'} entry?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteExercise(entry.id),
        },
      ]
    );
  };

  const confirmDeleteExercise = async (entryId: number) => {
    try {
      const response = await api.deleteFitnessEntry(entryId);
      
      if (response.success) {
        Alert.alert("Success", "Exercise entry deleted successfully!");
        loadExerciseHistory(); // Reload the list
      } else {
        Alert.alert("Error", response.message || "Failed to delete exercise entry");
      }
    } catch (error) {
      console.error("Error deleting exercise entry:", error);
      Alert.alert("Error", "Failed to delete exercise entry. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWorkoutIcon = (workoutType: string) => {
    const iconMap: { [key: string]: string } = {
      'Walking': 'walk',
      'Running': 'run',
      'Cycling': 'bike',
      'Swimming': 'swim',
      'Gym Workout': 'dumbbell',
      'Yoga': 'yoga',
      'Pilates': 'yoga',
      'Dancing': 'music',
      'Hiking': 'hiking',
      'Other': 'dumbbell',
    };
    return iconMap[workoutType] || 'dumbbell';
  };

  const getWorkoutColor = (workoutType: string) => {
    const colorMap: { [key: string]: string } = {
      'Walking': '#10B981',
      'Running': '#EF4444',
      'Cycling': '#3B82F6',
      'Swimming': '#06B6D4',
      'Gym Workout': '#8B5CF6',
      'Yoga': '#F59E0B',
      'Pilates': '#F59E0B',
      'Dancing': '#EC4899',
      'Hiking': '#059669',
      'Other': '#6B7280',
    };
    return colorMap[workoutType] || '#6B7280';
  };

  // Function to extract workout parameters from notes
  const getWorkoutParameters = (entry: ExerciseEntry) => {
    const workoutType = entry.workout_type;
    const workoutConfig = WORKOUT_TYPES[workoutType as keyof typeof WORKOUT_TYPES];
    
    if (!workoutConfig) {
      console.log(`⚠️ No workout config found for: ${workoutType}`);
      return [];
    }

    const parameters: Array<{label: string, value: string, unit: string}> = [];
    console.log(`🔍 Processing parameters for ${workoutType}:`, {
      id: entry.id,
      workout_type: entry.workout_type,
      exercise_minutes: entry.exercise_minutes,
      distance_km: entry.distance_km,
      steps: entry.steps,
      intensity: entry.intensity,
      notes: entry.notes
    });
    
    // Track which parameters we've already added to avoid duplicates
    const addedParams = new Set<string>();
    
    // Add duration (always available)
    if (entry.exercise_minutes && typeof entry.exercise_minutes === 'number' && entry.exercise_minutes > 0) {
      parameters.push({
        label: "Duration",
        value: entry.exercise_minutes.toString(),
        unit: "minutes"
      });
      addedParams.add("duration");
    }

    // Try to extract additional parameters from notes if it's JSON
    if (entry.notes) {
      try {
        const notesData = JSON.parse(entry.notes);
        if (notesData.workoutParameters) {
          const workoutParams = notesData.workoutParameters;
          
          console.log(`🔍 Workout params for ${workoutType}:`, workoutParams);
          
          // Add parameters based on workout type
          workoutConfig.parameters.forEach(param => {
            console.log(`🔍 Checking param ${param.name} for ${workoutType}:`, workoutParams[param.name]);
            
            if (workoutParams[param.name] && workoutParams[param.name] !== "") {
              parameters.push({
                label: param.label,
                value: workoutParams[param.name],
                unit: param.unit
              });
              addedParams.add(param.name);
            }
          });
        }
      } catch (error) {
        // If notes is not JSON, it's just a regular note
        // We'll handle this in the notes display
        console.log(`📝 Notes is not JSON for ${workoutType}:`, entry.notes);
      }
    }

    // Add fallback parameters from database fields if not already added from JSON
    // Only add distance for workout types that use distance (not Yoga)
    if (workoutType !== "Yoga" && !addedParams.has("distance_km") && entry.distance_km && typeof entry.distance_km === 'number' && entry.distance_km > 0) {
      parameters.push({
        label: "Distance",
        value: entry.distance_km.toFixed(1),
        unit: "km"
      });
    }

    // Only add steps for workout types that use steps (Walking, Running)
    if ((workoutType === "Walking" || workoutType === "Running") && !addedParams.has("steps") && entry.steps && typeof entry.steps === 'number' && entry.steps > 0) {
      parameters.push({
        label: "Steps",
        value: entry.steps.toLocaleString(),
        unit: "steps"
      });
    }

    // Add intensity only for Yoga (from database field)
    if (workoutType === "Yoga" && !addedParams.has("intensity") && entry.intensity && typeof entry.intensity === 'string' && entry.intensity.trim() !== '') {
      parameters.push({
        label: "Intensity",
        value: entry.intensity.charAt(0).toUpperCase() + entry.intensity.slice(1),
        unit: ""
      });
    }

    // Special handling for Swimming distance (convert to meters if stored as km)
    if (workoutType === "Swimming" && !addedParams.has("distance_m") && entry.distance_km && typeof entry.distance_km === 'number' && entry.distance_km > 0) {
      parameters.push({
        label: "Distance",
        value: (entry.distance_km * 1000).toString(),
        unit: "m"
      });
    }

    // Debug: Log final parameters
    console.log(`📊 Final parameters for ${workoutType}:`, parameters);

    return parameters;
  };

  // Function to get actual notes (not JSON parameters)
  const getActualNotes = (entry: ExerciseEntry) => {
    if (!entry.notes) {
      return "";
    }

    try {
      const notesData = JSON.parse(entry.notes);
      return notesData.userNotes || "";
    } catch (error) {
      // If notes is not JSON, return as is
      return entry.notes;
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E22345" />
            <Text style={styles.loadingText}>Loading exercise history...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => safeGoBack(navigation, 'Main')}
            >
              <Icon name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Exercise History</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Icon name="history" size={24} color="#E22345" />
              <Text style={styles.summaryTitle}>{exerciseHistory.length}</Text>
              <Text style={styles.summarySubtitle}>Total Entries</Text>
            </View>
            <View style={styles.summaryCard}>
              <Icon name="fire" size={24} color="#F59E0B" />
              <Text style={styles.summaryTitle}>
                {exerciseHistory.reduce((total, entry) => total + (entry.calories_burned && typeof entry.calories_burned === 'number' ? entry.calories_burned : 0), 0)}
              </Text>
              <Text style={styles.summarySubtitle}>Total Calories</Text>
            </View>
            <View style={styles.summaryCard}>
              <Icon name="clock-outline" size={24} color="#10B981" />
              <Text style={styles.summaryTitle}>
                {exerciseHistory.reduce((total, entry) => total + (entry.exercise_minutes && typeof entry.exercise_minutes === 'number' ? entry.exercise_minutes : 0), 0)}
              </Text>
              <Text style={styles.summarySubtitle}>Total Minutes</Text>
            </View>
          </View>

          {/* Exercise Entries */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Exercise Entries</Text>
            
            {exerciseHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="dumbbell" size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Exercise Entries</Text>
                <Text style={styles.emptySubtitle}>
                  Start tracking your exercises to see your history here
                </Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => navigation.navigate('FitnessTracking')}
                >
                  <Text style={styles.addButtonText}>Add Exercise Entry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              exerciseHistory.map((entry) => (
                <Card key={entry.id} style={styles.exerciseCard}>
                  <Card.Content>
                    <View style={styles.exerciseHeader}>
                      <View style={styles.exerciseInfo}>
                        <View style={[
                          styles.exerciseIcon,
                          { backgroundColor: getWorkoutColor(entry.workout_type) + '20' }
                        ]}>
                          <Icon
                            name={getWorkoutIcon(entry.workout_type)}
                            size={20}
                            color={getWorkoutColor(entry.workout_type)}
                          />
                        </View>
                        <View style={styles.exerciseDetails}>
                          <Text style={styles.exerciseType}>
                            {entry.workout_type || 'Exercise'}
                          </Text>
                          <Text style={styles.exerciseDate}>
                            {formatDate(entry.created_at)} at {formatTime(entry.created_at)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.exerciseActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => {
                            setSelectedEntry(entry);
                            setShowDetails(true);
                          }}
                        >
                          <Icon name="eye" size={20} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteExercise(entry)}
                        >
                          <Icon name="delete" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Workout Parameters */}
                    {(() => {
                      const parameters = getWorkoutParameters(entry);
                      if (parameters.length > 0) {
                        return (
                          <View style={styles.parametersContainer}>
                            {parameters.map((param, index) => (
                              <View key={index} style={styles.parameterItem}>
                                <Text style={styles.parameterLabel}>{param.label}</Text>
                                <Text style={styles.parameterValue}>
                                  {param.value}{param.unit ? ` ${param.unit}` : ''}
                                </Text>
                              </View>
                            ))}
                          </View>
                        );
                      }
                      return null;
                    })()}

                                         {/* Calories */}
                     <View style={styles.caloriesContainer}>
                       <Icon name="fire" size={16} color="#F59E0B" />
                       <Text style={styles.caloriesValue}>
                         {entry.calories_burned && typeof entry.calories_burned === 'number' ? entry.calories_burned : 0}
                       </Text>
                       <Text style={styles.caloriesLabel}>calories</Text>
                     </View>

                    {getActualNotes(entry) && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesLabel}>Notes:</Text>
                        <Text style={styles.notesText}>{getActualNotes(entry)}</Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        </ScrollView>

        {/* Exercise Details Modal */}
        {showDetails && selectedEntry && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Exercise Details</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDetails(false)}
                >
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Workout Type</Text>
                  <View style={styles.detailValue}>
                    <Icon
                      name={getWorkoutIcon(selectedEntry.workout_type)}
                      size={20}
                      color={getWorkoutColor(selectedEntry.workout_type)}
                    />
                    <Text style={styles.detailText}>
                      {selectedEntry.workout_type || 'Exercise'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Date & Time</Text>
                  <Text style={styles.detailText}>
                    {formatDate(selectedEntry.created_at)} at {formatTime(selectedEntry.created_at)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Parameters</Text>
                  <View style={styles.detailParameters}>
                    {getWorkoutParameters(selectedEntry).map((param, index) => (
                      <View key={index} style={styles.detailParameterItem}>
                        <Text style={styles.detailParameterLabel}>{param.label}</Text>
                        <Text style={styles.detailParameterValue}>
                          {param.value}{param.unit ? ` ${param.unit}` : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Calories Burned</Text>
                                     <View style={styles.detailCalories}>
                     <Icon name="fire" size={24} color="#F59E0B" />
                     <Text style={styles.detailCaloriesValue}>
                       {selectedEntry.calories_burned && typeof selectedEntry.calories_burned === 'number' ? selectedEntry.calories_burned : 0}
                     </Text>
                     <Text style={styles.detailCaloriesLabel}>calories</Text>
                   </View>
                </View>

                {getActualNotes(selectedEntry) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Notes</Text>
                    <Text style={styles.detailText}>{getActualNotes(selectedEntry)}</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    setShowDetails(false);
                    handleDeleteExercise(selectedEntry);
                  }}
                >
                  <Icon name="delete" size={20} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Delete Entry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#1F2937",
    fontSize: 16,
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 8,
  },
  summarySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#E22345",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseCard: {
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  exerciseInfo: {
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
  exerciseDetails: {
    flex: 1,
  },
  exerciseType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  exerciseDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  exerciseActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  exerciseStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  parametersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  parameterItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
  },
  parameterLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  parameterValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  caloriesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  caloriesValue: {
    fontSize: 16,
    color: "#F59E0B",
    fontWeight: "700",
    marginLeft: 4,
  },
  caloriesLabel: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "500",
    marginLeft: 4,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: width - 40,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
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
  modalContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  detailValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 8,
  },
  detailStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailStatItem: {
    alignItems: "center",
    minWidth: 80,
  },
  detailStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  detailStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  detailParameters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailParameterItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 100,
    alignItems: "center",
  },
  detailParameterLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  detailParameterValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  detailCalories: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailCaloriesValue: {
    fontSize: 24,
    color: "#F59E0B",
    fontWeight: "700",
    marginLeft: 8,
  },
  detailCaloriesLabel: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "500",
    marginLeft: 4,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ExerciseHistoryScreen;
