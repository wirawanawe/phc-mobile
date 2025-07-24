import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Configuration for different environments
const getApiBaseUrl = () => {
  // For development - you can change this based on your setup
  if (__DEV__) {
    // Check if running on Android emulator
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5432/api";
    }

    // Check if running on iOS simulator
    if (Platform.OS === "ios") {
      return "http://localhost:5432/api";
    }

    // For physical device testing - uncomment and use your computer's IP
    // return "http://10.242.250.62:5432/api";

    // Default fallback
    return "http://localhost:5432/api";
  }

  // For production - replace with your actual backend URL
  return "https://your-production-domain.com/api";
};

// Helper function to get local IP address for physical device testing
const getLocalIPAddress = () => {
  // This will be used when testing on physical device
  // You can manually set this or use a library to detect IP
  return "192.168.1.100"; // Replace with your actual IP
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from storage
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  // Set auth token to storage
  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }

  // Remove auth token from storage
  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);

      // Handle network errors specifically
      if (
        error.message === "Network request failed" ||
        error.message.includes("fetch")
      ) {
        throw new Error(
          "Koneksi gagal. Pastikan internet Anda terhubung dan backend berjalan di http://localhost:5432"
        );
      }

      throw error;
    }
  }

  // ===== AUTHENTICATION =====

  async login(email, password) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data.token) {
      await this.setAuthToken(response.data.token);
    }

    return response;
  }

  async register(userData) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      await this.setAuthToken(response.data.token);
    }

    return response;
  }

  async logout() {
    await this.removeAuthToken();
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
    return await this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings() {
    // Use authenticated endpoint to get user's own bookings
    return await this.request("/bookings/my-bookings");
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
    return await this.request("/tracking/mood", {
      method: "POST",
      body: JSON.stringify(moodData),
    });
  }

  async getMoodHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/tracking/mood?${queryString}`);
  }

  // ===== WATER TRACKING =====

  async createWaterEntry(waterData) {
    return await this.request("/tracking/water", {
      method: "POST",
      body: JSON.stringify(waterData),
    });
  }

  async getWaterHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/tracking/water?${queryString}`);
  }

  async getTodayWaterIntake() {
    return await this.request("/tracking/water/today");
  }

  // ===== SLEEP TRACKING =====

  async createSleepEntry(sleepData) {
    return await this.request("/tracking/sleep", {
      method: "POST",
      body: JSON.stringify(sleepData),
    });
  }

  async getSleepHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/tracking/sleep?${queryString}`);
  }

  // ===== MEAL LOGGING =====

  async createMealEntry(mealData) {
    return await this.request("/tracking/meal", {
      method: "POST",
      body: JSON.stringify(mealData),
    });
  }

  async getMealHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/tracking/meal?${queryString}`);
  }

  async getTodayNutrition() {
    return await this.request("/tracking/meal/today");
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
    return await this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // ===== HEALTH DATA =====

  async getHealthData() {
    return await this.request("/health/data");
  }

  async createHealthData(healthData) {
    return await this.request("/health/data", {
      method: "POST",
      body: JSON.stringify(healthData),
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
    return await this.request("/wellness");
  }

  async createWellnessData(wellnessData) {
    return await this.request("/wellness", {
      method: "POST",
      body: JSON.stringify(wellnessData),
    });
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
    return await this.request("/missions");
  }

  async getMissionsByCategory(category) {
    return await this.request(`/missions/category/${category}`);
  }

  async getMyMissions() {
    return await this.request("/missions/my-missions");
  }

  async acceptMission(missionId) {
    return await this.request(`/missions/accept/${missionId}`, {
      method: "POST",
    });
  }

  async updateMissionProgress(userMissionId, progressData) {
    return await this.request(`/missions/progress/${userMissionId}`, {
      method: "PUT",
      body: JSON.stringify(progressData),
    });
  }

  async abandonMission(userMissionId) {
    return await this.request(`/missions/abandon/${userMissionId}`, {
      method: "PUT",
    });
  }

  async getMissionStats() {
    return await this.request("/missions/stats");
  }
}

export default new ApiService();
