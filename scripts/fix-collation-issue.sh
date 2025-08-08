#!/bin/bash

# Script to fix collation issues in SQL files
# This script will replace utf8mb4_0900_ai_ci with utf8mb4_general_ci for better compatibility

echo "Searching for SQL files with utf8mb4_0900_ai_ci collation..."

# Find all SQL files that contain the problematic collation
FILES=$(find . -name "*.sql" -exec grep -l "utf8mb4_0900_ai_ci" {} \; 2>/dev/null)

if [ -z "$FILES" ]; then
    echo "No SQL files found with utf8mb4_0900_ai_ci collation."
    echo "The error might be coming from a specific SQL command you're running."
    echo ""
    echo "To fix this issue, you can:"
    echo "1. Replace utf8mb4_0900_ai_ci with utf8mb4_general_ci in your SQL file"
    echo "2. Remove explicit collation declarations"
    echo "3. Use utf8mb4_unicode_ci instead"
    echo ""
    echo "If you know which SQL file is causing the issue, please provide the filename."
else
    echo "Found the following files with utf8mb4_0900_ai_ci:"
    echo "$FILES"
    echo ""
    echo "Would you like to automatically replace utf8mb4_0900_ai_ci with utf8mb4_general_ci? (y/n)"
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        for file in $FILES; do
            echo "Fixing $file..."
            sed -i '' 's/utf8mb4_0900_ai_ci/utf8mb4_general_ci/g' "$file"
        done
        echo "Fixed all files!"
    fi
fi

echo ""
echo "Alternative solutions:"
echo "1. Use utf8mb4_unicode_ci (recommended for international text)"
echo "2. Use utf8mb4_general_ci (faster, less accurate)"
echo "3. Remove explicit collation declarations entirely"
echo ""
echo "To test if a specific SQL file works, run:"
echo "mysql -u root -p < your_file.sql" 