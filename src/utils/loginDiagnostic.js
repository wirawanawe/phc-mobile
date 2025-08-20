import { Platform } from 'react-native';

class LoginDiagnostic {
  constructor() {
    this.testResults = [];
  }

  // Run comprehensive login diagnostics
  async runDiagnostics() {
    console.log('🔍 LoginDiagnostic: Starting comprehensive diagnostics...');
    
    const results = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      isDev: __DEV__,
      tests: []
    };

    // Test 1: Basic network connectivity
    const networkTest = await this.testBasicNetwork();
    results.tests.push({
      name: 'Basic Network',
      ...networkTest
    });

    // Test 2: Server health check
    const healthTest = await this.testServerHealth();
    results.tests.push({
      name: 'Server Health',
      ...healthTest
    });

    // Test 3: Login endpoint accessibility
    const loginTest = await this.testLoginEndpoint();
    results.tests.push({
      name: 'Login Endpoint',
      ...loginTest
    });

    // Test 4: Platform-specific URL test
    const urlTest = await this.testPlatformUrls();
    results.tests.push({
      name: 'Platform URLs',
      ...urlTest
    });

    // Test 5: Authentication flow test
    const authTest = await this.testAuthenticationFlow();
    results.tests.push({
      name: 'Authentication Flow',
      ...authTest
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

    console.log('🔍 LoginDiagnostic: Diagnostics completed:', results);
    this.testResults.push(results);
    
    return results;
  }

  // Test basic network connectivity
  async testBasicNetwork() {
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
      
      const response = await fetch('http://localhost:3000/api/health', {
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

  // Test login endpoint accessibility
  async testLoginEndpoint() {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:3000/api/mobile/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        }),
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
          message: 'Login endpoint accessible'
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          responseTime: endTime - startTime,
          status: response.status,
          error: errorText,
          message: 'Login endpoint error'
        };
      }
    } catch (error) {
      return {
        success: false,
        responseTime: 0,
        error: error.message,
        message: 'Cannot connect to login endpoint'
      };
    }
  }

  // Test different platform-specific URLs
  async testPlatformUrls() {
    const urls = [
      'http://localhost:3000/api/health',
      'http://127.0.0.1:3000/api/health',
      'http://10.0.2.2:3000/api/health', // Android emulator
    ];

    const results = [];
    
    for (const url of urls) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const endTime = Date.now();
        
        results.push({
          url: url,
          success: response.ok,
          responseTime: endTime - startTime,
          status: response.status
        });
      } catch (error) {
        results.push({
          url: url,
          success: false,
          responseTime: 0,
          error: error.message
        });
      }
    }

    const workingUrls = results.filter(r => r.success);
    
    return {
      success: workingUrls.length > 0,
      data: results,
      message: workingUrls.length > 0 
        ? `${workingUrls.length} URL(s) working` 
        : 'No URLs accessible'
    };
  }

  // Test authentication flow
  async testAuthenticationFlow() {
    try {
      // Test 1: Check if we can reach the auth endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const authResponse = await fetch('http://localhost:3000/api/mobile/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Test 2: Check if we get proper error response (expected for invalid credentials)
      if (authResponse.status === 401 || authResponse.status === 400) {
        const errorData = await authResponse.json();
        return {
          success: true,
          status: authResponse.status,
          data: errorData,
          message: 'Authentication flow working (expected error for invalid credentials)'
        };
      } else if (authResponse.ok) {
        const data = await authResponse.json();
        return {
          success: true,
          status: authResponse.status,
          data: data,
          message: 'Authentication flow working (unexpected success)'
        };
      } else {
        return {
          success: false,
          status: authResponse.status,
          message: 'Authentication flow error'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Authentication flow failed'
      };
    }
  }

  // Get diagnostic recommendations
  getRecommendations(results) {
    const recommendations = [];
    
    if (!results.overall.success) {
      recommendations.push('🔧 Some tests failed. Check the detailed results below.');
    }

    const networkTest = results.tests.find(t => t.name === 'Basic Network');
    if (networkTest && !networkTest.success) {
      recommendations.push('🌐 No internet connection detected. Check your network settings.');
    }

    const healthTest = results.tests.find(t => t.name === 'Server Health');
    if (healthTest && !healthTest.success) {
      recommendations.push('🖥️ Server is not accessible. Make sure the backend server is running.');
    }

    const loginTest = results.tests.find(t => t.name === 'Login Endpoint');
    if (loginTest && !loginTest.success) {
      recommendations.push('🔐 Login endpoint is not accessible. Check server configuration.');
    }

    const urlTest = results.tests.find(t => t.name === 'Platform URLs');
    if (urlTest && !urlTest.success) {
      recommendations.push('🔗 No URLs are accessible. Check network configuration and firewall settings.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All tests passed. Login should work correctly.');
    }

    return recommendations;
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
export const loginDiagnostic = new LoginDiagnostic();
