#!/bin/bash

echo "🌐 Getting your computer's IP address for mobile development..."

# Get IP address based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    IP=$(ipconfig | grep "IPv4" | head -1 | awk '{print $NF}')
else
    echo "❌ Unsupported operating system"
    exit 1
fi

if [ -z "$IP" ]; then
    echo "❌ Could not determine IP address"
    exit 1
fi

echo "✅ Your IP address is: $IP"
echo ""
echo "📱 Update your mobile app API configuration:"
echo "   File: src/services/api.js"
echo "   Change: const API_BASE_URL = \"http://$IP:5000/api\";"
echo ""
echo "🔗 Backend URL: http://$IP:5000"
echo "🔗 Health check: http://$IP:5000/health" 