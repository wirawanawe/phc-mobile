// Social Authentication Configuration
export const SOCIAL_AUTH_CONFIG = {
  // Google Sign-In Configuration
  GOOGLE: {
    // TODO: Replace with your actual Google OAuth client IDs
    // Get these from Google Cloud Console: https://console.cloud.google.com/
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  },

  // Facebook Configuration
  FACEBOOK: {
    appId: '123456789012345',
    appName: 'PHC Mobile',
    clientToken: 'abcdefghijklmnopqrstuvwxyz123456',
    displayName: 'PHC Mobile',
    scheme: 'fb123456789012345',
    autoLogAppEventsEnabled: false,
    autoInitEnabled: true,
  },

  // Apple Sign-In Configuration
  APPLE: {
    // Apple Sign-In is configured through Apple Developer Console
    // No additional configuration needed here
  },

  // WhatsApp Business API Configuration (for OTP)
  WHATSAPP: {
    phoneNumberId: '123456789012345',
    accessToken: 'EAA...', // Facebook access token for WhatsApp Business API
    templateName: 'phc_mobile_otp',
    templateLanguage: 'en_US',
  },

  // Email Service Configuration (for notifications)
  EMAIL: {
    service: 'sendgrid', // or 'mailgun', 'aws-ses'
    apiKey: 'SG.abcdefghijklmnopqrstuvwxyz123456',
    fromEmail: 'noreply@phcmobile.com',
    fromName: 'PHC Mobile',
  },
};

// OTP Configuration
export const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 10,
  resendCooldownMinutes: 1,
  maxAttempts: 3,
};

// Development Configuration
export const DEV_CONFIG = {
  // For development, show alerts instead of actual API calls
  showAlerts: __DEV__,
  // Mock OTP for testing
  mockOTP: __DEV__ ? '123456' : null,
  // Development server URL - will be set dynamically based on platform
  get serverUrl() {
    if (__DEV__) {
      // Import Platform dynamically to avoid issues
      const { Platform } = require('react-native');
      if (Platform.OS === 'android') {
        return 'http://10.242.90.103:3000';
      } else {
        return 'http://localhost:3000';
      }
    }
    return 'https://dash.doctorphc.id';
  },
  // Enable real Google sign-in in development
  enableRealGoogleSignIn: true, // Set to true to use real Google sign-in
}; 