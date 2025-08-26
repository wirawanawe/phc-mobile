#!/bin/bash

# Database Cleanup Script
# This script cleans all database data except missions and habits

set -e

echo "🚀 PHC Database Cleanup Script"
echo "================================"
echo ""
echo "⚠️  WARNING: This will clean ALL data except missions and habits!"
echo "📋 This includes:"
echo "   - All patient data"
echo "   - All visit/examination data"
echo "   - All user activity data"
echo "   - All chat/consultation data"
echo "   - All health tracking data"
echo ""
echo "✅ This will PRESERVE:"
echo "   - Mission definitions and user progress"
echo "   - Habit activity definitions and user progress"
echo "   - Superadmin user"
echo "   - Basic clinic structure"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "dash-app" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Set default database configuration
export DB_HOST=${DB_HOST:-"localhost"}
export DB_USER=${DB_USER:-"root"}
export DB_PASSWORD=${DB_PASSWORD:-""}
export DB_NAME=${DB_NAME:-"phc_dashboard"}
export DB_PORT=${DB_PORT:-"3306"}

echo "📋 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Ask for confirmation
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled by user"
    exit 0
fi

echo ""
echo "🔄 Starting cleanup process..."

# Check if Node.js script exists
if [ -f "scripts/clean-database-except-missions-habits.js" ]; then
    echo "📝 Using Node.js cleanup script..."
    
    # Check if mysql2 is installed
    if ! node -e "require('mysql2')" 2>/dev/null; then
        echo "📦 Installing mysql2 package..."
        npm install mysql2
    fi
    
    # Run the Node.js script
    node scripts/clean-database-except-missions-habits.js
    
elif [ -f "scripts/clean-database-except-missions-habits.sql" ]; then
    echo "📝 Using SQL cleanup script..."
    
    # Check if mysql client is available
    if ! command -v mysql &> /dev/null; then
        echo "❌ Error: MySQL client not found. Please install MySQL client or use the Node.js script."
        exit 1
    fi
    
    # Run the SQL script
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < scripts/clean-database-except-missions-habits.sql
    
else
    echo "❌ Error: No cleanup script found!"
    echo "   Expected: scripts/clean-database-except-missions-habits.js or scripts/clean-database-except-missions-habits.sql"
    exit 1
fi

echo ""
echo "✅ Cleanup completed successfully!"
echo "🎉 Database has been cleaned while preserving mission and habit data"
echo ""
echo "📊 You can now verify the results by checking the database directly"
