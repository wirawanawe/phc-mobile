# 🚀 PHC Mobile App - Production Build Guide

## Overview
This guide explains how to build the PHC Mobile App in production mode using Expo EAS Build.

## 🔧 Production Configuration

### API Configuration
- **Development**: `http://localhost:3000/api/mobile`
- **Production**: `https://dash.doctorphc.id/api/mobile`

### Build Types
- **Android**: App Bundle for Google Play Store
- **iOS**: Archive for App Store

## 📋 Prerequisites

1. **Expo Account**: Make sure you're logged in
   ```bash
   npx eas-cli login
   # Email: doctorphcindonesia@gmail.com
   ```

2. **EAS CLI**: Install if not already installed
   ```bash
   npm install -g @expo/eas-cli
   ```

## 🚀 Quick Start

### Option 1: Automated Production Build
```bash
# Switch to production mode and build
npm run build:production
```

### Option 2: Manual Steps
```bash
# 1. Switch to production mode
npm run switch:production

# 2. Build for specific platform
npm run build:android    # Android AAB
npm run build:ios        # iOS Archive
```

### Option 3: Direct Script
```bash
# Run the production build script directly
./setup-sh/build-production.sh
```

## 📱 Build Commands

### Android (App Bundle - Google Play Store)
```bash
npx eas-cli build --platform android --profile production
```

### iOS (Archive - App Store)
```bash
npx eas-cli build --platform ios --profile production
```

### Both Platforms
```bash
npx eas-cli build --platform all --profile production
```

### Preview Build (APK for testing)
```bash
npx eas-cli build --platform android --profile preview
```

## ⚙️ Configuration Files

### app.json
- Production build configuration
- App metadata and settings
- Platform-specific configurations

### eas.json
- EAS Build profiles
- Platform-specific build settings
- Distribution settings

### .env.production
- Production environment variables
- API endpoints
- Debug settings

## 🔍 Build Status

Check build status:
```bash
npx eas-cli build:list
```

View specific build:
```bash
npx eas-cli build:view [BUILD_ID]
```

## 📥 Download Builds

1. Visit the EAS Build dashboard
2. Find your build in the list
3. Click "Download" to get the build file

## 🚨 Troubleshooting

### Build Fails
```bash
# Clear cache and retry
npx eas-cli build --platform android --profile production --clear-cache
```

### Login Issues
```bash
# Re-login to Expo
npx eas-cli logout
npx eas-cli login
```

### Network Issues
```bash
# Check network configuration
npm run test-network
```

## 📋 Production Checklist

- [ ] App is in production mode
- [ ] API endpoints point to production server
- [ ] Debug mode is disabled
- [ ] App version is updated
- [ ] Icons and splash screen are correct
- [ ] Permissions are properly configured
- [ ] Build succeeds without errors

## 🎯 Next Steps After Build

1. **Android**: Upload AAB to Google Play Console
2. **iOS**: Upload Archive to App Store Connect
3. **Test**: Install on test devices
4. **Deploy**: Submit for review

## 📞 Support

For issues with:
- **Build Process**: Check EAS Build logs
- **Configuration**: Review app.json and eas.json
- **API Issues**: Verify production server status

---

**Last Updated**: $(date)
**Version**: 1.0.0
