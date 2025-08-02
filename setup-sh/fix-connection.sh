#!/bin/bash

echo "🔧 Memperbaiki masalah koneksi PHC Mobile..."

# Kill any existing processes on port 3000
echo "🛑 Menghentikan proses yang berjalan di port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Tidak ada proses yang berjalan di port 3000"

# Navigate to dash-app directory (correct backend location)
cd dash-app

# Check if .env exists and has correct port
if [ ! -f ".env" ]; then
    echo "📝 Membuat file .env..."
    cp env.local.example .env.local
    echo "PORT=3000" >> .env.local
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start backend in background
echo "🚀 Menjalankan backend di background..."
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Menunggu backend siap..."
sleep 5

# Test connection on multiple endpoints
echo "🧪 Testing koneksi pada berbagai endpoint..."
echo ""

# Test localhost
if curl -s http://localhost:3000/api/mobile/auth/me > /dev/null; then
    echo "✅ localhost:3000 - OK"
else
    echo "❌ localhost:3000 - FAILED"
fi

# Test IP addresses
for ip in "10.242.90.103"; do
    if curl -s http://$ip:3000/api/mobile/auth/me > /dev/null; then
        echo "✅ $ip:3000 - OK"
    else
        echo "❌ $ip:3000 - FAILED"
    fi
done

echo ""
echo "📱 Sekarang coba login/register di aplikasi mobile"
echo "🌐 Backend URL: http://localhost:3000"
echo "📊 Log backend tersimpan di backend.log"
echo "🔄 Untuk menghentikan backend: kill $BACKEND_PID"

# Show current network interfaces
echo ""
echo "🌐 Network interfaces:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "   " $2}' 