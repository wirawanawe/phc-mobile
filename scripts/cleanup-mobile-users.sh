#!/bin/bash

# Script untuk membersihkan data mobile_users
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
CLEANUP_SCRIPT="scripts/cleanup-mobile-users-simple.sql"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PHC Mobile - Cleanup Mobile Users${NC}"
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

# Show current mobile_users count
print_info "Current mobile_users data:"
CURRENT_COUNT=$(mysql -u root -p -e "USE $DB_NAME; SELECT COUNT(*) as count FROM mobile_users;" | grep -v "count")
echo "  - Total mobile_users: $CURRENT_COUNT"

# Show data that will be cleaned
print_info "Data that will be cleaned:"
OLD_DATA=$(mysql -u root -p -e "USE $DB_NAME; SELECT COUNT(*) as count FROM mobile_users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);" | grep -v "count")
TEST_DATA=$(mysql -u root -p -e "USE $DB_NAME; SELECT COUNT(*) as count FROM mobile_users WHERE email LIKE '%test%' OR name LIKE '%test%' OR email LIKE '%dummy%' OR name LIKE '%dummy%';" | grep -v "count")
echo "  - Data older than 30 days: $OLD_DATA"
echo "  - Test/dummy data: $TEST_DATA"

TOTAL_TO_CLEAN=$((OLD_DATA + TEST_DATA))
echo "  - Total data to clean: $TOTAL_TO_CLEAN"

if [ "$TOTAL_TO_CLEAN" -eq 0 ]; then
    print_info "No data to clean. All mobile_users data is recent and valid."
    exit 0
fi

echo ""
print_warning "This script will clean the following data:"
echo "  1. Mobile users created more than 30 days ago"
echo "  2. Mobile users with 'test' or 'dummy' in email/name"
echo "  3. All related data from other tables"
echo ""
print_warning "A backup will be created automatically before cleaning."

echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cleanup cancelled by user"
    exit 0
fi

# Run the cleanup script
print_info "Running cleanup script..."
if [ -f "$CLEANUP_SCRIPT" ]; then
    mysql -u root -p "$DB_NAME" < "$CLEANUP_SCRIPT"
    print_status "Cleanup completed successfully"
else
    print_error "Cleanup script not found: $CLEANUP_SCRIPT"
    exit 1
fi

# Show results
print_info "Cleanup results:"
NEW_COUNT=$(mysql -u root -p -e "USE $DB_NAME; SELECT COUNT(*) as count FROM mobile_users;" | grep -v "count")
CLEANED_COUNT=$((CURRENT_COUNT - NEW_COUNT))
echo "  - Data before cleanup: $CURRENT_COUNT"
echo "  - Data after cleanup: $NEW_COUNT"
echo "  - Data cleaned: $CLEANED_COUNT"

# Show backup information
print_info "Backup information:"
BACKUP_TABLES=$(mysql -u root -p -e "USE $DB_NAME; SHOW TABLES LIKE 'backup_mobile_users_%';" | grep -v "Tables_in_$DB_NAME")
if [ -n "$BACKUP_TABLES" ]; then
    echo "  - Backup tables created:"
    echo "$BACKUP_TABLES" | while read -r table; do
        echo "    • $table"
    done
else
    echo "  - No backup tables found"
fi

echo ""
print_status "Mobile users cleanup completed successfully!"
print_info "Summary:"
echo "  - $CLEANED_COUNT records cleaned"
echo "  - Backup created automatically"
echo "  - All related data cleaned"
echo "  - Application functionality maintained"

echo ""
print_warning "Next steps:"
echo "  1. Test your application to ensure everything works correctly"
echo "  2. Monitor for any unexpected issues"
echo "  3. Remove backup tables after confirming no issues (optional)"

echo ""
print_info "For more details, see: scripts/cleanup-mobile-users-simple.sql"
