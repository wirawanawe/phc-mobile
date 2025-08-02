import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { debugAuthData, forceReLogin, clearAllStorage } from '../utils/clearStorage';

const DebugScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [authData, setAuthData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      setLoading(true);
      const data = await debugAuthData();
      setAuthData(data);
    } catch (error) {
      setError('Failed to load auth data');
    } finally {
      setLoading(false);
    }
  };

  const handleForceReLogin = async () => {
    Alert.alert(
      'Force Re-Login',
      'This will clear all authentication data and force you to login again. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Clear Data',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await forceReLogin();
              await logout();
              Alert.alert('Success', 'Authentication data cleared. Please login again.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear authentication data.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAllStorage = async () => {
    Alert.alert(
      'Clear All Data',
      'This will clear ALL stored data including settings, preferences, and authentication. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Clear Everything',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await clearAllStorage();
              await logout();
              Alert.alert('Success', 'All data cleared. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear all data.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>🔧 Debug Information</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Current User</Text>
          <Text style={styles.text}>
            {user ? `Logged in as: ${user.name} (${user.email})` : 'No user logged in'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Authentication Data</Text>
          {authData ? (
            <View>
              <Text style={styles.text}>
                Auth Token: {authData.hasAuthToken ? '✅ Present' : '❌ Missing'}
              </Text>
              <Text style={styles.text}>
                Refresh Token: {authData.hasRefreshToken ? '✅ Present' : '❌ Missing'}
              </Text>
              <Text style={styles.text}>
                User Data: {authData.hasUserData ? '✅ Present' : '❌ Missing'}
              </Text>
              {authData.authToken && (
                <Text style={styles.text}>Token Preview: {authData.authToken}</Text>
              )}
              {authData.refreshToken && (
                <Text style={styles.text}>Refresh Token Preview: {authData.refreshToken}</Text>
              )}
            </View>
          ) : (
            <Text style={styles.text}>Loading auth data...</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Actions</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={loadAuthData}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔄 Refresh Debug Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={handleForceReLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔐 Force Re-Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearAllStorage}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🗑️ Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Information</Text>
          <Text style={styles.infoText}>
            • Use "Force Re-Login" if you're experiencing authentication issues
          </Text>
          <Text style={styles.infoText}>
            • Use "Clear All Data" as a last resort to reset the app completely
          </Text>
          <Text style={styles.infoText}>
            • This screen is for debugging purposes only
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DebugScreen; 