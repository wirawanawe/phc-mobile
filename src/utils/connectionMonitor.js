import { networkStatusManager } from './networkStatus';

class ConnectionMonitor {
  constructor() {
    this.isConnected = false;
    this.lastCheck = null;
    this.checkInterval = null;
    this.listeners = [];
  }

  // Start monitoring connection
  start() {
    if (this.checkInterval) {
      return; // Already monitoring
    }

    console.log('🔍 ConnectionMonitor: Starting connection monitoring...');
    
    // Check immediately
    this.checkConnection();
    
    // Check every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, 30000);
  }

  // Stop monitoring
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🔍 ConnectionMonitor: Stopped connection monitoring');
    }
  }

  // Check server connectivity
  async checkConnection() {
    try {
      const startTime = Date.now();
      
      // Use a simple health check endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check
      
      const response = await fetch('http://192.168.18.30:3000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        const wasConnected = this.isConnected;
        this.isConnected = true;
        this.lastCheck = new Date();
        
        if (!wasConnected) {
          console.log('✅ ConnectionMonitor: Server connection restored');
          this.notifyListeners({ connected: true, responseTime });
        }
        
        console.log(`🔍 ConnectionMonitor: Server healthy (${responseTime}ms)`);
      } else {
        this.handleConnectionFailure('Server responded with error');
      }
    } catch (error) {
      this.handleConnectionFailure(error.message);
    }
  }

  // Handle connection failures
  handleConnectionFailure(error) {
    const wasConnected = this.isConnected;
    this.isConnected = false;
    this.lastCheck = new Date();
    
    if (wasConnected) {
      console.warn('❌ ConnectionMonitor: Server connection lost');
      this.notifyListeners({ connected: false, error });
    }
    
    console.warn(`🔍 ConnectionMonitor: Connection failed - ${error}`);
  }

  // Get current connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      lastCheck: this.lastCheck,
      isMonitoring: !!this.checkInterval
    };
  }

  // Add status change listener
  addListener(listener) {
    this.listeners.push(listener);
  }

  // Remove status change listener
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners
  notifyListeners(status) {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('ConnectionMonitor: Error in listener:', error);
      }
    });
  }

  // Quick connectivity test
  async quickTest() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('http://192.168.18.30:3000/api/health', {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const connectionMonitor = new ConnectionMonitor();
