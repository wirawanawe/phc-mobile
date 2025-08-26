#!/bin/bash

# Mission Hide Completed Implementation Script
# This script runs the implementation with proper database configuration

echo "🚀 Starting Mission Hide Completed Implementation..."

# Set database configuration
export DB_HOST="localhost"
export DB_USER="root"
export DB_PASSWORD=""
export DB_NAME="phc_dashboard"
export DB_PORT="3306"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if mysql2 is installed
if ! node -e "require('mysql2')" &> /dev/null; then
    echo "📦 Installing mysql2 package..."
    npm install mysql2
fi

# Run the implementation script
echo "🔧 Running implementation script..."
node scripts/implement-mission-hide-completed.js

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo "✅ Implementation completed successfully!"
    echo ""
    echo "📊 Next steps:"
    echo "1. Check the generated report in MD File/MISSION_HIDE_COMPLETED_IMPLEMENTATION_REPORT.md"
    echo "2. Update backend API to use new preferences system"
    echo "3. Update frontend to display missions with smart filtering"
    echo "4. Test the new mission display functionality"
else
    echo "❌ Implementation failed!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Make sure MySQL is running"
    echo "2. Check database credentials"
    echo "3. Ensure database 'phc_dashboard' exists"
    echo "4. Make sure you have proper permissions"
fi
