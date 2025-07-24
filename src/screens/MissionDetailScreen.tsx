import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text, Button, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const MissionDetailScreen = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const { mission, userMission } = route.params;

  const [currentValue, setCurrentValue] = useState(
    userMission?.current_value || 0
  );
  const [notes, setNotes] = useState(userMission?.notes || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("Login");
    }
  }, [isAuthenticated, navigation]);

  const handleAcceptMission = async () => {
    try {
      setLoading(true);
      const response = await api.acceptMission(mission.id);
      if (response.success) {
        Alert.alert("Success", "Mission accepted successfully!");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error accepting mission:", error);

      // Handle specific error cases
      if (
        error.message &&
        error.message.includes("already have this mission active")
      ) {
        Alert.alert(
          "Mission Already Active",
          "You already have this mission in progress. Check your active missions!"
        );
      } else {
        Alert.alert("Error", "Failed to accept mission. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      setLoading(true);
      const response = await api.updateMissionProgress(userMission.id, {
        current_value: currentValue,
        notes: notes,
      });
      if (response.success) {
        if (response.message === "Mission completed!") {
          Alert.alert("Congratulations!", "Mission completed successfully!");
        } else {
          Alert.alert("Success", "Progress updated successfully!");
        }
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      Alert.alert("Error", "Failed to update progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonMission = async () => {
    Alert.alert(
      "Abandon Mission",
      "Are you sure you want to abandon this mission?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Abandon",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await api.abandonMission(userMission.id);
              if (response.success) {
                Alert.alert("Success", "Mission abandoned.");
                navigation.goBack();
              }
            } catch (error) {
              console.error("Error abandoning mission:", error);
              Alert.alert(
                "Error",
                "Failed to abandon mission. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "hard":
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  const getProgressPercentage = () => {
    if (!userMission) return 0;
    return Math.min(
      Math.round((userMission.current_value / mission.target_value) * 100),
      100
    );
  };

  const isCompleted = userMission?.status === "completed";
  const isActive = userMission?.status === "active";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mission Detail</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Mission Card */}
        <View style={styles.missionCard}>
          <LinearGradient
            colors={[mission.color + "20", mission.color + "10"]}
            style={styles.missionGradient}
          >
            <View style={styles.missionHeader}>
              <View
                style={[
                  styles.missionIcon,
                  { backgroundColor: mission.color + "30" },
                ]}
              >
                <Icon name={mission.icon} size={32} color={mission.color} />
              </View>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionDescription}>
                  {mission.description}
                </Text>
                <View style={styles.missionMeta}>
                  <View
                    style={[
                      styles.difficultyBadge,
                      {
                        backgroundColor: getDifficultyColor(mission.difficulty),
                      },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {mission.difficulty.charAt(0).toUpperCase() +
                        mission.difficulty.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.pointsContainer}>
                    <Icon name="star" size={16} color="#F59E0B" />
                    <Text style={styles.pointsText}>{mission.points} pts</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Mission Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Icon name="target" size={20} color="#64748B" />
            <Text style={styles.detailLabel}>Target:</Text>
            <Text style={styles.detailValue}>
              {mission.target_value} {mission.unit}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color="#64748B" />
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>
              {mission.type.charAt(0).toUpperCase() + mission.type.slice(1)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="tag" size={20} color="#64748B" />
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>
              {mission.category
                .replace("_", " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        {userMission && (
          <View style={styles.progressContainer}>
            <Text style={styles.sectionTitle}>Your Progress</Text>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Current Progress</Text>
                <Text style={styles.progressPercentage}>
                  {getProgressPercentage()}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: mission.color,
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {userMission.current_value} / {mission.target_value}{" "}
                {mission.unit}
              </Text>
            </View>

            {isActive && (
              <View style={styles.updateSection}>
                <Text style={styles.sectionTitle}>Update Progress</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Current Value:</Text>
                  <TextInput
                    mode="outlined"
                    value={currentValue.toString()}
                    onChangeText={(text) =>
                      setCurrentValue(parseInt(text) || 0)
                    }
                    keyboardType="numeric"
                    style={styles.input}
                    outlineColor="#E2E8F0"
                    activeOutlineColor={mission.color}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Notes (Optional):</Text>
                  <TextInput
                    mode="outlined"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    outlineColor="#E2E8F0"
                    activeOutlineColor={mission.color}
                    placeholder="Add notes about your progress..."
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleUpdateProgress}
                  loading={loading}
                  disabled={loading}
                  style={[styles.button, { backgroundColor: mission.color }]}
                  contentStyle={styles.buttonContent}
                >
                  Update Progress
                </Button>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!userMission ? (
            <Button
              mode="contained"
              onPress={handleAcceptMission}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: mission.color }]}
              contentStyle={styles.buttonContent}
            >
              Accept Mission
            </Button>
          ) : isActive ? (
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleAbandonMission}
                loading={loading}
                disabled={loading}
                style={[styles.button, styles.abandonButton]}
                contentStyle={styles.buttonContent}
                textColor="#EF4444"
              >
                Abandon Mission
              </Button>
            </View>
          ) : isCompleted ? (
            <View style={styles.completedContainer}>
              <Text style={styles.completedTitle}>Mission Completed!</Text>
              <Text style={styles.completedSubtitle}>
                You earned {userMission.points_earned} points
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 34,
  },
  missionCard: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  missionGradient: {
    padding: 24,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  missionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
  },
  missionDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 12,
  },
  missionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
    marginLeft: 4,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 12,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  progressCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  updateSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  button: {
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  abandonButton: {
    borderColor: "#EF4444",
    flex: 1,
  },
  completedContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 12,
    marginBottom: 4,
  },
  completedSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
});

export default MissionDetailScreen;
