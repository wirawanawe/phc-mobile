import { Platform } from 'react-native';

export interface NetworkDiagnosticResult {
  isConnected: boolean;
  serverReachable: boolean;
  responseTime: number;
  error?: string;
  recommendedAction?: string;
}

export class NetworkDiagnostic {
  private static instance: NetworkDiagnostic;
  
  static getInstance(): NetworkDiagnostic {
    if (!NetworkDiagnostic.instance) {
      NetworkDiagnostic.instance = new NetworkDiagnostic();
    }
    return NetworkDiagnostic.instance;
  }

  async diagnoseConnection(): Promise<NetworkDiagnosticResult> {
    const result: NetworkDiagnosticResult = {
      isConnected: false,
      serverReachable: false,
      responseTime: 0,
    };

    try {
      // Test basic connectivity
      const testUrls = this.getTestUrls();
      
      for (const url of testUrls) {
        try {
          console.log(`🔍 Network Diagnostic: Testing ${url}`);
          const startTime = Date.now();
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          if (response.ok) {
            result.isConnected = true;
            result.serverReachable = true;
            result.responseTime = responseTime;
            result.recommendedAction = `Server is reachable via ${url} (${responseTime}ms)`;
            console.log(`✅ Network Diagnostic: Success with ${url} (${responseTime}ms)`);
            return result;
          }
        } catch (error) {
          console.log(`❌ Network Diagnostic: ${url} failed - ${error.message}`);
          continue;
        }
      }
      
      // If we get here, no URLs worked
      result.error = 'No server endpoints are reachable';
      result.recommendedAction = this.getRecommendedAction();
      
    } catch (error) {
      result.error = error.message;
      result.recommendedAction = this.getRecommendedAction();
    }
    
    return result;
  }

  private getTestUrls(): string[] {
    if (__DEV__) {
      return [
        'http://localhost:3000/api/health',
        'https://dash.doctorphc.id/api/health'
      ];
    } else {
      return [
        'https://dash.doctorphc.id/api/health'
      ];
    }
  }

  private getRecommendedAction(): string {
    if (__DEV__) {
      if (Platform.OS === 'android') {
        return 'Ensure Android emulator is running and server is accessible via 10.0.2.2:3000';
      } else if (Platform.OS === 'ios') {
        return 'Ensure iOS simulator is running and server is accessible via localhost:3000';
      } else {
        return 'Check if server is running on port 3000 and device is on the same network';
      }
    }
    
    return 'Check internet connection and server availability';
  }
}

export default NetworkDiagnostic.getInstance();
