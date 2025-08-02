import { Platform } from 'react-native';

/**
 * Network Diagnostics Utility
 * Helps troubleshoot network connectivity issues between mobile app and backend server
 */

export class NetworkDiagnostics {
  static async testConnectivity(baseURL) {
    const results = {
      url: baseURL,
      reachable: false,
      responseTime: null,
      error: null,
      details: {}
    };

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });

      const endTime = Date.now();
      results.responseTime = endTime - startTime;
      results.reachable = true;
      results.details.status = response.status;
      results.details.statusText = response.statusText;

      // Try to get response body for more details
      try {
        const responseText = await response.text();
        results.details.responseBody = responseText;
      } catch (textError) {
        results.details.responseBody = 'Could not read response body';
      }

    } catch (error) {
      results.error = error.message;
      results.details.errorType = error.name;
      results.details.errorCode = error.code;
    }

    return results;
  }

  static async runFullDiagnostics() {
    const possibleURLs = [
      "http://10.242.90.103:3000/api/mobile"
    ];

    const results = [];

    for (const url of possibleURLs) {
      const result = await this.testConnectivity(url);
      results.push(result);
      
      if (result.reachable) {
      } else {
      }
    }

    // Find the best URL
    const workingURLs = results.filter(r => r.reachable);
    const bestURL = workingURLs.length > 0 
      ? workingURLs.reduce((best, current) => 
          current.responseTime < best.responseTime ? current : best
        )
      : null;

    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      totalURLs: possibleURLs.length,
      workingURLs: workingURLs.length,
      bestURL: bestURL?.url || null,
      allResults: results,
      recommendations: this.generateRecommendations(results)
    };

    return diagnosticReport;
  }

  static generateRecommendations(results) {
    const recommendations = [];

    const workingURLs = results.filter(r => r.reachable);
    const unreachableURLs = results.filter(r => !r.reachable);

    if (workingURLs.length === 0) {
      recommendations.push('❌ No servers are reachable. Check if backend is running.');
      recommendations.push('🔧 Try running: cd dash-app && npm run dev');
      recommendations.push('🌐 Ensure mobile device and computer are on same network');
    } else if (workingURLs.length === 1) {
      recommendations.push('✅ Found 1 working server');
      recommendations.push(`🎯 Using: ${workingURLs[0].url}`);
    } else {
      recommendations.push(`✅ Found ${workingURLs.length} working servers`);
      const fastest = workingURLs.reduce((best, current) => 
        current.responseTime < best.responseTime ? current : best
      );
      recommendations.push(`⚡ Fastest: ${fastest.url} (${fastest.responseTime}ms)`);
    }

    if (unreachableURLs.length > 0) {
      recommendations.push('⚠️ Some servers are unreachable:');
      unreachableURLs.forEach(url => {
        recommendations.push(`   - ${url.url}: ${url.error}`);
      });
    }

    return recommendations;
  }

  static async checkServerHealth() {
    try {
      const response = await fetch('http://10.242.90.103:3000/api/mobile/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });

      return {
        healthy: true,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  static async diagnoseConnection() {
    const endpoints = [
      'http://localhost:3000',
      'http://192.168.1.100:3000',
      'http://10.0.2.2:3000',
      'http://127.0.0.1:3000'
    ];

    const results = await Promise.all(
      endpoints.map(async (url) => {
        try {
          const startTime = Date.now();
          const response = await fetch(`${url}/health`, {
            method: 'GET',
            timeout: 5000,
          });
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          if (response.ok) {
            return { url, responseTime, success: true };
          } else {
            return { url, error: `HTTP ${response.status}`, success: false };
          }
        } catch (error) {
          return { url, error: error.message, success: false };
        }
      })
    );

    const workingEndpoints = results.filter(result => result.success);
    
    if (workingEndpoints.length === 0) {
      return {
        status: 'FAILED',
        message: 'No endpoints are reachable',
        bestEndpoint: null,
        workingCount: 0,
        totalCount: endpoints.length
      };
    }

    const fastest = workingEndpoints.reduce((prev, current) => 
      prev.responseTime < current.responseTime ? prev : current
    );

    return {
      status: 'SUCCESS',
      message: 'Connection established',
      bestEndpoint: fastest.url,
      workingCount: workingEndpoints.length,
      totalCount: endpoints.length,
      responseTime: fastest.responseTime
    };
  }
}

export default NetworkDiagnostics; 