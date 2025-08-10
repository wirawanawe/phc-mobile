import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Text, useTheme, Card, Chip, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

interface MedicalVisit {
  id: string;
  date: string;
  clinicName: string;
  doctorName: string;
  visitType: string;
  diagnosis: string;
  treatment: string;
  prescription: string[];
  notes: string;
  status: "completed" | "scheduled" | "cancelled";
  cost: number;
  paymentStatus: "paid" | "pending" | "unpaid";
}

const MedicalHistoryScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user } = useAuth();
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<MedicalVisit | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockVisits: MedicalVisit[] = [
        {
          id: "1",
          date: "2024-03-15",
          clinicName: "Klinik Sehat Jaya",
          doctorName: "Dr. Sarah Johnson",
          visitType: "Konsultasi Umum",
          diagnosis: "Hipertensi ringan",
          treatment: "Pemantauan tekanan darah dan perubahan gaya hidup",
          prescription: ["Amlodipine 5mg", "Lifestyle modification"],
          notes: "Pasien disarankan untuk mengurangi konsumsi garam dan olahraga teratur",
          status: "completed",
          cost: 150000,
          paymentStatus: "paid",
        },
        {
          id: "2",
          date: "2024-02-28",
          clinicName: "Puskesmas Kota",
          doctorName: "Dr. Ahmad Rahman",
          visitType: "Pemeriksaan Rutin",
          diagnosis: "Kolesterol tinggi",
          treatment: "Diet rendah lemak dan olahraga",
          prescription: ["Simvastatin 20mg", "Omega-3 supplement"],
          notes: "Kontrol dalam 3 bulan untuk evaluasi",
          status: "completed",
          cost: 120000,
          paymentStatus: "paid",
        },
        {
          id: "3",
          date: "2024-04-10",
          clinicName: "Klinik Gigi Sejahtera",
          doctorName: "Dr. Maria Santos",
          visitType: "Pemeriksaan Gigi",
          diagnosis: "Karies gigi",
          treatment: "Penambalan gigi dan pembersihan karang",
          prescription: ["Antibiotik (jika diperlukan)", "Pasta gigi khusus"],
          notes: "Kontrol 6 bulan untuk pembersihan rutin",
          status: "scheduled",
          cost: 200000,
          paymentStatus: "pending",
        },
        {
          id: "4",
          date: "2024-01-20",
          clinicName: "Rumah Sakit Umum",
          doctorName: "Dr. Budi Santoso",
          visitType: "Pemeriksaan Darah",
          diagnosis: "Anemia ringan",
          treatment: "Suplemen zat besi",
          prescription: ["Ferrous sulfate 200mg", "Vitamin C"],
          notes: "Kontrol dalam 1 bulan untuk evaluasi Hb",
          status: "completed",
          cost: 180000,
          paymentStatus: "paid",
        },
      ];
      setVisits(mockVisits);
    } catch (error) {
      console.error("Error loading medical history:", error);
      Alert.alert("Error", "Gagal memuat riwayat medis");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "scheduled":
        return "#3B82F6";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "scheduled":
        return "Terjadwal";
      case "cancelled":
        return "Dibatalkan";
      default:
        return "Tidak diketahui";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "unpaid":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Lunas";
      case "pending":
        return "Menunggu";
      case "unpaid":
        return "Belum Bayar";
      default:
        return "Tidak diketahui";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const renderVisitCard = ({ item }: { item: MedicalVisit }) => (
    <Card style={styles.visitCard}>
      <Card.Content>
        <View style={styles.visitHeader}>
          <View style={styles.visitInfo}>
            <Text style={styles.visitDate}>{formatDate(item.date)}</Text>
            <Text style={styles.clinicName}>{item.clinicName}</Text>
            <Text style={styles.doctorName}>{item.doctorName}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(item.status) }}
              style={[
                styles.statusChip,
                { borderColor: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Chip>
          </View>
        </View>

        <View style={styles.visitDetails}>
          <View style={styles.detailRow}>
            <Icon name="stethoscope" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.visitType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="medical-bag" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.diagnosis}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="currency-usd" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{formatCurrency(item.cost)}</Text>
          </View>
        </View>

        <View style={styles.paymentStatus}>
          <Chip
            mode="outlined"
            textStyle={{ color: getPaymentStatusColor(item.paymentStatus) }}
            style={[
              styles.paymentChip,
              { borderColor: getPaymentStatusColor(item.paymentStatus) },
            ]}
          >
            {getPaymentStatusText(item.paymentStatus)}
          </Chip>
        </View>

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => {
            setSelectedVisit(item);
            setShowDetail(true);
          }}
        >
          <Text style={styles.detailButtonText}>Lihat Detail</Text>
          <Icon name="chevron-right" size={20} color="#10B981" />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  const renderVisitDetail = () => {
    if (!selectedVisit) return null;

    return (
      <View style={styles.detailModal}>
        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>Detail Kunjungan</Text>
            <TouchableOpacity
              onPress={() => setShowDetail(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailScroll}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Informasi Kunjungan</Text>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tanggal</Text>
                <Text style={styles.detailValue}>{formatDate(selectedVisit.date)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Klinik</Text>
                <Text style={styles.detailValue}>{selectedVisit.clinicName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Dokter</Text>
                <Text style={styles.detailValue}>{selectedVisit.doctorName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Jenis Kunjungan</Text>
                <Text style={styles.detailValue}>{selectedVisit.visitType}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Diagnosis & Pengobatan</Text>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Diagnosis</Text>
                <Text style={styles.detailValue}>{selectedVisit.diagnosis}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Pengobatan</Text>
                <Text style={styles.detailValue}>{selectedVisit.treatment}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Resep Obat</Text>
              {selectedVisit.prescription.map((med, index) => (
                <View key={index} style={styles.prescriptionItem}>
                  <Icon name="pill" size={16} color="#10B981" />
                  <Text style={styles.prescriptionText}>{med}</Text>
                </View>
              ))}
            </View>

            {selectedVisit.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Catatan Dokter</Text>
                <Text style={styles.notesText}>{selectedVisit.notes}</Text>
              </View>
            )}

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Informasi Pembayaran</Text>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Biaya</Text>
                <Text style={styles.detailValue}>{formatCurrency(selectedVisit.cost)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status Pembayaran</Text>
                <Chip
                  mode="outlined"
                  textStyle={{ color: getPaymentStatusColor(selectedVisit.paymentStatus) }}
                  style={[
                    styles.paymentChip,
                    { borderColor: getPaymentStatusColor(selectedVisit.paymentStatus) },
                  ]}
                >
                  {getPaymentStatusText(selectedVisit.paymentStatus)}
                </Chip>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Medis</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Summary Card */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.summaryCard}
      >
        <View style={styles.summaryContent}>
          <View style={styles.summaryIcon}>
            <Icon name="medical-bag" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Riwayat Kunjungan</Text>
            <Text style={styles.summarySubtitle}>
              {visits.length} kunjungan • {visits.filter(v => v.status === "completed").length} selesai
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Visits List */}
      <View style={styles.visitsSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Memuat riwayat medis...</Text>
          </View>
        ) : visits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="medical-bag" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
            <Text style={styles.emptySubtitle}>
              Riwayat kunjungan medis Anda akan muncul di sini
            </Text>
          </View>
        ) : (
          <FlatList
            data={visits}
            renderItem={renderVisitCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.visitsList}
          />
        )}
      </View>

      {/* Detail Modal */}
      {showDetail && renderVisitDetail()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  headerRight: {
    width: 40,
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
  visitsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  visitsList: {
    paddingBottom: 20,
  },
  visitCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  visitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  visitInfo: {
    flex: 1,
  },
  visitDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  doctorName: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusContainer: {
    marginLeft: 12,
  },
  statusChip: {
    height: 24,
  },
  visitDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  paymentStatus: {
    marginBottom: 12,
  },
  paymentChip: {
    height: 24,
    alignSelf: "flex-start",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
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
  detailModal: {
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
  detailContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 20,
    width: "90%",
    maxHeight: "80%",
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  detailScroll: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 2,
    textAlign: "right",
  },
  prescriptionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  prescriptionText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});

export default MedicalHistoryScreen;
