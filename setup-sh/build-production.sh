#!/bin/bash

echo "🚀 Building PHC Mobile App for PRODUCTION..."
echo ""

# Check if user is logged in
echo "📋 Checking login status..."
if npx eas-cli whoami > /dev/null 2>&1; then
    echo "✅ Already logged in to Expo"
else
    echo "🔐 Please login to Expo first:"
    echo "   npx eas-cli login"
    echo "   Email: doctorphcindonesia@gmail.com"
    echo ""
    read -p "Press Enter after you've logged in..."
fi

echo ""
echo "🔧 Setting up production environment..."
echo "📱 App will be built in PRODUCTION mode"
echo "🌐 API will use: https://dash.doctorphc.id"
echo ""

# Ask user which platform to build
echo "📋 Select platform to build:"
echo "1) Android (App Bundle - Google Play Store)"
echo "2) iOS (Archive - App Store)"
echo "3) Both platforms"
echo ""
read -p "Enter your choice (1-3): " platform_choice

case $platform_choice in
    1)
        echo ""
        echo "🔨 Building Android App Bundle for production..."
        echo "⏳ This will take 10-15 minutes..."
        echo ""
        npx eas-cli build --platform android --profile production
        ;;
    2)
        echo ""
        echo "🔨 Building iOS Archive for production..."
        echo "⏳ This will take 10-15 minutes..."
        echo ""
        npx eas-cli build --platform ios --profile production
        ;;
    3)
        echo ""
        echo "🔨 Building for both platforms..."
        echo "⏳ This will take 20-30 minutes..."
        echo ""
        npx eas-cli build --platform all --profile production
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Production build completed successfully!"
    echo "📥 You can download the build from the link above"
    echo ""
    if [ "$platform_choice" = "1" ] || [ "$platform_choice" = "3" ]; then
        echo "📱 Android App Bundle is ready for Google Play Store submission"
    fi
    if [ "$platform_choice" = "2" ] || [ "$platform_choice" = "3" ]; then
        echo "🍎 iOS Archive is ready for App Store submission"
    fi
    echo ""
    echo "🎉 Your PHC Mobile App is ready for production!"
else
    echo ""
    echo "❌ Production build failed"
    echo "💡 Try running: npx eas-cli build --platform android --profile production --clear-cache"
    exit 1
fi
