import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { CustomTheme } from '../theme/theme';
import NetworkDiagnostic, { NetworkDiagnosticResult } from '../utils/networkDiagnostic';
import apiService from '../services/api';

const NetworkDiagnosticScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [diagnosticResult, setDiagnosticResult] = useState<NetworkDiagnosticResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');

  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      // Get current API base URL
      await apiService.initialize();
      setApiBaseUrl(apiService.baseURL || 'Not initialized');
      
      // Run network diagnostic
      const result = await NetworkDiagnostic.diagnoseConnection();
      setDiagnosticResult(result);
      
      console.log('Network Diagnostic Result:', result);
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setDiagnosticResult({
        isConnected: false,
        serverReachable: false,
        responseTime: 0,
        error: error.message,
        recommendedAction: 'Check your network connection and try again'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <Icon name="check-circle" size={24} color={theme.colors.primary} />
    ) : (
      <Icon name="alert-circle" size={24} color={theme.colors.error} />
    );
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? theme.colors.primary : theme.colors.error;
  };

  const handleRetry = () => {
    runDiagnostic();
  };

  const handleReinitialize = async () => {
    try {
      await apiService.reinitialize();
      runDiagnostic();
    } catch (error) {
      Alert.alert('Error', 'Failed to reinitialize API service');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Network Diagnostic
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Check your connection to the server
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Current Configuration
              </Text>
              <Text variant="bodyMedium" style={styles.configText}>
                API Base URL: {apiBaseUrl}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {isRunning ? (
          <Card style={styles.card}>
            <Card.Content style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Running diagnostic...
              </Text>
            </Card.Content>
          </Card>
        ) : diagnosticResult ? (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Connection Status
                </Text>
                
                <View style={styles.statusRow}>
                  <View style={styles.statusItem}>
                    {getStatusIcon(diagnosticResult.isConnected)}
                    <Text variant="bodyMedium" style={styles.statusText}>
                      Network Connected
                    </Text>
                  </View>
                  
                  <View style={styles.statusItem}>
                    {getStatusIcon(diagnosticResult.serverReachable)}
                    <Text variant="bodyMedium" style={styles.statusText}>
                      Server Reachable
                    </Text>
                  </View>
                </View>

                {diagnosticResult.responseTime > 0 && (
                  <Text variant="bodyMedium" style={styles.responseTime}>
                    Response Time: {diagnosticResult.responseTime}ms
                  </Text>
                )}

                {diagnosticResult.error && (
                  <View style={styles.errorSection}>
                    <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.error }]}>
                      Error: {diagnosticResult.error}
                    </Text>
                  </View>
                )}

                {diagnosticResult.recommendedAction && (
                  <View style={styles.recommendationSection}>
                    <Text variant="bodyMedium" style={styles.recommendationText}>
                      {diagnosticResult.recommendedAction}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleRetry}
            disabled={isRunning}
            style={styles.button}
            icon="refresh"
          >
            Run Diagnostic
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleReinitialize}
            disabled={isRunning}
            style={styles.button}
            icon="reload"
          >
            Reinitialize API
          </Button>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Troubleshooting Tips
            </Text>
            <View style={styles.tipsContainer}>
              <Text variant="bodyMedium" style={styles.tipText}>
                • Ensure your device is connected to the internet
              </Text>
              <Text variant="bodyMedium" style={styles.tipText}>
                • Check if the server is running on port 3000
              </Text>
              <Text variant="bodyMedium" style={styles.tipText}>
                • For physical devices, ensure they're on the same network as the server
              </Text>
              <Text variant="bodyMedium" style={styles.tipText}>
                • Try restarting the server if connection issues persist
              </Text>
            </View>
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
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  configText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginTop: 8,
    textAlign: 'center',
  },
  responseTime: {
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  errorSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorText: {
    fontWeight: 'bold',
  },
  recommendationSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  recommendationText: {
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  tipsContainer: {
    marginTop: 8,
  },
  tipText: {
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default NetworkDiagnosticScreen;
