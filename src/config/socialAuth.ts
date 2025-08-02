// Social Authentication Configuration
export const SOCIAL_AUTH_CONFIG = {
  // Google Sign-In Configuration
  GOOGLE: {
    webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  },

  // Facebook Configuration
  FACEBOOK: {
    appId: 'YOUR_FACEBOOK_APP_ID',
    appName: 'PHC Mobile',
    clientToken: 'YOUR_FACEBOOK_CLIENT_TOKEN',
    displayName: 'PHC Mobile',
    scheme: 'fbYOUR_FACEBOOK_APP_ID',
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
    phoneNumberId: 'YOUR_WHATSAPP_PHONE_NUMBER_ID',
    accessToken: 'YOUR_WHATSAPP_ACCESS_TOKEN',
    templateName: 'phc_mobile_otp',
    templateLanguage: 'en_US',
  },

  // Email Service Configuration (for notifications)
  EMAIL: {
    service: 'sendgrid', // or 'mailgun', 'aws-ses'
    apiKey: 'YOUR_EMAIL_SERVICE_API_KEY',
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
}; 