import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Network Diagnostics Utility
 * Helps diagnose and troubleshoot network connectivity issues in the mobile app
 */

class NetworkDiagnostics {
  constructor() {
    this.diagnostics = [];
    this.maxDiagnostics = 50;
  }

  // Run comprehensive network diagnostics
  async runDiagnostics() {
    console.log('🔍 NetworkDiagnostics: Starting diagnostics...');
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: Platform.Version,
      tests: []
    };

    // Test 1: Basic connectivity
    const connectivityTest = await this.testConnectivity();
    diagnostic.tests.push({
      name: 'Basic Connectivity',
      ...connectivityTest
    });

    // Test 2: DNS resolution
    const dnsTest = await this.testDNS();
    diagnostic.tests.push({
      name: 'DNS Resolution',
      ...dnsTest
    });

    // Test 3: Server reachability
    const serverTest = await this.testServerReachability();
    diagnostic.tests.push({
      name: 'Server Reachability',
      ...serverTest
    });

    // Test 4: API endpoints
    const apiTest = await this.testAPIEndpoints();
    diagnostic.tests.push({
      name: 'API Endpoints',
      ...apiTest
    });

    // Test 5: Authentication
    const authTest = await this.testAuthentication();
    diagnostic.tests.push({
      name: 'Authentication',
      ...authTest
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
    console.log('🔍 NetworkDiagnostics: Diagnostics completed:', diagnostic);
    
    return diagnostic;
  }

  // Test basic internet connectivity
  async testConnectivity() {
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

  // Test DNS resolution
  async testDNS() {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://dns.google/resolve?name=localhost', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      return {
        success: response.ok,
        responseTime: endTime - startTime,
        status: response.status,
        message: response.ok ? 'DNS resolution working' : 'DNS resolution failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'DNS resolution error'
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

  // Test API endpoints
  async testAPIEndpoints() {
    const endpoints = [
      'http://localhost:3000/api/mobile/health',
      'http://localhost:3000/api/mobile/auth/me'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
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
        
        results.push({
          endpoint,
          success: response.ok,
          status: response.status,
          responseTime: endTime - startTime
        });
      } catch (error) {
        results.push({
          endpoint,
          success: false,
          error: error.message
        });
      }
    }

    const workingEndpoints = results.filter(r => r.success);
    
    return {
      success: workingEndpoints.length > 0,
      endpoints: results,
      workingCount: workingEndpoints.length,
      totalCount: endpoints.length,
      message: `${workingEndpoints.length}/${endpoints.length} endpoints working`
    };
  }

  // Test authentication
  async testAuthentication() {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:3000/api/mobile/auth/me', {
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
        error: error.message,
        message: 'Authentication endpoint unreachable'
      };
    }
  }

  // Generate recommendations based on test results
  generateRecommendations(tests) {
    const recommendations = [];
    
    // Check connectivity
    const connectivityTest = tests.find(t => t.name === 'Basic Connectivity');
    if (connectivityTest && !connectivityTest.success) {
      recommendations.push('Check your internet connection');
      recommendations.push('Try connecting to a different network');
    }
    
    // Check DNS
    const dnsTest = tests.find(t => t.name === 'DNS Resolution');
    if (dnsTest && !dnsTest.success) {
      recommendations.push('DNS resolution issues detected');
      recommendations.push('Try using a different DNS server');
    }
    
    // Check server
    const serverTest = tests.find(t => t.name === 'Server Reachability');
    if (serverTest && !serverTest.success) {
      recommendations.push('Server is not reachable');
      recommendations.push('Check if the server is running');
      recommendations.push('Verify server URL configuration');
    }
    
    // Check API endpoints
    const apiTest = tests.find(t => t.name === 'API Endpoints');
    if (apiTest && apiTest.workingCount === 0) {
      recommendations.push('No API endpoints are working');
      recommendations.push('Check server configuration');
    } else if (apiTest && apiTest.workingCount < apiTest.totalCount) {
      recommendations.push(`Only ${apiTest.workingCount}/${apiTest.totalCount} API endpoints working`);
    }
    
    // If all tests pass
    if (tests.every(t => t.success)) {
      recommendations.push('All network diagnostics passed');
      recommendations.push('Network connection is healthy');
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
      await AsyncStorage.setItem('networkDiagnostics', JSON.stringify(this.diagnostics));
      console.log('🔍 NetworkDiagnostics: Diagnostics saved to storage');
    } catch (error) {
      console.error('🔍 NetworkDiagnostics: Failed to save diagnostics:', error);
    }
  }

  // Load diagnostics from storage
  async loadDiagnostics() {
    try {
      const data = await AsyncStorage.getItem('networkDiagnostics');
      if (data) {
        this.diagnostics = JSON.parse(data);
        console.log('🔍 NetworkDiagnostics: Diagnostics loaded from storage');
      }
    } catch (error) {
      console.error('🔍 NetworkDiagnostics: Failed to load diagnostics:', error);
    }
  }
}

// Export singleton instance
export const networkDiagnostics = new NetworkDiagnostics();