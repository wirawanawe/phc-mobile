# Android Troubleshooting Guide - PHC Mobile App

## Issues Resolved

### 1. Port 8081 Already in Use
**Problem**: Metro bundler couldn't start because port 8081 was already occupied.

**Solution**:
```bash
# Check what's using port 8081
lsof -ti:8081

# Kill the processes using port 8081
kill -9 $(lsof -ti:8081)

# Alternative: Use a different port
npx expo start --port 8082
```

### 2. Metro Config Warning
**Problem**: Metro config was using deprecated `expo/metro-config` instead of `@react-native/metro-config`.

**Solution**:
```bash
# Install the required package
npm install --save-dev @react-native/metro-config

# Update metro.config.js to use @react-native/metro-config
```

## Common Android Issues and Solutions

### 1. Build Failures

#### Gradle Build Issues
```bash
# Clean the project
cd android
./gradlew clean
cd ..

# Clear Metro cache
npx expo start --clear

# Rebuild
npx expo run:android
```

#### Missing Dependencies
```bash
# Install missing dependencies
npm install

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 2. Emulator Issues

#### Emulator Not Starting
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Medium_Phone_API_36.0

# Check if emulator is running
adb devices
```

#### ADB Connection Issues
```bash
# Kill and restart ADB server
adb kill-server
adb start-server

# Check connected devices
adb devices
```

### 3. App Crashes

#### Debug Mode
```bash
# Enable debug mode
npx expo start --dev-client

# View logs
adb logcat | grep -E "(ReactNativeJS|FATAL|AndroidRuntime)"
```

#### Clear App Data
```bash
# Clear app data on device
adb shell pm clear com.phc.doctorapp
```

### 4. Network Issues

#### Development Server Not Accessible
```bash
# Check if Metro is running
curl http://localhost:8081/status

# Use specific IP address
npx expo start --host 192.168.1.7
```

#### API Connection Issues
- Check if backend server is running
- Verify API endpoints in `src/services/api.js`
- Check network permissions in `app.json`

### 5. Performance Issues

#### Memory Issues
```bash
# Enable Hermes engine (already enabled in app.json)
# Clear app cache
adb shell pm clear com.phc.doctorapp
```

#### Build Optimization
```bash
# Enable ProGuard for release builds
# Update android/app/build.gradle
```

## Quick Fix Commands

### Reset Everything
```bash
# Stop all processes
pkill -f "expo\|metro\|react-native"

# Clear all caches
npx expo start --clear
cd android && ./gradlew clean && cd ..

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart development server
npx expo start
```

### Check System Status
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Expo CLI version
npx expo --version

# Check React Native version
npx react-native --version
```

## Environment Setup Verification

### Required Tools
- Node.js 18+ ✅
- npm 9+ ✅
- Expo CLI ✅
- Android Studio ✅
- Android SDK ✅
- Java Development Kit (JDK) ✅

### Environment Variables
```bash
# Check ANDROID_HOME
echo $ANDROID_HOME

# Check JAVA_HOME
echo $JAVA_HOME

# Check PATH includes Android tools
echo $PATH | grep android
```

## Debugging Tips

### 1. Enable Debug Logging
```javascript
// In your React Native code
console.log('Debug message');
console.warn('Warning message');
console.error('Error message');
```

### 2. Use React Native Debugger
```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Start debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

### 3. Monitor Performance
```bash
# Enable performance monitoring
npx expo start --dev-client --profile
```

## Common Error Messages and Solutions

### "Metro bundler not responding"
- Kill existing Metro processes
- Restart with `npx expo start --clear`

### "Unable to resolve module"
- Clear Metro cache
- Check import paths
- Verify file exists

### "Build failed"
- Check Gradle logs in `android/build/reports/`
- Verify Android SDK installation
- Check Java version compatibility

### "App crashes on startup"
- Check JavaScript bundle
- Verify native dependencies
- Check permissions in `app.json`

## Maintenance

### Regular Cleanup
```bash
# Weekly cleanup
npm cache clean --force
cd android && ./gradlew clean && cd ..
npx expo start --clear
```

### Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update Expo SDK
npx expo install --fix
```

## Support

If issues persist:
1. Check the [Expo documentation](https://docs.expo.dev/)
2. Review [React Native troubleshooting](https://reactnative.dev/docs/troubleshooting)
3. Check project-specific logs in `metro.log` and `backend.log`
4. Verify backend server status in `dash-app/` directory
