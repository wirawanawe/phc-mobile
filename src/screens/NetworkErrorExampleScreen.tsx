import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { CustomTheme } from '../theme/theme';
import NetworkErrorBanner from '../components/NetworkErrorBanner';
import { useNetworkError } from '../hooks/useNetworkError';
import { NetworkErrorType } from '../utils/networkErrorHandler';
import apiService from '../services/api';

const NetworkErrorExampleScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const { 
    currentError, 
    errorInfo, 
    isNetworkError, 
    isLoading, 
    handleError, 
    clearError,
    retryWithNetworkRetry,
    checkConnection 
  } = useNetworkError();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const simulateNetworkError = (errorType: NetworkErrorType) => {
    let error: any;

    switch (errorType) {
      case NetworkErrorType.NO_INTERNET:
        error = new Error('Network disconnected');
        break;
      case NetworkErrorType.SERVER_UNREACHABLE:
        error = new Error('Network request failed');
        break;
      case NetworkErrorType.TIMEOUT:
        error = new Error('Request timeout');
        break;
      case NetworkErrorType.SERVER_DOWN:
        error = new Error('Server error 503');
        break;
      case NetworkErrorType.DNS_ERROR:
        error = new Error('getaddrinfo ENOTFOUND');
        break;
      case NetworkErrorType.CONNECTION_REFUSED:
        error = new Error('Connection refused');
        break;
      case NetworkErrorType.SSL_ERROR:
        error = new Error('SSL certificate error');
        break;
      default:
        error = new Error('Unknown network error');
    }

    handleError(error, {
      context: `Simulated ${errorType}`,
      onRetry: () => {
        addTestResult(`Retry triggered for ${errorType}`);
        clearError();
      }
    });

    addTestResult(`Simulated ${errorType} error`);
  };

  const testRealApiCall = async () => {
    try {
      addTestResult('Testing real API call...');
      
      await retryWithNetworkRetry(
        () => apiService.request('/test-endpoint'),
        {
          context: 'Real API Test',
          onRetry: () => {
            addTestResult('API call retry triggered');
          },
          onCancel: () => {
            addTestResult('API call cancelled by user');
          }
        }
      );
      
      addTestResult('API call successful');
    } catch (error) {
      addTestResult(`API call failed: ${error.message}`);
    }
  };

  const testConnectionCheck = async () => {
    addTestResult('Checking network connection...');
    const result = await checkConnection();
    
    if (result.isConnected) {
      addTestResult('Network connection OK');
    } else {
      addTestResult(`Network connection failed: ${result.errorType}`);
    }
  };

  const errorExamples = [
    {
      id: 'no-internet',
      title: 'No Internet Connection',
      description: 'Simulasi tidak ada koneksi internet',
      icon: 'wifi-off',
      color: '#F59E0B',
      errorType: NetworkErrorType.NO_INTERNET
    },
    {
      id: 'server-unreachable',
      title: 'Server Unreachable',
      description: 'Simulasi server tidak dapat diakses',
      icon: 'server-off',
      color: '#DC2626',
      errorType: NetworkErrorType.SERVER_UNREACHABLE
    },
    {
      id: 'timeout',
      title: 'Connection Timeout',
      description: 'Simulasi koneksi timeout',
      icon: 'clock-outline',
      color: '#EA580C',
      errorType: NetworkErrorType.TIMEOUT
    },
    {
      id: 'server-down',
      title: 'Server Down',
      description: 'Simulasi server sedang down',
      icon: 'server-off',
      color: '#DC2626',
      errorType: NetworkErrorType.SERVER_DOWN
    },
    {
      id: 'dns-error',
      title: 'DNS Error',
      description: 'Simulasi error DNS',
      icon: 'dns',
      color: '#7C3AED',
      errorType: NetworkErrorType.DNS_ERROR
    },
    {
      id: 'connection-refused',
      title: 'Connection Refused',
      description: 'Simulasi koneksi ditolak server',
      icon: 'connection',
      color: '#DC2626',
      errorType: NetworkErrorType.CONNECTION_REFUSED
    },
    {
      id: 'ssl-error',
      title: 'SSL Error',
      description: 'Simulasi error SSL/TLS',
      icon: 'shield-alert',
      color: '#B45309',
      errorType: NetworkErrorType.SSL_ERROR
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <NetworkErrorBanner
        error={currentError}
        onRetry={() => {
          addTestResult('Banner retry triggered');
          clearError();
        }}
        onDismiss={() => {
          addTestResult('Banner dismissed');
          clearError();
        }}
        showTroubleshooting={true}
        autoHide={false}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Network Error Handling Examples
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Test Actions</Text>
            
            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={testRealApiCall}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
              >
                Test Real API
              </Button>
              
              <Button
                mode="outlined"
                onPress={testConnectionCheck}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
              >
                Check Connection
              </Button>
            </View>

            <Button
              mode="text"
              onPress={() => setTestResults([])}
              style={styles.clearButton}
            >
              Clear Test Results
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Simulate Network Errors</Text>
            <Text style={styles.cardDescription}>
              Tap any error type below to simulate that specific network error
            </Text>
            
            {errorExamples.map((example) => (
              <TouchableOpacity
                key={example.id}
                style={[styles.errorExample, { borderLeftColor: example.color }]}
                onPress={() => simulateNetworkError(example.errorType)}
              >
                <Icon name={example.icon} size={24} color={example.color} />
                <View style={styles.errorExampleContent}>
                  <Text style={styles.errorExampleTitle}>{example.title}</Text>
                  <Text style={styles.errorExampleDescription}>
                    {example.description}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Test Results</Text>
            <View style={styles.testResults}>
              {testResults.length === 0 ? (
                <Text style={styles.noResults}>No test results yet. Try some actions above.</Text>
              ) : (
                testResults.map((result, index) => (
                  <Text key={index} style={styles.testResult}>
                    {result}
                  </Text>
                ))
              )}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Current Error State</Text>
            <View style={styles.errorState}>
              <Text style={styles.errorStateLabel}>Has Error:</Text>
              <Text style={[styles.errorStateValue, { color: isNetworkError ? '#DC2626' : '#10B981' }]}>
                {isNetworkError ? 'Yes' : 'No'}
              </Text>
            </View>
            
            {errorInfo && (
              <>
                <View style={styles.errorState}>
                  <Text style={styles.errorStateLabel}>Error Type:</Text>
                  <Text style={styles.errorStateValue}>{errorInfo.type}</Text>
                </View>
                <View style={styles.errorState}>
                  <Text style={styles.errorStateLabel}>Message:</Text>
                  <Text style={styles.errorStateValue}>{errorInfo.userMessage}</Text>
                </View>
                <View style={styles.errorState}>
                  <Text style={styles.errorStateLabel}>Should Retry:</Text>
                  <Text style={styles.errorStateValue}>{errorInfo.shouldRetry ? 'Yes' : 'No'}</Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>
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
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
  },
  clearButton: {
    marginTop: 8,
  },
  errorExample: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  errorExampleContent: {
    flex: 1,
    marginLeft: 12,
  },
  errorExampleTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  errorExampleDescription: {
    fontSize: 14,
    color: '#666',
  },
  testResults: {
    maxHeight: 200,
  },
  noResults: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  testResult: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  errorState: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  errorStateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorStateValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
});

export default NetworkErrorExampleScreen;
