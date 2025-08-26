import { connectionMonitor } from './connectionMonitor';

class ConnectionTester {
  constructor() {
    this.testResults = [];
  }

  // Run a comprehensive connection test
  async runFullTest() {
    console.log('🧪 ConnectionTester: Starting full connection test...');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Basic network connectivity
    const networkTest = await this.testNetworkConnectivity();
    results.tests.push({
      name: 'Network Connectivity',
      ...networkTest
    });

    // Test 2: Server health check
    const healthTest = await this.testServerHealth();
    results.tests.push({
      name: 'Server Health',
      ...healthTest
    });

    // Test 3: Mobile API endpoint
    const mobileApiTest = await this.testMobileApi();
    results.tests.push({
      name: 'Mobile API',
      ...mobileApiTest
    });

    // Test 4: Authentication endpoint
    const authTest = await this.testAuthentication();
    results.tests.push({
      name: 'Authentication',
      ...authTest
    });

    // Test 5: Connection monitor status
    const monitorTest = this.testConnectionMonitor();
    results.tests.push({
      name: 'Connection Monitor',
      ...monitorTest
    });

    // Calculate overall status
    const passedTests = results.tests.filter(test => test.success).length;
    const totalTests = results.tests.length;
    results.overall = {
      success: passedTests === totalTests,
      passed: passedTests,
      total: totalTests,
      percentage: Math.round((passedTests / totalTests) * 100)
    };

    console.log('🧪 ConnectionTester: Test completed:', results);
    this.testResults.push(results);
    
    return results;
  }

  // Test basic network connectivity
  async testNetworkConnectivity() {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      return {
        success: response.ok,
        responseTime: endTime - startTime,
        status: response.status,
        message: response.ok ? 'Internet connection working' : 'Internet connection failed'
      };
    } catch (error) {
      return {
        success: false,
        responseTime: 0,
        error: error.message,
        message: 'No internet connection'
      };
    }
  }

  // Test server health endpoint
  async testServerHealth() {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:3000/api/mobile/health', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          responseTime: endTime - startTime,
          status: response.status,
          data: data,
          message: 'Server is healthy'
        };
      } else {
        return {
          success: false,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Server responded with error'
        };
      }
    } catch (error) {
      return {
        success: false,
        responseTime: 0,
        error: error.message,
        message: 'Cannot connect to server'
      };
    }
  }

  // Test mobile API endpoint
  async testMobileApi() {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:3000/api/mobile/health', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          responseTime: endTime - startTime,
          status: response.status,
          data: data,
          message: 'Mobile API is working'
        };
      } else {
        return {
          success: false,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Mobile API responded with error'
        };
      }
    } catch (error) {
      return {
        success: false,
        responseTime: 0,
        error: error.message,
        message: 'Cannot connect to mobile API'
      };
    }
  }

  // Test authentication endpoint
  async testAuthentication() {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://192.168.193.150:3000/api/mobile/tracking/today-summary', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      // 401 is expected for unauthenticated requests
      if (response.status === 401) {
        return {
          success: true,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Authentication endpoint working (401 expected for unauthenticated request)'
        };
      } else if (response.ok) {
        return {
          success: true,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Authentication endpoint working'
        };
      } else {
        return {
          success: false,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Authentication endpoint error'
        };
      }
    } catch (error) {
      return {
        success: false,
        responseTime: 0,
        error: error.message,
        message: 'Cannot connect to authentication endpoint'
      };
    }
  }

  // Test connection monitor status
  testConnectionMonitor() {
    try {
      if (connectionMonitor && typeof connectionMonitor.getStatus === 'function') {
        const status = connectionMonitor.getStatus();
        return {
          success: status.isMonitoring,
          data: status,
          message: status.isMonitoring ? 'Connection monitor is active' : 'Connection monitor is not active'
        };
      } else {
        return {
          success: false,
          data: null,
          message: 'Connection monitor not available'
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `Connection monitor error: ${error.message}`
      };
    }
  }

  // Get test history
  getTestHistory() {
    return this.testResults;
  }

  // Clear test history
  clearTestHistory() {
    this.testResults = [];
  }

  // Get latest test result
  getLatestResult() {
    return this.testResults.length > 0 ? this.testResults[this.testResults.length - 1] : null;
  }
}

// Export singleton instance
export const connectionTester = new ConnectionTester();
