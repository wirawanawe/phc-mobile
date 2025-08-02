#!/bin/bash

echo "🚀 Starting PHC Mobile Application..."

# Check if dash-app is running
if ! curl -s http://localhost:3000/api/mobile/users > /dev/null; then
    echo "⚠️  Dash-app is not running. Starting dash-app..."
    
    # Start dash-app in background
    cd ../dash-app
    npm run dev &
    DASH_APP_PID=$!
    
    echo "⏳ Waiting for dash-app to start..."
    sleep 15
    
    # Check if dash-app started successfully
    if curl -s http://localhost:3000/api/mobile/users > /dev/null; then
        echo "✅ Dash-app started successfully on port 3000"
    else
        echo "❌ Failed to start dash-app"
        exit 1
    fi
    
    cd ../phc-mobile
else
    echo "✅ Dash-app is already running on port 3000"
fi

# Get IP address for mobile development
echo "🌐 Getting IP address for mobile development..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    IP=$(hostname -I | awk '{print $1}')
else
    IP="localhost"
fi

echo "📱 Your IP address: $IP"
echo "🔗 Dash-app URL: http://$IP:3000"

# Check if mobile app dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing mobile app dependencies..."
    npm install
fi

# Start mobile app
echo "📱 Starting mobile app..."
echo ""
echo "🎯 Instructions:"
echo "1. Scan QR code with Expo Go app (Android/iOS)"
echo "2. Or press 'i' for iOS simulator"
echo "3. Or press 'a' for Android emulator"
echo ""
echo "🔑 Test Login:"
echo "   Email: john.doe@example.com"
echo "   Password: password123"
echo ""

# Start Expo development server
npx expo start

# Cleanup when app is closed
if [ ! -z "$DASH_APP_PID" ]; then
    echo "🛑 Stopping dash-app..."
    kill $DASH_APP_PID
fi 