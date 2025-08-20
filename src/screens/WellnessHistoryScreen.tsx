import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";

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
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<WellnessProgramHistory | null>(null);

  useEffect(() => {
    fetchWellnessHistory();
  }, []);

  const fetchWellnessHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.checkWellnessProgramStatus();
      
      if (response.success && response.data?.program_history) {
        setProgramHistory(response.data.program_history);
      }
    } catch (error) {
      console.error("Error fetching wellness history:", error);
    } finally {
      setLoading(false);
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
    if (rate >= 80) return '#10B981';
    if (rate >= 60) return '#F59E0B';
    if (rate >= 40) return '#EF4444';
    return '#6B7280';
  };

  const renderProgramCard = (program: WellnessProgramHistory, index: number) => (
    <TouchableOpacity
      key={program.id}
      style={styles.programCard}
      onPress={() => setSelectedProgram(selectedProgram?.id === program.id ? null : program)}
    >
      <View style={styles.programHeader}>
        <View style={styles.programNumber}>
          <Text style={styles.programNumberText}>#{programHistory.length - index}</Text>
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
                    width: `${Math.min(program.completion_rate, 100)}%`,
                    backgroundColor: getCompletionRateColor(program.completion_rate)
                  }
                ]} 
              />
            </View>
            <Text style={[styles.completionRate, { color: getCompletionRateColor(program.completion_rate) }]}>
              {Math.round(program.completion_rate)}%
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
              <Text style={styles.statValue}>{Math.round(program.wellness_score)}</Text>
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
                <Text style={styles.metricValue}>{Math.round(program.avg_water_intake)}ml/hari</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="sleep" size={16} color="#8B5CF6" />
                <Text style={styles.metricLabel}>Tidur</Text>
                <Text style={styles.metricValue}>{program.avg_sleep_hours.toFixed(1)} jam</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="emoticon" size={16} color="#F59E0B" />
                <Text style={styles.metricLabel}>Mood</Text>
                <Text style={styles.metricValue}>{program.avg_mood_score.toFixed(1)}/10</Text>
              </View>
            </View>
          </View>
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
          {programHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="history" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Belum Ada Riwayat Program</Text>
              <Text style={styles.emptySubtitle}>
                Riwayat program wellness akan muncul setelah program selesai
              </Text>
            </View>
          ) : (
            <View style={styles.historyContainer}>
              <Text style={styles.sectionTitle}>
                {programHistory.length} Program Selesai
              </Text>
              {programHistory.map((program, index) => renderProgramCard(program, index))}
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
