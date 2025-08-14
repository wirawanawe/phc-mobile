import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NetworkDiagnostics from '../utils/networkDiagnostics';
import apiService from '../services/api';
import { safeGoBack } from "../utils/safeNavigation";

const NetworkTroubleshootingScreen = ({ navigation }: any) => {
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [serverHealth, setServerHealth] = useState<any>(null);

  const runNetworkDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const results = await NetworkDiagnostics.runFullDiagnostics();
      setDiagnosticResults(results);
      
      // Show summary alert
      const workingCount = results.workingURLs;
      const totalCount = results.totalURLs;
      
      if (workingCount === 0) {
        Alert.alert(
          'Network Issue Detected',
          'No servers are reachable. Please check your network connection and ensure the backend server is running.',
          [
            { text: 'OK' },
            { 
              text: 'View Details', 
              onPress: () => {} // Results are already displayed
            }
          ]
        );
      } else if (workingCount === totalCount) {
        Alert.alert(
          'Network OK',
          `All ${workingCount} servers are reachable. Network connection is working properly.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Partial Network Issue',
          `${workingCount}/${totalCount} servers are reachable. Some network issues detected.`,
          [
            { text: 'OK' },
            { 
              text: 'View Details', 
              onPress: () => {} // Results are already displayed
            }
          ]
        );
      }
    } catch (error: unknown) {
      console.error('Diagnostics failed:', error);
      Alert.alert('Error', 'Failed to run network diagnostics');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const checkServerHealth = async () => {
    try {
      const health = await NetworkDiagnostics.checkServerHealth();
      setServerHealth(health);
      
      if (health.healthy) {
        Alert.alert(
          'Server Health Check',
          `Server is healthy!\nStatus: ${health.status} ${health.statusText}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Server Health Issue',
          `Server is not responding: ${health.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Health check failed:', error);
      Alert.alert('Error', 'Failed to check server health');
    }
  };

  const testApiConnection = async () => {
    try {
      // Re-initialize API service to test connection
      await apiService.initialize();
      
      // Try a simple API call
      const response = await apiService.getUserProfile();
      
      Alert.alert(
        'API Connection Test',
        response.success 
          ? 'API connection is working properly!'
          : `API connection failed: ${response.message}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('API test failed:', error);
      Alert.alert(
        'API Connection Failed',
        `Failed to connect to API: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderDiagnosticResults = () => {
    if (!diagnosticResults) return null;

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Diagnostic Results</Text>
        
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            Working: {diagnosticResults.workingURLs}/{diagnosticResults.totalURLs} servers
          </Text>
          {diagnosticResults.bestURL && (
            <Text style={styles.bestUrlText}>
              Best URL: {diagnosticResults.bestURL}
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Recommendations:</Text>
        {diagnosticResults.recommendations.map((rec: string, index: number) => (
          <Text key={index} style={styles.recommendationText}>
            • {rec}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Detailed Results:</Text>
        {diagnosticResults.allResults.map((result: any, index: number) => (
          <View key={index} style={styles.resultItem}>
            <Text style={[
              styles.urlText,
              result.reachable ? styles.successText : styles.errorText
            ]}>
              {result.url}
            </Text>
            <Text style={styles.statusText}>
              {result.reachable 
                ? `✅ REACHABLE (${result.responseTime}ms)`
                : `❌ UNREACHABLE: ${result.error}`
              }
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderServerHealth = () => {
    if (!serverHealth) return null;

    return (
      <View style={styles.healthContainer}>
        <Text style={styles.healthTitle}>Server Health Check</Text>
        <Text style={[
          styles.healthStatus,
          serverHealth.healthy ? styles.successText : styles.errorText
        ]}>
          {serverHealth.healthy ? '✅ Healthy' : '❌ Unhealthy'}
        </Text>
        {serverHealth.healthy ? (
          <Text style={styles.healthDetails}>
            Status: {serverHealth.status} {serverHealth.statusText}
          </Text>
        ) : (
          <Text style={styles.healthDetails}>
            Error: {serverHealth.error}
          </Text>
        )}
        <Text style={styles.timestampText}>
          Checked: {new Date(serverHealth.timestamp).toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#E8EAFF']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => safeGoBack(navigation, 'Main')}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Network Troubleshooting</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Network Diagnostics</Text>
            <Text style={styles.sectionDescription}>
              Run comprehensive network diagnostics to identify connection issues between your mobile app and the backend server.
            </Text>
            
            <TouchableOpacity
              style={[styles.button, isRunningDiagnostics && styles.disabledButton]}
              onPress={runNetworkDiagnostics}
              disabled={isRunningDiagnostics}
            >
              {isRunningDiagnostics ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Icon name="wifi" size={20} color="#fff" />
              )}
              <Text style={styles.buttonText}>
                {isRunningDiagnostics ? 'Running Diagnostics...' : 'Run Network Diagnostics'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Tests</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={checkServerHealth}
            >
              <Icon name="heart-pulse" size={20} color="#fff" />
              <Text style={styles.buttonText}>Check Server Health</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={testApiConnection}
            >
              <Icon name="api" size={20} color="#fff" />
              <Text style={styles.buttonText}>Test API Connection</Text>
            </TouchableOpacity>
          </View>

          {renderServerHealth()}
          {renderDiagnosticResults()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  bestUrlText: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 20,
  },
  resultItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  urlText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
  },
  successText: {
    color: '#059669',
  },
  errorText: {
    color: '#DC2626',
  },
  healthContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  healthDetails: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default NetworkTroubleshootingScreen; 