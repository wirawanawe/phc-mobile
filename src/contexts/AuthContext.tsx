import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/api";
import { handleAuthError, handleError, handleSessionExpiration } from "../utils/errorHandler";
import { testNetworkConnectivity } from "../utils/networkTest";
import BackgroundServiceManager from "../utils/backgroundServiceManager";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  points: number;
  level?: number;
  role?: "user" | "admin" | "doctor";
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  socialLogin: (userData: any, token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  refreshAuth: () => Promise<void>;
  setNavigation: (navigation: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper functions for token management with better error handling
const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');

    return token;
  } catch (error) {
    console.error('❌ Auth: Error getting auth token:', error);
    return null;
  }
};

const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
    console.log('✅ Auth: Token stored successfully');
  } catch (error) {
    console.error('❌ Auth: Error setting auth token:', error);
    throw new Error('Failed to store authentication token');
  }
};

const setUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    console.log('✅ Auth: User data stored successfully');
  } catch (error) {
    console.error('❌ Auth: Error setting user data:', error);
    throw new Error('Failed to store user data');
  }
};

const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
    console.log('✅ Auth: All auth data cleared');
  } catch (error) {
    console.error('❌ Auth: Error clearing auth data:', error);
    // Continue even if clearing fails
  }
};

const validateToken = async (token: string): Promise<boolean> => {
  try {

    
    // Ensure API service is initialized
    if (!apiService.isInitialized) {
      console.log('🔄 Auth: Initializing API service...');
      await apiService.initialize();
    }
    
    console.log('🔗 Auth: API URL:', apiService.baseURL);
    
    // Test token validity by making a simple API call using the API service
    const response = await apiService.request('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Auth: Response status:', response.status || 'N/A');
    console.log('📡 Auth: Response success:', response.success);
    
    return response.success;
  } catch (error: any) {
    console.error('❌ Auth: Token validation failed:', error);
    console.error('❌ Auth: Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return false;
  }
};

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.log('❌ Auth: No refresh token available');
      return false;
    }
    
    console.log('🔄 Auth: Attempting token refresh...');
    const response = await apiService.refreshAccessToken();
    
    if (response.success) {
      console.log('✅ Auth: Token refresh successful');
      return true;
    } else {
      console.log('❌ Auth: Token refresh failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Auth: Error refreshing access token:', error);
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ Auth: Loading timeout reached, forcing initialization');
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 5000); // Reduced from 10 to 5 seconds for faster initialization

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  useEffect(() => {
    if (!isInitialized) {
      checkAuthStatus().finally(() => {
        setIsInitialized(true);
        setIsLoading(false);
      });
    }
  }, [isInitialized]);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log("🔍 Auth: Checking authentication status...");
      
      // Test network connectivity first with shorter timeout
      try {
        const networkTest = await testNetworkConnectivity();
        if (!networkTest.success) {
          console.log("⚠️ Auth: Network connectivity issues detected");
        } else {
          console.log("✅ Auth: Network connectivity OK");
        }
      } catch (networkError) {
        console.log("⚠️ Auth: Network test failed, proceeding with cached data");
      }
      
      const token = await getAuthToken();
      
      if (!token) {
        console.log("❌ Auth: No token found, user not authenticated");
        setUser(null);
        return;
      }

      // Validate token before proceeding
      const isTokenValid = await validateToken(token);
      if (!isTokenValid) {
        console.log("❌ Auth: Token is invalid, attempting refresh...");
        const refreshSuccess = await refreshAccessToken();
        
        if (!refreshSuccess) {
          console.log("❌ Auth: Token refresh failed, clearing auth data");
          await clearAuthData();
          setUser(null);
          return;
        }
      }

      // Try to get user profile with timeout and fallback
      try {
        console.log("🔍 Auth: Fetching user profile...");
        const response = await apiService.getUserProfile();
        
        if (response.success && response.data) {
          console.log("✅ Auth: User profile retrieved successfully");
          setUser(response.data);
          
          // Update stored user data if not from cache
          if (!response.fromCache) {
            await setUserData(response.data);
          }
        } else {
          console.log("❌ Auth: Failed to get user profile");
          throw new Error('Failed to get user profile');
        }
      } catch (profileError: any) {
        console.log("❌ Auth: Profile request failed:", profileError.message);
        
        // Only logout if it's an authentication error, not network/timeout errors
        const isAuthError = profileError.message.includes('Authentication failed') || 
                           profileError.message.includes('401') ||
                           profileError.message.includes('Unauthorized') ||
                           profileError.message.includes('Token');
        
        if (isAuthError) {
          console.log("❌ Auth: Authentication error detected, logging out");
          await clearAuthData();
          setUser(null);
          return;
        }
        
        // For network/timeout errors, try to load cached user data as fallback
        try {
          const cachedUserData = await AsyncStorage.getItem('userData');
          if (cachedUserData) {
            const userData = JSON.parse(cachedUserData);
            console.log("🔄 Auth: Loading cached user data due to network error");
            setUser(userData);
          } else {
            console.log("❌ Auth: No cached user data available");
            // Don't logout for network errors, just keep current state
          }
        } catch (cacheError) {
          console.log("❌ Auth: Error loading cached data");
          // Don't logout for cache errors, just keep current state
        }
      }
    } catch (error: any) {
      console.error("❌ Auth: Error checking auth status:", error);
      await clearAuthData();
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
  
      console.log("🔐 Auth: Starting login process...");
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        console.log("✅ Auth: Login successful");
        
        // Store tokens and user data
        const token = response.data.accessToken || response.data.token;
        const refreshToken = response.data.refreshToken;
        
        if (token) {
          await setAuthToken(token);
          if (refreshToken) {
            await AsyncStorage.setItem('refreshToken', refreshToken);
          }
        }
        
        // Store and set user data immediately
        await setUserData(response.data.user);
        setUser(response.data.user);
        
        // Don't wait for additional profile fetch - use the data from login response
        console.log("✅ Auth: Login completed successfully");
        
        return { success: true };
      } else {
        console.log("❌ Auth: Login failed:", response.message);
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error("❌ Auth: Login error:", error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please check your credentials and try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const socialLogin = useCallback(async (userData: any, token: string) => {
    try {
      setIsLoading(true);
  
      
      // Store the social login data
      await setAuthToken(token);
      await setUserData(userData);
      
      setUser(userData);
      console.log("✅ Auth: Social login successful");
      
      return true;
    } catch (error: any) {
      console.error("❌ Auth: Social login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      setIsLoading(true);
  
      
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        console.log("✅ Auth: Registration successful");
        
        // Store tokens and user data
        const token = response.data.accessToken || response.data.token;
        const refreshToken = response.data.refreshToken;
        
        if (token) {
          await setAuthToken(token);
          if (refreshToken) {
            await AsyncStorage.setItem('refreshToken', refreshToken);
          }
        }
        
        // Store and set user data
        await setUserData(response.data.user);
        setUser(response.data.user);
        
        return { success: true };
      } else {
        console.log("❌ Auth: Registration failed:", response.message);
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error("❌ Auth: Registration error:", error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log("🔄 Auth: Starting logout process...");
      
      // Stop all background services first
      try {
        await BackgroundServiceManager.stopAllServices();
      } catch (serviceError) {
        console.log("⚠️ Auth: Error stopping background services:", serviceError);
        // Continue with logout even if stopping services fails
      }
      
      // Try to call logout API
      try {
        await apiService.logout();
      } catch (apiError) {
        console.log("⚠️ Auth: Logout API call failed, continuing with local logout");
      }
      
      // Always clear local data
      await clearAuthData();
      setUser(null);
      
      console.log("✅ Auth: Logout completed");
    } catch (error: any) {
      console.error("❌ Auth: Logout error:", error);
      // Force logout even if there's an error
      await clearAuthData();
      setUser(null);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      console.log("🔄 Auth: Refreshing authentication...");
      await checkAuthStatus();
    } catch (error: any) {
      console.error("❌ Auth: Error refreshing auth:", error);
    }
  }, [checkAuthStatus]);

  const setNavigation = useCallback((navigation: any) => {
    console.log("🔗 Auth: Setting navigation reference for session expiration handling");
    apiService.setNavigation(navigation);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    socialLogin,
    logout,
    register,
    refreshAuth,
    setNavigation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
