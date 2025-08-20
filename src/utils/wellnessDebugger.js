/**
 * Wellness App Debugger
 * Helps diagnose issues with accessing the wellness app
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/api";

export const wellnessDebugger = {
  async diagnoseWellnessAccess() {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      authStatus: null,
      tokenStatus: null,
      apiConnection: null,
      userProfile: null,
      wellnessStatus: null,
      issues: [],
      recommendations: []
    };

    console.log("🔍 Wellness Debugger: Starting diagnosis...");

    try {
      // 1. Check authentication token
      console.log("🔍 Step 1: Checking authentication token...");
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        diagnosis.tokenStatus = "NO_TOKEN";
        diagnosis.issues.push("No authentication token found");
        diagnosis.recommendations.push("User needs to login first");
      } else {
        diagnosis.tokenStatus = "TOKEN_EXISTS";
        console.log("✅ Authentication token exists");
      }

      // 2. Check API service initialization
      console.log("🔍 Step 2: Checking API service...");
      try {
        await apiService.initialize();
        diagnosis.apiConnection = "CONNECTED";
        console.log("✅ API service initialized successfully");
      } catch (apiError) {
        diagnosis.apiConnection = "FAILED";
        diagnosis.issues.push(`API connection failed: ${apiError.message}`);
        diagnosis.recommendations.push("Check network connection and server status");
      }

      // 3. Check user profile
      if (token && diagnosis.apiConnection === "CONNECTED") {
        console.log("🔍 Step 3: Checking user profile...");
        try {
          const profileResponse = await apiService.getUserProfile();
          
          if (profileResponse.success && profileResponse.data) {
            diagnosis.userProfile = "VALID";
            diagnosis.authStatus = "AUTHENTICATED";
            console.log("✅ User profile retrieved successfully");
            
            // 4. Check wellness program status
            console.log("🔍 Step 4: Checking wellness program status...");
            try {
              const wellnessResponse = await apiService.getWellnessSetupStatus();
              
              if (wellnessResponse.success) {
                diagnosis.wellnessStatus = wellnessResponse.data;
                console.log("✅ Wellness status retrieved:", wellnessResponse.data);
                
                // Check if user needs onboarding
                if (wellnessResponse.data.needs_setup) {
                  diagnosis.issues.push("User needs to complete wellness onboarding");
                  diagnosis.recommendations.push("Complete the wellness program setup form");
                }
              } else {
                diagnosis.wellnessStatus = "FAILED";
                diagnosis.issues.push("Failed to get wellness status");
                diagnosis.recommendations.push("Try refreshing the app or contact support");
              }
            } catch (wellnessError) {
              diagnosis.wellnessStatus = "ERROR";
              diagnosis.issues.push(`Wellness status error: ${wellnessError.message}`);
              diagnosis.recommendations.push("Check wellness API endpoints");
            }
          } else {
            diagnosis.userProfile = "INVALID";
            diagnosis.authStatus = "UNAUTHENTICATED";
            diagnosis.issues.push("Invalid user profile response");
            diagnosis.recommendations.push("User needs to login again");
          }
        } catch (profileError) {
          diagnosis.userProfile = "ERROR";
          diagnosis.authStatus = "UNAUTHENTICATED";
          diagnosis.issues.push(`Profile error: ${profileError.message}`);
          diagnosis.recommendations.push("User needs to login again");
        }
      }

      // 5. Generate summary
      console.log("🔍 Step 5: Generating diagnosis summary...");
      
      if (diagnosis.issues.length === 0) {
        diagnosis.summary = "✅ No issues detected - wellness app should be accessible";
      } else {
        diagnosis.summary = `❌ ${diagnosis.issues.length} issue(s) detected that may prevent wellness app access`;
      }

      console.log("📊 Wellness Diagnosis Complete:", diagnosis);
      return diagnosis;

    } catch (error) {
      console.error("❌ Wellness Debugger: Unexpected error during diagnosis:", error);
      diagnosis.issues.push(`Unexpected error: ${error.message}`);
      diagnosis.recommendations.push("Contact technical support");
      diagnosis.summary = "❌ Diagnosis failed due to unexpected error";
      return diagnosis;
    }
  },

  async logDetailedWellnessState() {
    console.log("🔍 === WELLNESS APP DETAILED STATE ===");
    
    try {
      // Log authentication state
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      console.log("🔐 Auth Token:", !!token ? "EXISTS" : "MISSING");
      console.log("👤 User Data:", !!userData ? "EXISTS" : "MISSING");
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log("👤 User ID:", user.id);
          console.log("👤 User Name:", user.name);
          console.log("👤 User Email:", user.email);
        } catch (parseError) {
          console.log("❌ User data parse error:", parseError.message);
        }
      }

      // Log API service state
      console.log("🌐 API Base URL:", apiService.baseURL);
      console.log("🌐 API Initialized:", apiService.isInitialized);

      // Test API connection
      if (apiService.isInitialized) {
        try {
          const healthResponse = await fetch(`${apiService.baseURL.replace('/api/mobile', '')}/api/health`);
          console.log("🏥 Health Check Status:", healthResponse.status);
        } catch (healthError) {
          console.log("❌ Health Check Failed:", healthError.message);
        }
      }

    } catch (error) {
      console.error("❌ Error logging wellness state:", error);
    }
    
    console.log("🔍 === END WELLNESS STATE LOG ===");
  },

  async fixCommonIssues() {
    console.log("🔧 Wellness Debugger: Attempting to fix common issues...");
    const fixes = [];

    try {
      // Fix 1: Re-initialize API service
      console.log("🔧 Fix 1: Re-initializing API service...");
      await apiService.initialize();
      fixes.push("API service re-initialized");

      // Fix 2: Clear and refresh auth token if it exists
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        console.log("🔧 Fix 2: Validating auth token...");
        try {
          const profileResponse = await apiService.getUserProfile();
          if (!profileResponse.success) {
            console.log("🔧 Fix 2a: Token seems invalid, clearing auth data...");
            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
            fixes.push("Cleared invalid authentication data");
          } else {
            fixes.push("Authentication token validated successfully");
          }
        } catch (authError) {
          console.log("🔧 Fix 2b: Auth validation failed, clearing auth data...");
          await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
          fixes.push("Cleared invalid authentication data due to validation error");
        }
      }

      console.log("✅ Wellness Debugger: Applied fixes:", fixes);
      return {
        success: true,
        fixes: fixes,
        message: "Common issues have been addressed. Please try accessing wellness app again."
      };

    } catch (error) {
      console.error("❌ Wellness Debugger: Error applying fixes:", error);
      return {
        success: false,
        error: error.message,
        fixes: fixes,
        message: "Some fixes could not be applied"
      };
    }
  }
};

export default wellnessDebugger;
