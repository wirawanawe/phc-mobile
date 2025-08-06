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

const FitnessTrackingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [steps, setSteps] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [distance, setDistance] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [todayData, setTodayData] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadTodayData();
    }
  }, [isAuthenticated]);

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

  const handleSave = async () => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Please login to track fitness data");
      return;
    }

    if (!steps.trim() && !exerciseMinutes.trim()) {
      Alert.alert("Error", "Please enter at least steps or exercise minutes");
      return;
    }

    setIsLoading(true);

    try {
      const fitnessData = {
        steps: parseInt(steps) || 0,
        exercise_minutes: parseInt(exerciseMinutes) || 0,
        calories_burned: parseInt(caloriesBurned) || 0,
        distance_km: parseFloat(distance) || 0,
        workout_type: workoutType,
        notes: notes,
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
                navigation.goBack();
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
            {/* Header */}
            <View style={styles.header}>
              {/* <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Track Fitness</Text>
              <View style={styles.placeholder} /> */}
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Steps Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Steps Today</Text>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="walk"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your steps"
                    placeholderTextColor="#9CA3AF"
                    value={steps}
                    onChangeText={setSteps}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Exercise Minutes Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Exercise Minutes</Text>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="run"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter exercise minutes"
                    placeholderTextColor="#9CA3AF"
                    value={exerciseMinutes}
                    onChangeText={setExerciseMinutes}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Calories Burned Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Calories Burned</Text>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="fire"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter calories burned"
                    placeholderTextColor="#9CA3AF"
                    value={caloriesBurned}
                    onChangeText={setCaloriesBurned}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Distance Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Distance (km)</Text>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="map-marker-distance"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter distance in km"
                    placeholderTextColor="#9CA3AF"
                    value={distance}
                    onChangeText={setDistance}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Workout Type */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Workout Type</Text>
                <View style={styles.workoutTypeContainer}>
                  {workoutTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.workoutTypeButton,
                        workoutType === type && styles.workoutTypeButtonActive,
                      ]}
                      onPress={() => setWorkoutType(type)}
                    >
                      <Text
                        style={[
                          styles.workoutTypeText,
                          workoutType === type && styles.workoutTypeTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="note-text"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, styles.notesInput]}
                    placeholder="Add notes about your workout"
                    placeholderTextColor="#9CA3AF"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    autoCapitalize="sentences"
                    autoCorrect={true}
                  />
                </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
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
  },
  workoutTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  workoutTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  workoutTypeTextActive: {
    color: "#FFFFFF",
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
});

export default FitnessTrackingScreen; 