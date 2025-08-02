import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { generateRandomOTP, sendOTPToWhatsApp, sendEmailNotification } from './notificationService';

class SocialAuthService {
  constructor() {
    this.initializeAuth();
  }

  // Initialize Auth
  initializeAuth() {
    // Configure WebBrowser for auth sessions
    WebBrowser.maybeCompleteAuthSession();
  }

  // Google Sign-In using Expo AuthSession
  async signInWithGoogle() {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'phc-mobile',
        path: 'auth'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid%20email%20profile&` +
        `access_type=offline`;

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
            client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            client_secret: 'YOUR_GOOGLE_CLIENT_SECRET',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenResponse.json();
        
        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        const userInfo = await userResponse.json();
        
        // Generate OTP
        const otp = generateRandomOTP();
        
        // Send email notification
        await sendEmailNotification(userInfo.email, 'PHC Mobile Registration', {
          type: 'registration',
          platform: 'Google',
          email: userInfo.email,
          name: userInfo.name,
        });
        
        return {
          success: true,
          data: {
            user: {
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
            },
            accessToken: tokenData.access_token,
            otp,
            authMethod: 'google',
            requiresOTP: true
          }
        };
      } else {
        throw new Error('Google sign-in was cancelled');
      }
    } catch (error) {
      throw new Error('Google sign-in failed');
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
        // Generate OTP
        const otp = generateRandomOTP();
        
        // Send email notification
        if (credential.email) {
          await sendEmailNotification(credential.email, 'PHC Mobile Registration', {
            type: 'registration',
            platform: 'Apple',
            email: credential.email,
            name: credential.fullName?.givenName + ' ' + credential.fullName?.familyName,
          });
        }
        
        return {
          success: true,
          data: {
            user: {
              id: credential.user,
              email: credential.email,
              name: credential.fullName?.givenName + ' ' + credential.fullName?.familyName,
            },
            identityToken: credential.identityToken,
            otp,
            authMethod: 'apple',
            requiresOTP: true
          }
        };
      }
    } catch (error) {
      throw new Error('Apple sign-in failed');
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
        `client_id=YOUR_FACEBOOK_APP_ID&` +
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
            client_id: 'YOUR_FACEBOOK_APP_ID',
            client_secret: 'YOUR_FACEBOOK_APP_SECRET',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
          // Get user info from Facebook Graph API
          const userInfo = await this.getFacebookUserInfo(tokenData.access_token);
          
          if (userInfo) {
            // Generate OTP
            const otp = generateRandomOTP();
            
            // Send email notification
            await sendEmailNotification(userInfo.email, 'PHC Mobile Registration', {
              type: 'registration',
              platform: 'Facebook',
              email: userInfo.email,
              name: userInfo.name,
            });
            
            return {
              success: true,
              data: {
                user: userInfo,
                accessToken: tokenData.access_token,
                otp,
                authMethod: 'facebook',
                requiresOTP: true
              }
            };
          }
        }
      } else {
        throw new Error('Facebook login was cancelled');
      }
    } catch (error) {
      throw new Error('Facebook sign-in failed');
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

  // Verify OTP
  async verifyOTP(email, otp, authMethod) {
    try {
      // Here you would typically verify OTP with your backend
      // For now, we'll simulate verification
      const response = await fetch('http://10.242.90.103:3000/api/auth/verify-otp', {
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