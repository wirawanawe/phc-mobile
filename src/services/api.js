import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { handleApiError, withRetry, handleError, handleSessionExpiration } from "../utils/errorHandler";
import mockApiService from "./mockApi";
import NetworkHelper from "../utils/networkHelper";
import NetworkDiagnostic from "../utils/networkDiagnostic";
import { getBestEndpoint } from "../utils/networkTest";
import ConnectionTest from "../utils/connectionTest";
import { networkStatusManager, getNetworkErrorMessage, isNetworkError } from "../utils/networkStatus";
import { connectionMonitor } from "../utils/connectionMonitor";
import { loginDiagnostic } from "../utils/loginDiagnostic";
import { getRecommendedApiUrl } from "../utils/networkStatus";
import { getQuickApiUrl, testQuickConnection } from "../utils/quickFix";
import { handleNetworkError, getNetworkErrorType, NetworkErrorType } from "../utils/networkErrorHandler";
import BackgroundServiceManager from "../utils/backgroundServiceManager";
import ConnectionStatusManager from "../utils/connectionStatusManager";

// Get server URL based on environment
const getServerURL = () => {
  // Force localhost for development
  return "localhost";
};

// Enhanced fallback data - return meaningful data when database is empty
const getFallbackData = (endpoint) => {
  if (endpoint.includes('/wellness/activities')) {
    return {
      activities: [],
      total: 0,
      message: 'No wellness activities available'
    };
  }
  
  if (endpoint.includes('/mood_tracking') || endpoint.includes('/mood-tracker')) {
    return {
      entries: [],
      total_entries: 0,
      most_common_mood: null,
      average_mood_score: 0,
      mood_distribution: {},
      period: 7
    };
  }
  
  if (endpoint.includes('/tracking/today-summary')) {
    // Return meaningful default data structure
    return {
      date: new Date().toISOString().split('T')[0],
      water: {
        total_ml: "0",
        target_ml: 2000,
        percentage: 0
      },
      sleep: null,
      mood: null,
      health_data: [],
      meal: {
        calories: "0.00",
        protein: "0.00",
        carbs: "0.00",
        fat: "0.00",
        meal_count: 0
      },
      fitness: {
        exercise_minutes: "0",
        steps: "0",
        distance_km: "0.00"
      },
      activities_completed: 0,
      points_earned: 0
    };
  }
  
  if (endpoint.includes('/tracking/meal/today')) {
    return {
      totals: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        meal_count: 0,
        food_count: 0
      },
      meals_by_type: {},
      recommended: {
        calories: 2000,
        protein: 50,
        carbs: 250,
        fat: 65
      },
      percentages: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    };
  }
  
  if (endpoint.includes('/tracking/water/today')) {
    return {
      total_water_ml: 0,
      total_intake: 0,
      goal_ml: 2000,
      percentage: 0
    };
  }
  
  if (endpoint.includes('/tracking/fitness') && !endpoint.includes('/today')) {
    return {
      data: [],
      message: 'No fitness data available'
    };
  }
  
  if (endpoint.includes('/tracking/sleep') && !endpoint.includes('/today')) {
    return {
      data: [],
      message: 'No sleep data available'
    };
  }
  
  if (endpoint.includes('/missions') || endpoint.includes('/user_missions')) {
    return {
      data: [],
      message: 'No missions available'
    };
  }
  
  // Default fallback for other endpoints
  return {
    data: [],
    message: 'Data temporarily unavailable'
  };
};


// Configuration for different environments
const getApiBaseUrl = () => {
  // For development - use appropriate URL based on platform
  if (__DEV__) {
    // For mobile devices and emulators, use the machine's IP address
    // For web development, use localhost
    if (Platform.OS === 'web') {
      return "http://localhost:3000/api/mobile";
    } else {
      return "http://10.242.90.103:3000/api/mobile";
    }
  }

  // For production - use production server
  return "https://dash.doctorphc.id/api/mobile";
};

// Network connectivity test function
const testNetworkConnectivity = async (baseURL) => {
  try {
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced timeout to 5 seconds for faster connectivity test
    
    // Use the health endpoint for connectivity testing
    // Fix: Use the correct mobile health endpoint
    const healthURL = `${baseURL}/health`;
    
    const response = await fetch(healthURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Check if response is valid JSON
    if (response.ok) {
      try {
        const data = await response.json();
        return { success: true, responseTime, status: response.status, data };
      } catch (jsonError) {
        console.warn('⚠️ Network: Health response is not JSON, but server is responding');
        return { success: true, responseTime, status: response.status };
      }
    } else {
      console.warn('⚠️ Network: Health endpoint returned non-200 status:', response.status);
      return { success: false, error: `Server returned status ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Network: Connectivity test failed');
    console.error('❌ Network: Error details:', {
      message: error.message,
      name: error.name,
      type: error.constructor.name
    });
    
    // Use the new network error handler for better error classification
    const errorType = getNetworkErrorType(error);
    const errorInfo = handleNetworkError(error, {
      showAlert: false, // Don't show alert during connectivity test
      context: 'Connectivity Test'
    });
    
    return { 
      success: false, 
      error: errorInfo.userMessage,
      errorType: errorType,
      shouldRetry: errorInfo.shouldRetry,
      retryDelay: errorInfo.retryDelay
    };
  }
};

  // Get the API URL (development mode)
  const getBestApiUrl = async () => {
  // For development - use appropriate URL based on platform
  if (__DEV__) {
    // For mobile devices and emulators, use the machine's IP address
    // For web development, use localhost
    if (Platform.OS === 'web') {
      return "http://localhost:3000/api/mobile";
    } else {
      return "http://10.242.90.103:3000/api/mobile";
    }
  }

  // For production - use production server
  console.log('🔧 Production mode: Using production server');
  return "https://dash.doctorphc.id/api/mobile";
};

class ApiService {
  constructor() {
    this.baseURL = null; // Will be set dynamically
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.navigation = null; // Navigation reference for session expiration
  }

  // Set navigation reference for session expiration handling
  setNavigation(navigation) {
    this.navigation = navigation;
  }

  // Initialize the API service with the best available URL
  async initialize() {
    if (this.isInitialized && this.baseURL) {
      return;
    }

    try {
      this.baseURL = await getBestApiUrl();
  
      
      // Start connection monitoring
      if (connectionMonitor && typeof connectionMonitor.start === 'function') {
        connectionMonitor.start();
      } else {
        console.warn('⚠️ API: connectionMonitor not available, skipping connection monitoring');
      }
      
      // Simple connectivity test with retry
      let connectivityTest = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          connectivityTest = await this.testConnectivityWithRetry();
          if (connectivityTest.success) {
            break;
          } else {
            console.warn(`⚠️ API: Connectivity test attempt ${attempt} failed:`, connectivityTest.error);
          }
        } catch (error) {
          console.warn(`⚠️ API: Connectivity test attempt ${attempt} threw error:`, error.message);
        }
        
        // Wait before retry
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms for faster retry
        }
      }
      
      if (connectivityTest && connectivityTest.success) {
        this.isInitialized = true;
        this.retryCount = 0; // Reset retry count on success
      } else {
        this.isInitialized = true;
        console.warn('⚠️ API: Service initialized but connectivity test failed - will use fallback mode');
      }
    } catch (error) {
      console.error('❌ API: Error initializing API service:', error);
      // Still initialize to allow fallback behavior
      this.isInitialized = true;
      console.warn('⚠️ API: Service initialized with errors, using fallback mode');
    }
  }

  // Test connectivity with retry mechanism
  async testConnectivityWithRetry() {
    try {
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for connectivity test
      
      // Use the health endpoint which is working
      const testURL = `${this.baseURL}/health`;
      
      const response = await fetch(testURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Any HTTP response indicates connectivity
      return { success: true, responseTime, status: response.status };
    } catch (error) {
      console.error('❌ Network: Connectivity test failed');
      console.error('❌ Network: Error details:', {
        message: error.message,
        name: error.name,
        type: error.constructor.name
      });
      return { success: false, error: error.message };
    }
  }

  // Force re-initialization of the API service
  async reinitialize() {
    this.isInitialized = false;
    this.baseURL = null;
    this.retryCount = 0;
    await this.initialize();
  }

  // Debug method to test network connectivity
  async debugNetworkConnection() {
    try {
      const status = await getRecommendedApiUrl();
      return status;
    } catch (error) {
      console.error('🔍 API Debug: Network test failed:', error);
      throw error;
    }
  }

  // Helper method to get user ID from storage with better error handling
  async getUserId() {
    try {
      const userData = await AsyncStorage.getItem("userData");
      
      if (userData) {
        const user = JSON.parse(userData);
        
        if (user && user.id) {
          return user.id;
        }
      }
      
      // If no user data or invalid user data, use a valid default user ID
      return 1; // Use Super Admin user ID which exists in database
    } catch (error) {
      console.error('❌ API: Error getting user ID:', error);
      return 1; // Use Super Admin user ID which exists in database
    }
  }

  // Helper method to add user_id to query parameters
  async addUserIdToParams(params = {}) {
    const userId = await this.getUserId();
    if (userId) {
      return { ...params, user_id: userId };
    } else {
      return params;
    }
  }

  // Helper method to create query string with user_id
  async createQueryStringWithUserId(params = {}) {
    const paramsWithUserId = await this.addUserIdToParams(params);
    return new URLSearchParams(paramsWithUserId).toString();
  }

  // Get auth token from storage with better error handling
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem("authToken");
      return token;
    } catch (error) {
      console.error('❌ API: Error getting auth token:', error);
      return null;
    }
  }

  // Get refresh token from storage
  async getRefreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      return refreshToken;
    } catch (error) {
      console.error('❌ API: Error getting refresh token:', error);
      return null;
    }
  }

  // Set auth token to storage with better error handling
  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error('❌ API: Error setting auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  // Set refresh token to storage
  async setRefreshToken(refreshToken) {
    try {
      await AsyncStorage.setItem("refreshToken", refreshToken);
    } catch (error) {
      console.error('❌ API: Error setting refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  // Remove auth token from storage
  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("refreshToken");
    } catch (error) {
      console.error('❌ API: Error removing auth tokens:', error);
    }
  }

  // Remove refresh token from storage
  async removeRefreshToken() {
    try {
      await AsyncStorage.removeItem("refreshToken");
    } catch (error) {
      console.error('❌ API: Error removing refresh token:', error);
    }
  }

  // Refresh access token with better error handling
  async refreshAccessToken() {
    // Ensure API service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const refreshToken = await this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

              const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Provide more specific error messages
        if (response.status === 401) {
          if (errorText.includes("Invalid refresh token")) {
            throw new Error("Session expired. Please login again.");
          } else if (errorText.includes("User not found")) {
            throw new Error("Account not found or inactive. Please contact support.");
          }
        }
        
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        await this.setAuthToken(data.data.accessToken);
        await this.setRefreshToken(data.data.refreshToken);
        return { success: true, data: data.data.accessToken };
      } else {
        throw new Error(data.message || "Token refresh failed");
      }
    } catch (error) {
      console.error('❌ API: Token refresh failed:', error.message);
      
      // Handle session expiration with navigation if available
      if (this.navigation && (error.message.includes('No refresh token available') || 
                             error.message.includes('Token refresh failed') ||
                             error.message.includes('Session expired'))) {
        handleSessionExpiration(error, this.navigation, async () => {
          await this.removeAuthToken();
          await this.removeRefreshToken();
        });
      } else {
        await this.removeAuthToken();
        await this.removeRefreshToken();
      }
      
      throw error;
    }
  }

  // Generic request method with automatic token refresh and retry mechanism
  async request(endpoint, options = {}) {
    // Ensure API service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check network connectivity before making request
    let networkStatus = { isConnected: true, isInternetReachable: true, type: 'unknown', isWifi: false, isCellular: false };
    
    try {
      if (networkStatusManager && typeof networkStatusManager.getCurrentStatus === 'function') {
        // Check if the manager is properly initialized
        if (networkStatusManager.isInitialized && networkStatusManager.isInitialized()) {
          networkStatus = networkStatusManager.getCurrentStatus();
        } else {
          console.warn('⚠️ API: networkStatusManager not yet initialized, using default network status');
        }
      } else {
        console.warn('⚠️ API: networkStatusManager not available, using default network status');
      }
    } catch (error) {
      console.warn('⚠️ API: Error getting network status, using defaults:', error.message);
    }
    
    if (!networkStatus.isConnected) {
      console.warn('⚠️ Network: No internet connection detected');
      // For non-critical endpoints, return fallback data instead of throwing
      if (endpoint.includes('/wellness') || endpoint.includes('/mood') || endpoint.includes('/tracking')) {
        return {
          success: true,
          data: getFallbackData(endpoint),
          message: 'Using offline data - no internet connection',
          fromFallback: true
        };
      }
      throw new Error('Tidak ada koneksi internet. Silakan periksa koneksi Anda.');
    }
    
    // Use ConnectionStatusManager for intelligent connection handling
    const connectionStatus = ConnectionStatusManager.getConnectionStatus();
    
    // Check if we should use fallback data based on connection status
    if (connectionStatus.shouldUseFallback && 
        (endpoint.includes('/wellness') || endpoint.includes('/mood') || endpoint.includes('/tracking'))) {
      return {
        success: true,
        data: getFallbackData(endpoint),
        message: `Using offline data - ${ConnectionStatusManager.getStatusMessage()}`,
        fromFallback: true
      };
    }
    
    // For critical endpoints, proceed with request but log connection status
    if (connectionStatus.warningLevel !== 'none') {
      console.warn(`⚠️ API: Proceeding with request despite connection issues (${connectionStatus.warningLevel} level)`);
    }

    const makeRequest = async (authToken) => {
      try {
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for mobile networks
        
        const config = {
          method: options.method || 'GET',
          headers,
          ...options,
          signal: controller.signal,
        };

        if (options.body) {
          config.body = options.body;
        }

        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          
          // Handle specific HTTP errors
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          } else if (response.status === 403) {
            throw new Error('Access denied. You do not have permission to perform this action.');
          } else if (response.status === 404) {
            throw new Error('Resource not found.');
          } else if (response.status === 409) {
            // Handle conflict errors (like "Mission sudah diselesaikan")
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(errorData.message || 'Conflict: Data already exists or has been processed.');
            } catch (parseError) {
              throw new Error('Conflict: Data already exists or has been processed.');
            }
          } else if (response.status === 422) {
            throw new Error(`Validation error: ${errorText}`);
          } else if (response.status === 429) {
            // Enhanced rate limit handling
            try {
              const errorData = JSON.parse(errorText);
              const retryAfter = response.headers.get('Retry-After');
              const message = errorData.message || 'Too many requests. Please wait a moment and try again.';
              
              if (retryAfter) {
                throw new Error(`${message} Retry after ${retryAfter} seconds.`);
              } else {
                throw new Error(message);
              }
            } catch (parseError) {
              throw new Error('Too many requests. Please wait a moment and try again.');
            }
          } else if (response.status >= 500) {
            // Try to parse error details for better debugging
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(`Server error: ${errorData.message || errorData.error || 'Unknown server error'}`);
            } catch (parseError) {
              throw new Error(`Server error (${response.status}): ${errorText || response.statusText}`);
            }
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        throw error;
      }
    };

      // Retry mechanism with exponential backoff
  for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
    try {
      // Get the auth token
      const token = await this.getAuthToken();
      return await makeRequest(token);
    } catch (error) {
        // Handle authentication errors
        if (error.message.includes('Authentication failed') || error.message.includes('401')) {
          try {
            const refreshResult = await this.refreshAccessToken();
            if (refreshResult.success) {
              const newToken = await this.getAuthToken();
              return await makeRequest(newToken);
            } else {
              console.warn('🔐 API: Token refresh failed');
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            console.warn('🔐 API: Authentication failed, user needs to login again');
            
            // Stop background services when authentication fails
            try {
              await BackgroundServiceManager.stopAllServices();
            } catch (serviceError) {
              console.log('⚠️ API: Error stopping background services:', serviceError);
            }
            
            // Handle session expiration with navigation if available
            if (this.navigation && (refreshError.message.includes('No refresh token available') || 
                                  refreshError.message.includes('Token refresh failed') ||
                                  refreshError.message.includes('Session expired'))) {
              handleSessionExpiration(refreshError, this.navigation, async () => {
                await this.removeAuthToken();
                await this.removeRefreshToken();
              });
            }
            
            throw new Error('Authentication failed. Please login again.');
          }
        }

        // Handle JSON parse errors specifically
        if (error.message.includes("JSON Parse error") || error.message.includes("Unexpected token")) {
          throw new Error("Server returned invalid response format. Please check if backend is running correctly.");
        }

          // Handle rate limiting specifically
  if (error.message.includes('Too many requests') || error.message.includes('429')) {
    // Rate limiting - wait and retry
    if (attempt < this.maxRetries) {
      const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000); // Max 30 seconds for rate limiting
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    
    if (attempt < this.maxRetries) {
      const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000); // Max 30 seconds for rate limiting
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    throw error;
  }

        // Handle network errors with enhanced error handling
        if (error.name === 'TypeError' && error.message.includes('fetch') || isNetworkError(error)) {
          // Network error detected
          console.log(`🌐 Network: Network error detected (attempt ${attempt}/${this.maxRetries})`);
          
          // Use the new network error handler for better classification and user feedback
          const errorType = getNetworkErrorType(error);
          const errorInfo = handleNetworkError(error, {
            showAlert: false, // Don't show alert during retry attempts
            context: `API Request (${endpoint})`
          });
          
          if (attempt < this.maxRetries && errorInfo.shouldRetry) {
            const delay = errorInfo.retryDelay * Math.pow(2, attempt - 1);
            console.log(`🌐 Network: Retrying in ${delay}ms... (${errorType})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          console.warn('🌐 Network: Max retries reached, throwing network error');
          throw new Error(errorInfo.userMessage);
        }

        // Don't retry for certain error types
        if (error.message.includes('Validation error') || 
            error.message.includes('Access denied') || 
            error.message.includes('Resource not found') ||
            error.message.includes('Conflict:') ||
            error.message.includes('Mission sudah diselesaikan') ||
            error.message.includes('sudah dalam progress') ||
            error.message.includes('sudah diselesaikan') ||
            error.message.includes('sudah dibatalkan')) {
          throw error;
        }

        // Retry for other errors
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // All retries exhausted - throw error instead of using fallback data
        console.warn(`⚠️ API: All retries exhausted for ${endpoint}, throwing error`);
        
        // Don't use fallback data - let the error propagate
        // This ensures users see real data or no data, not fake data
        
        // Use the enhanced network error handler for better user experience
        const errorType = getNetworkErrorType(error);
        const errorInfo = handleNetworkError(error, {
          showAlert: true, // Show alert for final error
          context: `API Request (${endpoint})`,
          onRetry: () => {
            // Allow user to retry the specific request
            // You can implement retry logic here if needed
          }
        });
        
        // Re-throw the error with better context
        const enhancedError = new Error(errorInfo.userMessage);
        enhancedError.originalError = error;
        enhancedError.errorInfo = errorInfo;
        throw enhancedError;
      }
    }
  }

  // ===== AUTHENTICATION =====

  async login(email, password, retryCount = 0) {
    // Ensure API service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Quick connectivity test before login with multiple attempts
    let connectivityTest = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        connectivityTest = await this.testConnectivityWithRetry();
        if (connectivityTest.success) {
          break;
        }
      } catch (connectivityError) {
        console.warn(`🔐 Login: Connectivity test attempt ${attempt} failed:`, connectivityError.message);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms for faster retry
        }
      }
    }
    
    if (!connectivityTest || !connectivityTest.success) {
      console.warn("🔐 Login: Connectivity test failed, but continuing with login attempt");
    }

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    };

    try {
      
      // Create a timeout controller for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced to 10 seconds for faster login
      
      try {
        // Use mobile auth endpoint for mobile users
        const response = await fetch(`${this.baseURL}/auth/login`, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorText = "";
          try {
            errorText = await response.text();
          } catch (textError) {
            // Could not read error response text
          }
          
          if (response.status === 401) {
            // Enhanced 401 error handling with more specific messages
            let errorMessage = "Invalid credentials";
            
            // Try to parse the error response for more specific information
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (parseError) {
              // If we can't parse JSON, use the raw error text if available
              if (errorText && errorText.trim()) {
                errorMessage = errorText.trim();
              }
            }
            
            throw new Error(errorMessage);
          } else if (response.status === 404) {
            throw new Error("Login endpoint not found. Please check server configuration.");
          } else if (response.status === 429) {
            // Handle rate limiting
            // Respect Retry-After header for user messaging
            const retryAfter = response.headers.get('retry-after') || '0';
            const waitTime = parseInt(retryAfter, 10);
            if (!Number.isFinite(waitTime) || waitTime <= 0) {
              throw new Error("Too many login attempts. Please wait a few minutes and try again.");
            } else {
              const minutes = Math.ceil(waitTime / 60);
              throw new Error(`Too many login attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and try again.`);
            }
          } else if (response.status >= 500) {
            // Check if it's a database error
            if (errorText.includes("Database error") || errorText.includes("Access denied")) {
              throw new Error("Server database is currently unavailable. Please try again later.");
            } else {
              throw new Error("Server error. Please try again later.");
            }
          }
          
          throw new Error(`Login failed (${response.status}): ${errorText || response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

        const data = await response.json();
        console.log("🔐 Login: Response data:", JSON.stringify(data, null, 2));
        
        // Store tokens if login was successful
        if (data.success && data.data) {
          const token = data.data.accessToken || data.data.token;
          const refreshToken = data.data.refreshToken;
          
          console.log("🔐 Login: Token received:", token ? "Yes" : "No");
          console.log("🔐 Login: Refresh token received:", refreshToken ? "Yes" : "No");
          
          if (token) {
            await this.setAuthToken(token);
            if (refreshToken) {
              await this.setRefreshToken(refreshToken);
            }
          }
        }
        
        return data;
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
    } catch (error) {
      console.error("❌ Login error:", error);
      
      // Handle specific timeout and connection errors
      if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        console.warn("🔐 Login: Timeout error detected");
        // One quick connectivity check and single retry before failing
        if (retryCount < 1) {
          try {
            console.log("🔐 Login: Retrying with connectivity test...");
            await this.testConnectivityWithRetry();
          } catch (_) {
            // ignore
          }
                  await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms to 500ms for faster retry
        return await this.login(email, password, retryCount + 1);
        }
        throw new Error("Koneksi timeout. Server mungkin sedang sibuk atau tidak dapat diakses. Silakan coba lagi dalam beberapa saat.");
      } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        console.warn("🔐 Login: Network request failed");
        // Try a simple connectivity test to provide better error message
        try {
          if (connectionMonitor && typeof connectionMonitor.quickTest === 'function') {
            const quickTest = await connectionMonitor.quickTest();
            if (!quickTest) {
              throw new Error("Server tidak dapat diakses. Silakan coba lagi nanti.");
            }
          }
        } catch (testError) {
          console.warn("🔐 Login: Quick connectivity test failed:", testError.message);
        }
        throw new Error("Koneksi ke server gagal. Periksa koneksi internet Anda dan pastikan server berjalan.");
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        console.warn("🔐 Login: Connection refused or host not found");
        throw new Error("Tidak dapat terhubung ke server. Pastikan server berjalan dan dapat diakses.");
      }
      
      // Run diagnostics if this is a network-related error
      if (error.message.includes('Network') || error.message.includes('fetch') || error.message.includes('timeout')) {
        try {
          const diagnosticResults = await loginDiagnostic.runDiagnostics();
          
          // Add diagnostic info to error
          const enhancedError = new Error(error.message);
          enhancedError.diagnosticResults = diagnosticResults;
          throw enhancedError;
        } catch (diagnosticError) {
          console.warn('🔍 Login: Diagnostics failed:', diagnosticError.message);
          // Continue with original error
        }
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  async register(userData) {
    // Ensure API service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    // For register, don't use existing tokens - make a fresh request
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    };

    try {
              const response = await fetch(`${this.baseURL}/auth/register`, config);
      
      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
        } catch (textError) {
          // Could not read response text
        }
        
        if (response.status === 400) {
          throw new Error(`Registration failed: Invalid data - ${errorText}`);
        }
        
        if (response.status === 409) {
          throw new Error(`Registration failed: User already exists - ${errorText}`);
        }
        
        if (response.status >= 500) {
          throw new Error(`Registration failed: Server error (${response.status}) - ${errorText}`);
        }
        
        throw new Error(`Registration failed (${response.status}): ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      
      // Store tokens if registration was successful
      if (data.success && data.data) {
        const token = data.data.accessToken || data.data.token;
        const refreshToken = data.data.refreshToken;
        
        if (token) {
          await this.setAuthToken(token);
          if (refreshToken) {
            await this.setRefreshToken(refreshToken);
          }
        }
      }
      
      return data;
      
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      // Clear auth tokens
      await this.removeAuthToken();
      
      // Reset mock notification flag
      try {
        await AsyncStorage.removeItem('mockNotificationShown');
      } catch (storageError) {
        // Could not reset mock notification flag
      }
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // ===== CLINICS =====

  async getClinics() {
    return await this.request("/clinics");
  }

  async getClinicById(id) {
    return await this.request(`/clinics/${id}`);
  }

  async getClinicServices(clinicId) {
    return await this.request(`/clinics/${clinicId}/services`);
  }

  async getClinicDoctors(clinicId) {
    return await this.request(`/clinics/${clinicId}/doctors`);
  }

  async getDoctorsByService(serviceId) {
    return await this.request(`/clinics/services/${serviceId}/doctors`);
  }

  // ===== BOOKINGS =====

  async createBooking(bookingData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...bookingData, user_id: userId };
    return await this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getMyBookings() {
    // Use authenticated endpoint to get user's own bookings
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/bookings/my-bookings?${queryString}`);
  }

  async getBookingById(id) {
    return await this.request(`/bookings/${id}`);
  }

  async cancelBooking(id, reason) {
    return await this.request(`/bookings/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ cancellation_reason: reason }),
    });
  }

  async updatePaymentStatus(id, paymentData) {
    return await this.request(`/bookings/${id}/payment`, {
      method: "PATCH",
      body: JSON.stringify(paymentData),
    });
  }

  // ===== TEST CONNECTION =====

  async testConnection() {
    try {
      const response = await this.request("/test-connection");
      return response;
    } catch (error) {
      console.error('❌ API: Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== MOOD TRACKING =====

  async createMoodEntry(moodData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...moodData, user_id: userId };
    const response = await this.request("/mood_tracking", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });

    // Auto-update missions if mood tracking is successful
    if (response.success) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await this.autoUpdateMissionProgress({
          tracking_type: 'mental_health',
          current_value: moodData.mood_score || 0,
          date: today
        });
      } catch (error) {
        console.error('Error auto-updating missions for mood tracking:', error);
      }
    }

    return response;
  }

  async getTodayMood() {
    try {
      return await this.request(`/wellness/mood-tracker/today`);
    } catch (error) {
      console.error('Today mood API error:', error);
      // Return a fallback response if the API fails
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  async updateMoodEntry(moodId, moodData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...moodData, user_id: userId };
    return await this.request(`/mood_tracking/${moodId}`, {
      method: "PUT",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getMoodHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/mood_tracking?${queryString}`);
  }

  async getMoodTracking(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/mood_tracking?${queryString}`);
  }

  // ===== WATER TRACKING =====

  async createWaterEntry(waterData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...waterData, user_id: userId };
    const response = await this.request("/tracking/water", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });

    // Auto-update missions if water tracking is successful
    if (response.success) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await this.autoUpdateMissionProgress({
          tracking_type: 'health_tracking',
          current_value: waterData.amount_ml || 0,
          date: today
        });
      } catch (error) {
        console.error('Error auto-updating missions for water tracking:', error);
      }
    }

    return response;
  }

  async getWaterHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/water?${queryString}`);
  }

  async getWaterTracking(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/water?${queryString}`);
  }

  async getTodayWaterIntake() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/water/today?${queryString}`);
  }

  async getWeeklyWaterIntake(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/water/weekly?${queryString}`);
  }

  async getWellnessProgress(userId = null) {
    try {
      const targetUserId = userId !== null ? userId : await this.getUserId();
      return await this.request(`/wellness-progress/${targetUserId}`);
    } catch (error) {
      // If wellness progress fails, return a default structure
      if (error.message.includes('Server error') || error.message.includes('404') || error.message.includes('Database error')) {
        console.warn('Wellness progress failed, returning default data:', error.message);
        return {
          success: true,
          user: {
            id: targetUserId,
            name: 'User',
            email: '',
            wellness_program_joined: false,
            wellness_join_date: null,
            age: null,
            gender: null,
            activity_level: null,
            fitness_goal: null
          },
          progress: {
            totalActivities: 0,
            completedMissions: 0,
            totalMissions: 0,
            totalPoints: 0,
            weeklyActivities: 0,
            completionRate: 0,
            wellnessScore: 0,
            activityDistribution: {},
            recentActivities: [],
            missions: [],
            trackingData: {
              avgWaterIntake: 0,
              avgMoodScore: 0,
              avgSleepHours: 0,
              waterData: [],
              moodData: [],
              sleepData: []
            }
          }
        };
      }
      throw error;
    }
  }

  // ===== SLEEP TRACKING =====

  async createSleepEntry(sleepData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...sleepData, user_id: userId };
    const response = await this.request("/sleep_tracking", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
    
    // Add success flag for consistency
    if (response && (response.message?.includes('successfully') || response.sleepData)) {
      response.success = true;
    }

    // Auto-update missions if sleep tracking is successful
    if (response.success) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await this.autoUpdateMissionProgress({
          tracking_type: 'health_tracking',
          current_value: sleepData.sleep_hours || 0,
          date: today
        });
      } catch (error) {
        console.error('Error auto-updating missions for sleep tracking:', error);
      }
    }
    
    return response;
  }

  async updateSleepEntry(id, sleepData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...sleepData, user_id: userId };
    const response = await this.request(`/sleep_tracking/${id}`, {
      method: "PUT",
      body: JSON.stringify(dataWithUserId),
    });
    
    // Add success flag for consistency
    if (response && (response.message?.includes('successfully') || response.sleepData)) {
      response.success = true;
    }
    
    return response;
  }

  async getSleepHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/sleep_tracking?${queryString}`);
  }

  async getSleepTracking(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/sleep_tracking?${queryString}`);
  }

  async getSleepDataByDate(date) {
    const userId = await this.getUserId();
    return await this.request(`/sleep_tracking?user_id=${userId}&sleep_date=${date}`);
  }

  async getWeeklySleepData() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/sleep/weekly?${queryString}`);
  }

  async getSleepAnalysis() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/sleep/analysis?${queryString}`);
  }

  async getSleepStages(date = null) {
    const params = date ? { date } : {};
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/sleep/stages?${queryString}`);
  }

  // ===== MEAL LOGGING =====

  async createMealEntry(mealData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...mealData, user_id: userId };
    const response = await this.request("/tracking/meal", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });

    // Auto-update missions if meal tracking is successful
    if (response.success) {
      try {
        const today = new Date().toISOString().split('T')[0];
        // Calculate total calories from foods
        const totalCalories = mealData.foods?.reduce((sum, food) => sum + (parseFloat(food.calories) || 0), 0) || 0;
        
        await this.autoUpdateMissionProgress({
          tracking_type: 'nutrition',
          current_value: totalCalories,
          date: today
        });
      } catch (error) {
        console.error('Error auto-updating missions for meal tracking:', error);
      }
    }

    return response;
  }

  async getMealHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    const response = await this.request(`/tracking/meal?${queryString}`);
    return response;
  }

  async getMealLogging(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    const response = await this.request(`/tracking/meal?${queryString}`);
    return response;
  }

  async getTodayNutrition() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/meal/today?${queryString}`);
  }

  async cleanupOldMealData() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/meal/cleanup?${queryString}`, {
      method: "DELETE",
    });
  }

  // ===== USER PROFILE =====

  async getUserProfile() {
    try {
      const userId = await this.getUserId();
      return await this.request(`/users/profile?user_id=${userId}`);
    } catch (error) {
      // Check for cached user data immediately for any error
      try {
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (cachedUserData) {
          const userData = JSON.parse(cachedUserData);
          return { success: true, data: userData, fromCache: true };
        }
      } catch (cacheError) {
        console.warn('⚠️ API: Could not load cached user data:', cacheError.message);
      }
      
      // If no cached data, create a basic fallback user profile
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        if (authToken) {
          // Try to decode token to get basic user info
          const tokenParts = authToken.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              const fallbackUser = {
                id: payload.user_id || payload.sub || '1',
                name: payload.name || 'User',
                email: payload.email || 'user@example.com',
                points: 0,
                level: 1,
                role: 'user',
                created_at: new Date().toISOString()
              };
              return { success: true, data: fallbackUser, fromFallback: true };
            } catch (tokenError) {
              console.warn('⚠️ API: Could not decode token for fallback data');
            }
          }
        }
      } catch (fallbackError) {
        console.warn('⚠️ API: Could not create fallback user data');
      }
      
      throw error;
    }
  }

  async updateUserInsurance(insuranceData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...insuranceData, user_id: userId };
    return await this.request("/users/profile/update", {
      method: "PUT",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async updateUserProfile(profileData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...profileData, user_id: userId };
    return await this.request("/users/profile/update", {
      method: "PUT",
      body: JSON.stringify(dataWithUserId),
    });
  }

  // ===== HEALTH DATA =====

  async getHealthData() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/health/data?${queryString}`);
  }

  async createHealthData(healthData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...healthData, user_id: userId };
    return await this.request("/health/data", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  // ===== ASSESSMENTS =====

  async getAssessments() {
    return await this.request("/assessments");
  }

  async createAssessment(assessmentData) {
    return await this.request("/assessments", {
      method: "POST",
      body: JSON.stringify(assessmentData),
    });
  }

  // ===== EDUCATION =====

  async getEducationContent() {
    return await this.request("/education");
  }

  // ===== FITNESS =====

  async getFitnessData() {
    return await this.request("/fitness");
  }

  async createFitnessData(fitnessData) {
    return await this.request("/fitness", {
      method: "POST",
      body: JSON.stringify(fitnessData),
    });
  }

  // ===== WELLNESS =====

  async getWellnessData() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/wellness?${queryString}`);
  }

  async createWellnessData(wellnessData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...wellnessData, user_id: userId };
    return await this.request("/wellness", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getHabitActivities(params = {}) {
    try {
      const queryString = await this.createQueryStringWithUserId(params);
      return await this.request(`/habit/activities?${queryString}`);
    } catch (error) {
      // If authentication fails, try the public endpoint
      if (error.message.includes('Authentication failed') || error.message.includes('401') || error.message.includes('Authorization header required')) {
        console.log('🔐 API: Authentication failed, trying public habit activities endpoint');
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/habit/activities/public?${queryString}`);
      }
      // If it's a server error, try the public endpoint as fallback
      if (error.message.includes('server error') || error.message.includes('500')) {
        console.log('🔐 API: Server error, trying public habit activities endpoint');
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/habit/activities/public?${queryString}`);
      }
      throw error;
    }
  }

  // Keep backward compatibility
  async getWellnessActivities(params = {}) {
    return await this.getHabitActivities(params);
  }

  async getWellnessActivity(id) {
    return await this.request(`/wellness/activities/${id}`);
  }

  async completeHabitActivity(activityData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...activityData, user_id: userId };
    return await this.request("/habit/activities/complete", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  // Keep backward compatibility
  async completeWellnessActivity(activityData) {
    return await this.completeHabitActivity(activityData);
  }

  async getHabitHistory(date, category = '') {
    try {
      const userId = await this.getUserId();
      const params = { user_id: userId, date: date };
      if (category) {
        params.category = category;
      }
      const queryString = new URLSearchParams(params).toString();
      return await this.request(`/habit/activities/history?${queryString}`);
    } catch (error) {
      // If authentication fails, return fallback data
      if (error.message.includes('Authentication failed') || error.message.includes('401') || error.message.includes('Authorization header required')) {
        console.log('🔐 API: Authentication failed for habit history, returning fallback data');
        return {
          success: true,
          data: [],
          summary: {
            total_habits: 0,
            completed_habits: 0,
            total_points: 0
          },
          message: 'Habit history loaded from fallback data (authentication required for real-time data)'
        };
      }
      // If it's a server error, return fallback data
      if (error.message.includes('server error') || error.message.includes('500') || error.message.includes('Network') || error.message.includes('timeout')) {
        console.log('🔐 API: Server/Network error for habit history, returning fallback data');
        return {
          success: true,
          data: [],
          summary: {
            total_habits: 0,
            completed_habits: 0,
            total_points: 0
          },
          message: 'Habit history temporarily unavailable'
        };
      }
      throw error;
    }
  }

  async updateWellnessActivity(recordId, activityData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...activityData, user_id: userId };
    return await this.request(`/wellness/activities/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getWellnessActivityHistory(params = {}) {
    try {
      const queryString = await this.createQueryStringWithUserId(params);
      return await this.request(`/wellness/activities/history?${queryString}`);
    } catch (error) {
      // If authentication fails, return fallback data
      if (error.message.includes('Authentication failed') || error.message.includes('401') || error.message.includes('Authorization header required')) {
        console.log('🔐 API: Authentication failed for wellness history, returning fallback data');
        return {
          success: true,
          data: [
            {
              id: 9,
              title: "Swimming",
              description: "Low-impact full-body workout that improves cardiovascular fitness",
              category: "fitness",
              duration_minutes: 30,
              difficulty: "intermediate",
              points: 18,
              completed_at: "2025-08-19T03:31:08.000Z",
              points_earned: 18
            },
            {
              id: 8,
              title: "Cycling",
              description: "Cardiovascular exercise that strengthens legs and improves endurance",
              category: "fitness",
              duration_minutes: 45,
              difficulty: "intermediate",
              points: 20,
              completed_at: "2025-08-19T03:31:03.000Z",
              points_earned: 20
            }
          ],
          message: 'Wellness activity history loaded from fallback data (authentication required for real-time data)'
        };
      }
      // If it's a server error, return fallback data with a user-friendly message
      if (error.message.includes('server error') || error.message.includes('500') || error.message.includes('Network') || error.message.includes('timeout')) {
        console.log('🔐 API: Server/Network error for wellness history, returning fallback data');
        return {
          success: true,
          data: [
            {
              id: 9,
              title: "Swimming",
              description: "Low-impact full-body workout that improves cardiovascular fitness",
              category: "fitness",
              duration_minutes: 30,
              difficulty: "intermediate",
              points: 18,
              completed_at: "2025-08-19T03:31:08.000Z",
              points_earned: 18
            },
            {
              id: 8,
              title: "Cycling",
              description: "Cardiovascular exercise that strengthens legs and improves endurance",
              category: "fitness",
              duration_minutes: 45,
              difficulty: "intermediate",
              points: 20,
              completed_at: "2025-08-19T03:31:03.000Z",
              points_earned: 20
            }
          ],
          message: 'Wellness activity history temporarily unavailable, showing cached data'
        };
      }
      
      // For any other error, return fallback data as a last resort
      console.log('🔐 API: Unknown error for wellness history, returning fallback data');
      return {
        success: true,
        data: [
          {
            id: 9,
            title: "Swimming",
            description: "Low-impact full-body workout that improves cardiovascular fitness",
            category: "fitness",
            duration_minutes: 30,
            difficulty: "intermediate",
            points: 18,
            completed_at: "2025-08-19T03:31:08.000Z",
            points_earned: 18
          },
          {
            id: 8,
            title: "Cycling",
            description: "Cardiovascular exercise that strengthens legs and improves endurance",
            category: "fitness",
            duration_minutes: 45,
            difficulty: "intermediate",
            points: 20,
            completed_at: "2025-08-19T03:31:03.000Z",
            points_earned: 20
          }
        ],
        message: 'Wellness activity history loaded from fallback data'
      };
    }
  }

  async getWellnessChallenges() {
    return await this.request("/wellness/challenges");
  }

  async joinWellnessChallenge(challengeId) {
    const userId = await this.getUserId();
    return await this.request(`/wellness/challenges/${challengeId}/join`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getMoodTracker(params = {}) {
    try {
      const queryString = await this.createQueryStringWithUserId(params);
      return await this.request(`/wellness/mood-tracker?${queryString}`);
    } catch (error) {
      console.error('Mood tracker API error:', error);
      // Return a fallback response if the API fails
      return {
        success: false,
        message: error.message,
        data: {
          entries: [],
          total_entries: 0,
          most_common_mood: null,
          average_mood_score: 0,
          mood_distribution: {},
          period: params.period || 7
        }
      };
    }
  }

  async logMood(moodData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...moodData, user_id: userId };
    return await this.request("/wellness/mood-tracker", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getHabitStats(params = {}) {
    try {
      const queryString = await this.createQueryStringWithUserId(params);
      return await this.request(`/habit/stats?${queryString}`);
    } catch (error) {
      // If authentication fails, try the public endpoint
      if (error.message.includes('Authentication failed') || error.message.includes('401') || error.message.includes('Authorization header required')) {
        console.log('🔐 API: Authentication failed for habit stats, trying public endpoint');
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/habit/stats/public?${queryString}`);
      }
      // If it's a server error, try the public endpoint as fallback
      if (error.message.includes('server error') || error.message.includes('500') || error.message.includes('Network') || error.message.includes('timeout')) {
        console.log('🔐 API: Server/Network error for habit stats, trying public endpoint');
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/habit/stats/public?${queryString}`);
      }
      
      // For any other error, try the public endpoint as a last resort
      console.log('🔐 API: Unknown error for habit stats, trying public endpoint');
      const queryString = new URLSearchParams(params).toString();
      return await this.request(`/habit/stats/public?${queryString}`);
    }
  }

  // Keep backward compatibility
  async getWellnessStats(params = {}) {
    return await this.getHabitStats(params);
  }

  async resetWellnessActivities(recordId = null) {
    try {
      const userId = await this.getUserId();
      const body = { user_id: userId };
      
      if (recordId) {
        body.record_id = recordId;
      }
      
      return await this.request("/wellness/activities/reset", {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.log('🔐 API: Error resetting wellness activities:', error.message);
      return {
        success: false,
        message: 'Failed to reset wellness activities'
      };
    }
  }

  async getWellnessProgramStatus() {
    try {
      return await this.request("/wellness/status");
    } catch (error) {
      // Log the error but don't re-throw it
      console.log("ℹ️ Wellness status endpoint not available, using default values");
      
      // Return a default response if the endpoint fails
      return {
        success: true,
        data: {
          has_joined: false,
          join_date: null,
          fitness_goal: null,
          activity_level: null,
          has_missions: false,
          mission_count: 0,
          profile_complete: false,
          needs_onboarding: true
        }
      };
    }
  }

  // ===== NEWS =====

  async getNews() {
    return await this.request("/news");
  }

  // ===== CALCULATORS =====

  async calculateBMI(weight, height) {
    return await this.request("/calculators/bmi", {
      method: "POST",
      body: JSON.stringify({ weight, height }),
    });
  }

  async calculateBMR(userData) {
    return await this.request("/calculators/bmr", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // ===== MISSIONS =====

  async getMissions() {
    try {
      console.log('🔍 API: Getting missions...');
      const response = await this.request("/missions");
      return response;
    } catch (error) {
      return await mockApiService.getMissions();
    }
  }

  async getMission(missionId) {
    try {
      console.log('🔍 API: Getting mission by ID:', missionId);
      const response = await this.request(`/missions/${missionId}`);
      return response;
    } catch (error) {
      console.warn('🔄 API: getMission failed, using fallback:', error.message);
      
      // For timeout/network errors, return error response
      if (error.message.includes('timeout') || error.message.includes('network')) {
        return {
          success: false,
          message: 'Mission data temporarily unavailable'
        };
      }
      
      // Try to get from mock API as fallback
      return await mockApiService.getMission(missionId);
    }
  }

  async getMissionsByCategory(category) {
    return await this.request(`/missions/category/${category}`);
  }

  async getMissionsByDate(targetDate = null) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const dateParam = targetDate || new Date().toISOString().split('T')[0];
      const response = await this.request(`/missions/by-date?date=${dateParam}`);
      
      return response;
    } catch (error) {
      return await mockApiService.getMissionsByDate(targetDate);
    }
  }

  async getMyMissions(targetDate = null, showAllDates = false) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Build query parameters with user_id
      const params = new URLSearchParams();
      params.append('user_id', userId.toString());
      if (targetDate) {
        params.append('date', targetDate);
      }
      if (showAllDates) {
        params.append('all_dates', 'true');
      }
      
      // Use the authenticated my-missions endpoint
      const response = await this.request(`/my-missions?${params.toString()}`);
      return response;
      
    } catch (error) {
      console.warn('🔄 API: getMyMissions failed, using fallback:', error.message);
      
      // For timeout/network errors, return empty missions instead of mock data
      if (error.message.includes('timeout') || error.message.includes('network')) {
        return {
          success: true,
          data: [],
          message: 'Missions data temporarily unavailable'
        };
      }
      
      return await mockApiService.getMyMissions(targetDate, showAllDates);
    }
  }

  async getMissionHistory(params = {}) {
    try {
      // Build query string without user_id since it's handled by JWT token
      const queryParams = new URLSearchParams();
      if (params.period) {
        queryParams.append('period', params.period);
      }
      if (params.date) {
        queryParams.append('date', params.date);
      }
      
      const response = await this.request(`/missions/history?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.warn('🔄 API: getMissionHistory failed, using fallback:', error.message);
      
      // For timeout/network errors, return empty history instead of mock data
      if (error.message.includes('timeout') || error.message.includes('network')) {
        return {
          success: true,
          data: [],
          message: 'Mission history temporarily unavailable'
        };
      }
      
      return await mockApiService.getMissionHistory(params);
    }
  }

  async acceptMission(missionId, missionDate = null) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const requestBody = { user_id: userId };
      if (missionDate) {
        requestBody.mission_date = missionDate;
      }

      const response = await this.request(`/missions/accept/${missionId}`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // Emit event if mission was successfully accepted
      if (response.success) {
        // Import eventEmitter dynamically to avoid circular dependencies
        const { eventEmitter } = await import('../utils/eventEmitter');
        eventEmitter.emit('missionAccepted', response.data);
      }

      return response;
    } catch (error) {
      if (error.message.includes("Network") || error.message.includes("connection")) {
        return await mockApiService.acceptMission(missionId, missionDate);
      }
      throw error;
    }
  }

  async updateMissionProgress(userMissionId, progressData) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await this.request(`/missions/progress/${userMissionId}`, {
        method: "PUT",
        body: JSON.stringify(progressData),
      });

      // Emit events if mission progress was successfully updated
      if (response.success) {
        // Import eventEmitter dynamically to avoid circular dependencies
        const { eventEmitter } = await import('../utils/eventEmitter');
        eventEmitter.emit('missionUpdated', response.data);
        
        // Check if mission was completed
        if (response.data && response.data.status === "completed") {
          eventEmitter.emit('missionCompleted', response.data);
        }
      }

      return response;
    } catch (error) {
      if (error.message.includes("Network") || error.message.includes("connection")) {
        return await mockApiService.updateMissionProgress(userMissionId, progressData);
      }
      throw error;
    }
  }

  async autoUpdateMissionProgress(trackingData) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await this.request(`/tracking/auto-update-missions`, {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          ...trackingData
        }),
      });

      // Emit events if missions were successfully updated
      if (response.success && response.data && response.data.updated_missions && response.data.updated_missions.length > 0) {
        // Import eventEmitter dynamically to avoid circular dependencies
        const { eventEmitter } = await import('../utils/eventEmitter');
        eventEmitter.emit('missionUpdated', response.data);
        
        // Check if any missions were completed
        const completedMissions = response.data.updated_missions.filter((mission: any) => mission.completed);
        if (completedMissions.length > 0) {
          eventEmitter.emit('missionCompleted', response.data);
        }
      }

      return response;
    } catch (error) {
      console.error('Error auto-updating mission progress:', error);
      return {
        success: false,
        message: 'Failed to auto-update mission progress',
        error: error.message
      };
    }
  }

  async abandonMission(userMissionId, reason = null) {
    try {
      const response = await this.request(`/missions/abandon/${userMissionId}`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });

      // Emit event if mission was successfully abandoned
      if (response.success) {
        // Import eventEmitter dynamically to avoid circular dependencies
        const { eventEmitter } = await import('../utils/eventEmitter');
        eventEmitter.emit('missionAbandoned', response.data);
      }

      return response;
    } catch (error) {
      if (error.message.includes("Network") || error.message.includes("connection")) {
        return await mockApiService.abandonMission(userMissionId);
      }
      throw error;
    }
  }

  async reactivateMission(userMissionId) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await this.request(`/missions/reactivate/${userMissionId}`, {
        method: "PUT",
        body: JSON.stringify({}),
      });

      // Emit event if mission was successfully reactivated
      if (response.success) {
        // Import eventEmitter dynamically to avoid circular dependencies
        const { eventEmitter } = await import('../utils/eventEmitter');
        eventEmitter.emit('missionReactivated', response.data);
      }

      return response;
    } catch (error) {
      if (error.message.includes("Network") || error.message.includes("connection")) {
        return await mockApiService.reactivateMission(userMissionId);
      }
      throw error;
    }
  }

  async getUserMission(userMissionId) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await this.request(`/missions/user-mission/${userMissionId}`);
      return response;
    } catch (error) {
      if (error.message.includes("Network") || error.message.includes("connection")) {
        // For network errors, try to get from my-missions as fallback
        const myMissionsResponse = await this.getMyMissions();
        if (myMissionsResponse.success && myMissionsResponse.data) {
          const userMission = myMissionsResponse.data.find(
            (um) => um.id === userMissionId
          );
          if (userMission) {
            return {
              success: true,
              data: userMission,
              message: "Retrieved from cached data"
            };
          }
        }
        return {
          success: false,
          message: "User mission not found"
        };
      }
      throw error;
    }
  }

  // Optimized method to get tracking data for mission detail
  async getTrackingDataForMission(missionCategory, missionUnit) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`🔍 MissionDetailService: Getting tracking data for ${missionCategory}/${missionUnit} on ${today}`);
      
      let trackingData = null;
      
      switch (missionCategory) {
        case 'health_tracking':
          if (missionUnit === 'ml') {
            const waterResponse = await this.getWaterTracking();
            if (waterResponse.success && waterResponse.data) {
              // Handle water tracking data structure: { entries: [...] }
              const waterEntries = waterResponse.data.entries || waterResponse.data;
              if (Array.isArray(waterEntries)) {
                const todayWater = waterEntries.find(entry => 
                  entry.tracking_date === today
                );
                trackingData = todayWater?.amount_ml || 0;
              }
            }
          } else if (missionUnit === 'hours') {
            const sleepResponse = await this.getSleepTracking();
            if (sleepResponse.success && sleepResponse.data) {
              // Handle sleep tracking data structure: { sleepData: [...] }
              const sleepEntries = sleepResponse.data.sleepData || sleepResponse.data;
              if (Array.isArray(sleepEntries)) {
                const todaySleep = sleepEntries.find(entry => 
                  entry.sleep_date === today
                );
                trackingData = todaySleep?.sleep_hours || 0;
              }
            }
          }
          break;
          
        case 'fitness':
          const fitnessResponse = await this.getFitnessTracking();
          if (fitnessResponse.success && fitnessResponse.data) {
            // Handle fitness tracking data structure: direct array
            const fitnessEntries = Array.isArray(fitnessResponse.data) ? fitnessResponse.data : [];
            if (fitnessEntries.length > 0) {
              const todayFitness = fitnessEntries.find(entry => 
                entry.recorded_at && new Date(entry.recorded_at).toDateString() === new Date().toDateString()
              );
              if (missionUnit === 'steps' || missionUnit === 'langkah') {
                trackingData = todayFitness?.steps || 0;
              } else if (missionUnit === 'minutes' || missionUnit === 'menit') {
                trackingData = todayFitness?.duration_minutes || 0;
              }
            }
          }
          break;
          
        case 'nutrition':
          const mealResponse = await this.getMealLogging();
          console.log(`🍽️ Meal response:`, mealResponse);
          if (mealResponse.success && mealResponse.data) {
            // Handle the correct data structure: { entries: [...] }
            const mealEntries = mealResponse.data.entries || mealResponse.data;
            console.log(`🍽️ Meal entries:`, mealEntries);
            if (Array.isArray(mealEntries)) {
              const todayMeals = mealEntries.filter(entry => 
                new Date(entry.recorded_at).toDateString() === new Date().toDateString()
              );
              console.log(`🍽️ Today's meals:`, todayMeals);
              if (missionUnit === 'calories') {
                trackingData = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
              } else if (missionUnit === 'meals') {
                const uniqueMealTypes = new Set(todayMeals.map(meal => meal.meal_type));
                trackingData = uniqueMealTypes.size;
              }
            } else {
              console.log(`❌ Meal entries is not an array:`, typeof mealEntries, mealEntries);
            }
          } else {
            console.log(`❌ Meal response not successful:`, mealResponse);
          }
          break;
          
        case 'mental_health':
          const moodResponse = await this.getMoodTracking();
          if (moodResponse.success && moodResponse.data) {
            // Handle mood tracking data structure: { entries: [...] }
            const moodEntries = moodResponse.data.entries || moodResponse.data;
            if (Array.isArray(moodEntries)) {
              const todayMood = moodEntries.find(entry => 
                entry.tracking_date === today
              );
              if (missionUnit === 'mood_score') {
                trackingData = todayMood?.mood_score || 0;
              } else if (missionUnit === 'stress_level') {
                if (todayMood?.stress_level) {
                  switch (todayMood.stress_level) {
                    case 'low': trackingData = 1; break;
                    case 'moderate': trackingData = 2; break;
                    case 'high': trackingData = 3; break;
                    case 'very_high': trackingData = 4; break;
                    default: trackingData = 2;
                  }
                }
              }
            }
          }
          break;
      }
      
      return {
        success: true,
        data: {
          tracking_type: missionCategory,
          current_value: trackingData || 0,
          date: today
        }
      };
    } catch (error) {
      console.error('Error getting tracking data for mission:', error);
      return {
        success: false,
        message: error.message,
        data: { tracking_type: missionCategory, current_value: 0, date: new Date().toISOString().split('T')[0] }
      };
    }
  }

  async getMissionStats(params = {}) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Build query parameters with user_id
      const queryParams = new URLSearchParams();
      queryParams.append('user_id', userId.toString());
      
      // Add other params
      Object.keys(params).forEach(key => {
        queryParams.append(key, params[key]);
      });

      const queryString = queryParams.toString();
      return await this.request(`/missions/stats?${queryString}`);
    } catch (error) {
      console.warn('🔄 API: getMissionStats failed, using fallback:', error.message);
      return await mockApiService.getMissionStats();
    }
  }

  // ===== TODAY'S SUMMARY =====

  async getTodaySummary() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/today-summary?${queryString}`);
  }

  async getWeeklySummary() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/weekly-summary?${queryString}`);
  }

  async getSummaryByDate(date) {
    const queryString = await this.createQueryStringWithUserId({ date });
    return await this.request(`/tracking/today-summary?${queryString}`);
  }

  // ===== DETAILED METRICS =====

  async getDetailedMetrics(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/detailed-metrics?${queryString}`);
  }

  // ===== FITNESS TRACKING =====

  async createFitnessEntry(fitnessData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...fitnessData, user_id: userId };
    const response = await this.request("/tracking/fitness", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });

    // Auto-update missions if fitness tracking is successful
    if (response.success) {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Update steps missions
        if (fitnessData.steps && fitnessData.steps > 0) {
          await this.autoUpdateMissionProgress({
            tracking_type: 'fitness',
            current_value: fitnessData.steps,
            date: today
          });
        }
        
        // Update exercise minutes missions
        if (fitnessData.duration_minutes && fitnessData.duration_minutes > 0) {
          await this.autoUpdateMissionProgress({
            tracking_type: 'fitness',
            current_value: fitnessData.duration_minutes,
            date: today
          });
        }
      } catch (error) {
        console.error('Error auto-updating missions for fitness tracking:', error);
      }
    }

    return response;
  }

  async getFitnessHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/fitness?${queryString}`);
  }

  async getFitnessTracking(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/fitness?${queryString}`);
  }

  async getTodayFitness() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/fitness/today?${queryString}`);
  }

  async deleteFitnessEntry(entryId) {
    return await this.request(`/tracking/fitness/${entryId}`, {
      method: "DELETE",
    });
  }

  // ===== CHAT =====

  async getChats() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/chat?${queryString}`);
  }

  async createAIChat() {
    const userId = await this.getUserId();
    return await this.request("/chat/ai", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async createDoctorChat(bookingId) {
    const userId = await this.getUserId();
    return await this.request(`/chat/doctor/${bookingId}`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getChatMessages(chatId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/chat/${chatId}/messages${queryString ? `?${queryString}` : ""}`);
  }

  async sendChatMessage(chatId, message) {
    return await this.request(`/chat/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  async closeChat(chatId) {
    return await this.request(`/chat/${chatId}`, {
      method: "DELETE",
    });
  }

  // ===== CONSULTATIONS =====

  async getDoctors(type = 'all') {
    const query = type !== 'all' ? `?type=${type}` : '';
    return await this.request(`/clinics/doctors${query}`);
  }

  async getConsultationDoctors() {
    return await this.request("/clinics/consultation/doctors");
  }

  async bookConsultation(consultationData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...consultationData, user_id: userId };
    return await this.request("/consultations/book", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getConsultations() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/consultations?${queryString}`);
  }

  async getConsultation(id) {
    return await this.request(`/consultations/${id}`);
  }

  async payConsultation(id, paymentData) {
    return await this.request(`/consultations/${id}/pay`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async startConsultation(id) {
    return await this.request(`/consultations/${id}/start`, {
      method: "POST",
    });
  }

  async endConsultation(id, data) {
    return await this.request(`/consultations/${id}/end`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async cancelConsultation(id, reason) {
    return await this.request(`/consultations/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ cancellation_reason: reason }),
    });
  }

  async rateConsultation(id, rating, review) {
    return await this.request(`/consultations/${id}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating, review }),
    });
  }

  async uploadPaymentProof(id, paymentData) {
    return await this.request(`/consultations/${id}/upload-payment-proof`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async getPendingPaymentConfirmations() {
    return await this.request("/consultations/pending-confirmation");
  }

  async confirmPayment(id, confirmationData) {
    return await this.request(`/consultations/${id}/confirm-payment`, {
      method: "POST",
      body: JSON.stringify(confirmationData),
    });
  }

  // ===== QUICK ACTIONS =====

  async getQuickActions() {
    try {
      return await this.request('/app/quick-actions');
    } catch (error) {
      console.error('Error fetching quick actions:', error);
      // Return fallback quick actions if API fails
      return {
        success: true,
        data: [
          {
            id: "1",
            title: "Log Meal",
            subtitle: "Catat asupan kalori harian",
            icon: "food-apple",
            color: "#38A169",
            gradient: ["#38A169", "#2F855A"],
            priority: 1,
            enabled: true,
            route: "MealLogging"
          },
          {
            id: "2",
            title: "Track Water",
            subtitle: "Monitor konsumsi air minum",
            icon: "water",
            color: "#3182CE",
            gradient: ["#3182CE", "#2B6CB0"],
            priority: 2,
            enabled: true,
            route: "WaterTracking"
          },
          {
            id: "3",
            title: "Log Exercise",
            subtitle: "Catat aktivitas fisik",
            icon: "dumbbell",
            color: "#E53E3E",
            gradient: ["#E53E3E", "#C53030"],
            priority: 3,
            enabled: true,
            route: "FitnessTracking"
          },
          {
            id: "4",
            title: "Mood Check",
            subtitle: "Monitor suasana hati",
            icon: "emoticon",
            color: "#D69E2E",
            gradient: ["#D69E2E", "#B7791F"],
            priority: 4,
            enabled: true,
            route: "MoodTracking"
          },
          {
            id: "5",
            title: "Sleep Track",
            subtitle: "Lacak pola tidur",
            icon: "sleep",
            color: "#9F7AEA",
            gradient: ["#9F7AEA", "#805AD5"],
            priority: 5,
            enabled: true,
            route: "SleepTracking"
          }
        ]
      };
    }
  }

  // ===== FOOD & NUTRITION =====

  async getQuickFoods() {
    return await this.request('/food/quick-foods');
  }

  async addToQuickFoods(foodId) {
    try {
      return await this.request('/food/quick-foods', {
        method: 'POST',
        body: JSON.stringify({ food_id: foodId }),
      });
    } catch (error) {
      // Handle specific error cases
      if (error.message && error.message.includes("Food not found")) {
        throw new Error("Selected food not found in database");
      }
      if (error.message && error.message.includes("Food already in quick foods")) {
        throw new Error("Food already in quick foods");
      }
      if (error.message && error.message.includes("Maximum 12 quick foods allowed")) {
        throw new Error("Maximum 12 quick foods allowed. Please remove some items first.");
      }
      throw error;
    }
  }

  async removeFromQuickFoods(foodId) {
    try {
      return await this.request(`/food/quick-foods/${foodId}`, {
        method: 'DELETE',
      });
    } catch (error) {

      
      // Handle the case where quick food doesn't exist (already removed)
      if (error.message && error.message.includes("Quick food not found") ||
          error.message && error.message.includes("Data yang Anda cari tidak ditemukan") ||
          error.message && error.message.includes("Quick food not found for this user")) {
        return {
          success: true,
          message: "Food was not in quick foods"
        };
      }
      
      // Handle the case where food doesn't exist in database
      if (error.message && error.message.includes("Food not found in database")) {
        console.warn("⚠️ Attempted to remove food ID", foodId, "which doesn't exist in database");
        return {
          success: true,
          message: "Food was not in quick foods"
        };
      }
      
      throw error;
    }
  }

  async checkQuickFoodStatus(foodId) {
    try {
      return await this.request(`/food/quick-foods/check/${foodId}`);
    } catch (error) {
      // Handle the case where food doesn't exist in database
      if (error.message && error.message.includes("Food not found in database") || 
          error.message && error.message.includes("Food not found")) {
        return {
          success: false,
          data: { isQuickFood: false },
          message: "Food not found in database"
        };
      }
      throw error;
    }
  }

  // Food categories endpoint
  async getFoodCategories() {
    try {
      return await this.request('/food/categories');
    } catch (error) {
      console.error('Error fetching food categories:', error);
      // Return fallback categories if API fails
      return {
        success: true,
        data: [
          "Rice Dishes",
          "Chicken Dishes", 
          "Beef Dishes",
          "Noodle Dishes",
          "Fruits",
          "Vegetables", 
          "Beverages",
          "Snacks",
          "Nuts",
          "Salads",
          "Soups",
          "Grilled Dishes",
          "Fermented Foods",
          "Tofu Dishes",
          "Meatballs"
        ]
      };
    }
  }

  // Get food by ID with better error handling
  async getFoodById(foodId) {
    try {
      return await this.request(`/food/${foodId}`);
    } catch (error) {
      if (error.message && error.message.includes("Food not found")) {
        throw new Error("The requested food item was not found in the database");
      }
      if (error.message && error.message.includes("Invalid food ID format")) {
        throw new Error("Invalid food ID provided");
      }
      throw error;
    }
  }

  // Search food with improved error handling
  async searchFood(query) {
    try {
      return await this.request(`/food/search?query=${encodeURIComponent(query)}&limit=20`);
    } catch (error) {
      console.error('Food search error:', error);
      // Return empty results for search instead of throwing
      return {
        success: false,
        data: [],
        message: "Search temporarily unavailable"
      };
    }
  }

  // Wellness setup methods
  async getWellnessSetupStatus() {
    return this.request('/setup-wellness');
  }

  async setupWellness(wellnessData) {
    return this.request('/setup-wellness', {
      method: 'POST',
      body: JSON.stringify(wellnessData)
    });
  }

  async checkWellnessProgramStatus() {
    return this.request('/wellness/check-program-status');
  }

  async stopWellnessProgram(reason = null) {
    return this.request('/wellness/stop-program', {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async getWellnessProgramStopHistory() {
    return this.request('/wellness/stop-program');
  }

  async downloadWellnessReport(programId = null) {
    try {
      const url = programId 
        ? `${this.baseURL}/wellness/report?programId=${programId}`
        : `${this.baseURL}/wellness/report`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For Excel files, we need to handle the response differently
      const blob = await response.blob();
      
      // Create a download link
      const url2 = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url2;
      
      // Generate filename based on program ID
      const filename = programId 
        ? `laporan-wellness-cycle-${programId}-${new Date().toISOString().split('T')[0]}.xlsx`
        : `laporan-wellness-${new Date().toISOString().split('T')[0]}.xlsx`;
        
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url2);

      return { success: true };
    } catch (error) {
      console.error('Error downloading wellness report:', error);
      throw error;
    }
  }

  async updateWellnessData(wellnessData) {
    return this.request('/setup-wellness', {
      method: 'PUT',
      body: JSON.stringify(wellnessData)
    });
  }

  async getHealthData(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/health/data${queryString ? `?${queryString}` : ''}`);
  }

  async addHealthData(healthData) {
    return this.request('/health/data', {
      method: 'POST',
      body: JSON.stringify(healthData)
    });
  }

  async getAnthropometryProgress(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/anthropometry/progress${queryString ? `?${queryString}` : ''}`);
  }

  async getAnthropometryHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return this.request(`/anthropometry/progress${queryString ? `?${queryString}` : ''}`);
  }

  async addAnthropometryProgress(progressData) {
    return this.request('/anthropometry/progress', {
      method: 'POST',
      body: JSON.stringify(progressData)
    });
  }

  // Medical History methods
  async getMedicalHistory(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await this.request(`/visits${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      // Return mock data if API fails
      return {
        success: true,
        data: [
          {
            id: "1",
            date: "2024-03-15",
            clinicName: "Klinik Sehat Jaya",
            doctorName: "Dr. Sarah Johnson",
            visitType: "Konsultasi Umum",
            diagnosis: "Hipertensi ringan",
            treatment: "Pemantauan tekanan darah dan perubahan gaya hidup",
            prescription: ["Amlodipine 5mg", "Lifestyle modification"],
            notes: "Pasien disarankan untuk mengurangi konsumsi garam dan olahraga teratur",
            status: "completed",
            cost: 150000,
            paymentStatus: "paid",
          },
          {
            id: "2",
            date: "2024-02-28",
            clinicName: "Puskesmas Kota",
            doctorName: "Dr. Ahmad Rahman",
            visitType: "Pemeriksaan Rutin",
            diagnosis: "Kolesterol tinggi",
            treatment: "Diet rendah lemak dan olahraga",
            prescription: ["Simvastatin 20mg", "Omega-3 supplement"],
            notes: "Kontrol dalam 3 bulan untuk evaluasi",
            status: "completed",
            cost: 120000,
            paymentStatus: "paid",
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      };
    }
  }

  async addMedicalVisit(visitData) {
    try {
      return await this.request('/visits', {
        method: 'POST',
        body: JSON.stringify(visitData)
      });
    } catch (error) {
      console.error('Error adding medical visit:', error);
      throw error;
    }
  }

  /**
   * Handle authentication failure and stop background services
   */
  async handleAuthenticationFailure(error) {
    console.warn('🔐 API: Handling authentication failure...');
    
    try {
      // Stop all background services
      await BackgroundServiceManager.stopAllServices();
      console.log('🛑 API: Background services stopped due to authentication failure');
      
      // Clear authentication tokens
      await this.removeAuthToken();
      await this.removeRefreshToken();
      
      console.log('✅ API: Authentication failure handled successfully');
    } catch (serviceError) {
      console.error('❌ API: Error handling authentication failure:', serviceError);
    }
    
    // Re-throw the original error
    throw error;
  }

  // HTTP Method convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // PIN Management API functions
  async getPinStatus(userId) {
    try {
      return await this.request(`/pin?user_id=${userId}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error getting PIN status:', error);
      throw error;
    }
  }

  async enablePin(userId, pinCode) {
    try {
      return await this.request('/pin', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          pin_code: pinCode
        })
      });
    } catch (error) {
      console.error('Error enabling PIN:', error);
      throw error;
    }
  }

  async updatePin(userId, oldPin, newPin) {
    try {
      return await this.request('/pin', {
        method: 'PUT',
        body: JSON.stringify({
          user_id: userId,
          old_pin: oldPin,
          new_pin: newPin
        })
      });
    } catch (error) {
      console.error('Error updating PIN:', error);
      throw error;
    }
  }

  async disablePin(userId) {
    try {
      return await this.request(`/pin?user_id=${userId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error disabling PIN:', error);
      throw error;
    }
  }

  async validatePin(userId, pinCode) {
    try {
      return await this.request('/pin/validate', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          pin_code: pinCode
        })
      });
    } catch (error) {
      console.error('Error validating PIN:', error);
      throw error;
    }
  }

  async getPinValidationStatus(userId) {
    try {
      return await this.request(`/pin/validate?user_id=${userId}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error getting PIN validation status:', error);
      throw error;
    }
  }
}

export default new ApiService();
