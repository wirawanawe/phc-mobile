#!/bin/bash

echo "🚀 Starting PHC Mobile Application..."

# Check if backend is running
if ! curl -s http://localhost:5432/health > /dev/null; then
    echo "⚠️  Backend is not running. Starting backend..."
    
    # Start backend in background
    cd backend
    PORT=5432 npm run dev &
    BACKEND_PID=$!
    
    echo "⏳ Waiting for backend to start..."
    sleep 10
    
    # Check if backend started successfully
    if curl -s http://localhost:5432/health > /dev/null; then
    echo "✅ Backend started successfully on port 5432"
    else
        echo "❌ Failed to start backend"
        exit 1
    fi
    
    cd ..
else
    echo "✅ Backend is already running on port 5432"
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
echo "🔗 Backend URL: http://$IP:5432"

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
echo "   Email: john@example.com"
echo "   Password: password123"
echo ""

# Start Expo development server
npx expo start

# Cleanup when app is closed
if [ ! -z "$BACKEND_PID" ]; then
    echo "🛑 Stopping backend..."
    kill $BACKEND_PID
fi 