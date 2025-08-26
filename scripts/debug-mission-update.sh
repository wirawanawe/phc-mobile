#!/bin/bash

# Debug Mission Update Progress Script
# Script ini membantu untuk debug fitur update progress mission

echo "🔍 Mission Update Progress Debug Script"
echo "========================================"

# Check if adb is available
if ! command -v adb &> /dev/null; then
    echo "❌ ADB tidak ditemukan. Pastikan Android SDK terinstall."
    exit 1
fi

# Check if device is connected
echo "📱 Checking device connection..."
adb devices | grep -q "device$"
if [ $? -ne 0 ]; then
    echo "❌ Tidak ada device Android yang terhubung"
    echo "💡 Pastikan emulator atau device Android terhubung"
    exit 1
fi

echo "✅ Device terhubung"

# Function to clear logcat
clear_logs() {
    echo "🧹 Clearing previous logs..."
    adb logcat -c
}

# Function to monitor logs
monitor_logs() {
    echo "📊 Monitoring logs for mission update progress..."
    echo "💡 Tekan Ctrl+C untuk berhenti monitoring"
    echo ""
    
    adb logcat | grep -E "(ReactNativeJS|MissionDetail|updateProgress|handleUpdateProgress|userMission|MissionDetailService)" --line-buffered
}

# Function to show specific logs
show_mission_logs() {
    echo "📊 Showing mission-related logs..."
    adb logcat -d | grep -E "(MissionDetail|updateProgress|userMission)" | tail -20
}

# Function to test API
test_api() {
    echo "🌐 Testing API connection..."
    
    # Test localhost
    echo "🔍 Testing localhost:3000..."
    curl -s http://localhost:3000/api/health || echo "❌ localhost:3000 tidak bisa diakses"
    
    # Test IP address
    echo "🔍 Testing 192.168.18.30:3000..."
    curl -s http://192.168.18.30:3000/api/health || echo "❌ 192.168.18.30:3000 tidak bisa diakses"
}

# Function to show app info
show_app_info() {
    echo "📱 App Information:"
    echo "Package: com.phc.doctorapp"
    echo "Activity: com.phc.doctorapp.MainActivity"
    echo ""
    
    # Check if app is installed
    adb shell pm list packages | grep -q "com.phc.doctorapp"
    if [ $? -eq 0 ]; then
        echo "✅ App terinstall"
    else
        echo "❌ App tidak terinstall"
    fi
}

# Function to restart app
restart_app() {
    echo "🔄 Restarting app..."
    adb shell am force-stop com.phc.doctorapp
    sleep 2
    adb shell am start -n com.phc.doctorapp/.MainActivity
    echo "✅ App restarted"
}

# Function to show help
show_help() {
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  monitor    - Monitor logs in real-time"
    echo "  logs       - Show recent mission logs"
    echo "  api        - Test API connection"
    echo "  info       - Show app information"
    echo "  restart    - Restart the app"
    echo "  clear      - Clear logs"
    echo "  help       - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 monitor    # Monitor logs while testing update progress"
    echo "  $0 logs       # Show recent logs"
    echo "  $0 api        # Test API connection"
}

# Main script logic
case "${1:-help}" in
    "monitor")
        clear_logs
        monitor_logs
        ;;
    "logs")
        show_mission_logs
        ;;
    "api")
        test_api
        ;;
    "info")
        show_app_info
        ;;
    "restart")
        restart_app
        ;;
    "clear")
        clear_logs
        echo "✅ Logs cleared"
        ;;
    "help"|*)
        show_help
        ;;
esac
