import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  theme?: any;
  title?: string;
  variant?: 'dark' | 'light';
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  theme,
  title = "Pilih Durasi Program",
  variant = 'dark',
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(endDate);

  // Sync temp dates with selected dates when they change
  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStartDateChange = (event: any, date?: Date) => {
    if (date) {
      setTempStartDate(date);
      
      // For Android, apply the date immediately
      if (Platform.OS === 'android') {
        const newEndDate = new Date(date);
        newEndDate.setDate(date.getDate() + 30); // Default 30 days
        onDateRangeChange(date, newEndDate);
        setShowStartPicker(false);
      }
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    if (date) {
      setTempEndDate(date);
      
      // For Android, apply the date immediately
      if (Platform.OS === 'android') {
        onDateRangeChange(tempStartDate, date);
        setShowEndPicker(false);
      }
    }
  };

  const confirmDateRange = () => {
    onDateRangeChange(tempStartDate, tempEndDate);
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  const cancelDateRange = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  const openStartDatePicker = () => {
    setTempStartDate(startDate);
    setShowStartPicker(true);
  };

  const openEndDatePicker = () => {
    setTempEndDate(endDate);
    setShowEndPicker(true);
  };

  // Get styles based on variant
  const getButtonStyle = () => {
    if (variant === 'light') {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
      };
    }
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    };
  };

  const getTextStyle = () => {
    if (variant === 'light') {
      return { color: '#1F2937' };
    }
    return { color: '#FFFFFF' };
  };

  const getIconStyle = () => {
    if (variant === 'light') {
      return { color: '#1F2937' };
    }
    return { color: '#FFFFFF' };
  };

  const duration = calculateDuration(tempStartDate, tempEndDate);

  // For Android, use native picker
  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <View style={styles.dateRangeContainer}>
          <TouchableOpacity
            style={[styles.dateSelectorButton, getButtonStyle()]}
            onPress={openStartDatePicker}
          >
            <Icon name="calendar-start" size={20} style={getIconStyle()} />
            <Text style={[styles.dateSelectorText, getTextStyle()]}>
              Mulai: {formatDate(tempStartDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateSelectorButton, getButtonStyle()]}
            onPress={openEndDatePicker}
          >
            <Icon name="calendar-end" size={20} style={getIconStyle()} />
            <Text style={[styles.dateSelectorText, getTextStyle()]}>
              Selesai: {formatDate(tempEndDate)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.durationInfo}>
          <Icon name="clock-outline" size={16} style={getIconStyle()} />
          <Text style={[styles.durationText, getTextStyle()]}>
            Durasi: {duration} hari
          </Text>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={tempStartDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            minimumDate={new Date()}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={tempEndDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            minimumDate={tempStartDate}
          />
        )}
      </View>
    );
  }

  // For iOS, use modal
  return (
    <View style={styles.container}>
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity
          style={[styles.dateSelectorButton, getButtonStyle()]}
          onPress={openStartDatePicker}
        >
          <Icon name="calendar-start" size={20} style={getIconStyle()} />
          <Text style={[styles.dateSelectorText, getTextStyle()]}>
            Mulai: {formatDate(tempStartDate)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dateSelectorButton, getButtonStyle()]}
          onPress={openEndDatePicker}
        >
          <Icon name="calendar-end" size={20} style={getIconStyle()} />
          <Text style={[styles.dateSelectorText, getTextStyle()]}>
            Selesai: {formatDate(tempEndDate)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.durationInfo}>
        <Icon name="clock-outline" size={16} style={getIconStyle()} />
        <Text style={[styles.durationText, getTextStyle()]}>
          Durasi: {duration} hari
        </Text>
      </View>

      {(showStartPicker || showEndPicker) && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showStartPicker || showEndPicker}
          onRequestClose={cancelDateRange}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {showStartPicker ? 'Pilih Tanggal Mulai' : 'Pilih Tanggal Selesai'}
                </Text>
              </View>
              <DateTimePicker
                value={showStartPicker ? tempStartDate : tempEndDate}
                mode="date"
                display="spinner"
                onChange={showStartPicker ? handleStartDateChange : handleEndDateChange}
                minimumDate={showStartPicker ? new Date() : tempStartDate}
                style={styles.datePicker}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={cancelDateRange}>
                  <Text style={styles.modalButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={confirmDateRange}>
                  <Text style={styles.modalButtonTextPrimary}>Konfirmasi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  dateRangeContainer: {
    gap: 8,
  },
  dateSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  dateSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    marginLeft: 12,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  datePicker: {
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default DateRangePicker;
