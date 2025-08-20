import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface OfflineIndicatorProps {
  isOffline: boolean;
  message?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  isOffline, 
  message = "Tidak ada koneksi internet" 
}) => {
  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <Icon name="wifi-off" size={16} color="#F59E0B" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
  },
  text: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default OfflineIndicator;
