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
}

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
    }
  }, [isAuthenticated]);

  const loadExerciseHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.getFitnessHistory();
      
      if (response.success && response.data) {
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
            created_at: entry.created_at,
            updated_at: entry.updated_at
          };
        });
        
        setExerciseHistory(mappedData);
      } else {
        setExerciseHistory([]);
      }
    } catch (error) {
      console.error("Error loading exercise history:", error);
      handleAuthError(error, () => {
        navigation.navigate('Login');
      });
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
              onPress={() => navigation.goBack()}
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
                {exerciseHistory.reduce((total, entry) => total + (typeof entry.calories_burned === 'number' ? entry.calories_burned : 0), 0)}
              </Text>
              <Text style={styles.summarySubtitle}>Total Calories</Text>
            </View>
            <View style={styles.summaryCard}>
              <Icon name="clock-outline" size={24} color="#10B981" />
              <Text style={styles.summaryTitle}>
                {exerciseHistory.reduce((total, entry) => total + (typeof entry.exercise_minutes === 'number' ? entry.exercise_minutes : 0), 0)}
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

                    <View style={styles.exerciseStats}>
                      <View style={styles.statItem}>
                        <Icon name="walk" size={16} color="#6B7280" />
                        <Text style={styles.statValue}>
                          {typeof entry.steps === 'number' ? entry.steps.toLocaleString() : '0'}
                        </Text>
                        <Text style={styles.statLabel}>Steps</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="clock-outline" size={16} color="#6B7280" />
                        <Text style={styles.statValue}>
                          {typeof entry.exercise_minutes === 'number' ? entry.exercise_minutes : 0}
                        </Text>
                        <Text style={styles.statLabel}>Minutes</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="fire" size={16} color="#6B7280" />
                        <Text style={styles.statValue}>
                          {typeof entry.calories_burned === 'number' ? entry.calories_burned : 0}
                        </Text>
                        <Text style={styles.statLabel}>Calories</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="map-marker-distance" size={16} color="#6B7280" />
                        <Text style={styles.statValue}>
                          {(() => {
                            const distance = entry.distance_km;
                            if (typeof distance === 'number' && distance > 0) {
                              return distance.toFixed(1);
                            } else if (distance === 0) {
                              return '0.0';
                            } else {
                              return '0.0';
                            }
                          })()}
                        </Text>
                        <Text style={styles.statLabel}>km</Text>
                      </View>
                    </View>

                    {entry.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesLabel}>Notes:</Text>
                        <Text style={styles.notesText}>{entry.notes}</Text>
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
                  <Text style={styles.detailLabel}>Statistics</Text>
                  <View style={styles.detailStats}>
                                         <View style={styles.detailStatItem}>
                       <Text style={styles.detailStatValue}>
                         {typeof selectedEntry.steps === 'number' ? selectedEntry.steps.toLocaleString() : '0'}
                       </Text>
                       <Text style={styles.detailStatLabel}>Steps</Text>
                     </View>
                     <View style={styles.detailStatItem}>
                       <Text style={styles.detailStatValue}>
                         {typeof selectedEntry.exercise_minutes === 'number' ? selectedEntry.exercise_minutes : 0}
                       </Text>
                       <Text style={styles.detailStatLabel}>Minutes</Text>
                     </View>
                     <View style={styles.detailStatItem}>
                       <Text style={styles.detailStatValue}>
                         {typeof selectedEntry.calories_burned === 'number' ? selectedEntry.calories_burned : 0}
                       </Text>
                       <Text style={styles.detailStatLabel}>Calories</Text>
                     </View>
                                         <View style={styles.detailStatItem}>
                       <Text style={styles.detailStatValue}>
                         {(() => {
                           const distance = selectedEntry.distance_km;
                           if (typeof distance === 'number' && distance > 0) {
                             return distance.toFixed(1);
                           } else if (distance === 0) {
                             return '0.0';
                           } else {
                             return '0.0';
                           }
                         })()}
                       </Text>
                       <Text style={styles.detailStatLabel}>Distance (km)</Text>
                     </View>
                  </View>
                </View>

                {selectedEntry.notes && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Notes</Text>
                    <Text style={styles.detailText}>{selectedEntry.notes}</Text>
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
