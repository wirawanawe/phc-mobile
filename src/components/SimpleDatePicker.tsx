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

interface SimpleDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  theme?: any;
  title?: string;
  variant?: 'dark' | 'light';
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  selectedDate,
  onDateChange,
  theme,
  title = "Pilih Tanggal",
  variant = 'dark',
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(selectedDate);

  // Sync tempDate with selectedDate when selectedDate changes
  useEffect(() => {
    setTempDate(selectedDate);
  }, [selectedDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, date?: Date) => {

    
    if (date) {
  
      setTempDate(date);
      
      // For Android, apply the date immediately
      if (Platform.OS === 'android') {
    
        onDateChange(date);
        setShowDatePicker(false);
      }
    }
  };

  const confirmDate = () => {

    onDateChange(tempDate);
    setShowDatePicker(false);
  };

  const cancelDate = () => {

    setTempDate(selectedDate);
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setTempDate(selectedDate);
    setShowDatePicker(true);
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

  // For Android, use native picker
  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.dateSelectorButton, getButtonStyle()]}
          onPress={openDatePicker}
        >
          <Icon name="calendar" size={20} style={getIconStyle()} />
          <Text style={[styles.dateSelectorText, getTextStyle()]}>{formatDate(selectedDate)}</Text>
          <Icon name="chevron-down" size={20} style={getIconStyle()} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
    );
  }

  // For iOS, use modal
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.dateSelectorButton, getButtonStyle()]}
        onPress={openDatePicker}
      >
        <Icon name="calendar" size={20} style={getIconStyle()} />
        <Text style={[styles.dateSelectorText, getTextStyle()]}>{formatDate(selectedDate)}</Text>
        <Icon name="chevron-down" size={20} style={getIconStyle()} />
      </TouchableOpacity>

      {showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={cancelDate}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={styles.datePicker}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={cancelDate}>
                  <Text style={styles.modalButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={confirmDate}>
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
    marginHorizontal: 0,
    marginVertical: 0,
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
    textAlign: 'center',
    marginHorizontal: 12,
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

export default SimpleDatePicker;
