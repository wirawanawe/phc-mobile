import { Alert } from 'react-native';
import { generateRandomOTP, sendOTPToWhatsApp, sendEmailNotification } from './notificationService';
import mockApiService from './mockApi';

class SocialAuthServiceDev {
  constructor() {
    // Initialize development social auth service
  }

  async googleSignIn() {
    try {
      // Mock Google Sign-In for development
      const mockUser = {
        id: 'google_user_123',
        email: 'user@gmail.com',
        name: 'Google User',
        photo: 'https://via.placeholder.com/150',
        platform: 'google'
      };
      
      return {
        success: true,
        data: mockUser
      };
    } catch (error) {
      return {
        success: false,
        message: "Google Sign-In failed",
        error: error.message
      };
    }
  }

  async appleSignIn() {
    try {
      // Mock Apple Sign-In for development
      const mockUser = {
        id: 'apple_user_123',
        email: 'user@icloud.com',
        name: 'Apple User',
        platform: 'apple'
      };
      
      return {
        success: true,
        data: mockUser
      };
    } catch (error) {
      return {
        success: false,
        message: "Apple Sign-In failed",
        error: error.message
      };
    }
  }

  async facebookSignIn() {
    try {
      // Mock Facebook Sign-In for development
      const mockUser = {
        id: 'facebook_user_123',
        email: 'user@facebook.com',
        name: 'Facebook User',
        photo: 'https://via.placeholder.com/150',
        platform: 'facebook'
      };
      
      return {
        success: true,
        data: mockUser
      };
    } catch (error) {
      return {
        success: false,
        message: "Facebook Sign-In failed",
        error: error.message
      };
    }
  }

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

  async signOut() {
    try {
      // Mock sign out
      return {
        success: true,
        message: "Sign out successful"
      };
    } catch (error) {
      return {
        success: false,
        message: "Sign out failed",
        error: error.message
      };
    }
  }

  // Mock check sign in
  async isSignedIn() {
    return false;
  }
}

export default new SocialAuthServiceDev(); 