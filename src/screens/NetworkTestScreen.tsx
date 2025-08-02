import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, useTheme, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomTheme } from '../theme/theme';
import NetworkDiagnostic from '../utils/networkDiagnostic';
import apiService from '../services/api';

const NetworkTestScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runNetworkDiagnostic = async () => {
    setIsLoading(true);
    try {
      const results = await NetworkDiagnostic.diagnoseConnection();
      setDiagnosticResults(results);
    } catch (error) {
      Alert.alert('Diagnostic Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testRegistration = async () => {
    setIsLoading(true);
    try {
      
      // Initialize API service
      await apiService.initialize();
      
      const testData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        phone: '081234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      };

      const result = await apiService.register(testData);
      setTestResults(prev => [...prev, {
        type: 'registration',
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      }]);
      
      Alert.alert('Success', 'Registration test completed successfully!');
    } catch (error) {
      console.error('❌ Registration test failed:', error);
      setTestResults(prev => [...prev, {
        type: 'registration',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
      
      Alert.alert('Test Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      
      // Initialize API service
      await apiService.initialize();
      
      const result = await apiService.login('test@example.com', 'password123');
      setTestResults(prev => [...prev, {
        type: 'login',
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      }]);
      
      Alert.alert('Success', 'Login test completed successfully!');
    } catch (error) {
      console.error('❌ Login test failed:', error);
      setTestResults(prev => [...prev, {
        type: 'login',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
      
      Alert.alert('Test Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setDiagnosticResults(null);
    setTestResults([]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Network Test
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
            Debug network connectivity issues
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={runNetworkDiagnostic}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Run Network Diagnostic
          </Button>

          <Button
            mode="outlined"
            onPress={testRegistration}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Test Registration
          </Button>

          <Button
            mode="outlined"
            onPress={testLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Test Login
          </Button>

          <Button
            mode="text"
            onPress={clearResults}
            style={styles.button}
          >
            Clear Results
          </Button>
        </View>

        {diagnosticResults && (
          <Card style={styles.card}>
            <Card.Title title="Diagnostic Results" />
            <Card.Content>
              <Text variant="bodyMedium">
                Status: {diagnosticResults.status}
              </Text>
              {diagnosticResults.message && (
                <Text variant="bodyMedium">
                  Message: {diagnosticResults.message}
                </Text>
              )}
              {diagnosticResults.bestEndpoint && (
                <Text variant="bodyMedium">
                  Best Endpoint: {diagnosticResults.bestEndpoint}
                </Text>
              )}
              {diagnosticResults.workingCount && (
                <Text variant="bodyMedium">
                  Working: {diagnosticResults.workingCount}/{diagnosticResults.totalCount}
                </Text>
              )}
              {diagnosticResults.recommendations && (
                <View style={styles.recommendations}>
                  <Text variant="bodyMedium" style={styles.recommendationsTitle}>
                    Recommendations:
                  </Text>
                  {diagnosticResults.recommendations.map((rec, index) => (
                    <Text key={index} variant="bodySmall" style={styles.recommendation}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {testResults.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Test Results" />
            <Card.Content>
              {testResults.map((result, index) => (
                <View key={index} style={styles.testResult}>
                  <Text variant="bodyMedium" style={[
                    styles.testType,
                    { color: result.success ? theme.colors.primary : theme.colors.error }
                  ]}>
                    {result.type.toUpperCase()} - {result.success ? 'SUCCESS' : 'FAILED'}
                  </Text>
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </Text>
                  {!result.success && result.error && (
                    <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
                      Error: {result.error}
                    </Text>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <View style={styles.infoContainer}>
          <Text variant="bodyMedium" style={[styles.infoTitle, { color: theme.colors.primary }]}>
            Troubleshooting Tips:
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            • Make sure the server is running on port 3000
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            • Check if your device and computer are on the same network
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            • Try using the computer's IP address instead of localhost
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            • Check firewall settings on your computer
          </Text>
        </View>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
  },
  recommendations: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendation: {
    marginBottom: 4,
  },
  testResult: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  testType: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    color: '#666',
    marginBottom: 4,
  },
  error: {
    fontStyle: 'italic',
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    marginBottom: 8,
  },
});

export default NetworkTestScreen; 