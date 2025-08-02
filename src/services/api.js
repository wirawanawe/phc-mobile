import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { handleApiError, withRetry } from "../utils/errorHandler";
import mockApiService from "./mockApi";
import NetworkHelper from "../utils/networkHelper";
import NetworkDiagnostic from "../utils/networkDiagnostic";
import NetworkTest from "../utils/networkTest";

// Configuration for different environments
const getApiBaseUrl = () => {
  // For development - you can change this based on your setup
  if (__DEV__) {
    // Check if running on Android emulator
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000/api/mobile";
    }

    // Check if running on iOS simulator
    if (Platform.OS === "ios") {
      return "http://localhost:3000/api/mobile";
    }

    // For physical device testing - use localhost
    return "http://localhost:3000/api/mobile";
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
      // Try to find the best endpoint using NetworkTest
      const bestEndpoint = await NetworkTest.findBestEndpoint();
      
      if (bestEndpoint) {
        return `${bestEndpoint.endpoint}/api/mobile`;
      } else {
        // Try NetworkDiagnostic
        const diagnostic = await NetworkDiagnostic.diagnoseConnection();
        
        if (diagnostic.status === 'SUCCESS') {
          return `${diagnostic.bestEndpoint}/api/mobile`;
        } else {
          // Fallback to NetworkHelper
          const serverUrl = await NetworkHelper.findBestServer();
          return serverUrl;
        }
      }
    } catch (error) {
      return NetworkHelper.getDefaultURL();
    }
  }
  
  return getApiBaseUrl();
};

class ApiService {
  constructor() {
    this.baseURL = null; // Will be set dynamically
    this.isInitialized = false;
  }

  // Initialize the API service with the best available URL
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.baseURL = await getBestApiUrl();
      console.log('🚀 API Service initialized with URL:', this.baseURL);
      
      // Test connectivity
      const connectivityTest = await testNetworkConnectivity(this.baseURL);
      
      if (connectivityTest.success) {
        this.isInitialized = true;
      } else {
        this.baseURL = null; // Force use of mock API
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Error initializing API service:', error);
      this.baseURL = null; // Force use of mock API
      this.isInitialized = true;
    }
  }

  // Helper method to get user ID from storage
  async getUserId() {
    try {
      const userData = await AsyncStorage.getItem("userData");
      console.log('User data from storage:', userData);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Parsed user data:', user);
        if (user && user.id) {
          return user.id;
        }
      }
      
      // If no user data or invalid user data, use a valid default user ID
      console.log('No valid user data found in storage, using default user ID for testing');
      return 1; // Use Super Admin user ID which exists in database
    } catch (error) {
      console.error('Error getting user ID:', error);
      console.log('Using default user ID for testing');
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

  // Get auth token from storage
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem("authToken");
      return token;
    } catch (error) {
      return null;
    }
  }

  // Get refresh token from storage
  async getRefreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      return refreshToken;
    } catch (error) {
      return null;
    }
  }

  // Set auth token to storage
  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      // Token setting failed
    }
  }

  // Set refresh token to storage
  async setRefreshToken(refreshToken) {
    try {
      await AsyncStorage.setItem("refreshToken", refreshToken);
    } catch (error) {
      // Refresh token setting failed
    }
  }

  // Remove auth token from storage
  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("refreshToken");
    } catch (error) {
      // Token removal failed
    }
  }

  // Refresh access token
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
        return data.data.accessToken;
      } else {
        throw new Error(data.message || "Token refresh failed");
      }
    } catch (error) {
      await this.removeAuthToken();
      await this.removeRefreshToken();
      throw error;
    }
  }

  // Generic request method with automatic token refresh
  async request(endpoint, options = {}) {
    // Ensure API service is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If baseURL is null, use mock API directly
    if (!this.baseURL) {
      return await mockApiService.request(endpoint, options);
    }

    let token = await this.getAuthToken();
    let isRetry = false;

    const makeRequest = async (authToken) => {
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
          ...options.headers,
        },
        ...options,
      };

      // Add timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      config.signal = controller.signal;
      
      try {
        const fullUrl = `${this.baseURL}${endpoint}`;
        console.log('🌐 Making request to:', fullUrl);
        const response = await fetch(fullUrl, config);
        
        clearTimeout(timeoutId);
        
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          // Try to get response text for debugging
          let errorText = "";
          try {
            errorText = await response.text();
          } catch (textError) {
            // Could not read response text
          }
          
          // Handle specific authentication errors
          if (response.status === 401) {
            // Don't retry auth endpoints or if we already tried refreshing
            if (endpoint.includes('/auth/') || isRetry) {
              await this.removeAuthToken();
              throw new Error("Authentication failed. Please login again.");
            }
            
            // Try to refresh token
            try {
              const newToken = await this.refreshAccessToken();
              isRetry = true;
              return await makeRequest(newToken);
            } catch (refreshError) {
              await this.removeAuthToken();
              throw new Error("Authentication failed. Please login again.");
            }
          }
          
          // Handle rate limiting specifically
          if (response.status === 429) {
            throw new Error("Too many requests from this IP, please try again later.");
          }
          
          // Handle server errors
          if (response.status >= 500) {
            throw new Error(`Server error (${response.status}). Please try again later.`);
          }
          
          // Handle client errors
          if (response.status >= 400) {
            // Handle specific 400 errors
            if (response.status === 400) {
              if (errorText.includes("User ID is required")) {
                throw new Error("Please login to access this feature.");
              } else if (errorText.includes("Invalid")) {
                throw new Error("Invalid request. Please try again.");
              }
            }
            
            // Handle 409 Conflict errors specifically for missions
            if (response.status === 409) {
              if (errorText.includes("Mission sudah diterima") || errorText.includes("sudah dalam progress")) {
                throw new Error("Mission sudah diterima dan sedang dalam progress. Silakan cek misi aktif Anda.");
              } else if (errorText.includes("sudah diselesaikan")) {
                throw new Error("Mission sudah diselesaikan. Tidak dapat diperbarui lagi.");
              } else if (errorText.includes("sudah dibatalkan")) {
                throw new Error("Mission sudah dibatalkan. Tidak dapat diperbarui lagi.");
              } else if (errorText.includes("tidak dapat ditinggalkan")) {
                throw new Error("Mission yang sudah diselesaikan tidak dapat ditinggalkan.");
              }
              throw new Error(`Konflik data: ${errorText || response.statusText}`);
            }
            
            throw new Error(`Request failed (${response.status}): ${errorText || response.statusText}`);
          }
          
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        // Check content type before parsing JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          throw new Error("Server returned non-JSON response. Please check backend configuration.");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        
        // If it's a network error, try mock API as fallback
        if (error.message.includes("Network") || error.message.includes("connection") || 
            error.message.includes("fetch") || error.message.includes("timeout")) {
          return await mockApiService.request(endpoint, options);
        }
        
        // Use NetworkHelper to handle network errors
        const networkError = NetworkHelper.handleNetworkError(error);
        throw new Error(networkError.message);
      }
    };

    try {
      return await makeRequest(token);
    } catch (error) {
      // Handle JSON parse errors specifically
      if (error.message.includes("JSON Parse error") || error.message.includes("Unexpected token")) {
        throw new Error("Server returned invalid response format. Please check if backend is running correctly.");
      }

      // Don't re-process authentication errors that we've already handled
      if (error.message === "Authentication failed. Please login again.") {
        throw error; // Re-throw as-is to avoid double processing
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
      // First, test if the server is reachable
      try {
        const healthResponse = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      } catch (healthError) {
      }

      // Use mobile auth endpoint for mobile users
      const response = await fetch(`${this.baseURL}/auth/login`, config);
      
      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
        } catch (textError) {
          // Could not read response text
        }
        
        if (response.status === 401) {
          throw new Error("Invalid credentials");
        }
        
        throw new Error(`Login failed (${response.status}): ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      
      // Store tokens if login was successful
      if (data.success && data.data) {
        const token = data.data.token || data.data.accessToken;
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
      console.error("Login error:", error);
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
        const token = data.data.token || data.data.accessToken;
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

  async getWeeklyWaterIntake(params = {}) {
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
      return await this.request("/missions");
    } catch (error) {
      return await mockApiService.getMissions();
    }
  }

  async getMissionsByCategory(category) {
    return await this.request(`/missions/category/${category}`);
  }

  async getMyMissions() {
    try {
      return await this.request("/my-missions");
    } catch (error) {
      return await mockApiService.getMyMissions();
    }
  }

  async acceptMission(missionId) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await this.request(`/missions/accept/${missionId}`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      });

      return response;
    } catch (error) {
      if (error.message.includes("Network") || error.message.includes("connection")) {
        return await mockApiService.acceptMission(missionId);
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

  async abandonMission(userMissionId) {
    try {
      const response = await this.request("/abandon-mission", {
        method: "POST",
        body: JSON.stringify({ userMissionId }),
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

      const response = await this.request("/reactivate-mission", {
        method: "POST",
        body: JSON.stringify({ userMissionId }),
      });

      return response;
    } catch (error) {
      if (error.message.includes("Network") || error.message.includes("connection")) {
        return await mockApiService.reactivateMission(userMissionId);
      }
      throw error;
    }
  }

  async getMissionStats() {
    try {
      return await this.request("/mission-stats");
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
