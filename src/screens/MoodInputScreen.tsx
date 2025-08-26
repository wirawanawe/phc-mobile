import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";

import eventEmitter from "../utils/eventEmitter";
import { safeGoBack } from "../utils/safeNavigation";
import { getTodayDate } from "../utils/dateUtils";

const { width } = Dimensions.get("window");

interface MoodInputScreenProps {
  navigation: any;
  route: {
    params: {
      isEditMode?: boolean;
      existingMood?: any;
    };
  };
}

const MoodInputScreen = ({ navigation, route }: MoodInputScreenProps) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const { isEditMode = false, existingMood = null } = route.params || {};
  
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedStressLevel, setSelectedStressLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const moods = [
    { id: "very_happy", emoji: "😊", label: "Very Happy", color: "#10B981" },
    { id: "happy", emoji: "😌", label: "Happy", color: "#34D399" },
    { id: "neutral", emoji: "😐", label: "Neutral", color: "#6B7280" },
    { id: "sad", emoji: "😔", label: "Sad", color: "#8B5CF6" },
    { id: "very_sad", emoji: "😢", label: "Very Sad", color: "#EF4444" },
  ];

  const stressLevels = [
    { level: 1, label: "Very Low", color: "#10B981" },
    { level: 2, label: "Low", color: "#34D399" },
    { level: 3, label: "Moderate", color: "#F59E0B" },
    { level: 4, label: "High", color: "#F97316" },
    { level: 5, label: "Very High", color: "#EF4444" },
  ];

  useEffect(() => {
    if (isEditMode && existingMood) {
      setSelectedMood(existingMood.mood_level);
      setSelectedStressLevel(existingMood.stress_level ? 
        (existingMood.stress_level === 'low' ? 2 : 
         existingMood.stress_level === 'moderate' ? 3 : 
         existingMood.stress_level === 'high' ? 4 : 5) : null);
    }
  }, [isEditMode, existingMood]);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleStressLevelSelect = (level: number) => {
    setSelectedStressLevel(level);
  };

  const handleSaveMood = async () => {

    
    // Test connection first

    try {
      const connectionTest = await apiService.testConnection();
  
    } catch (error) {
      console.error('🔍 MoodInputScreen: Connection test failed:', error);
    }
    
    if (!selectedMood) {
      Alert.alert("No Mood Selected", "Please select your mood before saving");
      return;
    }

    // Removed hard auth block to allow saving without login since backend endpoint doesn't require auth
    // if (!isAuthenticated) {
    //   Alert.alert("Authentication Required", "Please log in to save your mood");
    //   return;
    // }

    setIsLoading(true);

    try {
      const moodData = {
        mood_level: selectedMood,
        stress_level: selectedStressLevel ? 
          (selectedStressLevel <= 2 ? 'low' : 
           selectedStressLevel <= 3 ? 'moderate' : 
           selectedStressLevel <= 4 ? 'high' : 'very_high') : null,
        energy_level: null,
        tracking_date: getTodayDate(),
        notes: `Mood: ${moods.find(m => m.id === selectedMood)?.label}, Stress Level: ${selectedStressLevel || 'Not specified'}`
      };

  

      let response;
      if (isEditMode && existingMood) {
        // For edit mode, use regular API
        response = await apiService.updateMoodEntry(existingMood.id, moodData);
      } else {
        // For new mood entry, use regular API
        response = await apiService.createMoodEntry(moodData);
      }

      if (response.success) {
        // Emit event to notify other components that mood data has been updated
        // Do this immediately after successful response, before showing alert
        eventEmitter.emitMoodLogged();
        
        // Show success message
        const successMessage = isEditMode ? "Mood updated successfully!" : "Mood data saved successfully!";
        
        Alert.alert(
          "Success",
          successMessage,
          [
            {
              text: "OK",
              onPress: () => {
                safeGoBack(navigation);
              },
            },
          ]
        );
      } else {
        console.error('🔍 MoodInputScreen: API returned error:', response);
        Alert.alert("Error", response.message || "Failed to save mood data");
      }
    } catch (error: any) {
      console.error("🔍 MoodInputScreen: Error saving mood data:", error);
      Alert.alert("Error", "Failed to save mood data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => safeGoBack(navigation)}
            >
              <Icon name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditMode ? "Update Mood" : "Log Your Mood"}
            </Text>
            <View style={styles.headerRight} />
          </View>

          {/* How are you feeling today? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEditMode ? "Update your mood" : "How are you feeling today?"}
            </Text>
            <View style={styles.moodGrid}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodCard,
                    selectedMood === mood.id && styles.moodCardSelected,
                  ]}
                  onPress={() => handleMoodSelect(mood.id)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stress Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stress Level</Text>
            <View style={styles.stressLevelContainer}>
              {stressLevels.map((stress) => (
                <TouchableOpacity
                  key={stress.level}
                  style={[
                    styles.stressLevelCard,
                    selectedStressLevel === stress.level &&
                      styles.stressLevelCardSelected,
                  ]}
                  onPress={() => handleStressLevelSelect(stress.level)}
                >
                  <View
                    style={[
                      styles.stressLevelIndicator,
                      { backgroundColor: stress.color },
                    ]}
                  />
                  <Text style={styles.stressLevelLabel}>{stress.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!selectedMood || isLoading) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSaveMood}
              disabled={!selectedMood || isLoading}
            >
              <LinearGradient
                colors={["#E22345", "#B71C1C"]}
                style={styles.saveButtonGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditMode ? "Update Mood" : "Save Mood"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerRight: {
    width: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  moodCard: {
    width: (width - 60) / 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodCardSelected: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  stressLevelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  stressLevelCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  stressLevelCardSelected: {
    borderColor: "#E22345",
    backgroundColor: "#FEF2F2",
  },
  stressLevelIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  stressLevelLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default MoodInputScreen;
