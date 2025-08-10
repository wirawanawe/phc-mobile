import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { Text, useTheme, Button, Card, ProgressBar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

interface HealthGoal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: string;
  progress: number;
  color: string;
  icon: string;
}

const HealthGoalsScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user } = useAuth();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);
  const [editValue, setEditValue] = useState("");
  const [userWeightFromDB, setUserWeightFromDB] = useState<number | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    currentValue: "",
    targetValue: "",
    unit: "",
    category: "general",
  });

  const goalCategories = [
    { id: "weight", name: "Berat Badan", icon: "scale", color: "#10B981" },
    { id: "blood_pressure", name: "Tekanan Darah", icon: "heart-pulse", color: "#EF4444" },
    { id: "blood_sugar", name: "Gula Darah", icon: "test-tube", color: "#F59E0B" },
    { id: "cholesterol", name: "Kolesterol", icon: "flask", color: "#8B5CF6" },
    { id: "exercise", name: "Olahraga", icon: "run", color: "#3B82F6" },
    { id: "sleep", name: "Tidur", icon: "bed", color: "#6366F1" },
    { id: "water", name: "Minum Air", icon: "cup-water", color: "#06B6D4" },
    { id: "general", name: "Umum", icon: "target", color: "#6B7280" },
  ];

  useEffect(() => {
    loadHealthGoals();
    loadUserWeightFromDatabase();
  }, []);

  const loadHealthGoals = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockGoals: HealthGoal[] = [
        {
          id: "1",
          title: "Target Berat Badan",
          currentValue: 75,
          targetValue: 70,
          unit: "kg",
          category: "weight",
          progress: 0.5,
          color: "#10B981",
          icon: "scale",
        },
        {
          id: "2",
          title: "Tekanan Darah Sistolik",
          currentValue: 140,
          targetValue: 120,
          unit: "mmHg",
          category: "blood_pressure",
          progress: 0.3,
          color: "#EF4444",
          icon: "heart-pulse",
        },
        {
          id: "3",
          title: "Gula Darah Puasa",
          currentValue: 110,
          targetValue: 100,
          unit: "mg/dL",
          category: "blood_sugar",
          progress: 0.7,
          color: "#F59E0B",
          icon: "test-tube",
        },
        {
          id: "4",
          title: "Olahraga Harian",
          currentValue: 25,
          targetValue: 30,
          unit: "menit",
          category: "exercise",
          progress: 0.83,
          color: "#3B82F6",
          icon: "run",
        },
      ];
      setGoals(mockGoals);
    } catch (error) {
      console.error("Error loading health goals:", error);
      Alert.alert("Error", "Gagal memuat data tujuan kesehatan");
    } finally {
      setLoading(false);
    }
  };

  const loadUserWeightFromDatabase = async () => {
    try {
      // Get user profile from API
      const response = await api.getUserProfile();
      
      if (response.success && response.data) {
        const userData = response.data;
        const userWeight = userData.weight;
        
        if (userWeight && userWeight > 0) {
          console.log("User weight from database:", userWeight);
          setUserWeightFromDB(userWeight);
          
          // Update existing weight goal or create new one
          setGoals(prevGoals => {
            const existingWeightGoal = prevGoals.find(goal => goal.category === "weight");
            
            if (existingWeightGoal) {
              // Update existing weight goal with current weight from database
              return prevGoals.map(goal => {
                if (goal.category === "weight") {
                  const progress = Math.min(Math.max(1 - Math.abs(userWeight - goal.targetValue) / Math.abs(goal.targetValue), 0), 1);
                  return {
                    ...goal,
                    currentValue: userWeight,
                    progress: progress,
                  };
                }
                return goal;
              });
            } else {
              // Create new weight goal with current weight from database
              const newWeightGoal: HealthGoal = {
                id: Date.now().toString(),
                title: "Target Berat Badan",
                currentValue: userWeight,
                targetValue: userWeight - 5, // Default target: lose 5kg
                unit: "kg",
                category: "weight",
                progress: 0.5, // Will be calculated properly
                color: "#10B981",
                icon: "scale",
              };
              
              // Calculate proper progress
              const progress = Math.min(Math.max(1 - Math.abs(newWeightGoal.currentValue - newWeightGoal.targetValue) / Math.abs(newWeightGoal.targetValue), 0), 1);
              newWeightGoal.progress = progress;
              
              return [...prevGoals, newWeightGoal];
            }
          });
        }
      }
    } catch (error) {
      console.error("Error loading user weight from database:", error);
      // Don't show alert for this error as it's not critical
    }
  };

  const updateUserWeightInDatabase = async (newWeight: number) => {
    try {
      // Update user weight in database
      const response = await api.updateUserProfile({
        weight: newWeight
      });
      
      if (response.success) {
        console.log("Weight updated in database:", newWeight);
      } else {
        throw new Error("Failed to update weight in database");
      }
    } catch (error) {
      console.error("Error updating weight in database:", error);
      throw error;
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.currentValue || !newGoal.targetValue) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    const current = parseFloat(newGoal.currentValue);
    const target = parseFloat(newGoal.targetValue);
    
    if (isNaN(current) || isNaN(target)) {
      Alert.alert("Error", "Nilai harus berupa angka");
      return;
    }

    const category = goalCategories.find(cat => cat.id === newGoal.category);
    // Calculate progress based on how close current value is to target
    const progress = Math.min(Math.max(1 - Math.abs(current - target) / Math.abs(target), 0), 1);

    const goal: HealthGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      currentValue: current,
      targetValue: target,
      unit: newGoal.unit,
      category: newGoal.category,
      progress: progress,
      color: category?.color || "#6B7280",
      icon: category?.icon || "target",
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: "",
      currentValue: "",
      targetValue: "",
      unit: "",
      category: "general",
    });
    setShowAddGoal(false);
  };

  const handleUpdateGoal = (goalId: string, newCurrentValue: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        // Calculate progress based on how close current value is to target
        const progress = Math.min(Math.max(1 - Math.abs(newCurrentValue - goal.targetValue) / Math.abs(goal.targetValue), 0), 1);
        return { ...goal, currentValue: newCurrentValue, progress };
      }
      return goal;
    }));
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      "Hapus Tujuan",
      "Apakah Anda yakin ingin menghapus tujuan ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            setGoals(goals.filter(goal => goal.id !== goalId));
          },
        },
      ]
    );
  };

  const handleEditGoal = (goal: HealthGoal) => {
    setEditingGoal(goal);
    setEditValue(goal.currentValue.toString());
    setNewGoal({
      title: goal.title,
      currentValue: goal.currentValue.toString(),
      targetValue: goal.targetValue.toString(),
      unit: goal.unit,
      category: goal.category,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingGoal || !newGoal.currentValue || !newGoal.targetValue) {
      Alert.alert("Error", "Nilai saat ini dan target harus diisi");
      return;
    }

    const current = parseFloat(newGoal.currentValue);
    const target = parseFloat(newGoal.targetValue);
    
    if (isNaN(current) || isNaN(target)) {
      Alert.alert("Error", "Nilai harus berupa angka");
      return;
    }

    // Calculate progress based on how close current value is to target
    const progress = Math.min(Math.max(1 - Math.abs(current - target) / Math.abs(target), 0), 1);

    // Update only current value and target value
    setGoals(goals.map(goal => {
      if (goal.id === editingGoal.id) {
        return {
          ...goal,
          currentValue: current,
          targetValue: target,
          progress: progress,
        };
      }
      return goal;
    }));

    // If this is a weight goal, update the database
    if (editingGoal.category === "weight") {
      try {
        await updateUserWeightInDatabase(current);
        setUserWeightFromDB(current);
      } catch (error) {
        console.error("Error updating weight in database:", error);
        // Don't show alert as the local update was successful
      }
    }

    setShowEditModal(false);
    setEditingGoal(null);
    setEditValue("");
    setNewGoal({
      title: "",
      currentValue: "",
      targetValue: "",
      unit: "",
      category: "general",
    });
  };

  const renderGoalCard = (goal: HealthGoal) => (
    <Card key={goal.id} style={styles.goalCard}>
      <Card.Content>
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <View style={[styles.goalIcon, { backgroundColor: `${goal.color}20` }]}>
              <Icon name={goal.icon} size={24} color={goal.color} />
            </View>
            <View style={styles.goalDetails}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalValues}>
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </Text>
            </View>
          </View>
          <View style={styles.goalActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditGoal(goal)}
            >
              <Icon name="pencil" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteGoal(goal.id)}
            >
              <Icon name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round(goal.progress * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={goal.progress}
            color={goal.color}
            style={styles.progressBar}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tujuan Kesehatan</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddGoal(true)}
          >
            <Icon name="plus" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.summaryCard}
        >
          <View style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Icon name="target" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>Tujuan Kesehatan Anda</Text>
              <Text style={styles.summarySubtitle}>
                {goals.length} tujuan aktif • {goals.filter(g => g.progress >= 1).length} tercapai
              </Text>
              {userWeightFromDB && (
                <Text style={styles.weightInfo}>
                  Berat Badan Saat Ini: {userWeightFromDB} kg
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Goals List */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Tujuan Aktif</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Memuat tujuan kesehatan...</Text>
            </View>
          ) : goals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="target" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Belum ada tujuan</Text>
              <Text style={styles.emptySubtitle}>
                Tambahkan tujuan kesehatan Anda untuk mulai melacak progress
              </Text>
            </View>
          ) : (
            goals.map(renderGoalCard)
          )}
        </View>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tambah Tujuan Baru</Text>
                <TouchableOpacity
                  onPress={() => setShowAddGoal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Judul Tujuan</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGoal.title}
                  onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
                  placeholder="Contoh: Target Berat Badan"
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nilai Saat Ini</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newGoal.currentValue}
                    onChangeText={(text) => setNewGoal({ ...newGoal, currentValue: text })}
                    placeholder="75"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nilai Target</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newGoal.targetValue}
                    onChangeText={(text) => setNewGoal({ ...newGoal, targetValue: text })}
                    placeholder="70"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Satuan</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGoal.unit}
                  onChangeText={(text) => setNewGoal({ ...newGoal, unit: text })}
                  placeholder="kg, mmHg, dll"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kategori</Text>
                <View style={styles.categoryContainer}>
                  <View style={styles.categorySelector}>
                    {goalCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryOption,
                          newGoal.category === category.id && styles.categoryOptionSelected,
                        ]}
                        onPress={() => setNewGoal({ ...newGoal, category: category.id })}
                      >
                        <Icon name={category.icon} size={14} color={newGoal.category === category.id ? "#FFFFFF" : category.color} />
                        <Text style={[
                          styles.categoryOptionText,
                          newGoal.category === category.id && styles.categoryOptionTextSelected,
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddGoal(false)}
                  style={styles.cancelButton}
                >
                  Batal
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddGoal}
                  style={styles.saveButton}
                >
                  Simpan
                </Button>
              </View>
            </View>
          </View>
        )}

        {/* Edit Goal Modal */}
        {showEditModal && editingGoal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Tujuan</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingGoal(null);
                    setEditValue("");
                    setNewGoal({
                      title: "",
                      currentValue: "",
                      targetValue: "",
                      unit: "",
                      category: "general",
                    });
                  }}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Judul Tujuan</Text>
                <Text style={styles.readOnlyText}>{newGoal.title}</Text>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nilai Saat Ini</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newGoal.currentValue}
                    onChangeText={(text) => setNewGoal({ ...newGoal, currentValue: text })}
                    placeholder="75"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nilai Target</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newGoal.targetValue}
                    onChangeText={(text) => setNewGoal({ ...newGoal, targetValue: text })}
                    placeholder="70"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Satuan</Text>
                <Text style={styles.readOnlyText}>{newGoal.unit}</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kategori</Text>
                <View style={styles.categoryContainer}>
                  <View style={styles.categorySelector}>
                    {goalCategories
                      .filter(category => category.id === newGoal.category)
                      .map((category) => (
                        <View
                          key={category.id}
                          style={[styles.categoryOption, styles.categoryOptionSelected, styles.categoryOptionReadOnly]}
                        >
                          <Icon name={category.icon} size={18} color="#FFFFFF" />
                          <Text style={[styles.categoryOptionTextSelected, { fontSize: 13, marginLeft: 6 }]}>
                            {category.name}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingGoal(null);
                    setEditValue("");
                    setNewGoal({
                      title: "",
                      currentValue: "",
                      targetValue: "",
                      unit: "",
                      category: "general",
                    });
                  }}
                  style={styles.cancelButton}
                >
                  Batal
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveEdit}
                  style={styles.saveButton}
                >
                  Update
                </Button>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  addButton: {
    padding: 8,
  },
  summaryCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  weightInfo: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
    fontWeight: "500",
  },
  goalsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  goalCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  goalInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  goalValues: {
    fontSize: 14,
    color: "#6B7280",
  },
  goalActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 40,
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
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  formSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  readOnlyText: {
    fontSize: 16,
    color: "#374151",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  categoryContainer: {
    minHeight: 60,
  },
  categorySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    minWidth: 90,
    height: 32,
  },
  categoryOptionSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  categoryOptionText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 4,
  },
  categoryOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  categoryOptionReadOnly: {
    minWidth: 140,
    height: 40,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    borderColor: "#D1D5DB",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
});

export default HealthGoalsScreen;
