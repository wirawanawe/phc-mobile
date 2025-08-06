import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugAuth, clearAuth, checkTokens, fixAuthentication, testAuthentication } from '../utils/authDebugger';
import apiService from '../services/api';

const ConnectionDebugScreen = () => {
  const [authDebugInfo, setAuthDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAuthDebug = async () => {
    setIsLoading(true);
    try {
      const debugInfo = await debugAuth();
      setAuthDebugInfo(debugInfo);
      console.log('Auth debug info:', debugInfo);
    } catch (error) {
      console.error('Auth debug error:', error);
      Alert.alert('Error', 'Failed to run auth debug');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      const result = await clearAuth();
      Alert.alert('Success', result.message);
      runAuthDebug(); // Refresh debug info
    } catch (error) {
      Alert.alert('Error', 'Failed to clear auth data');
    }
  };

  const checkTokenValidity = async () => {
    try {
      const tokenCheck = await checkTokens();
      Alert.alert('Token Check', JSON.stringify(tokenCheck, null, 2));
    } catch (error) {
      Alert.alert('Error', 'Failed to check tokens');
    }
  };

  const fixAuth = async () => {
    setIsLoading(true);
    try {
      const result = await fixAuthentication();
      Alert.alert('Auth Fix', result.message);
      runAuthDebug(); // Refresh debug info
    } catch (error) {
      Alert.alert('Error', 'Failed to fix authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthWithBackend = async () => {
    setIsLoading(true);
    try {
      const result = await testAuthentication();
      Alert.alert('Backend Test', JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert('Error', 'Failed to test with backend');
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.login('test@mobile.com', 'password123');
      Alert.alert('Login Test', JSON.stringify(response, null, 2));
      runAuthDebug(); // Refresh debug info
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getUserProfile();
      Alert.alert('Profile Test', JSON.stringify(response, null, 2));
    } catch (error) {
      Alert.alert('Profile Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Authentication Debug</Title>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Authentication Actions</Title>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={runAuthDebug}
              loading={isLoading}
              style={styles.button}
            >
              Debug Auth
            </Button>
            <Button
              mode="contained"
              onPress={clearAuthData}
              style={styles.button}
            >
              Clear Auth Data
            </Button>
            <Button
              mode="contained"
              onPress={checkTokenValidity}
              style={styles.button}
            >
              Check Tokens
            </Button>
            <Button
              mode="contained"
              onPress={fixAuth}
              loading={isLoading}
              style={styles.button}
            >
              Fix Authentication
            </Button>
            <Button
              mode="contained"
              onPress={testAuthWithBackend}
              loading={isLoading}
              style={styles.button}
            >
              Test with Backend
            </Button>
            <Button
              mode="contained"
              onPress={testLogin}
              loading={isLoading}
              style={styles.button}
            >
              Test Login
            </Button>
            <Button
              mode="contained"
              onPress={testGetUserProfile}
              loading={isLoading}
              style={styles.button}
            >
              Test Get Profile
            </Button>
          </View>
        </Card.Content>
      </Card>

      {authDebugInfo && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Authentication Debug Info</Title>
            <Paragraph>
              <Text style={styles.label}>Has Auth Token:</Text> {authDebugInfo.hasAuthToken ? 'Yes' : 'No'}
            </Paragraph>
            <Paragraph>
              <Text style={styles.label}>Has Refresh Token:</Text> {authDebugInfo.hasRefreshToken ? 'Yes' : 'No'}
            </Paragraph>
            <Paragraph>
              <Text style={styles.label}>Has User Data:</Text> {authDebugInfo.hasUserData ? 'Yes' : 'No'}
            </Paragraph>
            {authDebugInfo.userData && (
              <Paragraph>
                <Text style={styles.label}>User ID:</Text> {authDebugInfo.userData.id}
              </Paragraph>
            )}
            {authDebugInfo.userData && (
              <Paragraph>
                <Text style={styles.label}>User Email:</Text> {authDebugInfo.userData.email}
              </Paragraph>
            )}
            {authDebugInfo.authToken && (
              <Paragraph>
                <Text style={styles.label}>Auth Token:</Text> {authDebugInfo.authToken}
              </Paragraph>
            )}
            {authDebugInfo.refreshToken && (
              <Paragraph>
                <Text style={styles.label}>Refresh Token:</Text> {authDebugInfo.refreshToken}
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    marginVertical: 4,
  },
  label: {
    fontWeight: 'bold',
  },
});

export default ConnectionDebugScreen; 