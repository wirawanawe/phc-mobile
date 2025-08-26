import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, useTheme, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { safeGoBack } from "../utils/safeNavigation";
import SimpleDatePicker from "../components/SimpleDatePicker";
import eventEmitter from "../utils/eventEmitter";

const { width, height } = Dimensions.get("window");

interface AnthropometryData {
  weight?: number;
  height?: number;
  bmi?: number;
  notes?: string;
}

interface HealthDataEntry {
  id: number;
  data_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes?: string;
}

const AnthropometryScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [anthropometryData, setAnthropometryData] = useState<AnthropometryData>({});
  const [historyData, setHistoryData] = useState<HealthDataEntry[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [inputWeight, setInputWeight] = useState("");
  const [inputHeight, setInputHeight] = useState("");
  
  // Date filter state
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadAnthropometryData();
    loadHistoryData();
    loadProgressData();
  }, []);

  // Reload data when selected date changes
  useEffect(() => {
    loadAnthropometryData();
    loadHistoryData();
    loadProgressData(); // This will filter by measured_date
  }, [selectedDate]);

  // Update input fields when anthropometry data changes
  useEffect(() => {
    if (anthropometryData.weight) {
      setInputWeight(anthropometryData.weight.toString());
    }
    if (anthropometryData.height) {
      setInputHeight(anthropometryData.height.toString());
    }
  }, [anthropometryData]);

  const loadAnthropometryData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      // Convert selected date to string format for API
      const dateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  
      
      const response = await apiService.getHealthData({ 
        user_id: user.id,
        data_type: "weight,height",
        date: dateString
      });

      if (response.success && response.summary?.latest_entries) {
        const latestData: AnthropometryData = {};
        Object.keys(response.summary.latest_entries).forEach(key => {
          const entry = response.summary.latest_entries[key];
          if (entry && typeof entry.value === 'number') {
            latestData[key as keyof AnthropometryData] = entry.value;
          }
        });
        setAnthropometryData(latestData);
      }
    } catch (error) {
      console.error("Error loading anthropometry data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingHistory(true);
      // Convert selected date to string format for API
      const dateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      const response = await apiService.getHealthData({ 
        user_id: user.id,
        limit: 50,
        date: dateString
      });

      if (response.success && response.data) {
        setHistoryData(response.data);
      }
    } catch (error) {
      console.error("Error loading history data:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadProgressData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingProgress(true);
      // Convert selected date to string format for API
      const dateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  
      
      // Load anthropometry progress data filtered by measured_date
      const response = await apiService.getAnthropometryProgress({ 
        user_id: user.id,
        limit: 30,
        measured_date: dateString // Filter by measured_date field in anthropometry_progress table
      });

      if (response.success && response.data) {
        // Additional client-side filtering to ensure we only show data for the exact measured_date
        const filteredData = response.data.filter((entry: any) => {
          const entryDate = new Date(entry.measured_date);
          const entryDateString = entryDate.toLocaleDateString('en-CA');
          return entryDateString === dateString;
        });
        
    
        setProgressData(filteredData);
        setInitialData(response.summary?.initial_data);
      } else {
        setProgressData([]);
      }
    } catch (error) {
      console.error("Error loading progress data:", error);
      setProgressData([]);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const calculateBMI = (weight: number, height: number): number => {
    if (weight && height && height > 0) {
      const heightInMeters = height / 100;
      return weight / (heightInMeters * heightInMeters);
    }
    return 0;
  };

  const getBMICategory = (bmi: number): { category: string; color: string; description: string } => {
    if (bmi < 18.5) {
      return { category: "Berat Badan Kurang", color: "#F59E0B", description: "Berat badan di bawah normal" };
    } else if (bmi >= 18.5 && bmi < 25) {
      return { category: "Berat Badan Normal", color: "#10B981", description: "Berat badan ideal" };
    } else if (bmi >= 25 && bmi < 30) {
      return { category: "Berat Badan Berlebih", color: "#F59E0B", description: "Berat badan berlebih" };
    } else {
      return { category: "Obesitas", color: "#EF4444", description: "Berat badan sangat berlebih" };
    }
  };



  const saveAndCalculateBMI = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const weight = parseFloat(inputWeight);
    const height = parseFloat(inputHeight);

    if (!weight || !height) {
      Alert.alert("Error", "Please enter both weight and height");
      return;
    }

    if (weight < 20 || weight > 300) {
      Alert.alert("Error", "Weight must be between 20 - 300 kg");
      return;
    }

    if (height < 100 || height > 250) {
      Alert.alert("Error", "Height must be between 100 - 250 cm");
      return;
    }

    try {
      setIsLoading(true);
      
      // Save weight to health_data
      await apiService.addHealthData({
        user_id: user.id,
        data_type: "weight",
        value: weight,
        unit: "kg",
        notes: "Input from BMI calculator"
      });

      // Save height to health_data
      await apiService.addHealthData({
        user_id: user.id,
        data_type: "height",
        value: height,
        unit: "cm",
        notes: "Input from BMI calculator"
      });

      // Calculate BMI
      const bmi = calculateBMI(weight, height);
      const bmiInfo = getBMICategory(bmi);
      
      // Save BMI to health_data
      await apiService.addHealthData({
        user_id: user.id,
        data_type: "bmi",
        value: bmi,
        unit: "kg/m²",
        notes: `Dihitung otomatis dari berat dan tinggi badan - ${bmiInfo.category}`
      });

      // Save to anthropometry_progress table
      const today = new Date().toISOString().split('T')[0];
      await apiService.addAnthropometryProgress({
        user_id: user.id,
        weight: weight,
        height: height,
        bmi: bmi,
        bmi_category: bmiInfo.category,
        notes: "Pengukuran harian",
        measured_date: today
      });

      // Update local state
      setAnthropometryData(prev => ({
        ...prev,
        weight: weight,
        height: height,
        bmi: bmi
      }));

      // Clear input fields
      setInputWeight("");
      setInputHeight("");

      Alert.alert(
        "Berhasil",
        "Data BB, TB, dan BMI berhasil disimpan",
        [{ text: "OK" }]
      );
      
      // Emit event for tracking history update
      eventEmitter.emit('anthropometryLogged');
      
      // Reload data
      loadAnthropometryData();
      loadHistoryData();
      loadProgressData();
    } catch (error) {
      console.error("Error saving BMI data:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };



  const getLatestValue = (measurementType: string): number | undefined => {
    const value = anthropometryData[measurementType as keyof AnthropometryData];
    return typeof value === 'number' ? value : undefined;
  };

  const getMeasurementHistory = (measurementType: string): HealthDataEntry[] => {
    return historyData.filter(entry => entry.data_type === measurementType).slice(0, 5);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

    return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => safeGoBack(navigation)}
          >
            <Icon name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>BMI Calculator</Text>
            <Text style={styles.headerSubtitle}>Calculate your Body Mass Index</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              loadAnthropometryData();
              loadHistoryData();
              loadProgressData();
            }}
            disabled={isLoading}
          >
            <Icon name="refresh" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
         

          {/* Calculator Form */}
          <View style={styles.calculatorForm}>
            <Text style={styles.formTitle}>Calculate Your BMI</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your weight"
                keyboardType="numeric"
                value={inputWeight}
                onChangeText={setInputWeight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your height"
                keyboardType="numeric"
                value={inputHeight}
                onChangeText={setInputHeight}
              />
            </View>

            <TouchableOpacity
              style={styles.calculateButton}
              onPress={saveAndCalculateBMI}
              disabled={!inputWeight || !inputHeight || isLoading}
            >
              <Text style={styles.calculateButtonText}>
                {isLoading ? "Saving..." : "Save & Calculate BMI"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* BMI Result */}
          {anthropometryData.weight && anthropometryData.height && (
            <View style={styles.resultContainer}>
              <LinearGradient
                colors={(() => {
                  const bmiValue = calculateBMI(anthropometryData.weight, anthropometryData.height);
                  const bmiInfo = getBMICategory(bmiValue);
                  return [bmiInfo.color + "20", bmiInfo.color + "10"];
                })()}
                style={styles.resultCard}
              >
                <Text style={styles.resultTitle}>Your BMI Result</Text>
                <Text style={[styles.resultValue, { color: (() => {
                  const bmiValue = calculateBMI(anthropometryData.weight, anthropometryData.height);
                  const bmiInfo = getBMICategory(bmiValue);
                  return bmiInfo.color;
                })() }]}>
                  {Math.round(calculateBMI(anthropometryData.weight, anthropometryData.height))}
                </Text>
                <Text style={styles.resultUnit}>kg/m²</Text>
                <View style={styles.resultCategory}>
                  <Text style={[styles.resultCategoryText, { color: "#1F2937" }]}>
                    {(() => {
                      const bmiValue = calculateBMI(anthropometryData.weight, anthropometryData.height);
                      const bmiInfo = getBMICategory(bmiValue);
                      return bmiInfo.category;
                    })()}
                  </Text>
                </View>
                <Text style={styles.resultDescription}>
                  {(() => {
                    const bmiValue = calculateBMI(anthropometryData.weight, anthropometryData.height);
                    const bmiInfo = getBMICategory(bmiValue);
                    return bmiInfo.description;
                  })()}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Progress Summary */}
          {initialData && (
            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>Progress Summary</Text>
              <Text style={styles.progressSubtitle}>
                Perbandingan data awal dengan data terbaru
              </Text>
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressHeaderSubtitle}>Data Awal</Text>
                  <Text style={styles.progressHeaderSubtitle}>Data Terbaru</Text>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Berat Badan</Text>
                    <Text style={styles.progressValue}>{initialData.initial_weight} kg</Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Tinggi Badan</Text>
                    <Text style={styles.progressValue}>{initialData.initial_height} cm</Text>
                  </View>
                </View>
                {progressData.length > 0 && (
                  <View style={styles.progressRow}>
                    <View style={styles.progressItem}>
                      <Text style={styles.progressLabel}>Berat Sekarang</Text>
                      <Text style={styles.progressValue}>{progressData[0].weight} kg</Text>
                    </View>
                    <View style={styles.progressItem}>
                      <Text style={styles.progressLabel}>Perubahan</Text>
                      <Text style={[styles.progressValue, { 
                        color: parseFloat(progressData[0].weight_change) < 0 ? '#10B981' : '#EF4444' 
                      }]}>
                        {parseFloat(progressData[0].weight_change) > 0 ? '+' : ''}{progressData[0].weight_change} kg
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Recent Progress */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <View style={styles.historyTitleContainer}>
                <Text style={styles.historyTitle}>Progress Data</Text>
                <Text style={styles.historySubtitle}>
                  Data pengukuran untuk tanggal {selectedDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.refreshProgressButton}
                onPress={() => loadProgressData()}
                disabled={isLoadingProgress}
              >
                <Icon name="refresh" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {/* Date Filter for Progress Data */}
            <View style={styles.dateFilterContainer}>
              <Text style={styles.dateFilterLabel}>Filter berdasarkan Tanggal Pengukuran:</Text>
              <SimpleDatePicker
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                theme={theme}
                title="Pilih Tanggal Pengukuran"
                variant="light"
              />
            </View>
            {isLoadingProgress ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading progress...</Text>
              </View>
            ) : progressData.length > 0 ? (
              <View style={styles.historyList}>
                {progressData.slice(0, 5).map((entry) => {
                  const bmiInfo = getBMICategory(parseFloat(entry.bmi));
                  return (
                    <View key={entry.id} style={styles.historyItem}>
                      <View style={[styles.historyIcon, { backgroundColor: bmiInfo.color + '20' }]}>
                        <Icon
                          name="trending-up"
                          size={20}
                          color={bmiInfo.color}
                        />
                      </View>
                      <View style={styles.historyContent}>
                        <Text style={styles.historyItemTitle}>
                          Progress - {new Date(entry.measured_date).toLocaleDateString('id-ID')}
                        </Text>
                        <Text style={[styles.historyItemValue, { color: bmiInfo.color }]}>
                          {entry.weight} kg • BMI: {Math.round(parseFloat(entry.bmi))} kg/m²
                        </Text>
                        <View style={styles.historyItemDetails}>
                          <Text style={[styles.historyItemCategory, { color: "#1F2937" }]}>
                            {entry.bmi_category}
                          </Text>
                          <Text style={styles.historyItemDate}>
                            {parseFloat(entry.weight_change) > 0 ? '+' : ''}{entry.weight_change} kg
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="trending-up" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>Tidak ada data pengukuran</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Tidak ada data pengukuran untuk tanggal {selectedDate.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>


      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
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
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  refreshButton: {
    padding: 5,
  },
  dateFilterContainer: {
    marginBottom: 16,
  },
  dateFilterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  programIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  calculatorForm: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },

  calculateButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resultContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  resultCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 4,
  },
  resultUnit: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
  },
  resultCategory: {
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultCategoryText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#1F2937",
  },
  resultDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  historySection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  historySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  historyTitleContainer: {
    flex: 1,
  },
  refreshProgressButton: {
    padding: 8,
    marginLeft: 12,
  },
  bmiCard: {
    margin: 20,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bmiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bmiTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 12,
  },
  bmiContent: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3B82F6",
    marginRight: 8,
  },
  bmiUnit: {
    fontSize: 16,
    color: "#6B7280",
  },
  bmiCategory: {
    alignItems: "flex-start",
  },
  bmiCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  bmiCategoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  bmiDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  measurementGrid: {
    gap: 12,
  },
  measurementCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  measurementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  measurementContent: {
    flex: 1,
  },
  measurementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  measurementSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  latestValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  latestValueText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  latestValueLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  historyItemValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 2,
  },
  historyItemDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  historyItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  historyItemCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  progressSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressHeaderSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressItem: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  historyNotes: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

});

export default AnthropometryScreen;
