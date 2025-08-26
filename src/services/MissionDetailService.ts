import apiService from './api';


export interface MissionDetailData {
  mission: any;
  userMission: any;
  lastUpdated?: string;
}

export interface MissionDetailResponse {
  success: boolean;
  message: string;
  data?: MissionDetailData;
  error?: string;
}

class MissionDetailService {
  private cache: Map<string, MissionDetailData> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get mission detail with safe data integration
   */
  async getMissionDetail(missionId: number, userMissionId?: number): Promise<MissionDetailResponse> {
    try {
      // Check cache first
      const cacheKey = `${missionId}_${userMissionId || 'no_user'}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return {
          success: true,
          message: 'Data retrieved from cache',
          data: cachedData
        };
      }

      // Get mission data
      const missionResponse = await this.getMissionData(missionId);
      if (!missionResponse.success) {
        return missionResponse;
      }

      // Get user mission data if userMissionId is provided
      let userMissionData = null;
      if (userMissionId) {
        const userMissionResponse = await this.getUserMissionData(userMissionId);
        if (userMissionResponse.success) {
          userMissionData = userMissionResponse.data;
        }
      }

      const missionDetailData: MissionDetailData = {
        mission: missionResponse.data,
        userMission: userMissionData,
        lastUpdated: new Date().toISOString()
      };

      // Cache the data
      this.cacheData(cacheKey, missionDetailData);

      return {
        success: true,
        message: 'Mission detail retrieved successfully',
        data: missionDetailData
      };

    } catch (error) {
      console.error('❌ MissionDetailService: Error getting mission detail:', error);
      return {
        success: false,
        message: 'Failed to get mission detail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get mission data with validation
   */
  private async getMissionData(missionId: number): Promise<MissionDetailResponse> {
    try {
      const response = await apiService.getMission(missionId);
      
      if (response.success && response.data) {
        // Validate mission data
        const mission = this.validateMissionData(response.data);
        if (!mission) {
          return {
            success: false,
            message: 'Invalid mission data received'
          };
        }

        return {
          success: true,
          message: 'Mission data retrieved successfully',
          data: mission
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to get mission data'
      };

    } catch (error) {
      console.error('❌ MissionDetailService: Error getting mission data:', error);
      return {
        success: false,
        message: 'Failed to get mission data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user mission data with validation and fallback
   */
  private async getUserMissionData(userMissionId: number): Promise<MissionDetailResponse> {
    try {
      // Validate userMissionId
      if (!userMissionId || typeof userMissionId !== 'number' || userMissionId <= 0) {
        console.error('❌ MissionDetailService: Invalid userMissionId:', userMissionId);
        return {
          success: false,
          message: 'Invalid user mission ID'
        };
      }
      
      // First try to get from getUserMission endpoint
      const response = await apiService.getUserMission(userMissionId);
      
      if (response.success && response.data) {
        // Validate user mission data
        const userMission = this.validateUserMissionData(response.data);
        if (!userMission) {
          console.warn('⚠️ MissionDetailService: Invalid user mission data received');
          return {
            success: false,
            message: 'Invalid user mission data received'
          };
        }

        return {
          success: true,
          message: 'User mission data retrieved successfully',
          data: userMission
        };
      }

      // If getUserMission fails, try fallback to my-missions
      return await this.getUserMissionDataFallback(userMissionId);

    } catch (error) {
      console.error('❌ MissionDetailService: Error getting user mission data:', error);
      
      // Try fallback on any error
      return await this.getUserMissionDataFallback(userMissionId);
    }
  }

  /**
   * Fallback method to get user mission data from my-missions
   */
  private async getUserMissionDataFallback(userMissionId: number): Promise<MissionDetailResponse> {
    try {
      const myMissionsResponse = await apiService.getMyMissions();
      
      if (myMissionsResponse.success && myMissionsResponse.data) {
        const userMission = myMissionsResponse.data.find(
          (um: any) => um.id === userMissionId
        );
        
        if (userMission) {
          const validatedUserMission = this.validateUserMissionData(userMission);
          if (validatedUserMission) {
            return {
              success: true,
              message: 'User mission data retrieved from fallback',
              data: validatedUserMission
            };
          } else {
            console.error('❌ MissionDetailService: User mission data validation failed in fallback');
            return {
              success: false,
              message: 'User mission data validation failed'
            };
          }
        } else {
          return {
            success: false,
            message: 'User mission not found'
          };
        }
      } else {
        console.error('❌ MissionDetailService: getMyMissions API failed:', myMissionsResponse.message);
        return {
          success: false,
          message: myMissionsResponse.message || 'Failed to get missions list'
        };
      }

    } catch (error) {
      console.error('❌ MissionDetailService: Fallback method also failed:', error);
      return {
        success: false,
        message: 'Failed to get user mission data from all sources',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Enhanced validation for user mission data
   */
  private validateUserMissionData(userMission: any): any {
    try {
      console.log('🔍 MissionDetailService: Validating user mission data:', userMission);
      
      // Check if userMission exists
      if (!userMission) {
        console.warn('⚠️ MissionDetailService: userMission is null or undefined');
        return null;
      }

      // Check if userMission is an object
      if (typeof userMission !== 'object') {
        console.warn('⚠️ MissionDetailService: userMission is not an object:', typeof userMission);
        return null;
      }

      // Handle case where data has user_mission_id instead of id
      if (!userMission.id && userMission.user_mission_id) {
        console.log('🔄 Converting user_mission_id to id:', userMission.user_mission_id);
        userMission.id = userMission.user_mission_id;
      }

      // Check if userMission has required fields
      if (!userMission.id || typeof userMission.id !== 'number') {
        console.warn('⚠️ MissionDetailService: userMission.id is missing or invalid:', userMission.id);
        console.log('🔍 userMission.id type:', typeof userMission.id);
        console.log('🔍 Full userMission object:', userMission);
        return null;
      }

      if (!userMission.mission_id || typeof userMission.mission_id !== 'number') {
        console.warn('⚠️ MissionDetailService: userMission.mission_id is missing or invalid:', userMission.mission_id);
        return null;
      }

      if (!userMission.status || typeof userMission.status !== 'string') {
        console.warn('⚠️ MissionDetailService: userMission.status is missing or invalid:', userMission.status);
        return null;
      }

      // Ensure current_value and target_value are numbers
      if (typeof userMission.current_value !== 'number') {
        userMission.current_value = 0;
      }

      if (typeof userMission.target_value !== 'number') {
        userMission.target_value = 0;
      }

      // Ensure progress is a number
      if (typeof userMission.progress !== 'number') {
        userMission.progress = 0;
      }

      // Ensure notes is a string
      if (typeof userMission.notes !== 'string') {
        userMission.notes = '';
      }

      return userMission;

    } catch (error) {
      console.error('❌ MissionDetailService: Error validating user mission data:', error);
      return null;
    }
  }

  /**
   * Validate mission data
   */
  private validateMissionData(mission: any): any {
    if (!mission || typeof mission !== 'object') {
      console.warn('⚠️ MissionDetailService: Invalid mission data type');
      return null;
    }

    // Check required fields
    const requiredFields = ['id', 'title', 'description', 'target_value', 'unit', 'category'];
    for (const field of requiredFields) {
      if (!mission[field]) {
        console.warn(`⚠️ MissionDetailService: Missing required field: ${field}`);
        return null;
      }
    }

    // Ensure numeric fields are numbers
    if (typeof mission.target_value !== 'number' || mission.target_value <= 0) {
      console.warn('⚠️ MissionDetailService: Invalid target_value');
      return null;
    }

    // Ensure id is a number
    if (typeof mission.id !== 'number' || mission.id <= 0) {
      console.warn('⚠️ MissionDetailService: Invalid mission id');
      return null;
    }

    return mission;
  }

  /**
   * Update mission progress with safe integration
   */
  async updateMissionProgress(userMissionId: number, updateData: {
    current_value: number;
    notes?: string;
  }): Promise<MissionDetailResponse> {
    try {

      // Validate input data
      if (!userMissionId || typeof userMissionId !== 'number') {
        return {
          success: false,
          message: 'Invalid user mission ID'
        };
      }

      if (typeof updateData.current_value !== 'number' || updateData.current_value < 0) {
        return {
          success: false,
          message: 'Invalid current value'
        };
      }

      // Call API to update progress
      const response = await apiService.updateMissionProgress(userMissionId, updateData);

      if (response.success) {
        // Clear cache for this mission
        this.clearCacheForUserMission(userMissionId);

        // Removed event emission - no longer needed for manual progress updates

        console.log('✅ MissionDetailService: Mission progress updated successfully');
        return {
          success: true,
          message: response.message || 'Mission progress updated successfully',
          data: response.data
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to update mission progress'
      };

    } catch (error) {
      console.error('❌ MissionDetailService: Error updating mission progress:', error);
      return {
        success: false,
        message: 'Failed to update mission progress',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Accept mission with safe integration
   */
  async acceptMission(missionId: number): Promise<MissionDetailResponse> {
    try {
      console.log('🎯 MissionDetailService: Accepting mission', { missionId });

      // Validate input
      if (!missionId || typeof missionId !== 'number') {
        return {
          success: false,
          message: 'Mission ID tidak valid atau tidak ditemukan'
        };
      }

      // Call API to accept mission
      const response = await apiService.acceptMission(missionId);

      if (response.success) {
        // Clear cache for this mission
        this.clearCacheForMission(missionId);

        // Removed event emission - no longer needed for manual progress updates

        return {
          success: true,
          message: response.message || 'Mission accepted successfully',
          data: response.data
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to accept mission'
      };

    } catch (error) {
      console.error('❌ MissionDetailService: Error accepting mission:', error);
      return {
        success: false,
        message: 'Failed to accept mission',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Abandon mission with safe integration
   */
  async abandonMission(userMissionId: number): Promise<MissionDetailResponse> {
    try {

      // Validate input
      if (!userMissionId || typeof userMissionId !== 'number') {
        return {
          success: false,
          message: 'User Mission ID tidak valid atau tidak ditemukan'
        };
      }

      // Call API to abandon mission
      const response = await apiService.abandonMission(userMissionId);

      if (response.success) {
        // Clear cache for this mission
        this.clearCacheForUserMission(userMissionId);

        // Removed event emission - no longer needed for manual progress updates

        return {
          success: true,
          message: response.message || 'Mission abandoned successfully',
          data: response.data
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to abandon mission'
      };

    } catch (error) {
      console.error('❌ MissionDetailService: Error abandoning mission:', error);
      return {
        success: false,
        message: 'Failed to abandon mission',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Reactivate mission with safe integration
   */
  async reactivateMission(userMissionId: number): Promise<MissionDetailResponse> {
    try {

      // Validate input
      if (!userMissionId || typeof userMissionId !== 'number') {
        return {
          success: false,
          message: 'User Mission ID tidak valid atau tidak ditemukan'
        };
      }

      // Call API to reactivate mission
      const response = await apiService.reactivateMission(userMissionId);

      if (response.success) {
        // Clear cache for this mission
        this.clearCacheForUserMission(userMissionId);

        // Removed event emission - no longer needed for manual progress updates

        return {
          success: true,
          message: response.message || 'Mission reactivated successfully',
          data: response.data
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to reactivate mission'
      };

    } catch (error) {
      console.error('❌ MissionDetailService: Error reactivating mission:', error);
      return {
        success: false,
        message: 'Failed to reactivate mission',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cache management methods
   */
  private getCachedData(key: string): MissionDetailData | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const lastUpdated = new Date(cached.lastUpdated || 0).getTime();
    
    if (now - lastUpdated > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  private cacheData(key: string, data: MissionDetailData): void {
    this.cache.set(key, data);
  }

  private clearCacheForMission(missionId: number): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${missionId}_`)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private clearCacheForUserMission(userMissionId: number): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(`_${userMissionId}`)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Removed event emitter methods - no longer needed for manual progress updates

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default new MissionDetailService();
