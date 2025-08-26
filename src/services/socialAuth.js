import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { generateRandomOTP, sendOTPToWhatsApp, sendEmailNotification } from './notificationService';
import { DEV_CONFIG, SOCIAL_AUTH_CONFIG } from '../config/socialAuth';

class SocialAuthService {
  constructor() {
    this.initializeAuth();
    // Don't store serverUrl in constructor - get it dynamically
  }

  // Initialize Auth
  initializeAuth() {
    // Configure WebBrowser for auth sessions
    WebBrowser.maybeCompleteAuthSession();
  }

  // Get the current server URL dynamically
  getServerUrl() {
    return DEV_CONFIG.serverUrl;
  }

  // Google Sign-In using Expo AuthSession
  async signInWithGoogle() {
    try {
      // Check if we have proper Google OAuth configuration
      const { GOOGLE } = SOCIAL_AUTH_CONFIG;
      if (!GOOGLE.webClientId || GOOGLE.webClientId.includes('YOUR_')) {
        console.warn('⚠️ Google OAuth not configured. Please set up Google OAuth client IDs.');
        throw new Error('Google OAuth configuration is missing. Please configure Google OAuth client IDs in src/config/socialAuth.ts');
      }

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'phc-mobile',
        path: 'auth'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE.webClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid%20email%20profile&` +
        `access_type=offline&` +
        `prompt=select_account`; // This will show account picker

      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: redirectUri,
      });

      if (result.type === 'success') {
        
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code: result.params.code,
            client_id: GOOGLE.webClientId,
            client_secret: GOOGLE.clientSecret || '', // You'll need to add this to config
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('❌ Token exchange failed:', errorText);
          throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error('❌ User info fetch failed:', errorText);
          throw new Error(`Failed to get user info: ${userResponse.status} ${userResponse.statusText}`);
        }

        const userInfo = await userResponse.json();
        
        // Get server URL dynamically
        const serverUrl = this.getServerUrl();
        
        // Register with backend
        const backendResponse = await fetch(`${serverUrl}/api/mobile/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            google_user_id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            phone: null, // Google doesn't provide phone
          }),
        });

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error('❌ Backend registration failed:', errorText);
          throw new Error(`Backend registration failed: ${backendResponse.status} ${backendResponse.statusText}`);
        }

        const backendData = await backendResponse.json();
        
        if (backendData.success) {
          console.log('✅ Backend registration successful');
          return {
            success: true,
            data: {
              user: backendData.data.user,
              accessToken: backendData.data.accessToken,
              refreshToken: backendData.data.refreshToken,
              authMethod: 'google',
              requiresOTP: false, // Backend handles authentication
              isNewUser: backendData.data.isNewUser
            }
          };
        } else {
          throw new Error(backendData.message || 'Backend registration failed');
        }
      } else if (result.type === 'cancel') {
        throw new Error('Google sign-in was cancelled');
      } else {
        console.error('❌ Google sign-in failed:', result);
        throw new Error('Google sign-in failed');
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      throw new Error('Google sign-in failed: ' + error.message);
    }
  }

  // Apple Sign-In using Expo
  async signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential) {
        // For Apple, we'll use the user ID as the identifier
        const userData = {
          apple_user_id: credential.user,
          name: credential.fullName?.givenName + ' ' + credential.fullName?.familyName,
          email: credential.email,
          phone: null,
        };

        // Register with backend (using Google endpoint for now, can create Apple-specific later)
        const backendResponse = await fetch(`${this.getServerUrl()}/api/mobile/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            google_user_id: credential.user, // Using Apple user ID
            name: userData.name,
            email: userData.email,
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
      }
    } catch (error) {
      console.error('Apple sign-in error:', error);
      throw new Error('Apple sign-in failed: ' + error.message);
    }
  }

  // Facebook Sign-In using Web-based OAuth
  async signInWithFacebook() {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'phc-mobile',
        path: 'auth'
      });

      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=123456789012345&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=public_profile,email`;

      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: redirectUri,
      });

      if (result.type === 'success') {
        // Exchange code for access token
        const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code: result.params.code,
            client_id: '123456789012345',
            client_secret: 'your-facebook-app-secret-here',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
          // Get user info from Facebook Graph API
          const userInfo = await this.getFacebookUserInfo(tokenData.access_token);
          
          if (userInfo) {
            // Register with backend
            const backendResponse = await fetch(`${this.getServerUrl()}/api/mobile/auth/facebook`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                facebook_user_id: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone || null,
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
          }
        }
      } else {
        throw new Error('Facebook login was cancelled');
      }
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      throw new Error('Facebook sign-in failed: ' + error.message);
    }
  }

  // Get Facebook user info
  async getFacebookUserInfo(accessToken) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,phone&access_token=${accessToken}`
      );
      const userInfo = await response.json();
      return userInfo;
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP (for development/testing purposes)
  async verifyOTP(email, otp, authMethod) {
    try {
      // For development, we'll use a mock verification
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

      // Here you would typically verify OTP with your backend
      const response = await fetch(`${this.getServerUrl()}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          authMethod,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('OTP verification failed');
    }
  }

  // Sign out from all platforms
  async signOut() {
    try {
      // For Expo, we just clear local tokens
      // In a real app, you would also revoke tokens with the providers
      return { success: true };
    } catch (error) {
      throw new Error('Sign out failed');
    }
  }

  // Check if user is signed in
  async isSignedIn() {
    try {
      // For Expo, check local storage for tokens
      // In a real app, you would validate tokens with the providers
      return false;
    } catch (error) {
      return false;
    }
  }
}

export default new SocialAuthService(); 