#!/bin/bash

echo "🔧 Fixing React Native/Expo Dependencies..."

# Step 1: Kill any running Metro processes
echo "🛑 Stopping running Metro processes..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:8082 | xargs kill -9 2>/dev/null || true

# Step 2: Clear all caches
echo "🧹 Clearing caches..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf .metro-cache
npx expo install --fix

# Step 3: Install missing dependencies
echo "📦 Installing missing dependencies..."
npm install webidl2js
npm install @babel/runtime

# Step 4: Clear Metro cache
echo "🗑️ Clearing Metro cache..."
npx expo start --clear --no-dev --minify

echo "✅ Dependencies fixed!"
echo ""
echo "🎯 Next steps:"
echo "1. Run: npx expo start"
echo "2. Scan QR code with Expo Go app"
echo "3. Or press 'a' for Android emulator"
echo "4. Or press 'i' for iOS simulator" 