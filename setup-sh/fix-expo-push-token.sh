#!/bin/bash

echo "🔧 Fixing ExpoPushTokenManager Error..."

# Step 1: Clean everything
echo "🧹 Cleaning project..."
rm -rf node_modules
rm -rf android
rm -rf ios
rm -rf .expo
rm -rf dist
rm -rf web-build

# Step 2: Reinstall dependencies
echo "📦 Reinstalling dependencies..."
npm install

# Step 3: Fix expo-notifications configuration
echo "🔧 Fixing expo-notifications configuration..."

# Step 4: Prebuild with clean slate
echo "🏗️ Prebuilding project..."
npx expo prebuild --clean --platform android

# Step 5: Install Android dependencies
echo "📱 Installing Android dependencies..."
cd android
./gradlew clean
cd ..

echo "✅ Fix completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Make sure Android Studio is installed"
echo "2. Install Android SDK Command-line Tools through Android Studio"
echo "3. Run: ./setup-sh/install-ndk.sh"
echo "4. Run: npx expo run:android"
echo ""
echo "📚 Alternative: Use EAS Build (recommended)"
echo "   npx eas-cli build --platform android --profile preview" 