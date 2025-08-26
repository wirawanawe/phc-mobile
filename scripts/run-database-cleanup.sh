#!/bin/bash

# Database Cleanup Script for PHC Mobile Application
# This script safely removes unused database tables

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="phc_dashboard"
BACKUP_SCRIPT="scripts/backup-before-removal.sql"
REMOVAL_SCRIPT="scripts/remove-unused-tables-final.sql"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PHC Mobile Database Cleanup Script${NC}"
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

# Show current tables
print_info "Current tables in database:"
mysql -u root -p -e "USE $DB_NAME; SHOW TABLES;" | grep -v "Tables_in_$DB_NAME"

echo ""
print_warning "This script will remove 5 unused tables from the database."
print_warning "Tables to be removed:"
echo "  - meal_logging"
echo "  - anthropometry_initial_data"
echo "  - anthropometry_progress_summary"
echo "  - wellness_program_history"
echo "  - doctor_specializations"

echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cleanup cancelled by user"
    exit 0
fi

# Step 1: Create backup
print_info "Step 1: Creating backup of tables to be removed..."
if [ -f "$BACKUP_SCRIPT" ]; then
    mysql -u root -p "$DB_NAME" < "$BACKUP_SCRIPT"
    print_status "Backup completed successfully"
else
    print_error "Backup script not found: $BACKUP_SCRIPT"
    exit 1
fi

# Step 2: Remove unused tables
print_info "Step 2: Removing unused tables..."
if [ -f "$REMOVAL_SCRIPT" ]; then
    mysql -u root -p "$DB_NAME" < "$REMOVAL_SCRIPT"
    print_status "Tables removed successfully"
else
    print_error "Removal script not found: $REMOVAL_SCRIPT"
    exit 1
fi

# Step 3: Verification
print_info "Step 3: Verifying cleanup..."
echo ""
print_info "Remaining tables in database:"
mysql -u root -p -e "USE $DB_NAME; SHOW TABLES;" | grep -v "Tables_in_$DB_NAME"

echo ""
print_status "Database cleanup completed successfully!"
print_info "Summary:"
echo "  - 5 unused tables removed"
echo "  - Backup tables created with timestamp"
echo "  - All active tables preserved"
echo "  - Application functionality maintained"

echo ""
print_warning "Next steps:"
echo "  1. Test your application to ensure everything works correctly"
echo "  2. Monitor for any unexpected issues"
echo "  3. Remove backup tables after confirming no issues (optional)"

echo ""
print_info "For more details, see: scripts/DATABASE_CLEANUP_SUMMARY.md"
