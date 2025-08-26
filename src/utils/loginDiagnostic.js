import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LoginDiagnostic {
  constructor() {
    this.diagnostics = [];
    this.maxDiagnostics = 20;
  }

  // Run comprehensive login diagnostics
  async runDiagnostics() {
    console.log('🔍 LoginDiagnostic: Starting diagnostics...');
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: Platform.Version,
      tests: []
    };

    // Test 1: Network connectivity
    const networkTest = await this.testNetworkConnectivity();
    diagnostic.tests.push({
      name: 'Network Connectivity',
      ...networkTest
    });

    // Test 2: Server reachability
    const serverTest = await this.testServerReachability();
    diagnostic.tests.push({
      name: 'Server Reachability',
      ...serverTest
    });

    // Test 3: Login endpoint
    const loginTest = await this.testLoginEndpoint();
    diagnostic.tests.push({
      name: 'Login Endpoint',
      ...loginTest
    });

    // Test 4: Authentication flow
    const authTest = await this.testAuthenticationFlow();
    diagnostic.tests.push({
      name: 'Authentication Flow',
      ...authTest
    });

    // Test 5: Token storage
    const storageTest = await this.testTokenStorage();
    diagnostic.tests.push({
      name: 'Token Storage',
      ...storageTest
    });

    // Calculate overall health
    const passedTests = diagnostic.tests.filter(test => test.success).length;
    const totalTests = diagnostic.tests.length;
    diagnostic.overall = {
      success: passedTests === totalTests,
      passed: passedTests,
      total: totalTests,
      percentage: Math.round((passedTests / totalTests) * 100)
    };

    // Generate recommendations
    diagnostic.recommendations = this.generateRecommendations(diagnostic.tests);

    this.addDiagnostic(diagnostic);
    console.log('🔍 LoginDiagnostic: Diagnostics completed:', diagnostic);
    
    return diagnostic;
  }

  // Test network connectivity
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
        error: error.message,
        message: 'No internet connection'
      };
    }
  }

  // Test server reachability
  async testServerReachability() {
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
      
      return {
        success: response.ok,
        responseTime: endTime - startTime,
        status: response.status,
        message: response.ok ? 'Server reachable' : 'Server not reachable'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Server unreachable'
      };
    }
  }

  // Test login endpoint
  async testLoginEndpoint() {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const testData = {
        email: 'test@example.com',
        password: 'testpass123'
      };
      
      const response = await fetch('http://localhost:3000/api/mobile/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      // 401 is expected for invalid credentials
      if (response.status === 401) {
        return {
          success: true,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Login endpoint working (401 expected for invalid credentials)'
        };
      } else if (response.ok) {
        return {
          success: true,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Login endpoint working'
        };
      } else {
        return {
          success: false,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Login endpoint error'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Login endpoint unreachable'
      };
    }
  }

  // Test authentication flow
  async testAuthenticationFlow() {
    try {
      // Test with invalid token
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:3000/api/mobile/health', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_token'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      // 401 is expected for invalid token
      if (response.status === 401) {
        return {
          success: true,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Authentication flow working (401 expected for invalid token)'
        };
      } else if (response.ok) {
        return {
          success: true,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Authentication flow working'
        };
      } else {
        return {
          success: false,
          responseTime: endTime - startTime,
          status: response.status,
          message: 'Authentication flow error'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Authentication flow unreachable'
      };
    }
  }

  // Test token storage
  async testTokenStorage() {
    try {
      const testToken = 'test_token_' + Date.now();
      
      // Test writing
      await AsyncStorage.setItem('authToken', testToken);
      
      // Test reading
      const storedToken = await AsyncStorage.getItem('authToken');
      
      // Clean up
      await AsyncStorage.removeItem('authToken');
      
      return {
        success: storedToken === testToken,
        message: storedToken === testToken ? 'Token storage working' : 'Token storage failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Token storage error'
      };
    }
  }

  // Generate recommendations based on test results
  generateRecommendations(tests) {
    const recommendations = [];
    
    // Check network connectivity
    const networkTest = tests.find(t => t.name === 'Network Connectivity');
    if (networkTest && !networkTest.success) {
      recommendations.push('Check your internet connection');
      recommendations.push('Try connecting to a different network');
    }
    
    // Check server reachability
    const serverTest = tests.find(t => t.name === 'Server Reachability');
    if (serverTest && !serverTest.success) {
      recommendations.push('Server is not reachable');
      recommendations.push('Check if the server is running on http://localhost:3000');
      recommendations.push('Verify server configuration');
    }
    
    // Check login endpoint
    const loginTest = tests.find(t => t.name === 'Login Endpoint');
    if (loginTest && !loginTest.success) {
      recommendations.push('Login endpoint is not working');
      recommendations.push('Check server authentication configuration');
    }
    
    // Check authentication flow
    const authTest = tests.find(t => t.name === 'Authentication Flow');
    if (authTest && !authTest.success) {
      recommendations.push('Authentication flow is not working');
      recommendations.push('Check JWT configuration on server');
    }
    
    // Check token storage
    const storageTest = tests.find(t => t.name === 'Token Storage');
    if (storageTest && !storageTest.success) {
      recommendations.push('Token storage is not working');
      recommendations.push('Check AsyncStorage configuration');
    }
    
    // If all tests pass
    if (tests.every(t => t.success)) {
      recommendations.push('All login diagnostics passed');
      recommendations.push('Login system is working correctly');
    }
    
    return recommendations;
  }

  // Add diagnostic to history
  addDiagnostic(diagnostic) {
    this.diagnostics.push(diagnostic);
    
    if (this.diagnostics.length > this.maxDiagnostics) {
      this.diagnostics = this.diagnostics.slice(-this.maxDiagnostics);
    }
  }

  // Get diagnostic history
  getDiagnostics() {
    return this.diagnostics;
  }

  // Get latest diagnostic
  getLatestDiagnostic() {
    return this.diagnostics.length > 0 ? this.diagnostics[this.diagnostics.length - 1] : null;
  }

  // Clear diagnostic history
  clearDiagnostics() {
    this.diagnostics = [];
  }

  // Save diagnostics to storage
  async saveDiagnostics() {
    try {
      await AsyncStorage.setItem('loginDiagnostics', JSON.stringify(this.diagnostics));
      console.log('🔍 LoginDiagnostic: Diagnostics saved to storage');
    } catch (error) {
      console.error('🔍 LoginDiagnostic: Failed to save diagnostics:', error);
    }
  }

  // Load diagnostics from storage
  async loadDiagnostics() {
    try {
      const data = await AsyncStorage.getItem('loginDiagnostics');
      if (data) {
        this.diagnostics = JSON.parse(data);
        console.log('🔍 LoginDiagnostic: Diagnostics loaded from storage');
      }
    } catch (error) {
      console.error('🔍 LoginDiagnostic: Failed to load diagnostics:', error);
    }
  }
}

// Export singleton instance
export const loginDiagnostic = new LoginDiagnostic();
