#!/bin/bash

echo "🚀 Building APK using EAS Build Service..."
echo ""

# Check if user is logged in
echo "📋 Checking login status..."
if npx eas-cli whoami > /dev/null 2>&1; theny
    echo "✅ Already logged in to Expo"
else
    echo "🔐 Please login to Expo first:"
    echo "   npx eas-cli login"
    echo "   Email: doctorphcindonesia@gmail.com"
    echo ""
    read -p "Press Enter after you've logged in..."
fi

echo ""
echo "🔨 Starting APK build..."
echo "⏳ This will take 5-10 minutes..."
echo ""

# Build APK using EAS
echo "📱 Building preview APK..."
npx eas-cli build --platform android --profile preview

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK build completed successfully!"
    echo "📥 You can download the APK from the link above"
    echo "📱 The APK can be installed on any Android device"
    echo ""
    echo "🎉 Your PHC Mobile App APK is ready!"
else
    echo ""
    echo "❌ APK build failed"
    echo "💡 Try running: npx eas-cli build --platform android --profile preview --clear-cache"
    exit 1
fi 