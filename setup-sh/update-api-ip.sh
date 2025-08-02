#!/bin/bash

echo "🔧 PHC Mobile API IP Configuration Tool"
echo "======================================"

# Get current IP address
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "📍 Your computer's IP address: $CURRENT_IP"
echo ""

# Check if dash-app is running
if curl -s http://localhost:3000/api/mobile/users > /dev/null; then
    echo "✅ Dash-app is running on port 3000"
else
    echo "❌ Dash-app is not running. Please start it first:"
    echo "   cd ../dash-app && npm run dev"
    exit 1
fi

echo ""
echo "📱 Choose your testing platform:"
echo "1) Android Emulator (automatic)"
echo "2) iOS Simulator (automatic)"
echo "3) Physical Device (manual IP: $CURRENT_IP)"
echo "4) Test current configuration"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🤖 Configuring for Android Emulator..."
        echo "✅ Android emulator will use: http://10.0.2.2:3000/api/mobile"
        echo "✅ No changes needed - already configured automatically"
        ;;
    2)
        echo "🍎 Configuring for iOS Simulator..."
        echo "✅ iOS simulator will use: http://localhost:3000/api/mobile"
        echo "✅ No changes needed - already configured automatically"
        ;;
    3)
        echo "📱 Configuring for Physical Device..."
        echo "⚠️  You need to manually update src/services/api.js"
        echo ""
        echo "📝 Instructions:"
        echo "1. Open src/services/api.js"
        echo "2. Find this line:"
        echo "   // return \"http://$CURRENT_IP:3000/api/mobile\";"
        echo "3. Uncomment it and comment out the default:"
        echo "   return \"http://$CURRENT_IP:3000/api/mobile\";"
        echo "   // return \"http://localhost:3000/api/mobile\";"
        echo ""
        echo "🔗 Your device should connect to: http://$CURRENT_IP:3000/api/mobile"
        ;;
    4)
        echo "🧪 Testing current configuration..."
        echo ""
        echo "Testing localhost..."
        if curl -s http://localhost:3000/api/mobile/users > /dev/null; then
            echo "✅ localhost:3000 - OK"
        else
            echo "❌ localhost:3000 - Failed"
        fi
        
        echo ""
        echo "Testing your IP..."
        if curl -s http://$CURRENT_IP:3000/api/mobile/users > /dev/null; then
            echo "✅ $CURRENT_IP:3000 - OK"
        else
            echo "❌ $CURRENT_IP:3000 - Failed"
        fi
        
        echo ""
        echo "Testing Android emulator IP..."
        if curl -s http://10.0.2.2:3000/api/mobile/users > /dev/null; then
            echo "✅ 10.0.2.2:3000 - OK"
        else
            echo "❌ 10.0.2.2:3000 - Failed (expected for non-emulator)"
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎯 Next steps:"
echo "1. Start your mobile app: npx expo start"
echo "2. For physical device: Make sure device and computer are on same network"
echo "3. Scan QR code from Expo"
echo ""
echo "📞 If you have issues, check CONNECTION_GUIDE.md for detailed troubleshooting" 