#!/bin/bash

echo "🔧 Installing Android NDK..."

# Set up environment variables
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"

# Check if sdkmanager is available
if [ ! -f "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
    echo "❌ Android SDK Command-line Tools not found"
    echo "Please install Android SDK Command-line Tools through Android Studio"
    echo "Or download from: https://developer.android.com/studio#command-tools"
    exit 1
fi

# Install NDK version 27.1.12297006
echo "📦 Installing NDK version 27.1.12297006..."
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "ndk;27.1.12297006"

# Verify installation
if [ -d "$ANDROID_HOME/ndk/27.1.12297006" ]; then
    echo "✅ NDK installed successfully!"
    echo "NDK location: $ANDROID_HOME/ndk/27.1.12297006"
else
    echo "❌ NDK installation failed"
    exit 1
fi

echo "🎉 NDK installation completed!"
echo "You can now run: ./build-apk.sh" 