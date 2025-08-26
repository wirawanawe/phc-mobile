#!/bin/bash

# Start PHC Mobile API Server
echo "🚀 Starting PHC Mobile API Server..."

# Navigate to the dash-app directory
cd "$(dirname "$0")/../dash-app"

# Kill any existing server processes
echo "🛑 Stopping any existing server processes..."
pkill -f "node server.js" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Start the server
echo "✅ Starting server on http://0.0.0.0:3000"
echo "📱 Mobile app can access: http://10.242.90.103:3000"
echo "🌐 Health check: http://10.242.90.103:3000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
