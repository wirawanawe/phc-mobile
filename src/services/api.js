import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { handleApiError, withRetry } from "../utils/errorHandler";
import mockApiService from "./mockApi";
import NetworkHelper from "../utils/networkHelper";
import NetworkDiagnostic from "../utils/networkDiagnostic";
import NetworkTest from "../utils/networkTest";
import ConnectionTest from "../utils/connectionTest";
import ConnectionDebugger from "../utils/connectionDebugger";

// Configuration for different environments
const getApiBaseUrl = () => {
  // For development - you can change this based on your setup
  if (__DEV__) {
    // Check if running on Android emulator
    if (Platform.OS === "android") {
      return "http://10.242.90.103:3000/api/mobile";
    }

    // Check if running on iOS simulator
    if (Platform.OS === "ios") {
      return "http://localhost:3000/api/mobile";
    }

    // For physical device testing - use the working server IP
    return "http://10.242.90.103:3000/api/mobile";
  }

  // For production - use your actual API URL
  return "https://your-api-domain.com/api/mobile";
};

// Network connectivity test function
const testNetworkConnectivity = async (baseURL) => {
  try {
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${baseURL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return { success: true, responseTime, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get the best available API URL
const getBestApiUrl = async () => {
  if (__DEV__) {
    try {
      console.log('🔍 Finding best API endpoint...');
      
      // First try the new ConnectionDebugger with optimized testing
      console.log('🔍 Using ConnectionDebugger...');
      const bestEndpoint = await ConnectionDebugger.findWorkingEndpoint();
      
      if (bestEndpoint) {
        console.log('✅ Found working endpoint:', bestEndpoint);
        return `${bestEndpoint}/api/mobile`;
      }
      
      // Fallback to ConnectionTest
      console.log('🔄 Trying ConnectionTest fallback...');
      const platformInfo = ConnectionTest.getPlatformInfo();
      console.log('📱 Platform info:', platformInfo);
      
      const connectionTestEndpoint = await ConnectionTest.findBestEndpoint();
      
      if (connectionTestEndpoint) {
        console.log('✅ Found working endpoint:', connectionTestEndpoint);
        return connectionTestEndpoint;
      }
      
      // Final fallback to NetworkHelper
      console.log('🔄 Trying NetworkHelper fallback...');
      const serverUrl = await NetworkHelper.findBestServer();
      return serverUrl;
    } catch (error) {
      console.log('❌ All connection methods failed, using default URL');
      console.log('❌ Error:', error.message);
      
      // Only run diagnosis if we have time and it's not too expensive
      try {
        const diagnosis = await ConnectionDebugger.diagnoseFullConnection();
        console.log('🔍 Full diagnosis results:', diagnosis);
      } catch (diagnosisError) {
        console.log('❌ Diagnosis failed:', diagnosisError.message);
      }
      
      return getApiBaseUrl();
    }
  }
  
  return getApiBaseUrl();
};

class ApiService {
  constructor() {
    this.baseURL = null; // Will be set dynamically
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // Initialize the API service with the best available URL
  async initialize() {
    console.log('🚀 Initializing API Service...');
    console.log('🔍 Current baseURL:', this.baseURL);
    console.log('🔍 Is initialized:', this.isInitialized);
    
    // Force re-initialization if needed
    if (this.isInitialized && this.baseURL && this.baseURL.includes('10.0.2.2')) {
      console.log('🔄 Forcing re-initialization due to old IP address');
      this.isInitialized = false;
      this.baseURL = null;
    }

    if (this.isInitialized && this.baseURL) {
      console.log('✅ API Service already initialized with URL:', this.baseURL);
      return;
    }

    try {
      console.log('🔍 Getting best API URL...');
      this.baseURL = await getBestApiUrl();
      console.log('🚀 API Service initialized with URL:', this.baseURL);
      
      // Test connectivity with retry mechanism
      console.log('🔍 Testing connectivity...');
      const connectivityTest = await this.testConnectivityWithRetry();
      console.log('📊 Connectivity test result:', connectivityTest);
      
      if (connectivityTest.success) {
        this.isInitialized = true;
        this.retryCount = 0; // Reset retry count on success
        console.log('✅ API Service initialization successful');
      } else {
        console.log('❌ Connectivity test failed, using fallback');
        this.baseURL = null; // Force use of mock API
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ Error initializing API service:', error);
      this.baseURL = null; // Force use of mock API
      this.isInitialized = true;
    }
  }

  // Test connectivity with retry mechanism
  async testConnectivityWithRetry() {
    for (let attempt = 1; attempt <= 2; attempt++) { // Reduced from 3 to 2 attempts
      try {
        console.log(`🔍 Connectivity test attempt ${attempt}/2`);
        const result = await testNetworkConnectivity(this.baseURL);
        
        if (result.success) {
          console.log(`✅ Connectivity test successful on attempt ${attempt}`);
          return result;
        }
        
        if (attempt < 2) {
          console.log(`⏳ Waiting before retry...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Reduced delay
        }
      } catch (error) {
        console.log(`❌ Connectivity test attempt ${attempt} failed:`, error.message);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    return { success: false, error: 'All connectivity tests failed' };
  }

  // Force re-initialization of the API service
  async reinitialize() {
    console.log('🔄 Force re-initializing API Service...');
    this.isInitialized = false;
    this.baseURL = null;
    this.retryCount = 0;
    await this.initialize();
  }

  // Helper method to get user ID from storage with better error handling
  async getUserId() {
    try {
      const userData = await AsyncStorage.getItem("userData");
      console.log('🔍 API: User data from storage:', !!userData);
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('📊 API: Parsed user data:', user);
        
        if (user && user.id) {
          console.log('✅ API: Using user ID from storage:', user.id);
          return user.id;
        }
      }
      
      // If no user data or invalid user data, use a valid default user ID
      console.log('⚠️ API: No valid user data found in storage, using default user ID for testing');
      return 1; // Use Super Admin user ID which exists in database
    } catch (error) {
      console.error('❌ API: Error getting user ID:', error);
      console.log('⚠️ API: Using default user ID for testing');
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
      console.log('🔍 API: Auth token retrieved:', !!token);
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
      console.log('🔍 API: Refresh token retrieved:', !!refreshToken);
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
      console.log('✅ API: Auth token stored successfully');
    } catch (error) {
      console.error('❌ API: Error setting auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  // Set refresh token to storage
  async setRefreshToken(refreshToken) {
    try {
      await AsyncStorage.setItem("refreshToken", refreshToken);
      console.log('✅ API: Refresh token stored successfully');
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
      console.log('✅ API: Auth tokens removed successfully');
    } catch (error) {
      console.error('❌ API: Error removing auth tokens:', error);
    }
  }

  // Remove refresh token from storage
  async removeRefreshToken() {
    try {
      await AsyncStorage.removeItem("refreshToken");
      console.log('✅ API: Refresh token removed successfully');
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

      console.log('🔄 API: Attempting token refresh...');
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
        console.log('✅ API: Token refresh successful');
        return { success: true, data: data.data.accessToken };
      } else {
        throw new Error(data.message || "Token refresh failed");
      }
    } catch (error) {
      console.error('❌ API: Token refresh failed:', error.message);
      await this.removeAuthToken();
      await this.removeRefreshToken();
      throw error;
    }
  }

  // Generic request method with automatic token refresh and retry mechanism
  async request(endpoint, options = {}) {
    // Ensure API service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Force re-initialization if using old IP
    if (this.baseURL && this.baseURL.includes('10.0.2.2')) {
      console.log('🔄 Detected old IP, forcing re-initialization...');
      await this.reinitialize();
    }

    console.log('🌐 API: Making request to:', endpoint);
    console.log('🌐 API: Base URL:', this.baseURL);

    const makeRequest = async (authToken) => {
      try {
        const url = `${this.baseURL}${endpoint}`;
        console.log('🌐 API: Full URL:', url);
        
        const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const config = {
          method: options.method || 'GET',
          headers,
          ...options,
        };

        if (options.body) {
          config.body = options.body;
        }

        console.log('🌐 API: Request config:', {
          method: config.method,
          headers: Object.keys(config.headers),
          hasBody: !!config.body
        });

        const response = await fetch(url, config);
        console.log('🌐 API: Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('❌ API: Response error text:', errorText);
          
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
            throw new Error('Too many requests. Please wait a moment and try again.');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log('🌐 API: Response data keys:', Object.keys(data));
        
        return data;
      } catch (error) {
        console.error('❌ API: Request failed:', error.message);
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
        console.error(`❌ API Request failed (attempt ${attempt}/${this.maxRetries}):`, {
          endpoint,
          baseURL: this.baseURL,
          error: error.message,
          errorType: error.name
        });

        // Handle authentication errors
        if (error.message.includes('Authentication failed') || error.message.includes('401')) {
          console.log('🔄 API: Authentication failed, attempting token refresh...');
          try {
            const refreshResult = await this.refreshAccessToken();
            if (refreshResult.success) {
              console.log('✅ API: Token refresh successful, retrying request...');
              const newToken = await this.getAuthToken();
              return await makeRequest(newToken);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            console.error('❌ API: Token refresh failed:', refreshError.message);
            throw new Error('Authentication failed. Please login again.');
          }
        }

        // Handle JSON parse errors specifically
        if (error.message.includes("JSON Parse error") || error.message.includes("Unexpected token")) {
          throw new Error("Server returned invalid response format. Please check if backend is running correctly.");
        }

        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.error('🌐 Network error detected. Running connection diagnosis...');
          try {
            const diagnosis = await ConnectionDebugger.diagnoseFullConnection();
            console.log('🔍 Connection diagnosis:', diagnosis);
          } catch (diagnosisError) {
            console.error('❌ Diagnosis failed:', diagnosisError.message);
          }
          
          if (attempt < this.maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new Error("Koneksi ke server gagal. Periksa koneksi internet Anda dan pastikan server berjalan.");
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
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Use the new error handler for other errors
        const errorInfo = handleApiError(error, `API Request to ${endpoint}`);
        
        // Re-throw the error with better context
        const enhancedError = new Error(errorInfo.userMessage);
        enhancedError.originalError = error;
        enhancedError.errorInfo = errorInfo;
        
        throw enhancedError;
      }
    }
  }

  // ===== AUTHENTICATION =====

  async login(email, password) {
    // Ensure API service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Use real API instead of mock for now
    // if (__DEV__) {
    //   console.log("🔧 Using mock API for development");
    //   return await mockApiService.login(email, password);
    // }

    // For production, use real API
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    };

    try {
      console.log('🔗 Attempting login to:', `${this.baseURL}/auth/login`);
      
      // Test server connectivity first
      try {
        const healthResponse = await fetch(`${this.baseURL.replace('/api/mobile', '')}/api/health`, {
          method: 'GET',
          timeout: 5000,
        });
        console.log('✅ Server health check passed');
      } catch (healthError) {
        console.log('⚠️ Server health check failed, but continuing with login attempt');
      }

      // Use mobile auth endpoint for mobile users
      const response = await fetch(`${this.baseURL}/auth/login`, config);
      
      console.log('📡 Login response status:', response.status);
      
      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
          console.log('📝 Error response text:', errorText);
        } catch (textError) {
          console.log('❌ Could not read response text');
        }
        
        if (response.status === 401) {
          throw new Error("Invalid credentials");
        } else if (response.status === 404) {
          throw new Error("Login endpoint not found. Please check server configuration.");
        } else if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }
        
        throw new Error(`Login failed (${response.status}): ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      console.log('✅ Login successful, storing tokens...');
      
      // Store tokens if login was successful
      if (data.success && data.data) {
        const token = data.data.accessToken || data.data.token;
        const refreshToken = data.data.refreshToken;
        
        if (token) {
          await this.setAuthToken(token);
          console.log('✅ Access token stored');
          if (refreshToken) {
            await this.setRefreshToken(refreshToken);
            console.log('✅ Refresh token stored');
          }
        }
      }
      
      return data;
      
    } catch (error) {
      console.error("❌ Login error:", error);
      
      // Provide more specific error messages
      if (error.message.includes('Network request failed')) {
        throw new Error("Koneksi ke server gagal. Periksa koneksi internet Anda dan pastikan server berjalan.");
      } else if (error.message.includes('timeout')) {
        throw new Error("Koneksi timeout. Server mungkin sedang sibuk, silakan coba lagi.");
      } else if (error.message.includes('fetch')) {
        throw new Error("Tidak dapat terhubung ke server. Periksa konfigurasi jaringan.");
      }
      
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
          console.log('✅ Access token stored after registration');
          if (refreshToken) {
            await this.setRefreshToken(refreshToken);
            console.log('✅ Refresh token stored after registration');
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

  // ===== MOOD TRACKING =====

  async createMoodEntry(moodData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...moodData, user_id: userId };
    return await this.request("/mood_tracking", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getMoodHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/mood_tracking?${queryString}`);
  }

  // ===== WATER TRACKING =====

  async createWaterEntry(waterData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...waterData, user_id: userId };
    return await this.request("/tracking/water", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getWaterHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/water?${queryString}`);
  }

  async getTodayWaterIntake() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/water/today?${queryString}`);
  }

  async getWeeklyWaterIntakae(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/water/weekly?${queryString}`);
  }

  // ===== SLEEP TRACKING =====

  async createSleepEntry(sleepData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...sleepData, user_id: userId };
    return await this.request("/sleep_tracking", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getSleepHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/sleep_tracking?${queryString}`);
  }

  async getWeeklySleepData() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/sleep_tracking/weekly?${queryString}`);
  }

  async getSleepAnalysis() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/sleep_tracking/analysis?${queryString}`);
  }

  async getSleepStages(date = null) {
    const params = date ? { date } : {};
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/sleep_tracking/stages?${queryString}`);
  }

  // ===== MEAL LOGGING =====

  async createMealEntry(mealData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...mealData, user_id: userId };
    console.log('Creating meal entry with data:', dataWithUserId);
    const response = await this.request("/tracking/meal", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
    console.log('Meal entry response:', response);
    return response;
  }

  async getMealHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    console.log('Getting meal history with params:', params);
    console.log('Query string:', queryString);
    const response = await this.request(`/tracking/meal?${queryString}`);
    console.log('Meal history response:', response);
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
    return await this.request("/auth/me");
  }

  async updateUserInsurance(insuranceData) {
    return await this.request("/auth/insurance", {
      method: "PUT",
      body: JSON.stringify(insuranceData),
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

  async getWellnessActivities(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/wellness/activities?${queryString}`);
  }

  async getWellnessActivity(id) {
    return await this.request(`/wellness/activities/${id}`);
  }

  async completeWellnessActivity(activityData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...activityData, user_id: userId };
    return await this.request("/wellness/activities/complete", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getWellnessActivityHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/wellness/activities/history?${queryString}`);
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
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/wellness/mood-tracker?${queryString}`);
  }

  async logMood(moodData) {
    const userId = await this.getUserId();
    const dataWithUserId = { ...moodData, user_id: userId };
    return await this.request("/wellness/mood-tracker", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getWellnessStats(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/wellness/stats?${queryString}`);
  }

  async getWellnessProgramStatus() {
    try {
      return await this.request("/wellness/status");
    } catch (error) {
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
      console.log('📊 API: Missions response:', response.success ? 'SUCCESS' : 'FAILED', response.missions?.length || 0, 'missions');
      return response;
    } catch (error) {
      console.log('❌ API: Missions request failed, using mock data');
      return await mockApiService.getMissions();
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
      
      console.log('📊 API: Missions by date response:', response.success ? 'SUCCESS' : 'FAILED', response.data?.available_missions?.length || 0, 'available missions');
      return response;
    } catch (error) {
      console.log('❌ API: Missions by date request failed, using mock data');
      return await mockApiService.getMissionsByDate(targetDate);
    }
  }

  async getMyMissions(targetDate = null, showAllDates = false) {
    try {
      const userId = await this.getUserId();
      console.log('🔍 API: Getting my missions for user ID:', userId, 'date:', targetDate, 'all dates:', showAllDates);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (targetDate) {
        params.append('date', targetDate);
      }
      if (showAllDates) {
        params.append('all_dates', 'true');
      }
      
      // Use the authenticated my-missions endpoint
      console.log('🔍 API: Using authenticated endpoint: /my-missions');
      const response = await this.request(`/my-missions?${params.toString()}`);
      console.log('📊 API: My missions response:', response.success ? 'SUCCESS' : 'FAILED', response.data?.length || 0, 'user missions');
      return response;
      
    } catch (error) {
      console.log('❌ API: My missions request failed, using mock data');
      return await mockApiService.getMyMissions(targetDate, showAllDates);
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

      return response;
    } catch (error) {
      if (error.message.includes("Network") || error.message.includes("connection")) {
        return await mockApiService.updateMissionProgress(userMissionId, progressData);
      }
      throw error;
    }
  }

  async abandonMission(userMissionId, reason = null) {
    try {
      const response = await this.request(`/missions/abandon/${userMissionId}`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });

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

      return response;
    } catch (error) {
      if (error.message.includes("Network") || error.message.includes("connection")) {
        return await mockApiService.reactivateMission(userMissionId);
      }
      throw error;
    }
  }

  async getMissionStats(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await this.request(`/mission-stats${queryString ? `?${queryString}` : ""}`);
    } catch (error) {
      return await mockApiService.getMissionStats();
    }
  }

  // ===== TODAY'S SUMMARY =====

  async getTodaySummary() {
    return await this.request("/tracking/today-summary");
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
    return await this.request("/tracking/fitness", {
      method: "POST",
      body: JSON.stringify(dataWithUserId),
    });
  }

  async getFitnessHistory(params = {}) {
    const queryString = await this.createQueryStringWithUserId(params);
    return await this.request(`/tracking/fitness?${queryString}`);
  }

  async getTodayFitness() {
    const queryString = await this.createQueryStringWithUserId();
    return await this.request(`/tracking/fitness/today?${queryString}`);
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
            title: "Auto Fitness",
            subtitle: "Deteksi aktivitas otomatis",
            icon: "radar",
            color: "#38A169",
            gradient: ["#38A169", "#2F855A"],
            priority: 1,
            enabled: true,
            route: "RealtimeFitness"
          },
          {
            id: "2",
            title: "Log Meal",
            subtitle: "Catat asupan kalori harian",
            icon: "food-apple",
            color: "#38A169",
            gradient: ["#38A169", "#2F855A"],
            priority: 2,
            enabled: true,
            route: "MealLogging"
          },
          {
            id: "3",
            title: "Track Water",
            subtitle: "Monitor konsumsi air minum",
            icon: "water",
            color: "#3182CE",
            gradient: ["#3182CE", "#2B6CB0"],
            priority: 3,
            enabled: true,
            route: "WaterTracking"
          },
          {
            id: "4",
            title: "Log Exercise",
            subtitle: "Catat aktivitas fisik",
            icon: "dumbbell",
            color: "#E53E3E",
            gradient: ["#E53E3E", "#C53030"],
            priority: 4,
            enabled: true,
            route: "FitnessTracking"
          },
          {
            id: "5",
            title: "Mood Check",
            subtitle: "Monitor suasana hati",
            icon: "emoticon",
            color: "#D69E2E",
            gradient: ["#D69E2E", "#B7791F"],
            priority: 5,
            enabled: true,
            route: "MoodTracking"
          },
          {
            id: "6",
            title: "Sleep Track",
            subtitle: "Lacak pola tidur",
            icon: "sleep",
            color: "#9F7AEA",
            gradient: ["#9F7AEA", "#805AD5"],
            priority: 6,
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
          error.message && error.message.includes("Data yang Anda cari tidak ditemukan")) {
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
}

export default new ApiService();
