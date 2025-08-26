import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";
import SimpleDatePicker from "../components/SimpleDatePicker";

interface WellnessProgramHistory {
  id: number;
  program_start_date: string;
  program_end_date: string;
  program_duration: number;
  total_activities: number;
  completed_missions: number;
  total_points: number;
  wellness_score: number;
  avg_water_intake: number;
  avg_sleep_hours: number;
  avg_mood_score: number;
  fitness_goal: string;
  activity_level: string;
  completion_rate: number;
  created_at: string;
}

const WellnessHistoryScreen = ({ navigation }: any) => {
  const { user, isAuthenticated } = useAuth();
  const [programHistory, setProgramHistory] = useState<WellnessProgramHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<WellnessProgramHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<WellnessProgramHistory | null>(null);
  
  // Date filter state
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchWellnessHistory();
  }, []);

  // Load data when selected date changes
  useEffect(() => {
    fetchWellnessHistory();
  }, [selectedDate]);

  // Remove the old filter effect since we're now loading data directly for the selected date
  // useEffect(() => {
  //   filterWellnessHistory();
  // }, [programHistory, selectedDate]);

  const filterWellnessHistory = () => {
    const selectedDateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    const filtered = programHistory.filter((program) => {
      const programStartDate = new Date(program.program_start_date);
      const programEndDate = new Date(program.program_end_date);
      const programStartString = programStartDate.toLocaleDateString('en-CA');
      const programEndString = programEndDate.toLocaleDateString('en-CA');
      
      // Check if selected date falls within program period
      return selectedDateString >= programStartString && selectedDateString <= programEndString;
    });

    setFilteredHistory(filtered);
  };

  const fetchWellnessHistory = async () => {
    try {
      setLoading(true);
      
      // Convert selected date to string format for API
      const dateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      console.log(`🔍 WellnessHistoryScreen - Loading data for date: ${dateString}`);
      
      const response = await apiService.checkWellnessProgramStatus();
      
      if (response.success && response.data?.program_history) {
        // Filter the program history to show programs that were active on the selected date
        const selectedDateString = selectedDate.toLocaleDateString('en-CA');
        const filteredPrograms = response.data.program_history.filter((program: any) => {
          const programStartDate = new Date(program.program_start_date);
          const programEndDate = new Date(program.program_end_date);
          const programStartString = programStartDate.toLocaleDateString('en-CA');
          const programEndString = programEndDate.toLocaleDateString('en-CA');
          
          // Check if selected date falls within program period
          return selectedDateString >= programStartString && selectedDateString <= programEndString;
        });
        
        setProgramHistory(response.data.program_history);
        setFilteredHistory(filteredPrograms);
      } else {
        setProgramHistory([]);
        setFilteredHistory([]);
      }
    } catch (error) {
      console.error("Error fetching wellness history:", error);
      setProgramHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (program: WellnessProgramHistory) => {
    try {
      const cycleNumber = filteredHistory.length - filteredHistory.findIndex(p => p.id === program.id);
      const programDate = new Date(program.program_start_date).toLocaleDateString('id-ID');
      
      Alert.alert(
        "Download Laporan",
        `Apakah Anda ingin mengunduh laporan program wellness cycle ${cycleNumber} (${programDate}) dalam format Excel?`,
        [
          {
            text: "Batal",
            style: "cancel",
          },
          {
            text: "Download",
            onPress: async () => {
              try {
                Alert.alert("Mengunduh...", "Sedang mempersiapkan laporan Excel...");
                
                const response = await apiService.downloadWellnessReport(program.id);
                
                if (response && response.success) {
                  Alert.alert("Berhasil", "Laporan berhasil diunduh! File tersimpan di folder Downloads.");
                } else {
                  Alert.alert("Gagal", "Gagal mengunduh laporan. Silakan coba lagi.");
                }
              } catch (error) {
                console.error("Error downloading report:", error);
                Alert.alert("Error", "Terjadi kesalahan saat mengunduh laporan.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in handleDownloadReport:", error);
      Alert.alert("Error", "Terjadi kesalahan saat mempersiapkan laporan.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFitnessGoalLabel = (goal: string) => {
    const goals: { [key: string]: string } = {
      'weight_loss': 'Menurunkan Berat Badan',
      'muscle_gain': 'Menambah Massa Otot',
      'maintenance': 'Mempertahankan',
      'general_health': 'Kesehatan Umum'
    };
    return goals[goal] || goal;
  };

  const getActivityLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      'sedentary': 'Sangat Sedikit',
      'lightly_active': 'Ringan',
      'moderately_active': 'Sedang',
      'very_active': 'Sangat Aktif',
      'extremely_active': 'Ekstrem Aktif'
    };
    return levels[level] || level;
  };

  const getCompletionRateColor = (rate: number) => {
    if (!rate || typeof rate !== 'number') return '#6B7280';
    if (rate >= 80) return '#10B981';
    if (rate >= 60) return '#F59E0B';
    if (rate >= 40) return '#EF4444';
    return '#6B7280';
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const renderProgramCard = (program: WellnessProgramHistory, index: number) => (
    <TouchableOpacity
      key={program.id}
      style={styles.programCard}
      onPress={() => setSelectedProgram(selectedProgram?.id === program.id ? null : program)}
    >
      <View style={styles.programHeader}>
        <View style={styles.programNumber}>
          <Text style={styles.programNumberText}>#{filteredHistory.length - index}</Text>
        </View>
        <View style={styles.programInfo}>
          <Text style={styles.programDate}>
            {formatDate(program.program_start_date)} - {formatDate(program.program_end_date)}
          </Text>
          <Text style={styles.programDuration}>{program.program_duration} hari</Text>
        </View>
        <Icon 
          name={selectedProgram?.id === program.id ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#6B7280" 
        />
      </View>

      {selectedProgram?.id === program.id && (
        <View style={styles.programDetails}>
          {/* Goals and Activity Level */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="target" size={16} color="#8B5CF6" />
              <Text style={styles.detailLabel}>Tujuan</Text>
              <Text style={styles.detailValue}>{getFitnessGoalLabel(program.fitness_goal)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="run" size={16} color="#10B981" />
              <Text style={styles.detailLabel}>Aktivitas</Text>
              <Text style={styles.detailValue}>{getActivityLevelLabel(program.activity_level)}</Text>
            </View>
          </View>

          {/* Completion Rate */}
          <View style={styles.completionSection}>
            <Text style={styles.completionLabel}>Tingkat Penyelesaian</Text>
            <View style={styles.completionBar}>
              <View 
                style={[
                  styles.completionProgress, 
                  { 
                    width: `${program.completion_rate && typeof program.completion_rate === 'number' ? Math.min(program.completion_rate, 100) : 0}%`,
                    backgroundColor: getCompletionRateColor(program.completion_rate)
                  }
                ]} 
              />
            </View>
            <Text style={[styles.completionRate, { color: getCompletionRateColor(program.completion_rate) }]}>
              {program.completion_rate && typeof program.completion_rate === 'number' ? Math.round(program.completion_rate) : 0}%
            </Text>
          </View>

          {/* Statistics Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="dumbbell" size={20} color="#3B82F6" />
              <Text style={styles.statValue}>{program.total_activities}</Text>
              <Text style={styles.statLabel}>Aktivitas</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trophy" size={20} color="#F59E0B" />
              <Text style={styles.statValue}>{program.completed_missions}</Text>
              <Text style={styles.statLabel}>Misi Selesai</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color="#8B5CF6" />
              <Text style={styles.statValue}>{program.total_points}</Text>
              <Text style={styles.statLabel}>Poin</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="heart-pulse" size={20} color="#EF4444" />
              <Text style={styles.statValue}>{program.wellness_score && typeof program.wellness_score === 'number' ? Math.round(program.wellness_score) : 0}</Text>
              <Text style={styles.statLabel}>Skor</Text>
            </View>
          </View>

          {/* Health Metrics */}
          <View style={styles.healthMetrics}>
            <Text style={styles.metricsTitle}>Metrik Kesehatan</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Icon name="water" size={16} color="#06B6D4" />
                <Text style={styles.metricLabel}>Air Minum</Text>
                <Text style={styles.metricValue}>
                  {program.avg_water_intake && typeof program.avg_water_intake === 'number' ? (program.avg_water_intake / 1000).toFixed(1) : '0.0'}L/hari
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="sleep" size={16} color="#8B5CF6" />
                <Text style={styles.metricLabel}>Tidur</Text>
                <Text style={styles.metricValue}>
                  {program.avg_sleep_hours && typeof program.avg_sleep_hours === 'number' ? program.avg_sleep_hours.toFixed(1) : '0.0'} jam
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="emoticon" size={16} color="#F59E0B" />
                <Text style={styles.metricLabel}>Mood</Text>
                <Text style={styles.metricValue}>
                  {program.avg_mood_score && typeof program.avg_mood_score === 'number' ? program.avg_mood_score.toFixed(1) : '0.0'}/10
                </Text>
              </View>
            </View>
          </View>

          {/* Download Report Button */}
          <TouchableOpacity
            style={styles.downloadReportButton}
            onPress={() => handleDownloadReport(program)}
          >
            <Icon name="download" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download Laporan</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Memuat riwayat program...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => safeGoBack(navigation, 'Profile')}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Riwayat Program Wellness</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Picker */}
          <SimpleDatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            title="Pilih Tanggal Program"
            variant="light"
          />

          {filteredHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="history" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                {programHistory.length === 0 ? 'Belum Ada Riwayat Program' : 'Tidak Ada Program untuk Tanggal Ini'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {programHistory.length === 0 
                  ? 'Riwayat program wellness akan muncul setelah program selesai'
                  : 'Tidak ada program wellness yang aktif pada tanggal yang dipilih'
                }
              </Text>
            </View>
          ) : (
            <View style={styles.historyContainer}>
              <Text style={styles.sectionTitle}>
                {filteredHistory.length} Program Selesai
              </Text>
              {filteredHistory.map((program, index) => renderProgramCard(program, index))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadReportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  historyContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  programCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  programNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  programNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  programInfo: {
    flex: 1,
  },
  programDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  programDuration: {
    fontSize: 14,
    color: "#6B7280",
  },
  programDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  completionSection: {
    marginBottom: 20,
  },
  completionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  completionBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  completionProgress: {
    height: "100%",
    borderRadius: 4,
  },
  completionRate: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  healthMetrics: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
});

export default WellnessHistoryScreen;
