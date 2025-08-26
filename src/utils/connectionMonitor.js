import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ConnectionMonitor {
  constructor() {
    this.isMonitoring = false;
    this.checkInterval = null;
    this.lastCheck = null;
    this.connectionHistory = [];
    this.maxHistorySize = 100;
    this.checkIntervalMs = 30000; // 30 seconds
    this.retryAttempts = 3;
    this.retryDelay = 5000; // 5 seconds
    this.workingEndpoint = null;
    
    // Multiple endpoints with fallback
    this.endpoints = [
      'http://localhost:3000/api/mobile/test-connection',
      'http://10.242.90.103:3000/api/mobile/test-connection'
    ];
  }

  // Start monitoring
  start() {
    if (this.isMonitoring) {
      console.log('🔍 ConnectionMonitor: Already monitoring');
      return;
    }

    console.log('🔍 ConnectionMonitor: Starting connection monitoring...');
    this.isMonitoring = true;
    
    // Initial check
    this.performHealthCheck();
    
    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.checkIntervalMs);
  }

  // Stop monitoring
  stop() {
    if (!this.isMonitoring) {
      console.log('🔍 ConnectionMonitor: Not monitoring');
      return;
    }

    console.log('🔍 ConnectionMonitor: Stopping connection monitoring...');
    this.isMonitoring = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Perform health check with fallback
  async performHealthCheck() {
    let workingEndpoint = null;
    let result = null;

    // Try each endpoint until one works
    for (const endpoint of this.endpoints) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        
        if (response.ok) {
          workingEndpoint = endpoint;
          result = {
            timestamp: new Date().toISOString(),
            success: true,
            status: response.status,
            responseTime: endTime - startTime,
            url: endpoint
          };
          break;
        }
      } catch (error) {
        console.log(`🔍 ConnectionMonitor: Endpoint ${endpoint} failed - ${error.message}`);
        continue;
      }
    }

    // If no endpoint worked, create failure result
    if (!result) {
      result = {
        timestamp: new Date().toISOString(),
        success: false,
        error: 'All endpoints failed',
        responseTime: 0,
        url: this.endpoints.join(', ')
      };
    }

    // Update working endpoint if we found one
    if (workingEndpoint) {
      this.workingEndpoint = workingEndpoint;
    }
    
    this.addToHistory(result);
    this.lastCheck = result;
    
    console.log(`🔍 ConnectionMonitor: Health check ${result.success ? '✅' : '❌'} - ${result.responseTime}ms`);
    
    return result;
  }

  // Quick test for immediate feedback
  async quickTest() {
    for (const endpoint of this.endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        if (response.ok) {
          return true;
        }
      } catch (error) {
        console.log('🔍 ConnectionMonitor: Quick test failed for', endpoint, ':', error.message);
        continue;
      }
    }
    return false;
  }

  // Add result to history
  addToHistory(result) {
    this.connectionHistory.push(result);
    
    // Keep only the last N results
    if (this.connectionHistory.length > this.maxHistorySize) {
      this.connectionHistory = this.connectionHistory.slice(-this.maxHistorySize);
    }
  }

  // Get connection status
  getStatus() {
    // Determine if server is connected based on recent history
    const recentChecks = this.connectionHistory.slice(-5); // Last 5 checks
    const isConnected = recentChecks.length > 0 && 
                       recentChecks.some(check => check.success) &&
                       this.calculateUptime() > 50; // At least 50% uptime
    
    return {
      isConnected,
      isMonitoring: this.isMonitoring,
      lastCheck: this.lastCheck,
      history: this.connectionHistory,
      uptime: this.calculateUptime(),
      averageResponseTime: this.calculateAverageResponseTime(),
      recentChecks: recentChecks.length,
      workingEndpoint: this.workingEndpoint
    };
  }

  // Calculate uptime percentage
  calculateUptime() {
    if (this.connectionHistory.length === 0) return 0;
    
    const successfulChecks = this.connectionHistory.filter(check => check.success).length;
    return Math.round((successfulChecks / this.connectionHistory.length) * 100);
  }

  // Calculate average response time
  calculateAverageResponseTime() {
    if (this.connectionHistory.length === 0) return 0;
    
    const successfulChecks = this.connectionHistory.filter(check => check.success && check.responseTime);
    if (successfulChecks.length === 0) return 0;
    
    const totalTime = successfulChecks.reduce((sum, check) => sum + check.responseTime, 0);
    return Math.round(totalTime / successfulChecks.length);
  }

  // Get recent failures
  getRecentFailures(limit = 10) {
    return this.connectionHistory
      .filter(check => !check.success)
      .slice(-limit);
  }

  // Get connection trends
  getConnectionTrends() {
    if (this.connectionHistory.length < 2) return null;
    
    const recent = this.connectionHistory.slice(-10);
    const older = this.connectionHistory.slice(-20, -10);
    
    const recentUptime = this.calculateUptimeForChecks(recent);
    const olderUptime = this.calculateUptimeForChecks(older);
    
    return {
      recentUptime,
      olderUptime,
      trend: recentUptime > olderUptime ? 'improving' : recentUptime < olderUptime ? 'declining' : 'stable'
    };
  }

  // Calculate uptime for specific checks
  calculateUptimeForChecks(checks) {
    if (checks.length === 0) return 0;
    const successful = checks.filter(check => check.success).length;
    return Math.round((successful / checks.length) * 100);
  }

  // Save monitoring data to storage
  async saveToStorage() {
    try {
      const data = {
        isMonitoring: this.isMonitoring,
        lastCheck: this.lastCheck,
        history: this.connectionHistory.slice(-50), // Save last 50 entries
        timestamp: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('connectionMonitorData', JSON.stringify(data));
      console.log('🔍 ConnectionMonitor: Data saved to storage');
    } catch (error) {
      console.error('🔍 ConnectionMonitor: Failed to save data:', error);
    }
  }

  // Load monitoring data from storage
  async loadFromStorage() {
    try {
      const data = await AsyncStorage.getItem('connectionMonitorData');
      if (data) {
        const parsed = JSON.parse(data);
        this.connectionHistory = parsed.history || [];
        this.lastCheck = parsed.lastCheck;
        console.log('🔍 ConnectionMonitor: Data loaded from storage');
      }
    } catch (error) {
      console.error('🔍 ConnectionMonitor: Failed to load data:', error);
    }
  }

  // Reset monitoring data
  reset() {
    this.connectionHistory = [];
    this.lastCheck = null;
    this.workingEndpoint = null;
    console.log('🔍 ConnectionMonitor: Monitoring data reset');
  }

  // Force connection status update
  async forceCheck() {
    console.log('🔍 ConnectionMonitor: Forcing connection check...');
    try {
      const result = await this.checkConnection();
      this.addToHistory(result);
      await this.saveToStorage();
      return result;
    } catch (error) {
      console.error('🔍 ConnectionMonitor: Force check failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if server is currently reachable
  async isServerReachable() {
    try {
      const result = await this.checkConnection();
      return result.success;
    } catch (error) {
      return false;
    }
  }

  // Get platform-specific info
  getPlatformInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isEmulator: false,
      healthCheckUrl: this.endpoints.join(', ')
    };
  }
}

// Export singleton instance
export const connectionMonitor = new ConnectionMonitor();
