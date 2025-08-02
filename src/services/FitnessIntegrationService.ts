import * as Location from 'expo-location';
import { Platform } from 'react-native';
import api from './api';

export interface FitnessData {
  steps: number;
  distance: number;
  calories: number;
  heartRate?: number;
  pace?: number;
  duration: number;
  activityType: 'walking' | 'running' | 'cycling';
  coordinates?: Array<{ latitude: number; longitude: number; timestamp: number }>;
}

export interface DeviceConnection {
  isConnected: boolean;
  deviceType: 'smartwatch' | 'gps' | 'health_app';
  deviceName: string;
  lastSync: Date;
}

class FitnessIntegrationService {
  private isTracking = false;
  private currentSession: FitnessData | null = null;
  private locationSubscription: any | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  // ===== SMARTWATCH INTEGRATION =====

  /**
   * Connect to Apple HealthKit (iOS)
   */
  async connectAppleHealth(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    
    try {
      // Implementasi HealthKit akan ditambahkan
      // const healthKit = await import('expo-health-kit');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Connect to Google Fit (Android)
   */
  async connectGoogleFit(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    
    try {
      // Implementasi Google Fit akan ditambahkan
      // const googleFit = await import('react-native-google-fit');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Connect to Samsung Health
   */
  async connectSamsungHealth(): Promise<boolean> {
    try {
      // Implementasi Samsung Health akan ditambahkan
      // const samsungHealth = await import('react-native-samsung-health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // ===== GPS INTEGRATION =====

  /**
   * Request location permissions
   */
  async requestLocationPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  /**
   * Start GPS tracking for fitness activities
   */
  async startGPSTracking(): Promise<boolean> {
    if (!(await this.requestLocationPermissions())) {
      return false;
    }

    try {
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update setiap detik
          distanceInterval: 5, // Update setiap 5 meter
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Stop GPS tracking
   */
  stopGPSTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  // ===== FITNESS SESSION MANAGEMENT =====

  /**
   * Start a new fitness tracking session
   */
  async startFitnessSession(activityType: 'walking' | 'running' | 'cycling'): Promise<boolean> {
    if (this.isTracking) {
      return false;
    }

    try {
      this.currentSession = {
        steps: 0,
        distance: 0,
        calories: 0,
        duration: 0,
        activityType,
        coordinates: [],
      };

      this.isTracking = true;

      // Start GPS tracking
      await this.startGPSTracking();

      // Start real-time sync
      this.startRealtimeSync();

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Stop current fitness session
   */
  async stopFitnessSession(): Promise<FitnessData | null> {
    if (!this.isTracking || !this.currentSession) {
      return null;
    }

    try {
      // Stop GPS tracking
      this.stopGPSTracking();

      // Stop real-time sync
      this.stopRealtimeSync();

      // Save final data
      const finalData = { ...this.currentSession };
      
      // Send to backend
      await this.saveFitnessData(finalData);

      this.isTracking = false;
      this.currentSession = null;

      return finalData;
    } catch (error) {
      return null;
    }
  }

  // ===== REAL-TIME DATA HANDLING =====

  /**
   * Handle location updates from GPS
   */
  private async handleLocationUpdate(location: any): Promise<void> {
    if (!this.currentSession || !this.isTracking) return;

    const { latitude, longitude, timestamp } = location.coords;

    // Add coordinate to session
    this.currentSession.coordinates?.push({
      latitude,
      longitude,
      timestamp,
    });

    // Calculate distance if we have previous coordinates
    if (this.currentSession.coordinates && this.currentSession.coordinates.length > 1) {
      const prevCoord = this.currentSession.coordinates[this.currentSession.coordinates.length - 2];
      const distance = this.calculateDistance(
        prevCoord.latitude,
        prevCoord.longitude,
        latitude,
        longitude
      );
      
      this.currentSession.distance += distance;
    }

    // Update duration
    if (this.currentSession.coordinates && this.currentSession.coordinates.length > 0) {
      const startTime = this.currentSession.coordinates[0].timestamp;
      this.currentSession.duration = (timestamp - startTime) / 1000; // Convert to seconds
    }

    // Estimate steps based on distance (rough calculation)
    this.currentSession.steps = Math.round(this.currentSession.distance * 1312); // ~1312 steps per km

    // Calculate speed for calorie estimation
    const speedMps = this.currentSession.duration > 0 ? 
      this.currentSession.distance / this.currentSession.duration : 0;

    // Estimate calories based on activity type, duration, distance, and speed
    this.currentSession.calories = await this.estimateCalories(
      this.currentSession.activityType,
      this.currentSession.duration,
      this.currentSession.distance,
      speedMps
    );
  }

  /**
   * Start real-time data synchronization
   */
  private startRealtimeSync(): void {
    this.syncInterval = setInterval(async () => {
      if (this.currentSession && this.isTracking) {
        await this.syncFitnessData(this.currentSession);
      }
    }, 10000); // Sync every 10 seconds
  }

  /**
   * Stop real-time data synchronization
   */
  private stopRealtimeSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync fitness data to backend
   */
  private async syncFitnessData(data: FitnessData): Promise<void> {
    try {
      await api.createFitnessEntry({
        steps: data.steps,
        exercise_minutes: Math.round(data.duration / 60),
        calories_burned: data.calories,
        distance_km: data.distance / 1000, // Convert to km
        workout_type: data.activityType.charAt(0).toUpperCase() + data.activityType.slice(1),
        notes: `Real-time tracking: ${data.coordinates?.length || 0} GPS points`,
      });
    } catch (error) {
      // Failed to sync fitness data
    }
  }

  /**
   * Save final fitness data
   */
  private async saveFitnessData(data: FitnessData): Promise<void> {
    try {
      await api.createFitnessEntry({
        steps: data.steps,
        exercise_minutes: Math.round(data.duration / 60),
        calories_burned: data.calories,
        distance_km: data.distance / 1000,
        workout_type: data.activityType.charAt(0).toUpperCase() + data.activityType.slice(1),
        notes: `Completed session: ${data.coordinates?.length || 0} GPS points tracked`,
      });
    } catch (error) {
      // Failed to save fitness data
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Estimate calories burned using MET (Metabolic Equivalent of Task) formula
   * Formula: Calories = MET × Weight (kg) × Duration (hours)
   * 
   * MET values based on Compendium of Physical Activities:
   * - Walking (3.5-4.5 mph): 3.5-4.5 MET
   * - Running (5.2 mph/8.4 km/h): 8.0 MET
   * - Running (6.7 mph/10.8 km/h): 10.0 MET
   * - Cycling (12-13.9 mph): 8.0 MET
   * - Cycling (14-15.9 mph): 10.0 MET
   */
  private async estimateCalories(activityType: string, durationSeconds: number, distanceMeters: number, speedMps?: number): Promise<number> {
    const durationHours = durationSeconds / 3600;
    const distanceKm = distanceMeters / 1000;
    
    // Get user weight from storage or use default
    const weightKg = await this.getUserWeight();
    
    // Calculate MET based on activity type and speed
    let met = this.calculateMET(activityType, speedMps, distanceKm, durationHours);
    
    // Apply formula: Calories = MET × Weight (kg) × Duration (hours)
    const calories = met * weightKg * durationHours;
    
    return Math.round(calories);
  }

  /**
   * Calculate MET value based on activity type and speed
   */
  private calculateMET(activityType: string, speedMps?: number, distanceKm?: number, durationHours?: number): number {
    if (!speedMps && distanceKm && durationHours) {
      speedMps = (distanceKm * 1000) / (durationHours * 3600);
    }

    const speedMph = speedMps ? speedMps * 2.237 : 0; // Convert m/s to mph
    const speedKmh = speedMps ? speedMps * 3.6 : 0; // Convert m/s to km/h

    switch (activityType) {
      case 'walking':
        // Walking MET values based on speed
        if (speedMph < 2.0) return 2.0; // Very slow walking
        if (speedMph < 2.5) return 2.5; // Slow walking
        if (speedMph < 3.0) return 3.0; // Normal walking
        if (speedMph < 3.5) return 3.5; // Brisk walking
        if (speedMph < 4.0) return 4.0; // Fast walking
        if (speedMph < 4.5) return 4.5; // Very fast walking
        return 5.0; // Power walking

      case 'running':
        // Running MET values based on speed
        if (speedMph < 4.5) return 6.0; // Jogging
        if (speedMph < 5.2) return 8.0; // Running 5.2 mph (8.4 km/h)
        if (speedMph < 6.0) return 9.0; // Running 6.0 mph (9.7 km/h)
        if (speedMph < 6.7) return 10.0; // Running 6.7 mph (10.8 km/h)
        if (speedMph < 7.5) return 11.0; // Running 7.5 mph (12.1 km/h)
        if (speedMph < 8.3) return 12.0; // Running 8.3 mph (13.4 km/h)
        if (speedMph < 9.0) return 13.0; // Running 9.0 mph (14.5 km/h)
        return 14.0; // Fast running

      case 'cycling':
        // Cycling MET values based on speed
        if (speedKmh < 10) return 4.0; // Very slow cycling
        if (speedKmh < 12) return 5.0; // Slow cycling
        if (speedKmh < 14) return 6.0; // Moderate cycling
        if (speedKmh < 16) return 8.0; // Cycling 12-13.9 mph
        if (speedKmh < 18) return 10.0; // Cycling 14-15.9 mph
        if (speedKmh < 20) return 12.0; // Cycling 16-17.9 mph
        if (speedKmh < 22) return 14.0; // Cycling 18-19.9 mph
        return 16.0; // Fast cycling

      default:
        return 3.5; // Default MET for unknown activities
    }
  }

  /**
   * Get user weight from storage or return default
   */
  private async getUserWeight(): Promise<number> {
    try {
      const UserProfileService = (await import('./UserProfileService')).default;
      return await UserProfileService.getUserWeight();
    } catch (error) {
      return 70; // Default weight
    }
  }

  /**
   * Get current session status
   */
  getSessionStatus(): { isTracking: boolean; currentSession: FitnessData | null } {
    return {
      isTracking: this.isTracking,
      currentSession: this.currentSession,
    };
  }

  /**
   * Get available device connections
   */
  async getAvailableDevices(): Promise<DeviceConnection[]> {
    const devices: DeviceConnection[] = [];

    // Check GPS availability
    const hasLocationPermission = await this.requestLocationPermissions();
    if (hasLocationPermission) {
      devices.push({
        isConnected: true,
        deviceType: 'gps',
        deviceName: 'Smartphone GPS',
        lastSync: new Date(),
      });
    }

    // Check smartwatch availability (platform specific)
    if (Platform.OS === 'ios') {
      const appleHealthConnected = await this.connectAppleHealth();
      if (appleHealthConnected) {
        devices.push({
          isConnected: true,
          deviceType: 'smartwatch',
          deviceName: 'Apple Health',
          lastSync: new Date(),
        });
      }
    } else if (Platform.OS === 'android') {
      const googleFitConnected = await this.connectGoogleFit();
      if (googleFitConnected) {
        devices.push({
          isConnected: true,
          deviceType: 'smartwatch',
          deviceName: 'Google Fit',
          lastSync: new Date(),
        });
      }
    }

    return devices;
  }
}

export default new FitnessIntegrationService(); 