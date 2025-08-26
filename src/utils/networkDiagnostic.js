import { Platform } from 'react-native';

/**
 * Network Diagnostic Utility
 * Helps debug network connectivity issues in the mobile app
 */

export class NetworkDiagnostic {
  static async testEndpoint(url, timeout = 10000) {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      console.log(`🔍 Testing endpoint: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      const result = {
        url,
        success: true,
        status: response.status,
        responseTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ ${url}: HTTP ${response.status} (${responseTime}ms)`);
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const result = {
        url,
        success: false,
        error: error.message,
        errorType: error.name,
        responseTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`❌ ${url}: ${error.message} (${responseTime}ms)`);
      return result;
    }
  }

  static async runFullDiagnostics() {
    console.log('🌐 Starting Network Diagnostics...');
    console.log('Platform:', Platform.OS);
    console.log('Development mode:', __DEV__);
    
    const endpoints = [
      // Local endpoints only
      'http://192.168.193.150:3000/api/mobile/auth/me',
      
      // Internet connectivity test
      'https://httpbin.org/status/200'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      const result = await this.testEndpoint(endpoint, 5000);
      results.push(result);
    }
    
    // Analyze results
    const analysis = this.analyzeResults(results);
    
    console.log('\n📊 DIAGNOSTIC SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`✅ Working endpoints: ${analysis.working}/${results.length}`);
    console.log(`❌ Failed endpoints: ${analysis.failed}/${results.length}`);
    console.log(`🌐 Internet connectivity: ${analysis.hasInternet ? 'OK' : 'FAILED'}`);
    console.log(`🏠 Local server: ${analysis.hasLocalServer ? 'OK' : 'FAILED'}`);
    
    if (analysis.recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      analysis.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    return {
      results,
      analysis,
      platform: Platform.OS,
      isDevelopment: __DEV__,
      timestamp: new Date().toISOString()
    };
  }

  static analyzeResults(results) {
    const working = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    const hasInternet = results.some(r => 
      r.success && (r.url.includes('httpbin.org') || r.url.includes('localhost'))
    );
    
    const hasLocalServer = results.some(r => 
      r.success && (r.url.includes('localhost') || r.url.includes('10.0.2.2') || r.url.includes('127.0.0.1'))
    );
    
    const recommendations = [];
    
    if (!hasInternet) {
      recommendations.push('Check your internet connection');
    }
    
    if (!hasLocalServer && __DEV__) {
      recommendations.push('Using development server: http://192.168.193.150:3000');
    }
    
    if (hasLocalServer && __DEV__) {
      recommendations.push('Local server is working - app should connect successfully');
    }
    
    return {
      working,
      failed,
      hasInternet,
      hasLocalServer,
      recommendations
    };
  }

  static getRecommendedEndpoint() {
    // Use development server for all environments
    return 'http://192.168.193.150:3000/api/mobile';
  }

  static async testCurrentConfiguration() {
    const endpoint = this.getRecommendedEndpoint();
    console.log(`🧪 Testing current configuration: ${endpoint}`);
    
    const healthEndpoint = endpoint + '/health';
    const authEndpoint = `${endpoint}/mobile/auth/me`;
    
    const healthTest = await this.testEndpoint(healthEndpoint);
    const authTest = await this.testEndpoint(authEndpoint);
    
    const isWorking = healthTest.success && authTest.success;
    
    console.log(`${isWorking ? '✅' : '❌'} Current configuration: ${isWorking ? 'WORKING' : 'FAILED'}`);
    
    return {
      endpoint,
      healthTest,
      authTest,
      isWorking,
      timestamp: new Date().toISOString()
    };
  }

  static getPlatformSpecificInfo() {
    const info = {
      platform: Platform.OS,
      isDev: __DEV__,
      recommendations: []
    };

    if (Platform.OS === 'android') {
      info.recommendations.push(
        'Using development server: http://192.168.193.150:3000',
        'Ensure internet connection is available'
      );
    } else if (Platform.OS === 'ios') {
      info.recommendations.push(
        'Using development server: http://192.168.193.150:3000',
        'Ensure internet connection is available'
      );
    }

    return info;
  }
}

export default NetworkDiagnostic; 