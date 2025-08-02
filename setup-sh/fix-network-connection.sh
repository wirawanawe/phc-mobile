#!/bin/bash

echo "🔧 Fixing Network Connection Issues for PHC Mobile..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "dash-app" ]; then
    print_error "Please run this script from the phc-mobile root directory"
    exit 1
fi

print_status "Starting network connection fix..."

# Step 1: Check if backend is running
print_status "Checking if backend server is running..."
if curl -s http://localhost:3000/api/mobile/auth/me > /dev/null 2>&1; then
    print_success "Backend server is running on localhost:3000"
else
    print_warning "Backend server is not running on localhost:3000"
    print_status "Starting backend server..."
    cd dash-app
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    sleep 5
    
    if curl -s http://localhost:3000/api/mobile/auth/me > /dev/null 2>&1; then
        print_success "Backend server started successfully"
    else
        print_error "Failed to start backend server. Check backend.log for details"
        exit 1
    fi
    cd ..
fi

# Step 2: Get network interfaces
print_status "Getting network interface information..."
INTERFACES=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -5)

print_status "Available network interfaces:"
for ip in $INTERFACES; do
    print_status "  - $ip"
done

# Step 3: Test connectivity from different interfaces
print_status "Testing connectivity from different network interfaces..."

BEST_IP=""
BEST_RESPONSE_TIME=9999

for ip in $INTERFACES; do
    print_status "Testing $ip:3000..."
    
    # Test if port 3000 is reachable
    if nc -z -w5 $ip 3000 2>/dev/null; then
        print_success "Port 3000 is open on $ip"
        
        # Test API endpoint
        START_TIME=$(date +%s%N)
        if curl -s --connect-timeout 5 "http://$ip:3000/api/mobile/auth/me" > /dev/null 2>&1; then
            END_TIME=$(date +%s%N)
            RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))
            print_success "API endpoint reachable on $ip (${RESPONSE_TIME}ms)"
            
            if [ $RESPONSE_TIME -lt $BEST_RESPONSE_TIME ]; then
                BEST_RESPONSE_TIME=$RESPONSE_TIME
                BEST_IP=$ip
            fi
        else
            print_warning "API endpoint not reachable on $ip"
        fi
    else
        print_warning "Port 3000 not open on $ip"
    fi
done

# Step 4: Update mobile app configuration
if [ ! -z "$BEST_IP" ]; then
    print_success "Best IP found: $BEST_IP (${BEST_RESPONSE_TIME}ms)"
    
    # Update the API configuration in the mobile app
    print_status "Updating mobile app API configuration..."
    
    # Create a backup of the current API configuration
    cp src/services/api.js src/services/api.js.backup
    
    # Update the API base URL
    sed -i.bak "s|http://192.168.18.30:3000/api/mobile|http://$BEST_IP:3000/api/mobile|g" src/services/api.js
    
    print_success "Updated API configuration to use $BEST_IP"
    print_status "Backup saved as src/services/api.js.backup"
else
    print_error "No working network interface found"
    print_status "Troubleshooting steps:"
    print_status "1. Ensure your computer and mobile device are on the same network"
    print_status "2. Check if firewall is blocking port 3000"
    print_status "3. Try running: sudo ufw allow 3000"
    print_status "4. Restart your network connection"
    exit 1
fi

# Step 5: Test mobile app connectivity
print_status "Testing mobile app connectivity..."

# Create a simple test script
cat > test-connection.js << EOF
const fetch = require('node-fetch');

async function testConnection() {
    try {
        const response = await fetch('http://$BEST_IP:3000/api/mobile/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000
        });
        
        console.log('✅ Connection successful!');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        
        const text = await response.text();
        console.log('Response:', text);
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
    }
}

testConnection();
EOF

print_status "Running connection test..."
node test-connection.js

# Clean up
rm -f test-connection.js

# Step 6: Provide instructions
print_success "Network connection fix completed!"
echo ""
print_status "Next steps:"
print_status "1. Restart your mobile app"
print_status "2. Try logging in or registering"
print_status "3. If issues persist, check the network troubleshooting screen in the app"
echo ""
print_status "Backend server is running on: http://$BEST_IP:3000"
print_status "API endpoint: http://$BEST_IP:3000/api/mobile"
echo ""
print_status "To stop the backend server:"
print_status "  kill \$(cat backend.pid) 2>/dev/null || echo 'No backend PID file found'"
echo ""
print_status "To view backend logs:"
print_status "  tail -f backend.log" 