import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";

const { width } = Dimensions.get("window");

const MoodTrackingScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedStressLevel, setSelectedStressLevel] = useState<number | null>(
    null
  );

  const moods = [
    { id: "1", emoji: "😊", label: "Happy", color: "#10B981" },
    { id: "2", emoji: "😌", label: "Calm", color: "#3B82F6" },
    { id: "3", emoji: "😐", label: "Neutral", color: "#6B7280" },
    { id: "4", emoji: "😔", label: "Sad", color: "#8B5CF6" },
    { id: "5", emoji: "😤", label: "Stressed", color: "#F59E0B" },
    { id: "6", emoji: "😡", label: "Angry", color: "#EF4444" },
  ];

  const stressLevels = [
    { level: 1, label: "Very Low", color: "#10B981" },
    { level: 2, label: "Low", color: "#34D399" },
    { level: 3, label: "Moderate", color: "#F59E0B" },
    { level: 4, label: "High", color: "#F97316" },
    { level: 5, label: "Very High", color: "#EF4444" },
  ];

  const wellnessActivities = [
    {
      id: "1",
      title: "Meditation",
      description: "10 min guided session",
      icon: "meditation",
      color: "#8B5CF6",
      duration: "10 min",
    },
    {
      id: "2",
      title: "Deep Breathing",
      description: "Calm your mind",
      icon: "wind",
      color: "#3B82F6",
      duration: "5 min",
    },
    {
      id: "3",
      title: "Gratitude Journal",
      description: "Write 3 things you're grateful for",
      icon: "book-open-variant",
      color: "#10B981",
      duration: "5 min",
    },
    {
      id: "4",
      title: "Quick Walk",
      description: "Get some fresh air",
      icon: "walk",
      color: "#F59E0B",
      duration: "15 min",
    },
  ];

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleStressLevelSelect = (level: number) => {
    setSelectedStressLevel(level);
  };

  const handleSaveMood = () => {
    // Here you would typically save the mood data to your backend
    navigation.goBack();
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
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mood & Wellness</Text>
            <View style={styles.headerRight} />
          </View>

          {/* How are you feeling today? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
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

          {/* Wellness Activities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Wellness Activities</Text>
            <View style={styles.activitiesGrid}>
              {wellnessActivities.map((activity) => (
                <TouchableOpacity key={activity.id} style={styles.activityCard}>
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: activity.color + "20" },
                    ]}
                  >
                    <Icon
                      name={activity.icon}
                      size={24}
                      color={activity.color}
                    />
                  </View>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                  <View style={styles.activityDuration}>
                    <Icon name="clock-outline" size={14} color="#6B7280" />
                    <Text style={styles.activityDurationText}>
                      {activity.duration}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!selectedMood || selectedStressLevel === null) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSaveMood}
              disabled={!selectedMood || selectedStressLevel === null}
            >
              <LinearGradient
                colors={["#E22345", "#B71C1C"]}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save Mood</Text>
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
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  activityCard: {
    width: (width - 60) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 18,
  },
  activityDuration: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityDurationText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
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
});

export default MoodTrackingScreen;
