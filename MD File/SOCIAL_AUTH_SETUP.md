# Social Authentication Setup Guide

## Overview
This guide explains how to set up social authentication (Google, Apple, Facebook) with OTP verification via WhatsApp and email notifications for the PHC Mobile application.

## Prerequisites

### 1. Google Sign-In Setup

#### Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API and Google Sign-In API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Create credentials for:
   - **Web application** (for React Native)
   - **iOS application** (for iOS app)
   - **Android application** (for Android app)

#### Configuration
Update `src/config/socialAuth.ts`:
```typescript
GOOGLE: {
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
}
```

#### iOS Setup
1. Add URL scheme to `ios/YourApp/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>google</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

#### Android Setup
1. Add to `android/app/google-services.json` (download from Google Cloud Console)
2. Update `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 2. Apple Sign-In Setup

#### Apple Developer Console
1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Create App ID with Sign In with Apple capability
3. Create Service ID for web authentication
4. Configure domains and redirect URLs

#### iOS Setup
1. Add capability in Xcode: "Sign In with Apple"
2. Update `ios/YourApp/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>apple</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>YOUR_BUNDLE_ID</string>
    </array>
  </dict>
</array>
```

### 3. Facebook Login Setup

#### Facebook Developer Console
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Get App ID and Client Token

#### Configuration
Update `src/config/socialAuth.ts`:
```typescript
FACEBOOK: {
  appId: 'YOUR_FACEBOOK_APP_ID',
  clientToken: 'YOUR_FACEBOOK_CLIENT_TOKEN',
  scheme: 'fbYOUR_FACEBOOK_APP_ID',
}
```

#### iOS Setup
1. Add to `ios/YourApp/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>facebook</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fbYOUR_FACEBOOK_APP_ID</string>
    </array>
  </dict>
</array>
<key>FacebookAppID</key>
<string>YOUR_FACEBOOK_APP_ID</string>
<key>FacebookClientToken</key>
<string>YOUR_FACEBOOK_CLIENT_TOKEN</string>
<key>FacebookDisplayName</key>
<string>PHC Mobile</string>
```

#### Android Setup
1. Add to `android/app/src/main/res/values/strings.xml`:
```xml
<string name="facebook_app_id">YOUR_FACEBOOK_APP_ID</string>
<string name="fb_login_protocol_scheme">fbYOUR_FACEBOOK_APP_ID</string>
<string name="facebook_client_token">YOUR_FACEBOOK_CLIENT_TOKEN</string>
```

### 4. WhatsApp Business API Setup

#### WhatsApp Business API
1. Go to [Meta for Developers](https://developers.facebook.com/docs/whatsapp)
2. Create WhatsApp Business App
3. Get Phone Number ID and Access Token
4. Create message template for OTP

#### Configuration
Update `src/config/socialAuth.ts`:
```typescript
WHATSAPP: {
  phoneNumberId: 'YOUR_WHATSAPP_PHONE_NUMBER_ID',
  accessToken: 'YOUR_WHATSAPP_ACCESS_TOKEN',
  templateName: 'phc_mobile_otp',
}
```

### 5. Email Service Setup

#### SendGrid Setup (Recommended)
1. Create [SendGrid account](https://sendgrid.com/)
2. Get API Key
3. Create email template for registration notification

#### Configuration
Update `src/config/socialAuth.ts`:
```typescript
EMAIL: {
  service: 'sendgrid',
  apiKey: 'YOUR_SENDGRID_API_KEY',
  fromEmail: 'noreply@phcmobile.com',
}
```

## Implementation Steps

### 1. Install Dependencies
```bash
npm install @react-native-google-signin/google-signin @invertase/react-native-apple-authentication react-native-fbsdk-next
```

### 2. Update Configuration
1. Copy your credentials to `src/config/socialAuth.ts`
2. Update bundle IDs and schemes in native files

### 3. Test Social Login
1. Run the app in development mode
2. Test each social login method
3. Verify OTP delivery (check console logs in development)

### 4. Production Setup
1. Replace development credentials with production ones
2. Set up proper WhatsApp Business API integration
3. Configure email service for production
4. Test end-to-end flow

## Security Considerations

### 1. Token Storage
- Store tokens securely using AsyncStorage or Keychain
- Implement token refresh mechanism
- Clear tokens on logout

### 2. OTP Security
- Use cryptographically secure random OTP generation
- Implement rate limiting for OTP requests
- Set appropriate expiry times

### 3. Data Privacy
- Only request necessary permissions
- Handle user data according to privacy policies
- Implement proper data deletion

## Troubleshooting

### Common Issues

#### Google Sign-In
- **Error**: "DEVELOPER_ERROR"
  - Solution: Check webClientId configuration
- **Error**: "SIGN_IN_CANCELLED"
  - Solution: User cancelled the sign-in

#### Apple Sign-In
- **Error**: "ASAuthorizationError"
  - Solution: Check Apple Developer Console configuration
- **Error**: "ASAuthorizationErrorCanceled"
  - Solution: User cancelled the sign-in

#### Facebook Login
- **Error**: "Facebook login was cancelled"
  - Solution: User cancelled the login
- **Error**: "Invalid key hash"
  - Solution: Add correct key hash to Facebook app settings

#### WhatsApp OTP
- **Error**: "Failed to send OTP"
  - Solution: Check WhatsApp Business API configuration
- **Error**: "Template not approved"
  - Solution: Wait for template approval from Meta

### Debug Mode
In development, the app shows alerts instead of making actual API calls:
- WhatsApp OTP shows as alert
- Email notifications show as alert
- Check console logs for debugging information

## API Integration

### Backend Endpoints Required
```javascript
// OTP Verification
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "otp": "123456",
  "authMethod": "google|apple|facebook"
}

// Social Login Registration
POST /api/auth/social-register
{
  "email": "user@example.com",
  "name": "User Name",
  "authMethod": "google|apple|facebook",
  "socialId": "social_user_id",
  "accessToken": "social_access_token"
}
```

### Response Format
```javascript
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

## Testing

### Development Testing
1. Use test credentials provided in the app
2. Check console logs for OTP values
3. Verify email notification alerts

### Production Testing
1. Test with real social accounts
2. Verify WhatsApp OTP delivery
3. Check email notification delivery
4. Test OTP expiry and resend functionality

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review console logs for error details
3. Verify configuration in `src/config/socialAuth.ts`
4. Test individual components separately

## Next Steps

1. **Backend Integration**: Implement OTP verification endpoints
2. **Production Setup**: Configure production credentials
3. **Analytics**: Add social login analytics tracking
4. **User Experience**: Add loading states and error handling
5. **Security**: Implement additional security measures 