#!/bin/bash

echo "🚀 Setting up PHC Mobile Backend..."

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    echo "   macOS: brew install mysql"
    echo "   Ubuntu: sudo apt-get install mysql-server"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your database credentials."
else
    echo "✅ .env file already exists."
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Check if MySQL is running
if ! mysqladmin ping -h localhost -u root --silent; then
    echo "⚠️  MySQL is not running. Please start MySQL service first."
    echo "   macOS: brew services start mysql"
    echo "   Ubuntu: sudo systemctl start mysql"
    exit 1
fi

# Setup database
echo "🗄️  Setting up database..."
npm run setup-db

# Seed initial data
echo "🌱 Seeding initial data..."
npm run db:seed

# Seed clinics
echo "🏥 Seeding clinics..."
npm run seed:clinics

# Seed bookings
echo "📅 Seeding bookings..."
npm run seed:bookings

echo "✅ Backend setup completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Edit backend/.env with your MySQL password"
echo "2. Start backend server: cd backend && npm run dev"
echo "3. Test API: curl http://localhost:5000/health"
echo "4. Start mobile app: npx expo start" 