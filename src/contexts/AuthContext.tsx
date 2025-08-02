import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/api";
import { handleAuthError, handleError } from "../utils/errorHandler";

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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  socialLogin: (userData: any, token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper functions for token management
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

const setUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }
    
    const response = await apiService.refreshAccessToken();
    return response.success;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 second timeout

    checkAuthStatus().finally(() => {
      clearTimeout(timeoutId);
    });
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log("AuthContext: Checking auth status...");
      const token = await getAuthToken();
      console.log("AuthContext: Token found:", !!token);
      
      if (token) {
        try {
          console.log("AuthContext: Attempting to get user profile...");
          const response = await apiService.getUserProfile();
          console.log("AuthContext: Profile response:", response);
          
          if (response.success) {
            console.log("AuthContext: Setting user data");
            setUser(response.data);
          } else {
            console.log("AuthContext: Profile request failed, trying token refresh");
            throw new Error('Token verification failed');
          }
        } catch (error: unknown) {
          console.log("AuthContext: Profile request error, attempting token refresh");
          try {
            const refreshSuccess = await refreshAccessToken();
            if (refreshSuccess) {
              console.log("AuthContext: Token refresh successful, getting profile again");
              const response = await apiService.getUserProfile();
              if (response.success) {
                console.log("AuthContext: Setting user data after refresh");
                setUser(response.data);
              } else {
                throw new Error('Token refresh failed');
              }
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError: unknown) {
            console.log("AuthContext: Token refresh failed, trying to load cached user data");
            try {
              // Try to load user data from AsyncStorage as fallback
              const cachedUserData = await AsyncStorage.getItem('userData');
              if (cachedUserData) {
                const userData = JSON.parse(cachedUserData);
                console.log("AuthContext: Loading cached user data");
                setUser(userData);
              } else {
                console.log("AuthContext: No cached user data, clearing auth data");
                await clearAuthData();
                setUser(null);
              }
            } catch (storageError: unknown) {
              console.log("AuthContext: Error loading cached data, clearing auth data");
              await clearAuthData();
              setUser(null);
            }
          }
        }
      } else {
        console.log("AuthContext: No token found, user not authenticated");
        setUser(null);
      }
    } catch (error: unknown) {
      console.error("AuthContext: Error checking auth status:", error);
      await clearAuthData();
      setUser(null);
    } finally {
      console.log("AuthContext: Setting loading to false");
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);
      
      if (response.success) {
        // Store user data in AsyncStorage
        await setUserData(response.data.user);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
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
      
      return true;
    } catch (error: unknown) {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success) {
        // Store user data in AsyncStorage
        await setUserData(response.data.user);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error: unknown) {
      // Continue with logout even if API call fails
    } finally {
      await clearAuthData();
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    socialLogin,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
