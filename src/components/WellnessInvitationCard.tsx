import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface WellnessInvitationCardProps {
  onJoinPress?: () => void;
}

const WellnessInvitationCard: React.FC<WellnessInvitationCardProps> = ({ onJoinPress }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Program Wellness</Text>
            <Text style={styles.subtitle}>Mulai perjalanan kesehatan Anda</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.iconContainer}>
              <Icon name="heart-pulse" size={24} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color="#FFFFFF" />
              <Text style={styles.benefitText}>Mission & Challenge Harian</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color="#FFFFFF" />
              <Text style={styles.benefitText}>Tracking Makanan & Air</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color="#FFFFFF" />
              <Text style={styles.benefitText}>Monitor Aktivitas Fisik</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color="#FFFFFF" />
              <Text style={styles.benefitText}>Analisis Kesehatan Lengkap</Text>
            </View>
          </View>

          {/* Join Button */}
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={onJoinPress}
            activeOpacity={0.8}
          >
            <View style={styles.joinButtonContent}>
              <Text style={styles.joinButtonText}>Bergabung Sekarang</Text>
              <Icon name="arrow-right" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 200,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  headerRight: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    marginLeft: 8,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  joinButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
    letterSpacing: 0.5,
  },
});

export default WellnessInvitationCard;
