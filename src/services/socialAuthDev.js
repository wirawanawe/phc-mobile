import { DEV_CONFIG } from '../config/socialAuth';

class SocialAuthDevService {
  constructor() {
    // Don't store serverUrl in constructor - get it dynamically
  }

  // Get the current server URL dynamically
  getServerUrl() {
    return DEV_CONFIG.serverUrl;
  }

  // Mock Google Sign-In for development
  async signInWithGoogle() {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUserData = {
        id: 'google_user_123',
        email: 'test@gmail.com',
        name: 'Test Google User',
        picture: 'https://via.placeholder.com/150'
      };

      // Get server URL dynamically
      const serverUrl = this.getServerUrl();

      // Register with backend
      const backendResponse = await fetch(`${serverUrl}/api/mobile/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_user_id: mockUserData.id,
          name: mockUserData.name,
          email: mockUserData.email,
          phone: null,
        }),
      });

      const backendData = await backendResponse.json();
      
      if (backendData.success) {
        return {
          success: true,
          data: {
            user: backendData.data.user,
            accessToken: backendData.data.accessToken,
            refreshToken: backendData.data.refreshToken,
            authMethod: 'google',
            requiresOTP: false,
            isNewUser: backendData.data.isNewUser
          }
        };
      } else {
        throw new Error(backendData.message || 'Backend registration failed');
      }
    } catch (error) {
      console.error('Mock Google sign-in error:', error);
      throw new Error('Google sign-in failed: ' + error.message);
    }
  }

  // Mock Apple Sign-In for development
  async signInWithApple() {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUserData = {
        id: 'apple_user_456',
        email: 'test@icloud.com',
        name: 'Test Apple User'
      };

      // Get server URL dynamically
      const serverUrl = this.getServerUrl();

      // Register with backend (using Google endpoint for now)
      const backendResponse = await fetch(`${serverUrl}/api/mobile/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_user_id: mockUserData.id, // Using Apple user ID
          name: mockUserData.name,
          email: mockUserData.email,
          phone: null,
        }),
      });

      const backendData = await backendResponse.json();
      
      if (backendData.success) {
        return {
          success: true,
          data: {
            user: backendData.data.user,
            accessToken: backendData.data.accessToken,
            refreshToken: backendData.data.refreshToken,
            authMethod: 'apple',
            requiresOTP: false,
            isNewUser: backendData.data.isNewUser
          }
        };
      } else {
        throw new Error(backendData.message || 'Backend registration failed');
      }
    } catch (error) {
      console.error('Mock Apple sign-in error:', error);
      throw new Error('Apple sign-in failed: ' + error.message);
    }
  }

  // Mock Facebook Sign-In for development
  async signInWithFacebook() {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUserData = {
        id: 'facebook_user_789',
        email: 'test@facebook.com',
        name: 'Test Facebook User',
        phone: '+6281234567890'
      };

      // Get server URL dynamically
      const serverUrl = this.getServerUrl();

      // Register with backend (using Google endpoint for now)
      const backendResponse = await fetch(`${serverUrl}/api/mobile/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_user_id: mockUserData.id, // Using Facebook user ID
          name: mockUserData.name,
          email: mockUserData.email,
          phone: null,
        }),
      });

      const backendData = await backendResponse.json();
      
      if (backendData.success) {
        return {
          success: true,
          data: {
            user: backendData.data.user,
            accessToken: backendData.data.accessToken,
            refreshToken: backendData.data.refreshToken,
            authMethod: 'facebook',
            requiresOTP: false,
            isNewUser: backendData.data.isNewUser
          }
        };
      } else {
        throw new Error(backendData.message || 'Backend registration failed');
      }
    } catch (error) {
      console.error('Mock Facebook sign-in error:', error);
      throw new Error('Facebook sign-in failed: ' + error.message);
    }
  }

  // Mock OTP verification
  async verifyOTP(email, otp, authMethod) {
    try {
      // For development, accept the mock OTP
      if (DEV_CONFIG.mockOTP && otp === DEV_CONFIG.mockOTP) {
        return {
          success: true,
          message: 'OTP verified successfully',
          data: {
            email,
            authMethod,
            verified: true
          }
        };
      }

      throw new Error('Invalid OTP');
    } catch (error) {
      throw new Error('OTP verification failed');
    }
  }

  // Mock sign out
  async signOut() {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    } catch (error) {
      throw new Error('Sign out failed');
    }
  }

  // Mock check if signed in
  async isSignedIn() {
    return false;
  }
}

export default new SocialAuthDevService(); 