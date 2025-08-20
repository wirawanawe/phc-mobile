#!/bin/bash

echo "🚀 Building PHC Mobile App for Production..."

# Check if EAS CLI is available via npx
if ! npx eas-cli --version &> /dev/null; then
    echo "❌ EAS CLI is not available. Please install it first:"
    echo "   npm install -g eas-cli"
    exit 1
fi

# Check if user is logged in to Expo
if ! npx eas-cli whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please login first:"
    echo "   npx eas-cli login"
    exit 1
fi

echo "✅ EAS CLI is ready"

# Build for Android
echo "📱 Building Android APK for production..."
npx eas-cli build --platform android --profile production

if [ $? -eq 0 ]; then
    echo "✅ Android build completed successfully!"
else
    echo "❌ Android build failed!"
    exit 1
fi

echo ""
echo "🎉 Production build completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Download the APK from the EAS build link"
echo "   2. Test the APK on a physical device"
echo "   3. Upload to Google Play Store if ready"
echo ""
echo "🔗 You can also build for iOS with:"
echo "   eas build --platform ios --profile production"
