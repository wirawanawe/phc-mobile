import { connectionMonitor } from './connectionMonitor';

/**
 * Connection Status Manager
 * 
 * Manages connection status and reduces false warnings about server being down
 */

interface ConnectionStatus {
  isConnected: boolean;
  isMonitoring: boolean;
  lastCheck: string | null;
  uptime: number;
  averageResponseTime: number;
  shouldUseFallback: boolean;
  warningLevel: 'none' | 'low' | 'medium' | 'high';
}

class ConnectionStatusManager {
  private static instance: ConnectionStatusManager;
  private warningThreshold = 3; // Number of consecutive failures before warning
  private recentFailures: Array<{ timestamp: number; error: string }> = [];
  
  static getInstance(): ConnectionStatusManager {
    if (!ConnectionStatusManager.instance) {
      ConnectionStatusManager.instance = new ConnectionStatusManager();
    }
    return ConnectionStatusManager.instance;
  }

  /**
   * Get current connection status with intelligent fallback decision
   */
  getConnectionStatus(): ConnectionStatus {
    try {
      const monitorStatus = connectionMonitor.getStatus();
      
      // Calculate warning level based on recent failures
      const warningLevel = this.calculateWarningLevel();
      
      // Determine if we should use fallback data
      const shouldUseFallback = this.shouldUseFallbackData(monitorStatus, warningLevel);
      
      return {
        isConnected: monitorStatus.isConnected || false,
        isMonitoring: monitorStatus.isMonitoring || false,
        lastCheck: monitorStatus.lastCheck,
        uptime: monitorStatus.uptime || 0,
        averageResponseTime: monitorStatus.averageResponseTime || 0,
        shouldUseFallback,
        warningLevel
      };
    } catch (error) {
      console.warn('⚠️ ConnectionStatusManager: Error getting status:', error);
      return {
        isConnected: false,
        isMonitoring: false,
        lastCheck: null,
        uptime: 0,
        averageResponseTime: 0,
        shouldUseFallback: true,
        warningLevel: 'medium'
      };
    }
  }

  /**
   * Calculate warning level based on recent failures
   */
  private calculateWarningLevel(): 'none' | 'low' | 'medium' | 'high' {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Filter recent failures (last 5 minutes)
    const recentFailures = this.recentFailures.filter(
      failure => failure.timestamp > fiveMinutesAgo
    );
    
    if (recentFailures.length === 0) return 'none';
    if (recentFailures.length <= 2) return 'low';
    if (recentFailures.length <= 5) return 'medium';
    return 'high';
  }

  /**
   * Determine if we should use fallback data
   */
  private shouldUseFallbackData(monitorStatus: any, warningLevel: string): boolean {
    // Use fallback if:
    // 1. Server is not connected
    // 2. Warning level is high
    // 3. Uptime is very low (< 20%)
    return !monitorStatus.isConnected || 
           warningLevel === 'high' || 
           (monitorStatus.uptime && monitorStatus.uptime < 20);
  }

  /**
   * Record a connection failure
   */
  recordFailure(error: string): void {
    this.recentFailures.push({
      timestamp: Date.now(),
      error
    });
    
    // Keep only last 10 failures
    if (this.recentFailures.length > 10) {
      this.recentFailures = this.recentFailures.slice(-10);
    }
  }

  /**
   * Record a connection success
   */
  recordSuccess(): void {
    // Clear recent failures on success
    this.recentFailures = [];
  }

  /**
   * Check if we should proceed with API request
   */
  shouldProceedWithRequest(endpoint: string): boolean {
    const status = this.getConnectionStatus();
    
    // Always proceed for critical endpoints (auth, login, etc.)
    if (endpoint.includes('/auth') || endpoint.includes('/login')) {
      return true;
    }
    
    // Use fallback for non-critical endpoints if connection is poor
    if (status.shouldUseFallback && 
        (endpoint.includes('/wellness') || endpoint.includes('/mood') || endpoint.includes('/tracking'))) {
      return false;
    }
    
    return true;
  }

  /**
   * Get user-friendly status message
   */
  getStatusMessage(): string {
    const status = this.getConnectionStatus();
    
    if (status.warningLevel === 'none') {
      return 'Connection stable';
    } else if (status.warningLevel === 'low') {
      return 'Minor connection issues';
    } else if (status.warningLevel === 'medium') {
      return 'Connection unstable';
    } else {
      return 'Connection problems detected';
    }
  }

  /**
   * Reset connection status
   */
  reset(): void {
    this.recentFailures = [];
    console.log('✅ ConnectionStatusManager: Status reset');
  }
}

export default ConnectionStatusManager.getInstance();
