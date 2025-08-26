#!/bin/bash

# Database Collation Fix Script
# This script fixes the utf8mb4_0900_ai_ci collation issue by changing to utf8mb4_general_ci

echo "🔧 Fixing database collation from utf8mb4_0900_ai_ci to utf8mb4_general_ci..."
echo ""

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL client is not installed or not in PATH"
    exit 1
fi

# Database configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-""}
DB_NAME=${DB_NAME:-"phc_dashboard"}

echo "📊 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo ""

# Test database connection
echo "🔍 Testing database connection..."
if [ -z "$DB_PASSWORD" ]; then
    mysql -h "$DB_HOST" -u "$DB_USER" -e "SELECT 1;" > /dev/null 2>&1
else
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1
fi

if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to database. Please check your credentials."
    echo ""
    echo "You can set the following environment variables:"
    echo "   DB_HOST=localhost"
    echo "   DB_USER=root"
    echo "   DB_PASSWORD=your_password"
    echo "   DB_NAME=phc_dashboard"
    exit 1
fi

echo "✅ Database connection successful"
echo ""

# Show current collation settings
echo "📋 Current collation settings:"
if [ -z "$DB_PASSWORD" ]; then
    mysql -h "$DB_HOST" -u "$DB_USER" -e "
    SELECT 
        @@character_set_database as database_charset,
        @@collation_database as database_collation,
        @@character_set_connection as connection_charset,
        @@collation_connection as connection_collation;
    " "$DB_NAME"
else
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "
    SELECT 
        @@character_set_database as database_charset,
        @@collation_database as database_collation,
        @@character_set_connection as connection_charset,
        @@collation_connection as connection_collation;
    " "$DB_NAME"
fi

echo ""

# Ask for confirmation
echo "⚠️  This will change the database collation to utf8mb4_general_ci"
echo "   This operation is safe but may take some time for large databases."
echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo "🚀 Starting collation fix..."
echo ""

# Execute the collation fix script
if [ -z "$DB_PASSWORD" ]; then
    mysql -h "$DB_HOST" -u "$DB_USER" < scripts/fix-database-collation.sql
else
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" < scripts/fix-database-collation.sql
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database collation fixed successfully!"
    echo ""
    echo "📋 Final collation settings:"
    if [ -z "$DB_PASSWORD" ]; then
        mysql -h "$DB_HOST" -u "$DB_USER" -e "
        SELECT 
            @@character_set_database as database_charset,
            @@collation_database as database_collation;
        " "$DB_NAME"
    else
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "
        SELECT 
            @@character_set_database as database_charset,
            @@collation_database as database_collation;
        " "$DB_NAME"
    fi
else
    echo ""
    echo "❌ Error occurred while fixing collation"
    echo "   Please check the error messages above"
    exit 1
fi

echo ""
echo "🎉 Collation fix completed successfully!"
echo "   The database now uses utf8mb4_general_ci collation"
echo ""
echo "💡 Next steps:"
echo "   1. Restart your application if it's running"
echo "   2. Test your application to ensure everything works correctly"
echo "   3. If you encounter any issues, check the application logs"
