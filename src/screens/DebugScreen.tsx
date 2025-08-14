import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomTheme } from '../theme/theme';
import authFix from '../utils/authFix';
import { useAuth } from '../contexts/AuthContext';

const DebugScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);

  useEffect(() => {
    loadAuthStatus();
  }, []);

  const loadAuthStatus = async () => {
    setLoading(true);
    try {
      const status = await authFix.debugAuth();
      setAuthStatus(status);
    } catch (error) {
      console.error('Error loading auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAuth = async () => {
    Alert.alert(
      'Clear Authentication Data',
      'This will log you out and clear all stored authentication data. You will need to login again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await authFix.clearAuth();
              await logout();
              Alert.alert('Success', 'Authentication data cleared. Please login again.');
            } catch (error) {
              console.error('Error clearing auth:', error);
              Alert.alert('Error', 'Failed to clear authentication data.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleForceReLogin = async () => {
    setLoading(true);
    try {
      await authFix.forceReLogin();
      await logout();
    } catch (error) {
      console.error('Error forcing re-login:', error);
      Alert.alert('Error', 'Failed to reset authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAndFix = async () => {
    setLoading(true);
    try {
      const result = await authFix.checkAndFix();
      if (result) {
        Alert.alert('Success', 'Authentication issues checked and fixed.');
        await loadAuthStatus();
      } else {
        Alert.alert('Error', 'Failed to check and fix authentication issues.');
      }
    } catch (error) {
      console.error('Error checking and fixing auth:', error);
      Alert.alert('Error', 'Failed to check authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Debug Tools
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
            Authentication and debugging utilities
          </Text>
        </View>

        {/* Authentication Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Authentication Status
            </Text>
            {loading ? (
              <ActivityIndicator size="small" style={styles.loader} />
            ) : authStatus ? (
              <View style={styles.statusContainer}>
                <View style={styles.statusRow}>
                  <Text>Auth Token:</Text>
                  <Text style={authStatus.hasAuthToken ? styles.statusOk : styles.statusError}>
                    {authStatus.hasAuthToken ? 'Present' : 'Missing'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text>Refresh Token:</Text>
                  <Text style={authStatus.hasRefreshToken ? styles.statusOk : styles.statusError}>
                    {authStatus.hasRefreshToken ? 'Present' : 'Missing'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text>User Data:</Text>
                  <Text style={authStatus.hasUserData ? styles.statusOk : styles.statusError}>
                    {authStatus.hasUserData ? 'Present' : 'Missing'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text>User ID:</Text>
                  <Text style={authStatus.hasUserId ? styles.statusOk : styles.statusError}>
                    {authStatus.hasUserId ? 'Present' : 'Missing'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text>Failed to load status</Text>
            )}
          </Card.Content>
        </Card>

        {/* Current User Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Current User
            </Text>
            {user ? (
              <View style={styles.userInfo}>
                <Text>Name: {user.name}</Text>
                <Text>Email: {user.email}</Text>
                <Text>ID: {user.id}</Text>
                <Text>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
              </View>
            ) : (
              <Text>No user logged in</Text>
            )}
          </Card.Content>
        </Card>

        {/* Debug Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Debug Actions
            </Text>
            
            <Button
              mode="contained"
              onPress={loadAuthStatus}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Refresh Auth Status
            </Button>

            <Button
              mode="contained"
              onPress={handleCheckAndFix}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Check & Fix Auth Issues
            </Button>

            <Button
              mode="outlined"
              onPress={handleClearAuth}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Clear Auth Data
            </Button>

            <Button
              mode="outlined"
              onPress={handleForceReLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Force Re-Login
            </Button>
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Instructions
            </Text>
            <Text style={styles.instructions}>
              1. If you're seeing "Authentication failed" errors, try "Check & Fix Auth Issues" first{'\n'}
              2. If that doesn't work, use "Clear Auth Data" to reset your session{'\n'}
              3. You'll need to login again after clearing auth data{'\n'}
              4. Use "Refresh Auth Status" to see current authentication state
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  statusContainer: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusOk: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  statusError: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  userInfo: {
    gap: 4,
  },
  button: {
    marginVertical: 8,
  },
  instructions: {
    lineHeight: 20,
  },
});

export default DebugScreen;

