#!/bin/bash

# Script untuk preview data mobile_users yang akan dibersihkan
# PHC Mobile Application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="phc_dashboard"
PREVIEW_SCRIPT="scripts/preview-mobile-users-cleanup.sql"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PHC Mobile - Preview Cleanup Data${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if MySQL is accessible
print_info "Checking MySQL connection..."
if ! mysql -u root -p -e "SELECT 1;" > /dev/null 2>&1; then
    print_error "Cannot connect to MySQL. Please check your MySQL installation and credentials."
    exit 1
fi
print_status "MySQL connection successful"

# Check if database exists
print_info "Checking if database '$DB_NAME' exists..."
if ! mysql -u root -p -e "USE $DB_NAME;" > /dev/null 2>&1; then
    print_error "Database '$DB_NAME' does not exist or is not accessible."
    exit 1
fi
print_status "Database '$DB_NAME' found"

# Run preview script
print_info "Running preview script..."
if [ -f "$PREVIEW_SCRIPT" ]; then
    mysql -u root -p "$DB_NAME" < "$PREVIEW_SCRIPT"
    print_status "Preview completed successfully"
else
    print_error "Preview script not found: $PREVIEW_SCRIPT"
    exit 1
fi

echo ""
print_info "Preview completed! Review the data above before proceeding with cleanup."
print_warning "To proceed with cleanup, run: ./scripts/cleanup-mobile-users.sh"
