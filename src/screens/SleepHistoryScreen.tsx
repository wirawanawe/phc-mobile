import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomTheme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import SimpleDatePicker from '../components/SimpleDatePicker';
import { handleError } from '../utils/alertUtils';

interface SleepEntry {
  id: number;
  user_id: number;
  sleep_date: string;
  bedtime: string;
  wake_time: string;
  sleep_hours?: number;
  sleep_minutes?: number;
  sleep_duration_minutes?: number;
  calculated_total_hours?: number;
  sleep_quality: string;
  sleep_latency_minutes?: number;
  wake_up_count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

const SleepHistoryScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const [sleepHistory, setSleepHistory] = useState<SleepEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SleepEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SleepEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Date filter state
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (isAuthenticated) {
      loadSleepHistory();
    } else {
      console.log('⚠️ SleepHistoryScreen - User not authenticated, not loading data');
      setSleepHistory([]);
      setFilteredHistory([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load data when selected date changes
  useEffect(() => {
    if (isAuthenticated) {
      loadSleepHistory();
    }
  }, [selectedDate, isAuthenticated]);

  const handleDateChange = (date: Date) => {
    console.log('🔍 SleepHistoryScreen - handleDateChange called with date:', date);
    setSelectedDate(date);
  };

  const loadSleepHistory = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated before making API call
      if (!isAuthenticated) {
        console.log('⚠️ SleepHistoryScreen - User not authenticated, redirecting to login');
        navigation.navigate('Login');
        return;
      }
      
      // Convert selected date to string format for API
      const dateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      console.log(`🔍 SleepHistoryScreen - Loading data for date: ${dateString}`);
      
      const response = await apiService.getSleepHistory({ 
        date: dateString,
        limit: 50
      });
      
      console.log('🔍 SleepHistoryScreen - API Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // Handle both response formats: response.data (array) and response.data.sleepData (array)
        let sleepData = null;
        if (Array.isArray(response.data)) {
          // Direct array format
          sleepData = response.data;
        } else if (response.data.sleepData && Array.isArray(response.data.sleepData)) {
          // Nested sleepData format
          sleepData = response.data.sleepData;
        }
        
        if (sleepData && sleepData.length > 0) {
          // Process the data to ensure all fields are properly formatted
          const processedData = sleepData.map((entry: any) => {
            // Calculate sleep duration from bedtime and wake time for accuracy
            const calculatedDuration = calculateSleepDuration(entry.bedtime, entry.wake_time);
            
            return {
              ...entry,
              // Use calculated duration if available, otherwise fall back to database values
              sleep_hours: calculatedDuration.hours || entry.sleep_hours || Math.floor((entry.sleep_duration_minutes || 0) / 60),
              sleep_minutes: calculatedDuration.minutes || entry.sleep_minutes || ((entry.sleep_duration_minutes || 0) % 60),
              sleep_duration_minutes: calculatedDuration.totalHours * 60 || entry.sleep_duration_minutes || ((entry.sleep_hours || 0) * 60 + (entry.sleep_minutes || 0)),
              calculated_total_hours: calculatedDuration.totalHours
            };
          });
          
          console.log('🔍 SleepHistoryScreen - Processed data:', processedData);
          setSleepHistory(processedData);
          setFilteredHistory(processedData); // Since we're loading data for specific date, no need to filter
        } else {
          setSleepHistory([]);
          setFilteredHistory([]);
        }
      } else {
        setSleepHistory([]);
        setFilteredHistory([]);
      }
    } catch (error) {
      console.error('Error loading sleep history:', error);
      handleError(error, {
        title: 'Error Loading History',
        showAlert: false
      });
      setSleepHistory([]);
      setFilteredHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSleepHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return timeString;
  };

  const getQualityColor = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'excellent':
        return '#10B981';
      case 'good':
        return '#34D399';
      case 'fair':
        return '#F59E0B';
      case 'poor':
        return '#EF4444';
      case 'very_poor':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getQualityText = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'excellent':
        return 'Sangat Baik';
      case 'good':
        return 'Baik';
      case 'fair':
        return 'Cukup';
      case 'poor':
        return 'Buruk';
      case 'very_poor':
        return 'Sangat Buruk';
      default:
        return 'Tidak Diketahui';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'excellent':
        return 'star';
      case 'good':
        return 'star-half';
      case 'fair':
        return 'star-outline';
      case 'poor':
        return 'star-off';
      case 'very_poor':
        return 'star-off';
      default:
        return 'help-circle';
    }
  };

  const calculateSleepDuration = (bedtime: string, wakeTime: string) => {
    if (!bedtime || !wakeTime) return { hours: 0, minutes: 0, totalHours: 0 };
    
    try {
      const [bedHour, bedMinute] = bedtime.split(':').map(Number);
      const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
      
      let totalMinutes = (wakeHour * 60 + wakeMinute) - (bedHour * 60 + bedMinute);
      
      // If wake time is earlier than bedtime, it means sleep crossed midnight
      if (totalMinutes <= 0) {
        totalMinutes += 24 * 60; // Add 24 hours
      }
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const totalHours = hours + (minutes / 60);
      
      return { hours, minutes, totalHours };
    } catch (error) {
      console.error('Error calculating sleep duration:', error);
      return { hours: 0, minutes: 0, totalHours: 0 };
    }
  };

  const formatDuration = (hours: number | undefined | null, minutes: number | undefined | null) => {
    const safeHours = typeof hours === 'number' ? hours : 0;
    const safeMinutes = typeof minutes === 'number' ? minutes : 0;
    const totalHours = safeHours + (safeMinutes / 60);
    return `${totalHours.toFixed(1)} jam`;
  };

  const handleEntryPress = (entry: SleepEntry) => {
    setSelectedEntry(entry);
    setShowDetails(true);
  };

  const renderSleepEntry = ({ item }: { item: SleepEntry }) => (
    <TouchableOpacity
      style={styles.sleepEntryCard}
      onPress={() => handleEntryPress(item)}
    >
      <View style={styles.sleepEntryHeader}>
        <View style={styles.sleepEntryDate}>
          <Icon name="calendar" size={16} color="#6B7280" />
          <Text style={styles.sleepEntryDateText}>
            {formatDate(item.sleep_date)}
          </Text>
        </View>
        <View style={[
          styles.sleepQualityBadge,
          { backgroundColor: getQualityColor(item.sleep_quality) + '20' }
        ]}>
          <Icon 
            name={getQualityIcon(item.sleep_quality)} 
            size={14} 
            color={getQualityColor(item.sleep_quality)} 
          />
          <Text style={[
            styles.sleepQualityText,
            { color: getQualityColor(item.sleep_quality) }
          ]}>
            {getQualityText(item.sleep_quality)}
          </Text>
        </View>
      </View>

      <View style={styles.sleepEntryDetails}>
        <View style={styles.sleepTimeRow}>
          <View style={styles.sleepTimeItem}>
            <Icon name="moon-waning-crescent" size={16} color="#8B5CF6" />
            <Text style={styles.sleepTimeLabel}>Tidur</Text>
            <Text style={styles.sleepTimeValue}>
              {formatTime(item.bedtime)}
            </Text>
          </View>
          <View style={styles.sleepTimeDivider}>
            <Icon name="arrow-right" size={16} color="#6B7280" />
          </View>
          <View style={styles.sleepTimeItem}>
            <Icon name="weather-sunny" size={16} color="#F59E0B" />
            <Text style={styles.sleepTimeLabel}>Bangun</Text>
            <Text style={styles.sleepTimeValue}>
              {formatTime(item.wake_time)}
            </Text>
          </View>
        </View>

        <View style={styles.sleepMetricsRow}>
          <View style={styles.sleepMetric}>
            <Icon name="clock-outline" size={16} color="#6B7280" />
            <Text style={styles.sleepMetricLabel}>Durasi</Text>
            <Text style={styles.sleepMetricValue}>
              {item.calculated_total_hours ? `${item.calculated_total_hours.toFixed(1)} jam` : formatDuration(item.sleep_hours || 0, item.sleep_minutes || 0)}
            </Text>
          </View>
          {item.sleep_latency_minutes && (
            <View style={styles.sleepMetric}>
              <Icon name="timer-outline" size={16} color="#6B7280" />
              <Text style={styles.sleepMetricLabel}>Latensi</Text>
              <Text style={styles.sleepMetricValue}>
                {item.sleep_latency_minutes} menit
              </Text>
            </View>
          )}
          {item.wake_up_count !== undefined && (
            <View style={styles.sleepMetric}>
              <Icon name="eye-off-outline" size={16} color="#6B7280" />
              <Text style={styles.sleepMetricLabel}>Bangun</Text>
              <Text style={styles.sleepMetricValue}>
                {item.wake_up_count} kali
              </Text>
            </View>
          )}
        </View>

        {item.notes && (
          <View style={styles.sleepNotes}>
            <Icon name="note-text" size={14} color="#6B7280" />
            <Text style={styles.sleepNotesText} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedEntry) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Tidur</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Tanggal</Text>
              <Text style={styles.detailSectionValue}>
                {formatDate(selectedEntry.sleep_date)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Waktu Tidur</Text>
              <Text style={styles.detailSectionValue}>
                {formatTime(selectedEntry.bedtime)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Waktu Bangun</Text>
              <Text style={styles.detailSectionValue}>
                {formatTime(selectedEntry.wake_time)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Durasi Tidur</Text>
              <Text style={styles.detailSectionValue}>
                {selectedEntry.calculated_total_hours ? 
                  `${Math.floor(selectedEntry.calculated_total_hours)} jam ${Math.round((selectedEntry.calculated_total_hours % 1) * 60)} menit` : 
                  formatDuration(selectedEntry.sleep_hours || 0, selectedEntry.sleep_minutes || 0)
                }
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Kualitas Tidur</Text>
              <View style={styles.qualityDetailRow}>
                <Icon 
                  name={getQualityIcon(selectedEntry.sleep_quality)} 
                  size={20} 
                  color={getQualityColor(selectedEntry.sleep_quality)} 
                />
                <Text style={[
                  styles.qualityDetailText,
                  { color: getQualityColor(selectedEntry.sleep_quality) }
                ]}>
                  {getQualityText(selectedEntry.sleep_quality)}
                </Text>
              </View>
            </View>

            {selectedEntry.sleep_latency_minutes && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Latensi Tidur</Text>
                <Text style={styles.detailSectionValue}>
                  {selectedEntry.sleep_latency_minutes} menit
                </Text>
              </View>
            )}

            {selectedEntry.wake_up_count !== undefined && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Jumlah Bangun</Text>
                <Text style={styles.detailSectionValue}>
                  {selectedEntry.wake_up_count} kali
                </Text>
              </View>
            )}

            {selectedEntry.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Catatan</Text>
                <Text style={styles.detailSectionValue}>
                  {selectedEntry.notes}
                </Text>
              </View>
            )}

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Dibuat</Text>
              <Text style={styles.detailSectionValue}>
                {formatDate(selectedEntry.created_at)}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Memuat riwayat tidur...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Riwayat Tidur</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#8B5CF6"]}
              tintColor="#8B5CF6"
            />
          }
        >
          {/* Date Filter */}
          <View style={styles.dateFilterContainer}>
            <Text style={styles.dateFilterLabel}>Filter berdasarkan Tanggal Tidur:</Text>
            <SimpleDatePicker
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              title="Pilih Tanggal Tidur"
              variant="light"
            />
          </View>

          {/* Sleep History List */}
          <View style={styles.historyContainer}>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((entry) => (
                <View key={entry.id}>
                  {renderSleepEntry({ item: entry })}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="sleep" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Tidak Ada Data</Text>
                <Text style={styles.emptySubtitle}>
                  Tidak ada data tidur untuk tanggal yang dipilih
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Detail Modal */}
        {showDetails && renderDetailModal()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateFilterContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
    marginTop: 16,
  },
  dateFilterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  historyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sleepEntryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sleepEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepEntryDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sleepEntryDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 6,
  },
  sleepQualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sleepQualityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  sleepEntryDetails: {
    gap: 12,
  },
  sleepTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sleepTimeItem: {
    alignItems: 'center',
    flex: 1,
  },
  sleepTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  sleepTimeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  sleepTimeDivider: {
    paddingHorizontal: 16,
  },
  sleepMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sleepMetric: {
    alignItems: 'center',
  },
  sleepMetricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  sleepMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  sleepNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sleepNotesText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  detailSectionValue: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  qualityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityDetailText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SleepHistoryScreen;
