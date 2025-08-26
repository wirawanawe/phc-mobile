#!/bin/bash

# Check Database Collation Status
# This script checks the current collation settings of the database

echo "🔍 Checking database collation status..."
echo ""

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

# Check database connection and collation
echo "📋 Current collation settings:"
if [ -z "$DB_PASSWORD" ]; then
    mysql -h "$DB_HOST" -u "$DB_USER" -e "
    SELECT 
        'Database' as type,
        @@character_set_database as charset,
        @@collation_database as collation
    UNION ALL
    SELECT 
        'Connection' as type,
        @@character_set_connection as charset,
        @@collation_connection as collation
    UNION ALL
    SELECT 
        'Server' as type,
        @@character_set_server as charset,
        @@collation_server as collation;
    " "$DB_NAME"
else
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "
    SELECT 
        'Database' as type,
        @@character_set_database as charset,
        @@collation_database as collation
    UNION ALL
    SELECT 
        'Connection' as type,
        @@character_set_connection as charset,
        @@collation_connection as collation
    UNION ALL
    SELECT 
        'Server' as type,
        @@character_set_server as charset,
        @@collation_server as collation;
    " "$DB_NAME"
fi

echo ""
echo "📊 Collation Analysis:"
echo ""

# Check if the collation is problematic
if [ -z "$DB_PASSWORD" ]; then
    COLLATION=$(mysql -h "$DB_HOST" -u "$DB_USER" -s -N -e "SELECT @@collation_database;" "$DB_NAME")
else
    COLLATION=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -s -N -e "SELECT @@collation_database;" "$DB_NAME")
fi

if [ "$COLLATION" = "utf8mb4_0900_ai_ci" ]; then
    echo "❌ Problem detected: Database is using utf8mb4_0900_ai_ci"
    echo "   This collation may cause compatibility issues with older MySQL versions"
    echo ""
    echo "💡 Recommendation: Run the fix script:"
    echo "   ./scripts/fix-collation.sh"
elif [ "$COLLATION" = "utf8mb4_general_ci" ]; then
    echo "✅ Good: Database is using utf8mb4_general_ci"
    echo "   This collation is compatible with most MySQL versions"
elif [ "$COLLATION" = "utf8mb4_unicode_ci" ]; then
    echo "✅ Good: Database is using utf8mb4_unicode_ci"
    echo "   This collation provides good international support"
else
    echo "⚠️  Unknown collation: $COLLATION"
    echo "   Please check if this collation is compatible with your setup"
fi

echo ""
echo "💡 Available collations for utf8mb4:"
if [ -z "$DB_PASSWORD" ]; then
    mysql -h "$DB_HOST" -u "$DB_USER" -e "SHOW COLLATION WHERE Charset = 'utf8mb4';" | head -10
else
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SHOW COLLATION WHERE Charset = 'utf8mb4';" | head -10
fi
