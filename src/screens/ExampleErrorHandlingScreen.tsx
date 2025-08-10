import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import error handling utilities
import { handleError, withRetry } from '../utils/errorHandler';
import { useApiCall, useDataFetch, useFormSubmit } from '../hooks/useAsyncOperation';
import LoadingError from '../components/LoadingError';
import apiService from '../services/api';

const ExampleErrorHandlingScreen = ({ navigation }: any) => {
  const [data, setData] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);

  // Example 1: Using useDataFetch hook
  const { 
    execute: fetchData, 
    loading: dataLoading, 
    error: dataError, 
    retry: retryData 
  } = useDataFetch({
    onSuccess: (result) => setData(result),
    title: 'Load Data Error'
  });

  // Example 2: Using useApiCall hook
  const { 
    execute: submitData, 
    loading: submitLoading, 
    error: submitError 
  } = useApiCall({
    onSuccess: () => {
      Alert.alert("Success", "Data submitted successfully");
      setFormData({ name: '', email: '' });
    },
    title: 'Submit Data Error'
  });

  // Example 3: Using useFormSubmit hook
  const { 
    execute: saveForm, 
    loading: saveLoading, 
    error: saveError 
  } = useFormSubmit({
    onSuccess: () => {
      Alert.alert("Success", "Form saved successfully");
    },
    title: 'Save Form Error'
  });

  useEffect(() => {
    // Load data on component mount
    loadData();
  }, []);

  const loadData = () => {
    fetchData(async () => {
      const response = await apiService.getMissions();
      return response.data;
    });
  };

  const handleSubmitData = () => {
    submitData(async () => {
      return await apiService.createFitnessEntry({
        steps: 1000,
        exercise_minutes: 30,
        calories_burned: 150,
        distance_km: 2.5,
        workout_type: 'Walking',
        notes: 'Test workout'
      });
    });
  };

  const handleSaveForm = () => {
    if (!formData.name || !formData.email) {
      handleError(new Error('Name and email are required'), {
        title: 'Validation Error',
        showAlert: true
      });
      return;
    }

    saveForm(async () => {
      return await apiService.updateUserProfile(formData);
    });
  };

  // Example 4: Manual error handling with retry
  const handleManualOperation = async () => {
    try {
      setManualLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = { success: true, data: "Operation completed" };
      
      Alert.alert("Success", "Manual operation completed successfully");
    } catch (error) {
      Alert.alert("Error", "Manual operation failed");
    } finally {
      setManualLoading(false);
    }
  };

  // Example 5: Network error simulation
  const simulateNetworkError = async () => {
    try {
      // This will fail because the endpoint doesn't exist
      await apiService.request('/non-existent-endpoint');
    } catch (error) {
      handleError(error, {
        title: 'Network Error Simulation'
      });
    }
  };

  // Example 6: Authentication error simulation
  const simulateAuthError = async () => {
    try {
      // Clear token to simulate auth error
      await apiService.removeAuthToken();
      await apiService.getUserProfile();
    } catch (error) {
      handleError(error, {
        title: 'Authentication Error Simulation'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#E8EAFF']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Error Handling Examples</Text>
          
          {/* Example 1: LoadingError Component */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. LoadingError Component</Text>
            <LoadingError
              loading={dataLoading}
              error={dataError}
              onRetry={retryData}
              loadingText="Memuat data..."
              errorText="Gagal memuat data"
            >
              <View style={styles.dataContainer}>
                <Text style={styles.dataText}>
                  Data loaded: {data.length} items
                </Text>
                <Button 
                  mode="contained" 
                  onPress={loadData}
                  style={styles.button}
                >
                  Reload Data
                </Button>
              </View>
            </LoadingError>
          </View>

          {/* Example 2: Form with Error Handling */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Form with Error Handling</Text>
            <View style={styles.formContainer}>
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter name"
              />
              
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter email"
                keyboardType="email-address"
              />
              
              <Button 
                mode="contained" 
                onPress={handleSaveForm}
                loading={saveLoading}
                disabled={saveLoading}
                style={styles.button}
              >
                Save Form
              </Button>
              
              {saveError && (
                <Text style={styles.errorText}>Error: {saveError}</Text>
              )}
            </View>
          </View>

          {/* Example 3: API Call with Error Handling */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. API Call with Error Handling</Text>
            <Button 
              mode="contained" 
              onPress={handleSubmitData}
              loading={submitLoading}
              disabled={submitLoading}
              style={styles.button}
            >
              Submit Data
            </Button>
            
            {submitError && (
              <Text style={styles.errorText}>Error: {submitError}</Text>
            )}
          </View>

          {/* Example 4: Manual Error Handling */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Manual Error Handling with Retry</Text>
            <Button 
              mode="outlined" 
              onPress={handleManualOperation}
              loading={manualLoading}
              disabled={manualLoading}
              style={styles.button}
            >
              Manual Operation with Retry
            </Button>
          </View>

          {/* Example 5: Error Simulations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Error Simulations</Text>
            
            <Button 
              mode="outlined" 
              onPress={simulateNetworkError}
              style={styles.button}
              buttonColor="#FF6B6B"
            >
              Simulate Network Error
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={simulateAuthError}
              style={styles.button}
              buttonColor="#FF6B6B"
            >
              Simulate Auth Error
            </Button>
          </View>

          {/* Example 6: Error Types Display */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Error Types</Text>
            <View style={styles.errorTypesContainer}>
              <View style={styles.errorType}>
                <Icon name="wifi-off" size={24} color="#FF6B6B" />
                <Text style={styles.errorTypeText}>Network</Text>
              </View>
              <View style={styles.errorType}>
                <Icon name="lock" size={24} color="#FFA500" />
                <Text style={styles.errorTypeText}>Auth</Text>
              </View>
              <View style={styles.errorType}>
                <Icon name="alert-circle" size={24} color="#FFD700" />
                <Text style={styles.errorTypeText}>Validation</Text>
              </View>
              <View style={styles.errorType}>
                <Icon name="server" size={24} color="#FF6B6B" />
                <Text style={styles.errorTypeText}>Server</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  dataContainer: {
    alignItems: 'center',
    padding: 16,
  },
  dataText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  formContainer: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  errorType: {
    alignItems: 'center',
    gap: 4,
  },
  errorTypeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default ExampleErrorHandlingScreen; 