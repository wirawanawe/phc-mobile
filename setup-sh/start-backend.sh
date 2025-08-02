#!/bin/bash

echo "🚀 Starting PHC Mobile Backend..."

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please configure your .env file with database credentials"
fi

# Start the backend server
echo "🌐 Starting server on http://localhost:3000"
npm run dev 