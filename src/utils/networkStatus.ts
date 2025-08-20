import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
}

class NetworkStatusManager {
  private static instance: NetworkStatusManager;
  private listeners: ((status: NetworkStatus) => void)[] = [];
  private currentStatus: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  };

  private constructor() {
    // Initialize asynchronously but don't wait for it
    this.initialize().catch(error => {
      console.warn('⚠️ NetworkStatusManager: Initialization error:', error);
    });
  }

  static getInstance(): NetworkStatusManager {
    if (!NetworkStatusManager.instance) {
      NetworkStatusManager.instance = new NetworkStatusManager();
    }
    return NetworkStatusManager.instance;
  }

  private async initialize() {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.updateStatus(state);

    // Listen for network changes
    NetInfo.addEventListener((state) => {
      this.updateStatus(state);
    });
  }

  private updateStatus(state: any) {
    this.currentStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type || 'unknown',
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    };

    // Notify listeners
    this.listeners.forEach(listener => listener(this.currentStatus));
  }

  getCurrentStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  isInitialized(): boolean {
    return this.currentStatus.type !== 'unknown';
  }

  addListener(listener: (status: NetworkStatus) => void) {
    this.listeners.push(listener);
    // Immediately call with current status
    listener(this.currentStatus);
  }

  removeListener(listener: (status: NetworkStatus) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  async checkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  async checkInternetReachability(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isInternetReachable ?? false;
  }
}

export const networkStatusManager = NetworkStatusManager.getInstance();

// Helper function to get user-friendly network error message
export function getNetworkErrorMessage(error: any): string {
  if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
    return 'Koneksi timeout. Silakan coba lagi.';
  }
  
  if (error.message?.includes('Network disconnected') || error.message?.includes('network')) {
    return 'Tidak ada koneksi internet. Silakan periksa koneksi Anda.';
  }
  
  if (error.message?.includes('fetch')) {
    return 'Gagal terhubung ke server. Silakan coba lagi.';
  }
  
  return 'Terjadi kesalahan koneksi. Silakan coba lagi.';
}

// Helper function to check if error is network-related
export function isNetworkError(error: any): boolean {
  const networkErrorKeywords = [
    'timeout', 'ETIMEDOUT', 'Network disconnected', 'network', 
    'fetch', 'connection', 'unreachable', 'offline'
  ];
  
  return networkErrorKeywords.some(keyword => 
    error.message?.toLowerCase().includes(keyword.toLowerCase())
  );
}
