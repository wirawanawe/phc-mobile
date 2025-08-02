#!/bin/bash

# Build APK Script for PHC Mobile App
echo "🚀 Starting APK build process for PHC Mobile App..."

# Set up environment variables
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"

# Verify environment
echo "📋 Checking environment..."
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed or not in PATH"
    exit 1
fi

# Check if Android SDK is available
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Android SDK not found at $ANDROID_HOME"
    exit 1
fi

echo "✅ Environment check passed"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf android/app/build
rm -rf android/.gradle

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the APK
echo "🔨 Building APK (this may take 10-15 minutes)..."
echo "⏳ Please be patient, the build process is running..."

# Run the build
npx expo run:android --variant release

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ APK build completed successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
    echo "📁 You can find your APK file in the android/app/build/outputs/apk/release/ directory"
else
    echo "❌ APK build failed"
    exit 1
fi 