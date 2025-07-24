#!/bin/bash

echo "🔧 Memperbaiki masalah koneksi PHC Mobile..."

# Kill any existing processes on port 5432
echo "🛑 Menghentikan proses yang berjalan di port 5432..."
lsof -ti:5432 | xargs kill -9 2>/dev/null || echo "Tidak ada proses yang berjalan di port 5432"

# Navigate to backend directory
cd backend

# Check if .env exists and has correct port
if [ ! -f ".env" ]; then
    echo "📝 Membuat file .env..."
    cp env.example .env
    sed -i '' 's/PORT=5000/PORT=5432/' .env
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

# Test connection
echo "🧪 Testing koneksi..."
if curl -s http://localhost:5432/health > /dev/null; then
    echo "✅ Backend berhasil berjalan di http://localhost:5432"
    echo "📊 Log backend tersimpan di backend.log"
    echo "🔄 Untuk menghentikan backend: kill $BACKEND_PID"
else
    echo "❌ Backend gagal berjalan. Cek backend.log untuk detail error"
    cat ../backend.log
fi

echo ""
echo "📱 Sekarang coba login/register di aplikasi mobile"
echo "🌐 Backend URL: http://localhost:5432" 