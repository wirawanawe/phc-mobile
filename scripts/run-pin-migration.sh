#!/bin/bash

# Script untuk menjalankan migrasi PIN database
# Author: PHC Mobile Team
# Date: 2025-01-27

set -e

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

# Function to check if MySQL is running
check_mysql() {
    print_status "Checking MySQL connection..."
    
    if command -v mysql &> /dev/null; then
        if mysql -u root -p -e "SELECT 1;" &> /dev/null; then
            print_success "MySQL is running and accessible"
            return 0
        else
            print_error "MySQL is not accessible. Please check your credentials."
            return 1
        fi
    else
        print_error "MySQL client is not installed or not in PATH"
        return 1
    fi
}

# Function to check if database exists
check_database() {
    print_status "Checking database 'phc_dashboard'..."
    
    if mysql -u root -p -e "USE phc_dashboard;" &> /dev/null; then
        print_success "Database 'phc_dashboard' exists"
        return 0
    else
        print_error "Database 'phc_dashboard' does not exist"
        return 1
    fi
}

# Function to check if mobile_users table exists
check_mobile_users_table() {
    print_status "Checking mobile_users table..."
    
    if mysql -u root -p phc_dashboard -e "DESCRIBE mobile_users;" &> /dev/null; then
        print_success "mobile_users table exists"
        return 0
    else
        print_error "mobile_users table does not exist"
        return 1
    fi
}

# Function to run SQL migration
run_sql_migration() {
    print_status "Running SQL migration..."
    
    if mysql -u root -p phc_dashboard < dash-app/init-scripts/18-add-pin-fields.sql; then
        print_success "SQL migration completed successfully"
        return 0
    else
        print_error "SQL migration failed"
        return 1
    fi
}

# Function to run JavaScript migration
run_js_migration() {
    print_status "Running JavaScript migration..."
    
    if node scripts/add-pin-fields-to-database.js; then
        print_success "JavaScript migration completed successfully"
        return 0
    else
        print_error "JavaScript migration failed"
        return 1
    fi
}

# Function to verify migration
verify_migration() {
    print_status "Verifying PIN fields migration..."
    
    # Check if PIN fields exist
    local pin_fields=$(mysql -u root -p phc_dashboard -e "SHOW COLUMNS FROM mobile_users LIKE 'pin_%';" 2>/dev/null | wc -l)
    
    if [ "$pin_fields" -ge 5 ]; then
        print_success "PIN fields migration verified successfully"
        print_status "Found PIN fields:"
        mysql -u root -p phc_dashboard -e "SHOW COLUMNS FROM mobile_users LIKE 'pin_%';" 2>/dev/null
        return 0
    else
        print_error "PIN fields migration verification failed"
        return 1
    fi
}

# Function to show migration summary
show_summary() {
    print_status "Migration Summary:"
    
    echo "=========================================="
    echo "PIN Database Migration Summary"
    echo "=========================================="
    echo "Date: $(date)"
    echo "Database: phc_dashboard"
    echo "Table: mobile_users"
    echo ""
    
    # Show PIN fields
    echo "PIN Fields Added:"
    mysql -u root -p phc_dashboard -e "SHOW COLUMNS FROM mobile_users LIKE 'pin_%';" 2>/dev/null || echo "No PIN fields found"
    
    echo ""
    echo "User Statistics:"
    mysql -u root -p phc_dashboard -e "
    SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN pin_enabled = TRUE THEN 1 ELSE 0 END) as users_with_pin_enabled,
        SUM(CASE WHEN pin_enabled = FALSE THEN 1 ELSE 0 END) as users_without_pin
    FROM mobile_users;
    " 2>/dev/null || echo "Could not retrieve user statistics"
    
    echo "=========================================="
}

# Main execution
main() {
    echo "🔐 PIN Database Migration Script"
    echo "=================================="
    echo ""
    
    # Check prerequisites
    if ! check_mysql; then
        print_error "MySQL check failed. Exiting."
        exit 1
    fi
    
    if ! check_database; then
        print_error "Database check failed. Exiting."
        exit 1
    fi
    
    if ! check_mobile_users_table; then
        print_error "Mobile users table check failed. Exiting."
        exit 1
    fi
    
    # Ask for confirmation
    echo ""
    print_warning "This script will add PIN fields to the mobile_users table."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Migration cancelled by user"
        exit 0
    fi
    
    # Run migrations
    print_status "Starting PIN fields migration..."
    
    # Try SQL migration first
    if run_sql_migration; then
        print_success "SQL migration successful"
    else
        print_warning "SQL migration failed, trying JavaScript migration..."
        if run_js_migration; then
            print_success "JavaScript migration successful"
        else
            print_error "Both migration methods failed"
            exit 1
        fi
    fi
    
    # Verify migration
    if verify_migration; then
        print_success "Migration verification successful"
    else
        print_error "Migration verification failed"
        exit 1
    fi
    
    # Show summary
    show_summary
    
    print_success "PIN database migration completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Restart your application"
    echo "2. Test PIN feature in the mobile app"
    echo "3. Users can now enable PIN security from Profile → Pengaturan PIN"
    echo ""
}

# Run main function
main "$@"
