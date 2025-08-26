#!/bin/bash

echo "🔄 Restarting Mobile App with Local API Configuration..."

# Stop any running Expo processes
echo "🛑 Stopping existing Expo processes..."
pkill -f "expo start" || true
pkill -f "metro" || true

# Wait a moment
sleep 2

# Clear Expo cache
echo "🧹 Clearing Expo cache..."
npx expo start --clear

echo "✅ Mobile app restarted!"
echo ""
echo "📱 Now try logging in with:"
echo "   Email: mobile@test.com"
echo "   Password: mobile123"
echo ""
echo "🔧 The app should now connect to localhost:3000 instead of production server"
