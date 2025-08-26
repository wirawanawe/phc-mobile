import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Fallback Data Manager
 * 
 * Manages fallback data for offline scenarios and network failures
 */

interface FallbackUserData {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  role: string;
  created_at: string;
}

interface FallbackDataOptions {
  useCache?: boolean;
  useToken?: boolean;
  createDefault?: boolean;
}

class FallbackDataManager {
  private static instance: FallbackDataManager;
  
  static getInstance(): FallbackDataManager {
    if (!FallbackDataManager.instance) {
      FallbackDataManager.instance = new FallbackDataManager();
    }
    return FallbackDataManager.instance;
  }

  /**
   * Get user data from fallback sources
   */
  async getUserData(options: FallbackDataOptions = {}): Promise<FallbackUserData | null> {
    const { useCache = true, useToken = true, createDefault = true } = options;

    // 1. Try to get from cache first
    if (useCache) {
      try {
        const cachedData = await AsyncStorage.getItem('userData');
        if (cachedData) {
          const userData = JSON.parse(cachedData);
          console.log('✅ FallbackManager: Using cached user data');
          return userData;
        }
      } catch (error) {
        console.warn('⚠️ FallbackManager: Could not load cached data:', error);
      }
    }

    // 2. Try to extract from auth token
    if (useToken) {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        if (authToken) {
          const userData = this.extractUserFromToken(authToken);
          if (userData) {
            console.log('✅ FallbackManager: Using user data from token');
            return userData;
          }
        }
      } catch (error) {
        console.warn('⚠️ FallbackManager: Could not extract user from token:', error);
      }
    }

    // 3. Create default user data
    if (createDefault) {
      const defaultUser = this.createDefaultUserData();
      console.log('✅ FallbackManager: Using default user data');
      return defaultUser;
    }

    return null;
  }

  /**
   * Extract user data from JWT token
   */
  private extractUserFromToken(token: string): FallbackUserData | null {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        return {
          id: payload.user_id || payload.sub || '1',
          name: payload.name || 'User',
          email: payload.email || 'user@example.com',
          points: payload.points || 0,
          level: payload.level || 1,
          role: payload.role || 'user',
          created_at: payload.created_at || new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('⚠️ FallbackManager: Could not decode token:', error);
    }
    return null;
  }

  /**
   * Create default user data
   */
  private createDefaultUserData(): FallbackUserData {
    return {
      id: '1',
      name: 'User',
      email: 'user@example.com',
      points: 0,
      level: 1,
      role: 'user',
      created_at: new Date().toISOString()
    };
  }

  /**
   * Get wellness data fallback
   */
  getWellnessFallback() {
    return {
      activities: [],
      total: 0,
      message: 'No wellness activities available'
    };
  }

  /**
   * Get tracking data fallback
   */
  getTrackingFallback() {
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

  /**
   * Get missions fallback
   */
  getMissionsFallback() {
    return {
      data: [],
      message: 'No missions available'
    };
  }

  /**
   * Check if data is from fallback
   */
  isFallbackData(data: any): boolean {
    return data && (data.fromFallback || data.fromCache);
  }
}

export default FallbackDataManager.getInstance();
