import AsyncStorage from "@react-native-async-storage/async-storage";

class MockApiService {
  constructor() {
    this.baseURL = "http://192.168.193.150:3000/api";
    this.mockUserMissions = []; // Track user missions - will be populated from database
    this.mockMissionStats = {
      totalMissions: 0,
      completedMissions: 0,
      totalPoints: 0,
      activeMissions: 0
    };
    
    // Mock missions data
    this.mockMissions = [
      {
        id: 1,
        title: "Daily Water Intake",
        description: "Drink 8 glasses of water daily",
        category: "nutrition",
        points: 15,
        target_value: 8,
        unit: "glasses",
        is_active: true,
        type: "daily",
        difficulty: "easy",
        icon: "cup-water",
        color: "#10B981"
      },
      {
        id: 2,
        title: "30 Minute Exercise",
        description: "Exercise for 30 minutes daily",
        category: "fitness",
        points: 25,
        target_value: 30,
        unit: "minutes",
        is_active: true,
        type: "daily",
        difficulty: "medium",
        icon: "dumbbell",
        color: "#F59E0B"
      },
      {
        id: 3,
        title: "Daily Mood Check",
        description: "Record your mood daily",
        category: "mental_health",
        points: 10,
        target_value: 1,
        unit: "times",
        is_active: true,
        type: "daily",
        difficulty: "easy",
        icon: "emoticon",
        color: "#8B5CF6"
      }
    ];
    
    this.mockUsers = [
      {
        id: 1,
        email: "user1@example.com",
        password: "mockpass123",
        name: "User One",
        role: "USER",
        isActive: true,
      },
      {
        id: 2, 
        email: "user2@example.com",
        password: "mockpass123",
        name: "User Two",
        role: "USER",
        isActive: true,
      },
      {
        id: 3,
        email: "user3@example.com",
        password: "mockpass123",
        name: "User Three",
        role: "USER",
        isActive: true,
      },
      {
        id: 4,
        email: "user4@example.com",
        password: "mockpass123",
        name: "User Four",
        role: "USER",
        isActive: true,
      },
      {
        id: 5,
        email: "user5@example.com",
        password: "mockpass123",
        name: "User Five",
        role: "USER",
        isActive: true,
      },
      {
        id: "admin-001",
        email: "admin@phc.com",
        password: "admin123",
        name: "Administrator",
        role: "ADMIN",
        isActive: true,
      },
      {
        id: "superadmin-001",
        email: "superadmin@phc.com", 
        password: "superadmin123",
        name: "Super Administrator",
        role: "SUPERADMIN",
        isActive: true,
      },
    ];
    
  }

  // Mock login
  async login(email, password) {
    try {
      // Find user with matching credentials
      const user = this.mockUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Generate mock tokens
        const accessToken = `mock_access_${user.id}_${Date.now()}`;
        const refreshToken = `mock_refresh_${user.id}_${Date.now()}`;
        
        // Store tokens in AsyncStorage if available
        try {
          await AsyncStorage.setItem('authToken', accessToken);
          await AsyncStorage.setItem('refreshToken', refreshToken);
          await AsyncStorage.setItem('userData', JSON.stringify(user));
        } catch (storageError) {
          // AsyncStorage not available, continue without storing
        }
        
        return {
          success: true,
          data: {
            accessToken,
            refreshToken,
            user
          },
          message: "Login successful"
        };
      } else {
        return {
          success: false,
          message: "Invalid credentials"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Login failed",
        error: error.message
      };
    }
  }

  // Mock register
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = this.mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        return {
          success: false,
          message: "Email already exists"
        };
      }
      
      // Create new user
      const newUser = {
        id: this.mockUsers.length + 1,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || "",
        created_at: new Date().toISOString()
      };
      
      this.mockUsers.push(newUser);
      
      // Generate mock tokens
      const accessToken = `mock_access_${newUser.id}_${Date.now()}`;
      const refreshToken = `mock_refresh_${newUser.id}_${Date.now()}`;
      
      // Store tokens in AsyncStorage if available
      try {
        await AsyncStorage.setItem('authToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      } catch (storageError) {
        // AsyncStorage not available, continue without storing
      }
      
      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: newUser
        },
        message: "Registration successful"
      };
    } catch (error) {
      return {
        success: false,
        message: "Registration failed",
        error: error.message
      };
    }
  }

  // Mock get user profile
  async getUserProfile() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          success: true,
          data: user
        };
      } else {
        return {
          success: false,
          message: "User not found"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to get user profile",
        error: error.message
      };
    }
  }

  // Mock logout
  async logout() {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      return {
        success: true,
        message: "Logout successful"
      };
    } catch (error) {
      return {
        success: false,
        message: "Logout failed",
        error: error.message
      };
    }
  }

  // Mock health check
  async healthCheck() {
    return {
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "mock-api"
      }
    };
  }

  // Mock mission functions
  async getMissions() {
    try {
      return {
        success: true,
        missions: this.mockMissions
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get missions",
        error: error.message
      };
    }
  }

  async getMission(missionId) {
    try {
      const mission = this.mockMissions.find(m => m.id === missionId);
      
      if (!mission) {
        return {
          success: false,
          message: "Mission not found"
        };
      }
      
      return {
        success: true,
        data: mission
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get mission",
        error: error.message
      };
    }
  }

  async getMissionsByDate(targetDate = null) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        return {
          success: false,
          message: "User not authenticated"
        };
      }
      
      const user = JSON.parse(userData);
      const dateParam = targetDate || new Date().toISOString().split('T')[0];
      
      // Get available missions
      const availableMissions = this.mockMissions.map(mission => {
        const existingUserMission = this.mockUserMissions.find(
          um => um.user_id === user.id && 
                um.mission_id === mission.id && 
                (um.mission_date === dateParam || um.start_date?.split('T')[0] === dateParam)
        );
        
        return {
          ...mission,
          user_status: existingUserMission ? 'accepted' : 'available',
          user_mission_id: existingUserMission?.id || null,
          user_mission_status: existingUserMission?.status || null,
          progress: existingUserMission?.progress || 0,
          mission_date: dateParam
        };
      });
      
      // Get user's accepted missions for the date
      const userMissions = this.mockUserMissions
        .filter(um => um.user_id === user.id && 
                      (um.mission_date === dateParam || um.start_date?.split('T')[0] === dateParam))
        .map(userMission => {
          const mission = this.mockMissions.find(m => m.id === userMission.mission_id);
          return {
            ...userMission,
            mission: mission || null
          };
        });
      
      // Group missions by category
      const missionsByCategory = availableMissions.reduce((acc, mission) => {
        const category = mission.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(mission);
        return acc;
      }, {});
      
      // Calculate summary
      const summary = {
        total_available: availableMissions.filter(m => m.user_status === 'available').length,
        total_accepted: availableMissions.filter(m => m.user_status === 'accepted').length,
        total_completed: userMissions.filter(m => m.status === 'completed').length,
        total_active: userMissions.filter(m => m.status === 'active').length,
        total_points_earned: userMissions
          .filter(m => m.status === 'completed')
          .reduce((sum, m) => sum + (m.points_earned || 0), 0),
        completion_rate: userMissions.length > 0 
          ? (userMissions.filter(m => m.status === 'completed').length / userMissions.length) * 100 
          : 0
      };
      
      return {
        success: true,
        data: {
          available_missions: availableMissions,
          user_missions: userMissions,
          missions_by_category: missionsByCategory,
          summary,
          target_date: dateParam
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get missions by date",
        error: error.message
      };
    }
  }

  async getMyMissions(targetDate = null, showAllDates = false) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        return {
          success: false,
          message: "User not authenticated"
        };
      }
      
      const user = JSON.parse(userData);
      let userMissions = this.mockUserMissions.filter(um => um.user_id === user.id);
      
      // Filter by date if specified
      if (targetDate && !showAllDates) {
        const targetDateStr = targetDate;
        userMissions = userMissions.filter(um => {
          const missionDate = um.mission_date || um.start_date?.split('T')[0];
          return missionDate === targetDateStr;
        });
      }
      
      // Enrich user missions with mission details
      const enrichedUserMissions = userMissions.map(userMission => {
        const mission = this.mockMissions.find(m => m.id === userMission.mission_id);
        return {
          ...userMission,
          mission: mission || null
        };
      });
      
      return {
        success: true,
        data: enrichedUserMissions,
        target_date: targetDate,
        show_all_dates: showAllDates
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get user missions",
        error: error.message
      };
    }
  }

  async acceptMission(missionId, missionDate = null) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        return {
          success: false,
          message: "User not authenticated"
        };
      }
      
      const user = JSON.parse(userData);
      const mission = this.mockMissions.find(m => m.id === missionId);
      
      if (!mission) {
        return {
          success: false,
          message: "Mission not found"
        };
      }
      
      // Use provided date or default to today
      const targetDate = missionDate || new Date().toISOString().split('T')[0];
      
      // Check if user already has this mission for the specific date
      const existingUserMission = this.mockUserMissions.find(
        um => um.user_id === user.id && um.mission_id === missionId && 
              (um.mission_date === targetDate || um.start_date?.split('T')[0] === targetDate)
      );
      
      if (existingUserMission) {
        return {
          success: false,
          message: "Mission already accepted for this date"
        };
      }
      
      // Create new user mission
      const newUserMission = {
        id: this.mockUserMissions.length + 1,
        user_id: user.id,
        mission_id: missionId,
        mission_date: targetDate,
        status: "active",
        progress: 0,
        current_value: 0,
        start_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        points_earned: 0,
        streak_count: 0,
        notes: ""
      };
      
      this.mockUserMissions.push(newUserMission);
      
      return {
        success: true,
        data: {
          ...newUserMission,
          mission: mission,
          mission_date: targetDate
        },
        message: "Mission accepted successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to accept mission",
        error: error.message
      };
    }
  }

  async updateMissionProgress(userMissionId, progressData) {
    try {
      const userMission = this.mockUserMissions.find(um => um.id === userMissionId);
      
      if (!userMission) {
        return {
          success: false,
          message: "User mission not found"
        };
      }
      
      // Update progress
      userMission.current_value = progressData.current_value || userMission.current_value;
      userMission.progress = progressData.progress || userMission.progress;
      
      if (progressData.status) {
        userMission.status = progressData.status;
      }
      
      // If mission is completed, update completion date
      if (progressData.status === "completed") {
        userMission.completed_date = new Date().toISOString();
        userMission.points_earned = 10; // Mock points
      }
      
      return {
        success: true,
        data: userMission,
        message: "Progress updated successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to update progress",
        error: error.message
      };
    }
  }

  async abandonMission(userMissionId) {
    try {
      const userMission = this.mockUserMissions.find(um => um.id === userMissionId);
      
      if (!userMission) {
        return {
          success: false,
          message: "User mission not found"
        };
      }
      
      userMission.status = "abandoned";
      userMission.completed_date = new Date().toISOString();
      
      return {
        success: true,
        data: userMission,
        message: "Mission abandoned successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to abandon mission",
        error: error.message
      };
    }
  }

  async reactivateMission(userMissionId) {
    try {
      const userMission = this.mockUserMissions.find(um => um.id === userMissionId);
      
      if (!userMission) {
        return {
          success: false,
          message: "User mission not found"
        };
      }
      
      userMission.status = "active";
      userMission.completed_date = null;
      userMission.progress = 0;
      userMission.current_value = 0;
      
      return {
        success: true,
        data: userMission,
        message: "Mission reactivated successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to reactivate mission",
        error: error.message
      };
    }
  }

  async getUserMission(userMissionId) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        return {
          success: false,
          message: "User not authenticated"
        };
      }
      
      const user = JSON.parse(userData);
      const userMission = this.mockUserMissions.find(um => um.id === userMissionId && um.user_id === user.id);
      
      if (!userMission) {
        return {
          success: false,
          message: "User mission not found"
        };
      }
      
      return {
        success: true,
        data: userMission
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get user mission",
        error: error.message
      };
    }
  }

  async getMissionStats() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        return {
          success: false,
          message: "User not authenticated"
        };
      }
      
      const user = JSON.parse(userData);
      const userMissions = this.mockUserMissions.filter(um => um.user_id === user.id);
      
      const totalMissions = userMissions.length;
      const completedMissions = userMissions.filter(um => um.status === "completed").length;
      const totalPoints = userMissions.reduce((sum, um) => sum + (um.points_earned || 0), 0);
      const completionRate = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
      
      const stats = {
        total_missions: totalMissions,
        completed_missions: completedMissions,
        total_points_earned: totalPoints,
        completion_rate: completionRate
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get mission stats",
        error: error.message
      };
    }
  }

  async getMissionHistory(params = {}) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        return {
          success: false,
          message: "User not authenticated"
        };
      }
      
      const user = JSON.parse(userData);
      let userMissions = this.mockUserMissions.filter(um => um.user_id === user.id);
      
      // Apply date filter if provided
      if (params.date) {
        const targetDate = new Date(params.date);
        userMissions = userMissions.filter(um => {
          const missionDate = new Date(um.created_at);
          return missionDate.toDateString() === targetDate.toDateString();
        });
      }
      
      // Apply period filter if no date is provided
      if (!params.date && params.period) {
        const daysAgo = parseInt(params.period);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        
        userMissions = userMissions.filter(um => {
          const missionDate = new Date(um.created_at);
          return missionDate >= cutoffDate;
        });
      }
      
      return {
        success: true,
        data: userMissions
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get mission history",
        error: error.message
      };
    }
  }

  // Reset mock data (for testing)
  async resetMockData() {
    try {
      // Reset user missions
      this.mockUserMissions = [];
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      
      return {
        success: true,
        message: "Mock data reset successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to reset mock data",
        error: error.message
      };
    }
  }

  // Mock OTP verification
  async verifyOTP(phone, otp) {
    try {
      // Mock OTP verification
      if (otp === "123456") {
        return {
          success: true,
          data: {
            verified: true,
            message: "OTP verified successfully"
          }
        };
      } else {
        return {
          success: false,
          message: "Invalid OTP"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "OTP verification failed",
        error: error.message
      };
    }
  }

  // Mock API request method
  async request(endpoint, options = {}) {
    try {
      // Handle different endpoints
      if (endpoint.includes('/my-missions')) {
        return await this.getMyMissions();
      } else if (endpoint.includes('/missions')) {
        return await this.getMissions();
      } else if (endpoint.includes('/mission-stats')) {
        return await this.getMissionStats();
      } else if (endpoint.includes('/health')) {
        return await this.healthCheck();
      } else {
        return {
          success: false,
          message: `Mock API: Endpoint ${endpoint} not implemented`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Mock API request failed",
        error: error.message
      };
    }
  }
}

export default new MockApiService(); 