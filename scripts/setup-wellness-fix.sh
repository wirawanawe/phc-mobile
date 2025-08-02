#!/bin/bash

# Wellness Database Schema Fix Setup Script
# This script helps set up and run the wellness activities database fix

set -e

echo "🔧 Wellness Database Schema Fix Setup"
echo "====================================="
echo ""

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
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the phc-mobile directory"
    exit 1
fi

print_status "Checking current directory structure..."

# Check if scripts directory exists
if [ ! -d "scripts" ]; then
    print_error "Scripts directory not found"
    exit 1
fi

# Check if migration script exists
if [ ! -f "scripts/fix-wellness-activities-schema.js" ]; then
    print_error "Migration script not found: scripts/fix-wellness-activities-schema.js"
    exit 1
fi

print_success "Scripts found"

# Check if dash-app directory exists
DASH_APP_DIR="../dash-app"
if [ ! -d "$DASH_APP_DIR" ]; then
    print_warning "Dash-app directory not found at $DASH_APP_DIR"
    print_status "Please ensure the dash-app is in the correct location"
    print_status "Expected structure:"
    print_status "  /path/to/projects/"
    print_status "  ├── phc-mobile/     (current directory)"
    print_status "  └── dash-app/       (backend server)"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "Dash-app directory found"
fi

# Copy migration script to dash-app if it exists
if [ -d "$DASH_APP_DIR" ]; then
    print_status "Copying migration script to dash-app..."
    
    # Create scripts directory in dash-app if it doesn't exist
    if [ ! -d "$DASH_APP_DIR/scripts" ]; then
        mkdir -p "$DASH_APP_DIR/scripts"
        print_success "Created scripts directory in dash-app"
    fi
    
    # Copy the migration script
    cp "scripts/fix-wellness-activities-schema.js" "$DASH_APP_DIR/scripts/"
    print_success "Migration script copied to dash-app"
    
    # Copy the test script
    cp "scripts/test-wellness-api.js" "$DASH_APP_DIR/scripts/"
    print_success "Test script copied to dash-app"
fi

echo ""
print_status "Setup Instructions:"
echo "======================"
echo ""
echo "1. Navigate to the dash-app directory:"
echo "   cd $DASH_APP_DIR"
echo ""
echo "2. Install mysql2 if not already installed:"
echo "   npm install mysql2"
echo ""
echo "3. Update the database configuration in the migration script:"
echo "   Edit: scripts/fix-wellness-activities-schema.js"
echo "   Update the dbConfig object with your database credentials"
echo ""
echo "4. Run the migration script:"
echo "   node scripts/fix-wellness-activities-schema.js"
echo ""
echo "5. Restart the dash-app server:"
echo "   npm run dev"
echo ""
echo "6. Test the API endpoints:"
echo "   node scripts/test-wellness-api.js"
echo ""
echo "7. Test the mobile app to verify everything works"
echo ""

# Check if user wants to run the migration now
if [ -d "$DASH_APP_DIR" ]; then
    echo ""
    read -p "Do you want to run the migration now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Running migration..."
        cd "$DASH_APP_DIR"
        
        # Check if mysql2 is installed
        if ! npm list mysql2 > /dev/null 2>&1; then
            print_status "Installing mysql2..."
            npm install mysql2
        fi
        
        # Run the migration
        print_status "Running database migration..."
        node scripts/fix-wellness-activities-schema.js
        
        if [ $? -eq 0 ]; then
            print_success "Migration completed successfully!"
            echo ""
            print_status "Next steps:"
            echo "1. Restart the dash-app server: npm run dev"
            echo "2. Test the API: node scripts/test-wellness-api.js"
            echo "3. Test the mobile app"
        else
            print_error "Migration failed. Please check the error messages above."
        fi
    fi
fi

echo ""
print_success "Setup completed!"
print_status "Please follow the instructions above to complete the fix." 