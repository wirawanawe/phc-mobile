import AsyncStorage from "@react-native-async-storage/async-storage";

class MockApiService {
  constructor() {
    this.baseURL = "http://10.242.90.103:3000/api";
    this.mockUserMissions = []; // Track user missions - will be populated from database
    this.mockMissionStats = {
      totalMissions: 0,
      completedMissions: 0,
      totalPoints: 0,
      activeMissions: 0
    };
    this.mockUsers = [
      {
        id: 1,
        email: "john.doe@example.com",
        password: "password123",
        name: "John Doe",
        role: "USER",
        isActive: true,
      },
      {
        id: 2, 
        email: "jane.smith@example.com",
        password: "password123",
        name: "Jane Smith",
        role: "USER",
        isActive: true,
      },
      {
        id: 3,
        email: "ahmad.rahman@example.com",
        password: "password123",
        name: "Ahmad Rahman",
        role: "USER",
        isActive: true,
      },
      {
        id: 4,
        email: "siti.nurhaliza@example.com",
        password: "password123",
        name: "Siti Nurhaliza",
        role: "USER",
        isActive: true,
      },
      {
        id: 5,
        email: "budi.santoso@example.com",
        password: "password123",
        name: "Budi Santoso",
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
        data: this.mockMissions
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get missions",
        error: error.message
      };
    }
  }

  async getMyMissions() {
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
        data: enrichedUserMissions
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get user missions",
        error: error.message
      };
    }
  }

  async acceptMission(missionId) {
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
      
      // Check if user already has this mission
      const existingUserMission = this.mockUserMissions.find(
        um => um.user_id === user.id && um.mission_id === missionId
      );
      
      if (existingUserMission) {
        return {
          success: false,
          message: "Mission already accepted"
        };
      }
      
      // Create new user mission
      const newUserMission = {
        id: this.mockUserMissions.length + 1,
        user_id: user.id,
        mission_id: missionId,
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
          mission: mission
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